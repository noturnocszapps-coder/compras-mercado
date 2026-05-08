import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null,
  profile: null, 
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("[DIAGNOSTIC] AuthProvider render", { user: user?.id, session: !!session, profile: !!profile, loading });

  const refreshProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (user) {
        // Fetch profile with error handling - handle case where user exists in Auth but not in public.profiles yet
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); 
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("[AUTH] Profile fetch error:", profileError);
        }

        if (profileData) {
          setProfile(profileData);
        } else {
          // Profile doesn't exist, try to create it (self-healing)
          console.log("[AUTH] Profile not found, creating one for:", user.id);
          try {
            const { data: newProfile, error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuário',
                email: user.email,
                avatar_url: user.user_metadata.avatar_url,
              })
              .select()
              .maybeSingle();
            
            if (upsertError) {
              console.error("[AUTH] Profile creation error:", upsertError);
            }
            if (newProfile) setProfile(newProfile);
          } catch (upsertErr) {
            console.error("[AUTH] Catch profile creation error:", upsertErr);
          }
        }
      }
    } catch (err) {
      console.error("[AUTH] Refresh profile critical failure:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("[STABILITY] Initializing Auth...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (sessionError) {
          console.error("[AUTH] Session error during init:", sessionError);
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await refreshProfile();
        }
      } catch (err) {
        console.error("[AUTH] Initialization error:", err);
      } finally {
        if (isMounted) {
          console.log("[AUTH_LOADING_DONE] Initial session checked");
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AUTH_EVENT] ${event}`);
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setLoading(true);
        try {
          await refreshProfile();
        } catch (error) {
          console.error("[AUTH] Change event refresh failure:", error);
        } finally {
          if (isMounted) {
            console.log("[AUTH_LOADING_DONE] Event profile refreshed");
            setLoading(false);
          }
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      profile, 
      loading, 
      signInWithGoogle, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
