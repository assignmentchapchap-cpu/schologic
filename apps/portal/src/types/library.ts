export type AssetType = 'document' | 'file' | 'url' | 'cartridge_root' | 'cartridge_chapter';
export type AssetSource = 'libretexts' | 'ai' | 'upload' | 'manual';
export type AssetFunction = 'reading' | 'assignment' | 'interactive' | 'multimedia';

export interface Asset {
    id: string;
    title: string;
    content: any; // JSONB
    file_url?: string;
    asset_type: AssetType;
    mime_type?: string;
    source: AssetSource;
    function?: AssetFunction;
    parent_asset_id?: string;
    collection_id?: string;
    instructor_id: string;
    created_at: string;
    updated_at: string;
}

export interface Collection {
    id: string;
    title: string;
    description?: string;
    instructor_id: string;
    created_at: string;
}
