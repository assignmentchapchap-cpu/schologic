'use client';

import { Asset } from '@/types/library';
import { FileText, Link as LinkIcon, File, Layers, MoreVertical, Trash2, Download, CheckSquare, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface AssetCardProps {
    asset: Asset;
    onDelete: (id: string) => void;
    isSelected: boolean;
    isSelectionMode: boolean; // New prop
    onToggleSelect: (id: string) => void;
    onRename: (id: string) => void;
    onRead: (asset: Asset) => void; // New prop for Universal Reader
}

export default function AssetCard({ asset, onDelete, isSelected, isSelectionMode, onToggleSelect, onRename, onRead }: AssetCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [imageError, setImageError] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuAction = (action: 'view' | 'download' | 'select' | 'delete' | 'rename') => {
        setShowMenu(false);
        switch (action) {
            case 'view':
                if (onRead && (asset.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || asset.mime_type === 'application/pdf' || asset.asset_type === 'cartridge_root')) {
                    onRead(asset);
                } else if (asset.file_url) {
                    window.open(asset.file_url, '_blank');
                }
                break;
            case 'download':
                if (asset.file_url) window.open(asset.file_url, '_blank');
                break;
            case 'select':
                onToggleSelect(asset.id);
                break;
            case 'delete':
                onDelete(asset.id);
                break;
            case 'rename':
                onRename(asset.id);
                break;
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
            className={`bg-white p-4 rounded-xl border transition-all group relative ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md bg-indigo-50/10' : 'border-slate-200 shadow-sm hover:shadow-md'}`}
        >
            {/* Top Row */}
            <div className="flex items-start justify-between mb-3 relative">
                <div className="flex items-start gap-3">
                    {/* Checkbox: Visible if Selected, in Selection Mode, or Hovered */}
                    <div
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(asset.id); }}
                        className={`
                            absolute -left-2 -top-2 z-10 cursor-pointer
                            ${isSelectionMode || isSelected ? 'opacity-100 visible' : 'opacity-0 invisible'}
                            transition-all duration-200
                        `}
                    >
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shadow-sm ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 hover:border-indigo-400'}`}>
                            {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                        </div>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                        {getIcon()}
                    </div>
                </div>

                {/* Ellipsis Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            <div className="p-1">
                                <button onClick={() => handleMenuAction('view')} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-slate-400" /> View
                                </button>
                                {asset.file_url && (
                                    <button onClick={() => handleMenuAction('download')} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                                        <Download className="w-4 h-4 text-slate-400" /> Download
                                    </button>
                                )}
                                <button onClick={() => handleMenuAction('select')} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-slate-400" /> {isSelected ? 'Deselect' : 'Select'}
                                </button>
                                <button onClick={() => handleMenuAction('rename')} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" /> Rename
                                </button>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button onClick={() => handleMenuAction('delete')} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div
                onClick={() => {
                    if (onRead && (asset.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || asset.mime_type === 'application/pdf' || asset.asset_type === 'cartridge_root')) {
                        onRead(asset);
                    } else if (asset.file_url) {
                        window.open(asset.file_url, '_blank');
                    }
                }}
                className="cursor-pointer"
            >
                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 min-h-[40px]" title={asset.title || ''}>
                    {asset.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded capitalize">{asset.asset_type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span suppressHydrationWarning>{new Date(asset.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
