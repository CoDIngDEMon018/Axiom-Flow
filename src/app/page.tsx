import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Shield, Cpu } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg shadow-sm"></div>
            <span className="font-bold text-xl tracking-tight">Axiom Flow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-purple-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-20 pb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200 rounded-full blur-[128px] opacity-50"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200 rounded-full blur-[128px] opacity-50"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              v1.0 Now Available with Multi-Modal AI
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900">
              Build AI Workflows <br/> Visually.
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Drag, drop, and connect powerful AI models to automate complex tasks. 
              Process images, video, and text in parallel with zero infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-full hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/30 flex items-center gap-2 group"
                >
                  Start Building Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  View Demo
                </a>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="py-24 bg-gray-50">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-8">
                  <FeatureCard 
                    icon={<Zap className="text-amber-500" />}
                    title="Parallel Execution"
                    description="Run multiple AI tasks simultaneously. Crop images while summarizing text, then merge the results."
                  />
                  <FeatureCard 
                    icon={<Cpu className="text-blue-500" />}
                    title="Multi-Modal AI"
                    description="Native support for Gemini 1.5 Pro. Process text, images, and video frames in a single unified canvas."
                  />
                  <FeatureCard 
                    icon={<Shield className="text-green-500" />}
                    title="Enterprise Ready"
                    description="Secure authentication, persistent headers, and robust error handling built-in."
                  />
              </div>
           </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © 2026 Axiom Flow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}
