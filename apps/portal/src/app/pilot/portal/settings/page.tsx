import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings | Pilot Management Portal',
    description: 'Configure instructor and student permissions.',
};

export default function PilotSettingsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Permission Settings</h1>
            <p className="text-slate-600">Configure global sandbox governance and AI overrides.</p>
            {/* Phase 4 UI goes here */}
        </div>
    );
}
