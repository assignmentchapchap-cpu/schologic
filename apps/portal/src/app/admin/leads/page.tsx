'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, AlertTriangle, Loader2, Mail, RefreshCw } from 'lucide-react';
import { getPilotRequests, getInstructorInvites, getContactSubmissions } from '@/app/actions/getLeads';

export default function LeadsDashboard() {
    const [activeTab, setActiveTab] = useState<'pilots' | 'invites' | 'contacts'>('pilots');
    const [pilots, setPilots] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const [pilotsRes, invitesRes, contactsRes] = await Promise.all([
                getPilotRequests(),
                getInstructorInvites(),
                getContactSubmissions()
            ]);

            if (pilotsRes.error || invitesRes.error || contactsRes.error) {
                setError('Failed to fetch some leads data.');
            }

            setPilots(pilotsRes.data || []);
            setInvites(invitesRes.data || []);
            setContacts(contactsRes.data || []);
        } catch (err) {
            setError('An unexpected error occurred while loading.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="w-7 h-7 text-orange-600" />
                        </div>
                        Lead Management Hub
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm max-w-2xl">
                        Centrally manage and review institutional pilot requests, peer invitations, and general contact inquiries from the web forms.
                    </p>
                </div>

                <button
                    onClick={() => loadData(true)}
                    disabled={isRefreshing || isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl flex items-center gap-3 font-medium">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('pilots')}
                    className={`flex-1 md:flex-none px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-200 ${activeTab === 'pilots'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Pilot Requests ({pilots.length})
                </button>
                <button
                    onClick={() => setActiveTab('invites')}
                    className={`flex-1 md:flex-none px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-200 ${activeTab === 'invites'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Instructor Invites ({invites.length})
                </button>
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`flex-1 md:flex-none px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-200 ${activeTab === 'contacts'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Contact Form ({contacts.length})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
                        <p className="font-medium animate-pulse">Synchronizing leads database...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {activeTab === 'pilots' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs tracking-wider uppercase">
                                        <th className="px-6 py-4">Stakeholder</th>
                                        <th className="px-6 py-4">Institution</th>
                                        <th className="px-6 py-4">Background</th>
                                        <th className="px-6 py-4">Interests</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pilots.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pilot requests logged yet.</td></tr>
                                    ) : (
                                        pilots.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-900">{p.first_name} {p.last_name}</p>
                                                    <a href={`mailto:${p.email}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                                                        <Mail className="w-3 h-3" /> {p.email}
                                                    </a>
                                                    <p className="text-xs text-slate-500 mt-0.5">{p.phone}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-slate-800">{p.institution}</p>
                                                    <p className="text-sm text-slate-500">{p.job_title}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm"><span className="text-slate-500">Size:</span> {p.institution_size}</p>
                                                    <p className="text-sm"><span className="text-slate-500">LMS:</span> {p.current_lms}</p>
                                                    {p.virtual_learning && <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Virtual Program</span>}
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {p.primary_interest?.map((i: string) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">{i}</span>
                                                        ))}
                                                    </div>
                                                    {(p.note || p.other_info) && (
                                                        <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded italic border border-slate-100">
                                                            "{p.other_info} {p.note}"
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'invites' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs tracking-wider uppercase">
                                        <th className="px-6 py-4">Sender</th>
                                        <th className="px-6 py-4">Recipient</th>
                                        <th className="px-6 py-4">Message Context</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invites.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No instructor invites logged yet.</td></tr>
                                    ) : (
                                        invites.map((i) => (
                                            <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-900">{i.sender_name}</p>
                                                    <a href={`mailto:${i.sender_email}`} className="text-sm text-indigo-600 hover:underline">{i.sender_email}</a>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-900">{i.recipient_name || 'N/A'}</p>
                                                    <a href={`mailto:${i.recipient_email}`} className="text-sm text-indigo-600 hover:underline block">{i.recipient_email}</a>
                                                    {i.recipient_phone && <p className="text-xs text-slate-500 mt-0.5">{i.recipient_phone}</p>}
                                                </td>
                                                <td className="px-6 py-4 max-w-md">
                                                    {i.message ? (
                                                        <p className="text-sm text-slate-700 italic">"{i.message}"</p>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">No custom message.</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-slate-500 whitespace-nowrap">
                                                    {new Date(i.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'contacts' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs tracking-wider uppercase">
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Subject & Message</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {contacts.length === 0 ? (
                                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No contact submissions logged yet.</td></tr>
                                    ) : (
                                        contacts.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap align-top">
                                                    <p className="font-semibold text-slate-900">{c.name}</p>
                                                    <a href={`mailto:${c.email}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                                                        <Mail className="w-3 h-3" /> {c.email}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 max-w-2xl align-top">
                                                    <p className="font-bold text-slate-900 mb-2">{c.subject}</p>
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.message}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-slate-500 align-top whitespace-nowrap">
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
