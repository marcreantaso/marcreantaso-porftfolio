import { BentoGrid } from "@/components/metrics/BentoGrid";
import { Certifications } from "@/components/certifications/Certifications";
import { ContactSection } from "@/components/contact/ContactSection";
import { Hero } from "@/components/hero/Hero";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Sandbox } from "@/components/sandbox/Sandbox";
import { Timeline } from "@/components/timeline/Timeline";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProjectGrid />
      <BentoGrid />
      <Sandbox />
      <Timeline />
      <Certifications />
      <ContactSection />
    </>
  );
}
