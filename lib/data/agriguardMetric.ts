export type AgriGuardNodeId = "iot" | "api" | "db";

export const AGRIGUARD_METRIC_CONFIG = {
  nodes: [
    { id: "iot", title: "IoT Devices", subtitle: "readings", icon: "wifi" },
    { id: "api", title: "Vercel API", subtitle: "/api routes", icon: "cpu" },
    { id: "db", title: "Neon PG", subtitle: "Drizzle", icon: "database" },
  ],
  connections: [
    { from: "iot", to: "api", label: "readings" },
    { from: "api", to: "db", label: "persist" },
  ],
  steps: [
    { label: "Sensor readings", node: "iot" },
    { label: "Crop analysis", node: "api" },
    { label: "Alerts", node: "api" },
    { label: "Field workflows", node: "db" },
  ],
  auth: "JWT session · bcrypt",
  destinations: {
    caseStudy: "#systems",
    timeline: "/?track=academic#timeline",
    repository: "https://github.com/marcreantaso/AgriGuard",
  },
} as const;
