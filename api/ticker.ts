// Vercel Edge Function — live market ticker for Moo Research masthead.
// Fetches 10 symbols from Yahoo Finance v8 (no auth, public endpoint),
// caches at the edge for 60s with stale-while-revalidate up to 5 min.
//
// Schema returned:
//   { items: TickerItem[], updatedAt: ISO8601 }
//   TickerItem = { sym, px, ch, dir: "pos" | "neg" | "flat" }

export const config = { runtime: 'edge' };

interface SymbolSpec {
  sym: string;     // canonical key — used for client/server matching
  label: string;   // human-readable label rendered in the masthead
  yahoo: string;
  fmt: 'index' | 'stock' | 'currency' | 'crypto' | 'pct' | 'commodity';
}

// `label` is what the masthead shows. Korean stock codes get the company
// name so readers don't have to memorise "005930 = 삼성전자".
const SPECS: SymbolSpec[] = [
  { sym: 'S&P 500',  label: 'S&P 500',  yahoo: '^GSPC',     fmt: 'index' },
  { sym: 'NASDAQ',   label: 'NASDAQ',   yahoo: '^IXIC',     fmt: 'index' },
  { sym: 'KOSPI',    label: 'KOSPI',    yahoo: '^KS11',     fmt: 'index' },
  { sym: 'NVDA',     label: 'NVDA',     yahoo: 'NVDA',      fmt: 'stock' },
  { sym: 'TSLA',     label: 'TSLA',     yahoo: 'TSLA',      fmt: 'stock' },
  { sym: '005930',   label: '삼성전자', yahoo: '005930.KS', fmt: 'stock' },
  { sym: 'USD/KRW',  label: 'USD/KRW',  yahoo: 'KRW=X',     fmt: 'currency' },
  { sym: 'BTC',      label: 'BTC',      yahoo: 'BTC-USD',   fmt: 'crypto' },
  { sym: 'WTI',      label: 'WTI',      yahoo: 'CL=F',      fmt: 'commodity' },
  { sym: '10Y UST',  label: '10Y UST',  yahoo: '^TNX',      fmt: 'pct' },
];

interface TickerItem {
  sym: string;
  label: string;
  px: string;
  ch: string;
  dir: 'pos' | 'neg' | 'flat';
}

function fmtNum(v: number, decimals = 2): string {
  return v.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPrice(value: number, fmt: SymbolSpec['fmt']): string {
  if (fmt === 'crypto') return '$' + fmtNum(Math.round(value), 0);
  if (fmt === 'commodity') return '$' + fmtNum(value, 2);
  if (fmt === 'pct') return fmtNum(value, 2) + '%';
  if (fmt === 'currency') return fmtNum(value, 2);
  if (fmt === 'stock') return fmtNum(value, 2);
  // index
  return fmtNum(value, 2);
}

function fmtChange(pct: number, fmt: SymbolSpec['fmt']): string {
  // 10Y UST is quoted in basis points (% change of yield, not price)
  if (fmt === 'pct') {
    const sign = pct >= 0 ? '+' : '−';
    return sign + fmtNum(Math.abs(pct), 2);
  }
  const sign = pct >= 0 ? '+' : '−';
  return sign + fmtNum(Math.abs(pct), 2) + '%';
}

async function fetchOne(spec: SymbolSpec): Promise<TickerItem | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(spec.yahoo)}?interval=1d&range=2d`;
    const r = await fetch(url, {
      headers: {
        // Yahoo blocks empty UA
        'User-Agent': 'Mozilla/5.0 (compatible; MooResearch/1.0; +https://moocorp-blog.vercel.app)',
        Accept: 'application/json',
      },
      // Edge fetch: keep short timeout; default is generous but we want fail-fast
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return null;
    const json = await r.json() as any;
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const last = Number(meta.regularMarketPrice);
    const prev = Number(meta.chartPreviousClose ?? meta.previousClose);
    if (!isFinite(last) || !isFinite(prev) || prev === 0) return null;

    const pct = ((last - prev) / prev) * 100;
    const dir: TickerItem['dir'] = pct > 0.01 ? 'pos' : pct < -0.01 ? 'neg' : 'flat';

    return {
      sym: spec.sym,
      label: spec.label,
      px: fmtPrice(last, spec.fmt),
      ch: fmtChange(pct, spec.fmt),
      dir,
    };
  } catch {
    return null;
  }
}

export default async function handler(_req: Request): Promise<Response> {
  // Run all fetches in parallel; failures fall through to a static placeholder
  const results = await Promise.all(SPECS.map(fetchOne));

  const items: TickerItem[] = results.map((r, i) => r ?? {
    sym: SPECS[i].sym,
    label: SPECS[i].label,
    px: '—',
    ch: '—',
    dir: 'flat' as const,
  });

  const body = JSON.stringify({
    items,
    updatedAt: new Date().toISOString(),
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Edge cache: serve from cache for 60s, then stale-while-revalidate for
      // up to 5 minutes while a background refresh runs.
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      // CORS — only our own site needs it but allow * for simplicity
      'Access-Control-Allow-Origin': '*',
    },
  });
}
