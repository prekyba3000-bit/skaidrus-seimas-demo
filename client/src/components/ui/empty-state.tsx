import { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty State component for when there's no data to display
 * Uses glassmorphism styling to match the app theme
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionButton,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        "bg-surface-dark/50 backdrop-blur-sm border border-surface-border rounded-lg",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#92adc9] opacity-60" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#92adc9] mb-6 max-w-md">{description}</p>
      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          variant="outline"
          className="border-surface-border text-white hover:bg-white/10"
        >
          {actionButton.label}
        </Button>
      )}
    </div>
  );
}
