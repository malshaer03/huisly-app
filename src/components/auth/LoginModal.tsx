"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface AppleID {
  auth: {
    init: (config: {
      clientId: string;
      scope: string;
      redirectURI: string;
      usePopup: boolean;
    }) => void;
    signIn: () => Promise<{
      authorization: { id_token: string; code: string };
      user?: {
        name?: { firstName?: string; lastName?: string };
        email?: string;
      };
    }>;
  };
}

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/chat` },
    });
  };

  const handleApple = async () => {
    setLoading(true);
    setError(null);
    try {
      const appleId = (window as unknown as { AppleID: AppleID }).AppleID;
      appleId.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: true,
      });
      const response = await appleId.auth.signIn();
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: response.authorization.id_token,
      });
      if (error) throw error;
      onClose();
    } catch (err) {
      if ((err as { error?: string }).error !== "popup_closed_by_user") {
        setError("Apple sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/chat` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setEmailSent(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px] rounded-3xl border-[#333] bg-[#242424] p-7 text-white">
        {emailSent ? (
          <div className="py-4 text-center space-y-2">
            <DialogTitle className="text-white text-lg">
              Check your email
            </DialogTitle>
            <DialogDescription className="text-[#999]">
              We sent a magic link to{" "}
              <span className="text-white font-medium">{email}</span>
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center items-center space-y-2 mb-2">
              <DialogTitle className="text-white text-[26px] font-bold">
                Log in or sign up
              </DialogTitle>
              <DialogDescription className="text-[#999] text-[13px] leading-relaxed">
                You'll get smarter responses and can
                <br />
                upload files, images, and more.
              </DialogDescription>
            </DialogHeader>

            {/* OAuth buttons */}
            <div className="space-y-2.5 mt-3">
              <Button
                variant="outline"
                className="w-full h-[52px] rounded-2xl border-[#3a3a3a] bg-[#2a2a2a] hover:bg-[#333] text-[#f0f0f0] text-[15px] font-medium gap-3"
                onClick={handleGoogle}
                disabled={loading}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
              {/*
              <Button
                variant="outline"
                className="w-full h-[52px] rounded-2xl border-[#3a3a3a] bg-[#2a2a2a] hover:bg-[#333] text-[#f0f0f0] text-[15px] font-medium gap-3"
                onClick={handleApple}
                disabled={loading}
              >
                <AppleIcon />
                Continue with Apple
              </Button> */}
            </div>

            {/* OR divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#3a3a3a]" />
              <span className="text-[#666] text-xs font-medium">OR</span>
              <div className="flex-1 h-px bg-[#3a3a3a]" />
            </div>

            {/* Email */}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
              placeholder="Email address"
              className="h-[52px] rounded-2xl border-[#4d6bfe] bg-[#2a2a2a] text-white placeholder:text-[#555] focus-visible:border-[#6b87ff] focus-visible:ring-0 text-[15px]"
            />

            {error && <p className="text-red-400 text-xs -mt-1">{error}</p>}

            <Button
              onClick={handleEmailContinue}
              disabled={loading || !email.trim()}
              className="w-full h-[52px] rounded-2xl bg-white hover:bg-[#f0f0f0] text-[#0d0d0d] text-[15px] font-semibold mt-1"
            >
              Continue
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="15"
      height="18"
      viewBox="0 0 814 1000"
      aria-hidden="true"
      fill="white"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 411.6 0 336.8 0 266.1c0-131.3 86.5-199.7 170.7-199.7 57.3 0 104.9 38.8 140.8 38.8 33.9 0 87.9-41.1 155.2-41.1 24.9 0 108.2 2.6 168.6 81.3zm-87.9-102c-9.3 43.4-34.7 85.8-65.5 115.1-30.8 29.3-69.9 49.7-111.7 49.7-3.2 0-6.4-.3-9.7-.9 3.2-40.8 18.9-82.5 47.1-113.3 28.1-30.8 73.5-54.7 139.8-50.6z" />
    </svg>
  );
}
