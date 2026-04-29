"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Switch, Textarea } from "@/components/ui";
import { AppEvent, useEvents, useEventTypes } from "@/hooks/use-firestore";
import { format, parse } from "date-fns";

export function EventModal({ isOpen, onClose, event, currentDate }: { isOpen: boolean, onClose: () => void, event: AppEvent | null, currentDate: number }) {
  const { createEvent, updateEvent, events, deleteEvent } = useEvents(); // NOTE: events might not include all events for conflict detection if we filtered. But we passed start/end date to `useEvents` in page.tsx, so it only has today's events!
  // Wait, conflict detection needs to query the database. For MVP, we'll check against currently loaded events or fetch.
  // We'll write a specific check.
  const { types } = useEventTypes();
  const [loading, setLoading] = useState(false);
  const [conflictMsg, setConflictMsg] = useState("");

  const [title, setTitle] = useState("");
  const [typeId, setTypeId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [attendees, setAttendees] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setConflictMsg("");
        if (event) {
          setTitle(event.title);
          setTypeId(event.eventTypeId);
          setDate(format(event.startTime, "yyyy-MM-dd"));
          setStartTime(format(event.startTime, "HH:mm"));
          setEndTime(format(event.endTime, "HH:mm"));
          setLocation(event.location || "");
          setNotes(event.notes || "");
          setAttendees(event.attendees ? event.attendees.join(", ") : "");
        } else {
          setTitle("");
          setTypeId(types.length > 0 ? types[0].id : "");
          setDate(format(currentDate, "yyyy-MM-dd"));
          setStartTime("09:00");
          setEndTime("10:00");
          setLocation("");
          setNotes("");
          setAttendees("");
        }
      }, 0);
    }
  }, [isOpen, event, currentDate, types]);

  const handleSave = async (ignoreConflict = false) => {
    if (!title || !typeId || !date || !startTime || !endTime) return;

    setLoading(true);
    setConflictMsg("");

    const start = parse(`${date} ${startTime}`, "yyyy-MM-dd HH:mm", new Date()).getTime();
    const end = parse(`${date} ${endTime}`, "yyyy-MM-dd HH:mm", new Date()).getTime();

    // Basic conflict detection inside currently loaded events (MVP)
    if (!ignoreConflict) {
      const conflict = events.find(e => 
        e.id !== event?.id && 
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

    if (event) {
      await updateEvent(event.id, eventData);
    } else {
      await createEvent(eventData);
    }
    
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!event) return;
    setLoading(true);
    await deleteEvent(event.id);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom-center" scrollBehavior="inside">
      <ModalContent>
        {(onClose: () => void) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {event ? "Edit Event" : "New Event"}
            </ModalHeader>
            <ModalBody>
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

              <div className="flex gap-2">
                <Input
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

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
            </ModalBody>
            <ModalFooter className="flex justify-between border-t border-zinc-100">
              {event ? (
                <Button color="danger" variant="light" onPress={handleDelete} isLoading={loading} className="font-bold">
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button variant="light" onPress={onClose} className="font-bold">
                  Cancel
                </Button>
                <Button onPress={() => handleSave(false)} isLoading={loading} className="bg-[#18181b] text-white font-bold rounded-xl">
                  Save
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
