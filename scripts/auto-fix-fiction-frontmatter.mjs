#!/usr/bin/env node
// Auto-patches WARN-class fiction files (no real-name violations, but missing
// fiction/aiGenerated frontmatter flags or body disclaimer) into SAFE state.
//
// Patches:
//   - draft: true  → draft: false
//   - adds `fiction: true` and `aiGenerated: true` to frontmatter if missing
//   - prepends body disclaimer line (after any leading MDX imports) if missing
//   - appends footer disclaimer line if missing
//
// Skips files containing any forbidden real name (these belong to REWRITE/DELETE).
//
// Usage:
//   node scripts/auto-fix-fiction-frontmatter.mjs --dry-run
//   node scripts/auto-fix-fiction-frontmatter.mjs

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const FORBIDDEN_NAMES = [
  '정몽구', '정주영', '정의선', '정몽헌', '정몽준',
  '이건희', '이재용', '이병철', '이부진', '이서현',
  '구본무', '구광모', '구인회',
  '최태원', '최종현',
  '신동빈', '신격호', '신동주',
  '김범수', '이해진',
  '서경배', '서민정',
  '머스크', '일론 머스크', 'Elon Musk',
  '잡스', '스티브 잡스', 'Steve Jobs',
  '베이조스', '제프 베이조스', 'Jeff Bezos',
  '게이츠', '빌 게이츠', 'Bill Gates',
  '저커버그', '마크 저커버그', 'Mark Zuckerberg',
  '팀 쿡', 'Tim Cook',
  '나델라', '사티아 나델라', 'Satya Nadella',
  '젠슨 황', 'Jensen Huang',
  '워런 버핏', 'Warren Buffett', '버핏',
  '래리 페이지', '세르게이 브린', '선다 피차이',
];

const DISCLAIMER_LINE =
  '*본 스토리는 AI가 자동 생성한 픽션이며, 등장하는 모든 인물의 발언과 내심은 가공된 것입니다. 실존 인물과 무관합니다.*';
const FOOTER_LINE =
  '*본 콘텐츠는 AI가 자동 생성한 픽션입니다. 등장하는 회사·인물·사건은 실제와 무관하며, 어떠한 투자 판단의 근거로도 사용할 수 없습니다.*';

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z_][\w]*):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].trim();
  }
  return { fm, fmText: m[1], header: m[0], body: text.slice(m[0].length) };
}

function isTrue(v) {
  if (v == null) return false;
  return /^(true|"true"|'true')$/i.test(String(v).trim());
}

function patchFrontmatter(fmText) {
  const lines = fmText.split('\n');
  const has = (k) => lines.some((l) => new RegExp(`^${k}:`).test(l));
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].replace(/^draft:\s*true\s*$/, 'draft: false');
  }
  if (!has('fiction')) lines.push('fiction: true');
  if (!has('aiGenerated')) lines.push('aiGenerated: true');
  return lines.join('\n');
}

function ensureDisclaimers(body) {
  const head = body.slice(0, 1500);
  const tail = body.slice(-1500);
  const headerHas = /AI[가이]?\s*자동\s*생성한\s*픽션/.test(head);
  const footerHas =
    /실존\s*인물과\s*무관/.test(tail) || /투자\s*판단의\s*근거/.test(tail);

  if (headerHas && footerHas) return body;

  const lines = body.split('\n');
  let insertAt = 0;
  while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;
  while (insertAt < lines.length && lines[insertAt].trim().startsWith('import ')) insertAt++;
  while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;

  let newLines = lines.slice();
  if (!headerHas) {
    newLines = [
      ...newLines.slice(0, insertAt),
      DISCLAIMER_LINE,
      '',
      ...newLines.slice(insertAt),
    ];
  }
  if (!footerHas) {
    if (newLines[newLines.length - 1]?.trim() !== '') newLines.push('');
    newLines.push('---', '', FOOTER_LINE, '');
  }
  return newLines.join('\n');
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.mdx') || e.name.endsWith('.md')) yield p;
  }
}

const DRY = process.argv.includes('--dry-run');

const patched = [];
const skippedRealName = [];
const alreadySafe = [];

for (const col of ['stories', 'toons']) {
  for await (const p of walk(join('src/content', col))) {
    const text = await readFile(p, 'utf8');
    const parsed = parseFrontmatter(text);
    if (!parsed) continue;

    if (FORBIDDEN_NAMES.some((n) => text.includes(n))) {
      skippedRealName.push(p);
      continue;
    }

    const { fm, fmText, body } = parsed;
    const needsFlags = !isTrue(fm.fiction) || !isTrue(fm.aiGenerated);
    const needsDraftFlip = isTrue(fm.draft);
    const needsDisclaimer =
      !/AI[가이]?\s*자동\s*생성한\s*픽션/.test(body) ||
      !(/실존\s*인물과\s*무관/.test(body) || /투자\s*판단의\s*근거/.test(body));

    if (!needsFlags && !needsDraftFlip && !needsDisclaimer) {
      alreadySafe.push(p);
      continue;
    }

    const newFmText = patchFrontmatter(fmText);
    const newBody = needsDisclaimer ? ensureDisclaimers(body) : body;
    const newText = `---\n${newFmText}\n---${newBody}`;

    if (!DRY) await writeFile(p, newText, 'utf8');
    patched.push(p);
  }
}

console.log(`patched:             ${patched.length}${DRY ? ' (dry-run, not written)' : ''}`);
console.log(`skipped (real name): ${skippedRealName.length}  → REWRITE bucket`);
console.log(`already safe:        ${alreadySafe.length}`);

if (process.argv.includes('--verbose')) {
  console.log('\n[patched]');
  for (const p of patched) console.log('  ' + p);
  console.log('\n[skipped — real name]');
  for (const p of skippedRealName) console.log('  ' + p);
}
