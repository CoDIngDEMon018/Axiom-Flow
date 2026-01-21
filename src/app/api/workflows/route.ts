import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/workflows - List all workflows for the current user
export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!dbUser) {
            return NextResponse.json({ workflows: [] });
        }

        const workflows = await prisma.workflow.findMany({
            where: { userId: dbUser.id },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ workflows });

    } catch (e: any) {
        console.error("List workflows error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/workflows?id=xxx - Delete a workflow
export async function DELETE(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('id');

    if (!workflowId) {
        return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 });
    }

    try {
        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete associated run history first (cascade)
        await prisma.runHistory.deleteMany({
            where: { workflowId },
        });

        await prisma.workflow.delete({
            where: { id: workflowId, userId: dbUser.id },
        });

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Delete workflow error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
