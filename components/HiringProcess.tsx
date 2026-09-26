import { TalentCarousel } from "@/components/TalentCarousel";
import { Reveal } from "@/components/motion/Reveal";

export function HiringProcess() {
  return (
    <section id="hiring-process" className="hiring-process" aria-labelledby="hiring-process-title">
      <Reveal className="hiring-process__heading">
        <h2 id="hiring-process-title">
          Hire the best talents from Africa;<br />Save time &amp; resources
        </h2>
        <p>It’s as easy as browsing an e-commerce store</p>
      </Reveal>
      <TalentCarousel />
    </section>
  );
}
