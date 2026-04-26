export default function PinkyMark({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* left pinky: comes from left edge, hooks down and right, ends inside the right hook */}
      <path d="M 6 18 L 38 18 Q 50 18 50 30 Q 50 42 38 42 L 30 42" />
      {/* right pinky: comes from right edge, hooks up and left, threads through */}
      <path d="M 94 42 L 62 42 Q 50 42 50 30 Q 50 18 62 18 L 70 18" />
      {/* tiny knuckle dots */}
      <circle cx="14" cy="18" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="86" cy="42" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
