import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HiringProcess } from "@/components/HiringProcess";
import { HiringSimplified } from "@/components/HiringSimplified";
import { Navbar } from "@/components/Navbar";
import { TalentShowcase } from "@/components/TalentShowcase";
import { HomepageScrollProgress } from "@/components/motion/HomepageScrollProgress";

export default function HomePage() {
  return (
    <main>
      <HomepageScrollProgress />
      <Hero />
      <Navbar compact />
      <HiringSimplified />
      <HiringProcess />
      <TalentShowcase />
      <FinalCta />
      <Footer />
    </main>
  );
}
