import * as React from "react";
import { cn } from "@/lib/utils";

// Lightweight tooltip stubs to avoid Radix runtime in environments where React hooks may not be ready yet
// These components no-op in web preview but keep the API compatible

export const TooltipProvider: React.FC<{ children?: React.ReactNode; delayDuration?: number }>
  = ({ children }) => <>{children}</>;

export const Tooltip: React.FC<{ children?: React.ReactNode }>
  = ({ children }) => <>{children}</>;

export const TooltipTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }>(
  ({ asChild, className, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, { ref, ...props });
    }
    return (
      <button ref={ref} className={cn(className)} {...props}>
        {children}
      </button>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

type TooltipContentProps = React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, style, children, side, align, sideOffset, ...props }, ref) => {
    // No-op render; keep structure without actual portal/positioning
    return (
      <div ref={ref} className={cn("hidden", className)} style={style} {...props}>
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

