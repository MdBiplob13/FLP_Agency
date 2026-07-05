export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
}) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-2xl ${alignment} ${className}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
