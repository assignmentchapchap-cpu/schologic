'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFileAsset } from '@/app/actions/library';
import { useToast } from '@/context/ToastContext';

interface AssetUploaderProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssetUploader({ onClose, onSuccess }: AssetUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB Limit
                setError("File exceeds the 5MB limit.");
                showToast("File exceeds the 5MB limit.", 'error');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name); // Default title to filename

        try {
            await uploadFileAsset(formData);
            showToast('File uploaded successfully', 'success');
            onSuccess();
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Upload failed';
            setError(message);
            showToast(message, 'error'); // Show specific error
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Upload File</h2>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
                    >
                        <div className="p-4 bg-slate-100 rounded-full group-hover:bg-white mb-4 transition-colors shadow-sm">
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="font-bold text-slate-700 mb-1">Click to browse</p>
                        <p className="text-xs text-slate-500">PDF, DOCX, TXT, or IMSCC</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.txt,.imscc" // Limit types if strictly needed
                            onChange={handleFileSelect}
                        />
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                        <button
                            onClick={() => setFile(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                                <File className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1 break-all line-clamp-2">{file.name}</h3>
                            <p className="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-1 rounded w-fit">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-100">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Upload File'}
                </button>
            </div>
        </div>
    );
}
