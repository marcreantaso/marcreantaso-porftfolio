"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Mail,
  Send,
  ShieldCheck,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import { site, socials } from "@/lib/data/site";
import { FacebookIcon, GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { cn, withBasePath } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";

type Status = "idle" | "sending" | "success" | "mailto" | "error";

interface Values {
  name: string;
  email: string;
  message: string;
}

const EMPTY: Values = { name: "", email: "", message: "" };

const SOCIAL_ICONS = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Facebook: FacebookIcon,
  Email: Mail,
} as const;

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};

  if (values.name.trim().length < 2) {
    errors.name = "A name with at least 2 characters, please.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "That address does not parse. Check the domain.";
  }

  if (values.message.trim().length < 12) {
    errors.message = "Give the message at least 12 characters of signal.";
  }

  return errors;
}

export function ContactSection() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [copied, setCopied] = useState(false);
  const [localTime, setLocalTime] = useState("");

  const formspreeEndpoint = useMemo(
    () => (site.formspreeId ? `https://formspree.io/f/${site.formspreeId}` : null),
    [],
  );

  useEffect(() => {
    const update = () => {
      setLocalTime(
        new Intl.DateTimeFormat("en-PH", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };

    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const update = (field: keyof Values) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (errors[field]) setErrors(validate(next));
    if (status !== "idle" && status !== "sending") {
      setStatus("idle");
      setFeedback("");
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setFeedback("Email address copied to clipboard.");
      setStatus("idle");
    } catch {
      setFeedback(`Clipboard blocked. The address is ${site.email}.`);
    }
  };

  const openMailto = (payload: Values) => {
    const subject = `Portfolio contact — ${payload.name.trim()}`;
    const body = [
      `Name: ${payload.name.trim()}`,
      `Email: ${payload.email.trim()}`,
      "",
      payload.message.trim(),
    ].join("\n");

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (honeypot) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setFeedback("The form has unresolved diagnostics. Fix the fields above.");
      return;
    }

    if (!formspreeEndpoint) {
      openMailto(values);
      setStatus("mailto");
      setFeedback(
        `No relay configured, so your mail client should open with the message prefilled. If it does not, email ${site.email} directly.`,
      );
      return;
    }

    setStatus("sending");
    setFeedback("Transmitting over the relay…");

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          _subject: `Portfolio contact — ${values.name.trim()}`,
        }),
      });

      if (!response.ok) throw new Error(`Relay responded with ${response.status}`);

      setStatus("success");
      setFeedback("Transmission received. Expect a reply by email.");
      setValues(EMPTY);
    } catch {
      setStatus("error");
      setFeedback(
        `The relay did not accept the message. Email ${site.email} directly and it will still arrive.`,
      );
    }
  };

  const fieldClass = (field: keyof Values) =>
    cn(
      "w-full rounded-lg border bg-void/60 px-3 py-2.5 font-mono text-[12px] text-ink outline-none transition placeholder:text-faint/60",
      errors[field]
        ? "border-red-500/40 focus:border-red-400"
        : "border-white/[0.09] focus:border-neon/45 focus:bg-void/80",
    );

  return (
    <section id="contact" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="06"
            eyebrow="Contact & availability"
            title={
              <>
                Open a
                <br />
                <span className="text-muted/80">channel.</span>
              </>
            }
            description="Internships, collaborations, or a hard systems problem — send a message through the relay or reach out directly. The form works without a backend by falling back to your mail client."
          />

          <Reveal delay={0.1} className="shrink-0">
            <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-mint">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" aria-hidden="true" />
                accepting conversations
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                <Clock size={11} aria-hidden="true" />
                {localTime ? `${localTime} GMT+8` : "GMT+8"} · Cabuyao, PH
              </span>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.618fr_1fr]">
          <Reveal className="panel overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  new_message.sh
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-[0.14em] text-faint">
                <ShieldCheck size={10} aria-hidden="true" />
                {formspreeEndpoint ? "formspree relay" : "mail client fallback"}
              </span>
            </div>

            <form onSubmit={onSubmit} noValidate className="p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-faint"
                  >
                    <span className="text-neon" aria-hidden="true">
                      &gt;
                    </span>
                    name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={update("name")}
                    placeholder="Ada Lovelace"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                    className={fieldClass("name")}
                  />
                  {errors.name ? (
                    <p id="contact-name-error" className="mt-1.5 font-mono text-[9.5px] text-red-300">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-faint"
                  >
                    <span className="text-neon" aria-hidden="true">
                      &gt;
                    </span>
                    email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={values.email}
                    onChange={update("email")}
                    placeholder="you@domain.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={fieldClass("email")}
                  />
                  {errors.email ? (
                    <p id="contact-email-error" className="mt-1.5 font-mono text-[9.5px] text-red-300">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="contact-message"
                  className="mb-2 flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-faint"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-neon" aria-hidden="true">
                      &gt;
                    </span>
                    message
                  </span>
                  <span className={cn(values.message.length > 1200 ? "text-red-300" : "text-faint/60")}>
                    {values.message.length}/1200
                  </span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  maxLength={1200}
                  value={values.message}
                  onChange={update("message")}
                  placeholder="What are we building, and what makes it hard?"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={cn(fieldClass("message"), "resize-y")}
                />
                {errors.message ? (
                  <p id="contact-message-error" className="mt-1.5 font-mono text-[9.5px] text-red-300">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  name="_gotcha"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-neon px-5 py-2.5 text-[12.5px] font-semibold text-[#041014] shadow-[0_0_0_1px_rgba(0,240,255,0.4),0_10px_30px_-12px_rgba(0,240,255,0.6)] transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
                  >
                    {status === "sending" ? "Transmitting…" : "Send message"}
                    <Send
                      size={13}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={copyEmail}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-faint transition hover:border-neon/30 hover:text-neon"
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? "copied" : "copy email"}
                  </button>
                </div>

                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted transition hover:text-neon"
                >
                  {site.email}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </div>

              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 font-mono text-[10px] leading-relaxed",
                  status === "success" && "border-mint/25 bg-mint/[0.05] text-mint",
                  status === "error" && "border-red-500/25 bg-red-500/[0.05] text-red-200",
                  status === "mailto" && "border-neon/25 bg-neon/[0.04] text-neon/90",
                  (status === "idle" || status === "sending") && "border-white/[0.06] bg-white/[0.02] text-faint",
                )}
              >
                {status === "error" ? (
                  <TriangleAlert size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                ) : status === "success" ? (
                  <Check size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Terminal size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {feedback ||
                    "No tracking, no newsletter. The message goes to Marc and nowhere else."}
                </span>
              </div>
            </form>
          </Reveal>

          <div className="flex flex-col gap-4">
            <Reveal delay={0.06} className="panel overflow-hidden rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <img
                  src={withBasePath("/images/portrait.jpg")}
                  alt={`Portrait of ${site.name}`}
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                  className="h-[72px] w-[72px] shrink-0 rounded-2xl border border-white/10 object-cover object-top"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-ink">{site.name}</p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-faint">
                    {site.role}
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-2.5 border-t border-white/[0.06] pt-4 font-mono text-[10px]">
                <div className="flex items-start justify-between gap-3">
                  <dt className="uppercase tracking-[0.14em] text-faint">based in</dt>
                  <dd className="text-right text-ink/85">{site.location}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="uppercase tracking-[0.14em] text-faint">studying</dt>
                  <dd className="text-right text-ink/85">
                    {site.degree}
                    <br />
                    <span className="text-muted">{site.school}</span>
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="uppercase tracking-[0.14em] text-faint">status</dt>
                  <dd className="text-right text-mint">open to internships</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-1.5">
                <Tag tone="mint">full-stack</Tag>
                <Tag tone="neon">compilers</Tag>
                <Tag tone="plasma">offline-first</Tag>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="panel flex-1 rounded-2xl p-5 sm:p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">direct channels</p>
              <ul className="mt-4 space-y-1">
                {socials.map((social) => {
                  const Icon = SOCIAL_ICONS[social.label as keyof typeof SOCIAL_ICONS];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={social.href.startsWith("mailto:") ? undefined : "noreferrer noopener"}
                        className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition hover:bg-white/[0.03]"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon size={14} className="shrink-0 text-faint transition group-hover:text-neon" />
                          <span className="text-[12px] text-ink/85 transition group-hover:text-ink">
                            {social.label}
                          </span>
                        </span>
                        <span className="truncate font-mono text-[9px] text-faint">{social.handle}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-4 border-t border-white/[0.06] pt-4 font-mono text-[9px] leading-relaxed text-faint/80">
                Prefer plain text? Email is the highest-signal channel. Include the problem, the
                constraints, and the timeline.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
