import unittest
from documentation_spacing_audit import audit_spacing


class SpacingAuditTests(unittest.TestCase):
    def test_reported_reserve_boundaries(self):
        for ending, following in (
            ("reserva defensiva.", "Carteiras pessoais"),
            ("novos investimentos.", "O núcleo independente"),
            ("apuração da tesouraria.", "Custos e perdas"),
            ("política vigente.", "A tesouraria verifica"),
            ("distribuição.", "Simulações consideram"),
        ):
            with self.subTest(ending=ending):
                broken = f"<p><strong>{ending}</strong>{following}.</p>"
                self.assertTrue(audit_spacing(broken)[1])
                fixed = f"<p><strong>{ending}</strong> {following}.</p>"
                self.assertEqual(audit_spacing(fixed)[1], [])

    def test_all_text_containers_not_just_paragraphs(self):
        for tag in ("li", "dd", "figcaption", "td", "summary", "div"):
            self.assertTrue(audit_spacing(f"<{tag}>Reserva.Custos.</{tag}>")[1])
            self.assertEqual(audit_spacing(f"<{tag}>Reserva. Custos.</{tag}>")[1], [])

    def test_words_joined_on_either_side_of_emphasis(self):
        for markup in (
            "<li>Leia<strong>regras</strong>.</li>",
            "<dd><em>BETTEX</em>determina.</dd>",
            "<figcaption>Ver<a>Governança</a>.</figcaption>",
        ):
            self.assertTrue(audit_spacing(markup)[1])

    def test_block_boundaries_and_technical_text(self):
        markup = (
            "<div><p>Reserva.</p><p>Custos.</p></div>"
            "<li><strong>Título</strong><div>Descrição.</div></li>"
            "<p>Leia <code>config.ts</code> e https://bettex.ai/documentacao. "
            "Fonte U.S. e example.org.</p>"
            "<svg><text>Posição.Código</text></svg>"
            '<ul class="wp-facts__grid"><li><span>SALDO</span>'
            '<strong>USDC</strong><small>Descrição.</small></li></ul>'
            '<figure class="ds"><figcaption class="ds__cap"><span>Esquema</span>'
            '<strong>Staking automático</strong></figcaption></figure>'
        )
        self.assertEqual(audit_spacing(markup)[1], [])


if __name__ == "__main__":
    unittest.main()
