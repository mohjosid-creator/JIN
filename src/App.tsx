/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CommandDeck } from './components/CommandDeck';
import { ArchitectureBlueprint } from './components/ArchitectureBlueprint';
import { PythonWorkerWorkbench } from './components/PythonWorkerWorkbench';
import { VectorMemoryInspector } from './components/VectorMemoryInspector';
import { AvatarThreeCanvas } from './components/AvatarThreeCanvas';
import { MetaWhatsAppHub } from './components/MetaWhatsAppHub';
import { MultiAiLocalEngineHub } from './components/MultiAiLocalEngineHub';
import { MultimediaPipelineHub } from './components/MultimediaPipelineHub';
import { EnterpriseDocsHub } from './components/EnterpriseDocsHub';
import { AgenticWorkflowHub } from './components/AgenticWorkflowHub';
import { LocalOfflineRagHub } from './components/LocalOfflineRagHub';
import { EnterpriseAddonsHub } from './components/EnterpriseAddonsHub';
import { DataAnalysisResult, AvatarState } from './types/jin';
import { Bot, Layers, Terminal, Database, Sparkles, CheckCircle2, Smartphone, ShieldCheck, Wifi, WifiOff, Cpu, Video, FileText, Network, Search, MoreHorizontal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'deck' | 'whatsapp' | 'multimedia' | 'docs' | 'workflows' | 'rag' | 'addons' | 'multiai' | 'avatar' | 'architecture' | 'python' | 'memory'
  >('deck');
  const [lastAnalysisResult, setLastAnalysisResult] = useState<DataAnalysisResult | null>(null);
  const [standaloneAvatarState, setStandaloneAvatarState] = useState<AvatarState>('IDLE');
  const [systemHealth, setSystemHealth] = useState<{ status: string; uptime: number } | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/jin/status')
      .then((res) => res.json())
      .then((data) => {
        setSystemHealth({
          status: data.status,
          uptime: data.uptimeSeconds,
        });
      })
      .catch((err) => {
        console.warn('Health check:', err);
      });

    fetch('/api/jin/ollama/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.offlineModeActive === 'boolean') {
          setIsOfflineMode(data.offlineModeActive);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleOfflineMode = async () => {
    const nextState = !isOfflineMode;
    setIsOfflineMode(nextState);
    try {
      await fetch('/api/jin/ollama/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offlineModeActive: nextState }),
      });
    } catch (e) {
      console.warn('Failed to sync offline mode:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 
        Top Bar Contract:
        Zone 1: Brand title, one line
        Zone 2: Navigation Links, clean single-line tabs
        Zone 3: Primary Action / Mode Switcher
      */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => setActiveTab('deck')}
            className="flex items-center gap-2 text-left group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-base font-bold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
              JIN v2.0 Enterprise
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('deck')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
                activeTab === 'deck' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Command Deck
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
                activeTab === 'whatsapp' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              WhatsApp & Meta
            </button>
            <button
              onClick={() => setActiveTab('multimedia')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
                activeTab === 'multimedia' ? 'text-rose-400 font-semibold' : ''
              }`}
            >
              Multimedia Pipeline
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
                activeTab === 'docs' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              Cloud Docs & Sheets
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
                activeTab === 'workflows' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Workflows (n8n)
            </button>
            <button
              onClick={() => setActiveTab('rag')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
                activeTab === 'rag' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Local RAG
            </button>
            <button
              onClick={() => setActiveTab('addons')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
                activeTab === 'addons' ? 'text-violet-400 font-semibold' : ''
              }`}
            >
              Enterprise AI
            </button>
            <button
              onClick={() => setActiveTab('multiai')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
                activeTab === 'multiai' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Multi-AI Hub
            </button>

            {/* Dropdown for Secondary Tools */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="hover:text-slate-100 transition-colors flex items-center gap-1 text-slate-400"
              >
                <span>Lainnya</span>
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {moreMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-1 z-50 text-xs"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <button
                    onClick={() => setActiveTab('avatar')}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400"
                  >
                    3D Avatar Visualizer
                  </button>
                  <button
                    onClick={() => setActiveTab('python')}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400"
                  >
                    Python analyzer.py
                  </button>
                  <button
                    onClick={() => setActiveTab('architecture')}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400"
                  >
                    Architecture Blueprint
                  </button>
                  <button
                    onClick={() => setActiveTab('memory')}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400"
                  >
                    Vector Memory (Pinecone)
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Primary Action / Mode Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOfflineMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                isOfflineMode
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-slate-100'
              }`}
              title="Klik untuk beralih mode online/offline"
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">OFFLINE (OLLAMA)</span>
                  <span className="sm:hidden">OFFLINE</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">MAS JOE · ONLINE</span>
                  <span className="sm:hidden">ONLINE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sub-navigation bar for quick scrolling tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs font-medium text-slate-400 overflow-x-auto no-scrollbar">
        {[
          { id: 'deck', label: 'Command Deck' },
          { id: 'whatsapp', label: 'WhatsApp & Meta' },
          { id: 'multimedia', label: 'Multimedia Pipeline' },
          { id: 'docs', label: 'Docs & Sheets' },
          { id: 'workflows', label: 'Workflows (n8n)' },
          { id: 'rag', label: 'Local Offline RAG' },
          { id: 'addons', label: 'Enterprise AI Suite' },
          { id: 'multiai', label: 'Multi-AI Hub' },
          { id: 'avatar', label: '3D Avatar' },
          { id: 'python', label: 'Python Worker' },
          { id: 'architecture', label: 'Blueprint' },
          { id: 'memory', label: 'Vector Memory' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
              activeTab === item.id
                ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800'
                : 'hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'deck' && (
          <CommandDeck
            onTriggerAnalysisView={() => setActiveTab('python')}
            onAnalysisResultReceived={(res) => setLastAnalysisResult(res)}
            onOpenWhatsAppHub={() => setActiveTab('whatsapp')}
            onOpenMultiAiHub={() => setActiveTab('multiai')}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={handleToggleOfflineMode}
          />
        )}

        {activeTab === 'whatsapp' && <MetaWhatsAppHub />}

        {activeTab === 'multimedia' && <MultimediaPipelineHub />}

        {activeTab === 'docs' && <EnterpriseDocsHub />}

        {activeTab === 'workflows' && <AgenticWorkflowHub />}

        {activeTab === 'rag' && <LocalOfflineRagHub />}

        {activeTab === 'addons' && <EnterpriseAddonsHub />}

        {activeTab === 'multiai' && (
          <MultiAiLocalEngineHub
            isOfflineMode={isOfflineMode}
            onOfflineModeToggle={(off) => setIsOfflineMode(off)}
          />
        )}

        {activeTab === 'avatar' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-cyan-400 mb-1">
                  INTERACTIVE THREE.JS AVATAR VIEWPORT
                </div>
                <h2 className="text-xl font-semibold text-slate-100">
                  Visualizer Siklus Hidup Hologram JIN
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Rendering 3D berbasis WebGL dengan 750 partikel quantum, rotasi sumbu jamak, dan interpolasi status mulus.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Current State:</span>
                <span className="px-2.5 py-1 text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  {standaloneAvatarState}
                </span>
              </div>
            </div>

            <div className="h-[550px] w-full rounded-xl overflow-hidden border border-slate-800">
              <AvatarThreeCanvas
                avatarState={standaloneAvatarState}
                onStateChangeRequested={(st) => setStandaloneAvatarState(st)}
                interactive={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-mono text-cyan-400 mb-1">EFEK VISUAL FADE-IN</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pada fase APPEARING, opasitas partikel naik dari 0 ke 1 dengan easing cubic-bezier, disusul ekspansi sangkar dodecahedron.
                </p>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-mono text-amber-400 mb-1">KOMPUTASI INTENSIF</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fase PROCESSING mempercepat rotasi partikel 3x lipat, memicu pusaran vorteks dan pergeseran spektrum warna ke amber.
                </p>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-mono text-rose-400 mb-1">EFEK VISUAL FADE-OUT</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fase DISAPPEARING mengolaps partikel ke inti singularitas sebelum mendekomposisi kanvas ke mode tidur (HIDDEN).
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && <ArchitectureBlueprint />}

        {activeTab === 'python' && (
          <PythonWorkerWorkbench
            onAnalysisComplete={(res) => setLastAnalysisResult(res)}
            onSendInsightToChat={(txt) => {
              setActiveTab('deck');
            }}
          />
        )}

        {activeTab === 'memory' && <VectorMemoryInspector />}
      </main>

      {/* Clean Single-Line Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">JIN System v2.0 Enterprise</span>
            <span>·</span>
            <span>Otoritas Pemilik: Mas Joe (@mohjosid)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Runway / ElevenLabs / Midjourney</span>
            <span>·</span>
            <span>Google & MS 365</span>
            <span>·</span>
            <span>n8n Webhook Bus</span>
            <span>·</span>
            <span>LanceDB Local RAG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
