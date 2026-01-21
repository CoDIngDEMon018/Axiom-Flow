import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';

interface Run {
    id: string;
    status: 'running' | 'success' | 'failed';
    startedAt: string;
    finishedAt?: string;
    error?: string;
}

interface WorkflowState {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;

    // History
    history: {
        past: { nodes: Node[]; edges: Edge[] }[];
        future: { nodes: Node[]; edges: Edge[] }[];
    };
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    takeSnapshot: () => void;

    // Runs
    runs: Run[];
    addRun: (run: Run) => void;
    updateRun: (id: string, updates: Partial<Run>) => void;
    clearRuns: () => void;
}

export const useStore = create<WorkflowState>((set, get) => ({
    nodes: [],
    edges: [],

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    onConnect: (connection: Connection) => {
        get().takeSnapshot();
        set({
            edges: addEdge(connection, get().edges),
        });
    },

    setNodes: (nodes: Node[]) => {
        // Simple equality check to avoid redundant snapshots
        const currentNodes = get().nodes;
        if (JSON.stringify(currentNodes) !== JSON.stringify(nodes)) {
            get().takeSnapshot();
            set({ nodes });
        }
    },

    setEdges: (edges: Edge[]) => {
        get().takeSnapshot();
        set({ edges });
    },

    // History Implementation
    history: {
        past: [],
        future: [],
    },

    takeSnapshot: () => {
        const { nodes, edges, history } = get();
        set({
            history: {
                past: [...history.past, { nodes, edges }].slice(-20), // Keep last 20 states
                future: [],
            },
        });
    },

    undo: () => {
        const { nodes, edges, history } = get();
        if (history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, history.past.length - 1);

        set({
            nodes: previous.nodes,
            edges: previous.edges,
            history: {
                past: newPast,
                future: [{ nodes, edges }, ...history.future],
            },
        });
    },

    redo: () => {
        const { nodes, edges, history } = get();
        if (history.future.length === 0) return;

        const next = history.future[0];
        const newFuture = history.future.slice(1);

        set({
            nodes: next.nodes,
            edges: next.edges,
            history: {
                past: [...history.past, { nodes, edges }],
                future: newFuture,
            },
        });
    },

    canUndo: () => get().history.past.length > 0,
    canRedo: () => get().history.future.length > 0,

    // Runs
    runs: [],
    addRun: (run) => set((state) => ({ runs: [run, ...state.runs].slice(0, 50) })),
    updateRun: (id, updates) => set((state) => ({
        runs: state.runs.map((r) => r.id === id ? { ...r, ...updates } : r)
    })),
    clearRuns: () => set({ runs: [] }),
}));

