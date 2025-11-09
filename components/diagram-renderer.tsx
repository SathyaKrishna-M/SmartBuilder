"use client";

import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import LogicGateNode from "./logic-nodes/LogicGateNode";

const nodeTypes = {
  logicGate: LogicGateNode,
};

interface DiagramRendererProps {
  json: string; // JSON string returned from AI
  className?: string;
}

export default function DiagramRenderer({ json, className = "" }: DiagramRendererProps) {
  const { nodes, edges } = useMemo(() => {
    try {
      const parsed = JSON.parse(json);
      return {
        nodes: (parsed.nodes || []) as Node[],
        edges: (parsed.edges || []) as Edge[],
      };
    } catch (err) {
      console.error("[DiagramRenderer] Invalid diagram JSON:", err);
      console.error("[DiagramRenderer] JSON string:", json);
      return { nodes: [], edges: [] };
    }
  }, [json]);

  // Format nodes to use our custom node type
  const formattedNodes = useMemo(() => {
    return nodes.map((n: any) => {
      // All nodes use the logicGate type, which handles rendering based on label
      return {
        ...n,
        type: "logicGate",
      };
    });
  }, [nodes]);

  if (nodes.length === 0 || edges.length === 0) {
    return (
      <div className={`my-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
          No diagram data found
        </p>
        <details className="mt-2">
          <summary className="text-xs text-yellow-500 cursor-pointer hover:text-yellow-600">
            Show JSON
          </summary>
          <pre className="mt-2 text-xs bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded overflow-x-auto font-mono">
            {json}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className={`my-6 h-[500px] w-full bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      <ReactFlow
        nodes={formattedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-900"
      >
        <Background color="#374151" gap={16} />
        <Controls className="bg-gray-800 border-gray-700" />
        <MiniMap
          nodeColor={(node) => {
            const label = (node.data?.label || "").toUpperCase();
            if (label === "INPUT" || /^[A-Z]$/.test(label)) return "#60a5fa";
            if (label === "OUTPUT" || label === "F") return "#22c55e";
            if (label === "AND") return "#3b82f6";
            if (label === "OR") return "#f59e0b";
            if (label === "XOR") return "#a855f7";
            if (label === "NOT") return "#10b981";
            return "#6b7280";
          }}
          className="bg-gray-800 border border-gray-700"
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}

