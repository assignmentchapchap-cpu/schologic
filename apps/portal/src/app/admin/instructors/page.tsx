'use client';

import { createClient } from "@schologic/database";
import { useEffect, useState } from 'react';
import AdminTable, { Column } from '@/components/AdminTable';
import { Search, Filter, Check, X, Plus } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface InstructorData {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    classes: { count: number }[]; // Relation response
}

export default function AdminInstructorsPage() {
    const supabase = createClient();
    const [data, setData] = useState<InstructorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { showToast } = useToast();

    const fetchData = async () => {
        const { data: instructors, error } = await supabase
            .from('profiles')
            .select(`
                id, 
                full_name, 
                email, 
                avatar_url,
                is_active,
                created_at,
                classes (count)
            `)
            .eq('role', 'instructor');

        if (error) {
            console.error(error);
            showToast('Failed to fetch instructors', 'error');
        }

        if (instructors) {
            setData(instructors as unknown as InstructorData[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            showToast('Failed to update status', 'error');
        } else {
            showToast(`Instructor ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
            // Optimistic update
            setData(prev => prev.map(i => i.id === id ? { ...i, is_active: !currentStatus } : i));
        }
    };

    const columns: Column<InstructorData>[] = [
        {
            header: 'Instructor',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200">
                        {row.avatar_url ? (
                            <img src={row.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            row.full_name?.[0] || '?'
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">{row.full_name || 'Unnamed'}</div>
                        <div className="text-xs text-slate-400">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${row.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Enrolled Classes',
            cell: (row) => (
                <span className="font-mono text-xs font-bold bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-600">
                    {row.classes?.[0]?.count || 0} Classes
                </span>
            )
        },
        {
            header: 'Joined',
            cell: (row) => (
                <span className="text-slate-500 text-xs">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        }
    ];

    const filteredData = data.filter(d =>
        (d.full_name?.toLowerCase().includes(search.toLowerCase()) || '') ||
        (d.email?.toLowerCase().includes(search.toLowerCase()) || '')
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Instructors</h1>
                    <p className="text-slate-500 font-bold mt-1">Manage teaching staff and access</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Invite Instructor
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search instructors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                </div>
            </div>

            <AdminTable
                columns={columns}
                data={filteredData}
                isLoading={loading}
                emptyMessage="No instructors found."
                actions={(row) => (
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleStatus(row.id, row.is_active); }}
                        className={`p-2 rounded-lg transition-colors ${row.is_active ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        title={row.is_active ? "Deactivate" : "Activate"}
                    >
                        {row.is_active ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    </button>
                )}
            />
        </div>
    );
}
