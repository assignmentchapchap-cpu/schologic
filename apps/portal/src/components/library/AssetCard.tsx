'use client';

import { Asset } from '@/types/library';
import { FileText, Link as LinkIcon, BookOpen, MoreVertical, File } from 'lucide-react';

interface AssetCardProps {
    asset: Asset;
    onClick?: (asset: Asset) => void;
}

export default function AssetCard({ asset, onClick }: AssetCardProps) {
    const getIcon = () => {
        switch (asset.asset_type) {
            case 'url': return <LinkIcon className="w-5 h-5 text-blue-500" />;
            case 'cartridge_root': return <BookOpen className="w-5 h-5 text-indigo-500" />;
            case 'document': return <FileText className="w-5 h-5 text-emerald-500" />;
            default: return <File className="w-5 h-5 text-slate-500" />;
        }
    };

    const formatMimeType = (mime?: string) => {
        if (!mime) return 'FILE';
        if (mime.includes('pdf')) return 'PDF';
        if (mime.includes('wordprocessingml') || mime.includes('msword')) return 'DOCX';
        if (mime.includes('spreadsheet')) return 'XLSX';
        if (mime.includes('presentation')) return 'PPTX';
        if (mime.includes('plain')) return 'TXT';
        if (mime.includes('image')) return 'IMG';
        return mime.split('/').pop()?.toUpperCase().substring(0, 4) || 'FILE';
    };

    return (
        <div
            onClick={() => onClick?.(asset)}
            className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col gap-3 min-h-[140px]"
        >
            <div className="flex items-start justify-between">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    {getIcon()}
                </div>
                {/* Badges Container - positioned relative to card, not overlapping title */}
                <div className="flex flex-col items-end gap-1">
                    {/* Phase 4 Verification: Show badge if text was extracted */}
                    {asset.content && (
                        <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-emerald-200" title="Text Content Extracted & Indexed">
                            INDEXED
                        </div>
                    )}
                    {/* Type Badge */}
                    <div className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        {asset.asset_type === 'document' ? 'DOC' :
                            asset.asset_type === 'cartridge_root' ? 'E-BOOK' :
                                formatMimeType(asset.mime_type)}
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight" title={asset.title}>
                    {asset.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <span className="truncate max-w-[100px]">{asset.source}</span>
                    <span>•</span>
                    <span suppressHydrationWarning>{new Date(asset.created_at).toLocaleDateString()}</span>
                </p>
            </div>
        </div>
    );
}
