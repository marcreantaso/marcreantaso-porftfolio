import { cn } from "@/lib/utils";

export function PhiMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className ?? "h-8 w-8")}
    >
      <rect x="0.5" y="0.5" width="39" height="39" rx="10" stroke="currentColor" strokeOpacity="0.28" />
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.8" />
      <path
        d="M20 9a11 11 0 0 1 0 22V20h11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="1.7" fill="#10B981" />
    </svg>
  );
}
