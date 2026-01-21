import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { toast } from 'sonner';

export function useKeyboardShortcuts() {
    // @ts-ignore - types added in store update
    const { undo, redo, canUndo, canRedo, nodes, setNodes } = useStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore when typing in inputs
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            // Ctrl+Z / Cmd+Z for Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo()) {
                    undo();
                    toast.success('Undo');
                } else {
                    toast.info('Nothing to undo');
                }
                return;
            }

            // Ctrl+Y / Cmd+Shift+Z for Redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (canRedo()) {
                    redo();
                    toast.success('Redo');
                } else {
                    toast.info('Nothing to redo');
                }
                return;
            }

            // Delete / Backspace for Node Deletion
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                const selectedNode = nodes.find((n: any) => n.selected);
                if (selectedNode) {
                    setNodes(nodes.filter((n: any) => n.id !== selectedNode.id));
                    toast.success('Node deleted');
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo, nodes, setNodes]);
}
