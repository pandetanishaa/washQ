import { motion } from "framer-motion";

interface PixelLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const PixelLoader = ({ size = "md", text = "Loading..." }: PixelLoaderProps) => {
  const dimensions = {
    sm: { container: 60, drum: 30 },
    md: { container: 100, drum: 50 },
    lg: { container: 140, drum: 70 },
  };

  const { container, drum } = dimensions[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Pixel Washing Machine */}
      <div 
        className="relative pixel-card bg-card p-2"
        style={{ width: container, height: container }}
      >
        {/* Machine body */}
        <div className="absolute inset-2 bg-muted rounded-md">
          {/* Drum window */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center overflow-hidden"
            style={{ width: drum, height: drum }}
          >
            {/* Spinning clothes */}
            <motion.div
              className="wash-spin"
              style={{ width: drum - 12, height: drum - 12 }}
            >
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <circle cx="20" cy="8" r="4" fill="hsl(var(--secondary))" />
                <circle cx="32" cy="20" r="4" fill="hsl(var(--accent))" />
                <circle cx="20" cy="32" r="4" fill="hsl(var(--primary))" />
                <circle cx="8" cy="20" r="4" fill="hsl(var(--warning))" />
              </svg>
            </motion.div>
          </div>
          
          {/* Control panel */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-warning" />
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <motion.p 
        className="text-lg text-muted-foreground font-pixel"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default PixelLoader;
