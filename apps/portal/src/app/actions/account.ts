'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { createSessionClient } from '@schologic/database';


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

export async function upgradeDemoAccount(newEmail: string) {
  const cookieStore = await cookies();
  const supabase = createSessionClient(cookieStore);

  // 1. Verify Current User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Allow upgrade if they are demo OR if they are stuck in the "just wiped" state but not yet verify-converted? 
  // Actually, we remove is_demo at the end of this function, so they should still have it.
  if (user.user_metadata?.is_demo !== true) {
    // Edge case: If they are retrying?
    // Let's rely on the flag.
    return { error: 'This account is not in Demo mode.' };
  }

  const userId = user.id;

  try {
    // 2. Wipe Demo Data (Classes, Assets, etc.)
    const { error: classError } = await supabaseAdmin
      .from('classes')
      .delete()
      .eq('instructor_id', userId);

    if (classError) throw new Error(`Failed to wipe classes: ${classError.message}`);

    const { error: assetError } = await supabaseAdmin
      .from('assets')
      .delete()
      .eq('instructor_id', userId);

    if (assetError) throw new Error(`Failed to wipe files: ${assetError.message}`);

    // 3. Update User Metadata (Remove Demo Flag, Ensure Instructor Role)
    const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: newEmail, // Update email if changed
      email_confirm: true, // Auto-confirm since they will verify via OTP immediately after
      user_metadata: {
        ...user.user_metadata,
        is_demo: false,
        role: 'instructor',
        demo_converted_at: new Date().toISOString()
      },
      app_metadata: {
        ...user.app_metadata,
        role: 'instructor'
      }
    });

    if (updateUserError) throw updateUserError;

    return { success: true };

  } catch (error: any) {
    console.error("Upgrade Account Error:", error);
    return { error: error.message || 'Failed to upgrade account.' };
  }
}

export async function sendDemoRecoveryOTP(email: string) {
  const headerStore = await headers();
  let origin = headerStore.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (process.env.NODE_ENV === 'development' && origin.includes('schologic.com')) {
    origin = 'http://localhost:3000';
  }

  try {
    // 1. Verify User Exists
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { error: 'User not found' };
    }

    // 2. Verify Demo Status
    if (user.user_metadata?.is_demo !== true) {
      return { error: 'This email belongs to a standard account. Please log in normally.' };
    }

    // 3. Send OTP (Standard Supabase Auth)
    // We use signInWithOtp which sends a code to the email
    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
      }
    });

    if (otpError) throw otpError;

    return { success: true };

  } catch (error: any) {
    console.error("Recovery OTP Error:", error);
    return { error: error.message || 'Failed to send recovery code' };
  }
}


export async function verifyDemoRecoveryOTP(email: string, token: string) {
  const cookieStore = await cookies();
  const supabase = createSessionClient(cookieStore);

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) throw error;

    return { success: true, session: data.session };
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return { error: error.message || 'Invalid code' };
  }
}
