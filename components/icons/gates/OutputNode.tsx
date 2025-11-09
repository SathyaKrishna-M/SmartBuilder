export default function OutputNode({ size = 50, label = "" }: { size?: number; label?: string }) {
  // Extract the actual output label (F, D, Borrow, etc.) from the data
  const displayLabel = label === "OUTPUT" ? "" : label;
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="output-node">
      <polygon
        points="20,20 80,50 20,80"
        fill="#166534"
        stroke="#22c55e"
        strokeWidth="4"
      />
      {displayLabel && (
        <text
          x="52"
          y="52"
          fill="#22c55e"
          fontSize="16"
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

