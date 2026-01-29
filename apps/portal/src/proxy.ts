import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Refresh Session (Critical for Server Components)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data } = await supabase.auth.getUser()
    const user = data?.user;

    // 2. Route Protection
    const path = request.nextUrl.pathname;

    // Instructor Routes
    if (path.startsWith('/instructor') && !path.startsWith('/instructor/login')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login?role=instructor', request.url))
        }

        // Block Demo Users from /instructor/lab and /instructor/settings
        const isDemoUser = user?.user_metadata?.is_demo === true;
        const isRestrictedRoute = path.startsWith('/instructor/lab') || path.startsWith('/instructor/settings');

        if (isRestrictedRoute && isDemoUser) {
            return NextResponse.redirect(new URL('/instructor/dashboard?demo_restricted=true', request.url))
        }
    }

    // Student Routes
    if (path.startsWith('/student') && !path.startsWith('/student/login')) {
        if (!user) {
            return NextResponse.redirect(new URL('/student/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
