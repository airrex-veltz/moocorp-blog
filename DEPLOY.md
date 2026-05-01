# 배포 가이드

## 1. GitHub repo 생성

```bash
cd /Users/macstudiowork2/Documents/moocorp-blog
gh repo create moocorp-blog --public --source=. --remote=origin --push
```

또는 GitHub 웹에서 빈 repo 생성 후:

```bash
git remote add origin https://github.com/<OWNER>/moocorp-blog.git
git branch -M main
git push -u origin main
```

## 2. Vercel 연결

1. https://vercel.com 접속 → "Add New" → "Project"
2. GitHub repo `moocorp-blog` 선택 → Import
3. Framework Preset: **Astro** (자동 감지)
4. Build Command: `npm run build` (기본값)
5. Output Directory: `dist` (기본값)
6. Deploy 클릭 → 완료

이후 `main` 브랜치에 push하면 자동 빌드 & 배포됩니다.

## 3. 도메인 연결

### 도메인 구매
- 한국: 가비아 (`moocorp.kr` 약 22,000원/년)
- 글로벌: Cloudflare Registrar / 네임칩 (`moocorp.com`)

### Vercel에 도메인 추가
1. Vercel 프로젝트 → Settings → Domains
2. 도메인 입력 → Add
3. Vercel이 표시하는 DNS 레코드를 도메인 등록기관에 추가:
   - **A 레코드**: `76.76.21.21`
   - **CNAME (www)**: `cname.vercel-dns.com`
4. SSL 인증서 자동 발급 (~1-5분)

### `astro.config.mjs` 업데이트
도메인 확정 후:
```js
export default defineConfig({
  site: 'https://moocorp.kr',  // 실제 도메인으로 변경
  ...
});
```

## 4. SEO 설정

### Google Search Console
1. https://search.google.com/search-console 접속
2. 도메인 인증 (DNS TXT 레코드 추가)
3. Sitemap 제출: `https://moocorp.kr/sitemap-index.xml`

### Naver Search Advisor
1. https://searchadvisor.naver.com 접속
2. 사이트 등록 + HTML 메타태그 인증
3. Sitemap 제출

## 5. Paperclip Writer 자동 발행 셋업

Writer 에이전트가 글을 자동으로 커밋하려면:

```bash
# GitHub Personal Access Token 발급 (Settings > Developer settings > PAT)
# Scope: contents (write)

# Paperclip docker .env에 추가
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=<your-username>
GITHUB_REPO=moocorp-blog
```

`docker-compose.yml`에 환경변수 추가 후 컨테이너 재시작.
