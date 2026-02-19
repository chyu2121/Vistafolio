-- ============================================================
-- 001_create_profiles.sql
-- 사용자 프로필 및 권한 관리 테이블
-- ============================================================

-- ─────────────────────────────────────────
-- 1. profiles 테이블
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email        text,
    display_name text,
    avatar_url   text,
    role         text        NOT NULL DEFAULT 'user'
                             CHECK (role IN ('admin', 'user')),
    created_at   timestamptz DEFAULT now(),
    updated_at   timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- 2. updated_at 자동 갱신 함수 & 트리거
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────
-- 3. 신규 가입 시 profiles 자동 생성 트리거
--    Google OAuth 로그인 → auth.users 생성과 동시에
--    public.profiles 행도 자동 insert
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'   -- 기본값: 일반 사용자 (admin은 수동으로 변경)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- 4. RLS 활성화
-- ─────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: 본인 프로필만 읽기 가능
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- UPDATE: 본인 프로필만 수정 가능
--         role 컬럼은 클라이언트에서 변경 불가 (기존 role 값 그대로 유지)
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );
