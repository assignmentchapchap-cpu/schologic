'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { createSessionClient } from '@schologic/database';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Admin client for privileged operations (wiping data, updating auth flags)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function claimDemoAccount(password: string) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const supabase = createSessionClient(cookieStore);

  // Robust Origin Detection
  let origin = headerStore.get('origin');
  if (!origin) {
    const forwardedHost = headerStore.get('x-forwarded-host');
    if (forwardedHost) {
      origin = forwardedHost.startsWith('http') ? forwardedHost : `https://${forwardedHost}`;
    }
  }
  if (!origin) {
    origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  // Dev Safety Net
  if (process.env.NODE_ENV === 'development' && origin.includes('schologic.com')) {
    origin = 'http://localhost:3000';
  }

  // 1. Verify Current User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (user.user_metadata?.is_demo !== true) {
    throw new Error('This account is not in Demo mode.');
  }

  try {
    const userId = user.id;
    const email = user.email!;

    // 2. Wipe Data (Nuclear Option)
    // Order matters for FK constraints if CASCADE is not set perfect, 
    // but we added CASCADE in repair_permissions.sql so deleting parent records should work.
    // However, we want to keep the *User* and *Profile*, just delete their created content.

    // A. Delete Submissions (by students in this class? No, we delete Classes)
    // B. Delete Classes (Cascades to Enrollments, ClassAssets, Assignments, Submissions)
    const { error: classError } = await supabaseAdmin
      .from('classes')
      .delete()
      .eq('instructor_id', userId);

    if (classError) throw new Error(`Failed to wipe classes: ${classError.message}`);

    // C. Delete Assets (Cascades to ClassAssets)
    const { error: assetError } = await supabaseAdmin
      .from('assets')
      .delete()
      .eq('instructor_id', userId);

    if (assetError) throw new Error(`Failed to wipe files: ${assetError.message}`);

    // 3. Update Password
    const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: password,
      user_metadata: {
        ...user.user_metadata,
        is_demo: false, // Remove flag
        demo_converted_at: new Date().toISOString() // Analytics tracking
      },
      email_confirm: false // STRICT VERIFICATION: Require email confirmation again
    });

    if (passError) throw passError;

    // 4. Trigger Verification Email (Manual Link + Resend)
    // We use 'magiclink' because the user already exists. 'signup' fails for existing users.
    // Clicking this link will log them in and verify their email ownership.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${origin}/auth/callback`
      }
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Link Gen Error:", JSON.stringify(linkError, null, 2));
      throw new Error(`Failed to generate verification link: ${linkError?.message || 'Unknown error'}`);
    }

    const actionLink = linkData.properties.action_link;

    const { error: resendError } = await resend.emails.send({
      from: 'Schologic Team <onboarding@schologic.com>', // Update this domain if needed
      to: email,
      subject: 'Verify your Schologic Account',
      html: `
<div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 550px; margin: 0 auto; line-height: 1.5; color: #334155;">
  <!-- Minimalist Header -->
  <p style="font-size: 12px; color: #94a3b8; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
    SCHOLOGIC PORTAL SYSTEM // AUTHENTICATION_SERVICE
  </p>

  <p>Hello,</p>
  
  <p>To finalize the setup of your <strong>Schologic</strong> account and access your dashboard, please verify your email address by clicking the link below:</p>

  <!-- Clean, Non-Glowy Button -->
  <div style="margin: 30px 0;">
    <a href="${actionLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
      Verify Email Address
    </a>
  </div>

  <p style="font-size: 13px; color: #64748b;">
    If you're having trouble with the button, copy and paste this URL into your browser:<br>
    <a href="${actionLink}" style="color: #6366f1; word-break: break-all;">${actionLink}</a>
  </p>

  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
    <p>This message was sent to confirm your identity on Schologic.com. If you did not sign up for an account, please ignore this email.</p>
     <!-- Institutional Footer -->
  <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #cbd5e1; text-align: center;">
    <p style="margin-bottom: 4px;">This is an automated email. Please reply to <a href="mailto:info@schologic.com" style="color: inherit;">info@schologic.com</a></p>
    <p style="margin-bottom: 4px;">Sent by Schologic LMS</p>
    <p style="margin-bottom: 4px;">For Queries Contact +254 108289977</p>
    <p style="margin-bottom: 4px;">Mang'u Road, Nairobi, Kenya</p>
    <p>Security ID: ${linkData.user?.id ? linkData.user.id.split('-')[0].toUpperCase() : 'SEC-TOKEN'}</p>
  </div>
  </div>
</div>
            `
    });

    if (resendError) {
      console.error("Resend API Error:", resendError);
      throw new Error("Failed to send verification email via Resend.");
    }

    return { success: true };

  } catch (error: any) {
    console.error("Claim Account Error:", error);
    return { error: error.message || 'Failed to claim account.' };
  }
}

export async function sendDemoRecoveryEmail(email: string) {
  const headerStore = await headers();

  // Prefer 'origin' or 'x-forwarded-host' from the request
  // Fallback to NEXT_PUBLIC_SITE_URL, then localhost
  let origin = headerStore.get('origin');

  if (!origin) {
    const forwardedHost = headerStore.get('x-forwarded-host');
    if (forwardedHost) {
      origin = forwardedHost.startsWith('http') ? forwardedHost : `https://${forwardedHost}`;
    }
  }

  // Final fallback
  if (!origin) {
    origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  // Development override: If running locally but env var points to prod, force localhost if header is missing
  // (This handles cases where server actions might lose origin in some setups, though rare)
  if (process.env.NODE_ENV === 'development' && origin.includes('schologic.com')) {
    console.log("Dev mode suspected, but origin is prod. Defaulting to localhost.");
    origin = 'http://localhost:3000';
  }

  try {
    // 1. Get User ID (Service Role)
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { error: 'User not found' };
    }

    // 2. Generate Recovery Link (Password Reset)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/instructor/settings`
      }
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Recovery Link Gen Error:", JSON.stringify(linkError, null, 2));
      throw new Error("Failed to generate recovery link");
    }

    const actionLink = linkData.properties.action_link;

    // 3. Send Email via Resend
    const { error: resendError } = await resend.emails.send({
      from: 'Schologic Team <onboarding@schologic.com>',
      to: email,
      subject: 'Reset your Schologic Password',
      html: `
<div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 550px; margin: 0 auto; line-height: 1.5; color: #334155;">
  <p style="font-size: 12px; color: #94a3b8; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
    SCHOLOGIC PORTAL SYSTEM // SECURITY_SERVICE
  </p>

  <p>Hello,</p>
  
  <p>We received a request to reset the password for your <strong>Schologic</strong> account.</p>

  <div style="margin: 30px 0;">
    <a href="${actionLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
      Reset Password
    </a>
  </div>

  <p style="font-size: 13px; color: #64748b;">
    Or paste this URL into your browser:<br>
    <a href="${actionLink}" style="color: #6366f1; word-break: break-all;">${actionLink}</a>
  </p>

  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
    <p>If you did not request this link, you can safely ignore this email.</p>
    
    <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #cbd5e1; text-align: center;">
        <p style="margin-bottom: 4px;">This is an automated email. Please reply to <a href="mailto:info@schologic.com" style="color: inherit;">info@schologic.com</a></p>
        <p style="margin-bottom: 4px;">Sent by Schologic LMS</p>
        <p>Security ID: ${user.id.split('-')[0].toUpperCase()}</p>
    </div>
  </div>
</div>
            `
    });

    if (resendError) throw new Error("Failed to send email");

    return { success: true };

  } catch (error: any) {
    console.error("Recovery Error:", error);
    return { error: error.message || 'Failed to send login link' };
  }
}
