"use client";

import { useEffect, useState } from "react";

export function RenderTime() {
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const value = performance.now();
      setElapsed(Math.max(1, Math.round(value)));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <span className="tabular text-ink/90" aria-live="off">
      {elapsed === null ? "measuring" : `${elapsed}ms`}
    </span>
  );
}
