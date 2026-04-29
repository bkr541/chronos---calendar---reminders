"use client";

import { useState } from "react";
import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow } from "@/components/ui";
import { Plus, Clock, CheckCircle2 } from "lucide-react";
import { useReminders, Reminder } from "@/hooks/use-firestore";
import { format, isPast, isToday, startOfDay, addDays } from "date-fns";

function Section({ title, items, onToggle }: { title: string, items: Reminder[], onToggle: (r: Reminder) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[12px] font-black uppercase tracking-widest text-[#71717a]">{title}</h3>
        <span className="bg-zinc-200 text-[#18181b] text-[10px] font-black px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map(r => (
          <div key={r.id} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-zinc-200/60">
            <Checkbox 
              isSelected={r.completed} 
              onValueChange={() => onToggle(r)}
              color="default"
              className="mt-1"
              lineThrough
            />
            <div className="flex-1">
              <span className={`text-[14px] font-bold ${r.completed ? "text-[#18181b] line-through opacity-40" : "text-[#18181b]"}`}>{r.title}</span>
              {r.dueTime && (
                <div className={`text-[11px] font-black mt-1 flex items-center gap-1 ${isPast(r.dueTime) && !r.completed && !isToday(r.dueTime) ? "text-red-500" : "text-[#a1a1aa]"}`}>
                  <Clock size={12} strokeWidth={2.5} /> {format(r.dueTime, "MMM d, yyyy")}
                </div>
              )}
              {r.notes && <p className="text-[12px] text-[#71717a] mt-1 font-medium line-clamp-2">{r.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RemindersPage() {
  const { reminders, createReminder, updateReminder, deleteReminder, loading } = useReminders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    if (!title) return;
    
    let dueTime = undefined;
    if (date) {
      dueTime = new Date(date).getTime();
    }

    await createReminder({ title, notes, dueTime });
    setTitle("");
    setDate("");
    setNotes("");
    setIsModalOpen(false);
  };

  const toggleComplete = async (reminder: Reminder) => {
    await updateReminder(reminder.id, { completed: !reminder.completed });
  };

  const completed = reminders.filter(r => r.completed);
  const pending = reminders.filter(r => !r.completed);
  
  const today = pending.filter(r => r.dueTime && isToday(r.dueTime));
  const upcoming = pending.filter(r => !r.dueTime || (!isToday(r.dueTime) && !isPast(r.dueTime)));
  const overdue = pending.filter(r => r.dueTime && isPast(r.dueTime) && !isToday(r.dueTime));



  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] font-sans relative">
      <div className="bg-transparent px-6 pt-10 pb-2 flex justify-between items-center">
        <h1 className="text-[32px] font-bold tracking-tight text-[#1e1e1e]">Reminders</h1>
      </div>

      <ScrollShadow className="flex-1 px-6 py-6 pb-24 overflow-x-hidden">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-16 bg-white rounded-xl border border-zinc-100" />
            <div className="h-16 bg-white rounded-xl border border-zinc-100" />
          </div>
        ) : reminders.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-48 text-[#a1a1aa] gap-2">
             <CheckCircle2 size={48} className="text-default-300 mb-4" />
             <p className="text-[14px] font-bold">All caught up!</p>
           </div>
        ) : (
          <>
            <Section title="Overdue" items={overdue} onToggle={toggleComplete} />
            <Section title="Today" items={today} onToggle={toggleComplete} />
            <Section title="Upcoming" items={upcoming} onToggle={toggleComplete} />
            <Section title="Completed" items={completed} onToggle={toggleComplete} />
          </>
        )}
      </ScrollShadow>


      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} placement="bottom-center">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader>New Reminder</ModalHeader>
              <ModalBody>
                <Input
                  label="What to do?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                <Input
                  type="date"
                  label="Date (optional)"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Input
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button color="primary" onPress={handleCreate}>Save</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
