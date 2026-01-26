import { createServerClient } from '@supabase/ssr'
import { Database } from "@schologic/database";
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/instructor/dashboard'

    // Handle explicit errors from Supabase (e.g. otp_expired)
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
        console.error('Auth Callback Error:', error, errorDescription);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`)
    }

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient<Database>(
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
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )

        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (!sessionError) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Validate 'next' to prevent open redirect vulnerabilities
            const safeNext = next.startsWith('/') ? next : '/instructor/dashboard';

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${safeNext}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${safeNext}`)
            } else {
                return NextResponse.redirect(`${origin}${safeNext}`)
            }
        } else {
            console.error('Session Exchange Error:', sessionError);
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(sessionError.message)}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-link-invalid`)
}
