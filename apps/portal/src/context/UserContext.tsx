'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from "@schologic/database";
import { User } from '@supabase/supabase-js';

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
            setUser(user);
            if (user?.user_metadata?.is_demo === true || user?.email?.endsWith('@schologic.demo')) {
                setIsDemo(true);
            } else {
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setUser(session?.user ?? null);
                if (session?.user?.user_metadata?.is_demo === true || session?.user?.email?.endsWith('@schologic.demo')) {
                    setIsDemo(true);
                } else {
                    setIsDemo(false);
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
