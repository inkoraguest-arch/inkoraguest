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

        // 1. Ensure Profile Exists or Create it
        if (selectError || !profile) {
          console.log('[Inkora Sync] Creating new profile for Clerk user:', user.id);
          
          const role = user.publicMetadata?.role || 
                       user.unsafeMetadata?.role || 
                       localStorage.getItem('inkoraRole') || 
                       'client';
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
                id: user.id,
                full_name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0],
                avatar_url: user.imageUrl,
                email: user.primaryEmailAddress?.emailAddress,
                role: role,
                subscription_plan: 'free',
                subscription_status: 'inactive'
            }]);

          if (insertError) {
            console.error('[Inkora Sync] Error creating profile:', insertError.message);
            return;
          }
        }

        // 2. RETROACTIVE FIX: Ensure Artist/Studio record exists!
        // Prioritize: Public Metadata -> Unsafe Metadata -> LocalStorage -> 'client'
        const role = user.publicMetadata?.role || 
                     user.unsafeMetadata?.role || 
                     localStorage.getItem('inkoraRole') || 
                     'client';

        if (role === 'artist' || role === 'admin') {
          const { data: artistExists } = await supabase.from('artists').select('profile_id').eq('profile_id', user.id).single();
          if (!artistExists) {
            console.log('[Inkora Sync] Creating missing artist record for profile with role:', role);
            await supabase.from('artists').insert([{ profile_id: user.id, bio: 'Artista profissional no Inkora.', portfolio_urls: [] }]);
          }
        } else if (role === 'studio') {
          const { data: studioExists } = await supabase.from('studios').select('profile_id').eq('profile_id', user.id).single();
          if (!studioExists) {
            console.log('[Inkora Sync] Creating missing studio record for existing profile');
            await supabase.from('studios').insert([{ profile_id: user.id, bio: 'Estúdio profissional no Inkora.', studio_photos: [] }]);
          }
        }
      }
    }

    sync();
  }, [isLoaded, isSignedIn, user]);

  return { isLoaded, isSignedIn, user };
}
