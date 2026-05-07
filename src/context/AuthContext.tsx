import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { SAFE_MODE } from '../config/features';

console.log("[BOOT_STAGE] AuthContext.tsx loaded");

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

  const refreshProfile = async () => {
    if (SAFE_MODE) {
      console.log("[BOOT_STAGE] Auth: refreshProfile called (SAFE_MODE)");
    }
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (user) {
        if (SAFE_MODE) console.log("[BOOT_STAGE] Auth: User identified", user.id);
        
        // Fetch profile with error handling - handle case where user exists in Auth but not in public.profiles yet
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Using maybeSingle to avoid 406/single errors
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("[AUTH] Profile fetch error:", profileError);
        }

        if (profileData) {
          if (SAFE_MODE) console.log("[BOOT_STAGE] Auth: Profile data loaded");
          setProfile(profileData);
        } else {
          // Profile doesn't exist, try to create it (self-healing)
          console.log("[AUTH] Profile not found, creating one for:", user.id);
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
        }
      }
    } catch (err) {
      console.error("[AUTH] Refresh profile critical failure:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    console.log("[BOOT_STAGE] AuthProvider initialized");

    const initializeAuth = async () => {
      try {
        console.log("[BOOT_STAGE] Auth: Initializing Session...");
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        console.log("[BOOT_STAGE] Auth: Session result:", session ? "Active" : "None");
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await refreshProfile();
        }
      } catch (err) {
        console.error("[AUTH] Initialization error:", err);
      } finally {
        if (isMounted) {
          console.log("[BOOT_STAGE] Auth: Initialization complete");
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setLoading(true);
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
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
