import { Metadata } from 'next';
import PilotAuthForm from '@/components/auth/PilotAuthForm';

export const metadata: Metadata = {
    title: 'Pilot Setup | Schologic',
    description: 'Set up your Schologic Pilot Management Portal account',
};

export default function PilotSetupPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <img
                    src="/logo_updated.png"
                    alt="Schologic"
                    className="mx-auto h-[2.25rem] w-auto mb-6"
                />
                <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Complete Account Setup</h2>
                <p className="mt-2 text-sm text-slate-500 font-light">
                    Welcome to the Pilot Management Portal. Please create a password to secure your account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-6 sm:rounded-2xl sm:px-12 border border-slate-200 shadow-sm">
                    <PilotAuthForm type="setup" />
                </div>
            </div>
        </div>
    );
}
