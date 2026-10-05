"""Project-version evidence, not an assertion that planned integrations are live."""
import json
from pathlib import Path
import re


def inventory(root):
    root = Path(root)
    result = {"sdk_dependencies": [], "solidity_sources": [], "compiler_configurations": [],
              "warning": "No matching installed SDK means no SDK compatibility can be presumed. Public roadmap is not implementation."}
    files = [root / "package.json", *root.glob("artifacts/*/package.json"), *root.glob("lib/*/package.json")]
    for file in files:
        metadata = json.loads(file.read_text())
        for section in ("dependencies", "devDependencies"):
            for name, declared in metadata.get(section, {}).items():
                if re.search(r"allora|arbitrum|polymarket|clob|robinhood|ethereum|ethers|viem|solc|web3", name, re.I):
                    installed = file.parent / "node_modules" / name / "package.json"
                    result["sdk_dependencies"].append({"manifest": str(file.relative_to(root)), "package": name,
                        "declared_range": declared, "installed_version": json.loads(installed.read_text()).get("version") if installed.exists() else None})
    for directory in (root / "contracts", root / "artifacts/api-server/src"):
        if directory.exists():
            result["solidity_sources"].extend(str(file.relative_to(root)) for file in directory.rglob("*.sol"))
    for pattern in ("foundry.toml", "hardhat.config.*", "truffle-config.*"):
        result["compiler_configurations"].extend(str(file.relative_to(root)) for file in root.glob(pattern))
    return result


def impacts(platform, categories):
    locations = {
        "arbitrum": ["wallets", "execution", "reconciliation", "planned Arbitrum wallet"],
        "ethereum": ["wallets", "ledger", "risk", "planned token/basic contracts"],
        "allora": ["agents", "docs/allora-live-chart-research.md"],
        "robinhood": ["execution", "planned Robinhood/FOMO adapter"],
        "polymarket": ["execution", "reconciliation", "Polymarket demonstration; official Gamma/CLOB distinctions"],
    }
    return {"type": "DERIVED_DETERMINISTIC_POTENTIAL_IMPACT_NOT_CONFIRMED_BREAKAGE",
            "affected_contexts_or_references": locations.get(platform, []), "source_change_categories": categories,
            "automatic_code_changes": False, "ai_generated_hypotheses": []}
