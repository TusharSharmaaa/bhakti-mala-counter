import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  display_name: string | null;
  locale: string;
  use_devanagari: boolean;
  daily_target: number;
  sound_enabled: boolean;
  sound_option: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }

      setLoading(false);
    };

    loadProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update settings');
    } else {
      toast.success('Settings updated successfully');
    }
  };

  return {
    profile,
    loading,
    updateProfile,
  };
}
