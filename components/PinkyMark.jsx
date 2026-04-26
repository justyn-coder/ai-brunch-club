export default function PinkyMark({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M 6 18.4 L 38 18 Q 50 18 50 30 Q 50 42 38 42 L 30 42" />
      <path d="M 94 41.6 L 62 42 Q 50 42 50 30 Q 50 18 62 18 L 70 18" />
      <circle cx="14" cy="18" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="86" cy="42" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
