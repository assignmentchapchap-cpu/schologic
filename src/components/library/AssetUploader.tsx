'use client';

import { useState } from 'react';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { uploadFileAsset } from '@/app/actions/library';

interface AssetUploaderProps {
    onClose: () => void;
    onUploadComplete: () => void;
}

export default function AssetUploader({ onClose, onUploadComplete }: AssetUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const MAX_SIZE_MB = 1; // User defined limit

    const handleFileSelect = (file: File) => {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File is too large (maximum file size: ${MAX_SIZE_MB} MB)`);
            setFile(null);
            setTitle('');
            return;
        }
        setError(null);
        setFile(file);
        setTitle(file.name);
    };

    const handleSubmit = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title || file.name);

            await uploadFileAsset(formData);
            onUploadComplete();
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
            setError("Upload failed. The server might have rejected the file size or type.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Upload File</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${error ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}>
                        <input
                            type="file"
                            id="file"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileSelect(f);
                            }}
                        />
                        <label htmlFor="file" className="cursor-pointer text-center w-full">
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                                    <span className="text-sm font-bold text-slate-700 break-all">{file.name}</span>
                                    <span className="text-xs text-slate-400">Click to change</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className={`w-8 h-8 mb-2 ${error ? 'text-red-400' : 'text-slate-400'}`} />
                                    <span className={`text-sm font-bold ${error ? 'text-red-600' : 'text-slate-600'}`}>
                                        {error ? 'File Too Large' : 'Click to Select File'}
                                    </span>
                                    <span className={`text-xs ${error ? 'text-red-500' : 'text-slate-400'}`}>
                                        {error ? `Max size: ${MAX_SIZE_MB}MB` : 'PDF, DOCX (Max 4.5MB)'}
                                    </span>
                                </div>
                            )}
                        </label>
                    </div>

                    {error && (
                        <div className="text-xs text-red-600 font-medium text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            placeholder="Display Title"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!file || isUploading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload Asset'}
                    </button>
                </div>
            </div>
        </div>
    );
}
