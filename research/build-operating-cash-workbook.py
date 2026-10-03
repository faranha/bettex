"""Compatibility entry point for the compact approved pilot/rules workbook."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).resolve().parents[1] / "artifacts/bettex-site/scripts/export-documentation.py"))