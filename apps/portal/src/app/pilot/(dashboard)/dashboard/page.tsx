import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Pilot Management Portal',
    description: 'Configure initial views and metrics for your team.',
};

export default function PilotDashboardConfigPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Admin Dashboard Configuration</h1>
            <p className="text-slate-600">Select layout views and widget metrics.</p>
            {/* Phase 4 UI goes here */}
        </div>
    );
}
