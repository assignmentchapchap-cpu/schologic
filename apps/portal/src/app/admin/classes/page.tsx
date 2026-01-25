'use client';

import { createClient } from "@schologic/database";
import { useEffect, useState } from 'react';
import AdminTable, { Column } from '@/components/AdminTable';
import { Search, Filter } from 'lucide-react';

interface ClassData {
    id: string;
    name: string;
    class_code: string | null;
    instructor: {
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
    };
    created_at: string;
    // Mocked/Aggregated stats
    studentCount: number;
    avgGrade: number;
    aiRisk: 'High' | 'Medium' | 'Low';
    lastActivity: string;
}

export default function AdminClassesPage() {
    const supabase = createClient();
    const [data, setData] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const { data: classes } = await supabase
                .from('classes')
                .select(`
                    id, 
                    name, 
                    class_code, 
                    created_at,
                    profiles:instructor_id (
                        full_name, 
                        email, 
                        avatar_url
                    )
                `);

            if (classes) {
                // Mocking stats for presentation since real aggregation is expensive/empty in dev
                const formatted: ClassData[] = classes.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    class_code: c.class_code,
                    instructor: c.profiles || { full_name: 'Unknown', email: '', avatar_url: null },
                    created_at: c.created_at,
                    studentCount: Math.floor(Math.random() * 30) + 10, // Mock 10-40 students
                    avgGrade: Math.floor(Math.random() * 15) + 75, // Mock 75-90 avg
                    aiRisk: Math.random() > 0.8 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
                    lastActivity: new Date(Date.now() - Math.random() * 100000000).toLocaleDateString()
                }));
                setData(formatted);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const columns: Column<ClassData>[] = [
        {
            header: 'Class Name',
            cell: (row) => (
                <div>
                    <div className="font-bold text-slate-800">{row.name}</div>
                    <div className="text-xs text-slate-400 font-mono bg-slate-100 inline-block px-1 rounded mt-0.5">
                        {row.class_code || 'NO-CODE'}
                    </div>
                </div>
            )
        },
        {
            header: 'Instructor',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold overflow-hidden">
                        {row.instructor.avatar_url ? (
                            <img src={row.instructor.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            row.instructor.full_name?.[0] || '?'
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-700">{row.instructor.full_name}</div>
                        <div className="text-[10px] text-slate-400">{row.instructor.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Enrollment',
            accessorKey: 'studentCount',
            cell: (row) => (
                <span className="font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                    {row.studentCount} Students
                </span>
            )
        },
        {
            header: 'Avg Grade',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.avgGrade}%` }} />
                    </div>
                    <span className="font-bold text-xs text-emerald-600">{row.avgGrade}%</span>
                </div>
            )
        },
        {
            header: 'AI Risk',
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.aiRisk === 'High' ? 'bg-red-100 text-red-700' :
                    row.aiRisk === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                    }`}>
                    {row.aiRisk} Risk
                </span>
            )
        },
        {
            header: 'Last Activity',
            accessorKey: 'lastActivity',
            className: 'text-slate-400 text-xs'
        }
    ];

    const filteredData = data.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.instructor.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Classes</h1>
                    <p className="text-slate-500 font-bold mt-1">Manage and monitor institution courses</p>
                </div>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                    Export CSV
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search classes or instructors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                </div>
                <button className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-slate-50">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            <AdminTable
                columns={columns}
                data={filteredData}
                isLoading={loading}
                emptyMessage="No classes found for this institution."
                actions={() => (
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                        View
                    </button>
                )}
            />
        </div>
    );
}
