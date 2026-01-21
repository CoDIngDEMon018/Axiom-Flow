import { Edge, Node } from "reactflow";

export interface GraphNode {
    id: string;
    dependencies: string[];
}

export function buildDependencyGraph(nodes: Node[], edges: Edge[]) {
    const adjacency: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    // Initialize
    nodes.forEach(node => {
        adjacency[node.id] = [];
        inDegree[node.id] = 0;
    });

    // Build Graph
    edges.forEach(edge => {
        if (adjacency[edge.source]) {
            adjacency[edge.source].push(edge.target);
            inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
        }
    });

    return { adjacency, inDegree };
}

export function topologicalSort(nodes: Node[], edges: Edge[]) {
    const { adjacency, inDegree } = buildDependencyGraph(nodes, edges);
    const queue: string[] = [];
    const sorted: string[] = [];

    // Find users with 0 in-degree (starters)
    nodes.forEach(node => {
        if (inDegree[node.id] === 0) {
            queue.push(node.id);
        }
    });

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        sorted.push(currentId);

        const neighbors = adjacency[currentId] || [];
        neighbors.forEach(neighbor => {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        });
    }

    if (sorted.length !== nodes.length) {
        throw new Error("Cycle detected in workflow");
    }

    // Group into "Phases" for parallel execution?
    // Or just return linear sort. 
    // For parallel execution engine, we usually prefer to just have the graph and 
    // execute nodes whose dependencies are met dynamically.
    // But a sort is good for validation.
    return sorted;
}

export function getExecutionPhases(nodes: Node[], edges: Edge[]) {
    // Kahn's algorithm variant to group by "can run in parallel"
    const { adjacency, inDegree } = buildDependencyGraph(nodes, edges);
    const queue: string[] = [];
    const phases: string[][] = [];

    nodes.forEach(node => {
        if (inDegree[node.id] === 0) queue.push(node.id);
    });

    while (queue.length > 0) {
        const currentPhaseBatch = [...queue];
        phases.push(currentPhaseBatch);

        // Clear queue for next batch, but we need to find *next* available
        // This simple level-order BFS (kinda) works for "layers".
        // Actually for true async engine we don't strictly need phases, 
        // but it helps visualizing "Step 1, Step 2".

        // HOWEVER, standard Kahn removes edges.
        // We'll reset queue.
        queue.length = 0;

        const nextQueue: string[] = [];

        currentPhaseBatch.forEach(nodeId => {
            const neighbors = adjacency[nodeId] || [];
            neighbors.forEach(neighbor => {
                inDegree[neighbor]--;
                if (inDegree[neighbor] === 0) {
                    nextQueue.push(neighbor);
                }
            });
        });

        queue.push(...nextQueue);
    }

    return phases;
}
