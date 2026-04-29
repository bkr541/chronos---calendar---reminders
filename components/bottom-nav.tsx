"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home01Icon, Calendar02Icon, TextCheckIcon, UserFullViewIcon, Add01Icon } from "hugeicons-react";
import { useAuth } from "./auth-provider";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  const leftTabs = [
    { name: "Home", path: "/", icon: Home01Icon },
    { name: "Calendar", path: "/calendar", icon: Calendar02Icon },
  ];

  const rightTabs = [
    { name: "Reminders", path: "/reminders", icon: TextCheckIcon },
    { name: "Profile", path: "/profile", icon: UserFullViewIcon },
  ];

  const renderTab = (tab: { name: string; path: string; icon: any }) => {
    const isActive = pathname === tab.path;
    const color = isActive ? "#4F7FFF" : "#9CA3AF";
    return (
      <button
        key={tab.name}
        onClick={() => router.push(tab.path)}
        className="flex items-center justify-center w-14 h-full"
      >
        <tab.icon
          size={26}
          strokeWidth={isActive ? 2.5 : 1.8}
          color={color}
        />
      </button>
    );
  };

  return (
    <div className="w-full px-5 pb-5 pt-8 flex-shrink-0">
      <div className="relative">
        {/* Elevated center FAB */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-10">
          <div className="p-[6px] rounded-full bg-[#C4B5FD]/60">
            <button
              onClick={() => router.push("/events/new")}
              className="w-[54px] h-[54px] bg-[#6B4EFF] rounded-full flex items-center justify-center text-white shadow-[0_6px_20px_rgba(107,78,255,0.45)] hover:scale-105 active:scale-95 transition-transform duration-150"
            >
              <Add01Icon size={26} strokeWidth={2.5} color="white" />
            </button>
          </div>
        </div>

        {/* Pill nav bar */}
        <div className="flex items-center bg-white rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.09)] h-[64px] px-2">
          <div className="flex flex-1 items-center justify-around">
            {leftTabs.map(renderTab)}
            <div className="w-14" />
            {rightTabs.map(renderTab)}
          </div>
        </div>
      </div>
    </div>
  );
}
