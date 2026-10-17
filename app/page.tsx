import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HiringSimplified } from "@/components/HiringSimplified";
import { Navbar } from "@/components/Navbar";
import { TalentShowcase } from "@/components/TalentShowcase";
import { HomepageScrollProgress } from "@/components/motion/HomepageScrollProgress";
import { PointerFollower } from "@/components/motion/PointerFollower";

export default function HomePage() {
  return (
    <main>
      <HomepageScrollProgress />
      <PointerFollower />
      <Hero />
      <Navbar compact />
      <HiringSimplified />
      <TalentShowcase />
      <FinalCta />
      <Footer />
    </main>
  );
}
