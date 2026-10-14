"""Regression tests use independent expectations, including known unsafe edits."""
import json
import runpy
import unittest
from pathlib import Path

from documentation_synthesis_rules import RULES, validate_paragraph, verify_rules
from documentation_spacing_audit import audit_spacing

app = Path(__file__).resolve().parents[1]
DocumentationContent = runpy.run_path(str(app / 'scripts/verify-documentation-ownership.py'))['DocumentationContent']
catalog = json.loads((app / "src/lib/locales/documentation-synthesis.json").read_text())


def entry(prefix):
    keys = [key for key in catalog if key.startswith(prefix)]
    assert len(keys) == 1, f"Ambiguous source: {prefix}"
    return catalog[keys[0]]


class SynthesisRules(unittest.TestCase):
    def test_rule_table_preserves_both_title_and_complete_conditions(self):
        parser = DocumentationContent()
        parser.feed('<section id="documentacao"><table data-testid="documentation-rules-table">'
                    '<tbody><tr><th scope="row"><strong>Reserva segregada.</strong></th>'
                    '<td><p> Mantém o saldo e <a href="#limite">todos os limites</a>.</p></td></tr>'
                    '<tr><th scope="row">02</th><td><p>Regra sem título destacado.</p></td></tr>'
                    '</tbody></table><p>Parágrafo externo intacto.</p></section>')
        self.assertEqual(parser.paragraphs, [
            'Reserva segregada. Mantém o saldo e todos os limites.',
            'Regra sem título destacado.', 'Parágrafo externo intacto.',
        ])
        self.assertEqual(parser.links, ['#limite'])
        self.assertNotIn('Reserva segregada. Mantém o saldo.', parser.paragraphs)

    def test_broken_fragment_joins_are_rejected_even_with_spaces(self):
        broken = [
            'As integrações com <strong>plataformas de trading e casas de apostas</strong> Expansões futuras incluirão conectores.',
            '<strong>Todas as transações são registradas abertamente</strong>, Trilha pública contém horários.',
            'Integrations with <strong>trading platforms and betting houses</strong> Future expansions will include connectors.',
            'All transactions are recorded openly, The public trail contains times.',
            'Las integraciones con <strong>casas de apuestas</strong> Las expansiones futuras incluirán conectores.',
            'Os percentuais são Parâmetros iniciais requerem aprovação.',
            'Na Polymarket, a <a href="#api">API de trading e o CLOB</a> Permitem enviar ordens assinadas.',
            'In Polymarket, the <a href="#api">Trading API and CLOB</a> They allow signed orders.',
            'En Polymarket, la <a href="#api">API de trading y el CLOB</a> Permiten enviar órdenes firmadas.',
            'Registra todo a rodada abertamente.',
            'Registra todo la ronda abiertamente.',
        ]
        for paragraph in broken:
            with self.subTest(paragraph=paragraph):
                self.assertTrue(audit_spacing(f'<p>{paragraph}</p>')[1])

    def test_complete_inline_continuations_remain_valid(self):
        coherent = [
            'As integrações com <strong>plataformas de trading e casas de apostas</strong> serão ampliadas futuramente.',
            '<strong>Todas as transações são registradas abertamente</strong>, incluindo vendas de BETTEX. A trilha pública contém horários.',
            'Integrations with <strong>trading platforms and betting houses</strong> will be expanded in the future.',
            'Las integraciones con <strong>casas de apuestas</strong> serán ampliadas en el futuro.',
            'Na Polymarket, a <a href="#api">API de trading e o CLOB</a> permitem enviar ordens assinadas.',
        ]
        for paragraph in coherent:
            with self.subTest(paragraph=paragraph):
                self.assertEqual(audit_spacing(f'<p>{paragraph}</p>')[1], [])

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
