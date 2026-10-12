/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Terminal, Activity, ArrowRight, CornerDownLeft, AlertCircle, Bot, User, Smartphone, ShieldCheck, Zap, Maximize2, Minimize2, Compass, Layout, Layers, Tv } from 'lucide-react';
import { AvatarThreeCanvas } from './AvatarThreeCanvas';
import { AudioSpeechController } from './AudioSpeechController';
import { AvatarState, ChatMessage, PipelineLog, DataAnalysisResult, CommandDeckViewMode } from '../types/jin';

interface CommandDeckProps {
  onTriggerAnalysisView: () => void;
  onAnalysisResultReceived: (res: DataAnalysisResult) => void;
  onOpenWhatsAppHub?: () => void;
  onOpenMultiAiHub?: () => void;
  isOfflineMode?: boolean;
  onToggleOfflineMode?: () => void;
  fastStreamingEnabled?: boolean;
  onToggleFastStreaming?: () => void;
  ttsEnabled?: boolean;
  onToggleTts?: () => void;
  ttsSpeed?: number;
  onChangeTtsSpeed?: (speed: number) => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
  clearTrigger?: number;
}

export const CommandDeck: React.FC<CommandDeckProps> = ({
  onTriggerAnalysisView,
  onAnalysisResultReceived,
  onOpenWhatsAppHub,
  onOpenMultiAiHub,
  isOfflineMode = false,
  onToggleOfflineMode,
  fastStreamingEnabled = true,
  onToggleFastStreaming,
  ttsEnabled = true,
  onToggleTts,
  ttsSpeed = 1.1,
  onChangeTtsSpeed,
  externalPrompt,
  onClearExternalPrompt,
  clearTrigger,
}) => {
  const [viewMode, setViewMode] = useState<CommandDeckViewMode>('standard_split');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'agent',
      text: 'Halo Mas Joe! JIN (Intelligent Network Agent v2.0 Enterprise) online dan siap menerima instruksi Anda. Seluruh modul aktif: Avatar Holografis 3D Three.js, Node.js Orchestrator, Core AI Gemini 3.8 Flash, Meta & WhatsApp Gateway, dan Python Worker analyzer.py. Silakan berikan arahan melalui mikrofon suara atau teks.',
      timestamp: new Date().toLocaleTimeString(),
      avatarState: 'IDLE',
      thoughtProcess: 'Otoritas Mas Joe terkonfirmasi. State avatar disetel ke IDLE, sistem streaming aktif.',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [avatarState, setAvatarState] = useState<AvatarState>('IDLE');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speechText, setSpeechText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [useFastStreaming, setUseFastStreaming] = useState(true);

  const [pipelineLogs, setPipelineLogs] = useState<PipelineLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      stage: 'GATEWAY',
      message: 'Node.js Express orchestrator online (Port 3000)',
      level: 'success',
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      stage: 'AVATAR_SYNC',
      message: 'Three.js 3D Hologram v2.0 termuat dengan 750 partikel quantum',
      level: 'info',
    },
    {
      id: 'log-3',
      timestamp: new Date().toLocaleTimeString(),
      stage: 'VECTOR_DB',
      message: 'Konteks otoritas Mas Joe (@mohjosid) sinkron di Vector Memory',
      level: 'success',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pipelineLogs]);

  // Synchronize fast streaming prop
  useEffect(() => {
    if (typeof fastStreamingEnabled === 'boolean') {
      setUseFastStreaming(fastStreamingEnabled);
    }
  }, [fastStreamingEnabled]);

  // Handle external quick prompt from Floating Gear HUD
  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(externalPrompt);
      onClearExternalPrompt?.();
    }
  }, [externalPrompt]);

  // Handle clear chat signal from Floating Gear HUD
  useEffect(() => {
    if (clearTrigger) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: 'agent',
          text: 'Halo Mas Joe! Riwayat percakapan telah dibersihkan. JIN v2.0 siap menerima instruksi baru.',
          timestamp: new Date().toLocaleTimeString(),
          avatarState: 'IDLE',
          thoughtProcess: 'Sesi di-reset atas perintah Mas Joe.',
        },
      ]);
      setAvatarState('IDLE');
    }
  }, [clearTrigger]);

  const addLog = (stage: PipelineLog['stage'], message: string, level: PipelineLog['level'] = 'info', durationMs?: number) => {
    setPipelineLogs((prev) => [
      ...prev.slice(-9),
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        stage,
        message,
        level,
        durationMs,
      },
    ]);
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputText;
    if (!textToSend.trim()) return;

    // If an external prompt was dispatched or user sends a new instruction, cancel any ongoing speech
    if (customMessage) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsProcessing(false);
    } else if (isProcessing) {
      return;
    }

    setInputText('');
    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString();

    // 1. Add User Message
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text: textToSend,
        timestamp: userTimestamp,
      },
    ]);

    setIsProcessing(true);

    const isMasterAuth = textToSend.toLowerCase().includes('tanyabos');
    const passcodeToSend = isMasterAuth ? 'tanyabos' : undefined;

    // Dynamic Avatar Lifecycle: LISTENING -> PROCESSING
    setAvatarState('PROCESSING');
    addLog('GATEWAY', `Menerima instruksi Mas Joe: "${textToSend.slice(0, 42)}..."`, 'info');
    addLog('AVATAR_SYNC', 'Transisi status avatar ke PROCESSING (vorteks komputasi)', 'info');

    const startTime = Date.now();
    const agentMsgId = `agent-${Date.now()}`;

    if (useFastStreaming) {
      // ----------------------------------------------------------------------
      // FAST STREAMING SSE CLIENT
      // ----------------------------------------------------------------------
      try {
        addLog('LLM_INFERENCE', 'Membuka streaming real-time ke Neural Fabric Router...', 'info');

        // Create empty placeholder message for agent
        setMessages((prev) => [
          ...prev,
          {
            id: agentMsgId,
            role: 'agent',
            text: '',
            timestamp: new Date().toLocaleTimeString(),
            avatarState: 'SPEAKING',
            isStreaming: true,
          },
        ]);
        setStreamingMessageId(agentMsgId);

        const response = await fetch('/api/jin/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: textToSend, offlineMode: isOfflineMode, passcode: passcodeToSend }),
        });

        if (!response.ok || !response.body) throw new Error('Streaming connection failed');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let speechBuffer = '';
        let hasSpokenFirstSentence = false;
        let isAnalysisTriggered = false;

        setAvatarState('SPEAKING');
        addLog('AVATAR_SYNC', 'Transisi status avatar ke SPEAKING (aliran suara real-time)', 'info');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const rawChunk = decoder.decode(value, { stream: true });
          const lines = rawChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  accumulatedText += data.chunk;
                  speechBuffer += data.chunk;

                  // Ultra-fast progressive TTS: speak first sentence immediately when punctuated!
                  if (!hasSpokenFirstSentence && /[.!?\n]/.test(speechBuffer)) {
                    const clauses = speechBuffer.split(/(?<=[.!?\n])\s+/);
                    if (clauses.length > 1 && clauses[0].trim().length > 4) {
                      hasSpokenFirstSentence = true;
                      setSpeechText(clauses[0].trim());
                    }
                  }

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === agentMsgId ? { ...m, text: accumulatedText } : m
                    )
                  );
                }
                if (data.analysisTriggered) {
                  isAnalysisTriggered = true;
                }
              } catch {
                // ignore parsing edge
              }
            }
          }
        }

        const elapsed = Date.now() - startTime;
        addLog('LLM_INFERENCE', `Streaming selesai (${elapsed}ms)`, 'success', elapsed);

        // Vocalize complete response so subsequent sentences play smoothly
        if (accumulatedText.trim()) {
          setSpeechText(accumulatedText.trim());
        }

        // If data analysis triggered, execute background worker
        let analysisData: DataAnalysisResult | undefined = undefined;
        if (isAnalysisTriggered) {
          addLog('PYTHON_WORKER', 'Memicu eksekusi asinkron scripts/analyzer.py (Pandas)...', 'info');
          try {
            const analysisRes = await fetch('/api/jin/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ datasetType: 'iot_sensors' }),
            });
            if (analysisRes.ok) {
              analysisData = await analysisRes.json();
              onAnalysisResultReceived(analysisData!);
              addLog('PYTHON_WORKER', `Eksekusi Pandas sukses: ${analysisData!.rowCount} baris, ${analysisData!.anomaliesDetected} anomali`, 'success', analysisData!.executionTimeMs);
            }
          } catch (workerErr) {
            console.error('Worker failed:', workerErr);
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  analysisTriggered: isAnalysisTriggered,
                  analysisResult: analysisData,
                  thoughtProcess: 'Streaming selesai via Gemini 3.8 Flash untuk Mas Joe.',
                }
              : m
          )
        );
      } catch (err: any) {
        console.warn('Streaming notice, switching to synchronous fallback:', err);
        // Fallback to synchronous
        await executeSyncChat(textToSend, agentMsgId, startTime);
      } finally {
        setIsProcessing(false);
        setStreamingMessageId(null);
      }
    } else {
      // Standard Synchronous Chat
      await executeSyncChat(textToSend, agentMsgId, startTime);
      setIsProcessing(false);
    }
  };

  const executeSyncChat = async (textToSend: string, agentMsgId: string, startTime: number) => {
    try {
      addLog('LLM_INFERENCE', 'Mengirim payload ke Gemini 3.8 Flash...', 'info');

      const response = await fetch('/api/jin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, offlineMode: isOfflineMode }),
      });

      if (!response.ok) throw new Error('Gateway response error');
      const data = await response.json();

      const elapsed = Date.now() - startTime;
      addLog('LLM_INFERENCE', `Respon diterima (${elapsed}ms)`, 'success', elapsed);

      let analysisData: DataAnalysisResult | undefined = undefined;

      if (data.analysisTriggered) {
        addLog('PYTHON_WORKER', 'Memicu eksekusi asinkron scripts/analyzer.py (Pandas)...', 'info');
        try {
          const analysisRes = await fetch('/api/jin/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ datasetType: 'iot_sensors' }),
          });
          if (analysisRes.ok) {
            analysisData = await analysisRes.json();
            onAnalysisResultReceived(analysisData!);
            addLog('PYTHON_WORKER', `Eksekusi Pandas sukses: ${analysisData!.rowCount} baris, ${analysisData!.anomaliesDetected} anomali`, 'success', analysisData!.executionTimeMs);
          }
        } catch (workerErr) {
          console.error('Worker failed:', workerErr);
        }
      }

      const targetState = (data.targetAvatarState as AvatarState) || 'SPEAKING';
      setAvatarState(targetState);
      addLog('AVATAR_SYNC', `Transisi status avatar ke ${targetState}`, 'info');

      setSpeechText(data.reply);

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== agentMsgId),
        {
          id: agentMsgId,
          role: 'agent',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString(),
          avatarState: targetState,
          thoughtProcess: data.thoughtProcess,
          analysisTriggered: data.analysisTriggered,
          analysisResult: analysisData,
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      addLog('GATEWAY', `Gagal memproses prompt: ${err.message}`, 'warn');
      setAvatarState('IDLE');
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-err-${Date.now()}`,
          role: 'agent',
          text: 'Maaf Mas Joe, terjadi gangguan sesaat pada komunikasi gateway. Sistem telah dipulihkan ke status IDLE.',
          timestamp: new Date().toLocaleTimeString(),
          avatarState: 'IDLE',
        },
      ]);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    handleSendMessage(transcript);
  };

  const handleSpeechEnd = () => {
    if (avatarState === 'SPEAKING') {
      setAvatarState('IDLE');
      addLog('AVATAR_SYNC', 'Sintesis suara selesai. Status avatar kembali ke IDLE', 'info');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top View Mode Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-300">
            TAMPILAN VIEWPORT JIN:
          </span>
          <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
            {viewMode === 'standard_split' ? '2D/3D Standard Web Window' :
             viewMode === 'spatial_hologram' ? 'Immersive Holographic Spatial Cockpit' :
             'Floating Hologram PiP Window'}
          </span>
        </div>

        {/* View Mode Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => {
              setViewMode('standard_split');
              addLog('AVATAR_SYNC', 'Transisi ke 2D/3D Standard Web Window (Dual Panel)', 'info');
            }}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'standard_split'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan standar seimbang: 3D Avatar di kiri, Command Deck di kanan"
          >
            <Layout className="w-3.5 h-3.5" />
            <span>2D/3D Standard</span>
          </button>

          <button
            onClick={() => {
              setViewMode('spatial_hologram');
              addLog('AVATAR_SYNC', 'Transisi ke Immersive Spatial Holographic Cockpit', 'info');
            }}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'spatial_hologram'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-medium shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan spasial futuristik: 3D Hologram penuh dengan floating glass HUD percakapan"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spatial Hologram</span>
          </button>

          <button
            onClick={() => {
              setViewMode('pip_floating');
              addLog('AVATAR_SYNC', 'Transisi ke Floating Hologram PiP Window', 'info');
            }}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'pip_floating'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Percakapan layar penuh dengan Avatar mengapung di pojok kanan bawah"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Floating PiP</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Container */}
      <div className={`relative ${
        viewMode === 'spatial_hologram'
          ? 'h-[720px] rounded-2xl overflow-hidden border border-cyan-900/60 shadow-2xl bg-slate-950'
          : 'grid grid-cols-1 lg:grid-cols-12 gap-6'
      }`}>
        {/* Three.js Interactive Hologram Deck */}
        <div className={`${
          viewMode === 'spatial_hologram'
            ? 'absolute inset-0 w-full h-full z-0'
            : viewMode === 'pip_floating'
            ? 'fixed md:absolute bottom-6 right-6 w-72 h-80 z-40 shadow-2xl rounded-2xl overflow-hidden border-2 border-cyan-500/60 bg-slate-950/95 backdrop-blur-md'
            : 'lg:col-span-5 space-y-4 flex flex-col'
        }`}>
          <div className={`${
            viewMode === 'spatial_hologram'
              ? 'w-full h-full'
              : viewMode === 'pip_floating'
              ? 'w-full h-full'
              : 'w-full aspect-square sm:aspect-4/3 lg:aspect-auto lg:h-[450px]'
          }`}>
            <AvatarThreeCanvas
              avatarState={avatarState}
              audioLevel={audioLevel}
              spatialMode={viewMode === 'spatial_hologram'}
              onToggleSpatialMode={() =>
                setViewMode(viewMode === 'spatial_hologram' ? 'standard_split' : 'spatial_hologram')
              }
              viewModeLabel={
                viewMode === 'spatial_hologram' ? 'SPATIAL XR COCKPIT' :
                viewMode === 'pip_floating' ? 'PIP FLOATING' : 'DUAL WINDOW'
              }
              onStateChangeRequested={(st) => {
                setAvatarState(st);
                addLog('AVATAR_SYNC', `Manual override status avatar: ${st}`, 'info');
              }}
            />
          </div>

          {/* Real-time Asynchronous Pipeline Log (Only in Standard Split Mode) */}
          {viewMode === 'standard_split' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-1">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-medium text-slate-300">
                    PIPELINE TELEMETRY LOG
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>REALTIME</span>
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px] max-h-[160px] overflow-y-auto">
                {pipelineLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-600 shrink-0 tabular-nums">[{log.timestamp}]</span>
                    <span className={`px-1 py-0.2 rounded text-[10px] shrink-0 ${
                      log.stage === 'GATEWAY' ? 'bg-slate-800 text-slate-300' :
                      log.stage === 'AVATAR_SYNC' ? 'bg-sky-950 text-sky-400' :
                      log.stage === 'LLM_INFERENCE' ? 'bg-cyan-950 text-cyan-400' :
                      log.stage === 'PYTHON_WORKER' ? 'bg-amber-950 text-amber-400' :
                      'bg-indigo-950 text-indigo-400'
                    }`}>
                      {log.stage}
                    </span>
                    <span className={`truncate ${
                      log.level === 'success' ? 'text-emerald-400' :
                      log.level === 'warn' ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interaction Deck & Conversation Terminal */}
        <div className={`${
          viewMode === 'spatial_hologram'
            ? 'absolute right-4 top-4 bottom-4 w-full md:w-[480px] lg:w-[540px] z-20 bg-slate-950/85 backdrop-blur-xl border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col overflow-hidden'
            : viewMode === 'pip_floating'
            ? 'lg:col-span-12 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col h-[650px] overflow-hidden'
            : 'lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col h-[650px] lg:h-[650px] overflow-hidden'
        }`}>
        {/* Terminal Header & Voice Controls */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                JIN Command Deck
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>OWNER: MAS JOE</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Offline Mode Switcher */}
            {onToggleOfflineMode && (
              <button
                onClick={onToggleOfflineMode}
                className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors flex items-center gap-1 ${
                  isOfflineMode
                    ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Beralih ke mode offline lokal (Ollama / Local Knowledge)"
              >
                <span>{isOfflineMode ? 'OFFLINE (OLLAMA)' : 'CLOUD (GEMINI)'}</span>
              </button>
            )}

            {/* Streaming Mode Switcher */}
            <button
              onClick={() => setUseFastStreaming(!useFastStreaming)}
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors flex items-center gap-1 ${
                useFastStreaming
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
              title="Aktifkan streaming respon real-time (kata demi kata)"
            >
              <Zap className="w-3 h-3" />
              <span>{useFastStreaming ? 'STREAMING AKTIF' : 'MODE SYNC'}</span>
            </button>

            {/* Web Speech Controller with configurable speech rate */}
            <AudioSpeechController
              onTranscriptReceived={handleVoiceTranscript}
              onAudioLevelChange={setAudioLevel}
              isAvatarSpeaking={avatarState === 'SPEAKING'}
              textToSpeak={speechText}
              onSpeechEnd={handleSpeechEnd}
              disabled={isProcessing}
              speechRate={ttsSpeed || 1.1}
            />
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mb-1">
                <span>{msg.role === 'user' ? 'MAS JOE (OWNER)' : 'JIN INTELLIGENT AGENT v2.0'}</span>
                <span>·</span>
                <span className="tabular-nums">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {msg.text || (msg.isStreaming ? 'Mengetik respon real-time...' : '')}
                </div>

                {/* If data analysis was triggered, display inline action card */}
                {msg.analysisTriggered && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-amber-400">
                      Python analyzer.py eksekusi selesai
                    </span>
                    <button
                      onClick={onTriggerAnalysisView}
                      className="px-2.5 py-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                    >
                      <span>Lihat Visualisasi Data</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Shortcut to forward/open in WhatsApp Meta Hub */}
                {msg.role === 'agent' && onOpenWhatsAppHub && (
                  <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <button
                      onClick={onOpenWhatsAppHub}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                    >
                      <Smartphone className="w-3 h-3 text-emerald-400" />
                      <span>Buka di WhatsApp & Meta Hub</span>
                    </button>
                    {msg.thoughtProcess && (
                      <span className="text-slate-600 truncate max-w-[220px]">
                        {msg.thoughtProcess}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && !streamingMessageId && (
            <div className="flex items-start gap-2">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono">JIN sedang bernalar untuk Mas Joe...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Action Prompts for Mas Joe */}
        <div className="px-5 py-2 bg-slate-950/50 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-mono text-emerald-400 font-semibold shrink-0">MAS JOE:</span>
          {[
            'Halo JIN, laporan kesiapan sistem untuk Mas Joe',
            'Mode Offline: Tampilkan SOP kerja Mas Joe dari database',
            'Canva AI: Buat template presentasi pitch deck',
            'Suno AI: Komposisi musik latar avatar JIN',
            'Google Flow: Sinkronkan data ke Google Sheets',
            'JIN, simulasikan pesan masuk dari WhatsApp',
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => handleSendMessage(promptText)}
              disabled={isProcessing}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded bg-slate-900/60 border border-slate-800 text-[11px] whitespace-nowrap transition-colors"
            >
              {promptText}
            </button>
          ))}
          {onOpenMultiAiHub && (
            <button
              onClick={onOpenMultiAiHub}
              className="px-2.5 py-1 text-cyan-300 hover:text-white bg-cyan-950/60 border border-cyan-800/60 rounded text-[11px] whitespace-nowrap transition-colors shrink-0"
            >
              + Buka Hub Multi-AI & Ollama
            </button>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Berikan instruksi Mas Joe ke JIN (misal: 'Jalankan analisis data' atau 'Kirim broadcast WhatsApp')..."
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Instruksikan</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};
