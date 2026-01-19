'use client';

import { Asset } from '@/types/library';
import { FileText, Link as LinkIcon, File, Trash2, Layers, BookOpen, MoreVertical, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AssetCardProps {
    asset: Asset;
    onDelete: (id: string) => void;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}

export default function AssetCard({ asset, onDelete, isSelected, onToggleSelect }: AssetCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        // if (!confirm('Are you sure you want to delete this asset?')) return; // Removed
        // setIsDeleting(true); // Handled by parent
        try {
            await onDelete(asset.id); // Just request delete
        } catch (e) {
            // setIsDeleting(false);
        }
    };

    const getIcon = () => {
        switch (asset.asset_type) {
            case 'document': return <FileText className="w-8 h-8 text-blue-500" />;
            case 'url': return <LinkIcon className="w-8 h-8 text-indigo-500" />;
            case 'cartridge_root': return <Layers className="w-8 h-8 text-orange-500" />;
            default: return <File className="w-8 h-8 text-slate-400" />;
        }
    };

    return (
        <div
            onClick={() => onToggleSelect(asset.id)}
            className={`bg-white p-4 rounded-xl border transition-all group relative cursor-pointer ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md'}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'opacity-100 bg-indigo-600 border-indigo-600' : 'opacity-0 group-hover:opacity-100 bg-white border-slate-300 group-hover:border-indigo-400'}`}
                    >
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-[1px]" />}
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors -mt-1">
                        {getIcon()}
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        disabled={isDeleting}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Asset"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 min-h-[40px]" title={asset.title || ''}>
                {asset.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <span className="bg-slate-100 px-2 py-0.5 rounded capitalize">{asset.asset_type.replace('_', ' ')}</span>
                <span>•</span>
                <span suppressHydrationWarning>{new Date(asset.created_at).toLocaleDateString()}</span>
            </div>

            {asset.file_url && (
                <a
                    href={asset.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block w-full text-center py-2 bg-slate-50 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-100 transition-colors"
                >
                    View / Download
                </a>
            )}
            {!asset.file_url && asset.asset_type === 'document' && (
                <div className="block w-full text-center py-2 bg-slate-50 text-slate-400 font-bold text-xs rounded-lg cursor-default">
                    Text Content
                </div>
            )}
        </div>
    );
}
