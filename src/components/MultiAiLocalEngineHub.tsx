/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Terminal, Palette, Music, Workflow, Wifi, WifiOff, Play, CheckCircle2, ShieldCheck, Database, Plus, Search, ExternalLink, RefreshCw, Cpu, Layers } from 'lucide-react';
import { ExternalAiService, OllamaConfig, OfflineKnowledgeItem, AiTaskResult } from '../types/jin';

interface MultiAiLocalEngineHubProps {
  onOfflineModeToggle?: (isOffline: boolean) => void;
  isOfflineMode?: boolean;
}

export const MultiAiLocalEngineHub: React.FC<MultiAiLocalEngineHubProps> = ({
  onOfflineModeToggle,
  isOfflineMode = false,
}) => {
  const [services, setServices] = useState<ExternalAiService[]>([]);
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<OfflineKnowledgeItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('ollama');
  const [taskPrompt, setTaskPrompt] = useState('Buat ringkasan presentasi pitch deck arsitektur JIN untuk Mas Joe');
  const [taskResult, setTaskResult] = useState<AiTaskResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // New Knowledge Item Form
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [newKbTitle, setNewKbTitle] = useState('');
  const [newKbSummary, setNewKbSummary] = useState('');
  const [newKbContent, setNewKbContent] = useState('');
  const [newKbCategory, setNewKbCategory] = useState<'business_strategy' | 'technical_architecture' | 'client_qa' | 'workflow_automation'>('business_strategy');

  const [searchKnowledgeQuery, setSearchKnowledgeQuery] = useState('');

  const fetchIntegrations = async () => {
    try {
      const res = await fetch('/api/jin/integrations');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setOllamaConfig(data.offlineEngine || null);
      }
    } catch (err) {
      console.error('Fetch integrations error:', err);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const url = new URL('/api/jin/offline/knowledge', window.location.origin);
      if (searchKnowledgeQuery) url.searchParams.set('query', searchKnowledgeQuery);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setKnowledgeItems(data.results || []);
      }
    } catch (err) {
      console.error('Fetch knowledge error:', err);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    fetchKnowledge();
  }, [searchKnowledgeQuery]);

  const handleToggleOffline = async () => {
    const newOfflineState = !ollamaConfig?.offlineModeActive;
    try {
      const res = await fetch('/api/jin/ollama/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offlineModeActive: newOfflineState }),
      });
      if (res.ok) {
        setOllamaConfig((prev) => prev ? { ...prev, offlineModeActive: newOfflineState } : null);
        if (onOfflineModeToggle) onOfflineModeToggle(newOfflineState);
      }
    } catch (err) {
      console.error('Toggle offline error:', err);
    }
  };

  const handleModelChange = async (modelName: string) => {
    try {
      const res = await fetch('/api/jin/ollama/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedModel: modelName }),
      });
      if (res.ok) {
        setOllamaConfig((prev) => prev ? { ...prev, selectedModel: modelName } : null);
      }
    } catch (err) {
      console.error('Change model error:', err);
    }
  };

  const handleExecuteTask = async () => {
    if (!taskPrompt.trim() || isExecuting) return;

    setIsExecuting(true);
    try {
      const res = await fetch('/api/jin/integrations/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          prompt: taskPrompt,
        }),
      });

      if (res.ok) {
        const data: AiTaskResult = await res.json();
        setTaskResult(data);
      }
    } catch (err) {
      console.error('Execution task error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbTitle.trim() || !newKbContent.trim()) return;

    try {
      const res = await fetch('/api/jin/offline/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newKbTitle,
          summary: newKbSummary || newKbTitle,
          content: newKbContent,
          category: newKbCategory,
          tags: ['offline', 'local_cache', 'mas_joe'],
        }),
      });

      if (res.ok) {
        setNewKbTitle('');
        setNewKbSummary('');
        setNewKbContent('');
        setIsAddingKnowledge(false);
        fetchKnowledge();
      }
    } catch (err) {
      console.error('Add knowledge error:', err);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'terminal': return <Terminal className="w-5 h-5 text-amber-400" />;
      case 'palette': return <Palette className="w-5 h-5 text-cyan-400" />;
      case 'music': return <Music className="w-5 h-5 text-indigo-400" />;
      case 'workflow': return <Workflow className="w-5 h-5 text-emerald-400" />;
      default: return <Cpu className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Offline Engine Toggle Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <span>LOCAL LLM DATABASE & MULTI-AI ECOSYSTEM</span>
              <span>·</span>
              <span>OFFLINE RESILIENCE HUB</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Ollama Local Engine & Integrasi Multi-AI
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Memastikan JIN dapat beroperasi 100% offline saat internet terputus menggunakan model lokal Ollama dan basis data lokal,
              serta terhubung dengan Canva (Desain), Suno (Musik), dan Google Flow (Alur Kerja) untuk Mas Joe.
            </p>
          </div>

          {/* Mode Switcher Button (Online Cloud vs Offline Ollama) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOffline}
              className={`px-4 py-2 rounded-xl text-xs font-medium font-mono border transition-all flex items-center gap-2 ${
                ollamaConfig?.offlineModeActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-950/40'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/50'
              }`}
            >
              {ollamaConfig?.offlineModeActive ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>MODE OFFLINE AKTIF (OLLAMA ENGINE)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>MODE ONLINE (CLOUD GEMINI 3.8)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ollama Local Specs Bento Box */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 mb-1">LOCAL ENDPOINT</div>
            <div className="text-xs font-mono text-cyan-300">
              {ollamaConfig?.endpoint || 'http://localhost:11434'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 mb-1">ACTIVE LOCAL MODEL</div>
            <select
              value={ollamaConfig?.selectedModel || 'llama3.2:3b'}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full text-xs font-mono bg-slate-900 border border-slate-700 text-amber-300 rounded px-2 py-1 focus:outline-none"
            >
              {ollamaConfig?.modelsAvailable.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 mb-1">OFFLINE KNOWLEDGE CACHE</div>
            <div className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{knowledgeItems.length} Dokumen Offline Siap</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 mb-1">OTORITAS LOCAL OWNER</div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mas Joe (@mohjosid)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected AI Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Ekosistem AI Terintegrasi (Ollama, Canva, Suno, Google Flow)</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">4 LAYANAN TERHUBUNG</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {services.map((srv) => {
            const isSelected = selectedServiceId === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => {
                  setSelectedServiceId(srv.id);
                  if (srv.id === 'canva') setTaskPrompt('Buatkan template presentasi visual pitch deck strategi bisnis untuk Mas Joe');
                  if (srv.id === 'suno') setTaskPrompt('Generate soundtrack audio latar ambient futuristik bertempo 124 BPM untuk JIN');
                  if (srv.id === 'google_flow') setTaskPrompt('Sinkronkan data telemetri dan log WhatsApp ke Google Sheets & Drive');
                  if (srv.id === 'ollama') setTaskPrompt('Jalankan analisis lokal 100% offline terhadap aturan arsitektur JIN');
                }}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      {getServiceIcon(srv.iconType)}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      {srv.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200">{srv.name}</h4>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">{srv.category}</div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{srv.offlineSupport ? 'Offline Ready' : 'Cloud API'}</span>
                  <span className={isSelected ? 'text-cyan-400 font-semibold' : 'text-slate-400'}>
                    {isSelected ? 'Terpilih' : 'Pilih'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive AI Task Executor & Result Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Task Command Box */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Orkestrator Tugas AI ({selectedServiceId.toUpperCase()})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">COMMAND DISPATCHER</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                INSTRUKSI MAS JOE UNTUK {selectedServiceId.toUpperCase()}
              </label>
              <textarea
                rows={3}
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                placeholder="Ketik instruksi delegasi tugas AI..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleExecuteTask}
              disabled={isExecuting}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>JIN sedang mendelegasikan tugas ke {selectedServiceId}...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Eksekusi Tugas via {selectedServiceId.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Task Output Inspector */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono text-slate-400">OUTPUT EKSEKUSI TUGAS AI</span>
              <span className="text-[10px] font-mono text-emerald-400">
                {taskResult ? `${taskResult.status} · ${taskResult.timestamp}` : 'READY'}
              </span>
            </div>

            {taskResult ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{taskResult.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {taskResult.outputSummary}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-[11px] font-mono text-cyan-400">HASIL DETAIL (PAYLOAD):</div>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(taskResult.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Pilih layanan AI di atas lalu klik "Eksekusi Tugas" untuk melihat output generatif.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Delegasi otonom terverifikasi untuk Mas Joe</span>
            <span className="font-mono text-emerald-400">Low-Latency RPC</span>
          </div>
        </div>
      </div>

      {/* Offline Knowledge Database Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span>LOCAL OFFLINE KNOWLEDGE REPOSITORY</span>
              <span>·</span>
              <span>INDEXED RESILIENCE</span>
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Basis Data Pengetahuan Offline JIN
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Basis data lokal yang tersimpan di perangkat sehingga JIN dapat menjawab pertanyaan pekerjaan Mas Joe meskipun 100% offline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingKnowledge(!isAddingKnowledge)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pengetahuan Offline</span>
            </button>
          </div>
        </div>

        {/* Add Knowledge Modal / Form */}
        {isAddingKnowledge && (
          <form onSubmit={handleAddKnowledge} className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-200">
                Tambah Dokumen Pengetahuan Offline Baru
              </span>
              <button
                type="button"
                onClick={() => setIsAddingKnowledge(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">JUDUL TOPIK</label>
                <input
                  type="text"
                  value={newKbTitle}
                  onChange={(e) => setNewKbTitle(e.target.value)}
                  placeholder="Contoh: Prosedur Backup Database Mas Joe"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">KATEGORI</label>
                <select
                  value={newKbCategory}
                  onChange={(e) => setNewKbCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="business_strategy">business_strategy (Strategi Bisnis)</option>
                  <option value="technical_architecture">technical_architecture (Arsitektur Teknis)</option>
                  <option value="client_qa">client_qa (SOP Tanya Jawab Klien)</option>
                  <option value="workflow_automation">workflow_automation (Automasi Alur Kerja)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">KONTEN PENGETAHUAN LENGKAP (UNTUK JAWABAN OFFLINE)</label>
              <textarea
                rows={3}
                value={newKbContent}
                onChange={(e) => setNewKbContent(e.target.value)}
                placeholder="Tuliskan petunjuk kerja, jawaban, atau informasi detail yang dapat digunakan JIN saat offline..."
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg"
              >
                Simpan ke Basis Data Offline
              </button>
            </div>
          </form>
        )}

        {/* Search Knowledge Base */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKnowledgeQuery}
            onChange={(e) => setSearchKnowledgeQuery(e.target.value)}
            placeholder="Cari dalam basis data offline JIN..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Knowledge Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {knowledgeItems.map((item) => (
            <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-amber-400 font-semibold">{item.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {item.category.replace('_', ' ')}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {item.content}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Offline Verified</span>
                <span className="text-emerald-400">100% On-Device</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
