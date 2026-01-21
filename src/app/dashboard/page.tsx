"use client";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { HistorySidebar } from "@/components/HistorySidebar";
import { ReactFlowProvider } from "reactflow";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen w-full bg-white text-slate-900">
      <ReactFlowProvider>
        <Header />
        <main className="flex-1 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 relative h-full">
            <WorkflowCanvas />
          </div>
          <HistorySidebar />
        </main>
      </ReactFlowProvider>
    </div>
  );
}
