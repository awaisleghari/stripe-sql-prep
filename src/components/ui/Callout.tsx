import { Alert } from '@mantine/core';

const COLOR = {
  tip: 'teal',
  warn: 'yellow',
  confusion: 'orange',
  interview: 'cyan',
} as const;

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
    <Alert variant="light" color={COLOR[variant]} title={title} radius="md" my="sm">
      {children}
    </Alert>
  );
}
