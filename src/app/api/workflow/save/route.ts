import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const SaveWorkflowSchema = z.object({
    name: z.string().min(1, "Workflow name is required"),
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    workflowId: z.string().optional(), // If provided, update existing workflow
});

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, nodes, edges, workflowId } = SaveWorkflowSchema.parse(body);

        // Find or create user
        let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: { clerkId: userId },
            });
        }

        let workflow;

        if (workflowId) {
            // Update existing workflow
            workflow = await prisma.workflow.update({
                where: { id: workflowId, userId: dbUser.id },
                data: {
                    name,
                    nodes: nodes as any,
                    edges: edges as any,
                    updatedAt: new Date(),
                },
            });
        } else {
            // Create new workflow
            workflow = await prisma.workflow.create({
                data: {
                    userId: dbUser.id,
                    name,
                    nodes: nodes as any,
                    edges: edges as any,
                },
            });
        }

        return NextResponse.json({
            success: true,
            workflow: {
                id: workflow.id,
                name: workflow.name,
            },
        });

    } catch (e: any) {
        console.error("Save workflow error:", e);
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
