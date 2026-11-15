'use client';

// Speech synthesis and recognition utility with robust fallbacks
export class SpeechService {
  private static synth: SpeechSynthesis | null = null;
  private static recognition: any = null;

  static init() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        SpeechService.synth = window.speechSynthesis;
      }
      
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = false;
          rec.interimResults = true;
          rec.lang = 'en-IN'; // Indian English for authentic pronunciation and recognition
          SpeechService.recognition = rec;
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
        }
      }
    }
  }

  static speak(
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onStart?.();
        setTimeout(() => {
          onEnd?.();
          resolve();
        }, 1500);
        return;
      }

      window.speechSynthesis.cancel(); // Cancel any lingering speech

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select best voice (prefer Indian English or natural voice)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang === 'en-IN' || 
        v.name.includes('India') || 
        v.name.includes('Kiran') ||
        v.name.includes('Rishi') ||
        v.name.includes('Veena') ||
        v.name.includes('Natural') ||
        v.name.includes('Google UK English Female') ||
        v.lang.startsWith('en')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.92; // slightly slower for elderly comprehension
      utterance.pitch = 1.05; // warm, friendly tone

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  static stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  static listen(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): { stop: () => void } {
    if (typeof window === 'undefined') {
      return { stop: () => {} };
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError('Speech recognition not supported in this browser');
      return { stop: () => {} };
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          onResult(final, true);
        } else if (interim) {
          onResult(interim, false);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e);
        onError(e);
      };

      recognition.onend = () => {
        onEnd();
      };

      recognition.start();

      return {
        stop: () => {
          try {
            recognition.stop();
          } catch (e) {}
        }
      };
    } catch (err) {
      onError(err);
      return { stop: () => {} };
    }
  }
}
