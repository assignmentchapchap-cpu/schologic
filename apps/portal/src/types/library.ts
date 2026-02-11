
export type AssetType = 'document' | 'file' | 'url' | 'cartridge_root' | 'cartridge_chapter';
export type AssetSource = 'libretexts' | 'ai' | 'upload' | 'manual';
export type AssetFunction = 'reading' | 'assignment' | 'interactive' | 'multimedia';

import { AssetContent } from './json-schemas';

export interface Asset {
    id: string;
    title: string | null;
    content: unknown; // JSONB - use type guards when consuming
    file_url: string | null;
    asset_type: AssetType;
    mime_type: string | null;
    source: AssetSource;
    // function property removed as it does not exist in DB
    parent_asset_id: string | null;
    collection_id: string | null;
    instructor_id: string | null;
    created_at: string;
    updated_at?: string | null;
}

export interface Collection {
    id: string;
    title: string;
    description?: string;
    instructor_id: string;
    created_at: string;
}
