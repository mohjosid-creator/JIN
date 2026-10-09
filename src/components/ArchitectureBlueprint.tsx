/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Cpu, Database, Terminal, Shield, ArrowRight, Code, Server, Monitor, FileCode, CheckCircle2 } from 'lucide-react';

interface ComponentDetail {
  id: string;
  name: string;
  role: string;
  layer: 'Frontend' | 'Backend' | 'AI Core' | 'Data Worker' | 'Memory';
  techStack: string[];
  responsibilities: string[];
  codePreview: string;
  codeFilename: string;
}

const architectureComponents: ComponentDetail[] = [
  {
    id: 'frontend-avatar',
    name: 'Frontend: 3D Avatar & Web Interface',
    role: 'Visual rendering, user interaction, dan speech processing',
    layer: 'Frontend',
    techStack: ['Three.js WebGL', 'Web Speech API', 'React 19', 'Tailwind CSS'],
    responsibilities: [
      'Render 3D hologram avatar dengan geometri suci (icosahedron/dodecahedron) dan 750 partikel quantum.',
      'Mengelola siklus hidup status avatar (HIDDEN -> APPEARING -> IDLE -> LISTENING -> PROCESSING -> SPEAKING -> DISAPPEARING).',
      'Menangkap audio mikrofon via Web Speech Recognition (Speech-to-Text).',
      'Memutar suara respon AI via Web Speech Synthesis dengan sinkronisasi visual audio-reaktif.',
      'Dukungan viewport responsive dan degradasi halus tanpa blocking.',
    ],
    codeFilename: 'src/components/AvatarThreeCanvas.tsx',
    codePreview: `// Three.js Dynamic Lifecycle State Transition
switch (currentState) {
  case 'APPEARING':
    targetOpacity = 0.95; targetScale = 1.0; rotationSpeed = 0.035;
    break;
  case 'PROCESSING':
    targetOpacity = 1.0; targetScale = 1.15; rotationSpeed = 0.06;
    nucleusMat.color.setHex(0xf59e0b); // Amber computational vortex
    break;
  case 'SPEAKING':
    const speechPulse = currentAudio > 0 ? currentAudio * 0.35 : Math.sin(t * 8) * 0.15;
    targetScale = 1.05 + speechPulse;
    break;
  case 'DISAPPEARING':
    targetOpacity = 0.0; targetScale = 0.02; // Quantum collapse
    break;
}`,
  },
  {
    id: 'backend-orchestrator',
    name: 'Backend Engine: Node.js Orchestrator',
    role: 'Jembatan kontrol, routing intent, dan koordinasi pipeline asinkron',
    layer: 'Backend',
    techStack: ['Node.js', 'Express', 'TypeScript', 'Vite Middleware'],
    responsibilities: [
      'Menangani gateway API / WebSocket untuk sinkronisasi latensi rendah antara avatar dan respon AI.',
      'Mengklasifikasikan intent pengguna (percakapan, pemanggilan analisis data, atau perintah kontrol avatar).',
      'Mengelola pipeline asinkron antara model bahasa (LLM) dan worker Python.',
      'Menjaga keamanan API key server-side secara eksklusif (tidak pernah terpapar ke browser).',
      'Menerapkan telemetry runtime dan health check subsistem.',
    ],
    codeFilename: 'server.ts',
    codePreview: `// Express Orchestrator Pipeline
app.post('/api/jin/chat', async (req, res) => {
  const { message } = req.body;
  const isDataAnalysis = /analisis|data|statistik|pandas/i.test(message);

  // Gemini 2.5 Flash Inference Server-Side
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: message,
    config: { systemInstruction: JIN_SYSTEM_PROMPT }
  });

  res.json({
    reply: response.text,
    targetAvatarState: 'SPEAKING',
    analysisTriggered: isDataAnalysis
  });
});`,
  },
  {
    id: 'ai-core',
    name: 'Core AI Engine: Gemini 2.5 Flash',
    role: 'Penalaran bahasa alami, ekstraksi intent, dan kecerdasan sentral',
    layer: 'AI Core',
    techStack: ['@google/genai SDK', 'gemini-2.5-flash', 'Structured Outputs'],
    responsibilities: [
      'Memahami pertanyaan pengguna dalam Bahasa Indonesia atau Inggris dengan penalaran canggih.',
      'Menghasilkan respon terstruktur, rekomendasi teknis, dan langkah eksekusi.',
      'Menentukan transisi status avatar berdasarkan konteks emosional dan beban kerja.',
      'Menginisialisasi parameter pemanggilan fungsi untuk worker eksternal.',
    ],
    codeFilename: 'server/gemini-client.ts',
    codePreview: `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: userInput,
});`,
  },
  {
    id: 'python-worker',
    name: 'Engine Analisis Data: Python Worker',
    role: 'Pemrosesan data kuantitatif, manipulasi Pandas, dan rendering Matplotlib',
    layer: 'Data Worker',
    techStack: ['Python 3.11', 'Pandas', 'NumPy', 'SciPy', 'Matplotlib'],
    responsibilities: [
      'Membaca dan memproses dataset tabular (CSV, time-series, log telemetri jaringan).',
      'Melakukan pembersihan data, pengisian nilai kosong, dan standardisasi varian.',
      'Menghitung statistik deskriptif (Mean, Median, Standar Deviasi, Kuartil).',
      'Mendeteksi anomali multi-variat menggunakan algoritma 3-Sigma Z-Score dan Isolation Forest.',
      'Merender visualisasi grafis dan meneruskan payload JSON ke orkestrator.',
    ],
    codeFilename: 'scripts/analyzer.py',
    codePreview: `import pandas as pd
import numpy as np

def run_analysis(csv_path: str):
    df = pd.read_csv(csv_path)
    df.fillna(method='ffill', inplace=True)
    
    # Deteksi anomali Z-score
    rolling_mean = df['vibration_hz'].rolling(window=15).mean()
    rolling_std = df['vibration_hz'].rolling(window=15).std()
    anomalies = df[np.abs(df['vibration_hz'] - rolling_mean) > (3 * rolling_std)]
    
    return {
        'row_count': len(df),
        'metrics': df.describe().to_dict(),
        'anomalies_count': len(anomalies)
    }`,
  },
  {
    id: 'vector-db',
    name: 'Vector Database: Pinecone Semantic Memory',
    role: 'Penyimpanan konteks memori percakapan dan aturan sistem jangka panjang',
    layer: 'Memory',
    techStack: ['Pinecone API', 'Cosine Distance Index', '1536 Dimensions'],
    responsibilities: [
      'Menyimpan representasi vektor embedding dari riwayat percakapan dan profil preferensi pengguna.',
      'Melakukan pencarian kemiripan semantik (semantic similarity search) berlatensi sub-milidetik.',
      'Menyediakan memori jangka panjang sehingga agen JIN tidak kehilangan konteks antar sesi.',
      'Mendukung segmentasi memori berdasarkan kategori (system_rule, conversation, data_insight).',
    ],
    codeFilename: 'server/pinecone-service.ts',
    codePreview: `// Pinecone Semantic Context Retrieval
async function queryContextMemory(queryVector: number[], topK = 4) {
  const queryResponse = await pineconeIndex.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });
  return queryResponse.matches.map(m => m.metadata.text);
}`,
  },
];

export const ArchitectureBlueprint: React.FC = () => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>('frontend-avatar');

  const selected = architectureComponents.find((c) => c.id === selectedComponentId) || architectureComponents[0];

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>SYSTEM ARCHITECTURE BLUEPRINT</span>
              <span>·</span>
              <span>JIN AGENT SPECIFICATION</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Arsitektur Sistem Terdistribusi JIN
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Pemisahan tanggung jawab (Separation of Concerns) yang ketat antara antarmuka visual Three.js,
              orkestrator Node.js berkecepatan tinggi, kecerdasan inti Gemini, dan worker analisis data Python independen.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>5 SUBSYSTEMS COUPLED & HEALTHY</span>
          </div>
        </div>

        {/* Visual Architecture Topology Diagram */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-xs font-mono text-slate-400 mb-3">TOPOLOGI ALIRAN DATA & LIFECYCLE PIPELINE</div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {architectureComponents.map((comp, idx) => {
              const isSelected = comp.id === selectedComponentId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComponentId(comp.id)}
                  className={`relative p-4 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500">0{idx + 1}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      comp.layer === 'Frontend' ? 'border-sky-500/40 text-sky-400 bg-sky-950/40' :
                      comp.layer === 'Backend' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40' :
                      comp.layer === 'AI Core' ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40' :
                      comp.layer === 'Data Worker' ? 'border-amber-500/40 text-amber-400 bg-amber-950/40' :
                      'border-indigo-500/40 text-indigo-400 bg-indigo-950/40'
                    }`}>
                      {comp.layer}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{comp.name.split(':')[1] || comp.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{comp.role}</p>

                  {idx < 4 && (
                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Component Deep Dive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Component Specs & Responsibilities */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400">{selected.layer.toUpperCase()} COMPONENT</span>
              <h3 className="text-lg font-semibold text-slate-100">{selected.name}</h3>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700">
              {selected.layer === 'Frontend' && <Monitor className="w-5 h-5" />}
              {selected.layer === 'Backend' && <Server className="w-5 h-5" />}
              {selected.layer === 'AI Core' && <Cpu className="w-5 h-5" />}
              {selected.layer === 'Data Worker' && <Terminal className="w-5 h-5" />}
              {selected.layer === 'Memory' && <Database className="w-5 h-5" />}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono text-slate-400 mb-2">TECH STACK & DEPENDENCIES</h4>
            <div className="flex flex-wrap gap-2">
              {selected.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 text-slate-300 border border-slate-700/80"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono text-slate-400 mb-3">TANGGUNG JAWAB & FITUR ARSITEKTUR</h4>
            <ul className="space-y-2.5">
              {selected.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="text-cyan-400 font-mono mt-0.5">·</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <h4 className="text-xs font-mono text-slate-400 mb-1">INTERAKSI LIFECYCLE AVATAR</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selected.layer === 'Frontend' && 'Mengubah bentuk wireframe dan pergerakan partikel sesuai event yang dipancarkan oleh Orchestrator.'}
              {selected.layer === 'Backend' && 'Menerima prompt, mengubah status avatar ke PROCESSING saat inferensi berjalan, lalu ke SPEAKING saat menghasilkan respon.'}
              {selected.layer === 'AI Core' && 'Mengevaluasi makna linguistik dan menghasilkan respon dengan instruksi kepribadian cerdas.'}
              {selected.layer === 'Data Worker' && 'Memicu status PROCESSING intensif saat komputasi Pandas berjalan, lalu kembali ke IDLE/SPEAKING setelah grafik siap.'}
              {selected.layer === 'Memory' && 'Menjaga riwayat konteks sehingga avatar mengingat preferensi pengguna antar transisi siklus.'}
            </p>
          </div>
        </div>

        {/* Right: Real Code Implementation Preview */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-slate-300">{selected.codeFilename}</span>
            </div>
            <span className="text-xs font-mono text-slate-500">SOURCE IMPLEMENTATION</span>
          </div>

          <div className="p-4 flex-1 overflow-x-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed">
            <pre className="text-slate-300">
              <code>{selected.codePreview}</code>
            </pre>
          </div>

          <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Modular & Decoupled Architecture</span>
            <span className="font-mono text-slate-500">Production Ready</span>
          </div>
        </div>
      </div>

      {/* Dynamic Avatar State Lifecycle Sequence */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Dynamic Avatar State Lifecycle Pipeline (Urutan Transisi)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Avatar berpindah status secara mulus tanpa pemutusan frame. Nilai opacity dan scale diinterpolasi menggunakan kurva lerp (linear interpolation) halus.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {[
            { name: 'HIDDEN', desc: 'Dormant, opacity 0, hemat sumber daya GPU', color: 'border-slate-700 text-slate-400' },
            { name: 'APPEARING', desc: 'Scanline naik, rotasi spiral icosahedron', color: 'border-sky-500/50 text-sky-400' },
            { name: 'IDLE', desc: 'Levitasi ritmis, nafas halo quantum', color: 'border-cyan-500/50 text-cyan-400' },
            { name: 'LISTENING', desc: 'Peka suara mikrofon, gelombang resonansi', color: 'border-emerald-500/50 text-emerald-400' },
            { name: 'PROCESSING', desc: 'Rotasi cepat 3x, vorteks partikel amber', color: 'border-amber-500/50 text-amber-400' },
            { name: 'SPEAKING', desc: 'Pulsasi sonik reaktif, audio TTS sinkron', color: 'border-indigo-500/50 text-indigo-400' },
            { name: 'DISAPPEARING', desc: 'Kolaps partikel, kembali ke dormant', color: 'border-rose-500/50 text-rose-400' },
          ].map((st, i) => (
            <div key={st.name} className={`p-3 rounded-lg bg-slate-950/70 border ${st.color}`}>
              <div className="text-[10px] font-mono text-slate-500 mb-1">FASE 0{i + 1}</div>
              <div className="text-xs font-bold font-mono tracking-wider">{st.name}</div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-snug">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
