"""Regression tests use independent expectations, including known unsafe edits."""
import json
import unittest
from pathlib import Path

from documentation_synthesis_rules import RULES, validate_paragraph, verify_rules

app = Path(__file__).resolve().parents[1]
catalog = json.loads((app / "src/lib/locales/documentation-synthesis.json").read_text())


def entry(prefix):
    keys = [key for key in catalog if key.startswith(prefix)]
    assert len(keys) == 1, f"Ambiguous source: {prefix}"
    return catalog[keys[0]]


class SynthesisRules(unittest.TestCase):
    def test_all_reviewed_languages_retain_original_conditions(self):
        for prefix, _, local in RULES:
            for language, terms in local.items():
                with self.subTest(rule=prefix, language=language):
                    validate_paragraph(entry(prefix)[language], terms, prefix)

    def test_deleting_recovery_paragraph_cannot_pass(self):
        for language in ("pt", "en", "es"):
            paragraphs = [entry(p)[language] for p, kind, _ in RULES
                          if kind == "site" and not p.startswith("Reiniciar")]
            with self.subTest(language=language), self.assertRaisesRegex(AssertionError, "removed rule"):
                verify_rules(paragraphs, language, "site")

    def test_unsafe_semantic_mutations_are_rejected(self):
        mutations = [
            ("Movimentar capital próprio", "pt", "sem duplicar principal", "sem contabilizar valores em trânsito"),
            ("A carteira só financia recompras", "pt", "incertos ficam comprometidos", "incertos não são gastos"),
            ("O fechamento diário elegível", "pt", "após custos e obrigações", ""),
            ("Inclui o principal e o teto", "pt", "teto de custos operacionais autorizados", "custos efetivos"),
            ("Em bancos e plataformas", "pt", "destinos verificados e autorização separada", ""),
            ("Reiniciar não inicia", "pt", "sem reenvio automático", ""),
            ("Cada rodada paga ou não paga", "pt", "apenas direitos ainda não pagos", "direitos pagos ou não"),
            ("Ganhos, perdas e custos efetivos do encerramento", "es", "reinversión", "reinversão"),
        ]
        for prefix, language, old, new in mutations:
            terms = next(local[language] for p, _, local in RULES if p == prefix)
            text = entry(prefix)[language]
            self.assertIn(old, text)
            with self.subTest(rule=prefix), self.assertRaises(AssertionError):
                validate_paragraph(text.replace(old, new), terms, prefix)


if __name__ == "__main__":
    unittest.main()
