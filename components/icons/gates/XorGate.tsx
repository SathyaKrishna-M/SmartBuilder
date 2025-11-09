export default function XorGate({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className="gate-icon">
      {/* XOR gate: double curved line on left (showing the extra curve), point on right */}
      {/* Back curve (lighter, shows the double curve effect) */}
      <path
        d="M15 10 Q25 10, 35 15 Q45 20, 50 30 Q45 40, 35 45 Q25 50, 15 50"
        fill="none"
        stroke="#a855f7"
        strokeWidth="2.5"
        opacity="0.6"
      />
      {/* Front curve (main shape) */}
      <path
        d="M10 10 Q25 10, 35 15 Q45 20, 50 30 Q45 40, 35 45 Q25 50, 10 50 Z"
        fill="#1f2937"
        stroke="#a855f7"
        strokeWidth="3"
      />
      {/* Output line */}
      <line x1="50" y1="30" x2="70" y2="30" stroke="#a855f7" strokeWidth="3" />
      <text
        x="30"
        y="35"
        fill="#a855f7"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        XOR
      </text>
    </svg>
  );
}

