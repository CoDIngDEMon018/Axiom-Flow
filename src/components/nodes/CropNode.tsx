import { Handle, Position, useReactFlow } from "reactflow";
import { Crop } from "lucide-react";
import { NodeCard } from "./NodeCard";
import { useState } from "react";

export function CropNode({ id, data, selected }: any) {
    const { getEdges, setNodes } = useReactFlow();
    const [x, setX] = useState(data.x || "0");
    const [y, setY] = useState(data.y || "0");
    const [width, setWidth] = useState(data.width || "100");
    const [height, setHeight] = useState(data.height || "100");

    const edges = getEdges();
    const isImageConnected = edges.some(e => e.target === id && e.targetHandle === "image:input");

    const outputUrl = data.output?.url || data.output;

    // Update node data when inputs change
    const updateNodeData = (field: string, value: string) => {
        setNodes(nodes => nodes.map(n =>
            n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n
        ));
    };

    return (
        <NodeCard
            title="Crop Image"
            icon={<Crop size={16} />}
            selected={selected}
            color="bg-rose-500"
            status={data.status}
        >
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] text-gray-500">X %</label>
                        <input
                            type="number"
                            value={x}
                            onChange={(e) => { setX(e.target.value); updateNodeData('x', e.target.value); }}
                            className="w-full p-1 text-xs border rounded"
                            min={0} max={100}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500">Y %</label>
                        <input
                            type="number"
                            value={y}
                            onChange={(e) => { setY(e.target.value); updateNodeData('y', e.target.value); }}
                            className="w-full p-1 text-xs border rounded"
                            min={0} max={100}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500">Width %</label>
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => { setWidth(e.target.value); updateNodeData('width', e.target.value); }}
                            className="w-full p-1 text-xs border rounded"
                            min={0} max={100}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500">Height %</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => { setHeight(e.target.value); updateNodeData('height', e.target.value); }}
                            className="w-full p-1 text-xs border rounded"
                            min={0} max={100}
                        />
                    </div>
                </div>

                {isImageConnected && (
                    <div className="text-[10px] text-green-600 font-medium">✓ Image connected</div>
                )}

                {outputUrl && (
                    <img src={outputUrl} alt="Cropped" className="w-full h-20 object-cover rounded" />
                )}
            </div>

            <Handle
                type="target"
                position={Position.Left}
                id="image:input"
                className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="image:output"
                className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
        </NodeCard>
    );
}

