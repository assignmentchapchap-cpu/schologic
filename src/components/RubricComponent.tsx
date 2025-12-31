'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Edit2, Check, X, Trash2, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

type RubricItem = {
    criterion: string;
    points: number;
    levels: { score: number; description: string }[]; // Keeping simple for now
};

export default function RubricComponent({
    rubric,
    isEditable = false,
    assignmentId,
    maxPoints,
    onUpdate,
    title,
    description
}: {
    rubric: RubricItem[],
    isEditable?: boolean,
    assignmentId?: string,
    maxPoints?: number,
    onUpdate?: () => void,
    title?: string,
    description?: string
}) {
    const supabase = createClient();
    const { showToast } = useToast();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [localRubric, setLocalRubric] = useState<RubricItem[]>(rubric || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    useEffect(() => {
        setLocalRubric(rubric || []);
    }, [rubric]);

    const handleRegenerate = async () => {
        if (!title || !maxPoints) return;

        // Only warn if overwriting existing
        if (localRubric.length > 0) {
            if (!confirm("Are you sure? This will OVERWRITE the current rubric with a new AI-generated one based on the assignment details.")) {
                return;
            }
        }

        setIsRegenerating(true);
        try {
            const res = await fetch('/api/rubric/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: description || '',
                    max_points: maxPoints
                })
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || "Generation failed");
            }

            const data = await res.json();
            if (data.rubric) {
                await handleSave(data.rubric); // Save directly to DB
                showToast("Rubric Generated!", 'success');
            }
        } catch (error: any) {
            console.error("Regeneration Error:", error);
            showToast("Generation failed: " + error.message, 'error');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleSave = async (newRubric: RubricItem[]) => {
        setIsSaving(true);
        // Validate Sum
        const total = newRubric.reduce((sum, item) => sum + (Number(item.points) || 0), 0);
        if (maxPoints && total !== maxPoints) {
            alert(`Warning: Total points (${total}) does not match Assignment Max Points (${maxPoints})`);
            // We allow it but warn
        }

        const { error } = await supabase
            .from('assignments')
            .update({ rubric: newRubric })
            .eq('id', assignmentId);

        if (!error) {
            setLocalRubric(newRubric);
            setEditingIndex(null);
            if (onUpdate) onUpdate();
        } else {
            alert('Failed to save rubric');
        }
        setIsSaving(false);
    };

    if (!localRubric || localRubric.length === 0) {
        if (isEditable) {
            return (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-2">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-bold mb-1">No Rubric Designed</h3>
                        <p className="text-slate-500 text-sm">Create a grading criteria to evaluate submissions consistently.</p>
                    </div>
                    {title && maxPoints && (
                        <button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isRegenerating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Designing Rubric...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate with AI
                                </>
                            )}
                        </button>
                    )}
                </div>
            );
        }
        return null;
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" /> Grading Rubric
                    </h3>
                    {isEditable && title && (
                        <button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                            {isRegenerating ? 'Designing...' : 'Regenerate'}
                        </button>
                    )}
                </div>
                {isEditable && (
                    <span className="text-xs font-mono text-slate-400">
                        Total: {localRubric.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0)} / {maxPoints}
                    </span>
                )}
            </div>

            <div className="divide-y divide-slate-100">
                {localRubric.map((item, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors group">
                        {editingIndex === idx ? (
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <input
                                        className="flex-1 p-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700"
                                        value={item.criterion}
                                        onChange={(e) => {
                                            const copy = [...localRubric];
                                            copy[idx].criterion = e.target.value;
                                            setLocalRubric(copy); // Optimistic update for input
                                        }}
                                    />
                                    <input
                                        type="number"
                                        className="w-20 p-2 border border-slate-300 rounded-lg text-sm font-bold text-right"
                                        value={item.points}
                                        onChange={(e) => {
                                            const copy = [...localRubric];
                                            copy[idx].points = parseInt(e.target.value) || 0;
                                            setLocalRubric(copy);
                                        }}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setLocalRubric(rubric)} // Cancel
                                        className="p-1 px-3 text-xs font-bold text-slate-500 bg-slate-100 rounded hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSave(localRubric)}
                                        className="p-1 px-3 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700 text-sm">{item.criterion}</span>
                                        {isEditable && (
                                            <button
                                                onClick={() => setEditingIndex(idx)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-indigo-600 transition-all"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        {item.levels && item.levels[0]?.description}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                                    <span className="font-bold text-slate-700 text-xs">{item.points}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">pts</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
