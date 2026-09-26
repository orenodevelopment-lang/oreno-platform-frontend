type WorkspaceAmbientProps = {
  tone?: "company" | "talent" | "public";
};

export function WorkspaceAmbient({ tone = "company" }: WorkspaceAmbientProps) {
  return (
    <div className={`workspace-ambient workspace-ambient--${tone}`} aria-hidden="true">
      <span className="workspace-ambient__orb workspace-ambient__orb--one" />
      <span className="workspace-ambient__orb workspace-ambient__orb--two" />
      <span className="workspace-ambient__ring" />
    </div>
  );
}
