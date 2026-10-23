export type ProjectVisual = "pipeline" | "topology" | "weights" | "offline" | "campus";

export interface ProjectLink {
  label: string;
  href?: string;
  note?: string;
}

export interface CaseStudy {
  problem: string;
  approach: string;
  decisions: string[];
  constraints: string[];
  architecture: { layer: string; detail: string }[];
}

export interface Project {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  award?: string;
  stack: string[];
  highlights: string[];
  metrics: { value: string; label: string }[];
  links: ProjectLink[];
  accent: "neon" | "mint" | "plasma";
  visual: ProjectVisual;
  caseStudy: CaseStudy;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: "pseudopy",
    index: "01",
    title: "PseudoPy",
    subtitle: "Pseudocode → Python translation engine & offline-first PWA",
    description:
      "A rule-based translation pipeline that turns pseudocode into executable Python, runs it in the browser through Skulpt, and returns structural feedback — installable and functional without a connection.",
    stack: ["Vanilla JS", "Skulpt", "Service Worker", "IndexedDB", "PWA"],
    highlights: [
      "Rule-based converter for IF/ELSE, FOR, WHILE, FUNCTION, SET and DISPLAY",
      "In-browser Python execution via Skulpt — no server round-trip",
      "Structure, syntax-balance and quality feedback for learners",
      "Student, instructor and admin dashboards with exercise management",
      "Installable on Android and iOS with offline caching",
    ],
    metrics: [
      { value: "7+", label: "supported constructs" },
      { value: "0", label: "server calls to translate" },
      { value: "PWA", label: "offline installable" },
    ],
    links: [
      { label: "Live system", href: "https://www.pseudopy.me/" },
      { label: "Repository", href: "https://github.com/marcreantaso/PseudoPy" },
    ],
    accent: "neon",
    visual: "pipeline",
    featured: true,
    caseStudy: {
      problem:
        "Students learning programming often understand pseudocode but lose the thread when translating it into executable Python. Existing tools usually require a working connection and a server runtime.",
      approach:
        "A deterministic translation layer normalizes pseudocode constructs, rewrites them into valid Python, and hands the result to Skulpt inside the browser. A separate analysis pass scores structure and syntax balance before execution.",
      decisions: [
        "Kept the translator rule-based and inspectable instead of hiding it behind an LLM",
        "Ran execution client-side to preserve the offline-first contract",
        "Cached the shell and assets with a service worker so lessons survive weak connectivity",
        "Separated the analysis pass from code generation so feedback can fail independently",
      ],
      constraints: [
        "No backend runtime for execution",
        "Mobile installs had to work on Android and iOS",
        "The translator needed to fail with actionable diagnostics, not silent miscompiles",
      ],
      architecture: [
        { layer: "Interface", detail: "Vanilla HTML/CSS/JS, responsive editor and dashboards" },
        { layer: "Translation", detail: "Rule-based pseudocode → Python rewriter" },
        { layer: "Analysis", detail: "Structure and syntax-balance checks" },
        { layer: "Execution", detail: "Skulpt Python runtime in the browser" },
        { layer: "Persistence", detail: "IndexedDB + service worker cache" },
      ],
    },
  },
  {
    id: "agriguard",
    index: "02",
    title: "AgriGuard",
    subtitle: "Precision-agriculture IoT platform · Hackathon champion",
    description:
      "A mobile-first agricultural IoT dashboard covering crop analysis, sensor monitoring, alerts, analytics and field workflows, rebuilt on a single Vercel deployment with authenticated, persistent data.",
    award: "Champion — The Great Flavor Byte: ACCS × Lucky Me Idea Noodling Competition",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Vercel Functions", "Neon Postgres", "Drizzle ORM", "JWT"],
    highlights: [
      "Sensor monitoring, crop analysis and alert workflows in one field dashboard",
      "Neon PostgreSQL persistence with Drizzle migrations and seed data",
      "bcrypt password hashes and HTTP-only JWT session cookies",
      "Single-deployment API using relative /api routes",
      "Installable, mobile-first PWA interface",
    ],
    metrics: [
      { value: "Champion", label: "hackathon placement" },
      { value: "4", label: "relational tables" },
      { value: "1", label: "deployment surface" },
    ],
    links: [
      { label: "Repository", href: "https://github.com/marcreantaso/AgriGuard" },
      { label: "Public demo", note: "currently offline" },
    ],
    accent: "mint",
    visual: "topology",
    featured: true,
    caseStudy: {
      problem:
        "Smallholder workflows rarely live in one place: sensor readings, crop condition, alerts and marketplace actions are usually split across tools that assume reliable connectivity and desktop use.",
      approach:
        "Consolidated the field workflow into a mobile-first dashboard and rebuilt authentication and persistence around a single Vercel deployment. The API is co-located with the frontend and backed by Neon PostgreSQL through Drizzle.",
      decisions: [
        "Kept API calls on relative /api routes so one deployment owns the whole surface",
        "Used HTTP-only JWT cookies instead of storing credentials in the browser",
        "Modeled devices, readings and alerts as separate tables to keep queries explicit",
        "Preserved the existing dashboard UI while replacing the data layer underneath",
      ],
      constraints: [
        "Hackathon timeline with a working demo as the priority",
        "Neon and Vercel free-tier limits shaped the schema and query patterns",
        "No client-visible database credentials or demo passwords",
      ],
      architecture: [
        { layer: "Client", detail: "React + TypeScript + Vite PWA, Tailwind CSS" },
        { layer: "API", detail: "TypeScript serverless functions under /api" },
        { layer: "Auth", detail: "bcrypt hashes, HTTP-only JWT session cookies" },
        { layer: "Data", detail: "Neon PostgreSQL via Drizzle ORM" },
        { layer: "Schema", detail: "users · iot_devices · sensor_readings · alerts" },
      ],
    },
  },
  {
    id: "cadet",
    index: "03",
    title: "CaDeT",
    subtitle: "Career digital twin with an explainable alignment model",
    description:
      "A local-first career development tracker that scores how saved goals, skills, projects and experience align with a target path — with published weights and a what-if simulator that never mutates real records.",
    stack: ["React", "TypeScript", "Vite", "Dexie", "IndexedDB", "Vitest"],
    highlights: [
      "Weighted alignment model: skills 40%, project evidence 25%, experience 15%, ACTOR progress 10%, declared intent 10%",
      "What-if simulator runs on a temporary copy of user data",
      "Converts selected changes into a real 14-day ACTOR experiment",
      "Atomic writes across experiment, evidence tasks, events and stage transitions",
      "Local-first IndexedDB storage with no account required",
    ],
    metrics: [
      { value: "5", label: "weighted signals" },
      { value: "14d", label: "experiment loop" },
      { value: "Local", label: "first data model" },
    ],
    links: [
      { label: "Live system", href: "https://cadetorg.vercel.app/" },
      { label: "Repository", href: "https://github.com/marcreantaso/CaDeT" },
    ],
    accent: "plasma",
    visual: "weights",
    featured: true,
    caseStudy: {
      problem:
        "Career trackers tend to make opaque recommendations. Users cannot see why a path scored well, and simulated changes often contaminate real records.",
      approach:
        "Exposed the scoring model as five explicit weights, rendered the contribution of each signal, and isolated the simulator on a temporary dataset. Accepted simulations can be promoted into a real experiment in one atomic transaction.",
      decisions: [
        "Published the weights in the interface instead of hiding them in a model",
        "Kept simulation state separate from persisted records",
        "Batched experiment creation, tasks, events and stage transitions atomically",
        "Ran entirely on IndexedDB so the tool works without an account",
      ],
      constraints: [
        "The model must not imply a prediction of employment outcomes",
        "Offline-first storage cannot rely on a server transaction",
        "Explainability had to survive the what-if workflow",
      ],
      architecture: [
        { layer: "Interface", detail: "React + TypeScript + Vite" },
        { layer: "Scoring", detail: "Explicit weighted evidence alignment" },
        { layer: "Simulation", detail: "Temporary copy, never persisted until accepted" },
        { layer: "Storage", detail: "Dexie over IndexedDB, local-first" },
        { layer: "Verification", detail: "Vitest unit and workflow tests" },
      ],
    },
  },
  {
    id: "wastelink",
    index: "04",
    title: "WasteLink PH",
    subtitle: "Offline-first PWA for informal waste pickers",
    description:
      "A high-performance, installable PWA built for low-connectivity field work, with IndexedDB persistence, a custom service worker and a thumb-friendly mobile interface.",
    stack: ["React 18", "Vite", "IndexedDB", "Service Worker", "PWA"],
    highlights: [
      "Offline-first operation through a custom service worker",
      "IndexedDB persistence for field records",
      "Installable on Android and iOS with safe-area support",
      "Thumb-friendly navigation designed for one-handed use",
      "Lightweight React + Vite build",
    ],
    metrics: [
      { value: "Offline", label: "first by design" },
      { value: "PWA", label: "installable" },
      { value: "Mobile", label: "first interface" },
    ],
    links: [{ label: "Repository", href: "https://github.com/marcreantaso/WasteLink-PH" }],
    accent: "mint",
    visual: "offline",
    featured: true,
    caseStudy: {
      problem:
        "Field workers often operate with intermittent connectivity. A tool that depends on a live request fails exactly when it is needed.",
      approach:
        "Built the data path around IndexedDB and a custom service worker, then designed the interface for one-handed mobile use with safe-area-aware navigation.",
      decisions: [
        "Cached the app shell so the tool opens without a network",
        "Queued local records in IndexedDB rather than blocking on sync",
        "Avoided heavy UI dependencies to keep the install small",
        "Used pure CSS for the mobile layout",
      ],
      constraints: [
        "Low-end Android devices and unstable connections",
        "iOS install constraints without a native wrapper",
        "No backend guarantee for immediate sync",
      ],
      architecture: [
        { layer: "Client", detail: "React 18 + Vite" },
        { layer: "Offline", detail: "Custom service worker, app-shell cache" },
        { layer: "Persistence", detail: "IndexedDB via a small idb wrapper" },
        { layer: "Layout", detail: "Pure CSS, safe-area aware, thumb-first" },
      ],
    },
  },
];

export const additionalProjects = [
  {
    name: "Scheduler",
    kind: "TypeScript PWA",
    description: "Scheduling engine packaged as an installable progressive web app.",
    href: "https://github.com/marcreantaso/Scheduler",
    meta: "TypeScript · PWA",
  },
  {
    name: "LibrarySystem",
    kind: "Java",
    description: "Object-oriented library management system built on core Java.",
    href: "https://github.com/marcreantaso/LibrarySystem",
    meta: "Java · OOP",
  },
];
