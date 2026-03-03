'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { notifyTeamMembers, notifySuperadmin } from './pilotNotifications';

/**
 * Notifies all team members when a tab is finalized.
 */
export async function notifyTabFinalized(pilotRequestId: string, tabName: string, userId: string) {
    await notifyTeamMembers({
        pilotRequestId,
        message: `${tabName} tab has been finalized`,
        type: 'pilot_tab_finalized',
        link: '/pilot/portal/preview',
        excludeUserId: userId,
    });
}

/**
 * Notifies all team members when a tab is reactivated.
 */
export async function notifyTabReactivated(pilotRequestId: string, tabName: string, userId: string) {
    await notifyTeamMembers({
        pilotRequestId,
        message: `${tabName} tab has been reopened for editing`,
        type: 'pilot_tab_reactivated',
        link: `/pilot/portal/${tabName.toLowerCase()}`,
        excludeUserId: userId,
    });
}

/**
 * Notifies all team members + superadmin when the pilot is submitted.
 */
export async function notifyPilotSubmitted(pilotRequestId: string, institution: string) {
    // Notify all team members
    await notifyTeamMembers({
        pilotRequestId,
        message: 'The pilot blueprint has been submitted for provisioning!',
        type: 'pilot_submitted',
        link: '/pilot/portal/preview',
    });

    // Notify superadmin
    await notifySuperadmin({
        message: `${institution} pilot submitted — ready for provisioning`,
        type: 'pilot_submitted_admin',
        link: '/admin/leads',
    });
}
