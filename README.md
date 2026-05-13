# Moo Corp Blog

미국·한국 상장사 동향 분석 블로그. Astro로 빌드하고 Vercel로 배포합니다.

## 개발

```bash
npm install      # core.hooksPath=.githooks 자동 설정 (pre-commit MDX fixer 활성화)
npm run dev      # http://localhost:4321
npm run build    # dist/ 생성
npm run preview  # 빌드 결과 미리보기
npm run mdx:fix  # src/content 전체 MDX의 JSX-깨진 따옴표 일괄 보정
```

> `pre-commit` 훅이 staged `src/content/**/*.mdx`의 caption/alt 안 unescape된
> `"` 와 `\"` 잔재를 자동으로 한글 곡선 따옴표(`"`/`"`)로 치환하고 re-stage합니다.
> JSX는 attribute 문자열의 backslash escape를 지원하지 않아서 그대로 두면 Vercel
> 빌드가 실패합니다. 자세한 내용은 `scripts/fix-mdx-jsx-quotes.py` 참고.

## 글 작성

`src/content/posts/` 밑에 마크다운 파일 추가. 파일명은 `YYYY-MM-DD-slug.md`.

### Frontmatter 스키마

```yaml
---
title: "삼성전자 — Q1 어닝 분석"          # 필수, 120자 이내
description: "한 줄 요약"                  # 필수, 200자 이내
publishedAt: 2026-05-01                    # 필수
updatedAt: 2026-05-02                      # 선택
market: KR                                 # 필수: US | KR | GLOBAL
tickers: ["005930.KS"]                     # 선택, 기본 []
sectors: [반도체, 메모리]                  # 선택, 기본 []
tags: [어닝, 한국]                         # 선택, 기본 []
language: ko                               # 선택: ko (기본) | en
draft: false                               # 선택, 기본 false
author: "Moo Corp Research"                # 선택
heroImage:                                 # 선택
  query: "semiconductor technology"        # Unsplash 검색어 (자동) 또는
  url: "https://images.unsplash.com/..."  # 직접 URL
  alt: "이미지 설명"                       # 접근성
  attribution: "Photo by Name on Unsplash" # 크레딧
  sourceUrl: "https://unsplash.com/..."   # 원본 링크
  colorTreatment: desaturate              # grayscale | desaturate | color
---
```

`draft: true`인 글은 빌드에 포함되지 않습니다.

### Hero 이미지 사용하기

글에 이미지를 추가하려면 frontmatter에 `heroImage` 필드를 추가하세요.

**Unsplash API 키 발급 (무료)**:
1. https://unsplash.com/developers 에서 가입
2. "New Application" 클릭
3. Access Key 복사
4. 프로젝트 루트에 `.env` 파일 생성:
   ```
   UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

**이미지 처리 옵션**:
- `grayscale`: 완전 흑백
- `desaturate`: 채도 40% (분석 글 기본값, 전문적 느낌)
- `color`: 풀 컬러 (스토리 추천)

## 배포

[`DEPLOY.md`](./DEPLOY.md) 참고. Vercel + 자체 도메인.

## 자동 발행 (Paperclip 연동)

Paperclip의 Writer 에이전트가 GitHub API로 마크다운 파일을 커밋하면 Vercel이 자동 빌드·배포합니다.
필요 환경변수:
- `GITHUB_TOKEN` (repo 쓰기 권한)
- `GITHUB_REPO=moocorp-blog`
- `GITHUB_OWNER=<owner>`
