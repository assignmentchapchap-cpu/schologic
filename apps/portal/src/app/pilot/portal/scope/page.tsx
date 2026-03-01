import { Metadata } from 'next';
import { getCurrentPilotRequest } from '@/app/actions/pilotPortal';
import { ScopeClient } from './ScopeClient';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Scope | Pilot Management Portal',
    description: 'Define modules, constraints, and target departments.',
};

export default async function PilotScopePage() {
    const res = await getCurrentPilotRequest();

    if (res.error || !res.data) {
        redirect('/login');
    }

    const { pilot, identity } = res.data;
    const profile = identity;

    return (
        <div>
            <ScopeClient pilot={pilot} profile={profile} />
        </div>
    );
}
