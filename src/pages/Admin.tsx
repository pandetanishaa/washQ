import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PixelButton from "@/components/PixelButton";
import StatusBadge, { MachineStatus } from "@/components/StatusBadge";
import QRPlaceholder from "@/components/QRPlaceholder";
import { useApp } from "@/context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  WashingMachine,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const { machines, addMachine, removeMachine, updateMachineStatus } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<string | null>(null);
  const [newMachineName, setNewMachineName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<MachineStatus>("available");

  const handleAddMachine = () => {
    if (!newMachineName.trim()) {
      toast.error("Please enter a machine name");
      return;
    }

    addMachine({
      name: newMachineName,
      status: "available",
    });

    setNewMachineName("");
    setIsAddDialogOpen(false);
    toast.success("Machine added successfully!");
  };

  const handleUpdateStatus = (machineId: string, status: MachineStatus) => {
    updateMachineStatus(machineId, status);
    setEditingMachine(null);
    toast.success("Machine status updated!");
  };

  const handleRemoveMachine = (machineId: string) => {
    removeMachine(machineId);
    toast.success("Machine removed");
  };

  return (
    <Layout>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-pixel text-foreground">
                Admin Panel
              </h1>
            </div>

            {/* Add Machine Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <PixelButton variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </PixelButton>
              </DialogTrigger>
              <DialogContent className="pixel-card border-0">
                <DialogHeader>
                  <DialogTitle className="font-pixel text-xl">
                    Add New Machine
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-pixel">
                      Machine Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Washer #7"
                      value={newMachineName}
                      onChange={(e) => setNewMachineName(e.target.value)}
                      className="font-pixel"
                    />
                  </div>
                  <PixelButton
                    variant="primary"
                    className="w-full"
                    onClick={handleAddMachine}
                  >
                    Add Machine
                  </PixelButton>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="pixel-card p-3 text-center">
              <p className="text-2xl font-pixel text-primary">
                {machines.length}
              </p>
              <p className="text-xs text-muted-foreground font-pixel">
                Total Machines
              </p>
            </div>
            <div className="pixel-card p-3 text-center">
              <p className="text-2xl font-pixel text-success">
                {machines.filter((m) => m.status === "available").length}
              </p>
              <p className="text-xs text-muted-foreground font-pixel">
                Available
              </p>
            </div>
          </div>
        </motion.div>

        {/* Machine List */}
        <div className="space-y-4">
          {machines.map((machine, index) => (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="pixel-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <WashingMachine
                    className={`w-6 h-6 ${
                      machine.status === "running"
                        ? "wash-spin text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <h3 className="font-pixel text-lg text-foreground">
                      {machine.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ID: {machine.id}
                    </p>
                  </div>
                </div>
                <StatusBadge status={machine.status} />
              </div>

              {/* Edit Mode */}
              {editingMachine === machine.id ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <Label className="font-pixel text-sm mb-2 block">
                    Change Status
                  </Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) =>
                      setSelectedStatus(value as MachineStatus)
                    }
                  >
                    <SelectTrigger className="font-pixel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="out-of-order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 mt-3">
                    <PixelButton
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        handleUpdateStatus(machine.id, selectedStatus)
                      }
                    >
                      Save
                    </PixelButton>
                    <PixelButton
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMachine(null)}
                    >
                      Cancel
                    </PixelButton>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  {/* QR Preview */}
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-pixel">
                      QR Code Available
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <PixelButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingMachine(machine.id);
                        setSelectedStatus(machine.status);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </PixelButton>
                    <PixelButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMachine(machine.id)}
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </PixelButton>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* QR Code Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pixel-card p-4 text-center"
        >
          <h3 className="font-pixel text-lg text-foreground mb-2">
            Machine QR Codes
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Each machine has a unique QR code that links to its status page.
          </p>
          <div className="flex justify-center">
            <QRPlaceholder size="lg" />
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Admin;
