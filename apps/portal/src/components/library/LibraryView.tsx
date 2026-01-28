'use client';

import { useState } from 'react';
import { Asset } from '@/types/library';
import AssetCard from './AssetCard';
import AssetUploader from './AssetUploader';
import { useReader } from '@/context/UniversalReaderContext';
import AssetEditor from './AssetEditor';
import AddToClassModal from './AddToClassModal';
import ConfirmDialog from '../ConfirmDialog';
import { Plus, Upload, FileText, Search, Grid, List, Trash2 } from 'lucide-react';
import { deleteAsset, deleteAssets, renameAsset } from '@/app/actions/library'; // We will create this
import { useToast } from '@/context/ToastContext';

interface LibraryViewProps {
    initialAssets: Asset[];
}

export default function LibraryView({ initialAssets }: LibraryViewProps) {
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'document' | 'cartridge'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Modals
    const [showUpload, setShowUpload] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

    const { showToast } = useToast();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Rename State
    const [assetToRename, setAssetToRename] = useState<{ id: string, title: string } | null>(null);
    const [newTitle, setNewTitle] = useState('');

    // Add to Class State
    const [assetToAddToClass, setAssetToAddToClass] = useState<{ id: string, title: string } | null>(null);

    // Global Reader
    const { openReader } = useReader();

    // Filter Logic
    const filteredAssets = assets.filter(a => {
        const matchesSearch = (a.title || '').toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all'
            ? true
            : filterType === 'cartridge'
                ? (a.asset_type === 'cartridge_root' || a.asset_type === 'cartridge_chapter')
                : a.asset_type === filterType;
        return matchesSearch && matchesType;
    });

    const requestDelete = (id: string) => {
        setAssetToDelete(id);
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const confirmBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setAssetToDelete('BULK_DELETE_FLAG'); // Special flag or use a separate state. Let's use separate state for clarity or misuse this.
        // Actually, let's keep it simple. use assetToDelete logic but check if it matches the flag.
    };

    // Better: separate state or just use assetToDelete='bulk' 

    const startRename = (id: string) => {
        const asset = assets.find(a => a.id === id);
        if (asset) {
            const safeTitle = asset.title || '';
            setAssetToRename({ id, title: safeTitle });
            setNewTitle(safeTitle);
        }
    };

    const executeRename = async () => {
        if (!assetToRename || !newTitle.trim()) return;
        try {
            const res = await renameAsset(assetToRename.id, newTitle);
            if (res && res.error) {
                showToast(res.error, 'error');
                return;
            }
            setAssets(prev => prev.map(a => a.id === assetToRename.id ? { ...a, title: newTitle } : a));
            showToast('Asset renamed', 'success');
            setAssetToRename(null);
        } catch (e: any) {
            showToast(e.message || 'Failed to rename asset', 'error');
        }
    };

    const executeDelete = async () => {
        try {
            if (assetToDelete === 'BULK_DELETE_FLAG') {
                const res = await deleteAssets(Array.from(selectedIds));
                if (res && res.error) throw new Error(res.error);

                setAssets(prev => prev.filter(a => !selectedIds.has(a.id)));
                setSelectedIds(new Set());
                showToast(`${selectedIds.size} assets deleted`, 'success');
            } else if (assetToDelete) {
                const res = await deleteAsset(assetToDelete);
                if (res && res.error) throw new Error(res.error);

                setAssets(prev => prev.filter(a => a.id !== assetToDelete));
                showToast('Asset deleted', 'success');
            }
        } catch (e: any) {
            showToast(e.message || 'Failed to delete asset(s)', 'error');
        } finally {
            setAssetToDelete(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

                {/* Search & Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search library..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700 placeholder:font-medium"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value as 'all' | 'document' | 'cartridge')}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Types</option>
                        <option value="document">Documents</option>
                        <option value="cartridge">Cartridges</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={confirmBulkDelete}
                            className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 animate-scale-in"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete ({selectedIds.size})</span>
                        </button>
                    )}

                    {!selectedIds.size && (
                        <>
                            <button
                                onClick={() => setShowEditor(true)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Create Doc</span>
                            </button>
                            <button
                                onClick={() => setShowUpload(true)}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> <span>Upload</span>
                            </button>
                        </>
                    )}

                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Toggle View"
                    >
                        {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Content Grid/List */}
            {filteredAssets.length > 0 ? (
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}`}>
                    {filteredAssets.map(asset => (
                        <AssetCard
                            key={asset.id}
                            asset={asset}
                            onDelete={requestDelete}
                            isSelected={selectedIds.has(asset.id)}
                            isSelectionMode={selectedIds.size > 0}
                            onToggleSelect={toggleSelect}
                            onRename={startRename}
                            onAddToClass={(id) => {
                                const asset = assets.find(a => a.id === id);
                                if (asset) setAssetToAddToClass({ id, title: asset.title || '' });
                            }}
                            onRead={openReader}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-bold text-slate-500">No assets found</p>
                    <p className="text-sm">Try uploading a file or creating a document.</p>
                </div>
            )}

            {/* Rename Modal */}
            {assetToRename && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Rename Asset</h3>
                        <input
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700 mb-4"
                            placeholder="Enter new title"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && executeRename()}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setAssetToRename(null)}
                                className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeRename}
                                disabled={!newTitle.trim() || newTitle === assetToRename.title}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals - Simplified overlays for now */}
            {(showUpload || showEditor) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 min-h-[400px] flex flex-col">
                        {showUpload && <AssetUploader onClose={() => setShowUpload(false)} onSuccess={() => window.location.reload()} />}
                        {showEditor && <AssetEditor onClose={() => setShowEditor(false)} onSuccess={() => window.location.reload()} />}
                    </div>
                </div>
            )}

            {assetToAddToClass && (
                <AddToClassModal
                    assetId={assetToAddToClass.id}
                    assetTitle={assetToAddToClass.title}
                    onClose={() => setAssetToAddToClass(null)}
                />
            )}



            <ConfirmDialog
                isOpen={!!assetToDelete}
                title={assetToDelete === 'BULK_DELETE_FLAG' ? `Delete ${selectedIds.size} Assets?` : "Delete Asset"}
                message={assetToDelete === 'BULK_DELETE_FLAG'
                    ? `Are you sure you want to delete these ${selectedIds.size} assets? This action cannot be undone.`
                    : "Are you sure you want to delete this asset? This action cannot be undone."}
                strConfirm="Delete"
                strCancel="Cancel"
                onConfirm={executeDelete}
                onCancel={() => setAssetToDelete(null)}
            />
        </div>
    );
}
