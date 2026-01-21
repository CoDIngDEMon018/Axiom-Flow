import { task, tasks } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { getExecutionPhases } from "@/lib/graph";

type WorkflowPayload = {
    runId: string;
    nodes: any[];
    edges: any[];
    userId: string;
};

type NodeResult = {
    nodeId: string;
    output: any;
    status: "completed" | "failed";
    error?: string;
};

export const executeWorkflow = task({
    id: "execute-workflow",
    run: async (payload: WorkflowPayload) => {
        const { runId, nodes, edges, userId } = payload;
        const results: Record<string, NodeResult> = {};

        console.log(`[Workflow] Starting execution for run ${runId}`);
        console.log(`[Workflow] Nodes: ${nodes.length}, Edges: ${edges.length}`);

        try {
            // Get execution phases (nodes that can run in parallel)
            const phases = getExecutionPhases(nodes, edges);
            console.log(`[Workflow] Execution phases:`, phases);

            // Process each phase
            for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
                const phase = phases[phaseIndex];
                console.log(`[Workflow] Phase ${phaseIndex + 1}/${phases.length}: ${phase.join(', ')}`);

                // Mark all nodes in this phase as "Running" in DB
                await Promise.all(
                    phase.map(nodeId =>
                        prisma.nodeRun.create({
                            data: {
                                runHistoryId: runId,
                                nodeId,
                                status: "Running",
                                inputs: {} as any,
                            }
                        }).catch(() => { }) // Ignore if already exists
                    )
                );

                // Execute all nodes in this phase in PARALLEL using Promise.all
                const phasePromises = phase.map(async (nodeId) => {
                    const node = nodes.find((n: any) => n.id === nodeId);
                    if (!node) {
                        return {
                            nodeId,
                            output: null,
                            status: "failed" as const,
                            error: "Node not found",
                        };
                    }

                    const inputs = getNodeInputs(nodeId, edges, results, nodes);
                    const startTime = Date.now();

                    try {
                        const output = await executeNode(node, edges, results, nodes);
                        const durationMs = Date.now() - startTime;

                        // Update node run as successful
                        await prisma.nodeRun.updateMany({
                            where: { runHistoryId: runId, nodeId },
                            data: {
                                status: "Success",
                                inputs: inputs as any,
                                output: output as any,
                                durationMs,
                            }
                        });

                        return {
                            nodeId,
                            output,
                            status: "completed" as const,
                        };
                    } catch (error: any) {
                        console.error(`[Workflow] Node ${nodeId} failed:`, error);
                        const durationMs = Date.now() - startTime;

                        // Update node run as failed
                        await prisma.nodeRun.updateMany({
                            where: { runHistoryId: runId, nodeId },
                            data: {
                                status: "Failed",
                                inputs: inputs as any,
                                error: error.message,
                                durationMs,
                            }
                        });

                        return {
                            nodeId,
                            output: null,
                            status: "failed" as const,
                            error: error.message,
                        };
                    }
                });

                // Wait for ALL nodes in this phase to complete (parallel execution)
                const phaseResults = await Promise.all(phasePromises);

                // Store results for downstream nodes
                phaseResults.forEach((result) => {
                    results[result.nodeId] = result;
                });

                // Log failures but continue
                const failures = phaseResults.filter((r) => r.status === "failed");
                if (failures.length > 0) {
                    console.warn(`[Workflow] ${failures.length} node(s) failed in phase ${phaseIndex + 1}`);
                }
            }

            // Update run status
            await prisma.runHistory.update({
                where: { id: runId },
                data: {
                    status: "Completed",
                    finishedAt: new Date(),
                },
            });

            console.log(`[Workflow] Run ${runId} completed successfully`);
            return { success: true, results };

        } catch (error: any) {
            console.error(`[Workflow] Run ${runId} failed:`, error);

            await prisma.runHistory.update({
                where: { id: runId },
                data: {
                    status: "Failed",
                    finishedAt: new Date(),
                },
            });

            throw error;
        }
    },
});

async function executeNode(
    node: any,
    edges: any[],
    previousResults: Record<string, NodeResult>,
    allNodes: any[]
): Promise<any> {
    const nodeType = node.type;
    const nodeData = node.data;

    console.log(`[Node] Executing ${node.id} (type: ${nodeType})`);

    // Get inputs from connected nodes
    const inputs = getNodeInputs(node.id, edges, previousResults, allNodes);

    switch (nodeType) {
        case "uploadImageNode":
        case "uploadVideoNode":
            // These are input nodes - just return the uploaded URL
            return { url: nodeData.imageUrl || nodeData.videoUrl || null };

        case "textNode":
            // Text nodes just pass through their text
            return { text: nodeData.text || "" };

        case "cropNode":
            // Execute the Crop Task
            const cropPayload = {
                imageUrl: inputs.imageUrl || nodeData.imageUrl,
                x: nodeData.x || "0%",
                y: nodeData.y || "0%",
                width: nodeData.width || "100%",
                height: nodeData.height || "100%",
            };

            const cropHandle = await tasks.triggerAndWait("crop-task", cropPayload);

            if (cropHandle.ok) {
                return cropHandle.output;
            } else {
                throw new Error(`Crop task failed: ${cropHandle.error}`);
            }

        case "extractNode":
            // Execute the Extract Frame Task
            const extractPayload = {
                videoUrl: inputs.videoUrl || nodeData.videoUrl,
                timestamp: nodeData.timestamp || "0",
            };

            const extractHandle = await tasks.triggerAndWait("extract-task", extractPayload);

            if (extractHandle.ok) {
                return extractHandle.output;
            } else {
                throw new Error(`Extract task failed: ${extractHandle.error}`);
            }

        case "llmNode":
            // Trigger the LLM task
            const llmPayload = {
                systemPrompt: inputs.systemPrompt || "",
                userMessage: inputs.userMessage || nodeData.prompt || "Describe this image",
                imageUrls: inputs.imageUrls || [],
                model: nodeData.model || "gemini-2.0-flash",
            };

            console.log(`[Node] LLM payload:`, llmPayload);

            const llmHandle = await tasks.triggerAndWait("llm-task", llmPayload);

            if (llmHandle.ok) {
                return llmHandle.output;
            } else {
                throw new Error(`LLM task failed: ${llmHandle.error}`);
            }

        default:
            console.warn(`[Node] Unknown node type: ${nodeType}`);
            return { passthrough: true };
    }
}

function getNodeInputs(
    nodeId: string,
    edges: any[],
    previousResults: Record<string, NodeResult>,
    allNodes: any[]
): Record<string, any> {
    const inputs: Record<string, any> = {
        imageUrls: [],
    };

    // Find all edges pointing to this node
    const incomingEdges = edges.filter((e: any) => e.target === nodeId);

    for (const edge of incomingEdges) {
        const sourceResult = previousResults[edge.source];
        const sourceNode = allNodes.find((n: any) => n.id === edge.source);

        if (!sourceResult || !sourceNode) continue;

        const output = sourceResult.output;
        const handleType = edge.targetHandle || "";

        // Map outputs to inputs based on handle types
        if (handleType.includes("image") && output?.url) {
            inputs.imageUrls.push(output.url);
            inputs.imageUrl = output.url;
        }

        if (handleType.includes("video") && output?.url) {
            inputs.videoUrl = output.url;
        }

        if (handleType.includes("text:system") && output?.text) {
            inputs.systemPrompt = output.text;
        }

        if (handleType.includes("text:user") && output?.text) {
            inputs.userMessage = output.text;
        }

        if (handleType.includes("text") && !handleType.includes("system") && !handleType.includes("user")) {
            inputs.text = output.text || output.response;
        }
    }

    return inputs;
}

