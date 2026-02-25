import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'KPIs | Pilot Management Portal',
    description: 'Define key performance indicators for your pilot.',
};

export default function PilotKPIsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Pilot KPIs</h1>
            <p className="text-slate-600">Select and define measurement criteria for success.</p>
            {/* Phase 4 UI goes here */}
        </div>
    );
}
