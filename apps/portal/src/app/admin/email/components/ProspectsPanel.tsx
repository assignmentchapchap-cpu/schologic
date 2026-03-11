'use client';

import { useState, useEffect } from 'react';
import { Search, Upload, Trash2, Globe, MapPin, Loader2, Plus } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { getProspects, deleteProspects, bulkImportProspects, createProspect, type ProspectPayload } from '@/app/actions/prospects';

interface ProspectsPanelProps {
    listId: string;
    listName: string;
}

export function ProspectsPanel({ listId, listName }: ProspectsPanelProps) {
    const [prospects, setProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set());

    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);

    // Manual Entry state
    const [showAddProspect, setShowAddProspect] = useState(false);
    const [newProspect, setNewProspect] = useState({ institution_name: '', email: '', contact_name: '' });

    // Profile detail view state
    const [viewingProfile, setViewingProfile] = useState<any>(null);

    useEffect(() => {
        if (listId) {
            fetchData();
        }
    }, [listId, debouncedSearch, typeFilter]);

    async function fetchData() {
        setLoading(true);
        const res = await getProspects(listId, debouncedSearch, typeFilter);
        if (res.success && res.prospects) {
            setProspects(res.prospects as any[]);
        } else {
            setProspects([]);
        }
        setLoading(false);
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportLoading(true);
        setImportError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('listId', listId);

        const result = await bulkImportProspects(formData);
        if (result.error) {
            setImportError(result.error);
        } else {
            // success
            alert(`Imported ${result.importedCount} prospects successfully.`);
            fetchData();
        }
        setImportLoading(false);
        // Clear input
        e.target.value = '';
    }

    async function handleAddProspect() {
        if (!newProspect.institution_name.trim()) return;
        setLoading(true);
        const res = await createProspect({
            ...newProspect,
            list_id: listId
        });
        if (res.success) {
            setNewProspect({ institution_name: '', email: '', contact_name: '' });
            setShowAddProspect(false);
            fetchData();
        } else {
            alert(res.error || 'Failed to add prospect');
            setLoading(false);
        }
    }

    async function handleDeleteSelected() {
        if (selectedProspects.size === 0) return;
        if (!confirm(`Delete ${selectedProspects.size} prospects?`)) return;

        const res = await deleteProspects(Array.from(selectedProspects));
        if (res.success) {
            setSelectedProspects(new Set());
            fetchData();
        } else {
            alert(res.error || 'Failed to delete');
        }
    }

    function toggleSelect(id: string) {
        const next = new Set(selectedProspects);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedProspects(next);
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Header & Controls */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div>
                    <h3 className="font-bold text-slate-900">{listName} Prospects</h3>
                    <p className="text-xs text-slate-400">{prospects.length} total institutions</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* CSV Upload */}
                    <label className="relative flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50">
                        {importLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        {importLoading ? 'Importing...' : 'Upload CSV'}
                        <input
                            type="file"
                            accept=".csv"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={importLoading}
                        />
                    </label>

                    {/* Manual Entry Toggle */}
                    <button
                        onClick={() => setShowAddProspect(!showAddProspect)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Prospect
                    </button>

                    {selectedProspects.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedProspects.size})
                        </button>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {importError && (
                <div className="m-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                    {importError}
                </div>
            )}

            {/* Manual Entry Form */}
            {showAddProspect && (
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-end gap-2">
                    <input
                        type="text"
                        placeholder="Institution Name *"
                        value={newProspect.institution_name}
                        onChange={e => setNewProspect(p => ({ ...p, institution_name: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleAddProspect()}
                    />
                    <input
                        type="email"
                        placeholder="Email (optional)"
                        value={newProspect.email}
                        onChange={e => setNewProspect(p => ({ ...p, email: e.target.value }))}
                        className="w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleAddProspect()}
                    />
                    <input
                        type="text"
                        placeholder="Contact Name (optional)"
                        value={newProspect.contact_name}
                        onChange={e => setNewProspect(p => ({ ...p, contact_name: e.target.value }))}
                        className="w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleAddProspect()}
                    />
                    <button
                        onClick={handleAddProspect}
                        disabled={!newProspect.institution_name.trim() || loading}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search schools, cities, emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors shadow-sm"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 appearance-none shadow-sm cursor-pointer"
                >
                    <option value="">All Types</option>
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="tvet">TVET</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto bg-white relative">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                    </div>
                ) : prospects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Globe className="w-12 h-12 mb-3 opacity-50" />
                        <p className="font-semibold text-slate-600">No prospects found.</p>
                        <p className="text-sm mt-1">Upload a CSV or adjust your filters.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedProspects.size === prospects.length && prospects.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedProspects(new Set(prospects.map((p) => p.id)));
                                            } else {
                                                setSelectedProspects(new Set());
                                            }
                                        }}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {prospects.map((p) => (
                                <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors cursor-pointer group" onClick={() => setViewingProfile(p)}>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProspects.has(p.id)}
                                            onChange={() => toggleSelect(p.id)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900 text-sm truncate max-w-[200px]">{p.institution_name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                            {p.type && <span className="capitalize">{p.type} </span>}
                                            {p.website && (
                                                <a href={p.website} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline" onClick={e => e.stopPropagation()}>
                                                    {p.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            {p.location ? <><MapPin className="w-3.5 h-3.5 text-slate-400" /> {p.location}</> : '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <div className="text-sm text-slate-900">{p.contact_name || p.email || '-'}</div>
                                        {p.job_title && <div className="text-xs text-slate-500 truncate mt-0.5 max-w-[150px]">{p.job_title}</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                            ${p.status === 'new' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' : ''}
                                            ${p.status === 'drafted' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' : ''}
                                            ${p.status === 'contacted' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20' : ''}
                                            ${p.status === 'replied' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : ''}
                                            ${p.status === 'bounced' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20' : ''}
                                        `}>
                                            {p.status}
                                        </span>
                                        {p.reply_count > 0 && <span className="ml-1 text-xs text-slate-400">({p.reply_count})</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Slide-over Profile Detail View */}
            {viewingProfile && (
                <>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10 animate-in fade-in duration-200"
                        onClick={() => setViewingProfile(null)}
                    />
                    <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white sticky top-0">
                            <h3 className="font-bold text-slate-800 text-lg truncate">Prospect Profile</h3>
                            <button onClick={() => setViewingProfile(null)} className="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">&times;</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">{viewingProfile.institution_name}</h2>
                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                    {viewingProfile.type && <span className="capitalize font-medium">{viewingProfile.type}</span>}
                                    {viewingProfile.ownership && <span className="capitalize bg-slate-100 px-2 py-0.5 rounded text-xs">{viewingProfile.ownership}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Campuses</p>
                                    <p className="text-sm font-medium mt-1">{viewingProfile.campuses || 'Unknown'}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">E-Learning</p>
                                    <p className="text-sm font-medium mt-1">{viewingProfile.has_elearning ? 'Yes' : 'Unknown / No'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b pb-1">Contact Info</h4>
                                {viewingProfile.contact_name && (
                                    <div className="text-sm">
                                        <span className="block text-slate-500 text-xs">Name</span>
                                        <span className="font-medium text-slate-900">{viewingProfile.contact_name}</span>
                                    </div>
                                )}
                                {viewingProfile.job_title && (
                                    <div className="text-sm">
                                        <span className="block text-slate-500 text-xs">Title</span>
                                        <span className="font-medium text-slate-900">{viewingProfile.job_title}</span>
                                    </div>
                                )}
                                {viewingProfile.email && (
                                    <div className="text-sm">
                                        <span className="block text-slate-500 text-xs">Email</span>
                                        <a href={`mailto:${viewingProfile.email}`} className="font-medium text-indigo-600 hover:underline">{viewingProfile.email}</a>
                                    </div>
                                )}
                                {viewingProfile.phone && (
                                    <div className="text-sm">
                                        <span className="block text-slate-500 text-xs">Phone</span>
                                        <span className="font-medium text-slate-900">{viewingProfile.phone}</span>
                                    </div>
                                )}
                                {viewingProfile.website && (
                                    <div className="text-sm">
                                        <span className="block text-slate-500 text-xs">Website</span>
                                        <a href={viewingProfile.website.startsWith('http') ? viewingProfile.website : `https://${viewingProfile.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium text-indigo-600 hover:underline">
                                            <Globe className="w-3.5 h-3.5" />
                                            {viewingProfile.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {viewingProfile.research_data && (
                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                        AI Research <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] ml-1">Gemini</span>
                                    </h4>
                                    <div className="text-sm text-slate-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 whitespace-pre-wrap leading-relaxed">
                                        {viewingProfile.research_data.summary || JSON.stringify(viewingProfile.research_data, null, 2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
