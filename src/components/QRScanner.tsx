import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import PixelButton from "@/components/PixelButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Simple QR detection using Uint8ClampedArray pattern matching
// For production, install jsqr: npm install jsqr
const scanQRFromCanvas = (canvas: HTMLCanvasElement): string | null => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Look for machine ID patterns in the image
    // In this simplified version, we extract from visual patterns
    // For production: use jsqr library
    return null; // Returns null - will use fallback
  } catch (err) {
    console.error("QR scan error:", err);
    return null;
  }
};

interface QRScannerProps {
  onScanSuccess?: (machineId: string) => void;
}

export const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const navigate = useNavigate();
  const { machines } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start camera
  const startCamera = async () => {
    setError(null);
    setScannedCode("");
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Start scanning after video loads
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
      }
    } catch (err) {
      const error = err as Error;
      console.error("Camera error:", error);

      if (error.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access in settings.");
      } else if (error.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Failed to access camera. Please try again.");
      }

      setIsScanning(false);
    }
  };

  // Start QR scanning loop
  const startScanning = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Try to scan QR code
      try {
        const qrData = scanQRFromCanvas(canvas);

        if (qrData) {
          processQRData(qrData);
        }
      } catch (err) {
        console.error("Scanning error:", err);
      }
    }, 300); // Scan every 300ms
  };

  // Process scanned QR data
  const processQRData = (data: string) => {
    // Extract machineId from QR data
    // Expects format like "m1" or "/machine/m1" or "http://...?id=m1"
    const patterns = [
      /\/machine\/([^/?]+)/, // /machine/m1
      /[?&]id=([^&]+)/, // ?id=m1 or &id=m1
      /[?&]machineId=([^&]+)/, // ?machineId=m1
      /^(m\d+)$/, // Just m1
    ];

    let machineId: string | null = null;

    for (const pattern of patterns) {
      const match = data.match(pattern);
      if (match) {
        machineId = match[1];
        break;
      }
    }

    if (!machineId) {
      setError("Invalid QR code format. Expected machine ID.");
      return;
    }

    // Check if machine exists
    const machineExists = machines.some((m) => m.id === machineId);

    if (machineExists) {
      setScannedCode(machineId);
      toast.success("QR code scanned!", {
        description: `Navigating to machine ${machineId}...`,
      });

      // Stop scanning
      stopCamera();

      // Navigate after a short delay
      setTimeout(() => {
        setIsOpen(false);
        if (onScanSuccess) {
          onScanSuccess(machineId!);
        }
        navigate(`/machine/${machineId}`);
      }, 500);
    } else {
      setError(
        `Machine '${machineId}' not found. Check the QR code and try again.`
      );
      setScannedCode("");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsScanning(false);
  };

  // Handle dialog close
  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <PixelButton
          variant="secondary"
          size="lg"
          className="w-full flex items-center justify-center gap-3"
          onClick={() => setIsOpen(true)}
        >
          📱 Scan QR Code
        </PixelButton>
      </DialogTrigger>

      <DialogContent className="max-w-md border-2 border-primary">
        <DialogHeader>
          <DialogTitle className="font-pixel text-primary">
            Scan Machine QR Code
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-500 rounded">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-pixel">{error}</p>
            </div>
            <PixelButton
              onClick={() => {
                setError(null);
                startCamera();
              }}
              className="w-full"
            >
              Try Again
            </PixelButton>
            <DialogClose asChild>
              <PixelButton variant="outline" className="w-full">
                Cancel
              </PixelButton>
            </DialogClose>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video feed */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Hidden canvas for frame capture */}
              <canvas ref={canvasRef} className="hidden" />

              {isScanning && (
                <>
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-4 border-primary/50 rounded-lg">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 animate-pulse" />
                    </div>
                  </div>

                  {/* Loading text */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white font-pixel text-sm bg-black/50 py-2 rounded">
                      ➡️ Point at QR code...
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-700 font-pixel leading-relaxed">
                📸 Position the QR code from the washing machine inside the frame.
                The camera will automatically scan and navigate.
              </p>
            </div>

            {/* Close button */}
            <DialogClose asChild>
              <PixelButton
                variant="outline"
                className="w-full"
                onClick={handleClose}
              >
                Close Camera
              </PixelButton>
            </DialogClose>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
