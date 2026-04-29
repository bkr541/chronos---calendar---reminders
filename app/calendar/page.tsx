"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, isToday, startOfDay, endOfDay
} from "date-fns";
import { ScrollShadow } from "@/components/ui";
import { useEvents, useEventTypes, AppEvent } from "@/hooks/use-firestore";
import { EventModal } from "@/components/event-modal";

const TOTAL_MONTHS = 60;
const BASE_OFFSET = 24;
const BASE_DATE = startOfMonth(subMonths(new Date(), BASE_OFFSET));
const ALL_MONTHS = Array.from({ length: TOTAL_MONTHS }, (_, i) => addMonths(BASE_DATE, i));

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const scrollDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { events: allEvents, loading } = useEvents(monthStart.getTime(), monthEnd.getTime());
  const { types } = useEventTypes();

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
  });

  const dayEvents = allEvents.filter(e =>
    e.startTime >= startOfDay(selectedDate).getTime() &&
    e.startTime <= endOfDay(selectedDate).getTime()
  );

  const scrollToIndex = useCallback((idx: number, animated = false) => {
    const el = scrollRef.current;
    if (!el) return;
    const itemW = el.scrollWidth / TOTAL_MONTHS;
    const target = idx * itemW - el.clientWidth / 2 + itemW / 2;
    if (animated) {
      el.scrollTo({ left: target, behavior: "smooth" });
    } else {
      el.scrollLeft = target;
    }
  }, []);

  // Scroll to current month on first render
  useEffect(() => {
    const idx = ALL_MONTHS.findIndex(m => isSameMonth(m, currentMonth));
    if (idx !== -1) scrollToIndex(idx, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isUserScrolling.current = true;

    const itemW = el.scrollWidth / TOTAL_MONTHS;
    const idx = Math.round((el.scrollLeft + el.clientWidth / 2) / itemW - 0.5);
    const clamped = Math.max(0, Math.min(TOTAL_MONTHS - 1, idx));
    const newMonth = ALL_MONTHS[clamped];
    if (newMonth && !isSameMonth(newMonth, currentMonth)) {
      setCurrentMonth(startOfMonth(newMonth));
    }

    if (scrollDebounce.current) clearTimeout(scrollDebounce.current);
    scrollDebounce.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 150);
  }, [currentMonth]);

  const handleDayTap = (day: Date) => {
    setSelectedDate(day);
    if (!isSameMonth(day, currentMonth)) {
      const newMonth = startOfMonth(day);
      setCurrentMonth(newMonth);
      const idx = ALL_MONTHS.findIndex(m => isSameMonth(m, newMonth));
      if (idx !== -1) scrollToIndex(idx, true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] font-sans overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-10 pb-2 flex justify-between items-end bg-transparent">
        <h1 className="text-[32px] font-extrabold tracking-tight text-[#1e1e1e]">Calendar</h1>
        <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#71717a] pb-1">
          {format(selectedDate, "EEEE, MMMM d")}
        </span>
      </div>

      <ScrollShadow className="flex-1 overflow-y-auto pb-28 no-scrollbar">

        {/* Month scroller */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto no-scrollbar mt-4 mb-5 select-none"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {ALL_MONTHS.map((month, i) => {
            const isSelected = isSameMonth(month, currentMonth);
            return (
              <button
                key={i}
                onClick={() => {
                  if (!isUserScrolling.current) {
                    setCurrentMonth(startOfMonth(month));
                    scrollToIndex(i, true);
                  }
                }}
                className="shrink-0 w-1/3 flex items-center justify-center py-2 cursor-pointer"
                style={{ scrollSnapAlign: "center" }}
              >
                <span className={`text-[20px] font-bold transition-colors duration-150 ${
                  isSelected ? "text-[#6366f1]" : "text-[#c4b5fd]"
                }`}>
                  {format(month, "MMMM")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-3 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-[#9ca3af]">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-3">
          {calendarDays.map((day) => {
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const selected = isSameDay(day, selectedDate);
            const dots = allEvents
              .filter(e => isSameDay(e.startTime, day))
              .slice(0, 3)
              .map(e => types.find(t => t.id === e.eventTypeId)?.color || "#6366f1");

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayTap(day)}
                className="flex flex-col items-center py-[3px] cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${today ? "bg-[#6366f1]" : selected ? "bg-[#e0e7ff]" : "bg-transparent"}`}
                >
                  <span className={`text-[13px] font-semibold
                    ${today ? "text-white" : selected ? "text-[#6366f1]" : inMonth ? "text-[#1e1e1e]" : "text-[#c4c4cc]"}`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="flex gap-[3px] mt-[3px] h-[6px] items-center">
                  {dots.map((color, i) => (
                    <div key={i} className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-5 my-5 h-px bg-zinc-200/70" />

        {/* Events for selected day */}
        <div className="px-5 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-b-2 border-[#6366f1] rounded-full" />
            </div>
          ) : dayEvents.length === 0 ? (
            <p className="text-center py-8 text-[#9ca3af] text-[14px] font-medium">
              No events for {isToday(selectedDate) ? "today" : format(selectedDate, "MMMM d")}
            </p>
          ) : dayEvents.map((event) => {
            const eType = types.find(t => t.id === event.eventTypeId);
            const color = eType?.color || "#6366f1";
            const attendees = event.attendees ?? [];
            return (
              <div
                key={event.id}
                onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                className="bg-white rounded-[20px] p-4 flex gap-3 items-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white text-[17px] font-bold shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {(eType?.name || event.title).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-[#1e1e1e] line-clamp-1">{event.title}</h4>
                  <p className="text-[12px] text-[#9ca3af] font-medium mt-0.5">{eType?.name || "Event"}</p>
                  <span
                    className="inline-block mt-2 px-3 py-[3px] rounded-full text-[11px] font-semibold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {format(event.startTime, "hh:mm aa")} – {format(event.endTime, "hh:mm aa")}
                  </span>
                </div>
                {attendees.length > 0 && (
                  <div className="flex items-center shrink-0">
                    <div className="flex -space-x-2">
                      {attendees.slice(0, 2).map((_, i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-zinc-200 overflow-hidden">
                          <img src={`https://picsum.photos/seed/${event.id}${i}/60/60`} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    {attendees.length > 2 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-[#6366f1] text-white text-[10px] font-bold flex items-center justify-center -ml-2">
                        +{attendees.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollShadow>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        currentDate={selectedDate.getTime()}
      />
    </div>
  );
}
