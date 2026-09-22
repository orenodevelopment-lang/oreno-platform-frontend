import Image from "next/image";

export function HiringSimplified() {
  return (
    <section id="hiring-simplified" className="hiring-simplified" aria-labelledby="hiring-simplified-title">
      <div className="hiring-simplified__inner">
        <div className="hiring-simplified__copy">
          <h2 id="hiring-simplified-title">Hiring<br />Simplified</h2>
          <p>
            An average of at least 1000 job applicants interacts with a job adverts. We take away the hassle of sieving through numerous candidates for the best one.
          </p>
        </div>
        <div className="hiring-simplified__image">
          <Image
            src="/assets/figma/hiring-simplified-crowd.jpg"
            alt="A teal-hatted candidate standing out in a crowd"
            width={950}
            height={634}
            sizes="(max-width: 768px) 100vw, 479px"
          />
        </div>
      </div>
    </section>
  );
}
