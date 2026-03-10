'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, RefreshCw, X, Save, Eye } from 'lucide-react';
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
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">
                            {editing ? 'Edit Template' : 'Create Template'}
                        </h2>
                        <button
                            onClick={() => { setEditing(null); setCreating(false); }}
                            className="p-1.5 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g., Pilot Approval"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="">None</option>
                                <option value="transactional">Transactional</option>
                                <option value="marketing">Marketing</option>
                                <option value="onboarding">Onboarding</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Subject</label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                            placeholder='e.g., Welcome to Schologic, {{firstName}}!'
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
                            Variables (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={varInput}
                            onChange={e => setVarInput(e.target.value)}
                            placeholder="firstName, institution, email"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Use <code className="bg-slate-100 px-1 rounded">{'{{variableName}}'}</code> in the subject and body.
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">HTML Body</label>
                        <textarea
                            value={form.content_html}
                            onChange={e => setForm(p => ({ ...p, content_html: e.target.value }))}
                            placeholder="<div>Your email template HTML...</div>"
                            rows={12}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={() => { setEditing(null); setCreating(false); }}
                            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !form.name.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </div>
            )}

            {/* Template List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                ) : (
                    <div className="divide-y divide-slate-100">
                        {templates.map(template => (
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
                )}
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
