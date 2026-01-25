'use client';

import Sidebar from '@/components/Sidebar';
import { createClient } from '@schologic/database';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Bypass layout protection for login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push('/admin/login'); // Redirect to admin login instead of main login
                return;
            }

            // Check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'institution_admin' && profile?.role !== 'superadmin') {
                router.push('/login'); // Not an admin
                return;
            }

            setIsAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar role="institution_admin" />
            <main className="flex-1 md:ml-64 transition-all duration-300 ease-in-out w-full">
                {children}
            </main>
        </div>
    );
}
