/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Database, Search, Cpu, Zap, FileText, CheckCircle2, RefreshCw, Layers, Sliders, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { LocalRagDoc, RagQueryResult } from '../types/jin';

export const LocalOfflineRagHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'documents' | 'architecture'>('search');
  const [documents, setDocuments] = useState<LocalRagDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('arsitektur JIN dan otoritas Mas Joe');
  const [queryResult, setQueryResult] = useState<RagQueryResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hybridWeight, setHybridWeight] = useState(0.6); // 0.6 Dense, 0.4 BM25

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/jin/rag/documents');
      const data = await res.json();
      if (data && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.warn('Failed to load RAG docs:', err);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/jin/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data) {
        setQueryResult(data);
      }
    } catch (err) {
      console.error('RAG search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    handleSearch();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800 rounded">
              Sub-15ms Latency
            </span>
            <span className="text-xs text-slate-400 font-mono">LanceDB & ChromaDB · Hybrid Dense + BM25 RRF</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 mt-1">
            Local Offline RAG (Retrieval-Augmented Generation)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencarian vektor dan pemeringkat hybrid 100% offline tanpa ketergantungan internet untuk privasi penuh dokumen Mas Joe
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'search' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pencarian Hybrid
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'documents' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Indeks Dokumen ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'architecture' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Arsitektur RAG
          </button>
        </div>
      </div>

      {/* Search Benchmark Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search bar & filter */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik query semantik (misal: 'otoritas Mas Joe', 'lifecycle 3D avatar')..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Eksekusi RAG</span>
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4 pt-2 border-t border-slate-800/60 font-mono">
              <div className="flex items-center gap-3">
                <span>Rerank Fusion: Dense {Math.round(hybridWeight * 100)}% / BM25 {Math.round((1 - hybridWeight) * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={hybridWeight}
                  onChange={(e) => setHybridWeight(parseFloat(e.target.value))}
                  className="w-24 accent-cyan-400"
                />
              </div>

              {queryResult && (
                <div className="flex items-center gap-3 text-cyan-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Latensi Pencarian: {queryResult.executionTimeMs}ms (Sub-15ms Target)</span>
                </div>
              )}
            </div>
          </div>

          {/* Results List */}
          {queryResult && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>Potongan Teks Dokumen Hasil Reranking RRF</span>
                <span className="text-xs font-mono text-slate-400">
                  {queryResult.retrievedChunks.length} Chunk Terindeks Teratas
                </span>
              </h3>

              <div className="space-y-3">
                {queryResult.retrievedChunks.map((chunk) => (
                  <div
                    key={chunk.docId + chunk.rank}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold flex items-center justify-center">
                            #{chunk.rank}
                          </span>
                          <h4 className="text-xs font-bold text-slate-100">{chunk.docTitle}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                          ID: {chunk.docId}
                        </span>
                      </div>

                      {/* Score metrics */}
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          Dense: {(chunk.denseScore * 100).toFixed(1)}%
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          BM25: {(chunk.bm25Score * 100).toFixed(1)}%
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                          Hybrid: {(chunk.hybridScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                      &quot;{chunk.text}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents Index Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-cyan-950 text-cyan-400 rounded-lg border border-cyan-800">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{doc.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{doc.fileType} · {doc.id}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    BM25 OK
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-800/80 line-clamp-3">
                  {doc.contentPreview}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                  <span>{doc.chunkCount} Chunks</span>
                  <span>{doc.totalTokens.toLocaleString()} Token</span>
                  <span className="text-cyan-400">{doc.denseVectorDim}-dim</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architecture Tab */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-200">
            Spesifikasi Local Offline Hybrid RAG Engine JIN v2.0
          </h4>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`+-----------------------------------------------------------------------------------------+
|                  LOCAL OFFLINE RAG PIPELINE (LanceDB / ChromaDB)                        |
+-----------------------------------------------------------------------------------------+

 [Ingest PDF/DOCX/TXT Dokumen Mas Joe]
                |
                v
 [RecursiveCharacterTextSplitter] (Chunk: 512 token, Overlap: 64 token)
                |
                +---------------------------------------+
                |                                       |
                v                                       v
 [Dense Vector Embeddings]                     [BM25 Inverted Index]
  Model: BAAI/bge-small-en-v1.5 (dim=384)       Term Frequency & Inverse Doc Freq
  Storage: LanceDB Columnar NVMe Store          Storage: Local In-Memory Trie
  Latency: ~4.2ms                               Latency: ~1.8ms
                |                                       |
                +-------------------+-------------------+
                                    |
                                    v
                     [Reciprocal Rank Fusion (RRF)]
                     Score = w_dense * Score_dense + w_bm25 * Score_bm25
                                    |
                                    v
                     [Top-K Reranked Context Injection]
                                    |
                                    v
                     [Ollama Local LLM (Llama 3 8B)]
                      Zero-Internet Full Offline Privacy`}
          </pre>
        </div>
      )}
    </div>
  );
};
