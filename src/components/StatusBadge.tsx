import { cn } from "@/lib/utils";

export type MachineStatus = "available" | "running" | "waiting" | "out-of-order";

interface StatusBadgeProps {
  status: MachineStatus;
  className?: string;
}

const statusConfig: Record<MachineStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "status-available",
  },
  running: {
    label: "Running",
    className: "status-running",
  },
  waiting: {
    label: "Waiting",
    className: "status-waiting",
  },
  "out-of-order": {
    label: "Out of Order",
    className: "status-out-of-order",
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-pixel uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
