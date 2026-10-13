"""The authorized diagram cannot hide changes to existing Pitch content."""
import unittest
from pitch_defai_guard import split_pitch_defai_addition


class PitchDeFAIGuard(unittest.TestCase):
    def test_only_the_authorized_nested_block_is_removed(self):
        original = '<div id="root"><a href="#token">Token</a><p>50/25/25</p></div>'
        block = '<div class="pdv" data-testid="pitch-defai-vision">\n<div><p>DeFi → DeFAI</p></div><ul><li>Tesouraria</li></ul></div>'
        html = original.replace('<p>50/25/25</p>', block + '<p>50/25/25</p>')
        protected, addition = split_pitch_defai_addition(html)
        self.assertEqual(protected, original)
        self.assertEqual(addition, block)

    def test_existing_economic_changes_remain_visible(self):
        block = '<div data-testid="pitch-defai-vision"><p>DeFAI</p></div>'
        protected, _ = split_pitch_defai_addition('<div id="root">' + block + '<p>Wrong distribution</p></div>')
        self.assertIn('Wrong distribution', protected)

    def test_missing_duplicate_or_unclosed_additions_fail(self):
        block = '<div data-testid="pitch-defai-vision"><div>DeFAI</div></div>'
        for html in ('<div id="root"></div>', block + block, block[:-6]):
            with self.subTest(html=html), self.assertRaises(AssertionError):
                split_pitch_defai_addition(html)


if __name__ == "__main__":
    unittest.main()
