#!/usr/bin/env python3
"""Fix JSX-invalid quotes in MDX content files.

JSX attribute strings do NOT support backslash escapes, so `caption="\"…\""`
or `caption="…"…"…"` break MDX parsing and fail the Vercel build.

This script rewrites such content files in place:
  - Removes leftover backslashes that precede an embedded ASCII quote
  - Replaces every embedded ASCII `"` inside a JSX string attribute value
    with Korean curly quotes (U+201C / U+201D), alternating open/close
  - Skips YAML frontmatter (between leading `---` fences) so YAML `\"` escapes
    stay valid

Idempotent. Safe to re-run.

Usage:
    python3 scripts/fix-mdx-jsx-quotes.py                  # all MDX under src/content
    python3 scripts/fix-mdx-jsx-quotes.py path1.mdx path2.mdx
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

OPEN = "“"   # "
CLOSE = "”"  # "

ATTR_START = re.compile(r"(\w+)=\"")
# Anything that legitimately follows an attribute's closing ":
#   whitespace + next attr name + =
#   whitespace? + /> or >
#   end of line
END_AFTER = re.compile(r'(?:\s+\w+=|\s*/?>|\s*$)')


def _fix_attr_value(value: str) -> str:
    out: list[str] = []
    state = 0
    for ch in value:
        if ch == '"':
            out.append(OPEN if state == 0 else CLOSE)
            state ^= 1
        else:
            out.append(ch)
    return ''.join(out)


def _fix_line(line: str) -> str:
    pos = 0
    result: list[str] = []
    while True:
        m = ATTR_START.search(line, pos)
        if not m:
            result.append(line[pos:])
            break
        result.append(line[pos:m.end()])
        val_start = m.end()
        i = val_start
        end = None
        while True:
            q = line.find('"', i)
            if q == -1:
                break
            tail = line[q + 1:]
            if END_AFTER.match(tail):
                end = q
                break
            i = q + 1
        if end is None:
            result.append(line[val_start:])
            break
        value = line[val_start:end]
        if '"' in value:
            value = _fix_attr_value(value)
        result.append(value)
        result.append('"')
        pos = end + 1
    return ''.join(result)


def _strip_leftover_backslashes(text: str) -> str:
    return text.replace('\\' + OPEN, OPEN).replace('\\' + CLOSE, CLOSE)


def _split_frontmatter(text: str) -> tuple[str, str]:
    """Return (frontmatter_incl_fences, body). Empty frontmatter if absent."""
    if not text.startswith('---\n'):
        return '', text
    end = text.find('\n---\n', 4)
    if end == -1:
        return '', text
    return text[: end + len('\n---\n')], text[end + len('\n---\n'):]


def fix_file(path: Path) -> int:
    original = path.read_text(encoding='utf-8')
    frontmatter, body = _split_frontmatter(original)

    # Pass 1: strip leftover backslashes (only in body — YAML may use \")
    body_after = _strip_leftover_backslashes(body)

    # Pass 2: rewrite each line's JSX attributes
    out_lines: list[str] = []
    for line in body_after.splitlines(keepends=True):
        out_lines.append(_fix_line(line))
    new_body = ''.join(out_lines)

    # Pass 3: catch backslashes that were directly in front of an ASCII `"`
    # which Pass 2 has now converted to a curly quote.
    new_body = _strip_leftover_backslashes(new_body)

    new_text = frontmatter + new_body
    if new_text == original:
        return 0
    path.write_text(new_text, encoding='utf-8')
    return 1


def _resolve_targets(args: list[str]) -> list[Path]:
    if args:
        return [Path(a) for a in args if a.endswith('.mdx')]
    root = Path('src/content')
    return sorted(root.rglob('*.mdx')) if root.exists() else []


def main(argv: list[str]) -> int:
    targets = _resolve_targets(argv[1:])
    if not targets:
        print('fix-mdx-jsx-quotes: no .mdx targets')
        return 0
    changed = 0
    for path in targets:
        if not path.exists():
            continue
        if fix_file(path):
            changed += 1
            print(f'fixed: {path}')
    if changed:
        print(f'fix-mdx-jsx-quotes: rewrote {changed} file(s)')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
