'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { invalidateCache } from '@/lib/cache';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY!);

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

    const { error: resendError } = await resend.emails.send({
      from: 'Schologic Partnership Team <onboarding@schologic.com>',
      to: lead.email,
      subject: 'Pilot Environment Approved & Ready - Schologic LMS',
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #ffffff; padding: 15px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
    <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Portal Access Notice</p>
    <p style="margin: 0; font-size: 11px; color: #94a3b8;">ID: ${securityId}</p>
  </div>
  
  <div style="padding: 30px;">
    <p style="font-size: 12px; color: #64748b; margin: 0 0 25px 0; background: #f8fafc; padding: 12px 16px; border-radius: 6px; border-left: 3px solid #cbd5e1;">
      <strong>Why are you receiving this?</strong> You recently submitted a pilot request for Schologic LMS on behalf of ${lead.institution}. This email confirms your request has been approved and your environment is ready.
    </p>

    <h2 style="margin: 0 0 20px 0; font-size: 22px; color: #0f172a;">Your Pilot Environment is Ready</h2>
    
    <p style="font-size: 15px; margin-bottom: 25px;">Hi ${lead.first_name},</p>
    
    <p style="font-size: 15px; margin-bottom: 25px;">
      We are pleased to inform you that your institutional pilot request for <strong>${lead.institution}</strong> has been fully approved and your initial sandbox environment has been provisioned.
    </p>
    
    <p style="font-size: 15px; margin-bottom: 30px;">
      As the designated Pilot Champion, you now have exclusive access to the Pilot Management Portal where you will configure your brand, scope, and modules before inviting your team.
    </p>

    <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #4f46e5;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold; color: #0f172a;">Access Instructions:</p>
      
      <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569;">
        <li style="margin-bottom: 15px;">Navigate to the secure portal setup page using the link below.</li>
        <li style="margin-bottom: 15px;">Enter your institutional email (<strong>${lead.email}</strong>).</li>
        <li style="margin-bottom: 15px;">Verify your identity using the one-time code sent to your inbox.</li>
        <li>Set your permanent administrative password to enter the portal.</li>
      </ol>

      <p style="margin: 25px 0 0 0; font-size: 15px; font-weight: 600;">
        Access Link: <a href="https://pilot.schologic.com/setup" style="color: #4f46e5; text-decoration: underline;">https://pilot.schologic.com/setup</a>
      </p>
    </div>

    <p style="font-size: 14px; margin-top: 40px;">Sincerely,<br/><span style="font-weight: bold; color: #0f172a;">Schologic Partnership Team</span></p>
  </div>

  <div style="background: #f8fafc; padding: 30px; border-top: 1px solid #f1f5f9;">
    <p style="font-size: 12px; color: #64748b; margin-bottom: 20px; text-align: center;">If you require technical assistance during setup, please contact us at <a href="mailto:support@schologic.com" style="color: #4f46e5; text-decoration: none;">support@schologic.com</a></p>
    <div style="text-align: center; color: #94a3b8; font-size: 11px;">
      <p style="margin-bottom: 5px;"><strong>Schologic LMS & Integrity Hub</strong></p>
      <p style="margin-bottom: 5px;">Regional HQ: Mang'u Road, Nairobi, Kenya</p>
      <p style="margin-bottom: 5px;">For Queries Contact +254 108289977</p>
      <p>Credible, Flexible, & Intelligent Learning.</p>
    </div>
  </div>
</div>
            `,
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      // We don't throw, as the account is created, but log it.
    }

    return { success: true };
  } catch (error: any) {
    console.error('approvePilotRequest error:', error);
    return { error: error.message || 'Failed to approve pilot request' };
  }
}
