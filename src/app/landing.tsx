'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Layers, Play } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (isSignedIn) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg shadow-lg"></div>
            <span className="text-xl font-bold text-white">Axiom Flow</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/sign-in')}
              className="px-6 py-2 text-sm font-medium text-slate-200 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/sign-up')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Build AI Workflows<br />Visually
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Create complex LLM workflows with a drag-and-drop canvas. Process images, videos, and text with Google Gemini AI.
          </p>
          <button
            onClick={() => router.push('/sign-up')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Start Building <ArrowRight size={20} />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500/50 transition">
            <Layers className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Drag & Drop Canvas</h3>
            <p className="text-slate-400">
              Build workflows visually with 6 node types: Text, Image Upload, Video Upload, LLM, Crop, and Extract Frame.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500/50 transition">
            <Zap className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered</h3>
            <p className="text-slate-400">
              Integrate Google Gemini AI for multimodal understanding of text and images in your workflows.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500/50 transition">
            <Play className="w-12 h-12 text-pink-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Parallel Execution</h3>
            <p className="text-slate-400">
              Run independent workflow branches simultaneously. See real-time execution with pulsating animations.
            </p>
          </div>
        </div>

        {/* Screenshot Preview */}
        <div className="mt-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 p-4">
          <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-4">
                <Play className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-slate-400">Sign in to see the workflow builder in action</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-t border-slate-700 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to build?</h2>
          <p className="text-slate-300 mb-8">Start creating your first AI workflow in seconds</p>
          <button
            onClick={() => router.push('/sign-up')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-lg"
          >
            Create Free Account <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>© 2026 Axiom Flow. Built with Next.js, React Flow, and Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
