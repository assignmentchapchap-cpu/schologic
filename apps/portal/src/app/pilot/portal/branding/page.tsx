import { Metadata } from 'next';
import { getCurrentPilotRequest } from '@/app/actions/pilotPortal';
import { BrandingClient } from './BrandingClient';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Branding | Pilot Management Portal',
    description: 'Customize your institution login page branding.',
};

export default async function PilotBrandingPage() {
    const res = await getCurrentPilotRequest();

    if (res.error || !res.data) {
        redirect('/login');
    }

    const { pilot, profile } = res.data;

    return (
        <div>
            <BrandingClient pilot={pilot} profile={profile} />
        </div>
    );
}
