import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CounterData {
  count: number;
  today_count: number;
  last_date: string;
}

export function useCounter() {
  const { user } = useAuth();
  const [counter, setCounter] = useState<CounterData>({
    count: 0,
    today_count: 0,
    last_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  // Load counter data from database
  useEffect(() => {
    if (!user) return;

    const loadCounter = async () => {
      const { data, error } = await supabase
        .from('counters')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading counter:', error);
        toast.error('Failed to load counter data');
        setLoading(false);
        return;
      }

      if (data) {
        // Check if it's a new day
        const today = new Date().toISOString().split('T')[0];
        if (data.last_date !== today) {
          // New day - reset today_count
          const { error: updateError } = await supabase
            .from('counters')
            .update({
              today_count: 0,
              last_date: today,
            })
            .eq('user_id', user.id);

          if (!updateError) {
            setCounter({
              count: data.count,
              today_count: 0,
              last_date: today,
            });
          }
        } else {
          setCounter({
            count: data.count,
            today_count: data.today_count,
            last_date: data.last_date,
          });
        }
      }

      setLoading(false);
    };

    loadCounter();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('counter_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'counters',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            setCounter({
              count: newData.count,
              today_count: newData.today_count,
              last_date: newData.last_date,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const increment = async () => {
    if (!user) return;

    const newCount = counter.count + 1;
    const newTodayCount = counter.today_count + 1;
    const today = new Date().toISOString().split('T')[0];

    // Optimistic update
    setCounter({
      count: newCount,
      today_count: newTodayCount,
      last_date: today,
    });

    // Update database
    const { error } = await supabase
      .from('counters')
      .update({
        count: newCount,
        today_count: newTodayCount,
        last_date: today,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating counter:', error);
      toast.error('Failed to save count');
      // Revert optimistic update
      setCounter(counter);
    }

    // Update streak if milestone
    if (newCount % 108 === 0) {
      await updateStreak();
    }
  };

  const reset = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('counters')
      .update({
        count: 0,
        today_count: 0,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error resetting counter:', error);
      toast.error('Failed to reset counter');
    } else {
      setCounter((prev) => ({
        ...prev,
        count: 0,
        today_count: 0,
      }));
      toast.success('Counter reset successfully');
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    const { data: streakData, error: fetchError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !streakData) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = streakData.current_streak;
    
    if (!streakData.last_jap_date || streakData.last_jap_date === yesterdayStr) {
      newStreak += 1;
    } else if (streakData.last_jap_date !== today) {
      newStreak = 1;
    }

    const newTotalMalas = streakData.total_malas + 1;
    const newLongestStreak = Math.max(streakData.longest_streak, newStreak);

    await supabase
      .from('streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        total_malas: newTotalMalas,
        last_jap_date: today,
      })
      .eq('user_id', user.id);
  };

  return {
    counter,
    loading,
    increment,
    reset,
  };
}
