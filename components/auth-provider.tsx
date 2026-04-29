"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDocFromServer, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Test connection & Upsert user doc
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDocFromServer(userDocRef);
          
          if (!docSnap.exists()) {
             await setDoc(userDocRef, {
               email: currentUser.email,
               name: currentUser.displayName || "",
               createdAt: Date.now()
             });

             // Seed default event types for new user
             const defaultTypes = [
               { name: "Work", color: "#3B82F6" },
               { name: "Personal", color: "#10B981" },
               { name: "Appointment", color: "#F59E0B" },
               { name: "Travel", color: "#8B5CF6" },
               { name: "Reminder", color: "#EC4899" },
             ];
             const { collection, addDoc } = await import("firebase/firestore");
             for (const t of defaultTypes) {
               await addDoc(collection(db, "eventTypes"), {
                 userId: currentUser.uid,
                 name: t.name,
                 color: t.color,
                 icon: "",
                 createdAt: Date.now()
               });
             }
          }
        } catch (error) {
          console.error("Connection or creation error", error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
