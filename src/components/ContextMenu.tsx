import { Play, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface ContextMenuProps {
    x: number;
    y: number;
    onRun: () => void;
    onDelete: () => void;
    onClose: () => void;
}

export function ContextMenu({ x, y, onRun, onDelete, onClose }: ContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-100 py-1 w-48 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: y, left: x }}
        >
            <button
                onClick={onRun}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-colors"
            >
                <Play size={14} />
                Run This Node Only
            </button>
            <div className="h-[1px] bg-gray-100 my-1"></div>
            <button
                onClick={onDelete}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
                <Trash2 size={14} />
                Delete Node
            </button>
        </div>
    );
}
