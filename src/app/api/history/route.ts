import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const runs = await prisma.runHistory.findMany({
            where: { userId },
            orderBy: { startedAt: 'desc' },
            include: {
                nodeRuns: true // Include node details for the expanded view
            },
            take: 50 // Limit to recent 50 runs
        });

        return NextResponse.json({ runs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Missing run ID" }, { status: 400 });
    }

    try {
        // First, verify the run belongs to the user
        const run = await prisma.runHistory.findFirst({
            where: { id, userId },
        });

        if (!run) {
            return NextResponse.json({ error: "Run not found" }, { status: 404 });
        }

        // Delete associated NodeRun records first (cascade)
        await prisma.nodeRun.deleteMany({
            where: { runHistoryId: id },
        });

        // Now delete the RunHistory
        await prisma.runHistory.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete run error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
