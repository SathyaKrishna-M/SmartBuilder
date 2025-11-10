"use client";

import { Handle, Position, NodeProps } from "reactflow";
import AndGate from "../icons/gates/AndGate";
import OrGate from "../icons/gates/OrGate";
import XorGate from "../icons/gates/XorGate";
import NotGate from "../icons/gates/NotGate";
import InputNode from "../icons/gates/InputNode";
import OutputNode from "../icons/gates/OutputNode";

export default function LogicGateNode({ data, id }: NodeProps) {
  const label = data?.label || "";
  const gateType = label.toUpperCase();
  
  // Determine if this is an input, output, or gate
  // Input: label is "INPUT" or single uppercase letter (A-Z)
  const isInput = gateType === "INPUT" || (label.length === 1 && /^[A-Z]$/.test(label));
  // Output: label is "OUTPUT" or common output names
  const isOutput = gateType === "OUTPUT" || gateType === "F" || gateType.includes("OUT") || 
                   ["D", "BORROW", "DIFFERENCE", "SUM", "CARRY"].includes(gateType);
  
  // Get the appropriate icon component
  let Icon: React.ComponentType<{ size?: number; label?: string }>;
  let nodeColor: string;
  
  if (isInput) {
    Icon = InputNode;
    nodeColor = "#60A5FA"; // Bright blue
  } else if (isOutput) {
    Icon = OutputNode;
    nodeColor = "#34D399"; // Bright green
  } else {
    // Gate type
    switch (gateType) {
      case "AND":
        Icon = AndGate;
        nodeColor = "#3b82f6";
        break;
      case "OR":
        Icon = OrGate;
        nodeColor = "#f59e0b";
        break;
      case "XOR":
        Icon = XorGate;
        nodeColor = "#a855f7";
        break;
      case "NOT":
        Icon = NotGate;
        nodeColor = "#10b981";
        break;
      case "NAND":
        Icon = AndGate;
        nodeColor = "#ef4444";
        break;
      case "NOR":
        Icon = OrGate;
        nodeColor = "#f97316";
        break;
      default:
        Icon = AndGate;
        nodeColor = "#6b7280";
    }
  }

  // Input nodes only have output handles
  // Output nodes only have input handles
  // Gates have both input and output handles
  const showInputHandle = !isInput;
  const showOutputHandle = !isOutput;

  // For input/output nodes, extract the actual label
  // If label is "INPUT" or "OUTPUT", use the node ID (A, B, F, etc.)
  // Otherwise, use the label as-is
  const displayLabel = isInput 
    ? (gateType === "INPUT" ? (id || "") : label)
    : isOutput 
    ? (gateType === "OUTPUT" ? (id || "") : label)
    : "";

  return (
    <div className="flex flex-col items-center justify-center relative bg-transparent">
      {showInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: nodeColor,
            width: "12px",
            height: "12px",
            border: `2px solid ${nodeColor}`,
            borderRadius: "50%",
          }}
        />
      )}
      
      <div className="flex flex-col items-center">
        <div 
          className="bg-gray-900 p-2 rounded-lg shadow-lg border-2 flex items-center justify-center" 
          style={{ borderColor: nodeColor, minWidth: isInput || isOutput ? "60px" : "80px", minHeight: isInput || isOutput ? "60px" : "50px" }}
        >
          <Icon size={isInput || isOutput ? 50 : 60} label={displayLabel} />
        </div>
        {!(isInput || isOutput) && (
          <div className="text-xs text-gray-300 mt-1 font-semibold" style={{ color: nodeColor }}>
            {label}
          </div>
        )}
      </div>

      {showOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: nodeColor,
            width: "12px",
            height: "12px",
            border: `2px solid ${nodeColor}`,
            borderRadius: "50%",
          }}
        />
      )}
    </div>
  );
}

