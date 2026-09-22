type HiringStepCardProps = {
  role: string;
  engagement: string;
  level?: string;
  rate: string;
  location: string;
  partial?: boolean;
};

export function HiringStepCard({
  role,
  engagement,
  level,
  rate,
  location,
  partial = false,
}: HiringStepCardProps) {
  return (
    <article className="talent-card">
      <div className="talent-card__avatar" aria-hidden="true" />
      <div className="talent-card__main">
        <h3>{role}</h3>
        <div className="talent-card__tags">
          <span>{engagement}</span>
          {level ? <span>{level}</span> : null}
        </div>
      </div>
      <div className="talent-card__divider" />
      <div className="talent-card__footer">
        <div>
          <strong>{rate}</strong>
          <small>{location}</small>
        </div>
        {!partial ? (
          <a href="#newsletter" className="talent-card__button">Hire talent</a>
        ) : null}
      </div>
    </article>
  );
}
