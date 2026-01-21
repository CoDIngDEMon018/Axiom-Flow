import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!dbUser) {
            return NextResponse.json({ nodes: [], edges: [] }); // No user, no workflows
        }

        // Get latest workflow
        const workflow = await prisma.workflow.findFirst({
            where: { userId: dbUser.id },
            orderBy: { createdAt: 'desc' }
        });

        if (!workflow) {
            return NextResponse.json({ nodes: [], edges: [] });
        }

        return NextResponse.json({
            nodes: workflow.nodes,
            edges: workflow.edges,
            name: workflow.name,
            id: workflow.id
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
