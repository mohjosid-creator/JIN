/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Presentation, FileText, Download, ShieldCheck, Plus, CheckCircle2, Lock, Key, Terminal, Code, Layers, Sparkles, RefreshCw } from 'lucide-react';
import { EnterpriseDocument } from '../types/jin';

export const EnterpriseDocsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'documents' | 'security' | 'code'>('generator');
  const [documents, setDocuments] = useState<EnterpriseDocument[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [docTitle, setDocTitle] = useState('Laporan Konsolidasi Finansial & Operasional Q2 2026');
  const [docFormat, setDocFormat] = useState<'google_sheets' | 'google_slides' | 'google_docs' | 'ms_excel' | 'ms_powerpoint'>('google_sheets');
  const [templateType, setTemplateType] = useState<'financial_quarterly' | 'executive_deck' | 'sop_governance'>('financial_quarterly');

  const [authStatus, setAuthStatus] = useState<{
    googleWorkspace: { connected: boolean; serviceAccount: string };
    microsoftGraph: { connected: boolean; tenantId: string };
    rbacRole: string;
  } | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/jin/documents/list');
      const data = await res.json();
      if (data && data.documents) {
        setDocuments(data.documents);
        setAuthStatus(data.authStatus);
      }
    } catch (err) {
      console.warn('Failed to load docs:', err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/jin/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          format: docFormat,
          templateType,
        }),
      });
      const data = await res.json();
      if (data) {
        setDocuments((prev) => [data, ...prev]);
        setActiveTab('documents');
      }
    } catch (err) {
      console.error('Failed to generate doc:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded">
              Native Cloud Microservice
            </span>
            <span className="text-xs text-slate-400 font-mono">Google Workspace & Microsoft 365 Graph</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 mt-1">
            Enterprise Document & Automated Report Generator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ekstraksi JSON dan penulisan formula dinamis (SUM, AVERAGE, Variance Analysis) serta deck presentasi eksekutif otomatis
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'generator' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Generator Template
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'documents' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Katalog Dokumen ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'security' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Keamanan & RBAC
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'code' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Python Microservice
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Generation form */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Suntik Data JSON & Susun Dokumen</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Format Dokumen Target
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDocFormat('google_sheets');
                      setTemplateType('financial_quarterly');
                    }}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      docFormat === 'google_sheets'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium">Google Sheets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDocFormat('google_slides');
                      setTemplateType('executive_deck');
                    }}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      docFormat === 'google_slides'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Presentation className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">Google Slides</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDocFormat('ms_excel');
                      setTemplateType('financial_quarterly');
                    }}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      docFormat === 'ms_excel'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-400" />
                    <span className="font-medium">Microsoft Excel (Graph)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDocFormat('ms_powerpoint');
                      setTemplateType('executive_deck');
                    }}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      docFormat === 'ms_powerpoint'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Presentation className="w-4 h-4 text-orange-400" />
                    <span className="font-medium">PowerPoint (Graph)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Judul Dokumen / Laporan
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Tipe Template Dinamis
                </label>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="financial_quarterly">Laporan Keuangan & Variansi Kas (Audit Trail)</option>
                  <option value="executive_deck">Presentasi Strategis Dewan Eksekutif (8 Slide)</option>
                  <option value="sop_governance">Dokumen SOP Tata Kelola & Kebijakan Keamanan</option>
                </select>
              </div>

              {/* Formula Generation Preview */}
              {(docFormat === 'google_sheets' || docFormat === 'ms_excel') && (
                <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-lg space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Formula Terpasang Otomatis:
                  </span>
                  <div className="text-[11px] font-mono text-slate-300 space-y-1">
                    <div>• =SUM(B2:B50) [Konsolidasi Omset]</div>
                    <div>• =AVERAGE(C2:C50) [Rata-rata Margin]</div>
                    <div>• =VAR.P(D2:D50) [Deviasi Pengeluaran Variabel]</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyuntikkan Data ke API Cloud...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Dokumen Terenkripsi</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive Live Preview of Generated Document */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Pratinjau Spreadsheet Finansial (Formula Aktif)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 rounded">
                  Status: Sinkron Google Drive
                </span>
              </div>

              {/* Interactive Mini Sheet Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-slate-300 border border-slate-800 rounded">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-left">
                      <th className="p-2 border-r border-slate-800">Baris</th>
                      <th className="p-2 border-r border-slate-800">Unit Bisnis</th>
                      <th className="p-2 border-r border-slate-800">Pendapatan ($)</th>
                      <th className="p-2 border-r border-slate-800">Beban Pokok ($)</th>
                      <th className="p-2 border-r border-slate-800">Margin (%)</th>
                      <th className="p-2">Status Audit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="p-2 border-r border-slate-800 text-slate-500">2</td>
                      <td className="p-2 border-r border-slate-800">AI Platform Enterprise</td>
                      <td className="p-2 border-r border-slate-800 font-semibold text-emerald-400">420,000</td>
                      <td className="p-2 border-r border-slate-800">115,000</td>
                      <td className="p-2 border-r border-slate-800">72.6%</td>
                      <td className="p-2 text-emerald-400">PASSED</td>
                    </tr>
                    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="p-2 border-r border-slate-800 text-slate-500">3</td>
                      <td className="p-2 border-r border-slate-800">WhatsApp Gateway SaaS</td>
                      <td className="p-2 border-r border-slate-800 font-semibold text-emerald-400">310,500</td>
                      <td className="p-2 border-r border-slate-800">92,000</td>
                      <td className="p-2 border-r border-slate-800">70.3%</td>
                      <td className="p-2 text-emerald-400">PASSED</td>
                    </tr>
                    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="p-2 border-r border-slate-800 text-slate-500">4</td>
                      <td className="p-2 border-r border-slate-800">Multimedia Render Core</td>
                      <td className="p-2 border-r border-slate-800 font-semibold text-emerald-400">185,200</td>
                      <td className="p-2 border-r border-slate-800">64,000</td>
                      <td className="p-2 border-r border-slate-800">65.4%</td>
                      <td className="p-2 text-emerald-400">PASSED</td>
                    </tr>
                    {/* Formula Calculation Rows */}
                    <tr className="bg-slate-950 font-bold text-slate-100 border-t-2 border-slate-700">
                      <td className="p-2 border-r border-slate-800 text-slate-400">Σ</td>
                      <td className="p-2 border-r border-slate-800 text-cyan-300">=SUM(C2:C4)</td>
                      <td className="p-2 border-r border-slate-800 text-cyan-400">$915,700</td>
                      <td className="p-2 border-r border-slate-800 text-slate-300">$271,000</td>
                      <td className="p-2 border-r border-slate-800 text-emerald-400">70.4% [AVG]</td>
                      <td className="p-2 text-cyan-400">AUDITED OK</td>
                    </tr>
                    <tr className="bg-slate-950/80 text-amber-300 text-[10px]">
                      <td className="p-2 border-r border-slate-800 text-slate-400">VAR</td>
                      <td className="p-2 border-r border-slate-800" colSpan={2}>
                        =VAR.P(C2:C4) [Variansi Volatilitas]
                      </td>
                      <td className="p-2" colSpan={3}>
                        Index Variansi: 11,420.5 (Terkendali & Stabil)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents List Tab */}
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
                    <span className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
                      {doc.format.includes('sheet') || doc.format.includes('excel') ? (
                        <FileSpreadsheet className="w-4 h-4" />
                      ) : (
                        <Presentation className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{doc.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{doc.id} · {doc.format}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {doc.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded border border-slate-800/80">
                  {doc.generatedFormulas ? doc.generatedFormulas.join('\n') : `Deck Outline: ${doc.slideCount} Slide Eksekutif`}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                  <span>Izin: {doc.rbacRole}</span>
                  <span className="text-cyan-400 font-medium">Autentikasi: {doc.authMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security & RBAC Tab */}
      {activeTab === 'security' && (
        <div className="space-y-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Matriks Keamanan Token & RBAC (Role-Based Access Control)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-emerald-300">Google Cloud Service Account JWT</span>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                SA: jin-worker-sa@iam.gserviceaccount.com
              </p>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>• Scopes: drive.file, spreadsheets, presentations</div>
                <div>• Token Signing: RS256 with auto-rotation 60m</div>
                <div>• Sanitasi Input: Mengeliminasi injeksi formula (=cmd|' /C')</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-cyan-300">Microsoft Graph v1.0 OAuth 2.0 PKCE</span>
                <Key className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Tenant: jin-enterprise-graph-prod
              </p>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>• Scopes: Files.ReadWrite, Sites.ReadWrite.All</div>
                <div>• Otoritas Tertinggi (OWNER): Mas Joe (@mohjosid)</div>
                <div>• Enkripsi At-Rest: AES-256-GCM</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Python Microservice Code Tab */}
      {activeTab === 'code' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Microservice Layanan Dokumen: doc_engine.py</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">Python 3.11 · Google API Client</span>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[450px]">
{`"""
JIN v2.0 Enterprise: Document Generation & Cloud Workspace Microservice
Author: Lead Enterprise Software Engineer for Mas Joe
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
import json
import re

class EnterpriseDocumentWorker:
    def __init__(self, credentials_path: str = "service_account.json"):
        self.creds = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=[
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/presentations"
            ]
        )
        self.sheets_service = build("sheets", "v4", credentials=self.creds)
        self.slides_service = build("slides", "v1", credentials=self.creds)

    def sanitize_input(self, val: str) -> str:
        """Sanitizes user input to prevent DDE / CSV injection vulnerabilities."""
        if isinstance(val, str) and val.startswith(('=', '+', '-', '@')):
            return f"'{val}"
        return val

    def inject_financial_data_with_formulas(self, spreadsheet_id: str, raw_json_data: list):
        """Injects JSON rows and appends automated statistical formulas."""
        rows = [["ID", "Unit", "Revenue", "Expense", "Margin", "Audit"]]
        for item in raw_json_data:
            rows.append([
                item["id"],
                self.sanitize_input(item["unit"]),
                item["revenue"],
                item["expense"],
                f"=C{len(rows)} - D{len(rows)}", # Dynamic margin formula
                "PASSED"
            ])
            
        # Append Automated Aggregate Summary
        last_row = len(rows)
        rows.append(["TOTAL", "AGGREGATE", f"=SUM(C2:C{last_row})", f"=SUM(D2:D{last_row})", f"=AVERAGE(E2:E{last_row})", "=IF(C{last_row+1}>100000, 'EXCEEDED', 'STABLE')"])
        rows.append(["VARIANCE", "STATISTICAL", f"=VAR.P(C2:C{last_row})", f"=VAR.P(D2:D{last_row})", "-", "-"])

        body = {"values": rows}
        return self.sheets_service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range="A1",
            valueInputOption="USER_ENTERED",
            body=body
        ).execute()
`}
          </pre>
        </div>
      )}
    </div>
  );
};
