import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Signal lost. 404",
  description: "This route diverged from the expected trajectory.",
};

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6 py-32">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-neon">error 404</p>
      <h1 className="mt-6 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.95] tracking-tight text-ink">
        This route diverged
        <br />
        <span className="text-gradient">from the trajectory.</span>
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
        The requested node does not exist in this graph. Return to the origin and continue from a
        known vertex.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-neon transition hover:bg-neon/20"
      >
        ← return to origin
      </Link>
    </section>
  );
}
