"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useUserProfile } from "@/hooks/use-firestore";
import {
  Calendar01Icon,
  Tag01Icon,
  Notification01Icon,
  UserGroupIcon,
  Clock01Icon,
  PaintBrush01Icon,
  Shield01Icon,
  HelpCircleIcon,
  Database01Icon,
  InformationCircleIcon,
  Logout01Icon,
  ArrowRight01Icon,
} from "hugeicons-react";

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] px-1 mb-2 mt-5">
      {label}
    </p>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  onPress,
  last = false,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <button
      onClick={onPress}
      className={`w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-zinc-50 transition-colors ${!last ? "border-b border-zinc-100" : ""}`}
    >
      <Icon size={20} color="#6b7280" strokeWidth={1.8} />
      <span className="flex-1 text-left text-[15px] font-medium text-[#1e1e1e]">{label}</span>
      <ArrowRight01Icon size={16} color="#c4c4cc" strokeWidth={2} />
    </button>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
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

  const [expanded, setExpanded] = useState(false);
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
    setExpanded(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "";
  const initials = firstName
    ? firstName.charAt(0).toUpperCase()
    : (user?.email?.charAt(0).toUpperCase() ?? "U");

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] font-sans">
      {/* Header */}
      <div className="px-6 pt-10 pb-2 flex justify-between items-center bg-transparent">
        <h1 className="text-[32px] font-bold tracking-tight text-[#1e1e1e]">Profile</h1>
        <button
          onClick={() => auth.signOut()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
        >
          <Logout01Icon size={22} color="#ef4444" strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 no-scrollbar">
        {/* User card */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full bg-white rounded-[20px] shadow-sm border border-zinc-100 flex items-center gap-3 px-4 py-4 mt-3 hover:bg-zinc-50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-[#e0e7ff] flex items-center justify-center text-[#6366f1] font-bold text-lg shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[15px] font-bold text-[#1e1e1e] truncate">{displayName || "Add your name"}</p>
            <p className="text-[13px] text-[#9ca3af] truncate">{user?.email}</p>
          </div>
          <ArrowRight01Icon
            size={16}
            color="#c4c4cc"
            strokeWidth={2}
            className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        {/* Expandable edit fields */}
        {expanded && (
          <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 px-5 py-5 mt-2 flex flex-col gap-5">
            {loading ? (
              <div className="flex justify-center py-3">
                <div className="animate-spin h-5 w-5 border-b-2 border-[#6366f1] rounded-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="Jane" />
                  <Field label="Last Name" value={lastName} onChange={setLastName} placeholder="Smith" />
                </div>
                <Field label="Date of Birth" value={dob} onChange={setDob} type="date" />
                <Field label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+1 (555) 000-0000" />
                <Button
                  onPress={handleSave}
                  isDisabled={saving}
                  className="w-full bg-[#6366f1] text-white font-bold h-11 rounded-[14px] text-[14px]"
                >
                  {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Personal */}
        <SectionLabel label="Personal" />
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden">
          <SettingsRow icon={Calendar01Icon} label="My Calendars" />
          <SettingsRow icon={Tag01Icon} label="Event Types" onPress={() => router.push("/settings")} />
          <SettingsRow icon={Notification01Icon} label="Notifications" />
          <SettingsRow icon={UserGroupIcon} label="Friends" last />
        </div>

        {/* App Settings */}
        <SectionLabel label="App Settings" />
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden">
          <SettingsRow icon={Clock01Icon} label="Time & Date" />
          <SettingsRow icon={PaintBrush01Icon} label="Appearance" />
          <SettingsRow icon={Shield01Icon} label="Privacy" last />
        </div>

        {/* More */}
        <SectionLabel label="More" />
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden">
          <SettingsRow icon={HelpCircleIcon} label="Help & Support" />
          <SettingsRow icon={Database01Icon} label="Data & Storage" />
          <SettingsRow icon={InformationCircleIcon} label="About" last />
        </div>
      </div>
    </div>
  );
}
