'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Volume2, 
  Camera, 
  PhoneCall, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';
import { Medication, AdherenceLog, PharmacyOrder, SeniorProfile } from '../types';
import { SpeechService } from '../utils/speech';
import { processSeniorUtterance } from '../utils/aiBrain';
import { extractWakeWordCommand } from '../utils/demoSetup';
import { PillScannerModal } from './PillScannerModal';

interface ElderModeProps {
  profile: SeniorProfile;
  medications: Medication[];
  logs: AdherenceLog[];
  orders: PharmacyOrder[];
  onUpdateMedications: (meds: Medication[]) => void;
  onAddLog: (log: AdherenceLog) => void;
  onAddOrder: (order: PharmacyOrder) => void;
}

export const ElderMode: React.FC<ElderModeProps> = ({
  profile,
  medications,
  logs,
  onUpdateMedications,
  onAddLog,
  onAddOrder,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const wakeListenerRef = useRef<{ stop: () => void } | null>(null);
  const wakeRestartTimerRef = useRef<number | null>(null);
  const wakeEnabledRef = useRef(false);
  const suspendWakeRestartRef = useRef(false);
  const [seniorSpeech, setSeniorSpeech] = useState<string>('');
  const [aiSpeechResponse, setAiSpeechResponse] = useState<string>(
    `Namaste ${profile.nickname}! It is 10:00 AM. Did you take your morning sugar tablet after breakfast?`
  );
  const [activeRefillMedId, setActiveRefillMedId] = useState<string | null>('med-1');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  useEffect(() => {
    SpeechService.init();
    return () => {
      wakeEnabledRef.current = false;
      if (wakeRestartTimerRef.current) window.clearTimeout(wakeRestartTimerRef.current);
      wakeListenerRef.current?.stop();
    };
  }, []);

  const handleSpeak = (text: string) => {
    if (wakeEnabledRef.current) {
      suspendWakeRestartRef.current = true;
      if (wakeRestartTimerRef.current) window.clearTimeout(wakeRestartTimerRef.current);
      wakeListenerRef.current?.stop();
    }
    setIsSpeaking(true);
    SpeechService.speak(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    ).then(() => {
      if (wakeEnabledRef.current) {
        suspendWakeRestartRef.current = false;
        wakeRestartTimerRef.current = window.setTimeout(startWakeWordListener, 500);
      }
    });
  };

  const handleStartListening = () => {
    if (isListening) {
      SpeechService.stopSpeaking();
      setIsListening(false);
      return;
    }

    SpeechService.stopSpeaking();
    setIsSpeaking(false);
    setIsListening(true);
    setSeniorSpeech('');

    SpeechService.listen(
      (transcript, isFinal) => {
        setSeniorSpeech(transcript);
        if (isFinal) {
          setIsListening(false);
          handleProcessUtterance(transcript);
        }
      },
      (error) => {
        console.warn('Speech error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleProcessUtterance = (transcript: string) => {
    const response = processSeniorUtterance(
      transcript,
      medications,
      logs,
      activeRefillMedId
    );

    setAiSpeechResponse(response.displayText);
    handleSpeak(response.spokenText);

    if (response.newLog) {
      onAddLog(response.newLog);
    }

    if (response.newOrder) {
      onAddOrder(response.newOrder);
      // refill ordered, clear active prompt
      setActiveRefillMedId(null);
    }

    if (response.actionTaken === 'med_taken' && response.affectedMedId) {
      const updated = medications.map(m => 
        m.id === response.affectedMedId ? { ...m, takenToday: true, takenAt: 'Just now' } : m
      );
      onUpdateMedications(updated);
    }

    if (response.actionTaken === 'scan_prompt') {
      setTimeout(() => {
        setIsScannerOpen(true);
      }, 1000);
    }
  };

  const startWakeWordListener = () => {
    if (!wakeEnabledRef.current) return;
    setIsListening(true);
    wakeListenerRef.current = SpeechService.listen(
      (transcript, isFinal) => {
        setSeniorSpeech(transcript);
        if (!isFinal) return;
        const command = extractWakeWordCommand(transcript);
        if (command === null) return;
        if (command) {
          handleProcessUtterance(command);
        } else {
          setAiSpeechResponse('I am here. What would you like help with?');
          handleSpeak('I am here. What would you like help with?');
        }
      },
      (error) => {
        console.warn('Wake word listening stopped:', error);
        setIsListening(false);
        if (wakeEnabledRef.current) {
          wakeEnabledRef.current = false;
          setVoiceEnabled(false);
          setAiSpeechResponse('Voice access is off. You can continue with the large buttons or enable hands-free voice again.');
        }
      },
      () => {
        setIsListening(false);
        if (suspendWakeRestartRef.current) return;
        if (!wakeEnabledRef.current) {
          return;
        }
        wakeRestartTimerRef.current = window.setTimeout(startWakeWordListener, 700);
      },
      true
    );
  };

  const handleEnableWakeWord = () => {
    wakeEnabledRef.current = true;
    setVoiceEnabled(true);
    setAiSpeechResponse('Hands-free voice is on. Say “Soma” followed by your request.');
    startWakeWordListener();
    handleSpeak(`Namaste ${profile.nickname}. Voice is ready. Say Soma, then tell me what you need. The microphone is on while hands-free voice is enabled.`);
  };

  const handleDisableWakeWord = () => {
    wakeEnabledRef.current = false;
    setVoiceEnabled(false);
    setIsListening(false);
    if (wakeRestartTimerRef.current) window.clearTimeout(wakeRestartTimerRef.current);
    wakeListenerRef.current?.stop();
    wakeListenerRef.current = null;
    SpeechService.stopSpeaking();
  };

  const handleManualAction = (text: string) => {
    setSeniorSpeech(text);
    handleProcessUtterance(text);
  };

  const handleVerifiedViaVision = (med: Medication, notes: string) => {
    const updated = medications.map(m => 
      m.id === med.id ? { ...m, takenToday: true, takenAt: 'Just now' } : m
    );
    onUpdateMedications(updated);

    const newLog: AdherenceLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      medicationName: `${med.name} (${med.timeSlot})`,
      status: 'taken',
      notes: `Verified via AI Multimodal Camera OCR. Drug confirmed: ${notes}`,
      verificationMethod: 'vision',
      moodDetected: 'cheerful',
    };
    onAddLog(newLog);

    const speech = `Verified ${med.name}! Take one tablet with water now. I have notified ${profile.caregiverName} on WhatsApp.`;
    setAiSpeechResponse(`✅ Camera Verified: ${med.name}. Marked as taken.`);
    handleSpeak(speech);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {!voiceEnabled ? (
        <section className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 text-center shadow-xl" aria-labelledby="voice-start-title">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-200">Hands-free voice companion</p>
            <h2 id="voice-start-title" className="text-2xl sm:text-3xl font-extrabold text-white">Enable SomaCare wake word</h2>
            <p className="text-base sm:text-lg text-amber-100">Tap once and allow microphone access when your browser asks. Then say <strong>“Soma”</strong> followed by what you need. The microphone stays on until you turn hands-free voice off.</p>
            <button onClick={handleEnableWakeWord} className="min-h-16 w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xl font-extrabold shadow-lg focus:outline-none focus:ring-4 focus:ring-white/70">
              <Mic className="w-6 h-6 inline-block mr-2 align-middle" />Enable hands-free voice
            </button>
            <p className="text-sm text-amber-100/80">Browser support varies. You can always use the large on-screen buttons instead.</p>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-100 text-sm font-semibold" role="status">
          <span><Mic className="w-4 h-4 inline mr-2"/>Hands-free voice is on. {isListening ? 'Listening for “Soma”…' : 'Voice listening paused while SomaCare speaks.'}</span>
          <button onClick={handleDisableWakeWord} className="min-h-11 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold">Turn voice off</button>
        </div>
      )}

      {/* Warm Elderly Greeting Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 mb-2">
            <HeartHandshake className="w-4 h-4" /> Zero-Touch Senior Companion
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Namaste, {profile.nickname}! 🙏
          </h1>
          <p className="text-amber-200/90 text-lg sm:text-xl font-medium mt-1">
            Sunday, 15 November • Morning Medicine Time
          </p>
        </div>

        {/* SOS Emergency Call Button */}
        <button
          onClick={() => setEmergencyModalOpen(true)}
          aria-label={`Emergency SOS call to primary caregiver ${profile.caregiverName}`}
          className="min-h-[52px] px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg flex items-center gap-3 shadow-lg shadow-rose-600/30 active:scale-95 transition-all shrink-0 border-2 border-rose-400/50 focus:outline-none focus:ring-4 focus:ring-rose-500/50"
        >
          <PhoneCall className="w-6 h-6 animate-pulse" aria-hidden="true" />
          <span>Call {profile.caregiverName} (SOS)</span>
        </button>
      </div>

      {/* Main Interactive Voice Portal */}
      <div 
        role="region" 
        aria-label="Elder Voice Companion Interface"
        className="bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center text-center"
      >
        {/* Ambient Pulsing Rings */}
        <div className="relative my-6 flex items-center justify-center">
          {/* Animated Glow Rings when speaking or listening */}
          {(isListening || isSpeaking) && (
            <div className={`absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full animate-ping opacity-25 ${
              isListening ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
          )}
          {(isListening || isSpeaking) && (
            <div className={`absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full animate-pulse opacity-40 ${
              isListening ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          )}

          {/* Central Giant Voice Button */}
          <button
            onClick={voiceEnabled ? handleDisableWakeWord : handleStartListening}
            aria-label={voiceEnabled ? "Turn hands-free voice off" : isListening ? "Listening to your voice" : isSpeaking ? "Speaking medicine instructions" : "Tap to speak with voice companion"}
            aria-pressed={isListening}
            className={`relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-8 focus:ring-amber-500/60 ${
              isListening
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 ring-8 ring-amber-500/30 shadow-amber-500/50 scale-105'
                : isSpeaking
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 ring-8 ring-emerald-500/30 shadow-emerald-500/50'
                : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-orange-500/40 hover:scale-105'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-14 h-14 sm:w-18 sm:h-18 animate-bounce" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1">Listening...</span>
              </>
            ) : isSpeaking ? (
              <>
                <Volume2 className="w-14 h-14 sm:w-18 sm:h-18 animate-pulse" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1">Speaking...</span>
              </>
            ) : (
              <>
                <Mic className="w-14 h-14 sm:w-18 sm:h-18" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1">Tap to Speak</span>
              </>
            )}
          </button>
        </div>

        {/* State Label */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-base font-bold shadow-md ${
            isListening 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
              : isSpeaking 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            <Sparkles className="w-5 h-5 text-amber-400" />
            {isListening ? "Listening to Babuji..." : isSpeaking ? "Soma Care is talking..." : "Your reminder is ready. Use a button below or talk to me."}
          </span>
        </div>

        {/* Live Conversation Cards (Large Font for Aging Eyes) */}
        <div className="w-full space-y-4 max-w-2xl text-left" role="region" aria-label="Speech Transcript Dialog">
          {seniorSpeech && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 sm:p-5" aria-live="polite">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">You Said:</span>
              <p className="text-xl sm:text-2xl font-bold text-amber-100 mt-1">
                &ldquo;{seniorSpeech}&rdquo;
              </p>
            </div>
          )}

          <div className="bg-slate-800/90 border border-slate-600 rounded-2xl p-5 sm:p-6 shadow-lg" aria-live="polite" role="status">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Soma Care Companion:
              </span>
              <button 
                onClick={() => handleSpeak(aiSpeechResponse)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700/60 px-3 py-1 rounded-lg"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Replay Voice
              </button>
            </div>
            <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed">
              {aiSpeechResponse}
            </p>
          </div>
        </div>

        {/* 1-Tap Voice Simulation Chips (Elderly Friendly or Presentation Fail-safe) */}
        <div className="mt-6 pt-6 border-t border-slate-800 w-full max-w-2xl">
          <p className="text-base font-bold text-white mb-3 text-center">
            What would you like to do?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleManualAction("I took my sugar tablet with breakfast")}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-base font-semibold flex items-center justify-between text-left transition-all active:scale-98"
            >
              <span>✅ I took my medicine</span>
              <span className="text-sm text-emerald-400 font-normal">Mark dose taken</span>
            </button>
            <button
              onClick={() => handleManualAction("Which medicine should I take right now? The white one?")}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-base font-semibold flex items-center justify-between text-left transition-all active:scale-98"
            >
              <span>❓ What medicine is due?</span>
              <span className="text-sm text-amber-400 font-normal">Hear the next dose</span>
            </button>
            <button
              onClick={() => handleManualAction("Wait, I forgot if I took my sugar tablet. I am taking another one.")}
              className="px-4 py-3 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/40 text-rose-200 rounded-xl text-base font-semibold flex items-center justify-between text-left transition-all active:scale-98"
            >
              <span>⚠️ I may have taken this already</span>
              <span className="text-sm text-rose-400 font-normal">Check before taking</span>
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded-xl text-base font-semibold flex items-center justify-between text-left transition-all active:scale-98"
            >
              <span className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                Check my medicine
              </span>
              <span className="text-sm text-amber-400 font-normal">Use camera</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Commerce Engine: Voice Auto-Refill Card */}
      {activeRefillMedId && (
        <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1">
                ⭐ Voice Auto-Refill Trigger (1mg Partner)
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Only 3 tablets left of Glycomet-GP 1!
              </h3>
              <p className="text-slate-300 text-base mt-1">
                Say <strong className="text-emerald-300 font-bold">&ldquo;Yes, order it&rdquo;</strong> into the mic or click below. We will deliver a 30-day supply (₹245) from Tata 1mg to Lucknow tomorrow.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => handleManualAction("Yes please order the Glycomet refill from 1mg")}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-base shadow-lg shadow-emerald-500/25 transition-all text-center"
            >
              Order Refill (₹245)
            </button>
            <button
              onClick={() => setActiveRefillMedId(null)}
              className="px-4 py-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl text-xs font-semibold"
            >
              Remind Later
            </button>
          </div>
        </div>
      )}

      {/* Today's Medication Visual Timeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Clock className="w-6 h-6 text-amber-400" />
          Today&apos;s Medicine Schedule for Babuji
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`p-6 rounded-3xl border-2 transition-all ${
                med.takenToday
                  ? 'bg-slate-900/60 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/90 border-slate-700 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide mb-2 ${
                    med.takenToday 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {med.timeSlot} • {med.scheduledTime}
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">{med.name}</h3>
                  <p className="text-sm text-slate-400 font-medium">{med.genericName}</p>
                </div>

                {med.takenToday ? (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const updated = medications.map(m => 
                        m.id === med.id ? { ...m, takenToday: true, takenAt: 'Just now' } : m
                      );
                      onUpdateMedications(updated);
                      const newLog: AdherenceLog = {
                        id: `log-${Date.now()}`,
                        timestamp: 'Just now',
                        medicationName: med.name,
                        status: 'taken',
                        notes: `Manually verified: Babuji took ${med.name}.`,
                        verificationMethod: 'manual',
                        moodDetected: 'cheerful',
                      };
                      onAddLog(newLog);
                      handleSpeak(`Marked ${med.name} as taken.`);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all"
                  >
                    Mark Taken
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 text-sm space-y-2">
                <p className="text-slate-300">
                  <strong className="text-amber-300">Dosage:</strong> {med.dosage} ({med.pillColor}, {med.shape})
                </p>
                <p className="text-slate-400 text-xs">
                  💡 {med.instructions}
                </p>
                {med.takenToday && (
                  <p className="text-emerald-400 text-xs font-semibold">
                    ✓ Verified taken at {med.takenAt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments and family coordination */}
      <section className="bg-indigo-950/40 border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-4" aria-labelledby="appointments-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-indigo-300">YOUR HEALTH VISITS</p>
            <h2 id="appointments-heading" className="text-2xl font-extrabold text-white">Upcoming doctor appointment</h2>
          </div>
          <span className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-200 text-base font-bold">Thursday, 19 Nov • 11:30 AM</span>
        </div>
        <div className="bg-slate-900/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Dr. Meera Kapoor</h3>
            <p className="text-base text-slate-300">Cardiology • City Care Clinic, Lucknow</p>
            <p className="text-sm text-slate-400 mt-1">Rahul has been notified. Bring your medicine list.</p>
          </div>
          <button onClick={() => handleSpeak('Your next doctor appointment is Thursday, November 19 at 11:30 in the morning with Dr. Meera Kapoor at City Care Clinic. Rahul has been notified.')} className="min-h-14 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-base font-bold flex items-center justify-center gap-2">
            <Volume2 className="w-5 h-5" /> Hear appointment
          </button>
        </div>
      </section>

      {/* Multimodal Vision Scanner Modal */}
      <PillScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        medications={medications}
        onVerifyMedicine={handleVerifiedViaVision}
      />

      {/* Emergency SOS Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-rose-950 border-2 border-rose-500 w-full max-w-md rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto animate-bounce">
              <PhoneCall className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Emergency SOS Triggered!</h3>
            <p className="text-rose-200 text-sm">
              Connecting directly to <strong>{profile.caregiverName}</strong> ({profile.caregiverPhone}) and Lucknow emergency services.
            </p>
            <div className="bg-rose-900/60 p-4 rounded-2xl text-xs text-rose-100 font-mono text-left space-y-1">
              <p>✓ High-priority WhatsApp Alert sent with GPS location</p>
              <p>✓ Automated voice dispatch call dialing...</p>
              <p>✓ Neighbor alert: Mr. Gupta notified</p>
            </div>
            <button
              onClick={() => setEmergencyModalOpen(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-sm"
            >
              Close / Cancel Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
