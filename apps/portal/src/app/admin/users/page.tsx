'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@schologic/database';
import { Plus, Search, XCircle, CheckCircle, Lock, ShieldCheck, X } from 'lucide-react';
import { addUser, suspendUser, reactivateUser, changeUserRole, resetUserPassword } from '@/app/actions/adminUsers';
import { getRoleLabel } from '@/lib/identity';

// ─── Types ────────────────────────────────────────────────────────────
interface UserRow {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    is_active: boolean | null;
    is_demo: boolean | null;
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function UsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [filtered, setFiltered] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [actionUser, setActionUser] = useState<UserRow | null>(null);
    const [actionType, setActionType] = useState<'suspend' | 'reactivate' | 'role' | 'password' | null>(null);

    // Action form state
    const [newRole, setNewRole] = useState<string>('');
    const [newPassword, setNewPassword] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    // Add user form
    const [addForm, setAddForm] = useState({ email: '', fullName: '', role: 'instructor', password: '' });

    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('id, full_name, email, role, is_active, is_demo');
        setUsers(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    // Filtering
    useEffect(() => {
        let result = users;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(u => (u.full_name || '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q));
        }
        if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
        if (statusFilter === 'active') result = result.filter(u => u.is_active !== false);
        if (statusFilter === 'suspended') result = result.filter(u => u.is_active === false);
        if (statusFilter === 'demo') result = result.filter(u => u.is_demo === true);
        setFiltered(result);
    }, [users, search, roleFilter, statusFilter]);

    // ─── Handlers ─────────────────────────────────────────────────────
    const handleAddUser = async () => {
        setActionLoading(true);
        setActionError('');
        const res = await addUser({
            email: addForm.email,
            fullName: addForm.fullName,
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
        setActionLoading(true);
        setActionError('');

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
        closeAction();
        fetchUsers();
    };

    const openAction = (user: UserRow, type: 'suspend' | 'reactivate' | 'role' | 'password') => {
        setActionUser(user);
        setActionType(type);
        setNewRole(user.role ?? '');
        setNewPassword('');
        setActionError('');
    };

    const closeAction = () => {
        setActionUser(null);
        setActionType(null);
        setActionError('');
    };

    // ─── Render ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 mt-1">{users.length} total users</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                >
                    <option value="all">All Roles</option>
                    <option value="instructor">Instructors</option>
                    <option value="student">Students</option>
                    <option value="superadmin">Platform Admins</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="demo">Demo</option>
                </select>
            </div>

            {/* Table */}
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
                                    <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Role</th>
                                    <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                                    <th className="px-6 py-3 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800">{u.full_name || 'No Name'}</p>
                                            <p className="text-xs text-slate-400">{u.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${u.role === 'superadmin' ? 'bg-rose-100 text-rose-700' :
                                                    u.role === 'instructor' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>{getRoleLabel(u.role)}</span>
                                                {u.is_demo && <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Demo</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.is_active === false ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                                                    <XCircle className="w-3.5 h-3.5" /> Suspended
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {u.is_active === false ? (
                                                    <button onClick={() => openAction(u, 'reactivate')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Reactivate">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => openAction(u, 'suspend')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Suspend">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => openAction(u, 'role')} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Change Role">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openAction(u, 'password')} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password">
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─── Add User Modal ──────────────────────────────────────── */}
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

            {/* ─── Action Modal ────────────────────────────────────────── */}
            {actionUser && actionType && (
                <Modal
                    title={
                        actionType === 'suspend' ? `Suspend ${actionUser.full_name || actionUser.email}?` :
                            actionType === 'reactivate' ? `Reactivate ${actionUser.full_name || actionUser.email}?` :
                                actionType === 'role' ? `Change Role for ${actionUser.full_name || actionUser.email}` :
                                    `Reset Password for ${actionUser.full_name || actionUser.email}`
                    }
                    onClose={closeAction}
                >
                    <div className="space-y-4">
                        {actionType === 'suspend' && (
                            <p className="text-sm text-slate-600">This will immediately block the user from logging in. They can be reactivated later.</p>
                        )}
                        {actionType === 'reactivate' && (
                            <p className="text-sm text-slate-600">This will restore the user&apos;s access to the platform.</p>
                        )}
                        {actionType === 'role' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">New Role</label>
                                <select
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                                >
                                    <option value="instructor">Instructor</option>
                                    <option value="student">Student</option>
                                    <option value="superadmin">Platform Admin</option>
                                </select>
                            </div>
                        )}
                        {actionType === 'password' && (
                            <InputField label="New Password" type="password" value={newPassword} onChange={setNewPassword} />
                        )}
                        {actionError && <p className="text-sm text-red-600 font-medium">{actionError}</p>}
                        <div className="flex gap-3">
                            <button
                                onClick={closeAction}
                                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={actionLoading || (actionType === 'password' && !newPassword)}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'suspend'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-rose-600 text-white hover:bg-rose-700'
                                    }`}
                            >
                                {actionLoading ? 'Processing...' :
                                    actionType === 'suspend' ? 'Suspend User' :
                                        actionType === 'reactivate' ? 'Reactivate' :
                                            actionType === 'role' ? 'Change Role' : 'Reset Password'
                                }
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── Shared Components ────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
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
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
            />
        </div>
    );
}
