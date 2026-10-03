"""Build the compact approved pilot and fee workbook, not old cost simulations."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name("export-documentation.py")))