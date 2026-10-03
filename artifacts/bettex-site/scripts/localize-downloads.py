"""Build all localized documentation downloads from the current rule source."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name("export-documentation.py")))