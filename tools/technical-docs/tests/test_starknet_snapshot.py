import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from download_starknet import canonical, markdown_url, safe_path


class StarknetSnapshotPaths(unittest.TestCase):
    def test_root_aliases_have_one_identity_without_changing_the_hostname(self):
        self.assertEqual(canonical("https://docs.starknet.io"), canonical("https://docs.starknet.io/"))
        self.assertEqual(markdown_url("https://docs.starknet.io"), "https://docs.starknet.io/index.md")
        self.assertEqual(markdown_url("https://docs.starknet.io/build/quickstart/overview"),
                         "https://docs.starknet.io/build/quickstart/overview.md")

    def test_source_paths_cannot_escape_the_snapshot(self):
        for value in ["/etc/passwd", "../../file", "build/../../file"]:
            with self.assertRaises(ValueError):
                safe_path(value)
        self.assertEqual(str(safe_path("learn/S-two-book/index.mdx")), "learn/S-two-book/index.mdx")
