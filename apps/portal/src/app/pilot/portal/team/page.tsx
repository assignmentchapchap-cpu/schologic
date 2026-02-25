import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Team & Tasks | Pilot Management Portal',
    description: 'Manage your pilot team and deployment tasks.',
};

export default function PilotTeamPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Team & Tasks</h1>
            <p className="text-slate-600">Invite team members, configure roles, and track deployment tasks here.</p>
            {/* Phase 4 UI goes here */}
        </div>
    );
}
