/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Terminal, Database, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { DataAnalysisResult } from '../types/jin';

interface PythonWorkerWorkbenchProps {
  onAnalysisComplete?: (result: DataAnalysisResult) => void;
  onSendInsightToChat?: (text: string) => void;
}

export const PythonWorkerWorkbench: React.FC<PythonWorkerWorkbenchProps> = ({
  onAnalysisComplete,
  onSendInsightToChat,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<'iot_sensors' | 'finance_sales' | 'network_logs'>('iot_sensors');
  const [isRunning, setIsRunning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DataAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'code' | 'logs'>('visualizer');

  const pythonScript = `"""
JIN Intelligent Network - External Python Worker
Script: analyzer.py
Dependencies: pandas>=2.2.0, numpy>=1.26.0, scipy>=1.12.0, matplotlib>=3.8.0
"""
import sys
import json
import pandas as pd
import numpy as np

def run_analysis_pipeline(dataset_type: str = "${selectedDataset}"):
    print(f"[Python Worker] Memulai pemrosesan dataset: {dataset_type}")
    
    # 1. Ingest Data
    if dataset_type == "iot_sensors":
        data = {
            'timestamp': pd.date_range(start='2026-10-01', periods=1420, freq='1min'),
            'core_temp_c': np.random.normal(68.5, 4.2, 1420),
            'vibration_hz': np.random.normal(140.0, 15.0, 1420),
            'pressure_psi': np.random.normal(50.0, 5.0, 1420)
        }
    df = pd.DataFrame(data)
    
    # 2. Pembersihan & Imputasi
    df.fillna(method='bfill', inplace=True)
    
    # 3. Analisis Statistik & Deteksi Anomali (3-Sigma)
    rolling_mean = df['vibration_hz'].rolling(window=15).mean()
    rolling_std = df['vibration_hz'].rolling(window=15).std()
    anomalies = df[np.abs(df['vibration_hz'] - rolling_mean) > (3 * rolling_std)]
    
    print(f"[Worker Result] Baris diproses: {len(df)}, Anomali: {len(anomalies)}")
    return {
        "status": "SUCCESS",
        "row_count": len(df),
        "anomalies_detected": len(anomalies)
    }

if __name__ == "__main__":
    result = run_analysis_pipeline()
    print(json.dumps(result, indent=2))
`;

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/jin/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasetType: selectedDataset }),
      });

      if (!response.ok) throw new Error('Worker response failed');

      const data: DataAnalysisResult = await response.json();
      setAnalysisResult(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
    } catch (err) {
      console.error('Python worker execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Dataset Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <span>PYTHON WORKER ENGINE</span>
              <span>·</span>
              <span>analyzer.py DATA SUBSYSTEM</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Data Analysis Worker & Sandbox
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Engine Python independen yang mengeksekusi komputasi numerik Pandas, deteksi anomali, dan rendering time-series.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAnalysis}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengeksekusi Python...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Jalankan analyzer.py</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dataset Selector Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-slate-400">PILIH DATASET INPUT:</span>
          {[
            { id: 'iot_sensors', label: 'IoT Industrial Sensor Array (v3.4)' },
            { id: 'finance_sales', label: 'Kuartal Penjualan & Margin Finansial' },
            { id: 'network_logs', label: 'Telemetri Jaringan Mikroservis' },
          ].map((ds) => (
            <button
              key={ds.id}
              onClick={() => {
                setSelectedDataset(ds.id as any);
                setAnalysisResult(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedDataset === ds.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {ds.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Code vs Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Script Preview & Stdout Terminal */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-slate-300">analyzer.py (Pandas Engine)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">PYTHON 3.11</span>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 max-h-[360px] overflow-y-auto leading-relaxed">
              <pre>
                <code>{pythonScript}</code>
              </pre>
            </div>
          </div>

          {/* Execution Terminal Stdout */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">STDOUT CONSOLE OUTPUT</span>
              <span className="text-[10px] font-mono text-slate-500">
                {analysisResult ? `${analysisResult.executionTimeMs}ms` : 'IDLE'}
              </span>
            </div>
            <div className="p-4 font-mono text-xs text-emerald-400 space-y-1 bg-black/90 min-h-[140px] max-h-[220px] overflow-y-auto">
              {analysisResult ? (
                analysisResult.stdoutLogs.map((log, i) => (
                  <div key={i} className="leading-snug">
                    <span className="text-slate-600 select-none">› </span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 italic">
                  Klik "Jalankan analyzer.py" untuk memicu eksekusi pipeline data...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Analysis Results & Matplotlib-style Chart */}
        <div className="lg:col-span-6 space-y-4">
          {analysisResult ? (
            <>
              {/* Statistical Metrics Bento Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Hasil Analisis: {analysisResult.datasetName}</span>
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded">
                    EXIT CODE: 0
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                    <div className="text-[11px] text-slate-400">Total Baris Data</div>
                    <div className="text-base font-semibold font-mono text-slate-100 tabular-nums">
                      {analysisResult.rowCount.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                    <div className="text-[11px] text-slate-400">Anomali Terdeteksi</div>
                    <div className="text-base font-semibold font-mono text-rose-400 tabular-nums flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{analysisResult.anomaliesDetected}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                    <div className="text-[11px] text-slate-400">Waktu Eksekusi</div>
                    <div className="text-base font-semibold font-mono text-cyan-400 tabular-nums">
                      {analysisResult.executionTimeMs} ms
                    </div>
                  </div>

                  {Object.entries(analysisResult.metrics).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 truncate">{key}</div>
                      <div className="text-base font-semibold font-mono text-slate-200 tabular-nums">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Statement */}
                <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
                  <span className="font-semibold text-amber-300">Ringkasan Worker: </span>
                  {analysisResult.summaryText}
                </div>

                {/* Send insight to JIN chat trigger */}
                {onSendInsightToChat && (
                  <button
                    onClick={() => onSendInsightToChat(`Tolong jelaskan ringkasan analisis data ${analysisResult.datasetName}: ${analysisResult.summaryText}`)}
                    className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Kirim Hasil Analisis Ini ke JIN Agent Chat</span>
                  </button>
                )}
              </div>

              {/* Matplotlib-Style Visualizer Chart */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    MATPLOTLIB RENDERING SIMULATOR
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    {analysisResult.chartData.series.map((s) => (
                      <div key={s.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color || '#38bdf8' }} />
                        <span className="text-slate-300 font-mono text-[11px]">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SVG Visualizer Chart */}
                <div className="w-full h-48 bg-slate-950 rounded-lg p-3 border border-slate-800 flex flex-col justify-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

                    {/* Polyline Series */}
                    {analysisResult.chartData.series.map((series) => {
                      const maxVal = Math.max(...series.values) * 1.15;
                      const points = series.values
                        .map((v, idx) => {
                          const x = (idx / (series.values.length - 1)) * 500;
                          const y = 110 - (v / maxVal) * 95;
                          return `${x},${y}`;
                        })
                        .join(' ');

                      return (
                        <g key={series.name}>
                          <polyline
                            fill="none"
                            stroke={series.color || '#38bdf8'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                          />
                          {series.values.map((v, idx) => {
                            const x = (idx / (series.values.length - 1)) * 500;
                            const y = 110 - (v / maxVal) * 95;
                            return (
                              <circle
                                key={idx}
                                cx={x}
                                cy={y}
                                r="3.5"
                                fill={series.color || '#38bdf8'}
                                stroke="#020617"
                                strokeWidth="1.5"
                              />
                            );
                          })}
                        </g>
                      );
                    })}
                  </svg>

                  {/* X Axis Labels */}
                  <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
                    {analysisResult.chartData.labels.map((lbl, idx) => (
                      <span key={idx}>{lbl}</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/80 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
              <Database className="w-10 h-10 text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">Data Analyzer Siap</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Jalankan script Python analyzer.py untuk membaca dataset, menghitung statistik kuantitatif, dan menghasilkan visualisasi metrik.
              </p>
              <button
                onClick={handleRunAnalysis}
                disabled={isRunning}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                Jalankan Eksekusi Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
