import { motion, Variants } from "framer-motion";

type MascotState = "idle" | "waiting" | "washing" | "complete" | "error";

interface PixelMascotProps {
  state: MascotState;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PixelMascot = ({ state, size = "md", className = "" }: PixelMascotProps) => {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  // Different expressions based on state
  const getExpression = () => {
    switch (state) {
      case "idle":
        return { eyes: "◕ ◕", mouth: "‿", blush: true };
      case "waiting":
        return { eyes: "◔ ◔", mouth: "○", blush: false };
      case "washing":
        return { eyes: "⌐ ⌐", mouth: "∪", blush: true };
      case "complete":
        return { eyes: "★ ★", mouth: "◡", blush: true };
      case "error":
        return { eyes: "× ×", mouth: "︵", blush: false };
      default:
        return { eyes: "◕ ◕", mouth: "‿", blush: true };
    }
  };

  const expression = getExpression();

  // Animation variants for different states
  const bodyVariants: Variants = {
    idle: {
      y: [0, -4, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
    },
    waiting: {
      x: [-2, 2, -2],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const },
    },
    washing: {
      rotate: [-5, 5, -5],
      transition: { duration: 0.3, repeat: Infinity, ease: "easeInOut" as const },
    },
    complete: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const },
    },
    error: {
      x: [-3, 3, -3, 3, 0],
      transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 },
    },
  };

  const armVariants: Variants = {
    idle: {},
    waiting: {
      rotate: [0, 10, 0, -10, 0],
      transition: { duration: 1, repeat: Infinity },
    },
    washing: {
      rotate: [0, 360],
      transition: { duration: 1, repeat: Infinity, ease: "linear" as const },
    },
    complete: {
      y: [0, -8, 0],
      transition: { duration: 0.3, repeat: Infinity },
    },
    error: {},
  };

  const getStateColor = () => {
    switch (state) {
      case "idle":
        return "hsl(var(--primary))";
      case "waiting":
        return "hsl(var(--warning))";
      case "washing":
        return "hsl(var(--primary))";
      case "complete":
        return "hsl(var(--success))";
      case "error":
        return "hsl(var(--danger))";
      default:
        return "hsl(var(--primary))";
    }
  };

  const getBubbles = () => {
    if (state !== "washing") return null;
    
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/30"
            style={{
              width: 6 + Math.random() * 8,
              height: 6 + Math.random() * 8,
              left: `${20 + Math.random() * 60}%`,
              bottom: "20%",
            }}
            animate={{
              y: [-10, -40 - Math.random() * 20],
              opacity: [0.6, 0],
              scale: [0.5, 1],
            }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </>
    );
  };

  const getStars = () => {
    if (state !== "complete") return null;

    return (
      <>
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-accent font-pixel text-lg"
            style={{
              left: `${10 + i * 25}%`,
              top: `${10 + (i % 2) * 10}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.25,
            }}
          >
            ✦
          </motion.div>
        ))}
      </>
    );
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Effects */}
      {getBubbles()}
      {getStars()}

      {/* Main character body */}
      <motion.div
        className="relative w-full h-full"
        variants={bodyVariants}
        animate={state}
      >
        {/* Body - Soap bar shaped */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Shadow */}
          <ellipse
            cx="50"
            cy="92"
            rx="30"
            ry="6"
            fill="hsl(var(--foreground) / 0.1)"
          />

          {/* Main body */}
          <rect
            x="20"
            y="25"
            width="60"
            height="55"
            rx="12"
            fill={getStateColor()}
            stroke="hsl(var(--foreground) / 0.2)"
            strokeWidth="2"
          />

          {/* Body shine */}
          <rect
            x="25"
            y="30"
            width="8"
            height="20"
            rx="4"
            fill="white"
            opacity="0.3"
          />

          {/* Face background */}
          <rect
            x="30"
            y="35"
            width="40"
            height="35"
            rx="8"
            fill="hsl(var(--card))"
          />

          {/* Eyes */}
          <g className="font-pixel">
            {/* Left eye */}
            <circle
              cx="40"
              cy="47"
              r="6"
              fill="hsl(var(--foreground))"
            />
            <circle
              cx="42"
              cy="45"
              r="2"
              fill="white"
            />

            {/* Right eye */}
            <circle
              cx="60"
              cy="47"
              r="6"
              fill="hsl(var(--foreground))"
            />
            <circle
              cx="62"
              cy="45"
              r="2"
              fill="white"
            />

            {/* Eyebrows based on state */}
            {state === "washing" && (
              <>
                <rect x="34" y="38" width="12" height="2" fill="hsl(var(--foreground))" rx="1" />
                <rect x="54" y="38" width="12" height="2" fill="hsl(var(--foreground))" rx="1" />
              </>
            )}
            {state === "error" && (
              <>
                <line x1="34" y1="36" x2="46" y2="42" stroke="hsl(var(--foreground))" strokeWidth="2" />
                <line x1="54" y1="42" x2="66" y2="36" stroke="hsl(var(--foreground))" strokeWidth="2" />
              </>
            )}
            {state === "complete" && (
              <>
                <path d="M 34 40 Q 40 36, 46 40" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
                <path d="M 54 40 Q 60 36, 66 40" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
              </>
            )}
          </g>

          {/* Blush */}
          {expression.blush && (
            <>
              <ellipse cx="30" cy="55" rx="5" ry="3" fill="hsl(var(--secondary))" opacity="0.5" />
              <ellipse cx="70" cy="55" rx="5" ry="3" fill="hsl(var(--secondary))" opacity="0.5" />
            </>
          )}

          {/* Mouth */}
          {state === "idle" && (
            <path d="M 43 60 Q 50 66, 57 60" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {state === "waiting" && (
            <ellipse cx="50" cy="62" rx="5" ry="4" fill="hsl(var(--foreground))" />
          )}
          {state === "washing" && (
            <path d="M 42 58 Q 50 68, 58 58" stroke="hsl(var(--foreground))" strokeWidth="2" fill="hsl(var(--secondary))" strokeLinecap="round" />
          )}
          {state === "complete" && (
            <path d="M 40 58 Q 50 70, 60 58" stroke="hsl(var(--foreground))" strokeWidth="2" fill="hsl(var(--accent))" strokeLinecap="round" />
          )}
          {state === "error" && (
            <path d="M 43 65 Q 50 58, 57 65" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* Arms */}
          <motion.g variants={armVariants} animate={state} style={{ transformOrigin: "15px 50px" }}>
            <rect x="8" y="45" width="14" height="10" rx="5" fill={getStateColor()} stroke="hsl(var(--foreground) / 0.2)" strokeWidth="1" />
          </motion.g>
          <motion.g variants={armVariants} animate={state} style={{ transformOrigin: "85px 50px" }}>
            <rect x="78" y="45" width="14" height="10" rx="5" fill={getStateColor()} stroke="hsl(var(--foreground) / 0.2)" strokeWidth="1" />
          </motion.g>

          {/* Feet */}
          <ellipse cx="35" cy="82" rx="10" ry="6" fill={getStateColor()} stroke="hsl(var(--foreground) / 0.2)" strokeWidth="1" />
          <ellipse cx="65" cy="82" rx="10" ry="6" fill={getStateColor()} stroke="hsl(var(--foreground) / 0.2)" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* State label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        key={state}
      >
        <span className="text-sm font-pixel text-muted-foreground">
          {state === "idle" && "Ready to wash!"}
          {state === "waiting" && "Waiting..."}
          {state === "washing" && "Scrubbing!"}
          {state === "complete" && "All done! ✨"}
          {state === "error" && "Oh no!"}
        </span>
      </motion.div>
    </div>
  );
};

export default PixelMascot;
