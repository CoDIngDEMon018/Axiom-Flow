import { NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { topologicalSort, buildDependencyGraph } from '@/lib/graph';
import { prisma } from '@/lib/prisma';
import { runWorkflowSchema } from '@/lib/validation';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// Import our task identifiers (we usually reference them by string ID in invoke)
// or import the task object if we want types. 
// For v3, strict "trigger" from backend often uses the `tasks.trigger` 
// but we need to import the task *definitions* to get type safety if possible, 
// OR just use valid string IDs "llm-task", "crop-image", etc.

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validated = await runWorkflowSchema.safeParseAsync(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.errors },
                { status: 400 }
            );
        }

        const { nodes, edges, workflowId } = validated.data;

        // 1. Save Run History Entry
        const run = await prisma.runHistory.create({
            data: {
                userId,
                workflowId: workflowId || undefined,
                scope: 'Full',
                status: 'Running',
            }
        });

        // 2. Validate DAG
        try {
            topologicalSort(nodes, edges);
        } catch (e) {
            return NextResponse.json({ error: "Cycle detected" }, { status: 400 });
        }

        // 3. Execution Engine
        // We will trigger tasks. For a "serverless" wait, it's tricky to wait for ALL in a Next.js API route 
        // because of timeouts (Vercel 10s-60s limit). 
        // THE BETTER WAY: 
        // Trigger the first set of tasks. 
        // AND/OR use a master "Workflow Task" in Trigger.dev that orchestrates the others!
        // That ensures the orchestration itself is durable and can wait for minutes/hours.
        // 
        // Let's create a "Main Workflow Task" (src/trigger/workflow.ts) that takes the graph,
        // and runs the loop inside Trigger.dev.
        // The API route just triggers *that* master task.

        // So, we'll delegate the complexity to a new task: "execute-workflow".

        const payload = {
            runId: run.id,
            nodes,
            edges,
            userId
        };

        const handle = await tasks.trigger("execute-workflow", payload);

        return NextResponse.json({ success: true, runId: run.id, traceId: handle.id });

    } catch (error: any) {
        console.error("Run error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
