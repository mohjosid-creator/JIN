/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Send,
  AlertCircle,
  Loader2,
  MessagesSquare,
  Brain,
  AudioLines,
  CircleHelp,
} from 'lucide-react';
import {
  KOKORO_VOICE,
  getKokoroIfReady,
  getKokoroStatus,
  isLikelyEnglish,
  loadKokoro,
  subscribeKokoroStatus,
  type KokoroStatus,
} from '../lib/kokoroTts';

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

type ConversationPhase = 'idle' | 'listening' | 'thinking' | 'speaking';
type VoiceCommand = 'exit' | 'start' | 'stop' | 'repeat' | 'slower' | 'faster' | 'mute';

const SILENCE_COMMIT_MS = 1500;
const CONVERSATION_SILENCE_COMMIT_MS = 1100;
const MAX_SPOKEN_SENTENCES = 4;
const MAX_IDLE_RESTARTS = 3;
const RATE_STEP = 0.15;

const STT_ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Izin mikrofon ditolak. Izinkan akses mikrofon di browser (atau buka aplikasi di tab baru).',
  'service-not-allowed': 'Layanan pengenalan suara diblokir oleh browser.',
  'audio-capture': 'Mikrofon tidak terdeteksi. Periksa perangkat input suara.',
  network: 'Koneksi ke layanan pengenalan suara terputus. Coba lagi.',
  'language-not-supported': 'Bahasa Indonesia tidak didukung oleh browser ini.',
};

const FATAL_STT_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported']);

const VOICE_COMMANDS: { action: VoiceCommand; patterns: RegExp[] }[] = [
  {
    action: 'exit',
    patterns: [
      /^(akhiri|selesai|selesaikan|stop|hentikan|tutup|keluar( dari)?)( mode)? (percakapan|obrolan|ngobrol)$/,
      /^(sampai jumpa|dadah|bye)( jin)?$/,
    ],
  },
  {
    action: 'start',
    patterns: [/^(mulai|aktifkan|masuk)( mode)? (percakapan|obrolan|ngobrol)$/, /^(mode percakapan|ayo ngobrol)$/],
  },
  { action: 'stop', patterns: [/^(berhenti|stop|diam|cukup|sudah|udah)( dulu| bicara| ngomong)?$/] },
  {
    action: 'repeat',
    patterns: [/^(tolong |coba )?ulang(i|in)?( lagi| jawaban(nya)?)?$/, /^(apa tadi|bisa diulang)$/],
  },
  { action: 'slower', patterns: [/^(bicara |ngomong )?(lebih )?pelan( pelan| sedikit| lagi)?$/] },
  { action: 'faster', patterns: [/^(bicara |ngomong )?(lebih )?cepat( sedikit| lagi)?$/] },
  { action: 'mute', patterns: [/^(matikan|bisukan) suara( kamu| jin)?$/] },
];

const COMMAND_HELP: { phrase: string; effect: string }[] = [
  { phrase: '"berhenti" / "diam"', effect: 'Hentikan suara JIN' },
  { phrase: '"ulangi"', effect: 'Ulangi jawaban terakhir' },
  { phrase: '"lebih pelan" / "lebih cepat"', effect: 'Atur kecepatan bicara' },
  { phrase: '"matikan suara"', effect: 'Bisukan suara JIN' },
  { phrase: '"mulai percakapan"', effect: 'Aktifkan mode percakapan' },
  { phrase: '"akhiri percakapan"', effect: 'Keluar dari mode percakapan' },
];

const normalizeUtterance = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[.,!?;:"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripWakeWord = (text: string): string =>
  text.replace(/^\s*((hai|halo|hey|hei|oke|ok)\s+)?jin\b[\s,.!]*/i, '').trim();

const matchVoiceCommand = (text: string): VoiceCommand | null => {
  const normalized = normalizeUtterance(stripWakeWord(text));
  if (!normalized) return null;
  return VOICE_COMMANDS.find((cmd) => cmd.patterns.some((p) => p.test(normalized)))?.action ?? null;
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
  const [conversationMode, setConversationMode] = useState(false);
  const [phase, setPhase] = useState<ConversationPhase>('idle');
  const [showHelp, setShowHelp] = useState(false);

  const ttsEnabled = ttsEnabledProp ?? localTtsEnabled;

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef('');
  const committedRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversationModeRef = useRef(false);
  const phaseRef = useRef<ConversationPhase>('idle');
  const idleRestartsRef = useRef(0);
  const rateOffsetRef = useRef(0);
  const lastAnswerRef = useRef('');

  const audioAnimationRef = useRef<number | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speechQueueRef = useRef<string[]>([]);
  const queuedSentenceCountRef = useRef(0);
  const lastSpokenTextRef = useRef('');
  const isPlayingRef = useRef(false);
  const playTokenRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const kokoroSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [kokoroStatus, setKokoroStatus] = useState<KokoroStatus>(getKokoroStatus);

  useEffect(() => subscribeKokoroStatus(setKokoroStatus), []);

  // Keep latest callbacks/values in refs so long-lived browser handlers never go stale.
  const onTranscriptRef = useRef(onTranscriptReceived);
  const onAudioLevelRef = useRef(onAudioLevelChange);
  const onSpeechEndRef = useRef(onSpeechEnd);
  const ttsEnabledRef = useRef(ttsEnabled);
  const speechRateRef = useRef(speechRate);
  const disabledRef = useRef(disabled);
  useEffect(() => {
    onTranscriptRef.current = onTranscriptReceived;
    onAudioLevelRef.current = onAudioLevelChange;
    onSpeechEndRef.current = onSpeechEnd;
    ttsEnabledRef.current = ttsEnabled;
    speechRateRef.current = speechRate;
    disabledRef.current = disabled;
  });

  const updatePhase = (next: ConversationPhase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const effectiveRate = () =>
    Math.min(1.5, Math.max(0.75, speechRateRef.current + rateOffsetRef.current));

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const clearListenTimer = () => {
    if (listenTimerRef.current) {
      clearTimeout(listenTimerRef.current);
      listenTimerRef.current = null;
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

  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume().catch(() => {});
    return audioCtxRef.current;
  };

  // Short tonal cue so the user knows when JIN starts listening or has heard them.
  const playEarcon = (kind: 'listen' | 'send') => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const [from, to] = kind === 'listen' ? [620, 930] : [880, 560];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(from, now);
      osc.frequency.exponentialRampToValueAtTime(to, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  };

  const beginRecognition = (auto: boolean) => {
    const recognition = recognitionRef.current;
    if (!recognition || isListeningRef.current) return;

    setSttError(null);
    committedRef.current = false;
    transcriptRef.current = '';

    try {
      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);
      updatePhase('listening');
      if (conversationModeRef.current) playEarcon('listen');
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      try {
        recognition.abort();
      } catch {}
      resetListeningState();
      if (auto && conversationModeRef.current && idleRestartsRef.current < MAX_IDLE_RESTARTS) {
        idleRestartsRef.current++;
        scheduleListen(400);
      } else {
        showSttError('Mikrofon sedang sibuk. Tunggu sebentar lalu coba lagi.');
      }
    }
  };

  const scheduleListen = (delay: number) => {
    clearListenTimer();
    listenTimerRef.current = setTimeout(() => {
      listenTimerRef.current = null;
      if (
        conversationModeRef.current &&
        !disabledRef.current &&
        !isPlayingRef.current &&
        !isListeningRef.current
      ) {
        beginRecognition(true);
      }
    }, delay);
  };

  const stopAllSpeech = () => {
    playTokenRef.current++;
    window.speechSynthesis?.cancel();
    try {
      kokoroSourceRef.current?.stop();
    } catch {}
    kokoroSourceRef.current = null;
    speechQueueRef.current = [];
    isPlayingRef.current = false;
    if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    onAudioLevelRef.current(0);
  };

  const endConversation = (notice?: string) => {
    conversationModeRef.current = false;
    setConversationMode(false);
    clearListenTimer();
    idleRestartsRef.current = 0;
    if (isListeningRef.current) {
      committedRef.current = true;
      try {
        recognitionRef.current?.abort();
      } catch {}
      resetListeningState();
    }
    updatePhase('idle');
    if (notice) showSttError(notice);
  };

  const startConversation = () => {
    if (!speechSupported) return;
    conversationModeRef.current = true;
    setConversationMode(true);
    idleRestartsRef.current = 0;
    setShowHelp(false);
    if (isListeningRef.current) return;
    if (isPlayingRef.current) {
      updatePhase('speaking');
      return;
    }
    if (disabledRef.current) {
      updatePhase('thinking');
      return;
    }
    beginRecognition(false);
  };

  // Plays a short spoken acknowledgement for voice commands, then resumes the loop.
  const speakFeedback = (text: string) => {
    if (!ttsEnabledRef.current || !window.speechSynthesis) {
      updatePhase('idle');
      if (conversationModeRef.current) scheduleListen(250);
      return;
    }
    stopAllSpeech();
    speechQueueRef.current = [text];
    setTimeout(processNextInQueue, 60);
  };

  const runVoiceCommand = (command: VoiceCommand) => {
    switch (command) {
      case 'exit':
        if (!conversationModeRef.current) {
          updatePhase('idle');
          return;
        }
        endConversation();
        speakFeedback('Baik, percakapan selesai. Sampai jumpa lagi.');
        return;
      case 'start':
        if (conversationModeRef.current) {
          speakFeedback('Mode percakapan sudah aktif. Silakan bicara.');
          return;
        }
        conversationModeRef.current = true;
        setConversationMode(true);
        idleRestartsRef.current = 0;
        speakFeedback('Mode percakapan aktif. Silakan bicara kapan saja.');
        return;
      case 'stop':
        stopAllSpeech();
        onStopSpeaking?.();
        updatePhase('idle');
        if (conversationModeRef.current) scheduleListen(200);
        return;
      case 'repeat': {
        const answer = lastAnswerRef.current;
        if (!answer || !ttsEnabledRef.current) {
          speakFeedback('Belum ada jawaban yang bisa saya ulangi.');
          return;
        }
        stopAllSpeech();
        speechQueueRef.current = ['Baik, saya ulangi.', ...splitSentences(answer)];
        setTimeout(processNextInQueue, 60);
        return;
      }
      case 'slower':
        rateOffsetRef.current = Math.max(-0.45, rateOffsetRef.current - RATE_STEP);
        speakFeedback('Baik, saya bicara lebih pelan.');
        return;
      case 'faster':
        rateOffsetRef.current = Math.min(0.45, rateOffsetRef.current + RATE_STEP);
        speakFeedback('Baik, saya bicara lebih cepat.');
        return;
      case 'mute':
        stopAllSpeech();
        if (ttsEnabledRef.current) toggleTts();
        updatePhase('idle');
        if (conversationModeRef.current) scheduleListen(250);
        return;
    }
  };

  const handleUtterance = (text: string) => {
    const command = matchVoiceCommand(text);
    if (command) {
      runVoiceCommand(command);
      return;
    }
    playEarcon('send');
    onTranscriptRef.current(stripWakeWord(text) || text);
  };

  // Browser handlers are bound once, so route through refs to reach the latest closures.
  const handleUtteranceRef = useRef(handleUtterance);
  const scheduleListenRef = useRef(scheduleListen);
  const endConversationRef = useRef(endConversation);
  handleUtteranceRef.current = handleUtterance;
  scheduleListenRef.current = scheduleListen;
  endConversationRef.current = endConversation;

  const commitTranscript = useCallback(() => {
    if (committedRef.current) return;
    const text = transcriptRef.current.trim();
    const hasText = text.length >= 2;
    committedRef.current = true;
    transcriptRef.current = '';
    if (hasText) {
      idleRestartsRef.current = 0;
      phaseRef.current = 'thinking';
      setPhase('thinking');
    }
    resetListeningState();
    try {
      recognitionRef.current?.stop();
    } catch {}
    if (hasText) handleUtteranceRef.current(text);
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
      silenceTimerRef.current = setTimeout(
        commitTranscript,
        conversationModeRef.current ? CONVERSATION_SILENCE_COMMIT_MS : SILENCE_COMMIT_MS
      );
    };

    recognition.onerror = (event: any) => {
      const code = event.error as string;
      console.warn('Speech recognition error:', code);
      if (conversationModeRef.current) {
        if (FATAL_STT_ERRORS.has(code)) {
          endConversationRef.current(STT_ERROR_MESSAGES[code]);
        }
        return;
      }
      if (code === 'no-speech') {
        showSttError('Tidak ada suara terdeteksi. Coba bicara lebih dekat ke mikrofon.');
      } else if (code !== 'aborted') {
        showSttError(STT_ERROR_MESSAGES[code] ?? `Pengenalan suara gagal (${code}).`);
      }
    };

    recognition.onend = () => {
      // Browser may end the session on its own; send whatever was captured.
      if (!committedRef.current && transcriptRef.current.trim()) {
        commitTranscript();
        return;
      }
      committedRef.current = true;
      resetListeningState();

      if (conversationModeRef.current && phaseRef.current === 'listening') {
        idleRestartsRef.current++;
        if (idleRestartsRef.current >= MAX_IDLE_RESTARTS) {
          endConversationRef.current('Mode percakapan dijeda karena tidak ada suara terdeteksi.');
        } else {
          scheduleListenRef.current(250);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
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
      try {
        kokoroSourceRef.current?.stop();
      } catch {}
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []);

  // Resolves when playback finishes or is interrupted by a newer play token.
  const speakWithKokoro = async (text: string, token: number): Promise<boolean> => {
    const tts = getKokoroIfReady();
    if (!tts) return false;
    const raw = await tts.generate(text, { voice: KOKORO_VOICE as any, speed: effectiveRate() });
    if (token !== playTokenRef.current) return true;

    const ctx = getAudioContext();
    const buffer = ctx.createBuffer(1, raw.audio.length, raw.sampling_rate);
    buffer.copyToChannel(raw.audio as Float32Array<ArrayBuffer>, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    kokoroSourceRef.current = source;

    const samples = new Uint8Array(analyser.fftSize);
    let playing = true;
    const updateLevel = () => {
      if (!playing) return;
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (let i = 0; i < samples.length; i++) {
        const v = (samples[i] - 128) / 128;
        sum += v * v;
      }
      onAudioLevelRef.current(Math.min(1, Math.sqrt(sum / samples.length) * 4));
      audioAnimationRef.current = requestAnimationFrame(updateLevel);
    };

    await new Promise<void>((resolve) => {
      source.onended = () => {
        playing = false;
        if (kokoroSourceRef.current === source) kokoroSourceRef.current = null;
        onAudioLevelRef.current(0);
        resolve();
      };
      source.start();
      updateLevel();
    });
    return true;
  };

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

  const resumeConversationAfterSpeech = () => {
    if (!conversationModeRef.current) {
      updatePhase('idle');
      return;
    }
    // Streaming replies may still be arriving; wait for processing to finish first.
    if (disabledRef.current) {
      updatePhase('thinking');
      return;
    }
    updatePhase('idle');
    scheduleListen(350);
  };

  const processNextInQueue = () => {
    if (!ttsEnabledRef.current || !window.speechSynthesis) {
      isPlayingRef.current = false;
      onAudioLevelRef.current(0);
      resumeConversationAfterSpeech();
      return;
    }

    const nextChunk = speechQueueRef.current.shift();
    if (nextChunk === undefined) {
      isPlayingRef.current = false;
      onAudioLevelRef.current(0);
      onSpeechEndRef.current?.();
      resumeConversationAfterSpeech();
      return;
    }

    const cleaned = cleanTtsText(nextChunk);
    if (!cleaned) {
      processNextInQueue();
      return;
    }

    isPlayingRef.current = true;
    if (phaseRef.current !== 'speaking') updatePhase('speaking');

    if (isLikelyEnglish(cleaned)) {
      if (getKokoroIfReady()) {
        const token = playTokenRef.current;
        speakWithKokoro(cleaned, token)
          .then((handled) => {
            if (token !== playTokenRef.current) return;
            if (handled) processNextInQueue();
            else speakWithBrowser(cleaned);
          })
          .catch((err) => {
            console.warn('Kokoro TTS playback failed, using browser voice:', err);
            if (token === playTokenRef.current) speakWithBrowser(cleaned);
          });
        return;
      }
      // Model downloads in the background; the browser voice covers this sentence meanwhile.
      loadKokoro();
    }

    speakWithBrowser(cleaned);
  };

  const speakWithBrowser = (cleaned: string) => {
    if (!window.speechSynthesis) {
      processNextInQueue();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'id-ID';
    utterance.rate = effectiveRate();
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
    if (!textToSpeak) return;
    lastAnswerRef.current = textToSpeak;
    if (!ttsEnabled || !window.speechSynthesis) return;
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
    clearListenTimer();
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

  // When a reply finishes without audio (TTS muted or empty reply), hand the turn back to the user.
  useEffect(() => {
    if (disabled || !conversationMode) return;
    const timer = setTimeout(() => {
      if (phaseRef.current === 'thinking' && !isPlayingRef.current) {
        updatePhase('idle');
        scheduleListenRef.current(0);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [disabled, conversationMode]);

  const startListening = () => {
    clearListenTimer();
    stopAllSpeech();
    onStopSpeaking?.();
    beginRecognition(false);
  };

  const toggleListening = () => {
    if (!speechSupported) return;
    if (isListeningRef.current) {
      commitTranscript();
      return;
    }
    // Tapping the mic while JIN talks interrupts it (barge-in), even mid-processing.
    if (disabled && !isPlayingRef.current) return;
    startListening();
  };

  const toggleConversation = () => {
    if (conversationModeRef.current) endConversation();
    else startConversation();
  };

  function toggleTts() {
    if (onToggleTts) onToggleTts();
    else setLocalTtsEnabled((prev) => !prev);
  }

  const phaseDisplay: Record<Exclude<ConversationPhase, 'idle'>, { label: string; className: string; Icon: typeof Mic }> = {
    listening: {
      label: 'Giliran Anda bicara',
      className: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
      Icon: Mic,
    },
    thinking: {
      label: 'JIN sedang berpikir...',
      className: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
      Icon: Brain,
    },
    speaking: {
      label: 'JIN berbicara - ketuk mic untuk menyela',
      className: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
      Icon: AudioLines,
    },
  };
  const activePhase = conversationMode && phase !== 'idle' ? phaseDisplay[phase] : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={toggleConversation}
        disabled={!speechSupported}
        aria-pressed={conversationMode}
        title={
          conversationMode
            ? 'Akhiri mode percakapan (atau ucapkan "akhiri percakapan")'
            : 'Mode percakapan: tanya jawab suara bergantian tanpa menekan tombol'
        }
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-sm ${
          conversationMode
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/25'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-emerald-300 border-slate-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <MessagesSquare className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{conversationMode ? 'Percakapan Aktif' : 'Mode Percakapan'}</span>
      </button>

      <button
        type="button"
        onClick={toggleListening}
        disabled={(disabled && !isListening && phase !== 'speaking') || !speechSupported}
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

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowHelp((prev) => !prev)}
          aria-expanded={showHelp}
          aria-controls="jin-voice-command-help"
          aria-label="Daftar perintah suara"
          title="Daftar perintah suara"
          className={`p-1.5 rounded-lg border transition-all ${
            showHelp
              ? 'bg-slate-700 text-emerald-300 border-slate-600'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          <CircleHelp className="w-4 h-4" aria-hidden="true" />
        </button>
        {showHelp && (
          <div
            id="jin-voice-command-help"
            role="dialog"
            aria-label="Perintah suara JIN"
            className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur"
          >
            <p className="text-xs font-semibold text-slate-100">Perintah Suara</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Ucapkan kapan saja saat mikrofon aktif. Awalan &quot;JIN&quot; atau &quot;Hai JIN&quot; boleh dipakai.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {COMMAND_HELP.map((item) => (
                <li key={item.phrase} className="flex flex-col">
                  <span className="text-[11px] font-mono text-emerald-300">{item.phrase}</span>
                  <span className="text-[11px] text-slate-400">{item.effect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {kokoroStatus === 'loading' && (
        <span
          role="status"
          className="inline-flex items-center gap-1 text-[11px] text-slate-400"
          title="Mengunduh model suara Kokoro untuk teks Bahasa Inggris"
        >
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          Memuat Kokoro...
        </span>
      )}

      {activePhase && !(isListening && liveTranscript) && (
        <div
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${activePhase.className}`}
        >
          <activePhase.Icon
            className={`w-3.5 h-3.5 ${phase === 'thinking' ? 'animate-pulse' : ''}`}
            aria-hidden="true"
          />
          <span>{activePhase.label}</span>
        </div>
      )}

      {isListening && (liveTranscript || !conversationMode) && (
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
