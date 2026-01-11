import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. Protect /instructor routes
    if (request.nextUrl.pathname.startsWith('/instructor') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 1b. Block Demo Users from /instructor/lab and /instructor/settings
    const isDemoUser = user?.email?.toLowerCase().endsWith('@schologic.demo');
    const isRestrictedRoute = request.nextUrl.pathname.startsWith('/instructor/lab') ||
        request.nextUrl.pathname.startsWith('/instructor/settings');

    if (isRestrictedRoute && isDemoUser) {
        // Redirect to dashboard with a query param that client can show a toast for
        return NextResponse.redirect(new URL('/instructor/dashboard?demo_restricted=true', request.url))
    }

    // 2. Redirect authenticated users away from /login
    if (request.nextUrl.pathname === '/login' && user) {
        return NextResponse.redirect(new URL('/instructor/dashboard', request.url))
    }

    // 3. Protect /student routes (Optional: keep existing generic student auth check if needed, 
    // currently students use anonymous auth so they also have a user object)
    // Logic: Student login page is /student/login. 
    // If user is logged in, redirect away from /student/login?
    if (request.nextUrl.pathname === '/student/login' && user) {
        // Check if they are actually a student role? 
        // For now, simple redirect to dashboard if they have a session.
        return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/student') && !request.nextUrl.pathname.startsWith('/student/login') && !user) {
        return NextResponse.redirect(new URL('/student/login', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/instructor/:path*',
        '/student/:path*',
        '/login',
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
