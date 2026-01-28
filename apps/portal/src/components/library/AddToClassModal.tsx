'use client';

import { useState, useEffect } from 'react';
import { getInstructorClasses, distributeAssetToClass } from '@/app/actions/library';
import { useToast } from '@/context/ToastContext';
import { X, Check, BookOpen, Loader2 } from 'lucide-react';

interface AddToClassModalProps {
    onClose: () => void;
    assetId: string;
    assetTitle: string;
}

export default function AddToClassModal({ onClose, assetId, assetTitle }: AddToClassModalProps) {
    const [classes, setClasses] = useState<{ id: string, title: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<string | null>(null); // Class ID being submitted
    const { showToast } = useToast();

    useEffect(() => {
        getInstructorClasses().then(data => {
            setClasses(data);
            setLoading(false);
        });
    }, []);

    const handleAddToClass = async (classId: string) => {
        setSubmitting(classId);
        try {
            const res = await distributeAssetToClass(assetId, classId);
            if (res.error) {
                showToast(res.error, 'error');
            } else {
                showToast(`Added '${assetTitle || 'Asset'}' to class`, 'success');
                // Optional: We could close immediately or let them add to multiple classes
                // Let's keep it open to allow multiple additions, but show visual feedback?
                // Actually, "Add to Class" implies a single action usually, but "Distribute" implies multiple.
                // Let's close for now to be simple, or maybe just show success tick.
                onClose();
            }
        } catch (e: any) {
            showToast(e.message || 'Failed to add', 'error');
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Add to Class</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    <p className="text-sm text-slate-500 mb-4 font-medium">
                        Select a class to add <span className="font-bold text-slate-900">"{assetTitle}"</span> to:
                    </p>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p className="font-bold">No classes found.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {classes.map(cls => (
                                <button
                                    key={cls.id}
                                    onClick={() => handleAddToClass(cls.id)}
                                    disabled={!!submitting}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-slate-700 group-hover:text-indigo-900">{cls.title}</span>
                                    </div>
                                    {submitting === cls.id ? (
                                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4 text-transparent group-hover:text-indigo-400 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
