"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { navigation, site, socials } from "@/lib/data/site";
import { cn } from "@/lib/utils";
import { PhiMark } from "@/components/ui/PhiMark";
import { GithubIcon } from "@/components/ui/BrandIcons";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navigation
      .map((item) => document.querySelector(item.href))
      .filter((section): section is Element => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="h-px origin-left bg-gradient-to-r from-neon via-plasma to-mint"
      />

      <div
        className={cn(
          "transition-all duration-500",
          scrolled
            ? "border-b border-white/[0.07] bg-void/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-[86rem] items-center justify-between gap-4 px-5 sm:px-8"
        >
          <Link href="/" className="group flex items-center gap-3" aria-label={`${site.name} — home`}>
            <span className="text-neon transition-transform duration-500 group-hover:rotate-45">
              <PhiMark className="h-8 w-8" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
                {site.displayName}
              </span>
              <span className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.2em] text-faint sm:block">
                algorithmic design
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const isActive = active === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors",
                    isActive ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  <span className="mr-1.5 font-mono text-[9px] text-faint/70 group-hover:text-neon">
                    {item.index}
                  </span>
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full border border-neon/20 bg-neon/[0.06]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub profile (opens in a new tab)"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition hover:border-neon/35 hover:text-neon sm:flex"
            >
              <GithubIcon size={15} />
            </a>

            <a
              href="#contact"
              className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-[12px] font-medium text-ink transition hover:border-neon/40 hover:text-neon sm:flex"
            >
              Let&apos;s talk
              <ArrowUpRight size={13} />
            </a>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close navigation" : "Open navigation"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink transition hover:border-neon/35 hover:text-neon lg:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-void/70 backdrop-blur-sm lg:hidden"
              tabIndex={-1}
            />
            <motion.div
              id="mobile-menu"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
              className="absolute inset-x-3 top-[4.35rem] z-50 overflow-hidden rounded-2xl border border-white/10 bg-space/95 p-3 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              <div className="flex flex-col">
                {navigation.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm text-ink transition hover:bg-white/[0.04]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-neon">{item.index}</span>
                      {item.label}
                    </span>
                    <ArrowUpRight size={14} className="text-faint" />
                  </a>
                ))}
              </div>

              <div className="mt-2 border-t border-white/[0.07] pt-3">
                <a
                  href={`mailto:${site.email}`}
                  className="block rounded-xl px-3 py-2 font-mono text-[11px] text-neon"
                >
                  {site.email}
                </a>
                <div className="mt-2 flex flex-wrap gap-2 px-1">
                  {socials.slice(0, 3).map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] text-muted"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
