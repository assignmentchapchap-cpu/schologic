'use client';

import MessagingDashboard from '@/components/messaging/MessagingDashboard';

export default function StudentMessagesPage() {
    return (
        <div className="w-full md:h-[calc(100dvh-64px)] md:overflow-hidden animate-in fade-in duration-500">
            <MessagingDashboard />
        </div>
    );
}
