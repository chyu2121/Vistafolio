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
