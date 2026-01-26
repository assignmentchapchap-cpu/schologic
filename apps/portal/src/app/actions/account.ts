'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
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

export async function claimDemoAccount(password: string) {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

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

        // 4. Trigger Verification Email
        const { error: emailError } = await supabaseAdmin.auth.resend({
            type: 'signup',
            email: email
        });

        if (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Non-fatal? If we set email_confirm=false, they are locked out if email fails.
            // We should probably revert or warn.
            // But for now, returning success but noting the email issue might be best?
            // No, strict requirement. Throw.
            throw new Error("Failed to send verification email. Please contact support.");
        }

        return { success: true };

    } catch (error: any) {
        console.error("Claim Account Error:", error);
        return { error: error.message || 'Failed to claim account.' };
    }
}
