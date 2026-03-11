'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { invalidateCache } from '@/lib/cache';
import { randomBytes } from 'crypto';
import { renderTemplate, sendEmail } from '@/app/actions/adminEmails';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ensureAuthenticated() {
  const cookieStore = await cookies();
  const supabaseSession = createSessionClient(cookieStore);
  const { data: { user }, error: authError } = await supabaseSession.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // Check if superadmin
  const userRole = user.app_metadata?.role || user.user_metadata?.role;
  if (userRole !== 'superadmin') {
    throw new Error('Unauthorized: Superadmin access required');
  }

  return user;
}

export async function approvePilotRequest(pilotRequestId: string) {
  try {
    await ensureAuthenticated();

    // 1. Fetch the pilot request to get details
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('pilot_requests')
      .select('*')
      .eq('id', pilotRequestId)
      .single();

    if (fetchError || !lead) {
      throw new Error('Pilot request not found');
    }

    if (lead.champion_id) {
      throw new Error('This pilot request has already been approved.');
    }

    // 2. Generate a highly secure random password
    const tempPassword = randomBytes(24).toString('base64');
    const fullName = `${lead.first_name} ${lead.last_name}`;

    // 3. Instantiate the auth user (Instructor role)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lead.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'instructor' },
      app_metadata: { role: 'instructor' },
    });

    if (authError) {
      console.error('createUser error:', authError);
      throw new Error(`Failed to create Auth User: ${authError.message}`);
    }

    const newUserId = authData.user.id;

    // 4. Upsert the corresponding row into profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: newUserId,
      email: lead.email,
      full_name: fullName,
      role: 'instructor',
      is_active: true,
      is_demo: false,
    });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      throw new Error('Failed to create user profile');
    }

    // 5. Link in pilot_requests (Set champion_id)
    const { error: linkError } = await supabaseAdmin
      .from('pilot_requests')
      .update({ champion_id: newUserId })
      .eq('id', pilotRequestId);

    if (linkError) {
      console.error('Pilot request update error:', linkError);
      throw linkError;
    }

    // 6. Link in pilot_team_members (Grant full permissions)
    const { error: teamError } = await supabaseAdmin
      .from('pilot_team_members')
      .insert({
        pilot_request_id: pilotRequestId,
        user_id: newUserId,
        is_champion: true,
        tab_permissions_jsonb: {
          team: "write",
          scope: "write",
          kpis: "write",
          branding: "write",
          settings: "write",
          dashboard: "write",
          submit: "write"
        }
      });

    if (teamError) {
      console.error('Team member insert error:', teamError);
      throw new Error('Failed to grant pilot permissions');
    }

    // 7. Clear caches
    await invalidateCache('admin:users');
    await invalidateCache('admin:leads:pilots');

    // 8. Send Welcome Email (directing to OTP Setup)
    const securityId = `SC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const { subject, html } = await renderTemplate('Pilot Environment Approved', {
      first_name: lead.first_name,
      institution: lead.institution,
      email: lead.email,
      securityId
    });

    const { error: sendError } = await sendEmail({
      from: 'Schologic Partnership Team <onboarding@schologic.com>',
      to: [lead.email],
      subject: subject || 'Pilot Environment Approved & Ready - Schologic LMS',
      html: html!
    });

    if (sendError) {
      console.error('Email send error:', sendError);
      // We don't throw, as the account is created, but log it.
    }

    return { success: true };
  } catch (error: any) {
    console.error('approvePilotRequest error:', error);
    return { error: error.message || 'Failed to approve pilot request' };
  }
}
