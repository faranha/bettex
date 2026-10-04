"""Regression fixtures for the same audit used by the build."""
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from verify_pitch_narrative import audit_pitch, verify_pitch_files


COPY = {
    "pt": ("O apostador brasileiro. Públicos de apostas e cripto.", "O usuário participa via token.",
           ("Você participa.", "VOCE participa."), "Pare de apostar e comece a investir.",
           "Invista agora"),
    "en": ("The Brazilian bettor. Betting and crypto audiences.", "The user participates through the token.",
           ("You participate.", "YOUR capital."), "Stop betting and start investing.",
           "Invest now"),
    "es": ("El apostador brasileño. Públicos de apuestas y cripto.", "El usuario participa mediante el token.",
           ("Tú participas.", "Usted participa.", "Tu capital.", "USTEDES participan."),
           "Deja de apostar y empieza a invertir.", "Invierte ahora"),
}


def fixture(language, narrative="", cover_extra="", audience=None):
    identity, participation, _, _, _ = COPY[language]
    audience = identity + participation if audience is None else audience
    return f"""
    <nav>You can read the documentation</nav>
    <main class="pitch">
      <section class="cover"><h1>{identity}</h1><p>{participation}</p>{cover_extra}
        <a class="tap" href="#solucao">See your documentation</a>
      </section>
      <section id="publico-pitch">{audience}</section>
      <section id="solucao"><p>{narrative}</p></section>
      <figure class="fp"><blockquote>You can invest. Tú puedes. Você participa.</blockquote>
        <figcaption>Fred Azevedo, fundador</figcaption>
        <p>Distribuição existente, não tração do produto.</p>
      </figure>
      <nav><a href="#riscos">Your next section</a></nav>
      <button>Your navigation</button>
    </main>
    <footer>Você pode entrar na comunidade. Join your community. Tú puedes unirte.</footer>
    <aside>Join your community</aside>
    """


class PitchNarrativeTests(unittest.TestCase):
    def test_approved_narrative_and_structural_exceptions(self):
        for lang in COPY:
            with self.subTest(lang=lang):
                self.assertEqual(audit_pitch(fixture(lang), lang), [])

    def test_direct_address_in_all_languages(self):
        for lang, (_, _, pronouns, _, _) in COPY.items():
            for sentence in pronouns:
                with self.subTest(lang=lang, sentence=sentence):
                    self.assertTrue(any("direct reader address" in error
                                        for error in audit_pitch(fixture(lang, sentence), lang)))

    def test_inline_markup_and_entities_do_not_hide_pronouns(self):
        for lang, sentence in (("pt", "Vo<strong>cê</strong> participa."),
                               ("en", "Y<strong>ou</strong> participate."),
                               ("es", "T&#250; participas.")):
            with self.subTest(lang=lang):
                self.assertTrue(audit_pitch(fixture(lang, sentence), lang))

    def test_cover_invitations_including_buttons_without_pronouns(self):
        for lang, (_, _, _, invitation, cta) in COPY.items():
            for content in (f"<p>{invitation}</p>",
                            f'<a class="tap" href="/demo">{cta}</a>',
                            f"<button>{cta}</button>"):
                with self.subTest(lang=lang, content=content):
                    self.assertTrue(any("direct betting/investing invitation" in error
                                        for error in audit_pitch(fixture(lang, cover_extra=content), lang)))

    def test_missing_or_replaced_product_audience(self):
        for lang in COPY:
            with self.subTest(lang=lang):
                errors = audit_pitch(fixture(lang, audience="Corporate investors only."), lang)
                for expected in ("market", "brazil"):
                    self.assertTrue(any(expected in error for error in errors))
                identity = COPY[lang][0]
                self.assertTrue(audit_pitch(fixture(lang).replace(identity, "BETTEX", 1), lang))

    def test_third_person_user_participation_required_in_narrative(self):
        for lang, (_, participation, _, _, _) in COPY.items():
            with self.subTest(lang=lang):
                errors = audit_pitch(fixture(lang).replace(participation, "BETTEX"), lang)
                self.assertTrue(any("missing third-person user" in error for error in errors))

    def test_cover_can_prioritize_market_while_solution_explains_participation(self):
        for lang, (_, participation, _, _, _) in COPY.items():
            with self.subTest(lang=lang):
                html = fixture(lang, participation).replace(f"<p>{participation}</p>", "", 1)
                self.assertEqual(audit_pitch(html, lang), [])

    def test_quote_exemption_requires_founder_attribution(self):
        html = fixture("en").replace("Fred Azevedo, fundador", "Anonymous")
        self.assertTrue(audit_pitch(html, "en"))
        html = fixture("en").replace('class="fp"', 'class="other"')
        self.assertTrue(audit_pitch(html, "en"))
        html = fixture("en", "<blockquote>Your capital.</blockquote>")
        self.assertTrue(audit_pitch(html, "en"))
        html = fixture("en").replace("Distribuição existente, não tração do produto.", "Your capital.")
        self.assertTrue(audit_pitch(html, "en"))

    def test_source_links_are_narrative_not_navigation(self):
        self.assertTrue(audit_pitch(fixture("en", '<a href="https://example.org">Your return</a>'), "en"))

    def test_missing_pitch_fails_instead_of_checking_homepage(self):
        self.assertTrue(audit_pitch("<main>You invest</main>", "en"))
        with TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, "missing rendered file"):
                verify_pitch_files(Path(directory))

    def test_file_runner_checks_pt_en_es_and_fails_on_each_regression(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            files = {"pt": root / "pitch.html", "en": root / "en/pitch.html",
                     "es": root / "es/pitch.html"}
            for lang, file in files.items():
                file.parent.mkdir(parents=True, exist_ok=True)
                file.write_text(fixture(lang), encoding="utf-8")
            verify_pitch_files(root)
            for lang, file in files.items():
                with self.subTest(lang=lang):
                    file.write_text(fixture(lang, COPY[lang][2][0]), encoding="utf-8")
                    with self.assertRaisesRegex(ValueError, f"{lang}/pitch: direct reader address"):
                        verify_pitch_files(root)
                    file.write_text(fixture(lang), encoding="utf-8")


if __name__ == "__main__":
    unittest.main()