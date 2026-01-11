import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PixelButton from "@/components/PixelButton";
import { QRScanner } from "@/components/QRScanner";
import { ScanLine, List, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const Index = () => {
  const { user } = useApp();
  const [activeBooking, setActiveBooking] = useState(null);
  const [machineDetails, setMachineDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (user?.activeBooking) {
        try {
          // Fetch booking details
          const bookingRef = doc(db, "bookings", user.activeBooking);
          const bookingSnap = await getDoc(bookingRef);

          if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data();

            // Fetch machine details
            const machineRef = doc(db, "machines", bookingData.machineId);
            const machineSnap = await getDoc(machineRef);

            if (machineSnap.exists()) {
              setMachineDetails(machineSnap.data());
            }
          }
        } catch (error) {
          console.error("Error fetching booking details:", error);
        }
      }
    };

    fetchBookingDetails();
  }, [user]);

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

        {/* Active Booking Section */}
        <div className="mt-8 w-full max-w-md">
          {user?.activeBooking && machineDetails ? (
            <div className="pixel-card p-4">
              <h2 className="text-xl font-pixel text-primary mb-2">Active Booking</h2>
              <p className="text-lg font-pixel text-foreground">Machine: {machineDetails.name}</p>
              <p className="text-sm text-muted-foreground">Status: {machineDetails.status.toUpperCase()}</p>
              {machineDetails.timeRemaining !== undefined && (
                <p className="text-sm text-muted-foreground">Time Remaining: {machineDetails.timeRemaining} mins</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground font-pixel">You have no active bookings</p>
          )}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <QRScanner />

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
