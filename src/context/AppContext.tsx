import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Machine } from "@/components/MachineCard";
import { MachineStatus } from "@/components/StatusBadge";
import { auth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
  Timestamp,
  getDoc,
} from "firebase/firestore";

/**
 * WASHQ APPLICATION CONTEXT WITH FIREBASE INTEGRATION
 * 
 * KEY FEATURES & RESTRICTIONS:
 * 
 * 1. AUTHENTICATION
 *    - Uses Firebase Auth with email/password
 *    - Two roles: "user" and "admin" (stored in custom claims or user doc)
 *    - Automatically restored on app mount via onAuthStateChanged
 *    - Offline-capable: Auth state persists across sessions
 * 
 * 2. BOOKING SYSTEM
 *    - Users can only book machines with valid machineId context
 *    - machineId must come from QR scan or machine list selection
 *    - Only ONE active booking per user at a time
 *    - Active bookings stored in Firestore "bookings" collection
 *    - Offline: Local changes sync when reconnected
 * 
 * 3. FEEDBACK SYSTEM
 *    - Users must be logged in to submit feedback
 *    - Feedback stored in Firestore "feedback" collection
 *    - Admin can view all feedback with user email, timestamp, and message
 *    - Offline: Local submissions sync when reconnected
 * 
 * 4. DATA PERSISTENCE
 *    - Machines, bookings, feedback synced with Firestore
 *    - Offline persistence enabled: IndexedDB caches all data
 *    - Automatic sync when app comes online
 *    - Real-time listeners for machines (if enabled)
 */

interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  activeBooking?: string;
}

interface AuthCredentials {
  email: string;
  password: string;
  role: "user" | "admin";
}

export interface Feedback {
  id: string;
  userId: string;
  userEmail: string;
  subject: "issue" | "suggestion" | "other";
  message: string;
  createdAt: string;
}

interface AppContextType {
  user: User | null;
  userRole: "user" | "admin" | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  machines: Machine[];
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
  updateMachineStatus: (id: string, status: MachineStatus) => Promise<void>;
  addMachine: (machine: Omit<Machine, "id">) => Promise<void>;
  removeMachine: (id: string) => Promise<void>;
  bookMachine: (machineId: string) => Promise<boolean>;
  clearActiveBooking: () => Promise<void>;
  startWash: (machineId: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fetchMachineDetails: (machineId: string) => Promise<Machine | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth listener and load initial data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - fetch their role and active booking
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const usersSnapshot = await getDocs(
            query(collection(db, "users"), where("uid", "==", firebaseUser.uid))
          );
          
          let role: "user" | "admin" = "user";
          if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data();
            role = userData.role || "user";
          }

          // Fetch active booking
          const bookingsSnapshot = await getDocs(
            query(
              collection(db, "bookings"),
              where("userId", "==", firebaseUser.uid)
            )
          );

          let activeBooking: string | undefined;
          if (!bookingsSnapshot.empty) {
            activeBooking = bookingsSnapshot.docs[0].data().machineId;
          }

          const appUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            role,
            activeBooking,
          };
          setUser(appUser);
        } catch (error) {
          console.error("Error loading user data:", error);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            role: "user",
          });
        }
      } else {
        // User is signed out
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load machines from Firestore
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const machinesSnapshot = await getDocs(collection(db, "machines"));
        const machinesList: Machine[] = machinesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          status: doc.data().status as MachineStatus,
          timeRemaining: doc.data().timeRemaining,
          queueCount: doc.data().queueCount,
        }));
        setMachines(machinesList);
      } catch (error) {
        console.error("Error loading machines:", error);
        // Fallback to empty array - offline data will be served from cache
        setMachines([]);
      }
    };

    loadMachines();
  }, []);

  // Compute auth state
  const isAuthenticated = user !== null;
  const userRole = user?.role || null;

  // Firebase login function
  const login = async (credentials: AuthCredentials) => {
    try {
      let isNewUser = false;
      let userCredential;

      // Try to sign in first
      try {
        userCredential = await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );
      } catch (error: any) {
        // If user doesn't exist, create account
        // Handle both "user-not-found" (existing Firebase) and "invalid-credential" (no users)
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/invalid-credential"
        ) {
          console.log(
            "User not found or invalid credentials. Creating new account..."
          );
          userCredential = await createUserWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          isNewUser = true;
        } else {
          // Re-throw other errors (wrong password, invalid email, etc.)
          console.error("Authentication error:", error.code, error.message);
          throw error;
        }
      }

      // For new users, create user document in Firestore with role "user"
      if (isNewUser) {
        await addDoc(collection(db, "users"), {
          uid: userCredential.user.uid,
          email: credentials.email,
          role: "user", // Default role - new users are always "user"
          createdAt: Timestamp.now(),
        });
      }

      // Update last login timestamp for existing users
      if (!isNewUser) {
        const usersSnapshot = await getDocs(
          query(collection(db, "users"), where("uid", "==", userCredential.user.uid))
        );
        if (!usersSnapshot.empty) {
          const userDocId = usersSnapshot.docs[0].id;
          await updateDoc(doc(db, "users", userDocId), {
            lastLogin: Timestamp.now(),
          });
        }
      }

      // Fetch user's actual role and active booking from Firestore
      const usersSnapshot = await getDocs(
        query(collection(db, "users"), where("uid", "==", userCredential.user.uid))
      );

      let fetchedRole: "user" | "admin" = "user";
      if (!usersSnapshot.empty) {
        const userData = usersSnapshot.docs[0].data();
        fetchedRole = userData.role || "user";
      }

      // Fetch active booking
      const bookingsSnapshot = await getDocs(
        query(
          collection(db, "bookings"),
          where("userId", "==", userCredential.user.uid)
        )
      );

      let activeBooking: string | undefined;
      if (!bookingsSnapshot.empty) {
        activeBooking = bookingsSnapshot.docs[0].data().machineId;
      }

      const appUser: User = {
        id: userCredential.user.uid,
        email: credentials.email,
        role: fetchedRole,
        activeBooking,
      };
      
      // Set user immediately so UI can respond without waiting for onAuthStateChanged
      setUser(appUser);
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Firebase logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateMachineStatus = async (id: string, status: MachineStatus) => {
    try {
      const machineDocRef = doc(db, "machines", id);
      await updateDoc(machineDocRef, {
        status,
        timeRemaining: status === "running" ? 30 : undefined,
        queueCount: status === "waiting" ? 1 : undefined,
      });

      // If machine is returning to "available", clear all bookings for this machine
      if (status === "available") {
        const bookingsSnapshot = await getDocs(
          query(
            collection(db, "bookings"),
            where("machineId", "==", id)
          )
        );

        const batch = writeBatch(db);
        bookingsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        // Update current user's activeBooking if they had a booking on this machine
        if (user?.activeBooking === id) {
          setUser((prev) =>
            prev ? { ...prev, activeBooking: undefined } : null
          );
        }
      }

      // Update local state
      setMachines((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status,
                timeRemaining: status === "running" ? 30 : undefined,
                queueCount: status === "waiting" ? 1 : undefined,
              }
            : m
        )
      );
    } catch (error) {
      console.error("Error updating machine status:", error);
      throw error;
    }
  };

  // Helper function to remove undefined fields from an object
  const sanitizeObject = (obj: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
  };

  const addMachine = async (machine: Omit<Machine, "id">) => {
    try {
      const machineData = sanitizeObject({
        name: machine.name,
        status: machine.status,
        timeRemaining: machine.timeRemaining ?? 0, // Default to 0 if undefined
        queueCount: machine.queueCount,
        createdAt: Timestamp.now(),
      });

      const docRef = await addDoc(collection(db, "machines"), machineData);

      // Update local state
      setMachines((prev) => [...prev, { ...machine, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding machine:", error);
      throw error;
    }
  };

  const removeMachine = async (id: string) => {
    try {
      await deleteDoc(doc(db, "machines", id));
      setMachines((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error removing machine:", error);
      throw error;
    }
  };

  const bookMachine = async (machineId: string): Promise<boolean> => {
    // Validate machineId is provided
    if (!machineId || !machineId.trim()) {
      console.warn("Invalid machineId provided to bookMachine");
      return false;
    }

    // Check local state first
    if (user?.activeBooking) {
      console.warn("User already has an active booking:", user.activeBooking);
      return false; // User already has an active booking
    }

    const machine = machines.find((m) => m.id === machineId);
    if (!machine) {
      console.warn("Machine not found:", machineId);
      return false;
    }

    try {
      // Double-check in Firestore to prevent race conditions
      const existingBookings = await getDocs(
        query(
          collection(db, "bookings"),
          where("userId", "==", user?.id)
        )
      );

      if (!existingBookings.empty) {
        console.warn("User already has active booking in Firestore");
        return false; // User already has an active booking in Firestore
      }

      // Create booking in Firestore
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: user?.id,
        userEmail: user?.email,
        machineId,
        startTime: Timestamp.now(),
        createdAt: Timestamp.now(),
      });

      // Update local state
      setUser((prev) =>
        prev
          ? { ...prev, activeBooking: machineId }
          : null
      );

      // Update machine status to waiting
      const newStatus: MachineStatus = "waiting";
      await updateMachineStatus(machineId, newStatus);

      return true;
    } catch (error) {
      console.error("Error booking machine:", error);
      return false;
    }
  };

  const clearActiveBooking = async () => {
    try {
      if (!user?.activeBooking) return;

      // Delete booking from Firestore
      const bookingsSnapshot = await getDocs(
        query(
          collection(db, "bookings"),
          where("userId", "==", user.id),
          where("machineId", "==", user.activeBooking)
        )
      );

      const batch = writeBatch(db);
      bookingsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Update local state
      setUser((prev) =>
        prev ? { ...prev, activeBooking: undefined } : null
      );
    } catch (error) {
      console.error("Error clearing active booking:", error);
      throw error;
    }
  };

  const startWash = async (machineId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await updateMachineStatus(machineId, "running");
    } finally {
      setIsLoading(false);
    }
  };

  // Update fetchMachineDetails to return a Machine object
  const fetchMachineDetails = async (machineId: string): Promise<Machine> => {
    const machineRef = doc(db, "machines", machineId);
    const machineSnap = await getDoc(machineRef);
    if (machineSnap.exists()) {
      const data = machineSnap.data();
      return {
        id: machineId,
        name: data.name,
        status: data.status,
        queueCount: data.queueCount,
        timeRemaining: data.timeRemaining,
      };
    } else {
      throw new Error("Machine not found");
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        userRole,
        isAuthenticated,
        setUser,
        login,
        logout,
        machines,
        setMachines,
        updateMachineStatus,
        addMachine,
        removeMachine,
        bookMachine,
        clearActiveBooking,
        startWash,
        isLoading,
        setIsLoading,
        fetchMachineDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
