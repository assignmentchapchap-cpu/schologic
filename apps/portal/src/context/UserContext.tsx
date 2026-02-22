'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getUserAction } from '@/app/actions/identity';

type UserContextType = {
    user: User | null;
    loading: boolean;
    isDemo: boolean;
    refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    isDemo: false,
    refreshUser: async () => { },
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);
    const supabase = createClient();

    const fetchUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Resolve role: app_metadata (secure) > user_metadata > profile cache
                let role = user.app_metadata?.role || user.user_metadata?.role;
                let isActive = user.user_metadata?.is_active;

                if (!role || isActive === undefined) {
                    const profile = await getUserAction();
                    if (profile) {
                        role = role || profile.role;
                        isActive = isActive !== undefined ? isActive : profile.is_active;
                    }
                }

                (user as any).role = role || 'student';
                setUser(user);
                setIsDemo(!!(user.user_metadata?.is_demo === true || user.email?.endsWith('@schologic.demo')));
            } else {
                setUser(null);
                setIsDemo(false);
            }
        } catch (error) {
            console.error("Error fetching user", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                const user = session?.user ?? null;
                if (user) {
                    let role = user.app_metadata?.role || user.user_metadata?.role;

                    if (!role) {
                        const profile = await getUserAction();
                        role = profile?.role;
                    }

                    (user as any).role = role || 'student';
                    setUser(user);
                    setIsDemo(!!(user.user_metadata?.is_demo === true || user.email?.endsWith('@schologic.demo')));
                } else {
                    setUser(null);
                }
                setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsDemo(false);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, isDemo, refreshUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}
