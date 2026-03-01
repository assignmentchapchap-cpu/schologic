import { Metadata } from 'next';
import { SettingsClient } from './SettingsClient';
import { getCurrentPilotRequest } from '@/app/actions/pilotPortal';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Settings | Pilot Management Portal',
    description: 'Configure instructor and student permissions.',
};

export default async function PilotSettingsPage() {
    const res = await getCurrentPilotRequest();

    if (res.error || !res.data) {
        redirect('/login');
    }

    const { pilot, identity } = res.data;
    const profile = identity;

    return (
        <div>
            <SettingsClient pilot={pilot} profile={profile} />
        </div>
    );
}
