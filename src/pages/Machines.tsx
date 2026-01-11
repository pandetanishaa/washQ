import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import MachineCard from "@/components/MachineCard";
import { useApp } from "@/context/AppContext";
import { WashingMachine } from "lucide-react";

const Machines = () => {
  const { machines } = useApp();

  const availableCount = machines.filter((m) => m.status === "available").length;
  const runningCount = machines.filter((m) => m.status === "running").length;

  return (
    <Layout>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <WashingMachine className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-pixel text-foreground">Machines</h1>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 text-sm font-pixel">
            <span className="text-success">
              {availableCount} available
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary">
              {runningCount} running
            </span>
          </div>
        </motion.div>

        {/* Machine Grid */}
        <div className="grid gap-4">
          {machines.map((machine, index) => (
            <MachineCard key={machine.id} machine={machine} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {machines.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <WashingMachine className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-pixel">No machines available</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Machines;
