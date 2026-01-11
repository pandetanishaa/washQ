import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PixelButton from "@/components/PixelButton";
import PixelLoader from "@/components/PixelLoader";
import StatusBadge from "@/components/StatusBadge";
import QRPlaceholder from "@/components/QRPlaceholder";
import PixelMascot from "@/components/PixelMascot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Clock, Users, Play, Calendar, QrCode, AlertCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * MachineStatus Page
 * 
 * QR Validation Flow:
 * 1. User scans QR code → routes to /machine/:id
 * 2. machineId is extracted from route params
 * 3. If machineId missing → show "No Machine Selected" error
 * 4. If machine doesn't exist in machines list → show "Machine Not Found" error
 * 5. If both valid → display machine details and allow booking
 * 
 * Booking Restrictions:
 * - User can only book if they have valid machineId context (from QR or URL)
 * - If machineId becomes invalid → show "Scan QR or select a machine first"
 * - Booking also respects single active booking constraint
 */
const MachineStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { machines, user, bookMachine, startWash, isLoading } = useApp();

  // Validate machineId exists in route params
  if (!id) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md text-center"
          >
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-pixel text-foreground mb-3">No Machine Selected</h2>
            <p className="text-muted-foreground font-pixel mb-6">
              Scan a QR code or select a machine to proceed
            </p>
            <PixelButton onClick={() => navigate("/machines")}>
              View All Machines
            </PixelButton>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const machine = machines.find((m) => m.id === id);

  if (!machine) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-pixel text-foreground mb-3">Machine Not Found</h2>
            <p className="text-muted-foreground font-pixel mb-6">
              The machine you're looking for doesn't exist. Try scanning a valid QR code.
            </p>
            <PixelButton onClick={() => navigate("/machines")}>
              Back to Machines
            </PixelButton>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const isUserInQueue = user?.activeBooking === machine.id;

  const handleBookSlot = () => {
    // Validate machineId context before booking
    if (!id || !machine) {
      toast.error("Scan QR or select a machine first", {
        description: "A valid machine ID is required to book.",
      });
      return;
    }

    const success = bookMachine(machine.id);
    if (success) {
      toast.success("Slot booked successfully!", {
        description: "You'll be notified when it's your turn.",
      });
    } else {
      toast.error("You already have an active booking", {
        description: "Complete your current wash first.",
      });
    }
  };

  const handleStartWash = () => {
    startWash(machine.id);
    toast.success("Wash started!", {
      description: "Your laundry is now being cleaned.",
    });
  };

  const getActionButton = () => {
    if (machine.status === "out-of-order") {
      return (
        <PixelButton variant="secondary" disabled className="w-full">
          Machine Unavailable
        </PixelButton>
      );
    }

    if (machine.status === "available" && !isUserInQueue) {
      return (
        <PixelButton
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2 pulse-glow"
          onClick={handleBookSlot}
        >
          <Calendar className="w-5 h-5" />
          Book Slot
        </PixelButton>
      );
    }

    if (isUserInQueue && machine.status === "waiting") {
      return (
        <PixelButton
          variant="accent"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleStartWash}
        >
          <Play className="w-5 h-5" />
          Start Wash
        </PixelButton>
      );
    }

    if (machine.status === "running") {
      return (
        <PixelButton variant="secondary" disabled className="w-full">
          <Clock className="w-5 h-5 mr-2" />
          Wash in Progress
        </PixelButton>
      );
    }

    return (
      <PixelButton
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleBookSlot}
        disabled={!!user?.activeBooking}
      >
        <Users className="w-5 h-5 mr-2" />
        Join Queue
      </PixelButton>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <PixelLoader size="lg" text="Starting wash..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors"
          onClick={() => navigate("/machines")}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-pixel">Back</span>
        </motion.button>

        {/* Machine Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-pixel text-foreground mb-3">
            {machine.name}
          </h1>
          <StatusBadge status={machine.status} />
        </motion.div>

        {/* QR Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pixel-card p-4 mb-6"
        >
          <div className="flex items-start gap-4">
            <QrCode className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-pixel text-lg text-foreground mb-1">
                Scan to Book
              </h3>
              <p className="text-sm text-muted-foreground">
                Scan the QR code on this machine to quickly access booking.
                Each machine has a unique code.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pixel Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <PixelMascot
            state={
              machine.status === "available"
                ? "idle"
                : machine.status === "waiting"
                ? "waiting"
                : machine.status === "running"
                ? "washing"
                : "error"
            }
            size="lg"
          />
        </motion.div>

        {/* Status Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pixel-card p-4 mb-6"
        >
          {machine.status === "running" && (
            <div className="flex items-center justify-between">
              <span className="font-pixel text-foreground">Time Remaining</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-2xl font-pixel text-primary">
                  {machine.timeRemaining} min
                </span>
              </div>
            </div>
          )}

          {machine.status === "waiting" && (
            <div className="flex items-center justify-between">
              <span className="font-pixel text-foreground">Queue Position</span>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-warning" />
                <span className="text-2xl font-pixel text-warning">
                  {isUserInQueue ? "You're next!" : `${machine.queueCount} in line`}
                </span>
              </div>
            </div>
          )}

          {machine.status === "available" && (
            <div className="text-center">
              <span className="text-xl font-pixel text-success">
                ✨ Ready to use!
              </span>
            </div>
          )}

          {machine.status === "out-of-order" && (
            <div className="text-center">
              <span className="text-xl font-pixel text-danger">
                🔧 Under maintenance
              </span>
            </div>
          )}
        </motion.div>

        {/* Active Booking Alert */}
        {user?.activeBooking && user.activeBooking !== machine.id && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6"
          >
            <Alert className="border-2 border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 font-pixel text-sm">
                You already have an active booking on another machine. Complete it first!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {getActionButton()}
        </motion.div>

        {/* QR Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <QRPlaceholder machineId={machine.id} size="md" />
        </motion.div>
      </div>
    </Layout>
  );
};

export default MachineStatus;
