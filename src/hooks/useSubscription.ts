import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Subscription, isPremium } from '../lib/premium';
import { SAFE_MODE } from '../config/features';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      if (SAFE_MODE) {
        setSubscription(null);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Better than single() to avoid errors when no sub exists
        
        if (error) {
          console.error('Error fetching subscription:', error);
        }
        
        setSubscription(data);
      } catch (err) {
        console.error('Critical error in fetchSubscription:', err);
      } finally {
        setLoading(false);
      }
    };

    if (SAFE_MODE) return;

    // Real-time listener
    const channel = supabase
      .channel(`subscription_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setSubscription(payload.new as Subscription);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    subscription,
    loading,
    isPremium: isPremium(subscription),
    plan: subscription?.plan || 'free',
    status: subscription?.status || 'inactive'
  };
}
