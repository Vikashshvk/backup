/**
 * Voice Recognition (STT) and Voice Synthesis (TTS) Utilities
 */

// Extend window for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Start listening via Microphone
 */
export function startVoiceRecognition(
  onResult: (transcript: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): { stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser.');
    onEnd();
    return { stop: () => {} };
  }

  const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechClass();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'hi-IN'; // Works for Hindi, Hinglish, and English!

  let finalTranscript = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    const current = finalTranscript || interim;
    onResult(current);
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError(event.error === 'not-allowed' ? 'Microphone permission denied.' : `Speech error: ${event.error}`);
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch (e: any) {
    onError('Could not start microphone: ' + (e?.message || 'Unknown error'));
    onEnd();
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {}
    }
  };
}

/**
 * Speak text out loud using browser synthesis
 */
export function speakText(
  text: string,
  options: {
    pitch?: number;
    rate?: number;
    tone?: string;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
): void {
  if (!isSpeechSynthesisSupported()) return;

  // Clean markdown tags for spoken audio
  const cleanText = text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#*_\>~]/g, '')
    .trim();

  if (!cleanText) return;

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Set tone & pitch: If child personality, slightly higher pitch & cheerful rate
  if (options.tone === 'child') {
    utterance.pitch = options.pitch ?? 1.35;
    utterance.rate = options.rate ?? 1.05;
  } else {
    utterance.pitch = options.pitch ?? 1.0;
    utterance.rate = options.rate ?? 1.0;
  }

  // Look for Hindi or English Indian voice if available
  const voices = window.speechSynthesis.getVoices();
  const hindiOrIndianVoice = voices.find(
    v => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('Hindi') || v.name.includes('India')
  );
  if (hindiOrIndianVoice) {
    utterance.voice = hindiOrIndianVoice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  utterance.onerror = () => {
    if (options.onEnd) options.onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
