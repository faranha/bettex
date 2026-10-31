"""Regression checks for canonical chapter completeness and order."""
from pathlib import Path
import unittest

from documentation_chapter_audit import expected_chapters, verify_chapters


class ChapterAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.expected = expected_chapters(Path(__file__).resolve().parents[1])

    def test_canonical_articles_preserve_actors_features_and_reading_order(self):
        self.assertEqual(self.expected[0], "documentacao-como-funciona")
        self.assertEqual(self.expected[-1], "documentacao-roadmap")
        self.assertNotIn("documentacao-features", self.expected)
        self.assertNotIn("documentacao-tokenomics", self.expected)
        for actor in ("btc", "eth", "sol"):
            self.assertIn(f"documentacao-especialista-{actor}", self.expected)
        self.assertIn("documentacao-carteira-bettex", self.expected)
        verify_chapters(self.expected.copy(), self.expected, "pt")

    def test_missing_chapter_is_rejected(self):
        with self.assertRaisesRegex(AssertionError, "missing="):
            verify_chapters(self.expected[:-1], self.expected, "en")

    def test_unexpected_chapter_is_rejected(self):
        with self.assertRaisesRegex(AssertionError, "unexpected="):
            verify_chapters(self.expected + ["documentacao-unknown"], self.expected, "es")

    def test_reordered_chapters_are_rejected_even_with_same_count(self):
        actual = self.expected.copy()
        actual[1], actual[2] = actual[2], actual[1]
        with self.assertRaisesRegex(AssertionError, "reordered_or_duplicated=True"):
            verify_chapters(actual, self.expected, "pt")

    def test_duplicated_chapter_is_rejected(self):
        with self.assertRaises(AssertionError):
            verify_chapters(self.expected + [self.expected[0]], self.expected, "pt")

    def test_features_opening_cannot_be_added_as_an_article(self):
        with self.assertRaises(AssertionError):
            verify_chapters(self.expected + ["documentacao-features"], self.expected, "pt")


if __name__ == "__main__":
    unittest.main()
