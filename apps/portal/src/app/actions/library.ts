'use server';

import { createSessionClient, Database } from "@schologic/database";
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Asset, AssetType, AssetSource } from '@/types/library';
import { AssetContent } from '@/types/json-schemas';
import { extractTextFromFile, ParseResult } from '@schologic/doc-engine';
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
            console.error("DB Error:", JSON.stringify(error, null, 2));
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
            source: row.source as AssetSource,
            parent_asset_id: row.parent_asset_id,
            collection_id: row.collection_id,
            instructor_id: row.instructor_id,
            created_at: row.created_at || new Date().toISOString()
        }));
    } catch (e) {
        console.error("Server Action Error:", e);
        return [];
    }
}

export async function uploadFileAsset(formData: FormData, collectionId?: string) {
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) return { error: 'No file provided' };

    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Demo Limit Check (Max 3 Files)
    if (user.user_metadata?.is_demo) {
        const { count, error: countErr } = await supabase
            .from('assets')
            .select('*', { count: 'exact', head: true })
            .eq('instructor_id', user.id);

        // The user specifically requested this exact message
        if (!countErr && (count || 0) >= 3) {
            return { error: "You have exceeded the maximum allowed uploads in demo account. Upgrade to continue." };
        }
    }

    // Quota Check (20MB Limit for Instructor)
    const { data: assets, error: quotaErr } = await supabase
        .from('assets')
        .select('size_bytes' as any)
        .eq('instructor_id', user.id);

    if (!quotaErr && assets) {
        // Explicitly cast to handle potential type mismatch during build
        const typedAssets = assets as unknown as { size_bytes: number | null }[];
        const totalSize = typedAssets.reduce((acc, curr) => acc + (curr.size_bytes || 0), 0);
        if (totalSize + file.size > 20 * 1024 * 1024) {
            return { error: `Storage quota exceeded. You have used ${(totalSize / 1024 / 1024).toFixed(2)}MB of 20MB.` };
        }
    }

    try {
        const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true, token: process.env.BLOB_READ_WRITE_TOKEN });

        // 2. Extract Text via Doc Engine
        let extractedContent = null;
        let extractedTitle: string | undefined = undefined;

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const result: ParseResult | null = await extractTextFromFile(buffer, file.type, file.name);

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

        const { error } = await supabase.from('assets').insert({
            title: finalTitle,
            file_url: blob.url,
            content: extractedContent,
            asset_type: assetType,
            mime_type: file.type,
            source: 'upload',
            collection_id: collectionId || null,
            instructor_id: user.id,
            size_bytes: file.size
        });

        if (error) {
            console.error("DB Insert Error:", error);
            return { error: "Failed to save file metadata." };
        }

    } catch (error: any) {
        console.error("Upload Error:", error);
        return { error: error.message || "Failed to upload file." };
    }

    revalidatePath('/instructor/library');
    return { success: true };
}

export async function createManualAsset(title: string, content: AssetContent | string, collectionId?: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Unauthorized' };

        const { error } = await supabase.from('assets').insert({
            title,
            content: content as unknown as Database['public']['Tables']['assets']['Row']['content'],
            asset_type: 'document',
            source: 'manual',
            collection_id: collectionId || null,
            instructor_id: user.id
        });

        if (error) throw error;
        revalidatePath('/instructor/library');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Failed to create asset' };
    }
}

export async function deleteAssets(ids: string[]) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Unauthorized' };

        const { error } = await supabase
            .from('assets')
            .delete()
            .in('id', ids)
            .eq('instructor_id', user.id); // Security check

        if (error) throw error;
        revalidatePath('/instructor/library');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Failed to delete assets' };
    }
}

export async function deleteAsset(id: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Unauthorized' };

        const { error } = await supabase
            .from('assets')
            .delete()
            .eq('id', id)
            .eq('instructor_id', user.id); // Security check

        if (error) throw error;
        revalidatePath('/instructor/library');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Failed to delete asset' };
    }
}

export async function renameAsset(id: string, newTitle: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Unauthorized' };

        const { error } = await supabase
            .from('assets')
            .update({ title: newTitle })
            .eq('id', id)
            .eq('instructor_id', user.id); // Security check

        if (error) throw error;
        revalidatePath('/instructor/library');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Failed to rename asset' };
    }
}

export async function getInstructorClasses() {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('classes')
            .select('id, name')
            .eq('instructor_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(c => ({ id: c.id, title: c.name }));
    } catch (e) {
        console.error("Fetch Classes Error:", e);
        return [];
    }
}

export async function distributeAssetToClass(assetId: string, classId: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createSessionClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Unauthorized' };

        // Verify ownership of class (optional but good practice, though RLS handles it usually)
        // Insert into class_assets
        const { error } = await supabase
            .from('class_assets')
            .insert({
                class_id: classId,
                asset_id: assetId
            });

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return { error: 'Asset is already added to this class.' };
            }
            throw error;
        }

        revalidatePath(`/instructor/class/${classId}`); // Revalidate the target class page
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Failed to add asset to class' };
    }
}
