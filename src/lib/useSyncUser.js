import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { supabase } from './supabase';

export function useSyncUser() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    async function sync() {
      if (isLoaded && isSignedIn && user) {
        // Attempt to find profile in Supabase
        const { data: profile, error: selectError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // If no profile exists, create one!
        if (selectError || !profile) {
          console.log('[Inkora Sync] Creating new profile for Clerk user:', user.id);
          
          // Get role from Clerk metadata (public or unsafe) or default to 'client'
          const role = user.publicMetadata?.role || 
                       user.unsafeMetadata?.role || 
                       localStorage.getItem('inkoraRole') || 
                       'client';
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0],
                avatar_url: user.imageUrl,
                email: user.primaryEmailAddress?.emailAddress,
                role: role,
                subscription_plan: 'free',
                subscription_status: 'inactive'
              }
            ]);

          if (insertError) {
            console.error('[Inkora Sync] Error creating profile:', insertError.message);
          } else {
            console.log('[Inkora Sync] Profile created successfully!');
          }
        } else {
          // Profile exists, and could eventually be updated here if image/name changed
          // console.log('[Inkora Sync] Profile already exists in Supabase.');
        }
      }
    }

    sync();
  }, [isLoaded, isSignedIn, user]);

  return { isLoaded, isSignedIn, user };
}
