"use client";

import { useState, useMemo } from "react";
import { format, startOfDay, addDays, isToday } from "date-fns";
import { ScrollShadow, Button } from "@/components/ui";
import { 
  Search, 
  Bell, 
  LayoutGrid, 
  Briefcase, 
  Users, 
  User, 
  GraduationCap, 
  MapPin,
  MoreVertical,
  Plus,
  Plane
} from "lucide-react";
import { useEvents, useEventTypes, AppEvent } from "@/hooks/use-firestore";
import { useRouter } from "next/navigation";
import { EventModal } from "@/components/event-modal";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  // Fetch all events for the next 30 days to filter for "Upcoming"
  const { events, loading } = useEvents(
    startOfDay(new Date()).getTime(),
    addDays(new Date(), 30).getTime()
  );

  const { types } = useEventTypes();

  // Filter events based on search and type
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           e.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !selectedType || e.eventTypeId === selectedType;
      return matchesSearch && matchesType;
    });
  }, [events, searchQuery, selectedType]);

  // Today's schedule
  const todayEvents = useMemo(() => {
    return filteredEvents
      .filter(e => isToday(e.startTime))
      .sort((a, b) => a.startTime - b.startTime);
  }, [filteredEvents]);

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return filteredEvents
      .filter(e => e.startTime > now)
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, 5);
  }, [filteredEvents]);

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] font-sans overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-10 pb-2 flex justify-between items-center bg-transparent">
        <h1 className="text-[32px] font-bold tracking-tight text-[#1e1e1e]">Home</h1>
        <button className="w-10 h-10 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center border border-zinc-100 hover:bg-zinc-50 transition-colors">
          <Bell size={20} className="text-[#1e1e1e]" />
        </button>
      </div>

      <ScrollShadow className="flex-1 pb-32 no-scrollbar">
        {/* Search */}
        <div className="px-6 mb-8 mt-2">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search size={20} />
            </div>
            <input 
              type="text"
              placeholder="Search events, categories, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[54px] pl-12 pr-4 bg-white rounded-[20px] border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/10 focus:border-zinc-200 transition-all text-[15px] font-medium text-zinc-600 placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Upcoming Events */}
        <section className="mb-8">
          <div className="px-6 mb-4 flex justify-between items-center">
            <h3 className="text-[18px] font-semibold text-[#1e1e1e]">Upcoming Events</h3>
            <button 
              onClick={() => router.push("/calendar")}
              className="text-[13px] font-medium text-[#6366f1] hover:opacity-80 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="px-6 flex flex-col gap-4">
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-b-2 border-[#6366f1] rounded-full" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="bg-white p-8 rounded-[32px] border border-zinc-100/50 text-center shadow-sm">
                <p className="text-[15px] font-semibold text-zinc-400">No upcoming events</p>
              </div>
            ) : upcomingEvents.map((event, idx) => {
              const eType = types.find(t => t.id === event.eventTypeId);
              
              // Colors matching the reference image's soft palette
              const bgColors = ['#f0edff', '#eff6ff', '#fef2f2', '#f0fdf4', '#fffbeb'];
              const bg = bgColors[idx % bgColors.length];

              return (
                <div 
                  key={event.id}
                  onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                  className="rounded-3xl p-5 flex gap-5 items-center cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden h-[120px]"
                  style={{ backgroundColor: bg }}
                >
                  <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <span className="text-[12px] font-medium uppercase tracking-widest text-[#6366f1] opacity-80">{format(event.startTime, "MMM")}</span>
                    <span className="text-[34px] font-medium leading-none text-[#1e1e1e] my-1 -ml-1">{format(event.startTime, "dd")}</span>
                    <span className="text-[13px] font-medium text-zinc-500">{format(event.startTime, "EEE")}</span>
                  </div>
                  
                  <div className="w-[1px] h-16 bg-zinc-200/50" />

                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-[16px] font-semibold text-[#1e1e1e] mb-1 line-clamp-1">{event.title}</h4>
                    <p className="text-[12px] font-medium text-zinc-500/90 mb-3 uppercase tracking-wider">{format(event.startTime, "hh:mm")} - {format(event.endTime, "hh:mm a")}</p>
                    
                    <div className="flex items-center -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center overflow-hidden">
                           <img 
                            src={`https://picsum.photos/seed/${event.id}${i}/100/100`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                           />
                         </div>
                       ))}
                    </div>
                  </div>
                  <button className="p-1 self-center text-zinc-500 hover:text-[#1e1e1e] -mt-10">
                    <MoreVertical size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-8">
          <div className="px-6 mb-4">
             <h3 className="text-[18px] font-semibold text-[#1e1e1e]">Categories</h3>
          </div>
          <div className="flex gap-3 px-6 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: "all", name: "All", icon: LayoutGrid, color: "#6366f1" },
              ...types.map(t => ({
                id: t.id,
                name: t.name,
                icon: t.name.toLowerCase().includes("work") ? Briefcase :
                      t.name.toLowerCase().includes("meet") ? Users :
                      t.name.toLowerCase().includes("personal") ? User :
                      t.name.toLowerCase().includes("learn") ? GraduationCap : 
                      t.name.toLowerCase().includes("travel") ? Plane : LayoutGrid,
                color: t.color
              }))
            ].map((cat: any) => {
              const isActive = (cat.id === "all" && !selectedType) || selectedType === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedType(cat.id === "all" ? null : cat.id)}
                  className={`flex flex-col items-center justify-center gap-2 shrink-0 w-[80px] h-[92px] rounded-[22px] transition-all ${isActive ? 'bg-[#f0edff] border-2 border-[#6366f1] text-[#6366f1]' : 'bg-white border border-zinc-100 text-[#6b7280] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-zinc-50'}`}
                >
                  <cat.icon size={28} strokeWidth={isActive ? 2 : 1.5} />
                  <span className={`text-[12px] font-medium ${isActive ? 'text-[#6366f1]' : 'text-zinc-500'}`}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="mb-8">
          <div className="px-6 mb-4">
             <h3 className="text-[18px] font-semibold text-[#1e1e1e]">Today&apos;s Schedule</h3>
          </div>
          <div className="px-6 flex flex-col">
             {todayEvents.length === 0 ? (
               <div className="bg-white p-6 rounded-[24px] border border-zinc-100 flex items-center justify-center text-center gap-2">
                 <p className="text-[14px] font-medium text-zinc-400">No events for today</p>
               </div>
             ) : (
               <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                 {todayEvents.map((event, idx) => {
                   const eType = types.find(t => t.id === event.eventTypeId);
                   const color = eType?.color || "#6366f1";
                   return (
                     <div 
                      key={event.id}
                      onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                      className={`relative py-5 pl-5 pr-4 flex items-center gap-5 cursor-pointer hover:bg-zinc-50 transition-colors ${idx !== 0 ? 'border-t border-zinc-100' : ''}`}
                     >
                       <div className="absolute left-[2px] top-[15px] bottom-[15px] w-[3px] rounded-r-md" style={{ backgroundColor: color }} />
                       <div className="min-w-[70px]">
                          <span className="text-[13px] font-medium text-zinc-500">{format(event.startTime, "hh:mm a")}</span>
                       </div>
                       <div className="flex-1 border-l border-zinc-100 pl-4">
                          <h4 className="text-[14px] font-semibold text-[#1e1e1e] mb-0.5">{event.title}</h4>
                          <span className="text-[12px] font-medium text-zinc-400">{event.location || "No location"}</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        </section>
      </ScrollShadow>

      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        event={selectedEvent} 
        currentDate={new Date().getTime()}
      />
    </div>
  );
}

