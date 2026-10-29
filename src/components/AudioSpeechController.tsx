/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, VolumeX, Send, AlertCircle } from 'lucide-react';

interface AudioSpeechControllerProps {
  onTranscriptReceived: (transcript: string) => void;
  onAudioLevelChange: (level: number) => void;
  isAvatarSpeaking: boolean;
  textToSpeak?: string;
  onSpeechEnd?: () => void;
  disabled?: boolean;
  speechRate?: number;
  onStopSpeaking?: () => void;
  ttsEnabled?: boolean;
  onToggleTts?: () => void;
}

const SILENCE_COMMIT_MS = 1500;
const MAX_SPOKEN_SENTENCES = 4;

const STT_ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Izin mikrofon ditolak. Izinkan akses mikrofon di browser (atau buka aplikasi di tab baru).',
  'service-not-allowed': 'Layanan pengenalan suara diblokir oleh browser.',
  'audio-capture': 'Mikrofon tidak terdeteksi. Periksa perangkat input suara.',
  network: 'Koneksi ke layanan pengenalan suara terputus. Coba lagi.',
  'language-not-supported': 'Bahasa Indonesia tidak didukung oleh browser ini.',
};

const cleanTtsText = (raw: string): string =>
  raw
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[*_#`[\]()]/g, '')
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

const splitSentences = (text: string): string[] =>
  text
    .split(/(?<=[.?!;:\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_SPOKEN_SENTENCES);

export const AudioSpeechController: React.FC<AudioSpeechControllerProps> = ({
  onTranscriptReceived,
  onAudioLevelChange,
  textToSpeak,
  onSpeechEnd,
  disabled = false,
  speechRate = 1.1,
  onStopSpeaking,
  ttsEnabled: ttsEnabledProp,
  onToggleTts,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [localTtsEnabled, setLocalTtsEnabled] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [sttError, setSttError] = useState<string | null>(null);

  const ttsEnabled = ttsEnabledProp ?? localTtsEnabled;

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef('');
  const committedRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audioAnimationRef = useRef<number | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speechQueueRef = useRef<string[]>([]);
  const queuedSentenceCountRef = useRef(0);
  const lastSpokenTextRef = useRef('');
  const isPlayingRef = useRef(false);

  // Keep latest callbacks/values in refs so long-lived browser handlers never go stale.
  const onTranscriptRef = useRef(onTranscriptReceived);
  const onAudioLevelRef = useRef(onAudioLevelChange);
  const onSpeechEndRef = useRef(onSpeechEnd);
  const ttsEnabledRef = useRef(ttsEnabled);
  const speechRateRef = useRef(speechRate);
  useEffect(() => {
    onTranscriptRef.current = onTranscriptReceived;
    onAudioLevelRef.current = onAudioLevelChange;
    onSpeechEndRef.current = onSpeechEnd;
    ttsEnabledRef.current = ttsEnabled;
    speechRateRef.current = speechRate;
  });

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const showSttError = (message: string) => {
    setSttError(message);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setSttError(null), 6000);
  };

  const resetListeningState = () => {
    clearSilenceTimer();
    isListeningRef.current = false;
    setIsListening(false);
    setLiveTranscript('');
  };

  const commitTranscript = useCallback(() => {
    if (committedRef.current) return;
    const text = transcriptRef.current.trim();
    committedRef.current = true;
    transcriptRef.current = '';
    resetListeningState();
    try {
      recognitionRef.current?.stop();
    } catch {}
    if (text.length >= 2) onTranscriptRef.current(text);
  }, []);

  // Setup Web Speech Recognition once
  useEffect(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    setSpeechSupported(true);
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'id-ID';

    recognition.onstart = () => {
      committedRef.current = false;
      transcriptRef.current = '';
      isListeningRef.current = true;
      setIsListening(true);
      setLiveTranscript('');
      setSttError(null);
    };

    recognition.onresult = (event: any) => {
      if (committedRef.current) return;

      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) finalText += piece;
        else interimText += piece;
      }

      const combined = `${finalText} ${interimText}`.replace(/\s+/g, ' ').trim();
      transcriptRef.current = combined;
      setLiveTranscript(combined);

      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(commitTranscript, SILENCE_COMMIT_MS);
    };

    recognition.onerror = (event: any) => {
      const code = event.error as string;
      if (code === 'no-speech') {
        showSttError('Tidak ada suara terdeteksi. Coba bicara lebih dekat ke mikrofon.');
      } else if (code !== 'aborted') {
        showSttError(STT_ERROR_MESSAGES[code] ?? `Pengenalan suara gagal (${code}).`);
      }
      console.warn('Speech recognition error:', code);
    };

    recognition.onend = () => {
      // Browser may end the session on its own; send whatever was captured.
      if (!committedRef.current && transcriptRef.current.trim()) {
        commitTranscript();
        return;
      }
      committedRef.current = true;
      resetListeningState();
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {}
      recognitionRef.current = null;
    };
  }, [commitTranscript]);

  // Load TTS voices (Chrome populates them asynchronously)
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
      if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    };
  }, []);

  const pickIndonesianVoice = (): SpeechSynthesisVoice | undefined => {
    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const indonesian = voices.filter(
      (v) => v.lang.toLowerCase().startsWith('id') || v.name.toLowerCase().includes('indonesia')
    );
    return (
      indonesian.find((v) => /google|natural|online/i.test(v.name)) ?? indonesian[0]
    );
  };

  const startAudioOscillation = () => {
    if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    const startTime = Date.now();
    const updateAudioLevel = () => {
      if (window.speechSynthesis?.speaking) {
        const elapsed = (Date.now() - startTime) / 1000;
        const level = 0.28 + Math.abs(Math.sin(elapsed * 14)) * 0.48 + Math.random() * 0.15;
        onAudioLevelRef.current(level);
        audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
      } else {
        onAudioLevelRef.current(0);
      }
    };
    audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const stopAllSpeech = () => {
    window.speechSynthesis?.cancel();
    speechQueueRef.current = [];
    isPlayingRef.current = false;
    if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    onAudioLevelRef.current(0);
  };

  const processNextInQueue = () => {
    if (!ttsEnabledRef.current || !window.speechSynthesis) {
      isPlayingRef.current = false;
      onAudioLevelRef.current(0);
      return;
    }

    const nextChunk = speechQueueRef.current.shift();
    if (nextChunk === undefined) {
      isPlayingRef.current = false;
      onAudioLevelRef.current(0);
      onSpeechEndRef.current?.();
      return;
    }

    const cleaned = cleanTtsText(nextChunk);
    if (!cleaned) {
      processNextInQueue();
      return;
    }

    isPlayingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'id-ID';
    utterance.rate = Math.min(1.4, Math.max(0.85, speechRateRef.current));
    utterance.pitch = 1.0;
    const voice = pickIndonesianVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = startAudioOscillation;
    utterance.onend = processNextInQueue;
    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      processNextInQueue();
    };

    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  // Handle incoming textToSpeak (supports progressive streaming: first sentence, then full text)
  useEffect(() => {
    if (!textToSpeak || !ttsEnabled || !window.speechSynthesis) return;
    if (textToSpeak === lastSpokenTextRef.current) return;

    const previous = lastSpokenTextRef.current;
    lastSpokenTextRef.current = textToSpeak;
    const sentences = splitSentences(textToSpeak);

    const isContinuation = previous.length > 0 && textToSpeak.startsWith(previous);
    if (isContinuation) {
      const remaining = sentences.slice(queuedSentenceCountRef.current);
      if (remaining.length === 0) return;
      speechQueueRef.current.push(...remaining);
      queuedSentenceCountRef.current += remaining.length;
      if (!isPlayingRef.current) processNextInQueue();
      return;
    }

    stopAllSpeech();
    if (sentences.length === 0) return;
    speechQueueRef.current = [...sentences];
    queuedSentenceCountRef.current = sentences.length;
    // Chrome drops utterances spoken in the same tick as cancel().
    const timer = setTimeout(processNextInQueue, 60);
    return () => clearTimeout(timer);
  }, [textToSpeak, ttsEnabled]);

  // Stop speaking immediately when TTS gets muted from anywhere
  useEffect(() => {
    if (!ttsEnabled) stopAllSpeech();
  }, [ttsEnabled]);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isListeningRef.current) return;

    stopAllSpeech();
    onStopSpeaking?.();
    setSttError(null);
    committedRef.current = false;
    transcriptRef.current = '';

    try {
      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      try {
        recognition.abort();
      } catch {}
      resetListeningState();
      showSttError('Mikrofon sedang sibuk. Tunggu sebentar lalu coba lagi.');
    }
  };

  const toggleListening = () => {
    if (!speechSupported || disabled) return;
    if (isListeningRef.current) commitTranscript();
    else startListening();
  };

  const toggleTts = () => {
    if (onToggleTts) onToggleTts();
    else setLocalTtsEnabled((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={toggleListening}
        disabled={(disabled && !isListening) || !speechSupported}
        aria-pressed={isListening}
        title={
          speechSupported
            ? isListening
              ? 'Klik untuk selesai bicara dan kirim'
              : 'Bicara ke JIN (Mikrofon Suara)'
            : 'Web Speech API tidak didukung di browser ini (gunakan Chrome/Edge)'
        }
        className={`relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
          isListening
            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 ring-2 ring-rose-500/30 animate-pulse'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Mic
          className={`w-3.5 h-3.5 ${isListening ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`}
          aria-hidden="true"
        />
        <span>{isListening ? 'Mendengarkan...' : 'Suara (Mic)'}</span>
      </button>

      {isListening && liveTranscript && (
        <button
          type="button"
          onClick={commitTranscript}
          title="Kirim kalimat suara ini sekarang juga"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
        >
          <Send className="w-3 h-3" aria-hidden="true" />
          <span>Kirim</span>
        </button>
      )}

      <button
        type="button"
        onClick={toggleTts}
        aria-label={ttsEnabled ? 'Matikan suara avatar JIN' : 'Aktifkan suara avatar JIN'}
        title={ttsEnabled ? 'Matikan Suara Avatar JIN' : 'Aktifkan Suara Avatar JIN'}
        className={`p-1.5 rounded-lg border transition-all ${
          ttsEnabled
            ? 'bg-slate-800 text-cyan-300 border-slate-700 hover:bg-slate-700'
            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
        }`}
      >
        {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {isListening && (
        <div
          aria-live="polite"
          className="text-xs font-mono text-cyan-300 bg-cyan-950/90 px-2.5 py-1 rounded-lg border border-cyan-800/80 truncate max-w-[260px]"
        >
          {liveTranscript ? `"${liveTranscript}"` : 'Mendengarkan suara...'}
        </div>
      )}

      {sttError && !isListening && (
        <div
          role="alert"
          className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/80 max-w-[320px]"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{sttError}</span>
        </div>
      )}
    </div>
  );
};
