/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface AudioSpeechControllerProps {
  onTranscriptReceived: (transcript: string) => void;
  onAudioLevelChange: (level: number) => void;
  isAvatarSpeaking: boolean;
  textToSpeak?: string;
  onSpeechEnd?: () => void;
  disabled?: boolean;
}

export const AudioSpeechController: React.FC<AudioSpeechControllerProps> = ({
  onTranscriptReceived,
  onAudioLevelChange,
  isAvatarSpeaking,
  textToSpeak,
  onSpeechEnd,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioAnimationRef = useRef<number | null>(null);

  // Check Web Speech API support
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

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setInterimTranscript('');
          setIsListening(false);
          onTranscriptReceived(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscriptReceived]);

  // Handle Text-to-Speech (TTS)
  useEffect(() => {
    if (!textToSpeak || !ttsEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Clean markdown and code symbols for cleaner TTS vocalization
    const cleanedText = textToSpeak
      .replace(/[*_#`[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .slice(0, 320); // reasonable sentence length

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best available voice if exists
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find((v) => v.lang.startsWith('id') || v.name.includes('Indonesia'));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    // Audio level oscillation simulation during speech
    let startTime = Date.now();
    const updateAudioLevel = () => {
      if (window.speechSynthesis.speaking) {
        const elapsed = (Date.now() - startTime) / 1000;
        const level = 0.25 + Math.abs(Math.sin(elapsed * 12)) * 0.45 + (Math.random() * 0.15);
        onAudioLevelChange(level);
        audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
      } else {
        onAudioLevelChange(0);
      }
    };

    utterance.onstart = () => {
      startTime = Date.now();
      audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
    };

    utterance.onend = () => {
      if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
      onAudioLevelChange(0);
      if (onSpeechEnd) onSpeechEnd();
    };

    utterance.onerror = () => {
      if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
      onAudioLevelChange(0);
      if (onSpeechEnd) onSpeechEnd();
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
      window.speechSynthesis.cancel();
      onAudioLevelChange(0);
    };
  }, [textToSpeak, ttsEnabled, onAudioLevelChange, onSpeechEnd]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current || disabled) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start:', err);
      }
    }
  };

  const toggleTts = () => {
    if (ttsEnabled) {
      window.speechSynthesis?.cancel();
      onAudioLevelChange(0);
    }
    setTtsEnabled(!ttsEnabled);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Speech Recognition Button */}
      <button
        onClick={toggleListening}
        disabled={disabled || !speechSupported}
        title={speechSupported ? (isListening ? 'Berhenti mendengarkan' : 'Bicara ke JIN (Mikrofon)') : 'Web Speech API tidak didukung browser ini'}
        className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
          isListening
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm animate-pulse'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
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

      {/* TTS Toggle Button */}
      <button
        onClick={toggleTts}
        title={ttsEnabled ? 'Matikan Suara Avatar' : 'Aktifkan Suara Avatar'}
        className={`p-1.5 rounded-lg border transition-all ${
          ttsEnabled
            ? 'bg-slate-800 text-cyan-300 border-slate-700 hover:bg-slate-700'
            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
        }`}
      >
        {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Interim Transcript notification if active */}
      {interimTranscript && (
        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/60 animate-pulse truncate max-w-[200px]">
          {interimTranscript}
        </div>
      )}
    </div>
  );
};
