import { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Machine } from "@/components/MachineCard";
import { toast } from "sonner";

/**
 * Hook to monitor machine status changes and notify user
 * when their booked machine becomes available.
 * 
 * Triggers notification when:
 * - Machine status changes from RUNNING → AVAILABLE
 * - User has an active booking on that machine
 */
export const useMachineNotifications = () => {
  const { machines, user } = useApp();
  const previousMachinesRef = useRef<Machine[]>(machines);

  useEffect(() => {
    const previousMachines = previousMachinesRef.current;

    // Check each machine for status changes
    machines.forEach((currentMachine) => {
      const previousMachine = previousMachines.find((m) => m.id === currentMachine.id);

      if (!previousMachine) return; // Machine is new, skip

      // Detect RUNNING → AVAILABLE transition
      const wasRunning = previousMachine.status === "running";
      const isNowAvailable = currentMachine.status === "available";

      if (wasRunning && isNowAvailable && user?.activeBooking === currentMachine.id) {
        // User's booked machine is now available
        toast.success("Your machine is ready!", {
          description: `${currentMachine.name} is now available and waiting for you.`,
          duration: 5000,
        });
      }
    });

    // Update previous machines reference
    previousMachinesRef.current = machines;
  }, [machines, user?.activeBooking]);
};
