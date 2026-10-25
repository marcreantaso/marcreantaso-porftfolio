export const site = {
  name: "Marc",
  displayName: "Marc Reantaso",
  firstName: "Marc",
  initials: "MR",
  role: "Computer Science Student",
  tagline:
    "I like building software that is thoughtful, useful, and easy to understand.",
  description:
    "I am a BS Computer Science student at Pamantasan ng Cabuyao. I build compiler tools, offline-first PWAs, precision AgTech platforms, and interfaces with a strong focus on detail.",
  email: "reantasomarcgian@gmail.com",
  location: "Cabuyao, Laguna, Philippines",
  school: "Pamantasan ng Cabuyao",
  college: "College of Computing Studies",
  degree: "BS Computer Science",
  github: "https://github.com/marcreantaso",
  linkedin: "https://www.linkedin.com/in/marc-gian-reantaso-88a3b6381",
  facebook: "https://www.facebook.com/spidermarcz",
  pseudopy: "https://www.pseudopy.me/",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://marcreantaso.github.io",
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID?.trim() || "",
  award: {
    title: "The Great Flavor Byte: ACCS × Lucky Me Idea Noodling Competition",
    placement: "Champion",
    project: "AgriGuard",
  },
  stats: [
    { value: "7", label: "public repositories" },
    { value: "Champion", label: "hackathon placement" },
    { value: "φ", label: "1.618 design ratio" },
  ],
} as const;

export const navigation = [
  { href: "#systems", label: "Systems", index: "01" },
  { href: "#metrics", label: "Metrics", index: "02" },
  { href: "#sandbox", label: "Sandbox", index: "03" },
  { href: "#timeline", label: "Timeline", index: "04" },
  { href: "#credentials", label: "Credentials", index: "05" },
  { href: "#contact", label: "Contact", index: "06" },
] as const;

export const socials = [
  { href: site.github, label: "GitHub", handle: "@marcreantaso" },
  { href: site.linkedin, label: "LinkedIn", handle: "marc-gian-reantaso" },
  { href: site.facebook, label: "Facebook", handle: "spidermarcz" },
  { href: `mailto:${site.email}`, label: "Email", handle: site.email },
] as const;
