/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, QrCode, RefreshCw, Smartphone, Instagram, Share2, ShieldCheck, Zap, Copy, Check } from 'lucide-react';
import { MetaMessage, MetaConfig } from '../types/jin';

export const MetaWhatsAppHub: React.FC = () => {
  const [messages, setMessages] = useState<MetaMessage[]>([]);
  const [config, setConfig] = useState<MetaConfig | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'whatsapp' | 'instagram'>('all');
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Outbound Sender Form
  const [outboundRecipient, setOutboundRecipient] = useState('+6281298765432');
  const [outboundText, setOutboundText] = useState('');
  const [isSendingOutbound, setIsSendingOutbound] = useState(false);

  // Inbound Simulator Form
  const [simSenderName, setSimSenderName] = useState('Pelanggan Baru');
  const [simSenderPhone, setSimSenderPhone] = useState('+6285712345678');
  const [simChannel, setSimChannel] = useState<'whatsapp' | 'instagram'>('whatsapp');
  const [simMessage, setSimMessage] = useState('Halo Mas Joe, apakah proyek automasi sistem JIN bisa diintegrasikan dengan database kami?');
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchLogsAndConfig = async () => {
    try {
      const res = await fetch('/api/jin/whatsapp/logs');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setConfig(data.config || null);
      }
    } catch (err) {
      console.error('Fetch Meta logs error:', err);
    }
  };

  useEffect(() => {
    fetchLogsAndConfig();
  }, []);

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim() || isSimulating) return;

    setIsSimulating(true);
    try {
      const res = await fetch('/api/jin/webhook/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: simSenderPhone,
          senderName: simSenderName,
          channel: simChannel,
          message: simMessage,
        }),
      });

      if (res.ok) {
        setSimMessage('');
        await fetchLogsAndConfig();
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendOutbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outboundText.trim() || isSendingOutbound) return;

    setIsSendingOutbound(true);
    try {
      const res = await fetch('/api/jin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: outboundRecipient,
          message: outboundText,
          channel: 'whatsapp',
        }),
      });

      if (res.ok) {
        setOutboundText('');
        await fetchLogsAndConfig();
      }
    } catch (err) {
      console.error('Outbound send error:', err);
    } finally {
      setIsSendingOutbound(false);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (selectedChannel === 'all') return true;
    return m.channel === selectedChannel;
  });

  return (
    <div className="space-y-6">
      {/* Overview & Live Gateway Status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span>META CLOUD API & WHATSAPP GATEWAY</span>
              <span>·</span>
              <span>JIN v2.0 SOCIAL ORCHESTRATOR</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Integrasi WhatsApp & Media Sosial Meta
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Memungkinkan Mas Joe menerima pesan pelanggan WhatsApp Business dan Instagram Direct,
              dijawab otomatis secara real-time oleh AI JIN, dan mengirim broadcast resmi ke kontak Mas Joe.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>META GATEWAY ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Webhook Configuration Quick Card */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 mb-1">WEBHOOK CALLBACK URL</div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-cyan-300 truncate">
                {config?.webhookUrl || '/api/jin/webhook/meta'}
              </span>
              <button
                onClick={() => copyToClipboard(config?.webhookUrl || '', 'url')}
                className="text-slate-400 hover:text-slate-200 shrink-0"
                title="Salin Webhook URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 mb-1">VERIFY TOKEN (SECRET)</div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-200">
                {config?.verifyToken || 'JIN_META_VERIFY_TOKEN_SECURE'}
              </span>
              <button
                onClick={() => copyToClipboard(config?.verifyToken || '', 'token')}
                className="text-slate-400 hover:text-slate-200 shrink-0"
                title="Salin Token"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[11px] font-mono text-slate-400 mb-1">OTORITAS PEMILIK (MAS JOE)</div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Mas Joe (@mohjosid)</span>
              <span className="text-slate-500 font-normal">· Akses Penuh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace: Simulator vs Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Live Inbound Simulator & Outbound Dispatcher (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Inbound Message Simulator (Test incoming WhatsApp/IG messages) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Simulasi Pesan Masuk (Inbound Tester)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">TEST AI AUTO-REPLY</span>
            </div>

            <form onSubmit={handleSimulateInbound} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">NAMA PENGIRIM</label>
                  <input
                    type="text"
                    value={simSenderName}
                    onChange={(e) => setSimSenderName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">KANAL META</label>
                  <select
                    value={simChannel}
                    onChange={(e) => setSimChannel(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="whatsapp">WhatsApp Business</option>
                    <option value="instagram">Instagram Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">NOMOR / USERNAME</label>
                <input
                  type="text"
                  value={simSenderPhone}
                  onChange={(e) => setSimSenderPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">ISI PESAN</label>
                <textarea
                  rows={2}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  placeholder="Ketik pesan yang dikirim pelanggan..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>JIN sedang menjawab...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pesan Simulasi ke JIN</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Outbound Dispatcher (Mas Joe mengirim pesan langsung) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Kirim Pesan WhatsApp Keluar (Outbound)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">DARI MAS JOE</span>
            </div>

            <form onSubmit={handleSendOutbound} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">NOMOR TUJUAN (WHATSAPP)</label>
                <input
                  type="text"
                  value={outboundRecipient}
                  onChange={(e) => setOutboundRecipient(e.target.value)}
                  placeholder="+628..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">PESAN DARI MAS JOE</label>
                <textarea
                  rows={2}
                  value={outboundText}
                  onChange={(e) => setOutboundText(e.target.value)}
                  placeholder="Ketik instruksi/pesan yang ingin dikirim Mas Joe..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Template shortcuts */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 no-scrollbar">
                <span className="text-slate-500 font-mono shrink-0">TEMPLATE:</span>
                {[
                  'Laporan Progres Sistem JIN Siap',
                  'Undangan Rapat Analisis Data Jam 14:00',
                  'Konfirmasi Integrasi Webhook Meta Sukses',
                ].map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setOutboundText(tpl)}
                    className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 shrink-0"
                  >
                    {tpl.slice(0, 22)}...
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSendingOutbound}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSendingOutbound ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pesan Resmi via WhatsApp API</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Real-time Message Stream & Meta Activity (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col h-[680px]">
          {/* Header & Filter Bar */}
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Riwayat Pesan WhatsApp & Meta
              </span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {filteredMessages.length} Percakapan
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['all', 'whatsapp', 'instagram'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedChannel === ch
                      ? 'bg-slate-800 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ch === 'all' ? 'Semua' : ch === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                {/* Meta Sender Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {msg.channel === 'whatsapp' ? (
                      <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        <Smartphone className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-rose-950 text-rose-400 border border-rose-800/60">
                        <Instagram className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{msg.senderName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{msg.sender}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500">{msg.timestamp}</span>
                    {msg.latencyMs && (
                      <div className="text-[10px] font-mono text-emerald-400">
                        Latency: {msg.latencyMs}ms
                      </div>
                    )}
                  </div>
                </div>

                {/* Incoming message bubble */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                  <div className="text-[10px] font-mono text-slate-400 mb-1">PESAN MASUK:</div>
                  {msg.message}
                </div>

                {/* AI Automated Response bubble */}
                {msg.aiResponse && (
                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/40 text-xs text-emerald-200 leading-relaxed">
                    <div className="text-[10px] font-mono text-emerald-400 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>JAWABAN OTOMATIS JIN AI (ATAS NAMA MAS JOE):</span>
                    </div>
                    {msg.aiResponse}
                  </div>
                )}
              </div>
            ))}

            {filteredMessages.length === 0 && (
              <div className="text-center py-16 text-slate-500 text-xs font-mono">
                Belum ada pesan pada kanal ini. Gunakan panel simulasi di sebelah kiri untuk menguji.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
