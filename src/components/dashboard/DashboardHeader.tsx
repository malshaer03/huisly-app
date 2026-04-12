import { Bell, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { DashboardHeaderProps } from "@/types/dashboard/ui";

export function DashboardHeader({
  onNotifications,
  onSettings,
}: DashboardHeaderProps) {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="px-5 md:px-0 flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted mt-1">
          {user?.email
            ? `Welcome back, ${user.email.split("@")[0]}`
            : "Welcome"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNotifications}
          className="w-10 h-10 rounded-lg bg-surface2 border border-white/6 flex items-center justify-center text-muted hover:text-foreground transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent2 rounded-full" />
        </button>

        <button
          type="button"
          onClick={onSettings}
          className="w-10 h-10 rounded-lg bg-surface2 border border-white/6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-10 h-10 rounded-lg bg-surface2 border border-white/6 flex items-center justify-center text-muted hover:text-danger transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
