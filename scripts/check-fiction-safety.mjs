#!/usr/bin/env node
// Fiction safety gate. Scans MDX/MD content under src/content and classifies
// each file into SAFE / REWRITE / DELETE / WARN / REVIEW. In --strict mode
// (used by CI) fails the build if any non-draft file is unsafe.
//
// Usage:
//   node scripts/check-fiction-safety.mjs           # report only
//   node scripts/check-fiction-safety.mjs --strict  # fail on unsafe published
//   node scripts/check-fiction-safety.mjs --json    # machine-readable output

import { readFile, readdir } from 'node:fs/promises';
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

const FICTION_TRIGGERS = [
  '구속', '횡령', '배임', '내부고발', '수사', '검찰', '구치소',
  '비밀 회동', '산업 스파이', '내부정보', '미공개정보',
  '주가 조작', '풍문', '비리', '뇌물', '리베이트',
  'M&A 임박', '인수 임박', '경영권 분쟁',
];

const DISCLAIMER_PATTERNS = [
  /AI[가이]?\s*자동\s*생성한\s*픽션/,
  /실존\s*인물과\s*무관/,
];

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z_][\w]*):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].trim();
  }
  return { fm, body: text.slice(m[0].length) };
}

function isTrue(v) {
  if (v == null) return false;
  return /^(true|"true"|'true')$/i.test(String(v).trim());
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) yield p;
  }
}

async function classify(path) {
  const text = await readFile(path, 'utf8');
  const parsed = parseFrontmatter(text);
  if (!parsed) {
    return { path, status: 'PARSE_ERROR', isDraft: false, reasons: ['no frontmatter'] };
  }
  const { fm, body } = parsed;
  const isDraft = isTrue(fm.draft);
  const isFiction = path.includes('/stories/') || path.includes('/toons/');
  const reasons = [];

  const hitNames = FORBIDDEN_NAMES.filter((n) => text.includes(n));
  const hitTriggers = FICTION_TRIGGERS.filter((t) => text.includes(t));

  if (isFiction) {
    const hasAiGen = isTrue(fm.aiGenerated);
    const hasFictionFlag = isTrue(fm.fiction);
    const hasDisclaimer = DISCLAIMER_PATTERNS.every((re) => re.test(body));

    if (hitNames.length && hitTriggers.length) {
      reasons.push(`real-name + trigger: [${hitNames.join(', ')}] × [${hitTriggers.join(', ')}]`);
      return { path, status: 'DELETE', isDraft, reasons };
    }
    if (hitNames.length) {
      reasons.push(`real-name: ${hitNames.join(', ')}`);
      return { path, status: 'REWRITE', isDraft, reasons };
    }
    if (!hasAiGen) reasons.push('missing frontmatter: aiGenerated: true');
    if (!hasFictionFlag) reasons.push('missing frontmatter: fiction: true');
    if (!hasDisclaimer) reasons.push('missing body disclaimer (AI 자동 생성 / 실존 인물과 무관)');
    if (reasons.length) return { path, status: 'WARN', isDraft, reasons };
    return { path, status: 'SAFE', isDraft, reasons: [] };
  }

  if (hitNames.length && hitTriggers.length) {
    reasons.push(`post mentions real-person + trigger: [${hitNames.join(', ')}] × [${hitTriggers.join(', ')}] — verify it is publicly reported, sourced fact`);
    return { path, status: 'REVIEW', isDraft, reasons };
  }
  return { path, status: 'SAFE', isDraft, reasons: [] };
}

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const asJson = args.includes('--json');

const CONTENT_ROOT = 'src/content';
const COLLECTIONS = ['stories', 'toons', 'posts'];

const results = [];
for (const col of COLLECTIONS) {
  for await (const p of walk(join(CONTENT_ROOT, col))) {
    results.push(await classify(p));
  }
}

const order = ['DELETE', 'REWRITE', 'WARN', 'REVIEW', 'PARSE_ERROR', 'SAFE'];
const buckets = Object.fromEntries(order.map((k) => [k, []]));
for (const r of results) (buckets[r.status] ??= []).push(r);

if (asJson) {
  console.log(JSON.stringify({ totals: Object.fromEntries(order.map((k) => [k, buckets[k].length])), results }, null, 2));
} else {
  console.log('# Fiction Safety Report\n');
  console.log(`Total scanned: ${results.length}\n`);
  for (const status of order) {
    const list = buckets[status];
    console.log(`## ${status} (${list.length})`);
    if (list.length === 0) {
      console.log('  (none)\n');
      continue;
    }
    for (const r of list.slice(0, 80)) {
      const mark = r.isDraft ? '[draft]    ' : '[PUBLISHED]';
      console.log(`  ${mark} ${r.path}`);
      for (const reason of r.reasons) console.log(`              → ${reason}`);
    }
    if (list.length > 80) console.log(`  ... and ${list.length - 80} more`);
    console.log('');
  }
}

if (strict) {
  const violations = results.filter((r) => !r.isDraft && r.status !== 'SAFE');
  if (violations.length) {
    console.error(`\nFAIL: ${violations.length} published file(s) are unsafe.`);
    for (const v of violations) console.error(`  - ${v.path} [${v.status}] ${v.reasons.join('; ')}`);
    process.exit(1);
  }
  console.log('\nPASS: all published files safe.');
}
