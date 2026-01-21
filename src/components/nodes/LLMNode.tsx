import { Handle, Position, useReactFlow } from "reactflow";
import { Sparkles } from "lucide-react";
import { NodeCard } from "./NodeCard";
import { useState } from "react";

const MODELS = [
    { id: 'gemini-pro', name: 'Gemini Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];

export function LLMNode({ data, selected }: any) {
    const [model, setModel] = useState(data.model || 'gemini-pro');

    return (
        <NodeCard
            title="Run Any LLM"
            icon={<Sparkles size={16} />}
            selected={selected}
            color="bg-amber-500"
            status={data.status}
        >
            <div className="flex flex-col gap-2">
                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500"
                >
                    {MODELS.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>

                {data.output && (
                    <div className="p-2 bg-gray-50 rounded-md text-xs max-h-32 overflow-y-auto">
                        {data.output.response || data.output}
                    </div>
                )}
            </div>

            <Handle
                type="target"
                position={Position.Left}
                id="text:system"
                style={{ top: '30%' }}
                className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="text:user"
                style={{ top: '50%' }}
                className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="image:input"
                style={{ top: '70%' }}
                className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="text:output"
                className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
        </NodeCard>
    );
}
