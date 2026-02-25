import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scope | Pilot Management Portal',
    description: 'Define modules, constraints, and target departments.',
};

export default function PilotScopePage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Pilot Scope</h1>
            <p className="text-slate-600">Select core modules, value accelerators, and define participant caps.</p>
            {/* Phase 4 UI goes here */}
        </div>
    );
}
