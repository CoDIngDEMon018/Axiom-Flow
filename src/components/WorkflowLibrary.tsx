"use client";

import { useState, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { X, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface Workflow {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface WorkflowLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onWorkflowLoad: (workflowId: string) => void;
}

export function WorkflowLibrary({ isOpen, onClose, onWorkflowLoad }: WorkflowLibraryProps) {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(false);
    const { setNodes, setEdges } = useReactFlow();

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/workflows');
            const data = await res.json();
            if (data.workflows) {
                setWorkflows(data.workflows);
            }
        } catch (err) {
            console.error("Failed to fetch workflows:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchWorkflows();
        }
    }, [isOpen]);

    const handleLoad = async (workflowId: string) => {
        try {
            const res = await fetch(`/api/workflows/${workflowId}`);
            const data = await res.json();

            if (data.nodes && data.edges) {
                setNodes(data.nodes);
                setEdges(data.edges);
                toast.success(`Loaded: ${data.name}`);
                onWorkflowLoad(workflowId);
                onClose();
            }
        } catch (err: any) {
            toast.error("Failed to load workflow");
        }
    };

    const handleDelete = async (workflowId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this workflow?")) return;

        try {
            await fetch(`/api/workflows?id=${workflowId}`, { method: 'DELETE' });
            setWorkflows(workflows.filter(w => w.id !== workflowId));
            toast.success("Workflow deleted");
        } catch (err) {
            toast.error("Failed to delete workflow");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FolderOpen size={20} className="text-purple-600" />
                        Your Workflows
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center text-gray-500 py-8">Loading...</div>
                    ) : workflows.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No saved workflows yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {workflows.map((workflow) => (
                                <div
                                    key={workflow.id}
                                    onClick={() => handleLoad(workflow.id)}
                                    className="p-3 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 cursor-pointer group transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800">{workflow.name}</span>
                                        <button
                                            onClick={(e) => handleDelete(workflow.id, e)}
                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-500 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Updated: {new Date(workflow.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
