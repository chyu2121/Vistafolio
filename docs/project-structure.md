# Vistafolio 프로젝트 구조 보고서

**작성일**: 2026-02-24
**프로젝트 버전**: 0.1.1
**총 파일 수**: 90개 (소스 코드, 설정, 문서 파일)

---

## [1] 전체 디렉토리 구조

```
vistafolio/
├── .claude/                    # Claude Code 설정
│   ├── settings.json
│   └── settings.local.json
├── .vercel/                    # Vercel 배포 설정
│   ├── project.json
│   └── README.txt
├── .vscode/                    # VSCode 설정
│   └── settings.json
├── app/                        # Next.js App Router
│   ├── admin/                  # 관리자 페이지
│   │   ├── dashboard/
│   │   │   ├── AdminDashboardClient.tsx
│   │   │   └── page.tsx
│   │   ├── posts/
│   │   │   ├── [id]/edit/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── actions.ts
│   │   └── layout.tsx
│   ├── api/                    # API Routes
│   │   ├── admin/posts/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── exchange-rate/route.ts
│   │   ├── korea-stocks/
│   │   │   ├── price/
│   │   │   └── search/route.ts
│   │   ├── krx/search/route.ts
│   │   ├── price/route.ts
│   │   ├── savings/route.ts
│   │   ├── search/route.ts
│   │   └── vista_news/analyze/route.ts
│   ├── auth/                   # 인증 페이지
│   │   ├── callback/page.tsx
│   │   └── page.tsx
│   ├── dashboard/              # 대시보드
│   │   └── page.tsx
│   ├── login/                  # 로그인 페이지
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── vista_forum/            # Vista Forum (게시판)
│   │   ├── [id]/page.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── vista_news/             # Vista News (뉴스)
│   │   ├── components/
│   │   │   ├── ClaudeIcon.tsx
│   │   │   ├── NewsCard.tsx
│   │   │   ├── NewsLoadingSkeleton.tsx
│   │   │   ├── NewsSearch.tsx
│   │   │   └── OverallSummary.tsx
│   │   ├── scraps/page.tsx
│   │   └── page.tsx
│   ├── vista_savings/          # Vista Savings (적금)
│   │   ├── bookmarks/page.tsx
│   │   └── page.tsx
│   ├── visual_portfolio/       # Visual Portfolio (시각화)
│   │   └── page.tsx
│   ├── globals.css             # 전역 CSS
│   ├── layout.tsx              # Root Layout
│   └── page.tsx                # 랜딩페이지
├── components/                 # 재사용 컴포넌트
│   ├── main/
│   │   ├── hero.tsx
│   │   └── navbar.tsx
│   ├── portfolio/
│   │   ├── DonutChart.tsx
│   │   ├── PortfolioTable.tsx
│   │   └── StockInputPanel.tsx
│   ├── savings/
│   │   ├── ProductCard.tsx
│   │   └── utils.ts
│   ├── ui/
│   │   ├── fluid-gradient.tsx
│   │   ├── illustrations.tsx
│   │   └── text-cursor-proximity.tsx
│   ├── vista_forum/
│   │   ├── DeletePostButton.tsx
│   │   ├── MarkdownContent.tsx
│   │   └── PostForm.tsx
│   └── GoogleAdSense.tsx
├── contexts/                   # React Context
│   └── AuthContext.tsx
├── hooks/                      # Custom Hooks
│   ├── use-mouse-position-ref.ts
│   ├── usePortfolio.ts
│   ├── useSavingsBookmark.ts
│   └── useScrap.ts
├── lib/                        # 유틸리티 & API 클라이언트
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── storage.ts
│   ├── korean-stock-price-client.ts
│   ├── korean-stocks.ts
│   ├── krx-open-api-client.ts
│   ├── public-data-client.ts
│   ├── public-data-stock-price.ts
│   ├── supabaseClient.ts
│   └── utils.ts
├── public/                     # 정적 파일
│   ├── ads.txt
│   ├── Vistafolio_CI_배경.png
│   ├── Vistafolio_CI_초안.png
│   ├── Vistafolio_Logo_black.png
│   ├── Vistafolio_Logo_pistachio.png
│   └── Vistafolio_Logo_white.png
├── supabase/                   # Supabase 마이그레이션
│   └── migrations/
│       ├── 001_create_profiles.sql
│       ├── 002_create_forum_tables.sql
│       ├── 006_create_post_images_bucket.sql
│       └── 007_create_increment_view_count_function.sql
├── types/                      # TypeScript 타입 정의
│   ├── portfolio.ts
│   └── savings.ts
├── .env.example
├── .env.local
├── .mcp.json
├── DEPLOYMENT_GUIDE.md
├── eslint.config.mjs
├── middleware.ts
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
├── schema_reference.sql
├── search_companies.js
├── test_companies.js
├── test_kosdaq.js
├── test_yahoo.js
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

---

## [2] 핵심 설정 파일 내용

### package.json

```json
{
  "name": "vistafolio",
  "version": "0.1.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@google/genai": "^1.41.0",
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.5.0",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.97.0",
    "@tiptap/extension-color": "^3.20.0",
    "@tiptap/extension-image": "^3.20.0",
    "@tiptap/extension-link": "^3.20.0",
    "@tiptap/extension-placeholder": "^3.20.0",
    "@tiptap/extension-text-align": "^3.20.0",
    "@tiptap/extension-text-style": "^3.20.0",
    "@tiptap/extension-underline": "^3.20.0",
    "@tiptap/pm": "^3.20.0",
    "@tiptap/react": "^3.20.0",
    "@tiptap/starter-kit": "^3.20.0",
    "@types/d3": "^7.4.3",
    "clsx": "^2.1.1",
    "colorthief": "^2.6.0",
    "d3": "^7.9.0",
    "dompurify": "^3.3.1",
    "lucide-react": "^0.564.0",
    "motion": "^12.34.0",
    "next": "16.1.6",
    "openai": "^6.22.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "tailwind-merge": "^3.4.0",
    "three": "^0.182.0",
    "yahoo-finance2": "^3.13.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/colorthief": "^2.6.1",
    "@types/dompurify": "^3.0.5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### tailwind.config.ts

**파일 없음** - Tailwind CSS v4는 `@theme` 지시어를 `globals.css`에서 직접 사용

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  devIndicators: false
};

export default nextConfig;
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "baseUrl": "."
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### middleware.ts

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 세션 갱신 (반드시 호출해야 세션 쿠키가 유지됨)
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // /login은 인증 없이 접근 가능
    if (pathname === '/login') {
        // 이미 로그인된 경우 대시보드로 리다이렉트
        if (user) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
        return supabaseResponse
    }

    // /admin/* 경로 보호
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // 관리자 권한 확인
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/login',
    ],
}
```

**기능**: `/admin/*` 경로는 관리자 권한 필요, `/login` 접근 제어

---

## [3] 전역 파일 내용

### app/layout.tsx

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

import GoogleAdSense from "@/components/GoogleAdSense";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Vistafolio',
    description: 'Visual Portfolio Tracker',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <GoogleAdSense pId={process.env.NEXT_PUBLIC_ADSENSE_ID || ""} />
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
```

**구성**:
- Inter 폰트 사용
- Google AdSense 적용
- AuthProvider로 전역 인증 상태 관리

### app/globals.css

```css
@import "tailwindcss";

@theme {
  --color-pistachio: #93C572;
}

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(to bottom,
      transparent,
      rgb(var(--background-end-rgb))) rgb(var(--background-start-rgb));
}
```

**특징**:
- Tailwind CSS v4 사용 (`@import "tailwindcss"`)
- 커스텀 색상: `--color-pistachio: #93C572`
- 다크 모드 지원 (시스템 설정 기반)

### app/page.tsx (랜딩페이지)

```typescript
import Navbar from "@/components/main/navbar"
import Hero from "@/components/main/hero"

export default function LandingPage() {
    return (
        <main className="flex min-h-screen flex-col items-center bg-[#111] text-white overflow-hidden">
            <Navbar />
            <Hero />
        </main>
    )
}
```

**구성**: Navbar + Hero 섹션, 다크 배경 고정

---

## [4] 현재 구현된 페이지 목록

### 총 15개 페이지

| 경로 | 파일 경로 | 설명 |
|------|----------|------|
| `/` | `app/page.tsx` | 랜딩페이지 |
| `/dashboard` | `app/dashboard/page.tsx` | 대시보드 |
| `/visual_portfolio` | `app/visual_portfolio/page.tsx` | 시각화 포트폴리오 |
| `/vista_news` | `app/vista_news/page.tsx` | 뉴스 메인 |
| `/vista_news/scraps` | `app/vista_news/scraps/page.tsx` | 스크랩한 뉴스 |
| `/vista_savings` | `app/vista_savings/page.tsx` | 적금 상품 조회 |
| `/vista_savings/bookmarks` | `app/vista_savings/bookmarks/page.tsx` | 북마크한 적금 |
| `/vista_forum` | `app/vista_forum/page.tsx` | 게시판 목록 |
| `/vista_forum/[id]` | `app/vista_forum/[id]/page.tsx` | 게시글 상세 |
| `/login` | `app/login/page.tsx` | 관리자 로그인 |
| `/auth` | `app/auth/page.tsx` | 인증 페이지 |
| `/auth/callback` | `app/auth/callback/page.tsx` | OAuth 콜백 |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | 관리자 대시보드 |
| `/admin/posts/new` | `app/admin/posts/new/page.tsx` | 게시글 작성 |
| `/admin/posts/[id]/edit` | `app/admin/posts/[id]/edit/page.tsx` | 게시글 수정 |

---

## [5] 현재 구현된 컴포넌트 목록

### 총 14개 컴포넌트 파일

#### Main (메인/공통)
- `components/main/navbar.tsx` - 네비게이션 바
- `components/main/hero.tsx` - 랜딩페이지 히어로 섹션
- `components/GoogleAdSense.tsx` - Google AdSense 통합

#### Portfolio (포트폴리오)
- `components/portfolio/StockInputPanel.tsx` - 종목 입력 패널
- `components/portfolio/DonutChart.tsx` - 도넛 차트 시각화
- `components/portfolio/PortfolioTable.tsx` - 포트폴리오 테이블

#### Savings (적금)
- `components/savings/ProductCard.tsx` - 적금 상품 카드
- `components/savings/utils.ts` - 유틸리티 함수

#### Vista Forum (게시판)
- `components/vista_forum/PostForm.tsx` - TipTap 에디터 게시글 작성 폼
- `components/vista_forum/MarkdownContent.tsx` - HTML 콘텐츠 렌더링 (DOMPurify)
- `components/vista_forum/DeletePostButton.tsx` - 게시글 삭제 버튼

#### UI (재사용 UI)
- `components/ui/fluid-gradient.tsx` - 유동적 그라디언트 효과
- `components/ui/illustrations.tsx` - 일러스트레이션 컴포넌트
- `components/ui/text-cursor-proximity.tsx` - 마우스 커서 근접 효과

---

## [6] Supabase 클라이언트 파일

### lib/supabase/client.ts (클라이언트용)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
```

**용도**: 클라이언트 컴포넌트에서 Supabase 사용

### lib/supabase/server.ts (서버용)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server Component에서 호출 시 무시 (middleware에서 처리)
                    }
                },
            },
        }
    )
}
```

**용도**: 서버 컴포넌트 및 API Route에서 Supabase 사용

### lib/supabase/storage.ts (Storage)

```typescript
import { createClient } from "./client";

/**
 * 이미지를 Supabase Storage에 업로드하고 Public URL을 반환합니다.
 */
export async function uploadImage(file: File): Promise<string> {
    const supabase = createClient();

    // 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop();
    const fileName = `${timestamp}-${random}.${ext}`;

    // Storage에 업로드
    const { data, error } = await supabase.storage
        .from("post-images")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("Image upload error:", error);
        throw new Error(`이미지 업로드 실패: ${error.message}`);
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * 파일을 Supabase Storage에 업로드하고 Public URL을 반환합니다.
 */
export async function uploadFile(file: File, bucket: string, folder: string): Promise<string> {
    const supabase = createClient();

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;

    // Storage에 업로드
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("File upload error:", error);
        throw new Error(`파일 업로드 실패: ${error.message}`);
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}
```

**용도**: 이미지 및 파일 업로드 (`post-images` 버킷 사용)

---

## [7] 환경변수 항목 목록

```bash
# Created by Vercel CLI
FINLIFE_API_KEY=***
NEXT_PUBLIC_SITE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
NEXT_PUBLIC_SUPABASE_URL=***
OPENAI_API_KEY=***
PUBLIC_DATA_API_KEY=***
PUBLIC_DATA_STOCK_API_KEY=***
KRX_OPEN_API_KEY=***
VERCEL_OIDC_TOKEN=***
```

### 환경변수 설명

| 변수명 | 용도 |
|--------|------|
| `FINLIFE_API_KEY` | 금융감독원 적금 API 키 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (OAuth 리다이렉트 등) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `OPENAI_API_KEY` | OpenAI API 키 (뉴스 요약) |
| `PUBLIC_DATA_API_KEY` | 공공데이터 API 키 |
| `PUBLIC_DATA_STOCK_API_KEY` | 주식 시세 API 키 |
| `KRX_OPEN_API_KEY` | KRX OpenAPI 키 |
| `VERCEL_OIDC_TOKEN` | Vercel OIDC 토큰 |

---

## [8] 추가 조사 항목

### Contexts (상태 관리)

- **`contexts/AuthContext.tsx`**: Supabase Auth 전역 상태 관리
  - `useAuth()` 훅 제공
  - `user`, `session`, `loading`, `signOut()` 노출

### Hooks (커스텀 훅)

- `hooks/usePortfolio.ts` - 포트폴리오 데이터 관리
- `hooks/useSavingsBookmark.ts` - 적금 북마크 관리
- `hooks/useScrap.ts` - 뉴스 스크랩 관리
- `hooks/use-mouse-position-ref.ts` - 마우스 위치 추적

### Types (타입 정의)

- `types/portfolio.ts` - 포트폴리오 타입
- `types/savings.ts` - 적금 타입

### Lib (라이브러리/유틸리티)

| 파일 | 설명 |
|------|------|
| `lib/korean-stocks.ts` | 한국주식 데이터베이스 & 로고 맵핑 |
| `lib/korean-stock-price-client.ts` | 한국주식 시세 조회 클라이언트 |
| `lib/krx-open-api-client.ts` | KRX OpenAPI 클라이언트 |
| `lib/public-data-client.ts` | 공공데이터 클라이언트 |
| `lib/public-data-stock-price.ts` | 공공데이터 주식 시세 |
| `lib/supabaseClient.ts` | Supabase 레거시 클라이언트 |
| `lib/utils.ts` | 유틸리티 함수 |

### API Routes (9개)

| 엔드포인트 | 파일 | 기능 |
|-----------|------|------|
| `/api/search` | `app/api/search/route.ts` | 통합 주식 검색 (한국/글로벌) |
| `/api/korea-stocks/search` | `app/api/korea-stocks/search/route.ts` | 한국주식 검색 |
| `/api/price` | `app/api/price/route.ts` | 주식 시세 조회 |
| `/api/exchange-rate` | `app/api/exchange-rate/route.ts` | 환율 조회 |
| `/api/savings` | `app/api/savings/route.ts` | 적금 상품 조회 |
| `/api/vista_news/analyze` | `app/api/vista_news/analyze/route.ts` | 뉴스 분석 (OpenAI) |
| `/api/admin/posts` | `app/api/admin/posts/route.ts` | 게시글 관리 (CRUD) |
| `/api/auth/logout` | `app/api/auth/logout/route.ts` | 로그아웃 |
| `/api/krx/search` | `app/api/krx/search/route.ts` | KRX 종목 검색 |

### Supabase Migrations (4개)

1. `001_create_profiles.sql` - 프로필 테이블
2. `002_create_forum_tables.sql` - 게시판 테이블
3. `006_create_post_images_bucket.sql` - 이미지 버킷
4. `007_create_increment_view_count_function.sql` - 조회수 증가 함수

---

## [9] 주요 기술 스택

### 프레임워크 & 라이브러리

- **Next.js** 16.1.6 (App Router)
- **React** 19.2.3
- **TypeScript** 5
- **Tailwind CSS** 4 (CSS 변수 기반)

### 데이터베이스 & 인증

- **Supabase** (@supabase/ssr, @supabase/supabase-js)
  - PostgreSQL 데이터베이스
  - Supabase Auth (OAuth)
  - Supabase Storage (이미지 업로드)

### UI & 시각화

- **TipTap** (리치 텍스트 에디터)
- **D3.js** (데이터 시각화)
- **Three.js** (@react-three/fiber, @react-three/drei) - 3D 렌더링
- **Motion** (애니메이션)
- **Lucide React** (아이콘)

### 외부 API

- **Yahoo Finance** (yahoo-finance2) - 글로벌 주식 시세
- **OpenAI API** (openai) - 뉴스 요약
- **Google Gemini** (@google/genai) - AI 기능
- **KRX OpenAPI** - 한국거래소 데이터
- **공공데이터포털** - 주식/적금 데이터

### 보안 & 유틸리티

- **DOMPurify** (XSS 방지)
- **clsx** + **tailwind-merge** (className 유틸리티)

---

## [10] 프로젝트 특징 요약

### ✅ 구현 완료 기능

1. **포트폴리오 관리**
   - 한국주식 + 글로벌 주식 추가
   - 실시간 시세 조회
   - 도넛 차트 시각화
   - 로고 표시 (한국주식)

2. **Vista News**
   - OpenAI 기반 뉴스 요약
   - 스크랩 기능

3. **Vista Savings**
   - 금융감독원 적금 상품 조회
   - 북마크 기능

4. **Vista Forum**
   - TipTap 에디터 (Word 스타일)
   - 이미지 업로드 (Supabase Storage)
   - HTML 콘텐츠 렌더링 (DOMPurify)
   - 조회수 기능

5. **관리자 시스템**
   - Supabase Auth 기반 인증
   - 게시글 CRUD
   - 역할 기반 접근 제어 (middleware)

### 🎨 디자인 시스템

- **커스텀 색상**: Pistachio Green (#93C572)
- **다크 모드**: 시스템 설정 기반 (`prefers-color-scheme`)
- **폰트**: Inter (Google Fonts)
- **반응형**: Tailwind CSS 유틸리티 클래스

### 📦 배포

- **플랫폼**: Vercel
- **환경변수**: `.env.local` (9개 키)
- **정적 파일**: Google AdSense (`ads.txt`)

---

## [11] 개선 권장사항

1. **Tailwind Config 파일 부재**
   - Tailwind v4는 `globals.css`에서 `@theme` 지시어 사용
   - 커스텀 색상 추가 시 `@theme` 섹션 수정

2. **SEO 최적화**
   - Open Graph 메타 태그 추가
   - Sitemap 생성

3. **에러 처리**
   - 글로벌 에러 바운더리 추가
   - API 에러 핸들링 표준화

4. **테스트**
   - 단위 테스트 (Jest)
   - E2E 테스트 (Playwright)

5. **성능 최적화**
   - 이미지 최적화 (Next.js Image)
   - Code Splitting
   - React Server Components 활용

---

**끝**
