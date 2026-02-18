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

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname;

    // 2. Global Account Status Check (Bypass for login/disabled/api)
    const isPublicPath = path.startsWith('/login') || path.startsWith('/auth') || path.startsWith('/disabled') || path.startsWith('/api') || path === '/';

    if (user && !isPublicPath) {
        // If account is marked as inactive in metadata, redirect to disabled
        if (user.user_metadata?.is_active === false) {
            return NextResponse.redirect(new URL('/disabled', request.url))
        }
    }

    // 3. Route Protection

    // Superadmin Routes
    if (path.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login?role=superadmin', request.url))
        }

        // Strict Superadmin Check
        if (user.user_metadata?.role !== 'superadmin') {
            // Non-admins attempting to access /admin are kicked to their respective dashboards
            const dashboard = user.user_metadata?.role === 'student' ? '/student/dashboard' : '/instructor/dashboard';
            return NextResponse.redirect(new URL(dashboard, request.url));
        }
    }

    // Instructor Routes
    if (path.startsWith('/instructor') && !path.startsWith('/instructor/login')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login?role=instructor', request.url))
        }

        // Strict Role Check: Redirect Students to Student Dashboard
        if (user.user_metadata?.role === 'student') {
            return NextResponse.redirect(new URL('/student/dashboard', request.url));
        }

        // Block Demo Users from /instructor/lab and /instructor/settings
        const isDemoUser = user.email?.endsWith('@schologic.demo') || user.user_metadata?.is_demo;
        const isRestrictedRoute = path.startsWith('/instructor/lab') || path.startsWith('/instructor/settings');

        if (isRestrictedRoute && isDemoUser) {
            return NextResponse.redirect(new URL('/instructor/dashboard?demo_restricted=true', request.url))
        }
    }

    // Student Routes
    if (path.startsWith('/student') && !path.startsWith('/student/login')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login?role=student', request.url))
        }

        // Strict Role Check: Redirect Instructors to Instructor Dashboard
        // ALLOWED FOR TESTING: Instructors can access student routes
        // if (user.user_metadata?.role === 'instructor') {
        //    return NextResponse.redirect(new URL('/instructor/dashboard', request.url));
        // }
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
