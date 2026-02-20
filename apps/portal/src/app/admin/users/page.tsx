'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@schologic/database';
import UserAnalyticsCards from '@/components/admin/UserAnalyticsCards';
import { subDays, startOfYear, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import {
    Plus, Search, XCircle, CheckCircle, Lock, ShieldCheck, X,
    Users, GraduationCap, ChevronRight, RefreshCw,
    Briefcase, Phone, Globe, Mail,
    Calendar, AlertCircle,
} from 'lucide-react';
import {
    addUser, suspendUser, reactivateUser, changeUserRole, resetUserPassword,
} from '@/app/actions/adminUsers';
import { getRoleLabel } from '@/lib/identity';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserRow {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    is_active: boolean | null;
    is_demo: boolean | null;
    demo_converted_at: string | null;
    created_at: string | null;
    phone: string | null;
    country: string | null;
    professional_affiliation: string | null;
}

interface ClassSummary {
    id: string;
    name: string;
    class_code: string | null;
    student_count: number;
}

interface PracticumSummary {
    id: string;
    title: string;
    cohort_code: string | null;
    enrollment_count: number;
}

interface StudentSummary {
    id: string;
    full_name: string | null;
    email: string | null;
}

interface AiUsageSummary {
    totalCalls: number;
    totalTokens: number;
}

interface InstructorDetail {
    profile: UserRow;
    classes: ClassSummary[];
    practicums: PracticumSummary[];
    students: StudentSummary[];
    aiUsage: AiUsageSummary;
}

interface StudentDetail {
    profile: UserRow;
    classCount: number;
    practicumCount: number;
    submissionCount: number;
}

type ActionType = 'suspend' | 'reactivate' | 'role' | 'password';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(s: string | null) {
    if (!s) return '—';
    try { return format(new Date(s), 'MMM d, yyyy'); } catch { return '—'; }
}

function StatusBadge({ isActive }: { isActive: boolean | null }) {
    return isActive === false
        ? <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600"><XCircle className="w-3.5 h-3.5" />Suspended</span>
        : <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle className="w-3.5 h-3.5" />Active</span>;
}

function DemoBadge() {
    return <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Demo</span>;
}

function RoleBadge({ role }: { role: string | null }) {
    const cls = role === 'superadmin' ? 'bg-rose-100 text-rose-700'
        : role === 'instructor' ? 'bg-indigo-100 text-indigo-700'
            : 'bg-emerald-100 text-emerald-700';
    return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${cls}`}>{getRoleLabel(role)}</span>;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
            <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{label}</p>
                <p className="text-sm text-slate-700 font-medium mt-0.5 break-all">{value ?? '—'}</p>
            </div>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3 mt-5">{children}</h4>;
}

function StatChip({ label, value, color = 'slate' }: { label: string; value: number | string; color?: string }) {
    const colors: Record<string, string> = {
        slate: 'bg-slate-50 text-slate-700',
        violet: 'bg-violet-50 text-violet-700',
        indigo: 'bg-indigo-50 text-indigo-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
    };
    return (
        <div className={`rounded-xl p-3 ${colors[color] ?? colors.slate}`}>
            <p className="text-xl font-extrabold">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5 opacity-70">{label}</p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
    const supabase = createClient();

    // List state
    const [instructors, setInstructors] = useState<UserRow[]>([]);
    const [students, setStudents] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'instructors' | 'students'>('overview');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRangeKey, setDateRangeKey] = useState('30d');
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Detail panels
    const [selectedInstructor, setSelectedInstructor] = useState<InstructorDetail | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Derived Date Range
    const getDateRange = () => {
        const end = endOfDay(new Date());
        let start = subDays(end, 30);
        if (dateRangeKey === '24h') start = subDays(end, 1);
        if (dateRangeKey === '7d') start = subDays(end, 7);
        if (dateRangeKey === '90d') start = subDays(end, 90);
        if (dateRangeKey === 'ytd') start = startOfYear(end);
        return { start, end };
    };

    // Action modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [actionUser, setActionUser] = useState<UserRow | null>(null);
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [newRole, setNewRole] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [addForm, setAddForm] = useState({ email: '', fullName: '', role: 'instructor', password: '' });

    // ── Fetch list ──────────────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, is_active, is_demo, demo_converted_at, created_at, phone, country, professional_affiliation')
            .order('created_at', { ascending: false });
        // Cast to unknown first to bypass schema type check (created_at is new)
        const all = (data ?? []) as unknown as UserRow[];
        setInstructors(all.filter(u => u.role === 'instructor'));
        setStudents(all.filter(u => u.role === 'student'));
        setLastRefreshed(new Date());
        setLoading(false);
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── Fetch Instructor Detail ─────────────────────────────────────────────
    const openInstructor = async (user: UserRow) => {
        setDetailLoading(true);
        setSelectedInstructor(null);
        setSelectedStudent(null);

        // 1. Classes + enrollment counts
        const { data: classRows } = await supabase
            .from('classes')
            .select('id, name, class_code')
            .eq('instructor_id', user.id);

        const classIds = (classRows ?? []).map(c => c.id);
        let classEnrollMap: Record<string, number> = {};
        if (classIds.length > 0) {
            const { data: enRows } = await supabase
                .from('enrollments')
                .select('class_id')
                .in('class_id', classIds);
            (enRows ?? []).forEach(r => {
                if (r.class_id) {
                    classEnrollMap[r.class_id] = (classEnrollMap[r.class_id] ?? 0) + 1;
                }
            });
        }

        const classes: ClassSummary[] = (classRows ?? []).map(c => ({
            id: c.id,
            name: c.name,
            class_code: c.class_code,
            student_count: classEnrollMap[c.id] ?? 0,
        }));

        // 2. Practicums + enrollment counts
        const { data: pracRows } = await supabase
            .from('practicums')
            .select('id, title, cohort_code')
            .eq('instructor_id', user.id);

        const pracIds = (pracRows ?? []).map(p => p.id);
        let pracEnrollMap: Record<string, number> = {};
        if (pracIds.length > 0) {
            const { data: peRows } = await supabase
                .from('practicum_enrollments')
                .select('practicum_id')
                .in('practicum_id', pracIds);
            (peRows ?? []).forEach(r => {
                if (r.practicum_id) {
                    pracEnrollMap[r.practicum_id] = (pracEnrollMap[r.practicum_id] ?? 0) + 1;
                }
            });
        }

        const practicums: PracticumSummary[] = (pracRows ?? []).map(p => ({
            id: p.id,
            title: p.title,
            cohort_code: p.cohort_code,
            enrollment_count: pracEnrollMap[p.id] ?? 0,
        }));

        // 3. Unique student list across all classes (deduped)
        let students: StudentSummary[] = [];
        if (classIds.length > 0) {
            const { data: enData } = await supabase
                .from('enrollments')
                .select('student_id, profiles!enrollments_student_id_fkey(id, full_name, email)')
                .in('class_id', classIds);
            const seen = new Set<string>();
            (enData ?? []).forEach((e: any) => {
                const p = e.profiles;
                if (p && !seen.has(p.id)) {
                    seen.add(p.id);
                    students.push({ id: p.id, full_name: p.full_name, email: p.email });
                }
            });
        }

        // 4. AI usage summary
        const { data: usageLogs } = await supabase
            .from('api_usage_logs')
            .select('total_tokens')
            .eq('instructor_id', user.id);
        const aiUsage: AiUsageSummary = {
            totalCalls: (usageLogs ?? []).length,
            totalTokens: (usageLogs ?? []).reduce((s, l) => s + (l.total_tokens ?? 0), 0),
        };

        setSelectedInstructor({ profile: user, classes, practicums, students, aiUsage });
        setDetailLoading(false);
    };

    // ── Fetch Student Detail ────────────────────────────────────────────────
    const openStudent = async (user: UserRow) => {
        setDetailLoading(true);
        setSelectedInstructor(null);
        setSelectedStudent(null);

        const [{ count: classCount }, { count: pracCount }, { count: subCount }] = await Promise.all([
            supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('student_id', user.id),
            supabase.from('practicum_enrollments').select('*', { count: 'exact', head: true }).eq('student_id', user.id),
            supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('student_id', user.id),
        ]);

        setSelectedStudent({
            profile: user,
            classCount: classCount ?? 0,
            practicumCount: pracCount ?? 0,
            submissionCount: subCount ?? 0,
        });
        setDetailLoading(false);
    };

    // ── Actions ─────────────────────────────────────────────────────────────
    const handleAddUser = async () => {
        setActionLoading(true); setActionError('');
        const res = await addUser({
            email: addForm.email, fullName: addForm.fullName,
            role: addForm.role as 'instructor' | 'student' | 'superadmin',
            password: addForm.password,
        });
        setActionLoading(false);
        if (res.error) { setActionError(res.error); return; }
        setShowAddModal(false);
        setAddForm({ email: '', fullName: '', role: 'instructor', password: '' });
        fetchUsers();
    };

    const handleAction = async () => {
        if (!actionUser || !actionType) return;
        setActionLoading(true); setActionError('');
        let res: { success?: boolean; error?: string };
        switch (actionType) {
            case 'suspend': res = await suspendUser(actionUser.id); break;
            case 'reactivate': res = await reactivateUser(actionUser.id); break;
            case 'role': res = await changeUserRole(actionUser.id, newRole as 'instructor' | 'student' | 'superadmin'); break;
            case 'password': res = await resetUserPassword(actionUser.id, newPassword); break;
            default: res = { error: 'Unknown action' };
        }
        setActionLoading(false);
        if (res.error) { setActionError(res.error); return; }
        closeAction(); fetchUsers();
    };

    const openAction = (user: UserRow, type: ActionType) => {
        setActionUser(user); setActionType(type); setNewRole(user.role ?? ''); setNewPassword(''); setActionError('');
    };
    const closeAction = () => { setActionUser(null); setActionType(null); setActionError(''); };

    // ── Derived filtered list ───────────────────────────────────────────────
    const baseList = tab === 'instructors' ? instructors : students;
    const filtered = baseList.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !search || (u.full_name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q);

        const matchStatus =
            statusFilter === 'all' ? true
                : statusFilter === 'active' ? u.is_active !== false
                    : statusFilter === 'suspended' ? u.is_active === false
                        : statusFilter === 'demo' ? u.is_demo === true
                            : true;

        // Date Filter
        const { start, end } = getDateRange();
        const createdAt = u.created_at ? new Date(u.created_at) : null;
        const matchDate = createdAt ? isWithinInterval(createdAt, { start, end }) : false;

        return matchSearch && matchStatus && matchDate;
    });

    const closePanel = () => { setSelectedInstructor(null); setSelectedStudent(null); };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 mt-1">
                        {instructors.length} instructors · {students.length} students
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                    <select
                        value={dateRangeKey}
                        onChange={e => setDateRangeKey(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-rose-500"
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="ytd">Year to Date</option>
                    </select>
                    <button
                        onClick={fetchUsers}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-xs text-slate-400">{lastRefreshed.toLocaleTimeString()}</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
                {([
                    { key: 'overview', label: 'Overview', icon: Users, count: null },
                    { key: 'instructors', label: 'Instructors', icon: GraduationCap, count: instructors.length },
                    { key: 'students', label: 'Students', icon: Users, count: students.length },
                ] as const).map(t => (
                    <button
                        key={t.key}
                        onClick={() => { setTab(t.key); setSearch(''); setStatusFilter('all'); }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.key
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            {tab !== 'overview' && (
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${tab}...`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        {tab === 'instructors' && <option value="demo">Demo</option>}
                    </select>
                </div>
            )}

            {/* Content Area */}
            {tab === 'overview' ? (
                <UserAnalyticsCards range={dateRangeKey as any} onRangeChange={setDateRangeKey} />
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">User</th>
                                        <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-xs hidden md:table-cell">Status</th>
                                        <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-xs hidden lg:table-cell">Joined</th>
                                        <th className="px-6 py-3 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map(u => (
                                        <tr
                                            key={u.id}
                                            onClick={() => tab === 'instructors' ? openInstructor(u) : openStudent(u)}
                                            className="hover:bg-rose-50/40 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm shrink-0">
                                                        {(u.full_name ?? u.email ?? '?')[0].toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-slate-800">{u.full_name || 'No Name'}</p>
                                                            <RoleBadge role={u.role} />
                                                            {u.is_demo && <DemoBadge />}
                                                            {u.demo_converted_at && (
                                                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">Converted</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <StatusBadge isActive={u.is_active} />
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell text-xs text-slate-400">
                                                {fmtDate(u.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                    {u.is_active === false
                                                        ? <button onClick={() => openAction(u, 'reactivate')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Reactivate"><CheckCircle className="w-4 h-4" /></button>
                                                        : <button onClick={() => openAction(u, 'suspend')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Suspend"><XCircle className="w-4 h-4" /></button>
                                                    }
                                                    <button onClick={() => openAction(u, 'role')} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Change Role"><ShieldCheck className="w-4 h-4" /></button>
                                                    <button onClick={() => openAction(u, 'password')} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password"><Lock className="w-4 h-4" /></button>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-400 transition-colors ml-1" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                No {tab} found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Instructor Detail Panel ───────────────────────────────────── */}
            {(selectedInstructor || (detailLoading && tab === 'instructors')) && (
                <SlidePanel onClose={closePanel}>
                    {detailLoading || !selectedInstructor ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <InstructorPanel detail={selectedInstructor} onAction={openAction} />
                    )}
                </SlidePanel>
            )}

            {/* ── Student Detail Panel ──────────────────────────────────────── */}
            {(selectedStudent || (detailLoading && tab === 'students')) && (
                <SlidePanel onClose={closePanel}>
                    {detailLoading || !selectedStudent ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <StudentPanel detail={selectedStudent} onAction={openAction} />
                    )}
                </SlidePanel>
            )}

            {/* ── Add User Modal ────────────────────────────────────────────── */}
            {showAddModal && (
                <Modal title="Add New User" onClose={() => setShowAddModal(false)}>
                    <div className="space-y-4">
                        <InputField label="Full Name" value={addForm.fullName} onChange={v => setAddForm({ ...addForm, fullName: v })} />
                        <InputField label="Email" type="email" value={addForm.email} onChange={v => setAddForm({ ...addForm, email: v })} />
                        <InputField label="Password" type="password" value={addForm.password} onChange={v => setAddForm({ ...addForm, password: v })} />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                            <select
                                value={addForm.role}
                                onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                            >
                                <option value="instructor">Instructor</option>
                                <option value="student">Student</option>
                                <option value="superadmin">Platform Admin</option>
                            </select>
                        </div>
                        {actionError && <p className="text-sm text-red-600 font-medium">{actionError}</p>}
                        <button
                            onClick={handleAddUser}
                            disabled={actionLoading || !addForm.email || !addForm.fullName || !addForm.password}
                            className="w-full py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {actionLoading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Action Modal ──────────────────────────────────────────────── */}
            {actionUser && actionType && (
                <Modal
                    title={
                        actionType === 'suspend' ? `Suspend ${actionUser.full_name || actionUser.email}?`
                            : actionType === 'reactivate' ? `Reactivate ${actionUser.full_name || actionUser.email}?`
                                : actionType === 'role' ? `Change Role for ${actionUser.full_name || actionUser.email}`
                                    : `Reset Password for ${actionUser.full_name || actionUser.email}`
                    }
                    onClose={closeAction}
                >
                    <div className="space-y-4">
                        {actionType === 'suspend' && <p className="text-sm text-slate-600">This will immediately block the user from logging in. They can be reactivated later.</p>}
                        {actionType === 'reactivate' && <p className="text-sm text-slate-600">This will restore the user&apos;s access to the platform.</p>}
                        {actionType === 'role' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">New Role</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none">
                                    <option value="instructor">Instructor</option>
                                    <option value="student">Student</option>
                                    <option value="superadmin">Platform Admin</option>
                                </select>
                            </div>
                        )}
                        {actionType === 'password' && <InputField label="New Password" type="password" value={newPassword} onChange={setNewPassword} />}
                        {actionError && <p className="text-sm text-red-600 font-medium">{actionError}</p>}
                        <div className="flex gap-3">
                            <button onClick={closeAction} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                            <button
                                onClick={handleAction}
                                disabled={actionLoading || (actionType === 'password' && !newPassword)}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'suspend' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
                            >
                                {actionLoading ? 'Processing...' : actionType === 'suspend' ? 'Suspend User' : actionType === 'reactivate' ? 'Reactivate' : actionType === 'role' ? 'Change Role' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── Slide Panel Wrapper ──────────────────────────────────────────────────────
function SlidePanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-in-right">
                {children}
            </div>
        </div>
    );
}

// ─── Instructor Detail Panel ──────────────────────────────────────────────────
function InstructorPanel({ detail, onAction }: { detail: InstructorDetail; onAction: (u: UserRow, t: ActionType) => void }) {
    const { profile: u, classes, practicums, students, aiUsage } = detail;
    const initials = (u.full_name ?? u.email ?? '?')[0].toUpperCase();

    return (
        <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4 sticky top-0 bg-white z-10">
                <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800">{u.full_name ?? 'No Name'}</p>
                        {u.is_demo && !u.demo_converted_at && <DemoBadge />}
                        {u.demo_converted_at && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">Converted</span>}
                    </div>
                    <p className="text-xs text-slate-400">{u.email}</p>
                </div>
            </div>

            <div className="p-6 flex-1">
                {/* Demo conversion alert */}
                {u.is_demo && !u.demo_converted_at && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 mb-4">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-amber-700">Demo Account</p>
                            <p className="text-xs text-amber-600 mt-0.5">Converts via the in-app DemoBanner upgrade flow.</p>
                        </div>
                    </div>
                )}
                {u.demo_converted_at && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 mb-4">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-emerald-700">Converted to Standard</p>
                            <p className="text-xs text-emerald-600 mt-0.5">Converted {fmtDate(u.demo_converted_at)}</p>
                        </div>
                    </div>
                )}

                {/* KPI summary row */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                    <StatChip label="Classes" value={classes.length} color="indigo" />
                    <StatChip label="Practicums" value={practicums.length} color="violet" />
                    <StatChip label="Students" value={students.length} color="emerald" />
                    <StatChip label="AI Calls" value={aiUsage.totalCalls} color="amber" />
                </div>

                {/* Contact info */}
                <SectionTitle>Profile</SectionTitle>
                <div className="bg-slate-50 rounded-xl px-4 pb-1">
                    <InfoRow icon={Mail} label="Email" value={u.email} />
                    <InfoRow icon={Phone} label="Phone" value={u.phone} />
                    <InfoRow icon={Globe} label="Country" value={u.country} />
                    <InfoRow icon={Briefcase} label="Affiliation" value={u.professional_affiliation} />
                    <InfoRow icon={Calendar} label="Joined" value={fmtDate(u.created_at)} />
                    <InfoRow icon={u.is_active !== false ? CheckCircle : XCircle} label="Status" value={<StatusBadge isActive={u.is_active} />} />
                </div>

                {/* Classes */}
                <SectionTitle>Classes ({classes.length})</SectionTitle>
                {classes.length === 0
                    ? <p className="text-slate-400 text-xs">No classes yet</p>
                    : <div className="space-y-2">
                        {classes.map(c => (
                            <div key={c.id} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                                    <p className="text-xs text-slate-400">{c.class_code ?? 'No code'}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">{c.student_count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                }

                {/* Practicums */}
                <SectionTitle>Practicums ({practicums.length})</SectionTitle>
                {practicums.length === 0
                    ? <p className="text-slate-400 text-xs">No practicums yet</p>
                    : <div className="space-y-2">
                        {practicums.map(p => (
                            <div key={p.id} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">{p.title}</p>
                                    <p className="text-xs text-slate-400">{p.cohort_code ?? 'No cohort code'}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">{p.enrollment_count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                }

                {/* Student list */}
                <SectionTitle>Students ({students.length})</SectionTitle>
                {students.length === 0
                    ? <p className="text-slate-400 text-xs">No enrolled students</p>
                    : <div className="space-y-1.5">
                        {students.map(s => (
                            <div key={s.id} className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                                    {(s.full_name ?? s.email ?? '?')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-700 truncate">{s.full_name ?? 'No Name'}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{s.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                }

                {/* AI Usage */}
                {aiUsage.totalCalls > 0 && (
                    <>
                        <SectionTitle>AI Usage</SectionTitle>
                        <div className="grid grid-cols-2 gap-2">
                            <StatChip label="Total Calls" value={aiUsage.totalCalls} color="violet" />
                            <StatChip label="Total Tokens" value={aiUsage.totalTokens >= 1000 ? `${(aiUsage.totalTokens / 1000).toFixed(1)}K` : aiUsage.totalTokens} color="indigo" />
                        </div>
                    </>
                )}
            </div>

            {/* Footer actions */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex gap-2">
                <button onClick={() => onAction(u, 'role')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" /> Role
                </button>
                <button onClick={() => onAction(u, 'password')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <Lock className="w-3.5 h-3.5" /> Password
                </button>
                {u.is_active === false
                    ? <button onClick={() => onAction(u, 'reactivate')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors"><CheckCircle className="w-3.5 h-3.5" /> Reactivate</button>
                    : <button onClick={() => onAction(u, 'suspend')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors"><XCircle className="w-3.5 h-3.5" /> Suspend</button>
                }
            </div>
        </>
    );
}

// ─── Student Detail Panel ────────────────────────────────────────────────────
function StudentPanel({ detail, onAction }: { detail: StudentDetail; onAction: (u: UserRow, t: ActionType) => void }) {
    const { profile: u, classCount, practicumCount, submissionCount } = detail;
    const initials = (u.full_name ?? u.email ?? '?')[0].toUpperCase();

    return (
        <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4 sticky top-0 bg-white z-10">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">{u.full_name ?? 'No Name'}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                </div>
            </div>

            <div className="p-6 flex-1">
                {/* Activity summary */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                    <StatChip label="Classes" value={classCount} color="indigo" />
                    <StatChip label="Practicums" value={practicumCount} color="violet" />
                    <StatChip label="Submissions" value={submissionCount} color="emerald" />
                </div>

                {/* Profile info */}
                <SectionTitle>Profile</SectionTitle>
                <div className="bg-slate-50 rounded-xl px-4 pb-1">
                    <InfoRow icon={Mail} label="Email" value={u.email} />
                    <InfoRow icon={Phone} label="Phone" value={u.phone} />
                    <InfoRow icon={Globe} label="Country" value={u.country} />
                    <InfoRow icon={Calendar} label="Joined" value={fmtDate(u.created_at)} />
                    <InfoRow icon={u.is_active !== false ? CheckCircle : XCircle} label="Status" value={<StatusBadge isActive={u.is_active} />} />
                </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex gap-2">
                <button onClick={() => onAction(u, 'role')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" /> Role
                </button>
                <button onClick={() => onAction(u, 'password')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <Lock className="w-3.5 h-3.5" /> Password
                </button>
                {u.is_active === false
                    ? <button onClick={() => onAction(u, 'reactivate')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors"><CheckCircle className="w-3.5 h-3.5" /> Reactivate</button>
                    : <button onClick={() => onAction(u, 'suspend')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors"><XCircle className="w-3.5 h-3.5" /> Suspend</button>
                }
            </div>
        </>
    );
}

// ─── Shared Components ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
        </div>
    );
}
