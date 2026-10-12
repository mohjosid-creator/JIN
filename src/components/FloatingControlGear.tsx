/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  Terminal,
  Database,
  Smartphone,
  Video,
  FileText,
  Network,
  Search,
  Layers,
  X,
  Trash2,
  Bot,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Power,
  Key,
  Cpu,
  Activity
} from 'lucide-react';

export type AppTabType =
  | 'deck'
  | 'whatsapp'
  | 'multimedia'
  | 'docs'
  | 'workflows'
  | 'rag'
  | 'addons'
  | 'multiai'
  | 'avatar'
  | 'python'
  | 'architecture'
  | 'memory';

interface FloatingControlGearProps {
  activeTab: AppTabType;
  onSelectTab: (tab: AppTabType) => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onTriggerQuickPrompt?: (prompt: string) => void;
  onClearChat?: () => void;
  fastStreamingEnabled?: boolean;
  onToggleFastStreaming?: () => void;
  ttsEnabled?: boolean;
  onToggleTts?: () => void;
  ttsSpeed?: number;
  onChangeTtsSpeed?: (speed: number) => void;
}

export const FloatingControlGear: React.FC<FloatingControlGearProps> = ({
  activeTab,
  onSelectTab,
  isOfflineMode,
  onToggleOfflineMode,
  onTriggerQuickPrompt,
  onClearChat,
  fastStreamingEnabled = true,
  onToggleFastStreaming,
  ttsEnabled = true,
  onToggleTts,
  ttsSpeed = 1.05,
  onChangeTtsSpeed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoHidden, setIsAutoHidden] = useState(false);
  const [autoHideEnabled, setAutoHideEnabled] = useState(true);
  const [activeMenuSection, setActiveMenuSection] = useState<'modules' | 'system' | 'shortcuts' | 'authority'>('modules');

  // Master Authority State (Mas Joe & 'tanyabos')
  const [passcodeInput, setPasscodeInput] = useState('tanyabos');
  const [aiPowerState, setAiPowerState] = useState<'ONLINE' | 'STANDBY' | 'DEACTIVATED'>('ONLINE');
  const [powerFeedback, setPowerFeedback] = useState<string | null>(null);

  // Position state (Draggable)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('jin_floating_gear_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return {
      x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 88) : 800,
      y: typeof window !== 'undefined' ? Math.max(20, window.innerHeight - 110) : 600,
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
  });

  const idleTimerRef = useRef<any>(null);
  const gearRef = useRef<HTMLDivElement>(null);

  // Fetch power state on mount
  useEffect(() => {
    fetch('/api/jin/power-state')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.state) {
          setAiPowerState(data.state);
        }
      })
      .catch(() => {});
  }, []);

  const handleExecutePower = async (action: 'STARTUP' | 'SHUTDOWN') => {
    try {
      const res = await fetch('/api/jin/power-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, passcode: passcodeInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiPowerState(data.state);
        setPowerFeedback(data.message);
      } else {
        setPowerFeedback(data.error || 'Akses ditolak.');
      }
    } catch {
      setPowerFeedback('Gagal menghubungi security kernel.');
    }
    setTimeout(() => setPowerFeedback(null), 6000);
  };

  // Auto-hide idle timer management
  const resetIdleTimer = () => {
    setIsAutoHidden(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (autoHideEnabled && !isOpen) {
      idleTimerRef.current = setTimeout(() => {
        setIsAutoHidden(true);
      }, 3500);
    }
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [autoHideEnabled, isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('jin_floating_gear_pos', JSON.stringify(position));
    } catch {}
  }, [position]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(16, prev.x), window.innerWidth - 76),
        y: Math.min(Math.max(16, prev.y), window.innerHeight - 76),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    resetIdleTimer();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.moved = true;
    }

    const newX = Math.min(Math.max(16, dragStartRef.current.initialX + dx), window.innerWidth - 76);
    const newY = Math.min(Math.max(16, dragStartRef.current.initialY + dy), window.innerHeight - 76);

    setPosition({ x: newX, y: newY });
    resetIdleTimer();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    if (!dragStartRef.current.moved) {
      setIsOpen((prev) => !prev);
    }
    resetIdleTimer();
  };

  const handleResetPosition = () => {
    setPosition({
      x: Math.max(20, window.innerWidth - 88),
      y: Math.max(20, window.innerHeight - 110),
    });
  };

  const modulesList: { id: AppTabType; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'deck', label: 'Command Deck', icon: Terminal, color: 'text-cyan-400', desc: 'Avatar 3D, Chat, Audio Streaming & Telemetri' },
    { id: 'whatsapp', label: 'WhatsApp & Meta', icon: Smartphone, color: 'text-emerald-400', desc: 'Gateway Meta Cloud API, Auto-Reply & Broadcast' },
    { id: 'multimedia', label: 'Multimedia Pipeline', icon: Video, color: 'text-rose-400', desc: 'Runway Gen-3, ElevenLabs & Midjourney DAG' },
    { id: 'docs', label: 'Docs & Sheets', icon: FileText, color: 'text-emerald-300', desc: 'Google Workspace & MS 365 Synthesizer' },
    { id: 'workflows', label: 'Workflows (n8n)', icon: Network, color: 'text-indigo-400', desc: 'Automasi Webhook, Event Bus & Redlock' },
    { id: 'rag', label: 'Local Offline RAG', icon: Search, color: 'text-cyan-300', desc: 'LanceDB Hybrid Search & On-Prem Embeddings' },
    { id: 'addons', label: 'Enterprise AI Suite', icon: Sparkles, color: 'text-violet-400', desc: 'Canva Connect, Suno v3, SAP & CRM Engine' },
    { id: 'multiai', label: 'Multi-AI Hub', icon: Bot, color: 'text-amber-400', desc: 'Ollama Offline, Model Registry & Token Bucket' },
    { id: 'avatar', label: '3D Hologram Avatar', icon: Radio, color: 'text-cyan-400', desc: 'Visualizer Three.js WebGL 750 Partikel Quantum' },
    { id: 'python', label: 'Python Worker', icon: Sliders, color: 'text-amber-300', desc: 'analyzer.py, Pandas Data Pipeline & Outliers' },
    { id: 'architecture', label: 'Blueprint Sistem', icon: Layers, color: 'text-blue-400', desc: 'Spesifikasi Arsitektur Distributed JIN v2.0' },
    { id: 'memory', label: 'Vector Memory', icon: Database, color: 'text-purple-400', desc: 'Pinecone Semantic Memory & Otoritas Mas Joe' },
  ];

  const quickPrompts = [
    { title: 'Status & Neural Fabric', prompt: 'Halo JIN, periksa kesiapan seluruh subsistem dan laporkan status terkini.' },
    { title: 'Jalankan analyzer.py (Pandas)', prompt: 'Analisis dataset telemetri sensor IoT menggunakan Pandas dan tampilkan anomali.' },
    { title: 'Sintesis Video Runway Gen-3', prompt: 'Rancang pipeline pembentukan video eksekutif dengan Runway Gen-3 dan suara ElevenLabs.' },
    { title: 'Ekspor Google Sheets (NPV/CAGR)', prompt: 'Siapkan batch spreadsheet keuangan Q1 dengan rumus NPV dan CAGR ke Google Sheets.' },
    { title: 'Canva AI Pitch Deck', prompt: 'Canva AI: Buat template presentasi pitch deck' },
    { title: 'Suno AI Soundtrack', prompt: 'Suno AI: Komposisi musik latar avatar JIN' },
    { title: 'Matikan AI (tanyabos)', prompt: 'Matikan AI JIN tanyabos' },
    { title: 'Hidupkan AI (tanyabos)', prompt: 'Hidupkan kembali AI JIN tanyabos' },
  ];

  const neuralFabricModels = [
    { name: 'DeepSeek V4.1 Flash', role: 'Analytical Reasoning & Code DAGs', latency: '< 50ms', badge: 'Ultra-Fast' },
    { name: 'Qwen 2.5 / 3.5 Math', role: 'Pandas Tensor Engine & Calculations', latency: '65ms', badge: 'Math' },
    { name: 'Gemma 4 Edge Cognitive', role: 'Low-Power Edge Device & Offline', latency: '35ms', badge: 'Edge/Local' },
    { name: 'GLM 5.2 / 5.3 MiniAX', role: 'Enterprise Docs, ISO 27001 & Sheets', latency: '80ms', badge: 'Docs/Gov' },
    { name: 'Llama 3.3 Generative', role: 'Creative Runway DAG & Soundtracks', latency: '85ms', badge: 'Creative' },
    { name: 'Gemini 3.8 Flash Cloud', role: 'Cloud Multimodal Ingestion Gateway', latency: '110ms', badge: 'Cloud Core' },
  ];

  return (
    <>
      {/* 
        FLOATING DRAGGABLE GEAR BUTTON
      */}
      <div
        ref={gearRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        onMouseEnter={resetIdleTimer}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
        }}
        className={`fixed z-[9999] select-none cursor-grab active:cursor-grabbing transition-opacity duration-300 ${
          isAutoHidden && !isOpen ? 'opacity-35 hover:opacity-100 scale-90 hover:scale-100' : 'opacity-100 scale-100'
        }`}
        title="Klik untuk membuka Kontrol Terpusat JIN (Tahan & geser untuk memindahkan posisi)"
      >
        <div className="relative group">
          <div
            className={`absolute -inset-1 rounded-full blur-md transition-all duration-300 ${
              isOpen
                ? 'bg-gradient-to-r from-cyan-500 to-amber-500 opacity-80 animate-pulse'
                : aiPowerState === 'DEACTIVATED'
                ? 'bg-rose-500/50 opacity-70'
                : isOfflineMode
                ? 'bg-amber-500/50 opacity-60'
                : 'bg-cyan-500/50 opacity-60 group-hover:opacity-100 group-hover:blur-lg'
            }`}
          />

          <button
            type="button"
            className={`relative w-14 h-14 rounded-full flex items-center justify-center border shadow-2xl backdrop-blur-xl transition-all duration-200 ${
              isOpen
                ? 'bg-slate-900 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/50'
                : aiPowerState === 'DEACTIVATED'
                ? 'bg-slate-950/90 border-rose-600/80 text-rose-300 hover:border-rose-400'
                : isOfflineMode
                ? 'bg-slate-950/90 border-amber-600/80 text-amber-300 hover:border-amber-400'
                : 'bg-slate-950/90 border-slate-700/80 text-cyan-400 hover:border-cyan-400 hover:text-cyan-200'
            }`}
          >
            {isOpen ? (
              <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
            ) : (
              <Settings
                className={`w-6 h-6 transition-transform duration-700 ${
                  isDragging ? 'rotate-180' : 'group-hover:rotate-90'
                }`}
              />
            )}

            <span
              className={`absolute top-1.5 right-1.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                aiPowerState === 'DEACTIVATED'
                  ? 'bg-rose-500'
                  : isOfflineMode
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-400 animate-ping-slow'
              }`}
            />
          </button>

          {!isOpen && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-[10px] font-mono text-slate-300 px-2 py-0.5 rounded border border-slate-800 whitespace-nowrap pointer-events-none shadow-lg">
              GESER / KLIK MENU
            </div>
          )}
        </div>
      </div>

      {/* 
        MASTER UNIFIED CONTROL DECK MODAL
      */}
      {isOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <Settings className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span>Pusat Kendali JIN v2.0 Enterprise</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      MASTER HUD
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        aiPowerState === 'ONLINE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      AI: {aiPowerState}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Otoritas Penuh: <span className="text-emerald-400 font-semibold">Mas Joe (@mohjosid)</span> · Passcode:{' '}
                    <span className="font-mono text-amber-300">tanyabos</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetPosition}
                  title="Kembalikan icon gear ke posisi awal sudut kanan bawah"
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Posisi</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
                  title="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Header Section Switcher */}
            <div className="px-6 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveMenuSection('modules')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  activeMenuSection === 'modules'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Navigasi Seluruh Modul (12)</span>
              </button>

              <button
                onClick={() => setActiveMenuSection('shortcuts')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  activeMenuSection === 'shortcuts'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Perintah Cepat Mas Joe</span>
              </button>

              <button
                onClick={() => setActiveMenuSection('authority')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  activeMenuSection === 'authority'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Otoritas Daya (tanyabos)</span>
              </button>

              <button
                onClick={() => setActiveMenuSection('system')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  activeMenuSection === 'system'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Kontrol Sistem & Suara</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SECTION 1: ALL MODULES (12 APPS) */}
              {activeMenuSection === 'modules' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      PILIH MODUL TAMPILAN
                    </span>
                    <span className="text-xs text-slate-400">
                      Aktif: <span className="font-semibold text-slate-200">{modulesList.find(m => m.id === activeTab)?.label}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {modulesList.map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectTab(item.id);
                            setIsOpen(false);
                          }}
                          className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 group ${
                            isSelected
                              ? 'bg-cyan-950/70 border-cyan-500 text-slate-100 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500'
                              : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-cyan-900/80 border-cyan-400 text-cyan-300'
                                : 'bg-slate-900 border-slate-800 group-hover:border-slate-700 ' + item.color
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-semibold truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                                {item.label}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: PERINTAH CEPAT MAS JOE */}
              {activeMenuSection === 'shortcuts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                      AKSES CEPAT INSTRUKSI MAS JOE (LATENSI &lt; 50MS)
                    </span>
                    <span className="text-xs text-slate-400">
                      Eksekusi instan terhubung ke Neural Fabric Router
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectTab('deck');
                          if (onTriggerQuickPrompt) {
                            onTriggerQuickPrompt(qp.prompt);
                          }
                          setIsOpen(false);
                        }}
                        className="text-left p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-600/70 rounded-xl transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                            <Play className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                            {qp.title}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                            INSTAN &lt;50ms
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
                          "{qp.prompt}"
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: OTORITAS DAYA MAS JOE & NEURAL FABRIC MATRIX */}
              {activeMenuSection === 'authority' && (
                <div className="space-y-6">
                  {/* Master Power Control Box */}
                  <div className="p-5 bg-slate-950/80 border border-rose-800/60 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-100">
                            KONTROL DAYA TERTINGGI MAS JOE
                          </h4>
                          <p className="text-xs text-slate-400">
                            Hanya Mas Joe yang memiliki hak akses penuh dengan kode <span className="font-mono text-amber-300 font-bold">"tanyabos"</span> untuk menghidupkan dan mematikan AI.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">Status Daya:</span>
                        <span
                          className={`px-3 py-1 text-xs font-mono font-bold rounded border ${
                            aiPowerState === 'ONLINE'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-rose-950 text-rose-300 border-rose-700'
                          }`}
                        >
                          {aiPowerState}
                        </span>
                      </div>
                    </div>

                    {/* Passcode input & actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <div className="relative flex-1 w-full">
                        <Key className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={passcodeInput}
                          onChange={(e) => setPasscodeInput(e.target.value)}
                          placeholder="Masukkan kode otorisasi: tanyabos"
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleExecutePower('STARTUP')}
                          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Hidupkan AI</span>
                        </button>
                        <button
                          onClick={() => handleExecutePower('SHUTDOWN')}
                          className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Matikan AI</span>
                        </button>
                      </div>
                    </div>

                    {powerFeedback && (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200">
                        {powerFeedback}
                      </div>
                    )}
                  </div>

                  {/* Neural Fabric Micro-Agents Matrix */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                        PLANETARY-SCALE HETEROGENEOUS NEURAL FABRIC
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SINKRONISASI AKTIF</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {neuralFabricModels.map((m, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200">{m.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{m.role}</p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                            <span>SLA P99 Latency:</span>
                            <span className="text-emerald-400 font-semibold">{m.latency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: SYSTEM CONTROLS & VOICE SETTINGS */}
              {activeMenuSection === 'system' && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
                    <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                      STATUS KONEKSI & ENGINE STREAMING
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          {isOfflineMode ? (
                            <WifiOff className="w-5 h-5 text-amber-400" />
                          ) : (
                            <Wifi className="w-5 h-5 text-emerald-400" />
                          )}
                          <div>
                            <div className="text-sm font-semibold">
                              {isOfflineMode ? 'Mode Offline (Gemma/Ollama)' : 'Mode Online (Neural Fabric)'}
                            </div>
                            <div className="text-xs text-slate-400">
                              {isOfflineMode ? 'Menggunakan basis data lokal' : 'DeepSeek · Gemma · GLM · Llama · Qwen'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={onToggleOfflineMode}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            isOfflineMode
                              ? 'bg-amber-950 text-amber-300 border-amber-700 hover:bg-amber-900'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                          }`}
                        >
                          {isOfflineMode ? 'Aktifkan Online' : 'Beralih Offline'}
                        </button>
                      </div>

                      {onToggleFastStreaming && (
                        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-cyan-400" />
                            <div>
                              <div className="text-sm font-semibold">Fast Streaming (Turbo)</div>
                              <div className="text-xs text-slate-400">Aliran chunk kata real-time instan</div>
                            </div>
                          </div>

                          <button
                            onClick={onToggleFastStreaming}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                              fastStreamingEnabled
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {fastStreamingEnabled ? 'AKTIF (TURBO)' : 'NONAKTIF'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      PENGATURAN SUARA & RESPON CEPAT AVATAR
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {onToggleTts && (
                        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            {ttsEnabled ? (
                              <Volume2 className="w-5 h-5 text-cyan-400" />
                            ) : (
                              <VolumeX className="w-5 h-5 text-slate-500" />
                            )}
                            <div>
                              <div className="text-sm font-semibold">Suara Avatar (TTS)</div>
                              <div className="text-xs text-slate-400">
                                {ttsEnabled ? 'Vokalisasi kalimat instan aktif' : 'Suara dimatikan (mode hening)'}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={onToggleTts}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                              ttsEnabled
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {ttsEnabled ? 'SUARA ON' : 'MUTE'}
                          </button>
                        </div>
                      )}

                      {onChangeTtsSpeed && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Kecepatan Bicara Suara</span>
                            <span className="text-xs font-mono text-cyan-300">{ttsSpeed.toFixed(2)}x</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {[0.95, 1.05, 1.2, 1.35].map((spd) => (
                              <button
                                key={spd}
                                onClick={() => onChangeTtsSpeed(spd)}
                                className={`flex-1 py-1 text-xs rounded border transition-colors ${
                                  Math.abs(ttsSpeed - spd) < 0.04
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-semibold'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                                }`}
                              >
                                {spd}x {spd === 1.05 ? '(Normal)' : spd > 1.2 ? '(Turbo)' : ''}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
                    <h4 className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                      PERILAKU TOMBOL GEAR & SESI CHAT
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          {autoHideEnabled ? (
                            <EyeOff className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-slate-400" />
                          )}
                          <div>
                            <div className="text-sm font-semibold">Fitur Auto-Hide Gear</div>
                            <div className="text-xs text-slate-400">
                              {autoHideEnabled ? 'Otomatis samar/redup saat diam' : 'Selalu terlihat penuh'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setAutoHideEnabled(!autoHideEnabled)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            autoHideEnabled
                              ? 'bg-purple-950 text-purple-300 border-purple-700'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {autoHideEnabled ? 'AUTO-HIDE ON' : 'PINNED'}
                        </button>
                      </div>

                      {onClearChat && (
                        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-rose-400" />
                            <div>
                              <div className="text-sm font-semibold">Bersihkan Sesi Chat</div>
                              <div className="text-xs text-slate-400">Hapus riwayat percakapan Command Deck</div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onClearChat();
                              setIsOpen(false);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors"
                          >
                            Bersihkan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">Otoritas Mas Joe (@mohjosid)</span>
                <span>·</span>
                <span className="font-mono text-cyan-400">Floating Gear HUD v2.0</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">Tip: Tahan & geser icon gear untuk menempatkannya di mana saja di layar</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Tutup (ESC)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
