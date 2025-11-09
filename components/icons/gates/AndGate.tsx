export default function AndGate({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className="gate-icon">
      {/* AND gate shape: rectangle with curved right edge */}
      <path
        d="M10 10 L50 10 A20 20 0 0 1 50 50 L10 50 Z"
        fill="#1f2937"
        stroke="#3b82f6"
        strokeWidth="3"
      />
      {/* Output line */}
      <line x1="50" y1="30" x2="70" y2="30" stroke="#3b82f6" strokeWidth="3" />
      <text
        x="30"
        y="35"
        fill="#3b82f6"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        AND
      </text>
    </svg>
  );
}

