-- ============================================================
-- 002_create_forum_tables.sql
-- vistafolio.kr/vista_forum 게시판 스키마
-- 반드시 001_create_profiles.sql 적용 후 실행
-- ============================================================

-- ─────────────────────────────────────────
-- 편의 함수: 현재 로그인 사용자의 role 반환
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────
-- 1. categories 테이블
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
    id          text        PRIMARY KEY,
    name        text        NOT NULL,
    description text,
    sort_order  integer     DEFAULT 0,
    created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- 2. posts 테이블
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    title         text        NOT NULL,
    content       text        NOT NULL,
    summary       text        CHECK (char_length(summary) <= 200),
    category      text        REFERENCES public.categories(id) ON DELETE SET NULL,
    thumbnail_url text,
    author_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    author_role   text        NOT NULL DEFAULT 'admin',
    is_published  boolean     NOT NULL DEFAULT false,
    view_count    integer     NOT NULL DEFAULT 0,
    created_at    timestamptz DEFAULT now(),
    updated_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- 3. post_views 테이블
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_views (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    viewer_ip  text,
    viewed_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- 4. updated_at 트리거 (posts)
--    set_updated_at() 함수는 001에서 이미 생성됨
-- ─────────────────────────────────────────
CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────
-- 5. 인덱스
-- ─────────────────────────────────────────

-- 목록 조회용 복합 인덱스 (카테고리 필터 + 발행 여부 + 최신순)
CREATE INDEX IF NOT EXISTS idx_posts_category_published_created
    ON public.posts (category, is_published, created_at DESC);

-- 작성자 기반 조회
CREATE INDEX IF NOT EXISTS idx_posts_author_id
    ON public.posts (author_id);

-- 조회수 중복 체크용 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_post_views_post_viewer
    ON public.post_views (post_id, viewer_ip);

-- ─────────────────────────────────────────
-- 6. RLS 활성화
-- ─────────────────────────────────────────
ALTER TABLE public.posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views  ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 7. RLS 정책 — posts
-- ─────────────────────────────────────────

-- SELECT: 누구나 발행된 글만 읽기 가능
CREATE POLICY "posts_select_published"
    ON public.posts FOR SELECT
    USING (is_published = true);

-- INSERT: profiles.role = 'admin' 인 사용자만
CREATE POLICY "posts_insert_admin"
    ON public.posts FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND public.get_my_role() = 'admin'
        AND author_id = auth.uid()
    );

-- UPDATE: 본인 글 + admin만
CREATE POLICY "posts_update_own"
    ON public.posts FOR UPDATE
    USING (auth.uid() = author_id AND public.get_my_role() = 'admin')
    WITH CHECK (auth.uid() = author_id AND public.get_my_role() = 'admin');

-- DELETE: 본인 글 + admin만
CREATE POLICY "posts_delete_own"
    ON public.posts FOR DELETE
    USING (auth.uid() = author_id AND public.get_my_role() = 'admin');

-- ─────────────────────────────────────────
-- 8. RLS 정책 — categories
-- ─────────────────────────────────────────

-- SELECT: 누구나 가능
CREATE POLICY "categories_select_public"
    ON public.categories FOR SELECT
    USING (true);

-- INSERT/UPDATE/DELETE: admin만
CREATE POLICY "categories_insert_admin"
    ON public.categories FOR INSERT
    WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "categories_update_admin"
    ON public.categories FOR UPDATE
    USING (public.get_my_role() = 'admin');

CREATE POLICY "categories_delete_admin"
    ON public.categories FOR DELETE
    USING (public.get_my_role() = 'admin');

-- ─────────────────────────────────────────
-- 9. RLS 정책 — post_views
-- ─────────────────────────────────────────

-- SELECT: 누구나 가능 (관리자 통계 조회용)
CREATE POLICY "post_views_select_all"
    ON public.post_views FOR SELECT
    USING (true);

-- INSERT: 누구나 가능 (비로그인 포함, IP 기반 중복 방지)
CREATE POLICY "post_views_insert_all"
    ON public.post_views FOR INSERT
    WITH CHECK (true);

-- ─────────────────────────────────────────
-- 10. 초기 카테고리 데이터
-- ─────────────────────────────────────────
INSERT INTO public.categories (id, name, description, sort_order) VALUES
    ('stock_basic', '주식 입문',     '계좌개설, 기본 용어',        1),
    ('etf',         'ETF·펀드',      'ETF 투자 가이드',            2),
    ('savings',     '예적금·CMA',    '예적금, 파킹통장, CMA',      3),
    ('tax_account', '절세 계좌',     'ISA, 연금저축, IRP',         4),
    ('dividend',    '배당 투자',     '배당주, 배당 ETF',           5),
    ('roadmap',     '재테크 로드맵', '단계별 자산 형성 전략',      6)
ON CONFLICT (id) DO NOTHING;
