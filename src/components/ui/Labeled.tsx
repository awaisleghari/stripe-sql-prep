export function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="lblk">
      <div className="lbl">{label}</div>
      <div className="prose">{children}</div>
    </div>
  );
}
