"""Check rendered chapters against the application's canonical reading order."""
import json
import subprocess


def expected_chapters(app):
    result = subprocess.run(
        [
            "node", "--input-type=module", "-e",
            """
import { documentationChapters, documentationIsGroupOpening } from './src/lib/documentation-structure.ts';
// Features and Tokenomics introduce their groups; neither is a standalone article.
console.log(JSON.stringify(documentationChapters
  .filter(chapter => !documentationIsGroupOpening(chapter.id))
  .map(chapter => chapter.id)));
""",
        ],
        cwd=app, capture_output=True, text=True, check=True,
    )
    chapters = json.loads(result.stdout)
    assert chapters and all(isinstance(chapter, str) for chapter in chapters), \
        "Canonical documentation chapters must contain nonempty string IDs"
    assert len(chapters) == len(set(chapters)), "Duplicate canonical chapter IDs"
    return chapters


def verify_chapters(actual, expected, language):
    missing = [chapter for chapter in expected if chapter not in actual]
    unexpected = [chapter for chapter in actual if chapter not in expected]
    assert actual == expected, (
        f"{language}: independently navigable chapters must match canonical order; "
        f"expected {len(expected)}, rendered {len(actual)}; "
        f"missing={missing}, unexpected={unexpected}, "
        f"reordered_or_duplicated={not missing and not unexpected}"
    )
