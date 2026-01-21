import { Handle, Position, useReactFlow } from "reactflow";
import { ScanLine } from "lucide-react";
import { NodeCard } from "./NodeCard";
import { useState } from "react";

export function ExtractNode({ id, data, selected }: any) {
    const { getEdges, setNodes } = useReactFlow();
    const [timestamp, setTimestamp] = useState(data.timestamp || "50%");

    const edges = getEdges();
    const isVideoConnected = edges.some(e => e.target === id && e.targetHandle === "video:input");

    const outputUrl = data.output?.url || data.output;

    const handleTimestampChange = (value: string) => {
        setTimestamp(value);
        setNodes(nodes => nodes.map(n =>
            n.id === id ? { ...n, data: { ...n.data, timestamp: value } } : n
        ));
    };

    return (
        <NodeCard
            title="Extract Frame"
            icon={<ScanLine size={16} />}
            selected={selected}
            color="bg-indigo-500"
            status={data.status}
        >
            <div className="flex flex-col gap-2">
                <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Timestamp</label>
                    <input
                        type="text"
                        value={timestamp}
                        onChange={(e) => handleTimestampChange(e.target.value)}
                        placeholder='"50%" or "10" (seconds)'
                        className="w-full p-2 text-xs border border-gray-200 rounded-md"
                    />
                    <span className="text-[10px] text-gray-400">sec / %</span>
                </div>

                {isVideoConnected && (
                    <div className="text-[10px] text-green-600 font-medium">✓ Video connected</div>
                )}

                {data.status === 'failed' && (
                    <div className="text-xs text-red-500">⊗ Extraction failed</div>
                )}

                {outputUrl && (
                    <img src={outputUrl} alt="Extracted" className="w-full h-20 object-cover rounded" />
                )}
            </div>

            <Handle
                type="target"
                position={Position.Left}
                id="video:input"
                className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="image:output"
                className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
        </NodeCard>
    );
}

