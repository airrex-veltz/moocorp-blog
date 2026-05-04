# SEO + 도메인 연결 가이드

이 문서는 Moo Corp 블로그를 검색엔진에 등록하고 자체 도메인을 연결하는 절차를 다룹니다.

## 1. Google Search Console 등록

### 절차
1. https://search.google.com/search-console 접속
2. "URL prefix" 선택 → `https://moocorp-blog.vercel.app` 입력
3. 인증 방법: HTML tag 선택
4. 표시되는 메타 태그에서 `content="..."` 부분만 복사 (예: `abc123XYZ`)
5. Vercel 대시보드 → Project → Settings → Environment Variables → Add:
   - **Name**: `PUBLIC_GOOGLE_SITE_VERIFICATION`
   - **Value**: 복사한 코드
   - **Environments**: Production, Preview, Development 모두 체크
6. Vercel에서 재배포 (또는 다음 push까지 대기)
7. Search Console로 돌아가 "확인" 클릭
8. 인증 후: "Sitemaps" 메뉴 → `sitemap-index.xml` 입력 → 제출

## 2. 네이버 서치어드바이저 등록

### 절차
1. https://searchadvisor.naver.com 접속
2. "사이트 등록" → `https://moocorp-blog.vercel.app`
3. 사이트 소유 확인: HTML 태그 선택
4. `content="..."` 값 복사
5. Vercel 환경변수 추가:
   - **Name**: `PUBLIC_NAVER_SITE_VERIFICATION`
   - **Value**: 복사한 코드
6. Vercel 재배포 후 "확인" 클릭
7. 사이트맵 제출: `sitemap-index.xml`
8. RSS 제출: `rss.xml` (네이버 블로그 검색 인덱싱에 도움)

## 3. 자체 도메인 구매 + 연결

### 권장 도메인 옵션
| 도메인 | 가격 | 비고 |
|---|---|---|
| `moocorp.kr` | 가비아 ~22,000원/년 | 한국 SEO 약간 유리 |
| `moocorp.co.kr` | 가비아 ~28,000원/년 | 한국 기업 도메인 (사업자등록 권장) |
| `moocorp.com` | Cloudflare ~$10/년 | 글로벌, 가장 보편 |
| `moocorp.io` | ~$30-40/년 | 테크 톤 |

### 구매처
- **가비아** (`.kr`, `.co.kr`): https://www.gabia.com
- **Cloudflare Registrar** (`.com`, `.io`): https://www.cloudflare.com/products/registrar/ (마진 0%, 가장 저렴)
- **Namecheap**: https://www.namecheap.com

### Vercel 연결
1. Vercel 대시보드 → Project `moocorp-blog` → Settings → Domains
2. "Add" → 구매한 도메인 입력 (예: `moocorp.kr`)
3. Vercel이 표시하는 DNS 레코드를 도메인 등록기관에 추가:
   - **A 레코드**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
4. DNS 전파 대기 (~1분 - 최대 48시간, 보통 5분)
5. Vercel이 SSL 자동 발급 (Let's Encrypt)
6. 도메인 옆 초록색 체크 표시되면 연결 완료

### `astro.config.mjs` 업데이트
도메인 연결 후 `site` URL 업데이트:
```js
export default defineConfig({
  site: 'https://moocorp.kr',  // 새 도메인
  ...
});
```

또한 `src/layouts/Base.astro`의 `SITE_URL` 상수도 업데이트.

`public/robots.txt`의 sitemap URL도 변경.

## 4. 광고 연결 (컨텐츠 30+편 후)

### 카카오 애드핏 (한국, 빠른 승인)
1. https://adfit.kakao.com 가입
2. 매체 등록 → `moocorp-blog.vercel.app` 또는 자체 도메인
3. 승인 대기 (~3-7일)
4. 승인 후 광고 단위 생성:
   - 본문 상단: 728×90 또는 반응형
   - 본문 하단: 300×250 또는 반응형
5. 발급받은 스크립트를 `Post.astro`의 `<div class="ad-slot ad-slot-top"></div>` 자리에 삽입

### Google AdSense (글로벌, 까다로움)
- 사전 조건: 자체 도메인, 30+ 글, 일정 트래픽, Privacy Policy (이미 작성됨)
- https://adsense.google.com 신청
- 승인 시 ads.txt 자동 호스팅 필요 (Vercel 자동 처리)

## 5. 추가 SEO 점검

### Lighthouse 점수 목표
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### 주요 점검 항목
- [x] sitemap.xml 자동 생성 (Astro plugin)
- [x] robots.txt 명확한 정책
- [x] 구조화 데이터 (Article schema, Organization schema)
- [x] OG/Twitter 메타 태그
- [x] canonical URL
- [x] 한국어 hreflang (`ko-KR`)
- [x] 모바일 반응형
- [ ] 이미지 alt text (글마다 점검 필요)
- [ ] 페이지 로딩 속도 (Lighthouse 측정)

## 6. 분석 도구 (선택)

### Vercel Analytics (무료)
이미 활성화돼 있을 가능성 높음. 대시보드에서 확인.

### Google Analytics 4 (무료)
1. https://analytics.google.com 가입
2. 측정 ID 발급 (`G-XXXXX...`)
3. Vercel 환경변수 추가: `PUBLIC_GA_ID`
4. `Base.astro`에 GA 스크립트 조건부 추가 (현재 미구현, 필요 시 작업 필요)

### Plausible (무료/유료, 프라이버시 친화)
대안. 쿠키 없음, GDPR 친화.
