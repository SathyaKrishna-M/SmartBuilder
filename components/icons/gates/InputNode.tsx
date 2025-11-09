export default function InputNode({ size = 50, label = "" }: { size?: number; label?: string }) {
  // Extract the actual input label (A, B, C, etc.) from the data
  const displayLabel = label === "INPUT" ? "" : label;
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="input-node">
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="#1e3a8a"
        stroke="#60a5fa"
        strokeWidth="4"
      />
      {displayLabel && (
        <text
          x="50"
          y="58"
          fill="#60a5fa"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {displayLabel}
        </text>
      )}
    </svg>
  );
}

