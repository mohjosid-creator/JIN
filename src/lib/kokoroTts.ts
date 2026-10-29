/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { KokoroTTS } from 'kokoro-js';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
export const KOKORO_VOICE = 'af_heart';

export type KokoroStatus = 'idle' | 'loading' | 'ready' | 'error';

let instance: KokoroTTS | null = null;
let loadPromise: Promise<KokoroTTS | null> | null = null;
let status: KokoroStatus = 'idle';
const listeners = new Set<(s: KokoroStatus) => void>();

const setStatus = (next: KokoroStatus) => {
  status = next;
  listeners.forEach((fn) => fn(next));
};

export const getKokoroStatus = () => status;

export const subscribeKokoroStatus = (fn: (s: KokoroStatus) => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const getKokoroIfReady = () => instance;

// The model (~90MB, q8) is fetched from Hugging Face on first use and then cached by the browser.
export const loadKokoro = (): Promise<KokoroTTS | null> => {
  if (instance) return Promise.resolve(instance);
  if (loadPromise) return loadPromise;

  setStatus('loading');
  loadPromise = (async () => {
    try {
      const { KokoroTTS } = await import('kokoro-js');
      const hasWebGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
      instance = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: hasWebGpu ? 'fp32' : 'q8',
        device: hasWebGpu ? 'webgpu' : 'wasm',
      });
      setStatus('ready');
      return instance;
    } catch (err) {
      console.warn('Kokoro TTS failed to load:', err);
      loadPromise = null;
      setStatus('error');
      return null;
    }
  })();
  return loadPromise;
};

const INDONESIAN_WORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'dengan', 'untuk', 'tidak', 'ada', 'saya',
  'anda', 'kamu', 'akan', 'bisa', 'sudah', 'juga', 'atau', 'pada', 'karena', 'adalah', 'dalam',
  'kita', 'kami', 'mereka', 'apa', 'bagaimana', 'sedang', 'belum', 'lebih', 'sangat', 'hanya',
  'jika', 'kalau', 'seperti', 'oleh', 'baik', 'terima', 'kasih', 'halo', 'tolong', 'silakan',
]);

const ENGLISH_WORDS = new Set([
  'the', 'and', 'is', 'are', 'was', 'were', 'you', 'your', 'this', 'that', 'with', 'for', 'of',
  'to', 'in', 'it', 'not', 'have', 'has', 'can', 'will', 'would', 'what', 'how', 'be', 'on',
  'i', 'we', 'they', 'there', 'here', 'from', 'about', 'please', 'thank', 'hello', 'do', 'does',
]);

export const isLikelyEnglish = (text: string): boolean => {
  const words = text.toLowerCase().match(/[a-z']+/g);
  if (!words || words.length < 2) return false;
  let en = 0;
  let id = 0;
  for (const w of words) {
    if (ENGLISH_WORDS.has(w)) en++;
    if (INDONESIAN_WORDS.has(w)) id++;
  }
  return en >= 2 && en > id * 1.5;
};
