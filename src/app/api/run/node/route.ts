import { NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { topologicalSort } from '@/lib/graph';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const runNodeSchema = z.object({
    nodeId: z.string(),
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
});

/**
 * POST /api/run/node - Run a single node or selected nodes
 * This creates a partial run that only executes the specified nodes
 * and their required dependencies.
 */
export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validated = runNodeSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.errors },
                { status: 400 }
            );
        }

        const { nodeId, nodes, edges } = validated.data;

        // Find the target node
        const targetNode = nodes.find((n: any) => n.id === nodeId);
        if (!targetNode) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 });
        }

        // Get all dependencies (upstream nodes) for the target node
        const nodesToRun = getNodeDependencies(nodeId, nodes, edges);
        nodesToRun.push(nodeId);

        // Filter nodes and edges to only include the subset
        const filteredNodes = nodes.filter((n: any) => nodesToRun.includes(n.id));
        const filteredEdges = edges.filter((e: any) =>
            nodesToRun.includes(e.source) && nodesToRun.includes(e.target)
        );

        // Validate DAG
        try {
            topologicalSort(filteredNodes, filteredEdges);
        } catch (e) {
            return NextResponse.json({ error: "Cycle detected in dependencies" }, { status: 400 });
        }

        // Create run history entry
        const run = await prisma.runHistory.create({
            data: {
                userId,
                scope: nodesToRun.length === 1 ? 'Single' : 'Selected',
                status: 'Running',
            }
        });

        // Trigger the workflow execution with filtered nodes
        const payload = {
            runId: run.id,
            nodes: filteredNodes,
            edges: filteredEdges,
            userId
        };

        await tasks.trigger("execute-workflow", payload);

        return NextResponse.json({
            success: true,
            runId: run.id,
            nodesCount: filteredNodes.length,
            scope: nodesToRun.length === 1 ? 'single' : 'selected'
        });

    } catch (error: any) {
        console.error("Run node error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Get all upstream dependencies for a node (recursive)
 */
function getNodeDependencies(nodeId: string, nodes: any[], edges: any[]): string[] {
    const dependencies: string[] = [];
    const visited = new Set<string>();

    function traverse(currentNodeId: string) {
        if (visited.has(currentNodeId)) return;
        visited.add(currentNodeId);

        // Find all edges where this node is the target (incoming edges)
        const incomingEdges = edges.filter((e: any) => e.target === currentNodeId);

        for (const edge of incomingEdges) {
            const sourceNode = nodes.find((n: any) => n.id === edge.source);
            if (sourceNode) {
                dependencies.push(edge.source);
                traverse(edge.source);
            }
        }
    }

    traverse(nodeId);
    return dependencies;
}
