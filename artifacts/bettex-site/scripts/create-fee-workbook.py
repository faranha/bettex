"""Publish the current financial workbook; never regenerate legacy token fees."""
from pathlib import Path
import runpy
import shutil

app = Path(__file__).resolve().parents[1]
root = app.parents[1]
result = runpy.run_path(str(root / "research/build-operating-cash-workbook.py"))
output = app / "public/downloads/bettex-taxas-fundacao.xlsx"
output.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(result["DEST"], output)
assert output.read_bytes() == result["DEST"].read_bytes()
print(f"Published current workbook: {output.relative_to(root)}")