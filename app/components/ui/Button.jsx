import Link from 'next/link';

const variants = {
  primary:
    'bg-linear-to-r from-primary to-accent text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.55)] hover:from-primary-hover hover:to-accent-hover',
  secondary:
    'bg-surface-elevated text-text border border-border-strong hover:bg-surface-muted',
  ghost:
    'bg-transparent text-text-muted hover:text-text hover:bg-surface-muted',
  danger:
    'bg-danger text-white hover:opacity-90',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none';

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  children,
  ...rest
}) {
  const classes = `${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
