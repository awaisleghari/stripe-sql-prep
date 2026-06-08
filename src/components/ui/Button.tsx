import { Button as MButton } from '@mantine/core';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default';
  small?: boolean;
  leftSection?: React.ReactNode;
}

/** App button. `primary` renders a gradient CTA; `default` is a bordered button. */
export function Button({ variant = 'default', small, leftSection, className, children, ...rest }: Props) {
  const common = { size: small ? 'xs' : 'sm', radius: 'md' as const, leftSection, className, ...rest };
  if (variant === 'primary') {
    return (
      <MButton variant="gradient" gradient={{ from: 'brand', to: 'grape', deg: 135 }} {...common}>
        {children}
      </MButton>
    );
  }
  return (
    <MButton variant="default" {...common}>
      {children}
    </MButton>
  );
}
