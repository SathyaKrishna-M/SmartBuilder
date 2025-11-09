export default function NotGate({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className="gate-icon">
      {/* NOT gate: triangle pointing right */}
      <polygon
        points="10,10 10,50 55,30"
        fill="#1f2937"
        stroke="#10b981"
        strokeWidth="3"
      />
      {/* Inversion circle */}
      <circle cx="62" cy="30" r="5" fill="#10b981" stroke="#10b981" strokeWidth="2" />
      <text
        x="32"
        y="35"
        fill="#10b981"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        NOT
      </text>
    </svg>
  );
}

