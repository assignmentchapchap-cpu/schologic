'use server';

import { createClient } from '@/lib/supabase-server';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Asset, AssetType } from '@/types/library';
import { extractTextFromFile } from '@/lib/parsing';

export async function getAssets(collectionId?: string | null) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
            .from('assets')
            .select('*')
            .eq('instructor_id', user.id)
            .is('parent_asset_id', null);

        if (collectionId) {
            query = query.eq('collection_id', collectionId);
        } else {
            query = query.is('collection_id', null);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            console.error("DB Error:", error);
            return [];
        }
        return data as Asset[];
    } catch (e) {
        console.error("Server Action Error:", e);
        return [];
    }
}

export async function uploadFileAsset(formData: FormData, collectionId?: string) {
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) throw new Error('No file provided');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Upload to Blob (Safe)
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });

    // 2. Extract Text (Risk Layer - Fail Safe)
    // 2. Extract Text (Risk Layer - Fail Safe)
    // 2. Extract Text (Risk Layer - Fail Safe)
    let extractedContent = null;
    let extractedTitle: string | undefined = undefined;

    try {
        const result = await extractTextFromFile(file);
        if (result && typeof result === 'object' && 'content' in result) {
            extractedContent = result.content;
            extractedTitle = result.title;
        } else if (typeof result === 'string') {
            extractedContent = result;
        }
    } catch (e) {
        console.warn("Text extraction skipped/failed:", e);
    }

    // 3. Insert to DB
    let assetType: AssetType = 'file';
    if (file.name.toLowerCase().endsWith('.imscc')) {
        assetType = 'cartridge_root';
    }

    // Smart Title Logic: 
    // If user accepted default filename (title == file.name) AND we have a better extracted title, use it.
    // Otherwise respect user's custom input.

    const finalTitle = (title === file.name && extractedTitle) ? extractedTitle : (title || extractedTitle || file.name);

    const { error } = await supabase.from('assets').insert({
        title: finalTitle,
        file_url: blob.url,
        content: extractedContent,
        asset_type: assetType,
        mime_type: file.type,
        source: 'upload',
        collection_id: collectionId || null,
        instructor_id: user.id
    });

    if (error) throw error;
    revalidatePath('/instructor/library');
}

export async function createManualAsset(title: string, content: any, collectionId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase.from('assets').insert({
        title,
        content,
        asset_type: 'document',
        source: 'manual',
        collection_id: collectionId || null,
        instructor_id: user.id
    });

    if (error) throw error;
    revalidatePath('/instructor/library');
}
