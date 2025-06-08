/// <reference types="vite/client" />

interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

interface AbortSignal {
  static timeout(milliseconds: number): AbortSignal;
}