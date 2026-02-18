'use client';

import MessagingDashboard from '@/components/messaging/MessagingDashboard';

export default function InstructorMessagesPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Messaging</h1>
                <p className="text-slate-500 font-bold">Manage conversations with students and administrators</p>
            </div>

            <MessagingDashboard />
        </div>
    );
}
