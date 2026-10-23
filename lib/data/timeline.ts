export type TimelineCategory = "academic" | "esports" | "competition";

export interface TimelineEntry {
  id: string;
  period: string;
  title: string;
  organization: string;
  description: string;
  category: TimelineCategory;
  tags: string[];
}

export const timeline: TimelineEntry[] = [
  {
    id: "bs-cs",
    period: "Present",
    title: "BS Computer Science",
    organization: "Pamantasan ng Cabuyao · College of Computing Studies",
    description:
      "Studying algorithms, data structures, compiler design and software engineering while shipping production web systems alongside coursework.",
    category: "academic",
    tags: ["Algorithms", "Compiler design", "Software engineering"],
  },
  {
    id: "bear-esports",
    period: "Tambay League",
    title: "Roamer — BEAR ESPORTS MAIN",
    organization: "Team Falcons Academy",
    description:
      "Competitive MLBB roamer in the Tambay League. Reads map state, sets up engagements and coordinates macro decisions under time pressure.",
    category: "esports",
    tags: ["Tambay League", "Roamer", "MLBB"],
  },
  {
    id: "tsp-falcons",
    period: "SM Cyber League · 3rd Place",
    title: "Roamer — TSP FALCONS",
    organization: "Team Falcons Academy",
    description:
      "Placed 3rd in the SM Cyber League with TSP FALCONS, controlling vision, initiating engages and converting map pressure into objective control.",
    category: "esports",
    tags: ["3rd Place", "SM Cyber League", "Roamer"],
  },
  {
    id: "no-doubt-epro",
    period: "Smart Play NCE Regionals",
    title: "Roamer — NO DOUBT EPRO",
    organization: "Team Falcons Academy",
    description:
      "Represented NO DOUBT EPRO at the Smart Play NCE Regionals, coordinating rotations and peel for the team's carry threats.",
    category: "esports",
    tags: ["Smart Play", "NCE Regionals", "Roamer"],
  },
  {
    id: "tsp-falcons-laguna",
    period: "Smart Play × ACCS · School Edition",
    title: "Roamer — TSP FALCONS LAGUNA",
    organization: "Team Falcons Academy",
    description:
      "Played roamer for TSP FALCONS LAGUNA in the Smart Play × ACCS school edition, balancing lane pressure with setup for team fights.",
    category: "esports",
    tags: ["School Edition", "Smart Play × ACCS", "Roamer"],
  },
  {
    id: "pnc-esports",
    period: "Present",
    title: "Roamer — PnC Esports",
    organization: "Pamantasan ng Cabuyao",
    description:
      "Representing the university in MLBB competition, translating scrim feedback into repeatable draft and rotation patterns.",
    category: "esports",
    tags: ["MLBB", "Campus esports", "Drafting"],
  },
  {
    id: "flavor-byte",
    period: "Award",
    title: "Champion — The Great Flavor Byte",
    organization: "ACCS × Lucky Me Idea Noodling Competition",
    description:
      "Won the championship with AgriGuard, a precision-agriculture IoT platform covering sensor monitoring, crop analysis and field alerts.",
    category: "competition",
    tags: ["AgriGuard", "Hackathon", "Champion"],
  },
  {
    id: "campus-clash",
    period: "Competition",
    title: "MLBB Campus Clash Champion",
    organization: "Inter-campus tournament",
    description:
      "Competed as a roamer in a campus-level MLBB tournament, focused on objective timing and cross-lane coordination.",
    category: "competition",
    tags: ["Champion", "MLBB", "Team play"],
  },
  {
    id: "tech-showcase",
    period: "Showcase",
    title: "Regional Tech Showcases",
    organization: "Student project exhibitions",
    description:
      "Presented student-built systems — including PseudoPy and AgriGuard — to regional academic and industry audiences.",
    category: "competition",
    tags: ["Presentation", "Systems", "Research"],
  },
];
