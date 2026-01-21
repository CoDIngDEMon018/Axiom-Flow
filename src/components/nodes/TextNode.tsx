import { Handle, Position, useReactFlow } from "reactflow";
import { Type } from "lucide-react";
import { NodeCard } from "./NodeCard";
import { useState, useCallback } from "react";

export function TextNode({ data, selected, id }: any) {
    const { setNodes } = useReactFlow();
    const [text, setText] = useState(data.text || "");

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, text: newText } }
                    : node
            )
        );
    }, [id, setNodes]);

    return (
        <NodeCard
            title="Text Input"
            icon={<Type size={16} />}
            selected={selected}
            color="bg-emerald-500"
            status={data.status}
        >
            <textarea
                value={text}
                onChange={handleChange}
                placeholder="Enter your text here..."
                className="w-full h-24 p-2 text-xs border border-gray-200 rounded-md resize-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="text:output"
                className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white shadow-sm"
            />
        </NodeCard>
    );
}
