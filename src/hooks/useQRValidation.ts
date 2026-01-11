import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

interface UseQRValidationResult {
  machineId: string | undefined;
  isValid: boolean;
  redirectIfInvalid: () => boolean;
}

/**
 * Hook to validate QR scan context for machine booking
 * - Ensures machineId is present in URL params
 * - Ensures machine exists in machines list
 * - Redirects to machines page if validation fails
 */
export const useQRValidation = (): UseQRValidationResult => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { machines } = useApp();

  const machineExists = id ? machines.some((m) => m.id === id) : false;
  const isValid = !!id && machineExists;

  const redirectIfInvalid = (): boolean => {
    if (!id) {
      toast.error("Scan QR or select a machine first", {
        description: "A valid machine ID is required.",
      });
      navigate("/machines");
      return false;
    }

    if (!machineExists) {
      toast.error("Machine not found", {
        description: "This machine doesn't exist. Try scanning again.",
      });
      navigate("/machines");
      return false;
    }

    return true;
  };

  return {
    machineId: id,
    isValid,
    redirectIfInvalid,
  };
};
