interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default';
  small?: boolean;
}
export function Button({ variant = 'default', small, className = '', children, ...rest }: Props) {
  const cls = ['btn', variant === 'primary' ? 'primary' : '', small ? 'sm' : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
