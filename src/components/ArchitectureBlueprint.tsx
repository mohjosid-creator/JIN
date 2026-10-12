/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Database,
  Terminal,
  Shield,
  ArrowRight,
  Code,
  Server,
  Monitor,
  FileCode,
  CheckCircle2,
  Network,
  Zap,
  Lock,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';

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
    id: 'neural-fabric-kernel',
    name: 'Planetary-Scale Neural Fabric & Multi-Model Router',
    role: 'Orkestrasi multi-model heterogen (DeepSeek, Gemma, GLM, Llama, Qwen) & Otoritas Mas Joe (tanyabos)',
    layer: 'AI Core',
    techStack: [
      'DeepSeek V4.1 Flash',
      'Qwen 2.5 Math',
      'Gemma 4 Edge',
      'GLM 5.2 MiniAX',
      'Llama 3.3 Generative',
      'LanceDB Cluster',
      'Redis Enterprise Graph',
    ],
    responsibilities: [
      'Evaluasi kompleksitas prompt secara real-time (Token Complexity, Domain Specificity, Latency Budget < 50ms).',
      'Merutekan tugas ke Specialized Cognitive Micro-Agents: DeepSeek (penalaran cepat), Qwen (matematika/tensor), Gemma (edge on-device), GLM (dokumen/regulasi), Llama (sintesis kreatif/DAG).',
      'Zero-Copy Memory Sharing lintas-model via Shared Vector Space (LanceDB + Redis Graph Store).',
      'Ensemble Reasoning Pattern & Dynamic Circuit Breaker untuk ketersediaan Five Nines (99.999%).',
      'Menegakkan Master Authority Guardrail: Hanya Mas Joe (@mohjosid) dengan kode "tanyabos" yang berhak menghidupkan dan mematikan AI.',
    ],
    codeFilename: 'scripts/neural_fabric_router.py',
    codePreview: `class CognitiveAgentOrchestrator:
    def __init__(self):
        self.router = NeuralFabricRouter()
        self.memory = UnifiedMemoryStore()
        self.power_authority = MasJoePowerAuthority()

    async def execute(self, req: NeuralRoutingRequest):
        # 1. Master Security Check: Mas Joe & "tanyabos"
        is_power, state, msg = self.power_authority.evaluate_power_command(
            req.query, req.passcode
        )
        if is_power:
            return MultiModelResponseEnvelope(
                primary_response=msg,
                power_state=state,
                verified_by="ZeroTrustAuthLayer"
            )

        # 2. Dynamic Router Matrix (DeepSeek, Qwen, Gemma, GLM, Llama)
        decision = self.router.route_query(req.query)
        context = await self.memory.search_relevant_context(req.query)
        
        # 3. Consensus Verification & Synthesis
        return await self._dispatch_micro_agent(decision, context)`,
  },
  {
    id: 'frontend-avatar',
    name: 'Frontend: 3D Avatar & Web Interface',
    role: 'Visual rendering, user interaction, dan speech processing',
    layer: 'Frontend',
    techStack: ['Three.js WebGL', 'Web Speech API', 'React 19', 'Tailwind CSS'],
    responsibilities: [
      'Render 3D hologram avatar dengan geometri suci (icosahedron/dodecahedron) dan 750 partikel quantum.',
      'Mengelola siklus hidup status avatar (HIDDEN -> APPEARING -> IDLE -> LISTENING -> PROCESSING -> SPEAKING -> DISAPPEARING).',
      'Menangkap audio mikrofon via Web Speech Recognition dengan pause detection 700ms.',
      'Memutar suara respon AI secara progresif kalimat-demi-kalimat tanpa menunggu seluruh stream selesai.',
      'Floating Draggable Auto-Hide Gear HUD yang mengonsolidasikan seluruh 12 modul dan kontrol sistem.',
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
      'Menangani gateway API / SSE Stream dengan X-Accel-Buffering no dan TCP noDelay.',
      'Mengevaluasi perintah daya Mas Joe dan memvalidasi kode otorisasi "tanyabos".',
      'Menangani endpoint spesialisasi perintah cepat dengan latensi inisiasi < 50ms.',
      'Orkestrasi Meta WhatsApp Cloud API, LanceDB RAG, Multimedia DAG, dan Google Workspace.',
    ],
    codeFilename: 'server.ts',
    codePreview: `// Express Orchestrator & Neural Routing Pipeline
app.post('/api/jin/chat', async (req, res) => {
  const { message, passcode } = req.body;

  // 1. Master Authority Check (Mas Joe 'tanyabos')
  const powerCheck = evaluatePowerCommand(message, passcode);
  if (powerCheck.isPower) {
    return res.json({ reply: powerCheck.reply, powerState: powerCheck.state });
  }

  // 2. Neural Fabric Fast Specialization
  const route = routeNeuralIntent(message);
  if (route.isQuickSpecialized) {
    return res.json({
      reply: route.specializedResponse,
      selectedModel: route.selectedModel,
      latencyBudgetMs: 45
    });
  }
});`,
  },
  {
    id: 'ai-core',
    name: 'Core AI Engine: Gemini 3.8 Flash Cloud',
    role: 'Penalaran bahasa alami tingkat lanjut dan ingestion multimodal',
    layer: 'AI Core',
    techStack: ['@google/genai SDK', 'gemini-3.8-flash', 'Structured Outputs'],
    responsibilities: [
      'Memahami pertanyaan tingkat tinggi dan multi-turn conversation.',
      'Streaming teks real-time berbasis Server-Sent Events (SSE).',
      'Injeksi memori semantik jangka panjang Pinecone secara kontekstual.',
      'Fallback cerdas ke model lokal/edge (Gemma 4) saat offline.',
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
  model: 'gemini-3.8-flash',
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
      'Menyimpan representasi vektor embedding dari riwayat percakapan dan profil preferensi Mas Joe.',
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
  const [selectedComponentId, setSelectedComponentId] = useState<string>('neural-fabric-kernel');
  const [activeDiagramTab, setActiveDiagramTab] = useState<'routing' | 'knowledge' | 'consensus' | 'authority'>('routing');

  const selected = architectureComponents.find((c) => c.id === selectedComponentId) || architectureComponents[0];

  const mermaidDiagrams = {
    routing: `flowchart TD
    User([Mas Joe / Inbound Ingress]) --> IngressGateway[FastAPI / Node.js Ingress Gateway]
    IngressGateway --> UNRM[Unified Neural Routing Matrix UNRM]
    
    subgraph Analysis [Intent & Complexity Analysis]
        UNRM --> TC[Token Complexity Evaluator]
        UNRM --> DS[Domain Specificity Classifier]
        UNRM --> LB[Latency Budgeting < 50ms]
    end

    TC & DS & LB --> Dispatcher{Dynamic Router Dispatcher}

    Dispatcher -->|Math / Code / Tensor| Qwen[Qwen 2.5 / 3.5 Math]
    Dispatcher -->|Ultra-Fast Reasoning| DeepSeek[DeepSeek V4.1 Flash]
    Dispatcher -->|On-Device / Offline| Gemma[Gemma 4 Edge Cognitive]
    Dispatcher -->|Formal Docs & ISO| GLM[GLM 5.2 / 5.3 MiniAX]
    Dispatcher -->|Creative Synthesis| Llama[Llama 3.3 Generative]
    Dispatcher -->|Cloud Multimodal| Gemini[Gemini 3.8 Flash Cloud]`,

    knowledge: `graph LR
    subgraph ZeroCopyMemory [Shared Vector & Graph Space]
        LanceDB[(LanceDB Hybrid Vector Cluster)]
        RedisGraph[(Redis Enterprise Graph Store)]
        Pinecone[(Pinecone Semantic Cloud Index)]
    end

    DeepSeek[DeepSeek V4.1] <-->|Zero-Copy mmap| LanceDB
    Qwen[Qwen 2.5] <-->|Zero-Copy mmap| LanceDB
    GLM[GLM 5.2] <-->|Entity Relationship| RedisGraph
    Llama[Llama 3.3] <-->|Semantic Context| Pinecone
    Gemma[Gemma 4] <-->|Local Embeddings| LanceDB`,

    consensus: `sequenceDiagram
    autonumber
    actor MasJoe as Mas Joe (@mohjosid)
    participant Gateway as Ingress Gateway
    participant Router as NeuralFabricRouter
    participant Primary as Primary Model (DeepSeek)
    participant Verifier as Cross-Verifier (Qwen / Llama)
    participant Guardrail as Deterministic Output Alignment

    MasJoe->>Gateway: Perintah Cepat / Analisis Kompleks
    Gateway->>Router: Route Intent & Latency Budget
    Router->>Primary: Dispatch Generation (<50ms)
    Primary-->>Router: Initial Synthesis Tokens
    Router->>Verifier: Asynchronous Cross-Verification
    Verifier-->>Router: Consensus Score (0.98+)
    Router->>Guardrail: Enterprise Alignment Filter
    Guardrail-->>Gateway: Verified Payload Envelope
    Gateway-->>MasJoe: Instant Progressive Response`,

    authority: `flowchart TD
    Command([Perintah Masuk: Matikan / Hidupkan AI]) --> AuthGuard{Master Passcode Checker}
    
    AuthGuard -->|Passcode == 'tanyabos'| Authorized[Otorisasi Mas Joe DITERIMA]
    AuthGuard -->|Tanpa Kode / Salah| Denied[Akses Ditolak: 403 Forbidden]

    Authorized --> Action{Jenis Perintah}
    Action -->|Matikan / Shutdown| SafeSleep[Status: DEACTIVATED / Safe Sleep]
    Action -->|Hidupkan / Wake| FullOnline[Status: ONLINE / Full Neural Fabric Active]

    SafeSleep --> Avatar1[Avatar Three.js: DISAPPEARING -> HIDDEN]
    FullOnline --> Avatar2[Avatar Three.js: APPEARING -> IDLE]

    Denied --> Feedback[Respon: 'Hanya Mas Joe yang memiliki hak akses penuh dengan kode tanyabos']`
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>JIN v2.0 ENTERPRISE ARCHITECTURE SPECIFICATION</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Planetary-Scale Heterogeneous Multi-Model Neural Fabric
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Arsitektur terdistribusi yang menyatukan DeepSeek V4.1 Flash, Gemma 4, GLM 5.2/5.3, Llama 3.3, dan Qwen 2.5 ke dalam satu Unified Neural State Fabric dengan latensi inisiasi &lt; 50ms dan proteksi otoritas penuh Mas Joe (<span className="text-amber-300 font-mono">tanyabos</span>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>FIVE NINES (99.999%)</span>
            </span>
            <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800">
              P99 &lt; 50ms TTFT
            </span>
          </div>
        </div>
      </div>

      {/* Formal Architecture Diagrams (Mermaid Specifications) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              DIAGRAM SPESIFIKASI ARSITEKTUR FORMAL (MERMAID)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveDiagramTab('routing')}
              className={`px-3 py-1 rounded transition-colors ${
                activeDiagramTab === 'routing'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Neural Routing Matrix
            </button>
            <button
              onClick={() => setActiveDiagramTab('knowledge')}
              className={`px-3 py-1 rounded transition-colors ${
                activeDiagramTab === 'knowledge'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Shared Vector Fabric
            </button>
            <button
              onClick={() => setActiveDiagramTab('consensus')}
              className={`px-3 py-1 rounded transition-colors ${
                activeDiagramTab === 'consensus'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Multi-Agent Consensus
            </button>
            <button
              onClick={() => setActiveDiagramTab('authority')}
              className={`px-3 py-1 rounded transition-colors ${
                activeDiagramTab === 'authority'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4. Otoritas Mas Joe (tanyabos)
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-950/70">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
            <div className="text-[11px] font-mono text-cyan-400 mb-2 uppercase tracking-wider">
              {activeDiagramTab === 'routing' && 'Diagram Topologi Neural Routing & Ingress Gateway (UNRM)'}
              {activeDiagramTab === 'knowledge' && 'Diagram Zero-Copy Shared Vector Space & Graph Fabric'}
              {activeDiagramTab === 'consensus' && 'Diagram Alur Multi-Agent Delegation & Ensemble Verification'}
              {activeDiagramTab === 'authority' && 'Diagram Keamanan Otoritas Mas Joe & Passcode "tanyabos" Lifecycle'}
            </div>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre leading-relaxed">
              <code>{mermaidDiagrams[activeDiagramTab]}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Component Selection Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {architectureComponents.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedComponentId(c.id)}
            className={`p-3 text-left rounded-xl border transition-all ${
              selectedComponentId === c.id
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100'
            }`}
          >
            <div className="text-[10px] font-mono text-slate-500 mb-0.5">{c.layer}</div>
            <div className="text-xs font-semibold truncate">{c.name}</div>
          </button>
        ))}
      </div>

      {/* Selected Component Deep-Dive Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Detail Card */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                {selected.layer} SUBSYSTEM SPECIFICATION
              </span>
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
        </div>

        {/* Right: Real Code Implementation Preview */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-slate-300">{selected.codeFilename}</span>
            </div>
            <span className="text-xs font-mono text-emerald-400">PRODUCTION KERNEL</span>
          </div>

          <div className="p-4 flex-1 overflow-x-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed">
            <pre className="text-slate-300">
              <code>{selected.codePreview}</code>
            </pre>
          </div>

          <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Modular &amp; Heterogeneous Multi-Model</span>
            <span className="font-mono text-slate-500">Zero-Trust Guardrail</span>
          </div>
        </div>
      </div>
    </div>
  );
};
