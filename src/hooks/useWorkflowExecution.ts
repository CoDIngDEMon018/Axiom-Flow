"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import { useStore } from "@/store/store";
import { toast } from "sonner";

interface NodeRunStatus {
    nodeId: string;
    status: string;
    output: any;
}

interface ExecutionState {
    isRunning: boolean;
    runId: string | null;
    startPolling: (runId: string) => void;
    stopPolling: () => void;
}

/**
 * Hook to manage workflow execution and real-time status updates.
 * Polls the /api/run/status endpoint and updates node states accordingly.
 */
export function useWorkflowExecution(): ExecutionState {
    const [isRunning, setIsRunning] = useState(false);
    const [runId, setRunId] = useState<string | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const { setNodes, getNodes } = useReactFlow();
    const updateRun = useStore((s) => s.updateRun);

    const updateNodeStatus = useCallback((nodeId: string, status: string, output?: any) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            status: status.toLowerCase(),
                            output: output || node.data.output,
                        },
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    const pollStatus = useCallback(async (currentRunId: string) => {
        try {
            const res = await fetch(`/api/run/status?runId=${currentRunId}`);
            const data = await res.json();

            if (!res.ok) {
                console.error("Status poll failed:", data.error);
                return;
            }

            // Update individual node statuses
            const nodeRuns: NodeRunStatus[] = data.nodeRuns || [];
            const currentNodes = getNodes();
            const nodeStatusMap = new Map(nodeRuns.map(nr => [nr.nodeId, nr]));

            // Mark nodes that are being executed as "running" if not yet completed
            currentNodes.forEach((node) => {
                const nodeRun = nodeStatusMap.get(node.id);
                if (nodeRun) {
                    updateNodeStatus(node.id, nodeRun.status, nodeRun.output);
                }
            });

            // Check if workflow is complete
            const runStatus = data.runStatus;
            if (runStatus === "Completed" || runStatus === "Failed") {
                setIsRunning(false);
                updateRun(currentRunId, {
                    status: runStatus === "Completed" ? "success" : "failed",
                    finishedAt: new Date().toISOString(),
                });

                if (runStatus === "Completed") {
                    toast.success("Workflow completed!");
                } else {
                    toast.error("Workflow failed");
                }

                // Stop polling
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
            }
        } catch (err) {
            console.error("Polling error:", err);
        }
    }, [getNodes, updateNodeStatus, updateRun]);

    const startPolling = useCallback((newRunId: string) => {
        setRunId(newRunId);
        setIsRunning(true);

        // Reset all nodes to "running" initially
        setNodes((nodes) =>
            nodes.map((node) => ({
                ...node,
                data: { ...node.data, status: "running" },
            }))
        );

        // Start polling every 2 seconds
        pollingRef.current = setInterval(() => {
            pollStatus(newRunId);
        }, 2000);

        // Initial poll immediately
        pollStatus(newRunId);
    }, [setNodes, pollStatus]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setIsRunning(false);
        setRunId(null);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    return {
        isRunning,
        runId,
        startPolling,
        stopPolling,
    };
}
