import { cn } from "@/lib/utils";

/**
 * StatusBadge Component
 * Displays activity status with semantic color coding
 */

export type ActivityStatus =
  | "voted"
  | "commented"
  | "uploaded"
  | "attended"
  | "achieved";

interface StatusBadgeProps {
  status: ActivityStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<
  ActivityStatus,
  { label: string; colorClass: string }
> = {
  voted: {
    label: "Balsavo",
    colorClass: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  commented: {
    label: "Komentuoja",
    colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  uploaded: {
    label: "Įkėlė",
    colorClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  attended: {
    label: "Dalyvavo",
    colorClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  achieved: {
    label: "Pasiekimas",
    colorClass: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export function StatusBadge({
  status,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-all",
        config.colorClass,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
