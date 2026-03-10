'use server';

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Auth Helper ───────────────────────────────────────────────────

async function ensureSuperadmin() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const role = user.app_metadata?.role || user.user_metadata?.role;
    if (role !== 'superadmin') throw new Error('Unauthorized: Superadmin access required');
    return user;
}

// ─── Audiences ─────────────────────────────────────────────────────

export async function getAudiences() {
    try {
        await ensureSuperadmin();

        const { data, error } = await supabaseAdmin
            .from('platform_audiences')
            .select('*, contacts:platform_contacts(count)')
            .order('name', { ascending: true });

        if (error) throw error;
        return { data: data || [] };
    } catch (error: any) {
        console.error('[getAudiences] Error:', error);
        return { data: [], error: error.message };
    }
}

export async function createAudience(name: string) {
    try {
        await ensureSuperadmin();

        // 1. Create in Resend
        const { data: resendData, error: resendError } = await resend.audiences.create({ name });
        if (resendError) throw new Error(`Resend: ${resendError.message}`);

        // 2. Mirror in Supabase
        const { data: created, error: dbError } = await supabaseAdmin
            .from('platform_audiences')
            .insert({
                resend_audience_id: resendData!.id,
                name,
            })
            .select('id')
            .single();

        if (dbError) throw dbError;
        return { success: true, id: created?.id };
    } catch (error: any) {
        console.error('[createAudience] Error:', error);
        return { error: error.message || 'Failed to create audience' };
    }
}

export async function deleteAudience(audienceId: string) {
    try {
        await ensureSuperadmin();

        // 1. Get the Resend audience ID
        const { data: audience, error: fetchError } = await supabaseAdmin
            .from('platform_audiences')
            .select('resend_audience_id')
            .eq('id', audienceId)
            .single();

        if (fetchError || !audience) throw new Error('Audience not found');

        // 2. Delete from Resend
        const { error: resendError } = await resend.audiences.remove(audience.resend_audience_id);
        if (resendError) {
            console.error('[deleteAudience] Resend error:', resendError);
            // Continue with local delete even if Resend fails
        }

        // 3. Delete locally (cascade deletes contacts)
        const { error: dbError } = await supabaseAdmin
            .from('platform_audiences')
            .delete()
            .eq('id', audienceId);

        if (dbError) throw dbError;
        return { success: true };
    } catch (error: any) {
        console.error('[deleteAudience] Error:', error);
        return { error: error.message || 'Failed to delete audience' };
    }
}

// ─── Contacts ──────────────────────────────────────────────────────

export async function getContacts(audienceId: string) {
    try {
        await ensureSuperadmin();

        const { data, error } = await supabaseAdmin
            .from('platform_contacts')
            .select('*')
            .eq('audience_id', audienceId)
            .order('email', { ascending: true });

        if (error) throw error;
        return { data: data || [] };
    } catch (error: any) {
        console.error('[getContacts] Error:', error);
        return { data: [], error: error.message };
    }
}

export interface ContactData {
    email: string;
    firstName?: string;
    lastName?: string;
}

export async function addContact(audienceId: string, contact: ContactData) {
    try {
        await ensureSuperadmin();

        // 1. Get Resend audience ID
        const { data: audience, error: fetchError } = await supabaseAdmin
            .from('platform_audiences')
            .select('resend_audience_id')
            .eq('id', audienceId)
            .single();

        if (fetchError || !audience) throw new Error('Audience not found');

        // 2. Create in Resend
        const { data: resendData, error: resendError } = await resend.contacts.create({
            audienceId: audience.resend_audience_id,
            email: contact.email,
            firstName: contact.firstName,
            lastName: contact.lastName,
        });

        if (resendError) throw new Error(`Resend: ${resendError.message}`);

        // 3. Mirror in Supabase
        const { error: dbError } = await supabaseAdmin
            .from('platform_contacts')
            .insert({
                resend_contact_id: resendData!.id,
                audience_id: audienceId,
                email: contact.email,
                first_name: contact.firstName || null,
                last_name: contact.lastName || null,
            });

        if (dbError) throw dbError;
        return { success: true };
    } catch (error: any) {
        console.error('[addContact] Error:', error);
        return { error: error.message || 'Failed to add contact' };
    }
}

export async function removeContact(contactId: string) {
    try {
        await ensureSuperadmin();

        // 1. Get the Resend contact ID and audience
        const { data: contact, error: fetchError } = await supabaseAdmin
            .from('platform_contacts')
            .select('resend_contact_id, audience_id, platform_audiences!inner(resend_audience_id)')
            .eq('id', contactId)
            .single();

        if (fetchError || !contact) throw new Error('Contact not found');

        const resendAudienceId = (contact as any).platform_audiences?.resend_audience_id;

        // 2. Delete from Resend
        if (resendAudienceId) {
            const { error: resendError } = await resend.contacts.remove({
                audienceId: resendAudienceId,
                id: contact.resend_contact_id,
            });
            if (resendError) {
                console.error('[removeContact] Resend error:', resendError);
            }
        }

        // 3. Delete locally
        const { error: dbError } = await supabaseAdmin
            .from('platform_contacts')
            .delete()
            .eq('id', contactId);

        if (dbError) throw dbError;
        return { success: true };
    } catch (error: any) {
        console.error('[removeContact] Error:', error);
        return { error: error.message || 'Failed to remove contact' };
    }
}

// ─── Sync Audiences from Resend ────────────────────────────────────

export async function syncAudiencesFromResend() {
    try {
        await ensureSuperadmin();

        const { data: resendAudiences, error: resendError } = await resend.audiences.list();
        if (resendError) throw new Error(`Resend: ${resendError.message}`);

        let synced = 0;
        for (const audience of resendAudiences?.data || []) {
            const { error } = await supabaseAdmin
                .from('platform_audiences')
                .upsert(
                    {
                        resend_audience_id: audience.id,
                        name: audience.name,
                    },
                    { onConflict: 'resend_audience_id' }
                );

            if (!error) synced++;
        }

        return { success: true, synced };
    } catch (error: any) {
        console.error('[syncAudiencesFromResend] Error:', error);
        return { error: error.message || 'Failed to sync audiences' };
    }
}
