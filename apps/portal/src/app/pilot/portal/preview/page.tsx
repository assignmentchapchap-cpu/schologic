import { Metadata } from 'next';
import { getCurrentPilotRequest } from '@/app/actions/pilotPortal';
import { getTeamMembers } from '@/app/actions/pilotTeam';
import { PreviewClient } from './PreviewClient';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Preview & Submit | Pilot Management Portal',
    description: 'Review and finalize your pilot configuration.',
};

export default async function PilotPreviewPage() {
    const res = await getCurrentPilotRequest();
    const teamRes = await getTeamMembers();

    if (res.error || !res.data) {
        redirect('/login');
    }

    const { pilot, identity } = res.data;
    const profile = identity;
    const membership = identity.pilot_permissions; // This usually contains is_champion
    const members = teamRes.data || [];

    return (
        <PreviewClient
            pilot={pilot}
            profile={profile}
            membership={membership}
            members={members}
        />
    );
}
