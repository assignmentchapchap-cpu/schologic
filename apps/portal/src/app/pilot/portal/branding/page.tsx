import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Branding | Pilot Management Portal',
    description: 'Configure white-label visuals.',
};

export default function PilotBrandingPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Branding</h1>
            <p className="text-slate-600">Upload logos and configure theme colors.</p>
            {/* Phase 4 UI goes here */}
        </div>
    );
}
