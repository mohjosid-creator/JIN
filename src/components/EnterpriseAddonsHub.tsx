/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Terminal, Eye, ShoppingCart, BarChart3, Database, ShieldAlert, CheckCircle2, Play, RefreshCw, Copy, Check, Sparkles, AlertTriangle, Layers } from 'lucide-react';
import { FineTuneConfig, EdgeAiStatus, OmniChannelMessage, FinancialAnomalyRecord, TextToSqlResult } from '../types/jin';

export const EnterpriseAddonsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'finetune' | 'edge_ai' | 'omnichannel' | 'financial_sql'>('finetune');
  const [copiedModelfile, setCopiedModelfile] = useState(false);

  // 1. Fine-Tune State
  const [fineTuneConfig, setFineTuneConfig] = useState<FineTuneConfig>({
    baseModel: 'llama3:8b',
    datasetRows: 12500,
    technique: 'QLoRA_4bit',
    loraRank: 16,
    loraAlpha: 32,
    epochs: 3,
    learningRate: 0.0002,
    targetModules: ['q_proj', 'v_proj', 'k_proj', 'o_proj'],
    customPersona: 'JIN Intelligent Network Agent v2.0 - Asisten Eksekutif Setia untuk Mas Joe (@mohjosid)',
    modelfileContent: `FROM llama3:8b

# Parameter Konfigurasi QLoRA
PARAMETER temperature 0.3
PARAMETER top_p 0.9
PARAMETER stop "<|start_header_id|>"
PARAMETER stop "<|end_header_id|>"

# Template Sistem Mas Joe
SYSTEM """
Anda adalah JIN (Java/JavaScript Intelligent Network Agent v2.0), model AI khusus yang dilatih dengan presisi tinggi untuk Mas Joe (@mohjosid).
Prinsip Operasional:
1. Menanggapi instruksi Mas Joe dengan cepat, akurat, dan percaya diri.
2. Selalu siap mengontrol 3D Three.js Avatar, WhatsApp Gateway, dan Python Worker.
3. Menjaga privasi data lokal tanpa mengirim data sensitif ke server publik.
"""
`,
    status: 'DEPLOYED_OLLAMA',
  });

  // 2. Edge AI & Whisper.cpp State
  const [edgeStatus, setEdgeStatus] = useState<EdgeAiStatus>({
    whisperCppStatus: 'READY',
    whisperModel: 'whisper.cpp-small-q5_1',
    vadActive: true,
    llavaVisionStatus: 'READY',
    llavaModel: 'llava:7b-q4_k',
    vramAllocatedMb: 3420,
    vramTotalMb: 8192,
    ramUsageMb: 2150,
    deviceBackend: 'Metal_MPS',
  });

  // 3. Omni-Channel Commerce Messages
  const [omniMessages, setOmniMessages] = useState<OmniChannelMessage[]>([
    {
      id: 'omni-1',
      channel: 'tiktok_shop',
      customerName: 'Siti Rahma',
      customerHandle: '@siti_fashion',
      rawText: 'Halo kak, apakah integrasi AI JIN untuk live streaming TikTok bisa auto reply komentar produk?',
      standardizedIntent: 'product_spec',
      aiReplyText: 'Halo Kak Siti! Benar sekali, AI JIN v2.0 dilengkapi konektor native TikTok Shop untuk auto-reply komentar live dan manajemen pesanan instan.',
      sentiment: 'positive',
      rateLimitTokensLeft: 480,
      timestamp: '14:20:12',
    },
    {
      id: 'omni-2',
      channel: 'shopee',
      customerName: 'Toko Elektronik Makmur',
      customerHandle: 'makmur_jaya_official',
      rawText: 'Pesanan #SHP-99218 mohon dicek resi pengirimannya ya kak, terima kasih.',
      standardizedIntent: 'order_inquiry',
      aiReplyText: 'Halo Toko Makmur! Pesanan #SHP-99218 telah di-pickup kurir dengan no resi JIN-EXP-88192. Estimasi tiba esok sore.',
      sentiment: 'positive',
      rateLimitTokensLeft: 390,
      timestamp: '14:18:45',
    },
    {
      id: 'omni-3',
      channel: 'tokopedia',
      customerName: 'Hendra Gunawan',
      customerHandle: 'hendra_tech',
      rawText: 'Mohon info garansi server lokal JIN jika diinstal di server kantor offline.',
      standardizedIntent: 'product_spec',
      aiReplyText: 'Halo Pak Hendra! Sistem JIN Offline RAG bergaransi penuh dengan instalasi on-premise di bawah supervisi langsung Mas Joe.',
      sentiment: 'positive',
      rateLimitTokensLeft: 520,
      timestamp: '14:15:30',
    },
    {
      id: 'omni-4',
      channel: 'telegram',
      customerName: 'Executive VIP Group',
      customerHandle: '@vip_investor_corp',
      rawText: 'Permintaan review laporan audit kuartal Q1 2026 selesai digenerate.',
      standardizedIntent: 'payment_confirmation',
      aiReplyText: 'Laporan audit Q1 telah siap di Google Sheets dan dienkripsi dengan signature Mas Joe.',
      sentiment: 'urgent',
      rateLimitTokensLeft: 600,
      timestamp: '14:12:00',
    },
  ]);

  // 4. Financial SQL & Anomaly State
  const [sqlQueryInput, setSqlQueryInput] = useState('SELECT vendor, SUM(amount) AS total, AVG(z_score) FROM invoices GROUP BY vendor HAVING total > 50000');
  const [sqlResult, setSqlResult] = useState<TextToSqlResult>({
    naturalQuery: 'Tampilkan vendor dengan total invoice di atas $50,000 beserta skor anomali rata-rata',
    generatedSql: 'SELECT vendor, SUM(amount) AS total, AVG(z_score) FROM invoices GROUP BY vendor HAVING total > 50000',
    isReadOnlySafe: true,
    executionTimeMs: 14,
    rowsReturned: 3,
    columns: ['vendor', 'total_amount_usd', 'avg_anomaly_zscore', 'risk_classification'],
    rows: [
      { vendor: 'Global Cloud Infra Corp', total_amount_usd: 125400, avg_anomaly_zscore: 0.24, risk_classification: 'NORMAL' },
      { vendor: 'Apex Telemetry Hardware Ltd', total_amount_usd: 88200, avg_anomaly_zscore: 0.45, risk_classification: 'NORMAL' },
      { vendor: 'Shadow Offshore Billing Inc', total_amount_usd: 62000, avg_anomaly_zscore: 3.82, risk_classification: 'FLAGGED_ANOMALY' },
    ],
  });

  const [financialAnomalies] = useState<FinancialAnomalyRecord[]>([
    {
      id: 'anom-01',
      txId: 'INV-2026-904',
      vendor: 'Shadow Offshore Billing Inc',
      category: 'Server Leasing',
      amount: 62000,
      anomalyScore: 0.96,
      zScore: 3.82,
      flagReason: 'Lonjakan nominal melebihi 3-sigma deviasi rata-rata vendor historis',
      isFlagged: true,
      date: '2026-10-07',
    },
    {
      id: 'anom-02',
      txId: 'INV-2026-882',
      vendor: 'Microservices Bandwidth Direct',
      category: 'CDN Network',
      amount: 14200,
      anomalyScore: 0.35,
      zScore: 1.12,
      flagReason: 'Variansi normal sesuai lonjakan trafik peluncuran JIN v2.0',
      isFlagged: false,
      date: '2026-10-06',
    },
  ]);

  const handleCopyModelfile = () => {
    navigator.clipboard.writeText(fineTuneConfig.modelfileContent);
    setCopiedModelfile(true);
    setTimeout(() => setCopiedModelfile(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-violet-950/80 text-violet-400 border border-violet-800 rounded">
              JIN v2.0 Enterprise Suite
            </span>
            <span className="text-xs text-slate-400 font-mono">QLoRA · Whisper.cpp · Omni-Channel · Text-to-SQL</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 mt-1">
            Enterprise Specialized AI Modules
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fine-tuning Modelfile Ollama Mas Joe, Edge Vision & Whisper.cpp lokal, integrasi Marketplace, dan Text-to-SQL Finansial
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('finetune')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'finetune' ? 'bg-violet-500/20 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Modelfile & QLoRA
          </button>
          <button
            onClick={() => setActiveTab('edge_ai')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'edge_ai' ? 'bg-violet-500/20 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Edge Vision & Whisper
          </button>
          <button
            onClick={() => setActiveTab('omnichannel')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'omnichannel' ? 'bg-violet-500/20 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Omnichannel Toko ({omniMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('financial_sql')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'financial_sql' ? 'bg-violet-500/20 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Text-to-SQL & Anomali
          </button>
        </div>
      </div>

      {/* 1. Fine-Tune Tab */}
      {activeTab === 'finetune' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-400" />
                <span>Parameter Fine-Tuning QLoRA</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                STATUS: DEPLOYED (OLLAMA)
              </span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                <span>Model Dasar:</span>
                <span className="text-violet-400 font-bold">{fineTuneConfig.baseModel}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                <span>Teknik Fine-Tune:</span>
                <span className="text-emerald-400">{fineTuneConfig.technique} (4-bit NF4)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                <span>LoRA Rank / Alpha:</span>
                <span className="text-cyan-400">r={fineTuneConfig.loraRank}, alpha={fineTuneConfig.loraAlpha}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                <span>Dataset Baris:</span>
                <span>{fineTuneConfig.datasetRows.toLocaleString()} Pasang Q&A Mas Joe</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                <span>Target Module:</span>
                <span className="text-amber-400">{fineTuneConfig.targetModules.join(', ')}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
              <span className="text-slate-400 font-mono text-[10px] uppercase block">Persona Terlatih:</span>
              <p className="text-slate-200 font-medium">{fineTuneConfig.customPersona}</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                <span>Modelfile Resmi Ollama Mas Joe</span>
              </h4>
              <button
                onClick={handleCopyModelfile}
                className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {copiedModelfile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedModelfile ? 'Tersalin' : 'Salin Modelfile'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[350px]">
              {fineTuneConfig.modelfileContent}
            </pre>
          </div>
        </div>
      )}

      {/* 2. Edge Vision & Whisper Tab */}
      {activeTab === 'edge_ai' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">Whisper.cpp Engine</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                {edgeStatus.whisperCppStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Model: {edgeStatus.whisperModel}</p>
            <div className="text-[11px] text-slate-300 space-y-1 font-mono">
              <div>• Voice Activity Detection (VAD): AKTIF</div>
              <div>• Latensi Speech-to-Text: ~42ms</div>
              <div>• Enkapsulasi: 100% On-Device C++</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">LLaVA Vision Core</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                {edgeStatus.llavaVisionStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Model: {edgeStatus.llavaModel}</p>
            <div className="text-[11px] text-slate-300 space-y-1 font-mono">
              <div>• Resolusi Input: 672x672 Clip Encoder</div>
              <div>• Deteksi Objek & OCR: REAL-TIME</div>
              <div>• Frame Rate Inspeksi: 18 fps</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">Akselerasi Perangkat Keras</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                {edgeStatus.deviceBackend}
              </span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Alokasi VRAM GPU:</span>
                  <span>{edgeStatus.vramAllocatedMb} / {edgeStatus.vramTotalMb} MB</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-violet-500 h-full"
                    style={{ width: `${(edgeStatus.vramAllocatedMb / edgeStatus.vramTotalMb) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400">RAM Sistem Terpakai: {edgeStatus.ramUsageMb} MB</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Omni-Channel E-Commerce Tab */}
      {activeTab === 'omnichannel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-violet-400" />
              <span>Inbox Omnichannel E-Commerce (TikTok Shop, Shopee, Tokopedia, Telegram)</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">Auto-Responder JIN Aktif</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {omniMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        msg.channel === 'tiktok_shop'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : msg.channel === 'shopee'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : msg.channel === 'tokopedia'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {msg.channel.replace('_', ' ')}
                    </span>
                    <span className="text-slate-300 font-semibold">{msg.customerName}</span>
                    <span className="text-slate-500 text-[10px]">{msg.customerHandle}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{msg.timestamp}</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-300">
                  &quot;{msg.rawText}&quot;
                </div>

                <div className="p-2.5 bg-violet-950/40 rounded border border-violet-800/60 text-violet-200">
                  <span className="text-[10px] uppercase font-bold text-violet-400 block mb-0.5">
                    Balasan AI JIN Otomatis:
                  </span>
                  {msg.aiReplyText}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>Intent: {msg.standardizedIntent}</span>
                  <span>Token Rate Kuota: {msg.rateLimitTokensLeft} tersisa</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Financial SQL & Anomaly Detection Tab */}
      {activeTab === 'financial_sql' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Text-to-SQL AST Safety Engine (Read-Only Guard)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                READ-ONLY AST ENFORCED
              </span>
            </h4>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300">
              Query SQL: {sqlResult.generatedSql}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-slate-300 border border-slate-800 rounded">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-left">
                    <th className="p-2.5 border-r border-slate-800">Vendor</th>
                    <th className="p-2.5 border-r border-slate-800">Total Transaksi ($)</th>
                    <th className="p-2.5 border-r border-slate-800">Z-Score Deviasi</th>
                    <th className="p-2.5">Klasifikasi Risiko</th>
                  </tr>
                </thead>
                <tbody>
                  {sqlResult.rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="p-2.5 border-r border-slate-800 font-semibold">{row.vendor}</td>
                      <td className="p-2.5 border-r border-slate-800">${row.total_amount_usd.toLocaleString()}</td>
                      <td className="p-2.5 border-r border-slate-800">{row.avg_anomaly_zscore}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.risk_classification === 'FLAGGED_ANOMALY'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {row.risk_classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anomaly Inspection Alert Feed */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Deteksi Anomali Finansial (Z-Score & Isolation Forest)</span>
            </h4>

            <div className="space-y-3">
              {financialAnomalies.map((anom) => (
                <div
                  key={anom.id}
                  className={`p-3 rounded-lg border text-xs font-mono flex items-start justify-between gap-4 ${
                    anom.isFlagged
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{anom.txId}</span>
                      <span>· {anom.vendor}</span>
                      <span className="text-[10px] text-slate-400">({anom.date})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{anom.flagReason}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">${anom.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-rose-400">Z-Score: {anom.zScore} (Anomali: {(anom.anomalyScore * 100).toFixed(0)}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
