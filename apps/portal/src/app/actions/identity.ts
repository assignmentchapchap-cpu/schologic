'use server';

import { createSessionClient } from '@schologic/database';
import { cookies } from 'next/headers';
import { getUserIdentity, UserIdentity } from '@/lib/identity-server';

/**
 * Server Action: Fetches the identity of the currently authenticated user.
 * This is used primarily by UserContext on the client to get role and demo status.
 */
export async function getUserAction(): Promise<UserIdentity | null> {
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return await getUserIdentity(user.id);
}
