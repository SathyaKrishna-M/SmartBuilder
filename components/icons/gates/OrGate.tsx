export default function OrGate({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className="gate-icon">
      {/* OR gate: curved left side, straight right side with point */}
      <path
        d="M10 10 Q25 10, 35 15 Q45 20, 50 30 Q45 40, 35 45 Q25 50, 10 50 Z"
        fill="#1f2937"
        stroke="#f59e0b"
        strokeWidth="3"
      />
      {/* Output line */}
      <line x1="50" y1="30" x2="70" y2="30" stroke="#f59e0b" strokeWidth="3" />
      <text
        x="30"
        y="35"
        fill="#f59e0b"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        OR
      </text>
    </svg>
  );
}

