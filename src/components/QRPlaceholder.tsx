import { QrCode } from "lucide-react";

interface QRPlaceholderProps {
  machineId?: string;
  size?: "sm" | "md" | "lg";
}

const QRPlaceholder = ({ machineId, size = "md" }: QRPlaceholderProps) => {
  const dimensions = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  return (
    <div className={`${dimensions[size]} pixel-card bg-card flex flex-col items-center justify-center gap-2`}>
      <QrCode className="w-1/2 h-1/2 text-primary" />
      {machineId && (
        <span className="text-xs text-muted-foreground font-pixel">
          #{machineId}
        </span>
      )}
    </div>
  );
};

export default QRPlaceholder;
