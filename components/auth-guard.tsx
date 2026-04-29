"use client";

import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Calendar } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 bg-[#f4f4f7] h-full">
        <div className="flex flex-col items-center gap-2 text-center bg-white p-8 rounded-[32px] shadow-xl border border-zinc-200/50 w-full">
          <div className="w-16 h-16 bg-[#18181b] text-white rounded-[20px] flex items-center justify-center mb-4 shadow-lg shadow-black/20">
            <Calendar size={32} />
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#71717a] mb-1">Welcome to</h2>
          <h1 className="text-[32px] font-black leading-none text-[#18181b] tracking-tight">Chronos</h1>
          <p className="text-[14px] font-bold text-[#a1a1aa] mt-4 mb-6 leading-relaxed">Your minimal, powerful calendar and reminders system.</p>
          
          <Button 
            size="lg"
            className="w-full bg-[#18181b] text-white rounded-xl shadow-lg font-bold text-[14px]"
            onPress={() => signInWithPopup(auth, new GoogleAuthProvider())}
          >
            CONTINUE WITH GOOGLE
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
