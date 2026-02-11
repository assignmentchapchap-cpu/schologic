'use client';

import { useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { createManualAsset } from '@/app/actions/library';
import { useToast } from '@/context/ToastContext';

interface AssetEditorProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssetEditor({ onClose, onSuccess }: AssetEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) return;
        setSaving(true);
        try {
            await createManualAsset(title, content);
            showToast('Asset Created Successfully', 'success');
            onSuccess();
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Failed to create asset';
            showToast(message, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Create New Asset</h2>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Lecture Notes: Chapter 1"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    />
                </div>

                <div className="flex-1 flex flex-col min-h-[200px]">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Type or paste your content here..."
                        className="w-full flex-1 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving || !title.trim() || !content.trim()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Asset
                </button>
            </div>
        </div>
    );
}
