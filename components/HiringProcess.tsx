import { TalentCarousel } from "@/components/TalentCarousel";

export function HiringProcess() {
  return (
    <section id="hiring-process" className="hiring-process" aria-labelledby="hiring-process-title">
      <div className="hiring-process__heading">
        <h2 id="hiring-process-title">
          Hire the best talents from Africa;<br />Save time &amp; resources
        </h2>
        <p>It’s as easy as browsing an e-commerce store</p>
      </div>
      <TalentCarousel />
    </section>
  );
}
