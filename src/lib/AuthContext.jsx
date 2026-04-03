import { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase, createClerkSupabaseClient } from './supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { getToken } = useClerkAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        if (!userId) {
            setProfile(null);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data);
            } else if (error) {
                console.warn('Profile not found or Supabase error:', error.message);
            }
        } catch (e) {
            console.error('Critical error fetching profile:', e);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Helper to get a supabase client authenticated with the current Clerk user.
     * This is useful for writing data that requires RLS.
     */
    const getSupabase = async () => {
        const token = await getToken({ template: 'supabase' });
        return createClerkSupabaseClient(token);
    };

    useEffect(() => {
        if (clerkLoaded) {
            if (clerkUser) {
                fetchProfile(clerkUser.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        }
    }, [clerkUser, clerkLoaded]);

    const value = {
        user: clerkUser,
        profile,
        loading: !clerkLoaded || loading,
        getSupabase,
        signOut: () => {}, // Handled by Clerk components or Clerk's useClerk
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
