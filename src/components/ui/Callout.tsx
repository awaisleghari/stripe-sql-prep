export function Callout({
  variant = 'tip',
  title,
  children,
}: {
  variant?: 'tip' | 'warn' | 'confusion' | 'interview';
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`callout ${variant}`}>
      <span className="t">{title}</span>
      {children}
    </div>
  );
}
