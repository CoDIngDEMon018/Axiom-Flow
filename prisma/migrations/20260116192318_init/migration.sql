-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunHistory" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "RunHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeRun" (
    "id" TEXT NOT NULL,
    "runHistoryId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "output" JSONB,
    "durationMs" INTEGER,
    "error" TEXT,

    CONSTRAINT "NodeRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunHistory" ADD CONSTRAINT "RunHistory_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeRun" ADD CONSTRAINT "NodeRun_runHistoryId_fkey" FOREIGN KEY ("runHistoryId") REFERENCES "RunHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
