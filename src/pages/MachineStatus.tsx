import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PixelButton from "@/components/PixelButton";
import PixelLoader from "@/components/PixelLoader";
import StatusBadge from "@/components/StatusBadge";
import QRPlaceholder from "@/components/QRPlaceholder";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Clock, Users, Play, Calendar, QrCode } from "lucide-react";
import { toast } from "sonner";

const MachineStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { machines, user, bookMachine, startWash, isLoading } = useApp();

  const machine = machines.find((m) => m.id === id);

  if (!machine) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <p className="text-xl font-pixel text-muted-foreground mb-4">
            Machine not found
          </p>
          <PixelButton variant="outline" onClick={() => navigate("/machines")}>
            Back to Machines
          </PixelButton>
        </div>
      </Layout>
    );
  }

  const isUserInQueue = user?.activeBooking === machine.id;

  const handleBookSlot = () => {
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

        {/* Machine Visual Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="w-48 h-56 pixel-card bg-card p-3">
            <div className="h-full bg-muted rounded-lg relative overflow-hidden flex flex-col">
              {/* Control panel */}
              <div className="h-10 bg-card m-2 rounded flex items-center justify-between px-3">
                <div className="flex gap-1">
                  <div className={`w-3 h-3 rounded-full ${machine.status === "running" ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                  <div className={`w-3 h-3 rounded-full ${machine.status === "waiting" ? "bg-warning animate-pulse" : "bg-muted-foreground"}`} />
                </div>
                <span className="text-xs font-pixel text-muted-foreground">
                  #{machine.id}
                </span>
              </div>
              
              {/* Drum area */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center">
                  {machine.status === "running" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20"
                    >
                      <svg viewBox="0 0 40 40" className="w-full h-full">
                        <circle cx="20" cy="6" r="5" fill="hsl(var(--secondary))" />
                        <circle cx="34" cy="20" r="5" fill="hsl(var(--accent))" />
                        <circle cx="20" cy="34" r="5" fill="hsl(var(--primary))" />
                        <circle cx="6" cy="20" r="5" fill="hsl(var(--warning))" />
                      </svg>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <p className="text-4xl">👕</p>
                      <p className="text-xs font-pixel text-muted-foreground mt-1">
                        {machine.status === "available" ? "Ready!" : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
