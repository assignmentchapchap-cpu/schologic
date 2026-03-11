'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, RefreshCw, X, Save, Eye, Search, Filter } from 'lucide-react';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, type TemplateData } from '@/app/actions/adminEmails';

interface Template {
    id: string;
    name: string;
    subject: string;
    content_html: string;
    variables: string[];
    category: string | null;
    created_at: string;
    updated_at: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Template | null>(null);
    const [creating, setCreating] = useState(false);
    const [previewing, setPreviewing] = useState<Template | null>(null);

    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Form state
    const [form, setForm] = useState<TemplateData>({
        name: '', subject: '', content_html: '', variables: [], category: '',
    });
    const [varInput, setVarInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchTemplates(); }, []);

    async function fetchTemplates() {
        setLoading(true);
        const result = await getTemplates();
        setTemplates(result.data as Template[]);
        setLoading(false);
    }

    function startCreate() {
        setForm({ name: '', subject: '', content_html: '', variables: [], category: '' });
        setVarInput('');
        setCreating(true);
        setEditing(null);
    }

    function startEdit(template: Template) {
        setForm({
            name: template.name,
            subject: template.subject,
            content_html: template.content_html,
            variables: template.variables || [],
            category: template.category || '',
        });
        setVarInput(template.variables?.join(', ') || '');
        setEditing(template);
        setCreating(false);
    }

    async function handleSave() {
        setSaving(true);
        const data: TemplateData = {
            ...form,
            variables: varInput.split(',').map(v => v.trim()).filter(Boolean),
        };

        if (editing) {
            await updateTemplate(editing.id, data);
        } else {
            await createTemplate(data);
        }

        setSaving(false);
        setEditing(null);
        setCreating(false);
        fetchTemplates();
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this template?')) return;
        await deleteTemplate(id);
        fetchTemplates();
    }

    const showForm = creating || editing;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-fuchsia-600" />
                        Email Templates
                    </h1>
                    <p className="text-slate-500 mt-1">{templates.length} templates</p>
                </div>
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                    <button
                        onClick={startCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> New Template
                    </button>
                    <button
                        onClick={fetchTemplates}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Editor Panel */}
            {showForm && (() => {
                const variables = varInput.split(',').map(v => v.trim()).filter(Boolean);
                let previewHtml = form.content_html;
                let previewSubject = form.subject;
                variables.forEach(v => {
                    const pattern = new RegExp(`\\{\\{${v}\\}\\}`, 'g');
                    previewHtml = previewHtml.replace(pattern, `[${v}]`);
                    previewSubject = previewSubject.replace(pattern, `[${v}]`);
                });

                return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-8 grid grid-cols-1 lg:grid-cols-2">
                        {/* LEFT: Code & Config */}
                        <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 flex flex-col min-h-[85vh] h-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editing ? 'Edit Template' : 'Create Template'}
                                </h2>
                                <button
                                    onClick={() => { setEditing(null); setCreating(false); }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 bg-white rounded-lg shadow-sm border border-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g., Pilot Approval"
                                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                                    >
                                        <option value="">None</option>
                                        <option value="transactional">Transactional</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="onboarding">Onboarding</option>
                                        <option value="academic">Academic</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4 shrink-0">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Subject</label>
                                <input
                                    type="text"
                                    value={form.subject}
                                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                                    placeholder='e.g., Welcome to Schologic, {{firstName}}!'
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                                />
                            </div>

                            <div className="mb-4 shrink-0">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                                    Variables <span className="text-[10px] font-normal lowercase tracking-wide text-slate-400">(comma-separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={varInput}
                                    onChange={e => setVarInput(e.target.value)}
                                    placeholder="firstName, pilotUrl"
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                                />
                            </div>

                            <div className="flex-1 flex flex-col min-h-[300px] mb-4">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center justify-between">
                                    <span>HTML Body</span>
                                    <span className="text-[10px] lowercase font-normal text-slate-400 font-mono">live synced</span>
                                </label>
                                <textarea
                                    value={form.content_html}
                                    onChange={e => setForm(p => ({ ...p, content_html: e.target.value }))}
                                    placeholder="<div>Your email template HTML...</div>"
                                    className="flex-1 w-full p-4 border border-slate-200 bg-[#0f172a] text-[#818cf8] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 resize-y min-h-[300px] shadow-inner"
                                    spellCheck={false}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 shrink-0 pt-2">
                                <button
                                    onClick={() => { setEditing(null); setCreating(false); }}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !form.name.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Template'}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: Live Preview */}
                        <div className="bg-slate-100 flex flex-col min-h-[85vh] h-auto">
                            <div className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-slate-400" /> Live Preview
                                </span>
                                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                    Rendering mode
                                </span>
                            </div>
                            <div className="p-4 shrink-0 bg-white border-b border-slate-200/60 shadow-sm">
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold text-slate-400 mr-2">Subject:</span>
                                    <span className="font-medium text-slate-900">{previewSubject || 'No subject set'}</span>
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-[#f8fafc]">
                                <div className="bg-white w-full max-w-xl rounded-xl shadow border border-slate-200 overflow-hidden h-fit min-h-full">
                                    <div className="bg-slate-50 border-b border-slate-100 py-2.5 px-4 flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                        <span className="ml-3 text-xs font-semibold text-slate-400">Email Client Rendering</span>
                                    </div>
                                    <div
                                        className="p-6 text-slate-900 min-h-[400px]"
                                        dangerouslySetInnerHTML={{ __html: previewHtml || '<div style="color:#94a3b8;font-style:italic;text-align:center;padding:40px;">Template is empty</div>' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Template List Controls */}
            {!showForm && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search templates by name or subject..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="relative w-full sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none bg-white"
                        >
                            <option value="">All Categories</option>
                            <option value="transactional">Transactional</option>
                            <option value="marketing">Marketing</option>
                            <option value="onboarding">Onboarding</option>
                            <option value="academic">Academic</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Template List */}
            <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${showForm ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                    </div>
                ) : templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <BookOpen className="w-10 h-10 mb-3" />
                        <p className="font-semibold">No templates</p>
                        <p className="text-xs mt-1">Create your first email template</p>
                    </div>
                ) : (() => {
                    const filtered = templates.filter(t => {
                        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.subject?.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesCat = categoryFilter ? t.category === categoryFilter : true;
                        return matchesSearch && matchesCat;
                    });

                    if (filtered.length === 0) {
                        return (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Search className="w-8 h-8 mb-3 opacity-50" />
                                <p className="font-semibold">No templates found</p>
                            </div>
                        );
                    }

                    return (
                        <div className="divide-y divide-slate-100">
                            {filtered.map(template => (
                                <div
                                    key={template.id}
                                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-800">{template.name}</p>
                                            {template.category && (
                                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {template.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                                            Subject: {template.subject}
                                        </p>
                                        {template.variables?.length > 0 && (
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Variables: {template.variables.map(v => `{{${v}}}`).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-4">
                                        <button
                                            onClick={() => setPreviewing(template)}
                                            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Preview"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => startEdit(template)}
                                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>

            {/* Preview Modal */}
            {previewing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Preview: {previewing.name}</h3>
                            <button onClick={() => setPreviewing(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1">
                            <p className="text-sm text-slate-500 mb-3">
                                <strong>Subject:</strong> {previewing.subject}
                            </p>
                            <div
                                className="prose prose-sm max-w-none border border-slate-200 rounded-xl p-4"
                                dangerouslySetInnerHTML={{ __html: previewing.content_html }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
