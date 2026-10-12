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
import { FloatingControlGear, AppTabType } from './components/FloatingControlGear';
import { DataAnalysisResult, AvatarState } from './types/jin';
import {
  Wifi,
  WifiOff,
  Settings,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
  Terminal,
  Smartphone,
  Video,
  FileText,
  Network,
  Search,
  Bot
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTabType>('deck');
  const [lastAnalysisResult, setLastAnalysisResult] = useState<DataAnalysisResult | null>(null);
  const [standaloneAvatarState, setStandaloneAvatarState] = useState<AvatarState>('IDLE');
  const [systemHealth, setSystemHealth] = useState<{ status: string; uptime: number } | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [fastStreamingEnabled, setFastStreamingEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsSpeed, setTtsSpeed] = useState(1.1);
  const [quickPromptToTrigger, setQuickPromptToTrigger] = useState<string | null>(null);
  const [clearChatTrigger, setClearChatTrigger] = useState<number>(0);

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

  // Human-readable titles for active tab
  const tabTitles: Record<AppTabType, { name: string; tag: string; icon: any }> = {
    deck: { name: 'Command Deck', tag: 'AVATAR 3D & CORE AI', icon: Terminal },
    whatsapp: { name: 'WhatsApp & Meta Hub', tag: 'CLOUD API GATEWAY', icon: Smartphone },
    multimedia: { name: 'Multimedia Pipeline', tag: 'RUNWAY · ELEVENLABS · MIDJOURNEY', icon: Video },
    docs: { name: 'Cloud Docs & Sheets', tag: 'GOOGLE WORKSPACE & MS 365', icon: FileText },
    workflows: { name: 'Workflows (n8n)', tag: 'DISTRIBUTED EVENT BUS', icon: Network },
    rag: { name: 'Local Offline RAG', tag: 'LANCEDB VECTOR ENGINE', icon: Search },
    addons: { name: 'Enterprise AI Suite', tag: 'CANVA · SUNO · SAP INTEGRATIONS', icon: Sparkles },
    multiai: { name: 'Multi-AI Hub', tag: 'OLLAMA ON-PREM & REGISTRY', icon: Bot },
    avatar: { name: '3D Hologram Avatar', tag: 'THREE.JS 750 QUANTUM PARTICLES', icon: Activity },
    python: { name: 'Python Worker Workbench', tag: 'analyzer.py PANDAS PIPELINE', icon: Terminal },
    architecture: { name: 'Architecture Blueprint', tag: 'DISTRIBUTED SYSTEMS SPEC', icon: Layers },
    memory: { name: 'Vector Memory Inspector', tag: 'PINECONE SEMANTIC STORE', icon: ShieldCheck },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.deck;
  const ActiveIcon = currentTabInfo.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* 
        FLOATING DRAGGABLE AUTO-HIDE GEAR BUTTON & UNIFIED MASTER HUD
        All navigation buttons, view switches, system modes, fast streaming,
        voice TTS controls, reset and quick prompts are consolidated here!
      */}
      <FloatingControlGear
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={handleToggleOfflineMode}
        onTriggerQuickPrompt={(prompt) => {
          setActiveTab('deck');
          setQuickPromptToTrigger(prompt);
        }}
        onClearChat={() => setClearChatTrigger(Date.now())}
        fastStreamingEnabled={fastStreamingEnabled}
        onToggleFastStreaming={() => setFastStreamingEnabled(!fastStreamingEnabled)}
        ttsEnabled={ttsEnabled}
        onToggleTts={() => setTtsEnabled(!ttsEnabled)}
        ttsSpeed={ttsSpeed}
        onChangeTtsSpeed={(spd) => setTtsSpeed(spd)}
      />

      {/* 
        Sleek Minimal Top Navigation Bar
        Keeps the viewport clean, futuristic, and distraction-free.
      */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark & Owner Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('deck')}
              className="flex items-center gap-2.5 text-left group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
              <span className="text-base font-bold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
                JIN v2.0 Enterprise
              </span>
            </button>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
              <ShieldCheck className="w-3 h-3" />
              <span>MAS JOE</span>
            </span>
          </div>

          {/* Current Active View Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
            <ActiveIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200">{currentTabInfo.name}</span>
            <span className="hidden md:inline text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/50">
              {currentTabInfo.tag}
            </span>
          </div>

          {/* Connection Status & Floating Gear Hint */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleOfflineMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
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

            {/* Quick Gear Callout for Discovery */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 rounded-lg"
              title="Semua tombol navigasi, suara, dan kontrol sistem disatukan dalam icon gear melayang"
            >
              <Settings className="w-3.5 h-3.5 animate-spin-slow text-cyan-400" />
              <span>Semua Tombol di Gear ⚙️</span>
            </div>
          </div>
        </div>
      </header>

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
            fastStreamingEnabled={fastStreamingEnabled}
            onToggleFastStreaming={() => setFastStreamingEnabled(!fastStreamingEnabled)}
            ttsEnabled={ttsEnabled}
            onToggleTts={() => setTtsEnabled(!ttsEnabled)}
            ttsSpeed={ttsSpeed}
            onChangeTtsSpeed={(spd) => setTtsSpeed(spd)}
            externalPrompt={quickPromptToTrigger}
            onClearExternalPrompt={() => setQuickPromptToTrigger(null)}
            clearTrigger={clearChatTrigger}
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
            onSendInsightToChat={() => {
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
            <span>Semua Tombol Terpadu di Icon Gear Melayang</span>
            <span>·</span>
            <span>Respon Cepat Voice & Chat Aktif</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
