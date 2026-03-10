'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, RefreshCw, UserPlus, Mail, UserX } from 'lucide-react';
import { getAudiences, createAudience, deleteAudience, getContacts, addContact, removeContact, syncAudiencesFromResend, type ContactData } from '@/app/actions/adminMailingLists';

interface Audience {
    id: string;
    resend_audience_id: string;
    name: string;
    created_at: string;
    contacts: { count: number }[];
}

interface Contact {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    unsubscribed: boolean;
    created_at: string;
}

export default function MailingListsPage() {
    const [audiences, setAudiences] = useState<Audience[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [contactsLoading, setContactsLoading] = useState(false);

    // Forms
    const [newAudienceName, setNewAudienceName] = useState('');
    const [showAddContact, setShowAddContact] = useState(false);
    const [newContact, setNewContact] = useState<ContactData>({ email: '', firstName: '', lastName: '' });
    const [syncing, setSyncing] = useState(false);

    useEffect(() => { fetchAudiences(); }, []);

    async function fetchAudiences() {
        setLoading(true);
        const result = await getAudiences();
        setAudiences(result.data as Audience[]);
        setLoading(false);
    }

    async function handleCreateAudience() {
        if (!newAudienceName.trim()) return;
        const result = await createAudience(newAudienceName.trim());
        if (!result.error) {
            setNewAudienceName('');
            fetchAudiences();
        }
    }

    async function handleDeleteAudience(id: string) {
        if (!confirm('Delete this audience and all its contacts?')) return;
        await deleteAudience(id);
        if (selectedAudience?.id === id) {
            setSelectedAudience(null);
            setContacts([]);
        }
        fetchAudiences();
    }

    async function handleSelectAudience(audience: Audience) {
        setSelectedAudience(audience);
        setContactsLoading(true);
        const result = await getContacts(audience.id);
        setContacts(result.data as Contact[]);
        setContactsLoading(false);
    }

    async function handleAddContact() {
        if (!newContact.email.trim() || !selectedAudience) return;
        const result = await addContact(selectedAudience.id, newContact);
        if (!result.error) {
            setNewContact({ email: '', firstName: '', lastName: '' });
            setShowAddContact(false);
            handleSelectAudience(selectedAudience);
            fetchAudiences();
        }
    }

    async function handleRemoveContact(contactId: string) {
        if (!confirm('Remove this contact?')) return;
        await removeContact(contactId);
        setContacts(prev => prev.filter(c => c.id !== contactId));
        fetchAudiences();
    }

    async function handleSync() {
        setSyncing(true);
        await syncAudiencesFromResend();
        await fetchAudiences();
        setSyncing(false);
    }

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-7 h-7 text-violet-600" />
                        Mailing Lists
                    </h1>
                    <p className="text-slate-500 mt-1">Manage audiences and contacts</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync from Resend'}
                </button>
            </div>

            <div className="flex gap-4 min-h-[500px]">
                {/* Audiences List */}
                <div className="w-full md:w-1/3 space-y-4">
                    {/* Create Audience */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newAudienceName}
                                onChange={e => setNewAudienceName(e.target.value)}
                                placeholder="New audience name..."
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                onKeyDown={e => e.key === 'Enter' && handleCreateAudience()}
                            />
                            <button
                                onClick={handleCreateAudience}
                                className="px-3 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Audience Cards */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                            </div>
                        ) : audiences.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Users className="w-8 h-8 mb-2" />
                                <p className="text-sm font-semibold">No audiences</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {audiences.map(audience => (
                                    <div
                                        key={audience.id}
                                        className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${selectedAudience?.id === audience.id ? 'bg-indigo-50/50 border-l-2 border-indigo-500' : ''
                                            }`}
                                        onClick={() => handleSelectAudience(audience)}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{audience.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {audience.contacts?.[0]?.count || 0} contacts
                                            </p>
                                        </div>
                                        <button
                                            onClick={e => { e.stopPropagation(); handleDeleteAudience(audience.id); }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contacts Panel */}
                <div className="hidden md:block flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {selectedAudience ? (
                        <div>
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <div>
                                    <h3 className="font-bold text-slate-900">{selectedAudience.name}</h3>
                                    <p className="text-xs text-slate-400">{contacts.length} contacts</p>
                                </div>
                                <button
                                    onClick={() => setShowAddContact(!showAddContact)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <UserPlus className="w-3.5 h-3.5" /> Add Contact
                                </button>
                            </div>

                            {showAddContact && (
                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-end gap-2">
                                    <input
                                        type="email"
                                        placeholder="Email *"
                                        value={newContact.email}
                                        onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="First name"
                                        value={newContact.firstName}
                                        onChange={e => setNewContact(p => ({ ...p, firstName: e.target.value }))}
                                        className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last name"
                                        value={newContact.lastName}
                                        onChange={e => setNewContact(p => ({ ...p, lastName: e.target.value }))}
                                        className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                    />
                                    <button
                                        onClick={handleAddContact}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}

                            {contactsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                                </div>
                            ) : contacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Mail className="w-8 h-8 mb-2" />
                                    <p className="text-sm font-semibold">No contacts yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                                    {contacts.map(contact => (
                                        <div key={contact.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{contact.email}</p>
                                                <p className="text-xs text-slate-400">
                                                    {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'No name'}
                                                    {contact.unsubscribed && (
                                                        <span className="ml-2 text-red-400 font-bold">Unsubscribed</span>
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveContact(contact.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <UserX className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                            <Users className="w-12 h-12 mb-3" />
                            <p className="font-semibold">Select an audience</p>
                            <p className="text-xs mt-1">Choose a list to manage its contacts</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
