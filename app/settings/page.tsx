"use client";

import { useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Divider } from "@/components/ui";
import { Plus, Settings2, Trash2, ChevronLeft } from "lucide-react";
import { useEventTypes, EventType } from "@/hooks/use-firestore";
import { useTheme } from "next-themes";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { types, createType, updateType, deleteType, loading } = useEventTypes();
  const { theme, setTheme } = useTheme();
  
  const [isTypeModalOpen, setTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  
  const [typeName, setTypeName] = useState("");
  const [typeColor, setTypeColor] = useState("#3B82F6");

  const openTypeModal = (type: EventType | null = null) => {
    setSelectedType(type);
    if (type) {
      setTypeName(type.name);
      setTypeColor(type.color);
    } else {
      setTypeName("");
      setTypeColor("#3B82F6");
    }
    setTypeModalOpen(true);
  };

  const handleSaveType = async () => {
    if (!typeName) return;
    if (selectedType) {
      await updateType(selectedType.id, { name: typeName, color: typeColor });
    } else {
      await createType({ name: typeName, color: typeColor, icon: "" });
    }
    setTypeModalOpen(false);
  };

  const handleDeleteType = async (id: string) => {
    // Basic protection (ideally we check if it's used)
    await deleteType(id);
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
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#71717a] mb-1">Profile</h2>
              <h1 className="text-[32px] font-black leading-none text-[#18181b] tracking-tight">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <ScrollShadow className="flex-1 px-6 py-6 flex flex-col gap-8 pb-24 overflow-x-hidden">
        {/* Appearance Settings */}
        <section className="bg-white rounded-[32px] p-6 shadow-xl border border-zinc-200/50">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#a1a1aa] mb-4 flex items-center gap-2">
            <Settings2 size={16} /> Appearance
          </h4>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[14px] font-bold text-[#18181b]">Theme</span>
            <div className="flex bg-[#f4f4f7] rounded-xl p-1 gap-1 border border-zinc-100">
              {["light", "dark", "system"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-lg capitalize transition-colors ${theme === t ? "bg-white shadow-sm text-[#18181b]" : "text-[#71717a] hover:text-[#18181b]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Event Types Management */}
        <section className="bg-white rounded-[32px] p-6 shadow-xl border border-zinc-200/50">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#a1a1aa]">Event Types</h4>
            <Button size="sm" className="bg-zinc-100 text-[#18181b] font-bold" onPress={() => openTypeModal()}>
              <Plus size={16} /> NEW
            </Button>
          </div>
          
          {loading ? (
            <div className="animate-pulse h-12 bg-[#f4f4f7] rounded-xl w-full" />
          ) : (
            <div className="flex flex-col gap-3">
              {types.length === 0 && <p className="text-[#a1a1aa] text-[13px] font-bold">No event types. Create one to get started.</p>}
              {types.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-xl border border-zinc-100 hover:bg-[#f4f4f7] transition-colors cursor-pointer" onClick={() => openTypeModal(t)}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-bold text-[14px] text-[#18181b]">{t.name}</span>
                  </div>
                  <Button isIconOnly size="sm" variant="light" color="danger" onPress={(e) => { e.stopPropagation(); handleDeleteType(t.id); }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </ScrollShadow>

      {/* Event Type Modal */}
      <Modal isOpen={isTypeModalOpen} onOpenChange={setTypeModalOpen} placement="center">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader>{selectedType ? "Edit Type" : "New Event Type"}</ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="e.g. Work, Gym"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  autoFocus
                />
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-sm font-medium">Color</span>
                  <div className="flex gap-2 flex-wrap">
                    {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#6366F1", "#A855F7", "#D946EF", "#EAB308", "#84CC16", "#22C55E"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setTypeColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${typeColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-110"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button color="primary" onPress={handleSaveType}>Save</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
