import { Button as MButton } from '@mantine/core';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default';
  small?: boolean;
}

/** App button. `primary` renders a gradient CTA; `default` is a bordered button. */
export function Button({ variant = 'default', small, className, children, ...rest }: Props) {
  const size = small ? 'xs' : 'sm';
  if (variant === 'primary') {
    return (
      <MButton
        variant="gradient"
        gradient={{ from: 'brand', to: 'grape', deg: 135 }}
        size={size}
        radius="md"
        className={className}
        {...rest}
      >
        {children}
      </MButton>
    );
  }
  return (
    <MButton variant="default" size={size} radius="md" className={className} {...rest}>
      {children}
    </MButton>
  );
}
