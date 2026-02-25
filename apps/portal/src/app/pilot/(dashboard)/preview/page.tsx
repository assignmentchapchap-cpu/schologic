import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Preview & Submit | Pilot Management Portal',
    description: 'Review and finalize your pilot configuration.',
};

export default function PilotPreviewPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Preview & Submit</h1>
            <p className="text-slate-600">Review your full blueprint and submit for provisioning.</p>
            {/* Phase 4 UI goes here */}
        </div>
    );
}
