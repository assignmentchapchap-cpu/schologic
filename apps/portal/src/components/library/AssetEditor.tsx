'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';

interface AssetEditorProps {
    initialData?: any;
    onSave: (data: { title: string, content: any }) => Promise<void>;
    onClose: () => void;
}

export default function AssetEditor({ initialData, onSave, onClose }: AssetEditorProps) {
    const ejInstance = useRef<any>(null);
    const initializationRef = useRef(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [title, setTitle] = useState(initialData?.title || '');

    useEffect(() => {
        if (!initializationRef.current) {
            initializationRef.current = true;
            initEditor();
        }
        return () => {
            // Optional cleanup - in strict mode this can cause issues if we destroy too aggressively
        };
    }, []);

    const initEditor = async () => {
        const EditorJS = (await import('@editorjs/editorjs')).default;
        const Header = (await import('@editorjs/header')).default;
        const List = (await import('@editorjs/list')).default;
        const Paragraph = (await import('@editorjs/paragraph')).default;
        const Quote = (await import('@editorjs/quote')).default;

        if (!document.getElementById('editorjs')) return;

        // Cleanup any existing editor instance
        const holder = document.getElementById('editorjs');
        if (holder) holder.innerHTML = '';

        const editor = new EditorJS({
            holder: 'editorjs',
            // logLevel: 'ERROR', 
            data: initialData?.content,
            onReady: () => {
                ejInstance.current = editor;
                setIsReady(true);
            },
            placeholder: 'Start writing your amazing content here...',
            tools: {
                header: {
                    class: Header as any,
                    config: {
                        placeholder: 'Header',
                        levels: [1, 2, 3],
                        defaultLevel: 2
                    }
                },
                list: List as any,
                paragraph: Paragraph as any,
                quote: Quote as any,
            },
        });
    };

    const handleSave = async () => {
        if (ejInstance.current) {
            if (!title.trim()) {
                alert("Please enter a title");
                return;
            }
            setIsSaving(true);
            try {
                const savedData = await ejInstance.current.save();
                await onSave({ title, content: savedData });
            } catch (error) {
                console.error('Saving failed', error);
                alert('Failed to save document.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col relative overflow-hidden h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20 backdrop-blur-sm bg-white/80">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        title="Close Editor"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {isReady ? 'Editor Ready' : 'Initializing...'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !isReady || !title.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Editor Container */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 cursor-text" onClick={() => {
                const editorElement = document.getElementById('editorjs');
                if (editorElement) editorElement.focus();
            }}>
                <div className="max-w-3xl mx-auto bg-white min-h-full shadow-sm border-x border-slate-100/50 py-12 px-8 md:px-12">
                    {/* Title Input */}
                    <input
                        type="text"
                        placeholder="Untitled Document"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-4xl font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 px-0 mb-8 bg-transparent"
                    />

                    {/* EditorJS Block */}
                    <div id="editorjs" className="prose prose-slate prose-lg max-w-none focus:outline-none min-h-[300px]"></div>
                </div>
            </div>
        </div>
    );
}
