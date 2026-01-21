import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NodeCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    selected?: boolean;
    className?: string;
    color?: string;
    status?: 'idle' | 'running' | 'success' | 'failure';
}

export function NodeCard({ title, icon, children, selected, className, color = "bg-purple-500", status = 'idle' }: NodeCardProps) {
    return (
        <div className={cn(
            "rounded-xl border bg-white shadow-sm min-w-[300px] transition-all duration-300",
            selected ? "border-purple-500 shadow-md ring-1 ring-purple-100" : "border-gray-200 hover:border-gray-300",
            status === 'running' && "border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse",
            status === 'success' && "border-green-500 ring-2 ring-green-500/50",
            status === 'failure' && "border-red-500 ring-2 ring-red-500/50",
            className
        )}>
            <div className="flex items-center gap-2 p-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
                <div className={cn("p-1.5 rounded-md text-white shadow-sm", color)}>
                    {icon}
                </div>
                <span className="font-semibold text-sm text-gray-800">{title}</span>
                {status === 'running' && (
                    <span className="ml-auto flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                    </span>
                )}
            </div>
            <div className="p-3 nodrag cursor-default">
                {children}
            </div>
        </div>
    );
}
