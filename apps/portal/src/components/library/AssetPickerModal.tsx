'use client';

import { useState, useEffect } from 'react';
import { Asset } from '@/types/library';
import { getAssets } from '@/app/actions/library';
import AssetCard from './AssetCard';
import { Search, X, Loader2 } from 'lucide-react';

interface AssetPickerModalProps {
    onClose: () => void;
    onSelect: (asset: Asset) => void;
}

export default function AssetPickerModal({ onClose, onSelect }: AssetPickerModalProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const data = await getAssets();
            setAssets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(a =>
        (a.title || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (asset: Asset) => {
        onSelect(asset);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Select from Library</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search your library..."
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin" /> Loading assets...
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <p>No assets found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredAssets.map(asset => (
                                <div
                                    key={asset.id}
                                    onClick={() => handleSelect(asset)}
                                    className="cursor-pointer transition-transform hover:scale-[1.02]"
                                >
                                    {/* Simplified Card wrapper that disables internal actions */}
                                    <div className="pointer-events-none">
                                        <AssetCard
                                            asset={asset}
                                            isSelected={false}
                                            isSelectionMode={false}
                                            onDelete={() => { }}
                                            onToggleSelect={() => { }}
                                            onRename={() => { }}
                                            onRead={() => { }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
