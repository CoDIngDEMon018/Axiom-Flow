import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');

    if (!runId) {
        return NextResponse.json({ error: "Missing runId" }, { status: 400 });
    }

    try {
        const nodeRuns = await prisma.nodeRun.findMany({
            where: { runHistoryId: runId },
            select: { nodeId: true, status: true, output: true }
        });

        const runHistory = await prisma.runHistory.findUnique({
            where: { id: runId },
            select: { status: true }
        });

        return NextResponse.json({
            runStatus: runHistory?.status,
            nodeRuns
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
