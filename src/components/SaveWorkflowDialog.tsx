"use client";

import { useState } from "react";
import { useReactFlow } from "reactflow";
import { X, Save } from "lucide-react";
import { toast } from "sonner";

interface SaveWorkflowDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentWorkflowId: string | null;
    currentWorkflowName: string;
    onSave: (id: string, name: string) => void;
}

export function SaveWorkflowDialog({
    isOpen,
    onClose,
    currentWorkflowId,
    currentWorkflowName,
    onSave,
}: SaveWorkflowDialogProps) {
    const [name, setName] = useState(currentWorkflowName || "Untitled Workflow");
    const [saving, setSaving] = useState(false);
    const { getNodes, getEdges } = useReactFlow();

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter a workflow name");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/workflow/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    nodes: getNodes(),
                    edges: getEdges(),
                    workflowId: currentWorkflowId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save");
            }

            toast.success(`Saved: ${data.workflow.name}`);
            onSave(data.workflow.id, data.workflow.name);
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to save workflow");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Save size={20} className="text-purple-600" />
                        Save Workflow
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} />
                    </button>
                </div>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Workflow name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                    autoFocus
                />

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving..." : currentWorkflowId ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
