"use client";

import { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { Play, Trash2, Copy, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/store";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";

interface NodeContextMenuProps {
    nodeId: string;
    x: number;
    y: number;
    onClose: () => void;
}

export function NodeContextMenu({ nodeId, x, y, onClose }: NodeContextMenuProps) {
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
    const { addRun } = useStore();
    const { startPolling, isRunning } = useWorkflowExecution();

    const handleRunNode = useCallback(async () => {
        if (isRunning) {
            toast.warning("A workflow is already running");
            onClose();
            return;
        }

        const nodes = getNodes();
        const edges = getEdges();

        toast.info("Running node...");

        try {
            const res = await fetch('/api/run/node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodeId, nodes, edges }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to run node");
            }

            toast.success(`Running ${data.nodesCount} node(s)`);

            if (data.runId) {
                addRun({ id: data.runId, status: 'running', startedAt: new Date().toISOString() });
                startPolling(data.runId);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to run node");
        }

        onClose();
    }, [nodeId, getNodes, getEdges, addRun, startPolling, isRunning, onClose]);

    const handleDuplicate = useCallback(() => {
        const nodes = getNodes();
        const targetNode = nodes.find(n => n.id === nodeId);

        if (targetNode) {
            const newNode = {
                ...targetNode,
                id: `node-${Date.now()}`,
                position: {
                    x: targetNode.position.x + 50,
                    y: targetNode.position.y + 50,
                },
                selected: false,
            };
            setNodes([...nodes, newNode]);
            toast.success("Node duplicated");
        }
        onClose();
    }, [nodeId, getNodes, setNodes, onClose]);

    const handleDelete = useCallback(() => {
        const nodes = getNodes();
        const edges = getEdges();

        setNodes(nodes.filter(n => n.id !== nodeId));
        setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));

        toast.success("Node deleted");
        onClose();
    }, [nodeId, getNodes, getEdges, setNodes, setEdges, onClose]);

    return (
        <div
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[160px]"
            style={{ left: x, top: y }}
            onMouseLeave={onClose}
        >
            <button
                onClick={handleRunNode}
                className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2"
            >
                <PlayCircle size={14} className="text-purple-600" />
                Run This Node
            </button>
            <button
                onClick={handleDuplicate}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
                <Copy size={14} className="text-gray-600" />
                Duplicate
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
            >
                <Trash2 size={14} />
                Delete
            </button>
        </div>
    );
}
