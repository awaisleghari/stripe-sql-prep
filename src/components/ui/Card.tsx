import { Paper } from '@mantine/core';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Paper withBorder radius="lg" p="lg" className={className ? `app-card ${className}` : 'app-card'}>
      {children}
    </Paper>
  );
}
