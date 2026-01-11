import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PixelButton from "@/components/PixelButton";
import { ScanLine, List, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-7xl font-pixel text-primary text-pixel-shadow">
              wash<span className="text-secondary">Q</span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-pixel text-foreground mb-4"
          >
            No Queues. Just Clean Wins.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-md mx-auto mb-8"
          >
            Scan. Book. Wash. No more standing in long laundry queues.
          </motion.p>
        </motion.div>

        {/* Pixel Washing Machine Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mb-10"
        >
          <div className="w-40 h-48 pixel-card bg-card p-3">
            {/* Machine body */}
            <div className="h-full bg-muted rounded-lg relative overflow-hidden">
              {/* Control panel */}
              <div className="absolute top-2 left-2 right-2 h-8 bg-card rounded flex items-center justify-between px-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                </div>
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              
              {/* Drum */}
              <div className="absolute top-14 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16"
                >
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <circle cx="20" cy="6" r="5" fill="hsl(var(--secondary))" />
                    <circle cx="34" cy="20" r="5" fill="hsl(var(--accent))" />
                    <circle cx="20" cy="34" r="5" fill="hsl(var(--primary))" />
                    <circle cx="6" cy="20" r="5" fill="hsl(var(--warning))" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Decorative bubbles */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-bubble-1 opacity-60"
          />
          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute -bottom-2 -left-4 w-6 h-6 rounded-full bg-bubble-2 opacity-60"
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <PixelButton
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-3 bounce-gentle pulse-glow"
            onClick={() => navigate("/machines")}
          >
            <ScanLine className="w-5 h-5" />
            Scan QR & Book Slot
          </PixelButton>

          <PixelButton
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3"
            onClick={() => navigate("/machines")}
          >
            <List className="w-5 h-5" />
            View Machines
          </PixelButton>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground font-pixel">
            🎮 Gamified laundry for smart hostels
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
