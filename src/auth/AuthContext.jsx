import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (user) => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from("profiles").select("id,name,username").eq("id", user.id).maybeSingle();
    setProfile(data || {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "ProofMe User",
      username: user.user_metadata?.username || user.id.slice(0, 8),
    });
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      loadProfile(data.session?.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      await loadProfile(nextSession?.user);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    profile,
    loading,
    configured: Boolean(supabase),
    async signOut() {
      if (supabase) await supabase.auth.signOut();
    },
    async refreshProfile() {
      await loadProfile(session?.user);
    },
  }), [session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
