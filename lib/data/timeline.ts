export type TimelineTrack = "academic" | "esports";

export interface TimelineEntry {
  id: string;
  track: TimelineTrack;
  title: string;
  org: string;
  team?: string;
  event?: string;
  result?: string;
  status?: "present";
  body: string;
  tags: string[];
}

export const timeline: TimelineEntry[] = [
  {
    id: "bs-cs",
    track: "academic",
    title: "BS Computer Science",
    org: "Pamantasan ng Cabuyao",
    event: "College of Computing Studies",
    status: "present",
    body:
      "Studying algorithms, data structures, compiler design and software engineering while shipping production web systems alongside coursework.",
    tags: ["Algorithms", "Compiler design", "Software engineering"],
  },
  {
    id: "flavor-byte",
    track: "academic",
    title: "Champion, The Great Flavor Byte",
    org: "ACCS × Lucky Me Idea Noodling Competition",
    result: "Champion",
    body:
      "Won the championship with AgriGuard, a precision-agriculture IoT platform covering sensor monitoring, crop analysis and field alerts.",
    tags: ["AgriGuard", "Hackathon", "Champion"],
  },
  {
    id: "tech-showcase",
    track: "academic",
    title: "Regional Tech Showcases",
    org: "Student project exhibitions",
    event: "Regional academic and industry audiences",
    body:
      "Presented student-built systems, including PseudoPy and AgriGuard, to regional academic and industry audiences.",
    tags: ["Presentation", "Systems", "Research"],
  },
  {
    id: "bear-esports",
    track: "esports",
    title: "Roamer, BEAR ESPORTS MAIN",
    org: "Player",
    team: "BEAR ESPORTS MAIN",
    event: "Tambay League",
    body:
      "Competitive MLBB roamer in the Tambay League. Reads map state, sets up engagements and coordinates macro decisions under time pressure.",
    tags: ["Tambay League", "Roamer", "MLBB"],
  },
  {
    id: "tsp-falcons",
    track: "esports",
    title: "Roamer, TSP FALCONS",
    org: "Player",
    team: "TSP FALCONS",
    event: "SM Cyber League",
    result: "3rd Place",
    body:
      "Placed 3rd in the SM Cyber League with TSP FALCONS, controlling vision, initiating engages and converting map pressure into objective control.",
    tags: ["3rd Place", "SM Cyber League", "Roamer"],
  },
  {
    id: "no-doubt-epro",
    track: "esports",
    title: "Roamer, NO DOUBT EPRO",
    org: "Player",
    team: "NO DOUBT EPRO",
    event: "Smart Play NCE Regionals",
    body:
      "Represented NO DOUBT EPRO at the Smart Play NCE Regionals, coordinating rotations and peel for the team's carry threats.",
    tags: ["Smart Play", "NCE Regionals", "Roamer"],
  },
  {
    id: "tsp-falcons-laguna",
    track: "esports",
    title: "Roamer, TSP FALCONS LAGUNA",
    org: "Player",
    team: "TSP FALCONS LAGUNA",
    event: "Smart Play × ACCS · School Edition",
    body:
      "Played roamer for TSP FALCONS LAGUNA in the Smart Play × ACCS school edition, balancing lane pressure with setup for team fights.",
    tags: ["School Edition", "Smart Play × ACCS", "Roamer"],
  },
  {
    id: "pnc-esports",
    track: "esports",
    title: "Roamer, PnC Esports",
    org: "Pamantasan ng Cabuyao",
    status: "present",
    body:
      "Representing the university in MLBB competition, translating scrim feedback into repeatable draft and rotation patterns.",
    tags: ["MLBB", "Campus esports", "Drafting"],
  },
  {
    id: "campus-clash",
    track: "esports",
    title: "MLBB Campus Clash Champion",
    org: "Inter-campus tournament",
    result: "Champion",
    body:
      "Won the campus-level MLBB tournament as a roamer, focused on objective timing and cross-lane coordination.",
    tags: ["Champion", "MLBB", "Team play"],
  },
];
