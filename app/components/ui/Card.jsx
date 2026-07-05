export default function Card({
  as: Tag = 'div',
  elevated = false,
  padded = true,
  interactive = false,
  className = '',
  children,
  ...rest
}) {
  const base = 'rounded-2xl border border-border';
  const surface = elevated ? 'bg-surface-elevated' : 'bg-surface';
  const shadow = elevated ? 'shadow-elevated' : 'shadow-card';
  const pad = padded ? 'p-6 sm:p-8' : '';
  const inter = interactive
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-elevated'
    : '';

  return (
    <Tag
      className={`${base} ${surface} ${shadow} ${pad} ${inter} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
