export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`}>
      <div className="card-body">{children}</div>
    </div>
  );
}
