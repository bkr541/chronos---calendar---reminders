"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui";
import { Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useUserProfile } from "@/hooks/use-firestore";

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-[15px] font-medium text-[#1e1e1e] bg-transparent border-b border-zinc-200 pb-2 focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-zinc-300"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { profile, loading, saveProfile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
      setDob(profile.dob ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await saveProfile({ firstName, lastName, dob, phone });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "U";
  const initials = firstName ? firstName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() ?? "U");

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] font-sans">
      <div className="bg-transparent px-6 pt-10 pb-2 flex justify-between items-center">
        <h1 className="text-[32px] font-bold tracking-tight text-[#1e1e1e]">Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col gap-5">
        {/* Avatar + name */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-zinc-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#e0e7ff] flex items-center justify-center text-[#6366f1] font-bold text-xl shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[16px] font-bold text-[#1e1e1e] truncate">{displayName}</span>
            <span className="text-[13px] text-[#9ca3af] truncate">{user?.email}</span>
          </div>
        </section>

        {/* Editable fields */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-zinc-100 flex flex-col gap-5">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-5 w-5 border-b-2 border-[#6366f1] rounded-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5">
                <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="Jane" />
                <Field label="Last Name" value={lastName} onChange={setLastName} placeholder="Smith" />
              </div>
              <Field label="Date of Birth" value={dob} onChange={setDob} type="date" />
              <Field label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+1 (555) 000-0000" />

              <Button
                onPress={handleSave}
                isDisabled={saving}
                className="w-full bg-[#6366f1] text-white font-bold h-12 rounded-[18px] text-[15px] mt-1"
              >
                {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
              </Button>
            </>
          )}
        </section>

        {/* Settings */}
        <section className="bg-white rounded-[28px] p-2 shadow-sm border border-zinc-100">
          <button
            onClick={() => router.push("/settings")}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors rounded-3xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                <Settings size={20} />
              </div>
              <span className="text-[15px] font-bold text-[#18181b]">Settings</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </section>

        {/* Log out */}
        <section className="mt-auto pb-4">
          <Button
            onPress={() => auth.signOut()}
            className="w-full bg-white text-red-500 border border-red-100 font-bold h-14 rounded-[24px] text-[15px] shadow-sm hover:bg-red-50 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Log out
          </Button>
        </section>
      </div>
    </div>
  );
}
