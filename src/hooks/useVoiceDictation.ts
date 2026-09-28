'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceDictationOptions {
  lang?: string;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceDictation(options: UseVoiceDictationOptions = {}) {
  const { lang = 'id-ID', onResult, onError } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const shouldBeListeningRef = useRef(false);
  const baseTextRef = useRef('');
  const latestFullTextRef = useRef('');

  // Keep callback refs always up-to-date without recreating handlers
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    async (initialText: string = '') => {
      if (typeof window === 'undefined') return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        const msg =
          'Browser Anda belum mendukung Web Speech Recognition. Silakan gunakan Google Chrome atau Microsoft Edge untuk fitur Dikte Suara.';
        if (onErrorRef.current) onErrorRef.current(msg);
        else alert(msg);
        return;
      }

      // Initialize base text with whatever is currently in the input field
      baseTextRef.current = (initialText || '').trim();
      latestFullTextRef.current = baseTextRef.current;
      shouldBeListeningRef.current = true;

      // Clean up any stale recognition instance before starting fresh
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      // Proactive getUserMedia check to trigger browser permission dialog cleanly if needed
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch (mediaErr: any) {
          console.warn('Microphone access verification:', mediaErr);
          if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
            shouldBeListeningRef.current = false;
            setIsListening(false);
            const msg =
              'Izin mikrofon belum aktif di browser atau Windows. Pastikan izin Mikrofon aktif pada ikon gembok browser dan setelan Windows Settings > Privacy > Microphone.';
            if (onErrorRef.current) onErrorRef.current(msg);
            else alert(msg);
            return;
          }
          if (mediaErr.name === 'NotFoundError' || mediaErr.name === 'DevicesNotFoundError') {
            shouldBeListeningRef.current = false;
            setIsListening(false);
            const msg = 'Perangkat mikrofon tidak terdeteksi di komputer Anda.';
            if (onErrorRef.current) onErrorRef.current(msg);
            else alert(msg);
            return;
          }
        }
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let sessionFinal = '';
          let sessionInterim = '';

          for (let i = 0; i < event.results.length; ++i) {
            const item = event.results[i];
            const transcript = item[0]?.transcript || '';
            if (item.isFinal) {
              sessionFinal += transcript + ' ';
            } else {
              sessionInterim += transcript;
            }
          }

          const sessionText = (sessionFinal + sessionInterim).trim();
          if (sessionText) {
            const base = baseTextRef.current;
            const fullText = base ? `${base} ${sessionText}` : sessionText;
            latestFullTextRef.current = fullText;
            if (onResultRef.current) {
              onResultRef.current(fullText);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);

          // 'no-speech' happens during natural speech pauses - DO NOT abort or error out
          if (event.error === 'no-speech') {
            return;
          }
          // 'aborted' happens on manual stop - ignore cleanly
          if (event.error === 'aborted') {
            return;
          }

          let errorMsg = '';
          if (event.error === 'not-allowed') {
            shouldBeListeningRef.current = false;
            setIsListening(false);
            errorMsg =
              'Izin mikrofon belum aktif di browser. Pastikan izin Mikrofon aktif pada ikon gembok browser, lalu muat ulang halaman (F5).';
          } else if (event.error === 'network') {
            errorMsg = 'Layanan pengenalan suara browser membutuhkan koneksi internet aktif.';
          } else if (event.error === 'audio-capture') {
            shouldBeListeningRef.current = false;
            setIsListening(false);
            errorMsg = 'Tidak dapat mendeteksi mikrofon. Pastikan perangkat mic Anda terhubung ke komputer.';
          } else {
            errorMsg = `Galat dikte suara (${event.error}).`;
          }

          if (errorMsg) {
            if (onErrorRef.current) onErrorRef.current(errorMsg);
            else alert(errorMsg);
          }
        };

        recognition.onend = () => {
          // If the user hasn't explicitly clicked stop (Chrome pauses automatically on silence), auto-restart smoothly
          if (shouldBeListeningRef.current) {
            try {
              // Update base text to everything transcribed so far before restarting speech engine
              baseTextRef.current = latestFullTextRef.current;
              recognition.start();
            } catch (err) {
              console.warn('Speech recognition auto-restart failed:', err);
              setIsListening(false);
              shouldBeListeningRef.current = false;
            }
          } else {
            setIsListening(false);
            recognitionRef.current = null;
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error('Failed to initialize speech recognition:', err);
        setIsListening(false);
        shouldBeListeningRef.current = false;
        const msg = err.message || 'Gagal memulai dikte suara.';
        if (onErrorRef.current) onErrorRef.current(msg);
        else alert(msg);
      }
    },
    [lang]
  );

  const toggleListening = useCallback(
    (currentText?: string) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(currentText);
      }
    },
    [isListening, startListening, stopListening]
  );

  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
