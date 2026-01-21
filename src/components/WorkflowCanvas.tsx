"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Connection,
    Edge,
    Node,
    useReactFlow,
    MarkerType,
} from "reactflow";
import { useStore } from "@/store/store";
import { toast } from "sonner";
import "reactflow/dist/style.css";

// Node Components
import { TextNode } from "./nodes/TextNode";
import { UploadImageNode } from "./nodes/UploadImageNode";
import { UploadVideoNode } from "./nodes/UploadVideoNode";
import { LLMNode } from "./nodes/LLMNode";
import { CropNode } from "./nodes/CropNode";
import { ExtractNode } from "./nodes/ExtractNode";
import { NodeContextMenu } from "./NodeContextMenu";

const nodeTypes = {
    textNode: TextNode,
    uploadImageNode: UploadImageNode,
    uploadVideoNode: UploadVideoNode,
    llmNode: LLMNode,
    cropNode: CropNode,
    extractNode: ExtractNode,
};

// Default edge style with animated purple edges
const defaultEdgeOptions = {
    animated: true,
    style: { stroke: '#9333ea', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#9333ea' },
};

/**
 * Type-safe connection validation.
 */
function isValidConnection(connection: Connection, nodes: Node[]): boolean {
    const sourceHandle = connection.sourceHandle || "";
    const targetHandle = connection.targetHandle || "";
    const sourceType = sourceHandle.split(":")[0];
    const targetType = targetHandle.split(":")[0];
    if (!sourceType || !targetType) return true;
    return sourceType === targetType;
}

interface ContextMenuState {
    nodeId: string;
    x: number;
    y: number;
}

export function WorkflowCanvas() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
    } = useStore();
    const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    // Keyboard shortcuts for delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                const selectedNodes = getNodes().filter((n) => n.selected);
                const selectedEdges = getEdges().filter((e) => e.selected);

                if (selectedNodes.length > 0 || selectedEdges.length > 0) {
                    const nodeIds = new Set(selectedNodes.map((n) => n.id));
                    setNodes(getNodes().filter((n) => !nodeIds.has(n.id)));
                    setEdges(
                        getEdges().filter(
                            (edge) =>
                                !selectedEdges.some((se) => se.id === edge.id) &&
                                !nodeIds.has(edge.source) &&
                                !nodeIds.has(edge.target)
                        )
                    );
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [getNodes, getEdges, setNodes, setEdges]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    const handleConnect = useCallback(
        (connection: Connection) => {
            if (!isValidConnection(connection, nodes)) {
                toast.error("Invalid connection: incompatible handle types");
                return;
            }
            onConnect(connection);
        },
        [nodes, onConnect]
    );

    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault();
            setContextMenu({
                nodeId: node.id,
                x: event.clientX,
                y: event.clientY,
            });
        },
        []
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const type = event.dataTransfer.getData("application/reactflow");
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `node-${Date.now()}`,
                type,
                position,
                data: { label: type, status: "idle" },
            };

            setNodes(nodes.concat(newNode));
        },
        [screenToFlowPosition, setNodes, nodes]
    );

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={handleConnect}
                onNodeContextMenu={onNodeContextMenu}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                className="bg-gray-50"
                deleteKeyCode={null}
            >
                <Background color="#e5e7eb" gap={20} />
                <Controls className="bg-white border border-gray-200 shadow-sm" />
                <MiniMap
                    className="bg-white border border-gray-200 shadow-sm"
                    nodeColor="#9333ea"
                />
            </ReactFlow>

            {contextMenu && (
                <NodeContextMenu
                    nodeId={contextMenu.nodeId}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}


