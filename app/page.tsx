import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HiringSimplified } from "@/components/HiringSimplified";
import { TalentShowcase } from "@/components/TalentShowcase";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HiringSimplified />
      <TalentShowcase />
      <FinalCta />
      <Footer />
    </main>
  );
}
