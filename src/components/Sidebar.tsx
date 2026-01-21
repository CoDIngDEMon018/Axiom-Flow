"use client";

import { useState } from "react";
import {
    Type,
    Image as ImageIcon,
    Video,
    Sparkles,
    Crop,
    ScanLine,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const nodeTypes = [
    { type: 'textNode', label: 'Text', icon: Type },
    { type: 'uploadImageNode', label: 'Upload Image', icon: ImageIcon },
    { type: 'uploadVideoNode', label: 'Upload Video', icon: Video },
    { type: 'llmNode', label: 'Run Any LLM', icon: Sparkles },
    { type: 'cropNode', label: 'Crop Image', icon: Crop },
    { type: 'extractNode', label: 'Extract Frame', icon: ScanLine },
];

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside
            className={cn(
                "border-r border-gray-200 bg-white transition-all duration-300 flex flex-col relative",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="relative w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Search nodes..."
                            className="w-full pl-8 pr-4 py-2 bg-gray-50 rounded-md text-sm border-none focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">Quick Access</h3>}

                <div className="space-y-2">
                    {nodeTypes.map((item) => (
                        <div
                            key={item.type}
                            onDragStart={(event) => onDragStart(event, item.type)}
                            draggable
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg cursor-grab hover:bg-purple-50 hover:text-purple-700 transition-colors border border-transparent hover:border-purple-100",
                                isCollapsed ? "justify-center" : ""
                            )}
                        >
                            <item.icon size={20} className="text-gray-600 group-hover:text-purple-600" />
                            {!isCollapsed && <span className="text-sm font-medium text-gray-700">{item.label}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
