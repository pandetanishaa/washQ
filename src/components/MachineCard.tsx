import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StatusBadge, { MachineStatus } from "./StatusBadge";
import { WashingMachine, Users, Clock } from "lucide-react";
import { QRScanner } from "@/components/QRScanner"; // Correct named import
import { useState } from "react";

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  queueCount?: number;
  timeRemaining?: number;
}

interface MachineCardProps {
  machine: Machine;
  index: number;
}

const MachineCard = ({ machine, index }: MachineCardProps) => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

  const getStatusInfo = () => {
    switch (machine.status) {
      case "available":
        return "Free now";
      case "running":
        return `${machine.timeRemaining || 0} mins left`;
      case "waiting":
        return `${machine.queueCount || 0} in queue`;
      case "out-of-order":
        return "Unavailable";
    }
  };

  const handleQRScan = (scannedId: string) => {
    if (scannedId === machine.id) {
      navigate(`/machine/${scannedId}`); // Redirect to machine page
    } else {
      alert("Invalid QR code. Please scan the correct machine QR.");
    }
    setIsScanning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="pixel-card p-4 cursor-pointer hover:scale-[1.02] transition-transform"
      onClick={() => setIsScanning(true)} // Trigger QR scanner
    >
      <div className="flex items-center gap-4">
        {/* Machine Icon */}
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
          <WashingMachine 
            className={`w-8 h-8 ${machine.status === "running" ? "wash-spin text-primary" : "text-muted-foreground"}`}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-xl font-pixel text-foreground">{machine.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            {machine.status === "waiting" && (
              <>
                <Users className="w-4 h-4" />
                <span className="text-sm">{machine.queueCount} waiting</span>
              </>
            )}
            {machine.status === "running" && (
              <>
                <Clock className="w-4 h-4" />
                <span className="text-sm">{machine.timeRemaining} mins</span>
              </>
            )}
            {machine.status === "available" && (
              <span className="text-sm text-success">Ready to use!</span>
            )}
            {machine.status === "out-of-order" && (
              <span className="text-sm text-danger">Under maintenance</span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <StatusBadge status={machine.status} />
      </div>

      {/* Quick Info Footer */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-sm text-muted-foreground font-pixel">{getStatusInfo()}</p>
      </div>

      {/* QR Scanner Modal */}
      {isScanning && <QRScanner onScan={handleQRScan} onClose={() => setIsScanning(false)} />}
    </motion.div>
  );
};

export default MachineCard;
