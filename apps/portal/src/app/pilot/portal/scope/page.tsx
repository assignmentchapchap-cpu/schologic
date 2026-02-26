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

    const { pilot } = res.data;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Pilot Blueprint Scope</h1>
                <p className="text-slate-500 text-sm">Define what modules will be tested and constraints on the deployment.</p>
            </div>
            <ScopeClient pilot={pilot} />
        </div>
    );
}
