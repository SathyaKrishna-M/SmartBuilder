export default function InputNode({ size = 50, label = "" }: { size?: number; label?: string }) {
  // Extract the actual input label (A, B, C, etc.) from the data
  const displayLabel = label === "INPUT" ? "" : label;
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="input-node">
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="#3B82F6"
        stroke="#60A5FA"
        strokeWidth="4"
      />
      {displayLabel && (
        <text
          x="50"
          y="58"
          fill="#FFFFFF"
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

