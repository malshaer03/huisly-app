"use client";

import { useEffect } from "react";
import { useChatStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const { user, setUser } = useChatStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [setUser]);

  return { user, isAuthenticated: !!user };
}
