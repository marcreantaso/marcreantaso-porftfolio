export type CredentialAccent = "neon" | "mint" | "plasma";

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  category: string;
  date?: string;
  detail?: string;
  href: string;
  accent: CredentialAccent;
}

export const credentialsFolder =
  "https://drive.google.com/drive/folders/1AT3UlRhI-XjQyQSPWYO1AzwpqOTYdCtJ";

export const certifications: Certification[] = [
  {
    id: "aws-ec2",
    title: "Introduction to Amazon EC2",
    issuer: "AWS Training & Certification",
    category: "Cloud",
    date: "Sep 26, 2026",
    href: "https://drive.google.com/file/d/1IU6KMOVbwty9LLeqQbZse0Cic_c8AwPZ/view",
    accent: "mint",
  },
  {
    id: "ignite-philippines",
    title: "Ignite Philippines",
    issuer: "Wadhwani Foundation",
    category: "Entrepreneurship",
    date: "Mar 1, 2026",
    detail: "Certificate of Content Completion · 42 hours",
    href: "https://drive.google.com/file/d/1cUqGv2SDvfitlXItD3RXhoINWZfgfSwg/view",
    accent: "plasma",
  },
  {
    id: "cisco-hardware",
    title: "Computer Hardware Basics",
    issuer: "Cisco Networking Academy",
    category: "Hardware",
    date: "Feb 16, 2026",
    detail: "DICT-ITU DTC Initiative",
    href: "https://drive.google.com/file/d/1ojO80BWshzSxMB4z299FAkANPNhOPvVy/view",
    accent: "neon",
  },
  {
    id: "cisco-data-analytics",
    title: "Data Analytics Essentials",
    issuer: "Cisco Networking Academy",
    category: "Data analytics",
    date: "Feb 16, 2026",
    detail: "DICT-ITU DTC Initiative",
    href: "https://drive.google.com/file/d/1u3FOlXHdANqFrtwvjLLE-fiYAxZCWX7J/view",
    accent: "mint",
  },
  {
    id: "cisco-cybersecurity",
    title: "Introduction to Cybersecurity",
    issuer: "Cisco Networking Academy",
    category: "Cybersecurity",
    date: "Feb 14, 2026",
    href: "https://drive.google.com/file/d/1G7Bd8mLLiS4fdpUlessg0LonRobQhyt-/view",
    accent: "neon",
  },
  {
    id: "cisco-data-science",
    title: "Introduction to Data Science",
    issuer: "Cisco Networking Academy",
    category: "Data science",
    date: "Feb 12, 2026",
    href: "https://drive.google.com/file/d/16yW3u-sxS8UZ1eAl8jNLNCXHG9rA-LQp/view",
    accent: "mint",
  },
  {
    id: "cisco-iot",
    title: "Introduction to IoT and Digital Transformation",
    issuer: "Cisco Networking Academy",
    category: "IoT",
    date: "Feb 12, 2026",
    href: "https://drive.google.com/file/d/1t96RbetuQhtPfZOj0jxxnuPR0FNM3CNf/view",
    accent: "plasma",
  },
  {
    id: "udemy-javascript",
    title: "Build 11 JavaScript Application and Web JavaScript BootCamp",
    issuer: "Udemy · Learnify IT",
    category: "Web development",
    date: "Feb 9, 2026",
    detail: "6 total hours",
    href: "https://drive.google.com/file/d/1HVVzJ_3uJqcBFa0qtFo0V8BQhZeAdllF/view",
    accent: "plasma",
  },
  {
    id: "teded-idea-workshop",
    title: "Idea Workshop",
    issuer: "TED-Ed Educator Talks",
    category: "Education",
    detail: "Certificate of Completion",
    href: "https://drive.google.com/file/d/1b4DGSTRhWARRz6qt0s8UNeoadXcKQ_R0/view",
    accent: "neon",
  },
];
