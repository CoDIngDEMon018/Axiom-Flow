"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, ChevronRight, ChevronDown, RefreshCw } from "lucide-react";

interface NodeRun {
    id: string;
    nodeId: string;
    status: string;
    inputs: any;
    output: any;
    durationMs: number | null;
    error: string | null;
}

interface RunHistory {
    id: string;
    status: string;
    startedAt: string;
    durationMs: number | null;
    nodeRuns: NodeRun[];
}

export function HistorySidebar() {
    const [runs, setRuns] = useState<RunHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/history');
            const data = await res.json();
            if (data.runs) {
                setRuns(data.runs);
            }
        } catch (e) {
            console.error("Failed to fetch history", e);
        } finally {
            setLoading(false);
        }
    };

    // Poll for history updates occasionally or on mount
    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000); // Poll every 5s to keep list fresh
        return () => clearInterval(interval);
    }, []);

    const toggleRun = (id: string) => {
        setExpandedRunId(expandedRunId === id ? null : id);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'failed': return 'text-red-600 bg-red-50 border-red-200';
            case 'running': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'partial': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
            case 'completed': return <CheckCircle2 size={16} />;
            case 'failed': return <XCircle size={16} />;
            case 'running': return <RefreshCw size={16} className="animate-spin" />;
            default: return <Clock size={16} />;
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent toggling expansion
        if (!confirm("Delete this run?")) return;

        try {
            const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRuns(runs.filter(r => r.id !== id));
            } else {
                console.error("Failed to delete run");
            }
        } catch (error) {
            console.error("Error deleting run:", error);
        }
    };

    return (
        <aside className="w-80 border-l border-gray-200 bg-white h-full flex flex-col shadow-[-5px_0px_15px_-5px_rgba(0,0,0,0.05)] z-10">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur">
                <h2 className="font-semibold text-sm text-gray-800">Run History</h2>
                <button onClick={fetchHistory} className="text-gray-400 hover:text-purple-600 transition-colors" title="Refresh">
                    <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {runs.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Clock size={32} className="mb-2 opacity-20" />
                        <span className="text-xs">No runs yet.</span>
                    </div>
                )}

                {runs.map((run) => (
                    <div key={run.id} className="border border-gray-100 rounded-lg overflow-hidden transition-all hover:border-gray-300 shadow-sm">
                        {/* Run Header */}
                        <div
                            className={cn(
                                "p-3 flex items-center justify-between bg-white transition-colors hover:bg-gray-50",
                                expandedRunId === run.id && "bg-gray-50"
                            )}
                        >
                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleRun(run.id)}>
                                <div className={cn("p-1.5 rounded-full border", getStatusColor(run.status))}>
                                    {getStatusIcon(run.status)}
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-gray-900">
                                        {new Date(run.startedAt).toLocaleTimeString()} <span className="text-gray-400 font-normal">{new Date(run.startedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                                        {run.status} • {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '...'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => handleDelete(e, run.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Run"
                                >
                                    <XCircle size={14} />
                                </button>
                                <button
                                    onClick={() => toggleRun(run.id)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    {expandedRunId === run.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedRunId === run.id && (
                            <div className="border-t border-gray-100 bg-gray-50/50 p-2 space-y-1">
                                {run.nodeRuns.map((nodeRun) => (
                                    <div key={nodeRun.id} className="text-xs p-2 bg-white rounded border border-gray-100 shadow-sm ml-2 relative">
                                        <div className="absolute left-[-9px] top-3 w-2 h-[1px] bg-gray-300"></div> {/* decorative branch line */}
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-gray-700">{nodeRun.nodeId}</span>
                                            <span className={cn(
                                                "text-[9px] px-1.5 py-0.5 rounded-full border",
                                                getStatusColor(nodeRun.status)
                                            )}>
                                                {nodeRun.status}
                                            </span>
                                        </div>
                                        {nodeRun.error && (
                                            <div className="text-red-500 bg-red-50 p-1.5 rounded mt-1 break-words font-mono text-[9px]">
                                                {nodeRun.error}
                                            </div>
                                        )}
                                        {/* Outputs */}
                                        {nodeRun.output && (
                                            <div className="mt-1">
                                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Output</div>

                                                {/* Image Preview */}
                                                {(nodeRun.output as any).url && typeof (nodeRun.output as any).url === 'string' && (nodeRun.output as any).url.match(/\.(jpeg|jpg|gif|png|webp)$/i) && (
                                                    <div className="mb-1.5 rounded-md overflow-hidden border border-gray-200">
                                                        <img
                                                            src={(nodeRun.output as any).url}
                                                            alt="Output"
                                                            className="w-full h-auto object-cover max-h-[120px]"
                                                        />
                                                    </div>
                                                )}

                                                <div className="bg-gray-100 p-1.5 rounded text-[10px] text-gray-700 font-mono break-all max-h-20 overflow-y-auto">
                                                    {typeof nodeRun.output === 'string' ? nodeRun.output : JSON.stringify(nodeRun.output, null, 2)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
}
