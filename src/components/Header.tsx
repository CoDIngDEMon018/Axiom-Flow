"use client";

import { useState } from "react";
import { useReactFlow } from "reactflow";
import { useStore } from "@/store/store";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { Play, Download, Upload, Save, FolderOpen, Undo2, Redo2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WorkflowLibrary } from "./WorkflowLibrary";
import { SaveWorkflowDialog } from "./SaveWorkflowDialog";

// Sample workflow with gemini-pro model (free tier compatible)
const SAMPLE_WORKFLOW = {
    nodes: [
        { id: 'node-1', type: 'uploadImageNode', position: { x: 100, y: 100 }, data: { label: 'Upload Image', status: 'idle' } },
        { id: 'node-2', type: 'cropNode', position: { x: 100, y: 300 }, data: { label: 'Crop Image', status: 'idle' } },
        { id: 'node-3', type: 'textNode', position: { x: -200, y: 400 }, data: { text: 'You are a professional marketing assistant. Analyze the image and describe it for social media.', status: 'idle' } },
        { id: 'node-4', type: 'textNode', position: { x: -200, y: 550 }, data: { text: 'Create a short engaging post based on this product. Focus on key features and benefits.', status: 'idle' } },
        { id: 'node-5', type: 'llmNode', position: { x: 100, y: 500 }, data: { label: 'LLM: Description', model: 'gemini-2.0-flash', status: 'idle' } },
        { id: 'node-6', type: 'uploadVideoNode', position: { x: 400, y: 100 }, data: { label: 'Upload Video', status: 'idle' } },
        { id: 'node-7', type: 'extractNode', position: { x: 400, y: 300 }, data: { label: 'Extract Frame', timestamp: '50%', status: 'idle' } },
    ],
    edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2', sourceHandle: 'image:output', targetHandle: 'image:input', animated: true, style: { stroke: '#9333ea' } },
        { id: 'e2-5', source: 'node-2', target: 'node-5', sourceHandle: 'image:output', targetHandle: 'image:input', animated: true, style: { stroke: '#9333ea' } },
        { id: 'e3-5', source: 'node-3', target: 'node-5', sourceHandle: 'text:output', targetHandle: 'text:system', animated: true, style: { stroke: '#9333ea' } },
        { id: 'e4-5', source: 'node-4', target: 'node-5', sourceHandle: 'text:output', targetHandle: 'text:user', animated: true, style: { stroke: '#9333ea' } },
        { id: 'e6-7', source: 'node-6', target: 'node-7', sourceHandle: 'video:output', targetHandle: 'video:input', animated: true, style: { stroke: '#9333ea' } },
    ]
};

export function Header() {
    const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();
    const { addRun, undo, redo, canUndo, canRedo } = useStore();
    const { isRunning, startPolling } = useWorkflowExecution();

    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
    const [currentWorkflowName, setCurrentWorkflowName] = useState("Untitled Workflow");

    const loadSample = () => {
        if (confirm("Load sample workflow? This will replace current canvas.")) {
            setNodes(SAMPLE_WORKFLOW.nodes as any);
            setEdges(SAMPLE_WORKFLOW.edges as any);
            setCurrentWorkflowId(null);
            setCurrentWorkflowName("Sample Workflow");
            toast.success("Sample workflow loaded!");
        }
    };

    const handleExport = () => {
        const flow = { name: currentWorkflowName, nodes: getNodes(), edges: getEdges() };
        const json = JSON.stringify(flow, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentWorkflowName.replace(/\s+/g, '_')}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const flow = JSON.parse(event.target?.result as string);
                if (flow.nodes && flow.edges) {
                    setNodes(flow.nodes);
                    setEdges(flow.edges);
                    setCurrentWorkflowId(null);
                    setCurrentWorkflowName(flow.name || "Imported Workflow");
                    toast.success("Workflow imported!");
                }
            } catch (err) {
                toast.error("Failed to parse workflow file");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleWorkflowLoad = (workflowId: string) => {
        setCurrentWorkflowId(workflowId);
    };

    const handleWorkflowSave = (id: string, name: string) => {
        setCurrentWorkflowId(id);
        setCurrentWorkflowName(name);
    };

    const runWorkflow = async () => {
        const nodes = getNodes();
        const edges = getEdges();

        if (nodes.length === 0) {
            toast.error("Add some nodes first!");
            return;
        }

        if (isRunning) {
            toast.warning("Workflow is already running");
            return;
        }

        toast.info("Starting workflow...");

        try {
            const res = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to start workflow");
            }

            toast.success("Workflow started!");

            if (data.runId) {
                addRun({ id: data.runId, status: 'running', startedAt: new Date().toISOString() });
                // Start polling for real-time status updates
                startPolling(data.runId);
            }

        } catch (err: any) {
            toast.error(err.message || "Failed to run workflow");
        }
    };

    return (
        <>
            <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg shadow-sm"></div>
                    <span className="font-semibold text-lg">{currentWorkflowName}</span>
                    {isRunning && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            <Loader2 size={12} className="animate-spin" />
                            Running
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Undo/Redo */}
                    <button onClick={undo} disabled={!canUndo()} className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30" title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
                    <button onClick={redo} disabled={!canRedo()} className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30" title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>

                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    {/* File Operations */}
                    <button onClick={() => setShowLibrary(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded" title="Open"><FolderOpen size={16} /></button>
                    <button onClick={() => setShowSaveDialog(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded" title="Save"><Save size={16} /></button>
                    <button onClick={handleExport} className="p-2 text-gray-500 hover:bg-gray-100 rounded" title="Export JSON"><Download size={16} /></button>
                    <label className="p-2 text-gray-500 hover:bg-gray-100 rounded cursor-pointer" title="Import JSON">
                        <Upload size={16} />
                        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                    </label>

                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    <button onClick={loadSample} className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100">Load Sample</button>
                    <button
                        onClick={runWorkflow}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="white" />}
                        {isRunning ? "Running..." : "Run"}
                    </button>
                </div>
            </header>

            <WorkflowLibrary isOpen={showLibrary} onClose={() => setShowLibrary(false)} onWorkflowLoad={handleWorkflowLoad} />
            <SaveWorkflowDialog isOpen={showSaveDialog} onClose={() => setShowSaveDialog(false)} currentWorkflowId={currentWorkflowId} currentWorkflowName={currentWorkflowName} onSave={handleWorkflowSave} />
        </>
    );
}

