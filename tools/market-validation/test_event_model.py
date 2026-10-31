import unittest
from event_model import evaluate, validate


def sample(index, price="101", outcome=1):
    # Synthetic unit-test evidence only. Never imported into application data.
    day = index + 1
    return dict(eventId=f"fixture-{index}", eventRuleId="fixture-rule", asset="btc",
                eventKind="terminal_price_above", forecastAt=f"2026-01-{day:02}T00:00:00Z",
                targetAt=f"2026-01-{day:02}T08:00:00Z", resolvedAt=f"2026-01-{day:02}T09:00:00Z",
                forecastUsd="100", resolvedPriceUsd=price, thresholdUsd="100", outcome=outcome,
                forecastSource="https://example.test/fixture-forecast",
                resolutionSource="https://example.test/fixture-resolution")


class EventModelTests(unittest.TestCase):
    def test_empty_is_blocked(self):
        result = evaluate([], "2026-01-04T00:00:00Z")
        self.assertIsNone(result["metrics"])
        self.assertFalse(result["financiallyApproved"])

    def test_metrics_do_not_authorize_model(self):
        rows = [sample(0, "105"), sample(1, "95", 0), sample(2, "108"),
                sample(3, "102"), sample(4, "97", 0)]
        result = evaluate(rows, "2026-01-04T00:00:00Z")
        self.assertEqual(result["trainCount"], 3)
        self.assertEqual(result["holdoutCount"], 2)
        self.assertEqual(result["status"], "research_only")
        self.assertFalse(result["financiallyApproved"])
        self.assertTrue(0 <= result["metrics"]["brier"] <= 1)

    def test_future_labels_are_purged(self):
        rows = [sample(0, "105"), sample(1, "95", 0), sample(2)]
        rows[1]["resolvedAt"] = "2026-01-04T09:00:00Z"
        result = evaluate(rows, "2026-01-03T00:00:00Z")
        self.assertEqual(result["purgedCount"], 1)
        self.assertEqual(result["status"], "blocked")

    def test_rejects_duplicates_horizon_and_outcome(self):
        for change in [{"eventId": "fixture-0"},
                       {"targetAt": "2026-01-02T12:00:00Z"},
                       {"outcome": 0}, {"asset": "eth"},
                       {"eventKind": "intraday_touch"}, {"forecastUsd": "NaN"},
                       {"forecastAt": "2026-01-02T00:00:00"}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                validate([sample(0), {**sample(1), **change}])


if __name__ == "__main__":
    unittest.main()
