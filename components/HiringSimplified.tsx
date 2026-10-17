import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

export function HiringSimplified() {
  return (
    <section id="hiring-simplified" className="hiring-simplified" aria-labelledby="hiring-simplified-title">
      <div className="hiring-simplified__inner">
        <Reveal className="hiring-simplified__copy" direction="left">
          <h2 id="hiring-simplified-title"><span>Hiring</span><span>Simplified</span></h2>
          <p>
            A single job advert can attract over 1,000 applicants. We take away the hassle of sorting through every candidate to find the best one.
          </p>
        </Reveal>
        <Reveal className="hiring-simplified__image" direction="right" delay={0.12}>
          <Image
            src="/assets/figma/hiring-simplified-crowd.jpg"
            alt="A teal-hatted candidate standing out in a crowd"
            width={950}
            height={634}
            sizes="(max-width: 768px) 100vw, 479px"
          />
          <span className="hiring-simplified__focus" aria-hidden="true"><i />Top match</span>
        </Reveal>
      </div>
    </section>
  );
}
