import { Metadata } from 'next';
import { getCurrentPilotRequest } from '@/app/actions/pilotPortal';
import { getTeamMembers } from '@/app/actions/pilotTeam';
import { TeamTasksClient } from './TeamTasksClient';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Team & Tasks | Pilot Management Portal',
    description: 'Manage your pilot team and deployment tasks.',
};

export default async function PilotTeamPage() {
    const res = await getCurrentPilotRequest();

    if (res.error || !res.data) {
        redirect('/login');
    }

    const { pilot, identity } = res.data;
    const membership = identity.pilot_permissions;
    const profile = identity;

    const membersRes = await getTeamMembers();
    const members = (membersRes?.data || []).map((m: any) => ({
        ...m,
        tab_permissions_jsonb: (m.tab_permissions_jsonb || {}) as Record<string, string>,
        created_at: m.created_at || '',
        profiles: m.profiles ? {
            first_name: m.profiles.first_name || '',
            last_name: m.profiles.last_name || '',
            email: m.profiles.email || '',
        } : null,
    }));

    return (
        <div>
            <TeamTasksClient
                pilot={pilot}
                profile={profile}
                membership={membership}
                initialMembers={members}
            />
        </div>
    );
}
