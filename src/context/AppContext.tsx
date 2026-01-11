import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Machine } from "@/components/MachineCard";
import { MachineStatus } from "@/components/StatusBadge";

interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  activeBooking?: string;
}

interface AuthCredentials {
  email: string;
  role: "user" | "admin";
}

interface AppContextType {
  user: User | null;
  userRole: "user" | "admin" | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (credentials: AuthCredentials) => void;
  logout: () => void;
  machines: Machine[];
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
  updateMachineStatus: (id: string, status: MachineStatus) => void;
  addMachine: (machine: Omit<Machine, "id">) => void;
  removeMachine: (id: string) => void;
  bookMachine: (machineId: string) => boolean;
  clearActiveBooking: () => void;
  startWash: (machineId: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialMachines: Machine[] = [
  { id: "m1", name: "Washer #1", status: "available" },
  { id: "m2", name: "Washer #2", status: "running", timeRemaining: 15 },
  { id: "m3", name: "Washer #3", status: "waiting", queueCount: 2 },
  { id: "m4", name: "Washer #4", status: "available" },
  { id: "m5", name: "Washer #5", status: "out-of-order" },
  { id: "m6", name: "Washer #6", status: "running", timeRemaining: 28 },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("washq_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Restore active booking from localStorage
        const savedBooking = localStorage.getItem("washq_activeBooking");
        if (savedBooking) {
          parsedUser.activeBooking = savedBooking;
        }
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to load user from localStorage", err);
        localStorage.removeItem("washq_user");
        localStorage.removeItem("washq_activeBooking");
      }
    }
  }, []);

  // Compute auth state
  const isAuthenticated = user !== null;
  const userRole = user?.role || null;

  // Login function
  const login = (credentials: AuthCredentials) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: credentials.email,
      role: credentials.role,
    };
    setUser(newUser);
    localStorage.setItem("washq_user", JSON.stringify(newUser));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("washq_user");
  };

  const updateMachineStatus = (id: string, status: MachineStatus) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              queueCount: status === "waiting" ? m.queueCount : undefined,
              timeRemaining: status === "running" ? 30 : undefined,
            }
          : m
      )
    );
  };

  const addMachine = (machine: Omit<Machine, "id">) => {
    const newId = `m${Date.now()}`;
    setMachines((prev) => [...prev, { ...machine, id: newId }]);
  };

  const removeMachine = (id: string) => {
    setMachines((prev) => prev.filter((m) => m.id !== id));
  };

  const bookMachine = (machineId: string): boolean => {
    if (user?.activeBooking) {
      return false; // User already has an active booking
    }

    const machine = machines.find((m) => m.id === machineId);
    if (!machine) return false;

    if (machine.status === "available") {
      updateMachineStatus(machineId, "waiting");
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId ? { ...m, queueCount: 1 } : m
        )
      );
    } else if (machine.status === "waiting" || machine.status === "running") {
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId
            ? { ...m, queueCount: (m.queueCount || 0) + 1 }
            : m
        )
      );
    }

    setUser((prev) => (prev ? { ...prev, activeBooking: machineId } : null));
    // Persist active booking to localStorage
    localStorage.setItem("washq_activeBooking", machineId);
    return true;
  };

  const clearActiveBooking = () => {
    setUser((prev) => (prev ? { ...prev, activeBooking: undefined } : null));
    localStorage.removeItem("washq_activeBooking");
  };

  const startWash = (machineId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      updateMachineStatus(machineId, "running");
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId ? { ...m, timeRemaining: 30 } : m
        )
      );
      setIsLoading(false);
    }, 2000);
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
