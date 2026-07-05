import { FiStar } from 'react-icons/fi';

export default function Stars({ n = 5, className = '' }) {
  return (
    <div
      className={`flex items-center gap-0.5 text-amber-400 ${className}`}
      aria-label={`${n} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={`h-4 w-4 ${i < n ? 'fill-amber-400' : 'opacity-30'}`}
        />
      ))}
    </div>
  );
}
