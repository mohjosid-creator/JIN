/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send, Zap } from 'lucide-react';

interface AudioSpeechControllerProps {
  onTranscriptReceived: (transcript: string) => void;
  onAudioLevelChange: (level: number) => void;
  isAvatarSpeaking: boolean;
  textToSpeak?: string;
  onSpeechEnd?: () => void;
  disabled?: boolean;
  speechRate?: number;
  onStopSpeaking?: () => void;
}

export const AudioSpeechController: React.FC<AudioSpeechControllerProps> = ({
  onTranscriptReceived,
  onAudioLevelChange,
  isAvatarSpeaking,
  textToSpeak,
  onSpeechEnd,
  disabled = false,
  speechRate = 1.1,
  onStopSpeaking,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioAnimationRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const lastSpokenTextRef = useRef<string>('');

  // Queue for Progressive Streaming Audio Playback
  const speechQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'id-ID'; // Indonesian speech recognition

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('Mendengarkan suara...');
      };

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const candidateText = (final || interim).trim();

        if (interim) {
          setInterimTranscript(interim);
          // Auto-dispatch on silence detection (700ms pause)
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (candidateText && candidateText.length >= 2) {
              try {
                recognition.stop();
              } catch {}
              setIsListening(false);
              setInterimTranscript('');
              onTranscriptReceived(candidateText);
            }
          }, 700);
        }

        if (final) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          setInterimTranscript('');
          setIsListening(false);
          onTranscriptReceived(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [onTranscriptReceived]);

  // Clean and sanitize text for Indonesian TTS
  const cleanTtsText = (raw: string): string => {
    return raw
      .replace(/[*_#`[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[\n\r]+/g, ' ')
      .trim();
  };

  // Play audio level wave animation
  const startAudioOscillation = () => {
    if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    let startTime = Date.now();
    const updateAudioLevel = () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        const elapsed = (Date.now() - startTime) / 1000;
        const level = 0.28 + Math.abs(Math.sin(elapsed * 14)) * 0.48 + Math.random() * 0.15;
        onAudioLevelChange(level);
        audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
      } else {
        onAudioLevelChange(0);
      }
    };
    audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // Process the Speech Queue
  const processNextInQueue = () => {
    if (!ttsEnabled || !window.speechSynthesis) {
      isPlayingRef.current = false;
      onAudioLevelChange(0);
      return;
    }

    if (speechQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      onAudioLevelChange(0);
      if (onSpeechEnd) onSpeechEnd();
      return;
    }

    isPlayingRef.current = true;
    const textChunk = speechQueueRef.current.shift();
    if (!textChunk) {
      processNextInQueue();
      return;
    }

    const cleaned = cleanTtsText(textChunk);
    if (!cleaned) {
      processNextInQueue();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'id-ID';
    utterance.rate = Math.min(1.4, Math.max(0.85, speechRate));
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia')
    );
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => {
      startAudioOscillation();
    };

    utterance.onend = () => {
      processNextInQueue();
    };

    utterance.onerror = () => {
      processNextInQueue();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle incoming textToSpeak
  useEffect(() => {
    if (!textToSpeak || !ttsEnabled || !window.speechSynthesis) return;

    // Avoid speaking exact same text again if already processed
    if (textToSpeak === lastSpokenTextRef.current) return;
    lastSpokenTextRef.current = textToSpeak;

    // Stop current speech, queue new text, and play
    window.speechSynthesis.cancel();
    speechQueueRef.current = [];

    // Break into natural sentences for snappier audio delivery
    const sentences = textToSpeak
      .split(/(?<=[.?!;:\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 4); // Keep to first 3-4 key sentences for quick conversational response

    if (sentences.length > 0) {
      speechQueueRef.current = sentences;
      processNextInQueue();
    }

    return () => {
      if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    };
  }, [textToSpeak, ttsEnabled, speechRate]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current || disabled) return;

    if (isListening) {
      // User tapped stop listening -> send whatever was heard immediately
      if (interimTranscript && interimTranscript !== 'Mendengarkan suara...') {
        onTranscriptReceived(interimTranscript.trim());
      }
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
      setInterimTranscript('');
    } else {
      // Cancel any ongoing avatar speech when user wants to talk!
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        speechQueueRef.current = [];
        isPlayingRef.current = false;
        onAudioLevelChange(0);
        if (onStopSpeaking) onStopSpeaking();
      }

      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start:', err);
      }
    }
  };

  const handleInstantCommit = () => {
    if (interimTranscript && interimTranscript !== 'Mendengarkan suara...') {
      const text = interimTranscript.trim();
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      setInterimTranscript('');
      onTranscriptReceived(text);
    }
  };

  const toggleTts = () => {
    if (ttsEnabled) {
      window.speechSynthesis?.cancel();
      speechQueueRef.current = [];
      isPlayingRef.current = false;
      onAudioLevelChange(0);
    }
    setTtsEnabled(!ttsEnabled);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Speech Recognition Button */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || !speechSupported}
        title={
          speechSupported
            ? isListening
              ? 'Klik untuk menyelesaikan bicara dan kirim langsung'
              : 'Bicara ke JIN (Mikrofon Suara)'
            : 'Web Speech API tidak didukung di browser ini'
        }
        className={`relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
          isListening
            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 ring-2 ring-rose-500/30 animate-pulse'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isListening ? (
          <>
            <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            <span>Mendengarkan...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Suara (Mic)</span>
          </>
        )}
      </button>

      {/* Instant Send Button while speaking */}
      {isListening && interimTranscript && interimTranscript !== 'Mendengarkan suara...' && (
        <button
          type="button"
          onClick={handleInstantCommit}
          title="Kirim kalimat suara ini sekarang juga"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors animate-in fade-in"
        >
          <Send className="w-3 h-3" />
          <span>Kirim</span>
        </button>
      )}

      {/* TTS Toggle Button */}
      <button
        type="button"
        onClick={toggleTts}
        title={ttsEnabled ? 'Matikan Suara Avatar JIN' : 'Aktifkan Suara Avatar JIN'}
        className={`p-1.5 rounded-lg border transition-all ${
          ttsEnabled
            ? 'bg-slate-800 text-cyan-300 border-slate-700 hover:bg-slate-700'
            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
        }`}
      >
        {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Interim Transcript display */}
      {interimTranscript && (
        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/90 px-2.5 py-1 rounded-lg border border-cyan-800/80 animate-pulse truncate max-w-[220px]">
          "{interimTranscript}"
        </div>
      )}
    </div>
  );
};
