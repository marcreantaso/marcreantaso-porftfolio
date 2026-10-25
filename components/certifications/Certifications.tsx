import { ArrowUpRight, BadgeCheck, ExternalLink } from "lucide-react";
import {
  academicFolder,
  certifications,
  credentialsFolder,
  type CredentialAccent,
} from "@/lib/data/certifications";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const ACCENT: Record<CredentialAccent, { badge: string; icon: string; glow: string }> = {
  neon: {
    badge: "border-neon/20 bg-neon/[0.06] text-neon",
    icon: "text-neon",
    glow: "hover:border-neon/30 hover:shadow-[0_0_44px_-18px_rgba(0,240,255,0.35)]",
  },
  mint: {
    badge: "border-mint/20 bg-mint/[0.06] text-mint",
    icon: "text-mint",
    glow: "hover:border-mint/30 hover:shadow-[0_0_44px_-18px_rgba(16,185,129,0.35)]",
  },
  plasma: {
    badge: "border-plasma/20 bg-plasma/[0.06] text-plasma",
    icon: "text-plasma",
    glow: "hover:border-plasma/30 hover:shadow-[0_0_44px_-18px_rgba(139,92,246,0.35)]",
  },
};

const DRIVE_LINK =
  "inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint transition hover:border-neon/30 hover:text-neon";

export function Certifications() {
  return (
    <section id="credentials" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="05"
            eyebrow="Certifications & credentials"
            title={
              <>
                Verified
                <br />
                <span className="text-muted/80">proof of work.</span>
              </>
            }
            description="Certificates from Cisco Networking Academy, AWS, Udemy, Wadhwani Foundation, and TED-Ed, plus academic honors and participation records. Every card opens the original certificate, so you can check the source yourself."
          />

          <Reveal delay={0.1} className="shrink-0">
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <a
                href={credentialsFolder}
                target="_blank"
                rel="noreferrer noopener"
                className={DRIVE_LINK}
              >
                <BadgeCheck size={13} aria-hidden="true" />
                {certifications.length} credentials · Google Drive
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
              <a
                href={academicFolder}
                target="_blank"
                rel="noreferrer noopener"
                className={DRIVE_LINK}
              >
                <BadgeCheck size={13} aria-hidden="true" />
                Academic records &amp; honors · Google Drive
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, index) => {
            const accent = ACCENT[cert.accent];

            return (
              <Reveal key={cert.id} delay={Math.min(index * 0.04, 0.28)} className="h-full">
                <a
                  href={cert.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(
                    "panel group flex h-full flex-col rounded-2xl p-5 transition duration-500 hover:-translate-y-0.5",
                    accent.glow,
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-[0.14em]",
                        accent.badge,
                      )}
                    >
                      {cert.category}
                    </span>
                    <ArrowUpRight
                      size={14}
                      className={cn(
                        "text-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                        accent.icon,
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-4 text-[14px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                    {cert.title}
                  </h3>
                  <p className="mt-1.5 text-[11.5px] font-medium text-muted">{cert.issuer}</p>
                  {cert.detail ? (
                    <p className="mt-1.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.1em] text-faint">
                      {cert.detail}
                    </p>
                  ) : null}

                  <div className="flex-1" />

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                      {cert.date ?? "Verified credential"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.12em]",
                        accent.icon,
                      )}
                    >
                      <ExternalLink size={10} aria-hidden="true" />
                      View
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-faint/70">
          Original files open in Google Drive · dates shown only when printed
        </p>
      </div>
    </section>
  );
}
