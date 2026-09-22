import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HiringProcess } from "@/components/HiringProcess";
import { HiringSimplified } from "@/components/HiringSimplified";
import { Navbar } from "@/components/Navbar";
import { TalentShowcase } from "@/components/TalentShowcase";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Navbar compact />
      <HiringSimplified />
      <HiringProcess />
      <TalentShowcase />
      <FinalCta />
      <Footer />
      <div className="artboard-tail" aria-hidden="true" />
    </main>
  );
}
