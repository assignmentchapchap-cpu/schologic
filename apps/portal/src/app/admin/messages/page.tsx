'use client';

import MessagingDashboard from '@/components/messaging/MessagingDashboard';

/**
 * Admin Messaging Page
 * 
 * Provides a dedicated messaging interface for Superadmins within the admin dashboard.
 * Uses the standard MessagingDashboard to manage communications initiated by or sent to the admin.
 */
export default function AdminMessagesPage() {
    return (
        <div className="h-full bg-white overflow-hidden flex flex-col">
            <MessagingDashboard />
        </div>
    );
}
