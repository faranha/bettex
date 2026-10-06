"""Offline research baseline. Never publishes policy, approves a model or submits orders."""
import argparse
import hashlib
import json
import math
import statistics
from datetime import datetime
from decimal import Decimal, InvalidOperation

FIELDS = {
    "eventId", "eventRuleId", "asset", "eventKind", "forecastAt", "targetAt",
    "resolvedAt", "forecastUsd", "resolvedPriceUsd", "thresholdUsd", "outcome",
    "forecastSource", "resolutionSource",
}


def instant(value):
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.utcoffset() is None:
        raise ValueError("timezone_required")
    return parsed.timestamp()


def positive(value):
    if not isinstance(value, str) or len(value) > 50:
        raise ValueError("decimal_string_required")
    try:
        number = Decimal(value)
    except InvalidOperation:
        raise ValueError("invalid_price") from None
    if not number.is_finite() or number < Decimal("1e-12") or number > Decimal("1e12"):
        raise ValueError("invalid_price")
    return number


def validate(rows):
    if not isinstance(rows, list) or len(rows) > 100000:
        raise ValueError("invalid_dataset")
    ids, targets, groups = set(), set(), set()
    for row in rows:
        if not isinstance(row, dict) or set(row) != FIELDS:
            raise ValueError("invalid_row_fields")
        if any(not isinstance(row[k], str) or not row[k].strip()
               for k in FIELDS - {"outcome"}):
            raise ValueError("missing_identity_or_evidence")
        if row["asset"] not in ("btc", "eth", "sol"):
            raise ValueError("unsupported_asset")
        if row["eventKind"] != "terminal_price_above":
            raise ValueError("unsupported_event_kind")
        if any(not row[k].startswith("https://")
               for k in ("forecastSource", "resolutionSource")):
            raise ValueError("source_url_required")
        if type(row["outcome"]) is not int or row["outcome"] not in (0, 1):
            raise ValueError("binary_outcome_required")
        start, target, resolved = (instant(row[k]) for k in
                                   ("forecastAt", "targetAt", "resolvedAt"))
        if abs(target - start - 8 * 3600) > 1 or resolved < target:
            raise ValueError("horizon_or_resolution_mismatch")
        price, threshold = positive(row["resolvedPriceUsd"]), positive(row["thresholdUsd"])
        positive(row["forecastUsd"])
        if row["outcome"] != int(price > threshold):
            raise ValueError("outcome_resolution_mismatch")
        if row["eventId"] in ids:
            raise ValueError("duplicate_event")
        ids.add(row["eventId"])
        group = (row["asset"], row["eventRuleId"])
        groups.add(group)
        # Multiple strikes/observations of one closing price are not independent samples.
        key = (row["asset"], target)
        if key in targets:
            raise ValueError("correlated_duplicate_target")
        targets.add(key)
    if len(groups) > 1:
        raise ValueError("do_not_pool_assets_or_resolution_rules")
    return sorted(rows, key=lambda r: instant(r["forecastAt"]))


def evaluate(rows, split_at):
    rows = validate(rows)
    split = instant(split_at)
    # Purge training outcomes which were not available when holdout forecasting began.
    train = [r for r in rows if instant(r["forecastAt"]) < split
             and instant(r["resolvedAt"]) < split]
    holdout = [r for r in rows if instant(r["forecastAt"]) >= split]
    common = {
        "status": "blocked", "financiallyApproved": False,
        "method": "gaussian-log-forecast-error/1",
        "datasetHash": hashlib.sha256(json.dumps(rows, sort_keys=True,
                                                separators=(",", ":")).encode()).hexdigest(),
        "trainCount": len(train), "holdoutCount": len(holdout),
        "purgedCount": len(rows) - len(train) - len(holdout),
        "required": ["independent_source_verification", "reviewed_acceptance_criteria",
                     "economic_review", "published_policy", "authorized_paper_budget"],
    }
    if len(train) < 2 or not holdout:
        return {**common, "reason": "insufficient_resolved_out_of_sample_data", "metrics": None}
    errors = [math.log(float(positive(r["resolvedPriceUsd"]) /
                             positive(r["forecastUsd"]))) for r in train]
    mu, sigma = statistics.mean(errors), statistics.stdev(errors)
    if sigma <= 1e-12:
        return {**common, "reason": "degenerate_training_distribution", "metrics": None}
    # A research hypothesis, not a claim that Allora publishes a distribution.
    probabilities = [
        .5 * math.erfc((math.log(float(positive(r["thresholdUsd"]) /
                                      positive(r["forecastUsd"]))) - mu)
                      / (sigma * math.sqrt(2))) for r in holdout
    ]
    actual = [r["outcome"] for r in holdout]
    baseline = statistics.mean(r["outcome"] for r in train)
    bins = []
    for index in range(10):
        members = [(p, y) for p, y in zip(probabilities, actual)
                   if min(int(p * 10), 9) == index]
        if members:
            bins.append({"bin": index, "count": len(members),
                         "meanProbability": statistics.mean(p for p, _ in members),
                         "observedFrequency": statistics.mean(y for _, y in members)})
    metrics = {
        "brier": statistics.mean((p - y) ** 2 for p, y in zip(probabilities, actual)),
        "baselineBrier": statistics.mean((baseline - y) ** 2 for y in actual),
        "logLoss": statistics.mean(-math.log(max(1e-15, min(1 - 1e-15, p if y else 1 - p)))
                                   for p, y in zip(probabilities, actual)),
        "expectedCalibrationError": sum(b["count"] * abs(b["meanProbability"] -
                                                       b["observedFrequency"]) for b in bins) / len(actual),
        "holdoutPositiveCount": sum(actual),
        "holdoutNegativeCount": len(actual) - sum(actual),
        "reliability": bins,
    }
    return {**common, "status": "research_only", "reason": "not_approved_or_source_attested",
            "parameters": {"logErrorMean": mu, "logErrorStd": sigma}, "metrics": metrics}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", required=True, help="JSON array of independently verified resolved events")
    parser.add_argument("--split-at", required=True, help="Predeclared timezone-aware holdout boundary")
    args = parser.parse_args()
    try:
        with open(args.dataset, encoding="utf-8") as handle:
            data = json.load(handle)
        report = evaluate(data, args.split_at)
    except (ValueError, TypeError, KeyError, OSError):
        print(json.dumps({"status": "blocked", "reason": "invalid_or_missing_dataset",
                          "financiallyApproved": False, "metrics": None}))
        return 2
    print(json.dumps(report, indent=2, allow_nan=False))
    return 0 if report["status"] == "research_only" else 2


if __name__ == "__main__":
    raise SystemExit(main())
