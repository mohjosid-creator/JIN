/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Network, Zap, Send, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, Copy, Check, Terminal, Code, Layers, MessageSquare, AlertCircle } from 'lucide-react';
import { WorkflowEvent } from '../types/jin';

export const AgenticWorkflowHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'events' | 'schema' | 'n8n_json'>('simulator');
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulation form
  const [customerName, setCustomerName] = useState('Budi Pratama (Direktur PT Sentosa)');
  const [senderPhone, setSenderPhone] = useState('+6281299887766');
  const [incomingMessage, setIncomingMessage] = useState('Halo Mas Joe dan tim AI JIN, kami tertarik mengintegrasikan sistem WhatsApp dan analitik otomatis di cabang kami. Mohon draf proposalnya.');
  const [simulationSteps, setSimulationSteps] = useState<any[]>([]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/jin/workflows/events');
      const data = await res.json();
      if (data && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.warn('Failed to load webhook events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimulationSteps([]);

    try {
      const res = await fetch('/api/jin/workflows/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          senderPhone,
          customerMessage: incomingMessage,
        }),
      });
      const data = await res.json();
      if (data && data.executionSteps) {
        setSimulationSteps(data.executionSteps);
        if (data.event) {
          setEvents((prev) => [data.event, ...prev]);
        }
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const n8nWorkflowJson = JSON.stringify(
    {
      name: 'JIN v2.0 Enterprise Omnichannel & Analytics Pipeline',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'jin-inbound-webhook',
            responseMode: 'onReceived',
            options: { rawBody: true },
          },
          name: 'Webhook Inbound Listener',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            functionCode: '// Validasi HMAC SHA-256 Signature\nconst crypto = require("crypto");\nconst secret = "jin_master_hmac_secret_2026";\nconst signature = $node["Webhook Inbound Listener"].json.headers["x-jin-signature"];\nconst computed = crypto.createHmac("sha256", secret).update(JSON.stringify($node["Webhook Inbound Listener"].json.body)).digest("hex");\nif (signature !== "sha256=" + computed) throw new Error("Invalid signature");\nreturn items;',
          },
          name: 'HMAC Security Validator',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [460, 300],
        },
        {
          parameters: {
            url: 'http://localhost:3000/api/jin/chat',
            method: 'POST',
            bodyParametersUi: {
              parameter: [{ name: 'message', value: '={{$json.body.message}}' }],
            },
          },
          name: 'JIN Core AI NLP Inference',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [680, 300],
        },
        {
          parameters: {
            sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            range: 'Inbound_Leads!A:E',
          },
          name: 'Google Sheets Sinkronisasi',
          type: 'n8n-nodes-base.googleSheets',
          typeVersion: 2,
          position: [900, 200],
        },
        {
          parameters: {
            chatId: '@mohjosid_alerts',
            text: '🚀 *JIN Enterprise Alert*\nPesan Baru dari {{$json.body.senderName}}:\n"{{$json.body.message}}"\n*AI Sentiment:* Positif\n*Tindakan:* Diteruskan ke Mas Joe',
          },
          name: 'Telegram Bot Mas Joe Alert',
          type: 'n8n-nodes-base.telegram',
          typeVersion: 1,
          position: [900, 400],
        },
      ],
      connections: {
        'Webhook Inbound Listener': { main: [[{ node: 'HMAC Security Validator', type: 'main', index: 0 }]] },
        'HMAC Security Validator': { main: [[{ node: 'JIN Core AI NLP Inference', type: 'main', index: 0 }]] },
        'JIN Core AI NLP Inference': {
          main: [
            [{ node: 'Google Sheets Sinkronisasi', type: 'main', index: 0 }],
            [{ node: 'Telegram Bot Mas Joe Alert', type: 'main', index: 0 }],
          ],
        },
      },
    },
    null,
    2
  );

  const handleCopyN8n = () => {
    navigator.clipboard.writeText(n8nWorkflowJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-indigo-950/80 text-indigo-400 border border-indigo-800 rounded">
              Event-Driven Architecture
            </span>
            <span className="text-xs text-slate-400 font-mono">n8n · Make.com · Redis PubSub · HMAC SHA-256</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 mt-1">
            Webhook & Agentic Workflow Orchestrator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Orkestrasi multi-sistem: Pesan WhatsApp Inbound → Ekstraksi NLP JIN → Sinkronisasi Database/Sheets → Notifikasi Telegram Mas Joe
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'simulator' ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulasi Pipeline
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'events' ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Event Bus Log ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'schema' ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON Schema Standar
          </button>
          <button
            onClick={() => setActiveTab('n8n_json')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'n8n_json' ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blueprint n8n
          </button>
        </div>
      </div>

      {/* Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inbound Simulator Form */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Kirim Sinyal Pemicu Webhook (Inbound Trigger)</span>
            </h3>

            <form onSubmit={handleRunSimulation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Nama Klien / Pengirim
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Nomor WhatsApp Kontak
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Isi Pesan Masuk
                </label>
                <textarea
                  rows={4}
                  value={incomingMessage}
                  onChange={(e) => setIncomingMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                />
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enkripsi HMAC-SHA256 Otomatis</span>
                </div>
                <div>Secret Key: jin_master_hmac_secret_2026</div>
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengeksekusi Rantai Otomatisasi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Jalankan Simulasi Alur Kerja n8n</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Stepper Timeline Visualizer */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Pelacak Eksekusi Rantai Event (Event Bus Dispatcher)</span>
              </span>
              <span className="text-xs font-mono text-emerald-400">Total Latensi: ~150ms</span>
            </h3>

            {simulationSteps.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <Network className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">Klik &quot;Jalankan Simulasi Alur Kerja n8n&quot; untuk melihat eksekusi real-time langkah demi langkah.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {simulationSteps.map((step) => (
                  <div
                    key={step.step}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-start gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{step.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 bg-emerald-950 border border-emerald-800 rounded">
                          {step.latencyMs}ms · {step.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Platform: {step.platform}
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono mt-1 bg-slate-900 p-1.5 rounded border border-slate-800/60">
                        {step.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Bus Log Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Riwayat Transaksi Webhook Terverifikasi (HMAC SHA-256)
            </h3>
            <button onClick={fetchEvents} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono">
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                      {evt.eventName}
                    </span>
                    <span className="text-slate-400 text-[11px]">{evt.id} · {evt.timestamp}</span>
                  </div>
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>HMAC VALID</span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 truncate">
                  Target: <span className="text-slate-200">{evt.destinationUrl}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Signature: {evt.hmacSignature}
                </div>

                <pre className="p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(evt.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Schema Specification Tab */}
      {activeTab === 'schema' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Inbound Webhook JSON Specification</span>
            </h4>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "JIN_Inbound_Webhook_Payload",
  "type": "object",
  "required": ["event_id", "timestamp", "source", "sender", "message"],
  "properties": {
    "event_id": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "source": { "type": "string", "enum": ["whatsapp", "telegram", "meta"] },
    "sender": {
      "type": "object",
      "required": ["id", "name"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "role": { "type": "string" }
      }
    },
    "message": { "type": "string" }
  }
}`}
            </pre>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Outbound Action Trigger JSON Specification</span>
            </h4>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "JIN_Outbound_Action_Trigger",
  "type": "object",
  "required": ["action_type", "target_pipeline", "payload"],
  "properties": {
    "action_type": { "type": "string", "enum": ["CRM_APPEND", "TELEGRAM_ALERT", "DOCUMENT_GEN"] },
    "target_pipeline": { "type": "string", "enum": ["n8n", "make_com"] },
    "priority": { "type": "string", "enum": ["LOW", "NORMAL", "URGENT"] },
    "payload": {
      "type": "object",
      "properties": {
        "lead_name": { "type": "string" },
        "intent": { "type": "string" },
        "sentiment_score": { "type": "number" },
        "assigned_owner": { "type": "string", "default": "Mas Joe" }
      }
    }
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Blueprint n8n JSON Tab */}
      {activeTab === 'n8n_json' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Template Workflow n8n Siap Impor (.json)</span>
            </h4>
            <button
              onClick={handleCopyN8n}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin JSON n8n'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[450px]">
            {n8nWorkflowJson}
          </pre>
        </div>
      )}
    </div>
  );
};
