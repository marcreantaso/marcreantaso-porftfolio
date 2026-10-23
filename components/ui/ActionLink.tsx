import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}

export function ActionLink({
  href,
  children,
  variant = "primary",
  icon,
  className,
  external,
  ariaLabel,
}: ActionLinkProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-[13px] font-semibold tracking-[-0.01em] transition-all duration-300",
        variant === "primary"
          ? "bg-neon text-[#041014] shadow-[0_0_0_1px_rgba(0,240,255,0.4),0_10px_40px_-12px_rgba(0,240,255,0.65)] hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.5),0_14px_50px_-10px_rgba(0,240,255,0.75)]"
          : "border border-white/12 bg-white/[0.025] text-ink backdrop-blur-sm hover:border-neon/40 hover:bg-neon/[0.06] hover:text-neon",
        className,
      )}
    >
      {children}
      {icon ? (
        <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          {icon}
        </span>
      ) : null}
    </a>
  );
}
