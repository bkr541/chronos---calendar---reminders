import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, setDoc, getDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";

export interface EventType {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: number;
}

export interface AppEvent {
  id: string;
  userId: string;
  title: string;
  eventTypeId: string;
  startTime: number;
  endTime: number;
  allDay: boolean;
  location?: string;
  notes?: string;
  attendees?: string[];
  reminderMinutesBefore?: number;
  repeatRule?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  dueTime?: number;
  notes?: string;
  repeatRule?: string;
  completed: boolean;
  createdAt: number;
}

export function useEventTypes() {
  const { user } = useAuth();
  const [types, setTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "eventTypes"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTypes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EventType)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "eventTypes"));

    return () => unsubscribe();
  }, [user]);

  const createType = async (data: Omit<EventType, "id" | "userId" | "createdAt">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "eventTypes"), {
        ...data,
        userId: user.uid,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "eventTypes");
    }
  };

  const updateType = async (id: string, data: Partial<EventType>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "eventTypes", id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `eventTypes/${id}`);
    }
  };

  const deleteType = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "eventTypes", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `eventTypes/${id}`);
    }
  };

  return { types, loading, createType, updateType, deleteType };
}

export function useEvents(startDate?: number, endDate?: number) {
  const { user } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let baseQ = query(
      collection(db, "events"),
      where("userId", "==", user.uid)
    );
    // Ideally we filter by date, but since we didn't index appropriately yet,
    // we fetch user's events and filter client side. In a real app we'd add composite index.
    
    const unsubscribe = onSnapshot(baseQ, (snapshot) => {
      let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppEvent));
      // Client side sort + filter for now to avoid needing manual index creation
      if (startDate) {
        data = data.filter(e => e.startTime >= startDate);
      }
      if (endDate) {
        data = data.filter(e => e.startTime <= endDate);
      }
      data.sort((a,b) => a.startTime - b.startTime);
      setEvents(data);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "events"));

    return () => unsubscribe();
  }, [user, startDate, endDate]);

  const createEvent = async (data: Omit<AppEvent, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "events"), {
        ...data,
        userId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "events");
    }
  };

  const updateEvent = async (id: string, data: Partial<AppEvent>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "events", id), {
        ...data,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `events/${id}`);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "events", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  };

  return { events, loading, createEvent, updateEvent, deleteEvent };
}

export function useReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "reminders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reminder));
      data.sort((a,b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.dueTime && b.dueTime) return a.dueTime - b.dueTime;
        return a.createdAt - b.createdAt;
      });
      setReminders(data);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "reminders"));

    return () => unsubscribe();
  }, [user]);

  const createReminder = async (data: Omit<Reminder, "id" | "userId" | "createdAt" | "completed">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "reminders"), {
        ...data,
        completed: false,
        userId: user.uid,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "reminders");
    }
  };

  const updateReminder = async (id: string, data: Partial<Reminder>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "reminders", id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reminders/${id}`);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "reminders", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
    }
  };

  return { reminders, loading, createReminder, updateReminder, deleteReminder };
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  updatedAt: number;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "userProfiles", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setLoading(false);
    }, (error) => {
      console.error("userProfiles read error:", error.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const saveProfile = async (data: Omit<UserProfile, "userId" | "updatedAt">) => {
    if (!user) return;
    await setDoc(doc(db, "userProfiles", user.uid), {
      ...data,
      userId: user.uid,
      updatedAt: Date.now(),
    }, { merge: true });
  };

  return { profile, loading, saveProfile };
}
