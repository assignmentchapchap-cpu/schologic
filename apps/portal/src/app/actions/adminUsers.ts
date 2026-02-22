'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { fetchWithCache, invalidateCache } from '@/lib/cache';
import { invalidateUserIdentity } from '@/lib/identity-server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ensureAuthenticated() {
    const cookieStore = await cookies();
    const supabaseSession = createSessionClient(cookieStore);
    const { data: { user }, error: authError } = await supabaseSession.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');
    return user;
}

// ─── Get All Users ────────────────────────────────────────────────────
export async function getAllUsers() {
    await ensureAuthenticated();

    return fetchWithCache('admin:users', async () => {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, role, is_active, is_demo, demo_converted_at, created_at, phone, country, professional_affiliation')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }, 300); // 5 minutes TTL
}

// ─── Add User ─────────────────────────────────────────────────────────
export async function addUser({
    email,
    fullName,
    role,
    password,
}: {
    email: string;
    fullName: string;
    role: 'instructor' | 'student' | 'superadmin';
    password: string;
}) {
    try {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role },
            app_metadata: { role },
        });

        if (authError) throw authError;

        // 2. Upsert profile row (trigger may handle this, but ensure it)
        await supabaseAdmin.from('profiles').upsert({
            id: authData.user.id,
            email,
            full_name: fullName,
            role,
            is_active: true,
            is_demo: false,
        });

        await invalidateCache('admin:users');
        await invalidateUserIdentity(authData.user.id);

        return { success: true, userId: authData.user.id };
    } catch (error: any) {
        console.error('addUser error:', error);
        return { error: error.message || 'Failed to create user' };
    }
}

// ─── Suspend User ─────────────────────────────────────────────────────
export async function suspendUser(userId: string) {
    try {
        // Update auth metadata
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { is_active: false },
            ban_duration: '876000h', // ~100 years, effectively permanent ban
        });

        if (authError) throw authError;

        // Update profile
        await supabaseAdmin.from('profiles').update({ is_active: false }).eq('id', userId);

        await invalidateCache('admin:users');
        await invalidateUserIdentity(userId);

        return { success: true };
    } catch (error: any) {
        console.error('suspendUser error:', error);
        return { error: error.message || 'Failed to suspend user' };
    }
}

// ─── Reactivate User ──────────────────────────────────────────────────
export async function reactivateUser(userId: string) {
    try {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { is_active: true },
            ban_duration: 'none',
        });

        if (authError) throw authError;

        await supabaseAdmin.from('profiles').update({ is_active: true }).eq('id', userId);

        await invalidateCache('admin:users');
        await invalidateUserIdentity(userId);

        return { success: true };
    } catch (error: any) {
        console.error('reactivateUser error:', error);
        return { error: error.message || 'Failed to reactivate user' };
    }
}

// ─── Change Role ──────────────────────────────────────────────────────
export async function changeUserRole(userId: string, newRole: 'instructor' | 'student' | 'superadmin') {
    try {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { role: newRole },
            app_metadata: { role: newRole },
        });

        if (authError) throw authError;

        await supabaseAdmin.from('profiles').update({ role: newRole }).eq('id', userId);

        await invalidateCache('admin:users');
        await invalidateUserIdentity(userId);

        return { success: true };
    } catch (error: any) {
        console.error('changeUserRole error:', error);
        return { error: error.message || 'Failed to change role' };
    }
}

// ─── Reset Password ──────────────────────────────────────────────────
export async function resetUserPassword(userId: string, newPassword: string) {
    try {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword,
        });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('resetUserPassword error:', error);
        return { error: error.message || 'Failed to reset password' };
    }
}
