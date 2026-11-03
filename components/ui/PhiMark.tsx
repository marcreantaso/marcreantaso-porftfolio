import { cn } from "@/lib/utils";

export function PhiMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className ?? "h-8 w-8")}
    >
      <rect x="1" y="1" width="46" height="46" rx="12" fill="currentColor" fillOpacity="0.05" />
      <rect x="1" y="1" width="46" height="46" rx="12" stroke="currentColor" strokeOpacity="0.32" />
      <path
        d="M11 34V14l8.5 11L28 14v20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 34V14h5.5a5.5 5.5 0 0 1 0 11H28m5.5 0L38 34"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="14" r="2" fill="#10B981" />
    </svg>
  );
}
