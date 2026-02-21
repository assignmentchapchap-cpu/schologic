import React, { useState } from 'react';
import { X, Send, User, Mail, Phone, Loader2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { submitDemoInvite } from '@/app/actions/leads'; // Adjust path if needed

interface InviteColleagueModalProps {
    isOpen: boolean;
    onClose: () => void;
    senderName: string;
    senderEmail: string;
}

export default function InviteColleagueModal({
    isOpen,
    onClose,
    senderName,
    senderEmail,
}: InviteColleagueModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
        message: '',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.recipientName || !formData.recipientEmail) {
            showToast('Name and Email are required.', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await submitDemoInvite({
                senderName,
                senderEmail,
                recipientName: formData.recipientName,
                recipientEmail: formData.recipientEmail,
                recipientPhone: formData.recipientPhone,
                message: formData.message,
            });

            if (response?.error) {
                showToast(response.error, 'error');
            } else {
                showToast('Invitation sent successfully!', 'success');
                onClose();
                setFormData({ recipientName: '', recipientEmail: '', recipientPhone: '', message: '' });
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-indigo-500" />
                            Invite Colleague
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Share Schologic with faculty or administrators.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm relative z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Sender Context (Read Only) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Sending As</span>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                    {senderName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{senderName}</p>
                                    <p className="text-xs text-slate-500">{senderEmail}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 focus-within:text-indigo-600 text-slate-700 transition-colors">
                                <label className="text-xs font-bold uppercase tracking-wider pl-1">Recipient Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleChange}
                                        placeholder="Jane Doe"
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm shadow-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-indigo-600 text-slate-700 transition-colors">
                                <label className="text-xs font-bold uppercase tracking-wider pl-1">Recipient Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        name="recipientEmail"
                                        value={formData.recipientEmail}
                                        onChange={handleChange}
                                        placeholder="jane@university.edu"
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm shadow-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 focus-within:text-indigo-600 text-slate-700 transition-colors">
                            <label className="text-xs font-bold uppercase tracking-wider pl-1">Phone Number (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    name="recipientPhone"
                                    value={formData.recipientPhone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 focus-within:text-indigo-600 text-slate-700 transition-colors">
                            <label className="text-xs font-bold uppercase tracking-wider pl-1">Personal Message (Optional)</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="I thought you might find this platform useful for your department..."
                                className="w-full flex min-h-[100px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.recipientName || !formData.recipientEmail}
                            className="min-w-[140px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Invite
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
