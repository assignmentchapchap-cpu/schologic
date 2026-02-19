import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logSecurityEvent } from '@/lib/logSecurityEvent'

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
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // 2. Global Account Status Check (Bypass for login/disabled/api)
    const isPublicPath = path.startsWith('/login') || path.startsWith('/auth') || path.startsWith('/disabled') || path.startsWith('/api') || path === '/';

    if (user && !isPublicPath) {
        // If account is marked as inactive in metadata, redirect to disabled
        if (user.user_metadata?.is_active === false) {
            logSecurityEvent({ eventType: 'deactivated_access', path, userId: user.id, ipAddress, userAgent });
            return NextResponse.redirect(new URL('/disabled', request.url))
        }
    }

    // 3. Role Fetching (Priority to secure app_metadata, fallback to user_metadata or DB)
    let userRole = user?.app_metadata?.role || user?.user_metadata?.role;

    // If user is logged in but role is missing from both JWT claims, fetch from profiles table
    if (user && !userRole) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role) {
            userRole = profile.role;
        }
    }

    // 4. Route Protection

    // Superadmin Routes
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        if (!user) {
            logSecurityEvent({ eventType: 'unauthorized_access', path, targetRole: 'superadmin', ipAddress, userAgent });
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // Strict Superadmin Check
        if (userRole !== 'superadmin') {
            logSecurityEvent({ eventType: 'role_mismatch', path, userId: user.id, userRole, targetRole: 'superadmin', ipAddress, userAgent });
            if (userRole === 'student') {
                return NextResponse.redirect(new URL('/student/dashboard', request.url));
            } else if (userRole === 'instructor') {
                return NextResponse.redirect(new URL('/instructor/dashboard', request.url));
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Instructor Routes
    if (path.startsWith('/instructor') && !path.startsWith('/instructor/login')) {
        if (!user) {
            logSecurityEvent({ eventType: 'unauthorized_access', path, targetRole: 'instructor', ipAddress, userAgent });
            return NextResponse.redirect(new URL('/login?role=instructor', request.url))
        }

        // Strict Role Check: Redirect Students to Student Dashboard
        if (userRole === 'student') {
            logSecurityEvent({ eventType: 'role_mismatch', path, userId: user.id, userRole, targetRole: 'instructor', ipAddress, userAgent });
            return NextResponse.redirect(new URL('/student/dashboard', request.url));
        }

        // Block non-instructors (excluding superadmins)
        if (userRole !== 'instructor' && userRole !== 'superadmin') {
            logSecurityEvent({ eventType: 'role_mismatch', path, userId: user.id, userRole, targetRole: 'instructor', ipAddress, userAgent });
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Block Demo Users from /instructor/lab and /instructor/settings
        const isDemoUser = user.email?.endsWith('@schologic.demo') || user.user_metadata?.is_demo;
        const isRestrictedRoute = path.startsWith('/instructor/lab') || path.startsWith('/instructor/settings');

        if (isRestrictedRoute && isDemoUser) {
            logSecurityEvent({ eventType: 'demo_restricted', path, userId: user.id, userRole, ipAddress, userAgent });
            return NextResponse.redirect(new URL('/instructor/dashboard?demo_restricted=true', request.url))
        }
    }

    // Student Routes
    if (path.startsWith('/student') && !path.startsWith('/student/login')) {
        if (!user) {
            logSecurityEvent({ eventType: 'unauthorized_access', path, targetRole: 'student', ipAddress, userAgent });
            return NextResponse.redirect(new URL('/login?role=student', request.url))
        }

        // Strict Role Check: Redirect Instructors to Instructor Dashboard
        if (userRole === 'instructor') {
            logSecurityEvent({ eventType: 'role_mismatch', path, userId: user.id, userRole, targetRole: 'student', ipAddress, userAgent });
            return NextResponse.redirect(new URL('/instructor/dashboard', request.url));
        }

        // Block non-students (excluding superadmins - keep flexibility for admins)
        if (userRole !== 'student' && userRole !== 'superadmin') {
            logSecurityEvent({ eventType: 'role_mismatch', path, userId: user.id, userRole, targetRole: 'student', ipAddress, userAgent });
            return NextResponse.redirect(new URL('/login', request.url));
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
