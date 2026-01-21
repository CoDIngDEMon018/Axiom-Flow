import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/workflows/[id] - Load a specific workflow by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const workflow = await prisma.workflow.findUnique({
            where: { id, userId: dbUser.id },
        });

        if (!workflow) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: workflow.id,
            name: workflow.name,
            nodes: workflow.nodes,
            edges: workflow.edges,
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt,
        });

    } catch (e: any) {
        console.error("Load workflow error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
