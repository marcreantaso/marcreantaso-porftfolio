import { ArrowUp, Mail, Terminal } from "lucide-react";
import { site, socials } from "@/lib/data/site";
import { withBasePath } from "@/lib/utils";
import { FacebookIcon, GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { PhiMark } from "@/components/ui/PhiMark";
import { RenderTime } from "./RenderTime";

const iconMap = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Facebook: FacebookIcon,
  Email: Mail,
} as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.07] bg-void/50">
      <div className="mx-auto w-full max-w-[86rem] px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.618fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-neon">
                <PhiMark className="h-9 w-9" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{site.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  {site.role}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
              {site.tagline} Open to software engineering internships, collaborations, and
              problems that need both rigor and taste.
            </p>

            <a
              href={`mailto:${site.email}`}
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-neon transition hover:text-white"
            >
              <Mail size={13} />
              {site.email}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-faint">Sitemap</p>
              <ul className="mt-4 space-y-2.5 text-[13px]">
                {[
                  { label: "Systems", href: "#systems" },
                  { label: "Metrics", href: "#metrics" },
                  { label: "Sandbox", href: "#sandbox" },
                  { label: "Timeline", href: "#timeline" },
                  { label: "Credentials", href: "#credentials" },
                  { label: "Contact", href: "#contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-muted transition hover:text-neon">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-faint">Elsewhere</p>
              <ul className="mt-4 space-y-2.5 text-[13px]">
                {socials.map((social) => {
                  const Icon = iconMap[social.label as keyof typeof iconMap];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={social.href.startsWith("mailto:") ? undefined : "noreferrer noopener"}
                        className="group inline-flex items-center gap-2 text-muted transition hover:text-neon"
                      >
                        <Icon size={13} className="text-faint group-hover:text-neon" />
                        {social.label}
                      </a>
                    </li>
                  );
                })}
                <li>
                  <a
                    href={withBasePath("/legacy/")}
                    className="group inline-flex items-center gap-2 text-muted transition hover:text-neon"
                  >
                    <Terminal size={13} className="text-faint group-hover:text-neon" />
                    Legacy portfolio
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-6 text-[11px] text-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. Built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and
            React Three Fiber.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em]">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" aria-hidden="true" />
              Math engine active
            </span>
            <span>
              Hydrated in <RenderTime />
            </span>
            <a
              href="#main"
              className="inline-flex items-center gap-1.5 transition hover:text-neon"
            >
              Top
              <ArrowUp size={11} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
