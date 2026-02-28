import { Metadata } from 'next';
import { AdminDashboardClient } from './AdminDashboardClient';
import { getCurrentPilotRequest } from '@/app/actions/pilotPortal';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Pilot Management Portal',
    description: 'Configure initial views and metrics for your team.',
};

export default async function PilotDashboardConfigPage() {
    const res = await getCurrentPilotRequest();

    if (res.error || !res.data) {
        redirect('/login');
    }

    const { pilot, profile } = res.data;

    return (
        <div>
            <AdminDashboardClient pilot={pilot} profile={profile} />
        </div>
    );
}
