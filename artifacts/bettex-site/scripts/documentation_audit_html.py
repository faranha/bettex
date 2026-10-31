"""Full-document preservation evidence, generated from the same section renderers."""
from pathlib import Path


def documentation_html(app, route):
    language = 'en' if route.startswith('/en/') else 'es' if route.startswith('/es/') else 'pt'
    file = Path(app).parents[1] / 'generated-artifacts/documentation-audits' / f'{language}.html'
    if not file.exists():
        raise AssertionError('Generate fresh documentation audit HTML before validating preservation.')
    return file.read_text()
