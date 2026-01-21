import { z } from 'zod';

// Node schema - represents workflow nodes from React Flow
const nodeSchema = z.object({
    id: z.string(),
    type: z.string().optional(),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
    data: z.record(z.any()),
});

// Edge schema - represents connections between nodes
const edgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional().nullable(),
    targetHandle: z.string().optional().nullable(),
    animated: z.boolean().optional(),
    style: z.record(z.any()).optional(),
});

// Main workflow execution schema
export const runWorkflowSchema = z.object({
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),
    workflowId: z.string().optional(),
});

export type RunWorkflowInput = z.infer<typeof runWorkflowSchema>;
