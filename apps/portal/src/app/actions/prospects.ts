'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ensureSuperadmin() {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const role = user.app_metadata?.role || user.user_metadata?.role;
    if (role !== 'superadmin') throw new Error('Unauthorized: Superadmin access required');
    return user;
}

export interface ProspectPayload {
    institution_name: string;
    email?: string;
    phone?: string;
    website?: string;
    location?: string;
    type?: 'tvet' | 'college' | 'university' | 'other';
    ownership?: 'private' | 'public' | 'NGO' | 'other';
    campuses?: string;
    has_elearning?: boolean;
    contact_name?: string;
    job_title?: string;
    list_id: string; // the linked platform_audiences id
}

export async function createProspect(data: ProspectPayload) {
    try {
        await ensureSuperadmin();

        const { data: inserted, error } = await supabaseAdmin
            .from('prospects')
            .insert({ ...data, status: 'new' })
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/admin/email/audiences');
        return { success: true, prospect: inserted };
    } catch (e: any) {
        console.error('Create Prospect Error:', e);
        return { error: e.message || 'Failed to create prospect' };
    }
}

export async function getProspects(listId: string, search?: string, typeFilter?: string) {
    try {
        await ensureSuperadmin();

        // Check cache first if searching
        const cacheKey = `prospects:${listId}:${search || 'all'}:${typeFilter || 'all'}`;
        if (search) {
            const cached = await redis.get(cacheKey);
            if (cached) return { success: true, prospects: cached };
        }

        let query = supabaseAdmin
            .from('prospects')
            .select('*')
            .eq('list_id', listId);

        if (search) {
            query = query.or(`institution_name.ilike.%${search}%,email.ilike.%${search}%,location.ilike.%${search}%`);
        }

        if (typeFilter) {
            query = query.eq('type', typeFilter);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // Cache search results for 1 hour to prevent DB spam on active typing
        if (search) {
            await redis.set(cacheKey, data, { ex: 3600 });
        }

        return { success: true, prospects: data };
    } catch (e: any) {
        console.error('Fetch Prospects Error:', e);
        return { error: e.message || 'Failed to fetch prospects' };
    }
}

export async function deleteProspects(ids: string[]) {
    try {
        await ensureSuperadmin();

        const { error } = await supabaseAdmin
            .from('prospects')
            .delete()
            .in('id', ids);

        if (error) throw error;

        if (error) throw error;

        revalidatePath('/admin/email/audiences');
        return { success: true };
    } catch (e: any) {
        console.error('Delete Prospects Error:', e);
        return { error: e.message || 'Failed to delete prospects' };
    }
}

import { extractTextFromFile } from '@schologic/doc-engine';

export async function bulkImportProspects(formData: FormData) {
    try {
        await ensureSuperadmin();

        const file = formData.get('file') as File;
        const listId = formData.get('listId') as string;

        if (!file || !listId) {
            return { error: 'Missing file or list ID' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Extract CSV via Doc Engine
        const parseResult = await extractTextFromFile(buffer, file.type, file.name);
        if (!parseResult || !Array.isArray(parseResult.content)) {
            return { error: 'Failed to parse CSV file. Ensure it is a valid format.' };
        }

        const rawRecords = parseResult.content;

        // 2. Format mapped data loosely (Assuming basic column headers like Institution Name, Email, etc.)
        // Note: Full dynamic UI mapping can happen on client, but here we'll assume the CSV is pre-mapped or has recognized headers for simplicity at the action level.
        const mappedProspects: ProspectPayload[] = [];
        for (const row of rawRecords) {
            const instName = row['institution_name'] || row['Institution Name'] || row['Name'] || row['name'];
            if (!instName) continue; // Skip rows without name

            mappedProspects.push({
                list_id: listId,
                institution_name: String(instName),
                email: row['email'] || row['Email'] || null,
                phone: row['phone'] || row['Phone'] || null,
                website: row['website'] || row['Website'] || row['URL'] || null,
                location: row['location'] || row['Location'] || null,
                type: row['type'] || row['Type'] || null,
                contact_name: row['contact_name'] || row['Contact Name'] || null,
                job_title: row['job_title'] || row['Job Title'] || row['Title'] || null,
            });
        }

        if (mappedProspects.length === 0) {
            return { error: 'No valid rows found to import (Missing Institution Name).' };
        }

        // 3. Deduplicate against existing prospects in this list
        // Fetch existing emails
        const { data: existingData } = await supabaseAdmin
            .from('prospects')
            .select('email')
            .eq('list_id', listId)
            .not('email', 'is', null);

        const existingEmails = new Set((existingData || []).map(r => r.email?.toLowerCase().trim()));

        // Filter new prospects (skip duplicates inside the batch and vs DB)
        const toInsert: ProspectPayload[] = [];
        const seenBatchEmails = new Set<string>();

        for (const p of mappedProspects) {
            if (p.email) {
                const em = p.email.toLowerCase().trim();
                if (existingEmails.has(em) || seenBatchEmails.has(em)) {
                    continue; // Deduplicate
                }
                seenBatchEmails.add(em);
            }
            toInsert.push(p);
        }

        if (toInsert.length === 0) {
            return { success: true, importedCount: 0, message: 'All valid records were duplicates.' };
        }

        // 4. Bulk Insert
        const { error } = await supabaseAdmin
            .from('prospects')
            .insert(toInsert.map(p => ({ ...p, status: 'new' })));

        if (error) throw error;

        revalidatePath('/admin/email/audiences');
        return { success: true, importedCount: toInsert.length };

    } catch (e: any) {
        console.error('Bulk Import Error:', e);
        return { error: e.message || 'Failed to bulk import prospects' };
    }
}
