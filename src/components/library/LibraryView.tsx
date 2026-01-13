'use client';

import { BookOpen, Search, Plus, Loader2, FileText, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Asset } from '@/types/library';
import AssetCard from './AssetCard';
import AssetUploader from './AssetUploader';
import { getAssets, createManualAsset } from '@/app/actions/library';
import dynamic from 'next/dynamic';

const AssetEditor = dynamic(() => import('./AssetEditor'), {
    ssr: false,
    loading: () => <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
});

interface LibraryViewProps {
    initialAssets: Asset[];
}

export default function LibraryView({ initialAssets }: LibraryViewProps) {
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [search, setSearch] = useState('');

    const refresh = async () => {
        const data = await getAssets();
        setAssets(data);
    };

    const handleSaveManual = async ({ title, content }: { title: string, content: any }) => {
        try {
            await createManualAsset(title, content);
            setIsEditorOpen(false);
            await refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to save");
        }
    };

    const filtered = assets.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
            {/* Header / Toolbar */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 transition-shadow shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 leading-none">Library</h1>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Manage course resources</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditorOpen(true)}
                            className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            Write
                        </button>
                        <button
                            onClick={() => setIsUploaderOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm shadow-indigo-200"
                        >
                            <Plus className="w-4 h-4" />
                            Add Asset
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
                {assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">My Library</h3>
                        <p className="text-slate-500">No assets yet. Upload a file to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(asset => (
                            <AssetCard
                                key={asset.id}
                                asset={asset}
                                onClick={(a) => {
                                    if (a.file_url) window.open(a.file_url, '_blank');
                                    if (a.source === 'manual') alert("Preview logic coming soon: " + a.title);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {isUploaderOpen && (
                <AssetUploader
                    onClose={() => setIsUploaderOpen(false)}
                    onUploadComplete={refresh}
                />
            )}

            {isEditorOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl h-[90vh] flex flex-col">
                        <div className="bg-white rounded-xl shadow-2xl relative flex flex-col h-full overflow-hidden">
                            {/* Close button removed from here, now inside AssetEditor */}
                            <div className="flex-1 overflow-y-auto">
                                <AssetEditor
                                    onSave={handleSaveManual}
                                    onClose={() => setIsEditorOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
