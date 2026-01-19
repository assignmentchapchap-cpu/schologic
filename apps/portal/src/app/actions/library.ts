'use server';

import { createSessionClient } from "@schologic/database";
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Asset, AssetType } from '@/types/library';
import { extractTextFromFile } from '@schologic/doc-engine';
import { cookies } from 'next/headers';

export async function getAssets(collectionId?: string | null) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
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

        // Safe mapping to Asset interface
        return (data || []).map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
            file_url: row.file_url,
            asset_type: row.asset_type as AssetType,
            mime_type: row.mime_type,
            source: row.source as any, // Type narrowing if 'manual' | 'upload' etc match
            parent_asset_id: row.parent_asset_id,
            collection_id: row.collection_id,
            instructor_id: row.instructor_id,
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at
        }));
    } catch (e) {
        console.error("Server Action Error:", e);
        return [];
    }
}

export async function uploadFileAsset(formData: FormData, collectionId?: string) {
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) throw new Error('No file provided');

    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Upload to Blob (Safe)
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true, token: process.env.BLOB_READ_WRITE_TOKEN });

    // 2. Extract Text via Doc Engine
    let extractedContent = null;
    let extractedTitle: string | undefined = undefined;

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await extractTextFromFile(buffer, file.type, file.name);

        if (result) {
            extractedContent = result.content;
            extractedTitle = result.title;
        }
    } catch (e) {
        console.warn("Text extraction skipped/failed:", e);
    }

    // 3. Insert to DB
    let assetType: AssetType = 'file';
    if (file.name.toLowerCase().endsWith('.imscc')) {
        assetType = 'cartridge_root';
    } else if (file.type === 'application/pdf' || file.type.includes('word')) {
        assetType = 'document';
    }

    // Smart Title Logic
    const finalTitle = (title === file.name && extractedTitle) ? extractedTitle : (title || extractedTitle || file.name);

    const { error } = await supabase.from('assets' as any).insert({
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
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase.from('assets' as any).insert({
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

export async function deleteAssets(ids: string[]) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('assets' as any)
        .delete()
        .in('id', ids)
        .eq('instructor_id', user.id); // Security check

    if (error) throw error;
    revalidatePath('/instructor/library');
}

export async function deleteAsset(id: string) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('assets' as any)
        .delete()
        .eq('id', id)
        .eq('instructor_id', user.id); // Security check

    if (error) throw error;
    revalidatePath('/instructor/library');
}
