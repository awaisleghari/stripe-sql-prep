/** Bespoke progress ring: gradient stroke + soft glow + animated fill. */
export function GradientRing({ value, size = 138, thickness = 12 }: { value: number; size?: number; thickness?: number }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - v / 100);
  const mid = size / 2;
  return (
    <div className="grad-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gr-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6e8efb" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#46c98b" />
          </linearGradient>
        </defs>
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
        <circle
          cx={mid}
          cy={mid}
          r={r}
          fill="none"
          stroke="url(#gr-stroke)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${mid} ${mid})`}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="grad-ring-label">
        <span className="grad-ring-pct">{v}%</span>
        <span className="grad-ring-sub">ready</span>
      </div>
    </div>
  );
}
