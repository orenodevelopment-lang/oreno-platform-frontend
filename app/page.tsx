import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HiringSimplified } from "@/components/HiringSimplified";
import { TalentShowcase } from "@/components/TalentShowcase";
import { HomepageScrollProgress } from "@/components/motion/HomepageScrollProgress";

export default function HomePage() {
  return (
    <main>
      <HomepageScrollProgress />
      <Hero />
      <HiringSimplified />
      <TalentShowcase />
      <FinalCta />
      <Footer />
    </main>
  );
}
