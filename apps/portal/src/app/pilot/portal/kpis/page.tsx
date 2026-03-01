import { Metadata } from 'next';
import { getCurrentPilotRequest } from '@/app/actions/pilotPortal';
import { KPIsClient } from './KPIsClient';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'KPIs | Pilot Management Portal',
    description: 'Define key performance indicators for your pilot.',
};

export default async function PilotKPIsPage() {
    const res = await getCurrentPilotRequest();

    if (res.error || !res.data) {
        redirect('/login');
    }

    const { pilot, identity } = res.data;
    const profile = identity;

    return (
        <div>
            <KPIsClient pilot={pilot} profile={profile} />
        </div>
    );
}
