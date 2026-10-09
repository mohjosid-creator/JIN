/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Database, Search, Plus, Sparkles, Filter, Check, Clock } from 'lucide-react';
import { VectorMemoryEntry } from '../types/jin';

export const VectorMemoryInspector: React.FC = () => {
  const [memories, setMemories] = useState<VectorMemoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'conversation' | 'data_insight' | 'system_rule' | 'architecture'>('conversation');
  const [loading, setLoading] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/jin/memory', window.location.origin);
      if (searchQuery) url.searchParams.set('query', searchQuery);
      if (selectedCategory !== 'all') url.searchParams.set('category', selectedCategory);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setMemories(data.results || []);
      }
    } catch (err) {
      console.error('Fetch memories error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [searchQuery, selectedCategory]);

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/jin/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setIsAddingNew(false);
        fetchMemories();
      }
    } catch (err) {
      console.error('Failed to create memory:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Index Stats */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>PINECONE VECTOR DATABASE</span>
              <span>·</span>
              <span>SEMANTIC LONG-TERM MEMORY</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Konteks Memori Semantik JIN
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Penyimpanan vektor eksternal untuk melacak fakta jangka panjang, preferensi percakapan,
              dan aturan inferensi arsitektur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Memori Baru</span>
            </button>
          </div>
        </div>

        {/* Index Metrics Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Total Vektor Tersimpan</div>
            <div className="text-lg font-semibold font-mono text-slate-200 mt-0.5">{memories.length} item</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Dimensi Vektor</div>
            <div className="text-lg font-semibold font-mono text-indigo-400 mt-0.5">1536 dim</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Metrik Kemiripan</div>
            <div className="text-lg font-semibold font-mono text-cyan-400 mt-0.5">Cosine Similarity</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Status Replikasi</div>
            <div className="text-lg font-semibold font-mono text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sinkron</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Memory Modal / Form */}
      {isAddingNew && (
        <form onSubmit={handleCreateMemory} className="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Simpan Konteks Memori Vektor Baru</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">JUDUL ENTITAS MEMORI</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Preferensi Pengguna Server Timeout"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">KATEGORI VECTOR</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="conversation">conversation (Riwayat Dialog)</option>
                <option value="data_insight">data_insight (Hasil Analisis)</option>
                <option value="system_rule">system_rule (Aturan Sistem)</option>
                <option value="architecture">architecture (Desain Teknis)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">KONTEN TEKSTUAL (UNTUK DIVEKTORISASI)</label>
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Deskripsi detail konteks yang akan di-embedding dan disimpan..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
            >
              Komit ke Pinecone
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari memori berdasarkan kemiripan semantik query..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['all', 'conversation', 'data_insight', 'system_rule', 'architecture'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Entries List */}
      <div className="space-y-3">
        {memories.map((entry) => (
          <div
            key={entry.id}
            className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono text-indigo-400 font-semibold">{entry.id}</span>
                <h4 className="text-sm font-semibold text-slate-200">{entry.title}</h4>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400 capitalize">{entry.category.replace('_', ' ')}</span>
              </div>

              {entry.similarity !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">Similarity:</span>
                  <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${
                    entry.similarity > 0.8
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40'
                      : entry.similarity > 0.5
                      ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40'
                      : 'border-slate-700 text-slate-400 bg-slate-800/40'
                  }`}>
                    {Math.round(entry.similarity * 100)}%
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {entry.content}
            </p>

            {/* Vector Embedding Visualizer Preview */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Embedding Preview:</span>
                <div className="flex items-center gap-1">
                  {entry.vectorPreview.map((val, i) => (
                    <div
                      key={i}
                      title={`dim[${i}]: ${val}`}
                      className="w-4 h-3 rounded-xs"
                      style={{
                        backgroundColor: val > 0 ? `rgba(99, 102, 241, ${Math.abs(val)})` : `rgba(239, 68, 68, ${Math.abs(val)})`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{new Date(entry.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
