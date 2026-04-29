"use client";

import { useEffect, useState, Suspense } from "react";
import { Button, Input, Select, SelectItem, Textarea, ScrollShadow } from "@/components/ui";
import { AppEvent, useEvents, useEventTypes } from "@/hooks/use-firestore";
import { format, parse } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

function NewEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const { createEvent, events } = useEvents(); 
  const { types } = useEventTypes();
  const [loading, setLoading] = useState(false);
  const [conflictMsg, setConflictMsg] = useState("");

  const [title, setTitle] = useState("");
  const [typeId, setTypeId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [attendees, setAttendees] = useState("");

  useEffect(() => {
    if (types.length > 0 && !typeId) {
      setTypeId(types[0].id);
    }
  }, [types, typeId]);

  useEffect(() => {
    if (dateParam) {
      const d = new Date(parseInt(dateParam, 10));
      setDate(format(d, "yyyy-MM-dd"));
    } else {
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [dateParam]);

  const handleSave = async (ignoreConflict = false) => {
    if (!title || !typeId || !date || !startTime || !endTime) return;

    setLoading(true);
    setConflictMsg("");

    const start = parse(`${date} ${startTime}`, "yyyy-MM-dd HH:mm", new Date()).getTime();
    const end = parse(`${date} ${endTime}`, "yyyy-MM-dd HH:mm", new Date()).getTime();

    if (end < start) {
      setConflictMsg("End time cannot be before start time.");
      return;
    }

    if (!ignoreConflict) {
      const conflict = events.find(e => 
        ((start >= e.startTime && start < e.endTime) || (end > e.startTime && end <= e.endTime) || (start <= e.startTime && end >= e.endTime))
      );
      if (conflict) {
        setConflictMsg(`Conflict detected with "${conflict.title}" (${format(conflict.startTime, "HH:mm")} - ${format(conflict.endTime, "HH:mm")}).`);
        setLoading(false);
        return;
      }
    }

    const eventData = {
      title,
      eventTypeId: typeId,
      startTime: start,
      endTime: end,
      allDay: false,
      location,
      notes,
      attendees: attendees ? attendees.split(",").map(s => s.trim()).filter(s => s) : []
    };

    await createEvent(eventData);
    setLoading(false);
    router.back();
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f4f7] font-sans relative">
      <div className="bg-white pt-safe pb-4 px-6 sticky top-0 z-10 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] border-b border-zinc-100 flex flex-col gap-2">
        <div className="flex justify-between items-end mt-6">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-3 rounded-full hover:bg-zinc-100 transition-colors">
              <ChevronLeft size={28} className="text-[#18181b]" />
            </button>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#71717a] mb-1">Calendar</h2>
              <h1 className="text-[32px] font-black leading-none text-[#18181b] tracking-tight">New Event</h1>
            </div>
          </div>
        </div>
      </div>
      
      <ScrollShadow className="flex-1 p-6 pb-32">
        <div className="max-w-md mx-auto flex flex-col gap-4 bg-white p-6 rounded-[32px] shadow-xl border border-zinc-200/50">
          <Input
            label="Title"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
          
          <Select
            label="Event Type"
            value={typeId}
            onChange={(e: any) => setTypeId(e.target.value)}
            required
          >
            {types.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </Select>

          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="flex gap-2">
            <Input
              type="time"
              label="Starts"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              type="time"
              label="Ends"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <Input
            label="Attendees"
            placeholder="Comma separated names or emails"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />

          <Input
            label="Location"
            placeholder="Where is it?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Textarea
            label="Notes"
            placeholder="Any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          {conflictMsg && (
            <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200 mt-2">
              <div className="flex justify-between items-start">
                <h4 className="text-[15px] font-bold text-orange-900">Wait!</h4>
                <div className="bg-orange-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Conflict</div>
              </div>
              <div className="mt-2 p-2 bg-white/50 rounded-lg">
                <p className="text-[11px] font-bold text-orange-800">{conflictMsg}</p>
              </div>
              <Button size="sm" className="bg-orange-600 text-white font-bold text-[11px] mt-3 w-full" onPress={() => handleSave(true)}>
                IGNORE & SAVE
              </Button>
            </div>
          )}
          
          <Button onPress={() => handleSave(false)} isLoading={loading} className="bg-[#18181b] text-white font-bold rounded-xl w-full h-12 mt-4 text-[16px]">
            Save Event
          </Button>
        </div>
      </ScrollShadow>
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewEventContent />
    </Suspense>
  );
}
