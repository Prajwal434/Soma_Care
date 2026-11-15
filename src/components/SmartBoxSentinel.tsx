'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  MessageSquare,
  Play,
  RotateCcw
} from 'lucide-react';
import { Medication, AdherenceLog, SeniorProfile } from '../types';
import { SpeechService } from '../utils/speech';
import { getBoxSlot, getNextScheduledMedication } from '../utils/demoSetup';

interface SmartBoxSentinelProps {
  profile: SeniorProfile;
  medications: Medication[];
  onAddLog: (log: AdherenceLog) => void;
  highlightedMedicationId?: string;
}

export type BoxScenario = 'safe_single' | 'hazard_double' | 'hazard_wrong_slot' | 'idle';

export const SmartBoxSentinel: React.FC<SmartBoxSentinelProps> = ({
  profile,
  medications,
  onAddLog,
  highlightedMedicationId,
}) => {
  const [activeScenario, setActiveScenario] = useState<BoxScenario>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState<string | null>(null);
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextMedication = getNextScheduledMedication(medications);
  const highlightedMedication = medications.find(med => med.id === highlightedMedicationId) || nextMedication;
  const highlightedSlot = highlightedMedication ? getBoxSlot(highlightedMedication.timeSlot) : undefined;
  const boxSlots = [
    { label: 'Morning', slot: 'Slot 1' },
    { label: 'Afternoon', slot: 'Slot 2' },
    { label: 'Evening', slot: 'Slot 3' },
    { label: 'Night', slot: 'Slot 4' },
  ];

  useEffect(() => {
    SpeechService.init();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setUseRealWebcam(true);
        }
      }
    } catch (err) {
      console.warn('Webcam fallback to virtual smart tray:', err);
      setUseRealWebcam(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setUseRealWebcam(false);
  };

  const runBoxSimulation = (scenario: BoxScenario) => {
    setIsAnalyzing(true);
    setActiveScenario(scenario);
    setAlertDispatched(null);
    SpeechService.stopSpeaking();

    setTimeout(() => {
      setIsAnalyzing(false);

      if (scenario === 'safe_single') {
        const speech = "One tablet detected, Babuji. Safe to take with water!";
        SpeechService.speak(speech);

        const newLog: AdherenceLog = {
          id: `log-${Date.now()}`,
          timestamp: 'Just now',
          medicationName: 'Glycomet-GP 1 (Morning)',
          status: 'taken',
          notes: 'SomaBox Micro-Cam verified: Slot 1 (Morning) opened. Exactly 1 tablet extracted. Ingestion gesture verified.',
          verificationMethod: 'vision',
          moodDetected: 'cheerful',
        };
        onAddLog(newLog);
      } else if (scenario === 'hazard_double') {
        const speech = "Babuji, wait! That is wrong! You took out TWO tablets from the morning box. Please put one tablet back!";
        SpeechService.speak(speech);

        setAlertDispatched(
          `🚨 CRITICAL WHATSAPP TO ${profile.caregiverName} (+91 98450 12345): "SomaBox detected Babuji lifted 2 pills of Glycomet from Slot 1 (overdose hazard). Voice intercept active on speaker."`
        );

        const newLog: AdherenceLog = {
          id: `log-${Date.now()}`,
          timestamp: 'Just now',
          medicationName: 'Glycomet-GP 1 (Double Dose Hazard)',
          status: 'warning',
          notes: 'CRITICAL SAFETY INTERCEPT: SomaBox Micro-Cam detected 2 tablets in hand from Slot 1. Spoken voice alert fired. Primary caretaker alerted via WhatsApp.',
          verificationMethod: 'vision',
          moodDetected: 'confused',
        };
        onAddLog(newLog);
      } else if (scenario === 'hazard_wrong_slot') {
        const speech = "Babuji, stop! That is the wrong box! You opened the Night box for cholesterol. It is morning time. Please close it and open the Green Morning box.";
        SpeechService.speak(speech);

        setAlertDispatched(
          `⚠️ WARNING WHATSAPP TO ${profile.caregiverName}: "SomaBox detected Babuji opened Slot 4 (Night Cholesterol) at 10:55 AM. Voice redirection active."`
        );

        const newLog: AdherenceLog = {
          id: `log-${Date.now()}`,
          timestamp: 'Just now',
          medicationName: 'Wrong Compartment Opened (Night)',
          status: 'warning',
          notes: 'SAFETY INTERCEPT: Babuji opened Night compartment during Morning schedule. Micro-Cam intercepted before ingestion.',
          verificationMethod: 'vision',
          moodDetected: 'confused',
        };
        onAddLog(newLog);
      }
    }, 900);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Interactive Tray Demo
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
              Sensor Concept
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SomaBox™ Ambient Tray Sentinel
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Shows how a connected tray could map scheduled medicines to compartments and flag simulated safety events. This prototype does not yet detect pills or hand movements from a camera.
          </p>
        </div>

        <button
          onClick={() => {
            if (useRealWebcam) stopCamera();
            else startCamera();
          }}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 flex items-center gap-2 shrink-0 transition-all"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          {useRealWebcam ? 'Switch to Virtual Box' : 'Use Real Webcam'}
        </button>
      </div>

      <section className="bg-emerald-950/40 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 space-y-4" aria-labelledby="box-map-title">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-300 font-bold">SomaBox demo proof</p>
            <h2 id="box-map-title" className="text-2xl font-extrabold text-white">Find the next medicine in the tray</h2>
          </div>
          {highlightedMedication && highlightedSlot ? (
            <div className="rounded-2xl bg-amber-400 px-5 py-3 text-slate-950">
              <p className="text-xs font-bold uppercase">Next dose • {highlightedSlot}</p>
              <p className="text-xl font-black">{highlightedMedication.name}</p>
              <p className="text-sm font-semibold">{highlightedMedication.timeSlot} • {highlightedMedication.scheduledTime}</p>
            </div>
          ) : <p className="text-emerald-100">No pending medicine in today&apos;s saved schedule.</p>}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {boxSlots.map(({ label, slot }) => {
            const med = medications.find(item => item.timeSlot === label);
            const selected = !!med && med.id === highlightedMedication?.id;
            return <div key={slot} className={`rounded-2xl border-2 p-4 min-h-28 ${selected ? 'bg-amber-400 border-amber-200 text-slate-950 ring-4 ring-amber-300/30' : 'bg-slate-900/80 border-slate-700 text-white'}`}>
              <p className={`text-xs font-black uppercase tracking-wide ${selected ? 'text-slate-800' : 'text-emerald-300'}`}>{slot} • {label}</p>
              <p className="font-bold mt-2">{med?.name || 'No medicine assigned'}</p>
              {med && <p className={`text-xs mt-1 ${selected ? 'text-slate-800' : 'text-slate-400'}`}>{med.scheduledTime} • {med.takenToday ? 'Taken' : 'Not yet taken'}</p>}
              {selected && <p className="text-xs font-black mt-2">← NEXT DOSE</p>}
            </div>;
          })}
        </div>
        <p className="text-xs text-slate-400">Demo mapping: scheduled time of day points to one of four labeled tray compartments. Real pill detection requires connected tray sensors or a camera model; this screen visualizes the schedule mapping.</p>
      </section>

      {/* Main Interactive Vision Stage */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top Camera Status Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">{useRealWebcam ? 'CAMERA PREVIEW • CONNECTED' : 'VIRTUAL TRAY • DEMO MODE'}</span>
            <span className="text-slate-500 hidden sm:inline">| Schedule mapping • sensor events simulated</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Target User: <strong className="text-white">{profile.nickname}</strong>
          </div>
        </div>

        {/* Visual Monitoring Canvas */}
        <div className="relative min-h-[380px] sm:min-h-[440px] bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-10">
          {useRealWebcam ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          ) : null}

          {/* Virtual Top-Down Smart Pill Organizer Graphic */}
          <div className="relative z-10 w-full max-w-3xl bg-slate-900/90 border-4 border-slate-700 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Physical 4-Slot Medicine Organizer (Overhead View)
              </h3>
              <span className="text-xs font-mono text-slate-400">Current Time: 10:55 AM (Morning Slot Due)</span>
            </div>

            {/* The 4 Physical Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Slot 1: Morning */}
              <div className={`p-4 rounded-2xl border-2 transition-all relative ${
                activeScenario === 'safe_single' || activeScenario === 'hazard_double'
                  ? 'bg-emerald-950/60 border-emerald-400 ring-4 ring-emerald-500/20'
                  : 'bg-slate-800/80 border-slate-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Slot 1: Morning</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeScenario === 'safe_single' || activeScenario === 'hazard_double'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {activeScenario === 'safe_single' || activeScenario === 'hazard_double' ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-2">Glycomet-GP 1</h4>
                <p className="text-[11px] text-slate-400">1 Sugar Pill Prescribed</p>
                <div className="mt-3 text-xs font-mono">
                  {activeScenario === 'hazard_double' ? (
                    <span className="text-rose-400 font-bold bg-rose-950/80 px-2 py-1 rounded-lg block">
                      ⚠️ Hand Detected: 2 Pills Lifted!
                    </span>
                  ) : activeScenario === 'safe_single' ? (
                    <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2 py-1 rounded-lg block">
                      ✓ Hand: 1 Pill Lifted
                    </span>
                  ) : (
                    <span className="text-slate-500">Latch Secured</span>
                  )}
                </div>
              </div>

              {/* Slot 2: Afternoon */}
              <div className="p-4 rounded-2xl border-2 bg-slate-800/50 border-slate-700 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Slot 2: Noon</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    CLOSED
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-2">Telma 40</h4>
                <p className="text-[11px] text-slate-400">BP (Scheduled 1:30 PM)</p>
                <div className="mt-3 text-xs font-mono text-slate-500">Latch Secured</div>
              </div>

              {/* Slot 3: Evening */}
              <div className="p-4 rounded-2xl border-2 bg-slate-800/50 border-slate-700 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Slot 3: Evening</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    CLOSED
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-2">Shelcal 500</h4>
                <p className="text-[11px] text-slate-400">Calcium (5:00 PM)</p>
                <div className="mt-3 text-xs font-mono text-slate-500">Latch Secured</div>
              </div>

              {/* Slot 4: Night */}
              <div className={`p-4 rounded-2xl border-2 transition-all relative ${
                activeScenario === 'hazard_wrong_slot'
                  ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500/20'
                  : 'bg-slate-800/50 border-slate-700 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Slot 4: Night</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeScenario === 'hazard_wrong_slot' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {activeScenario === 'hazard_wrong_slot' ? 'WRONG OPEN' : 'CLOSED'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-2">Atorva 10</h4>
                <p className="text-[11px] text-slate-400">Cholesterol (9:30 PM)</p>
                <div className="mt-3 text-xs font-mono">
                  {activeScenario === 'hazard_wrong_slot' ? (
                    <span className="text-rose-300 font-bold bg-rose-900/80 px-2 py-1 rounded-lg block text-[11px]">
                      🚨 INVALID TIME OPENED!
                    </span>
                  ) : (
                    <span className="text-slate-500">Latch Secured</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bounding Box Action Overlay */}
            {activeScenario !== 'idle' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {activeScenario === 'safe_single' ? (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 animate-bounce">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                  )}

                  <div>
                    <h4 className={`text-lg font-black ${
                      activeScenario === 'safe_single' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {activeScenario === 'safe_single' 
                        ? '✓ Safe Action: 1 Tablet Extracted (Verified)' 
                        : activeScenario === 'hazard_double'
                        ? '🚨 OVERDOSE INTERCEPT: 2 Tablets Lifted from Slot 1!'
                        : '⚠️ MISMATCH: Night Compartment Opened in Morning!'}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {activeScenario === 'safe_single'
                        ? 'Visual neural net verified exactly 1 oval tablet on palm. Swallowing gesture registered.'
                        : activeScenario === 'hazard_double'
                        ? 'SomaBox speaker immediately ordered Babuji to put 1 tablet back. Hypoglycemia prevented.'
                        : 'Babuji attempted to take Night cholesterol med instead of Morning sugar tablet.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const text = activeScenario === 'safe_single'
                      ? "One tablet detected, Babuji. Safe to take with water!"
                      : activeScenario === 'hazard_double'
                      ? "Babuji, wait! That is wrong! You took out TWO tablets from the morning box. Please put one tablet back!"
                      : "Babuji, stop! That is the wrong box! You opened the Night box for cholesterol. Please close it.";
                    SpeechService.speak(text);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl shrink-0 transition-all"
                >
                  🔊 Replay Voice Alert
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instant Primary Caretaker WhatsApp Dispatch Banner */}
        {alertDispatched && (
          <div className="bg-rose-950/90 border-t-2 border-rose-500 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                  Caregiver Emergency Dispatch Engine
                </span>
                <p className="text-xs sm:text-sm text-white font-mono mt-0.5">
                  {alertDispatched}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-500 text-slate-950 font-black text-xs shrink-0">
              DISPATCHED
            </span>
          </div>
        )}
      </div>

      {/* Interactive Simulation Controls for Judges (The Hackathon Test Bar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Judges Test Scenarios (Run Live Physical Box Tests)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate what happens when the camera scans Babuji interacting with the physical pill box:
            </p>
          </div>
          <button
            onClick={() => setActiveScenario('idle')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Reset Box"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Test 1: Safe Single Pill */}
          <button
            onClick={() => runBoxSimulation('safe_single')}
            disabled={isAnalyzing}
            className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-98 ${
              activeScenario === 'safe_single'
                ? 'bg-emerald-950/80 border-emerald-400 text-white'
                : 'bg-slate-800/80 border-slate-700 hover:border-emerald-500/50 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-emerald-400 uppercase">Scenario 1 (Safe)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Babuji takes 1 Morning Pill</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Slot 1 opens, AI counts 1 tablet on palm. Reassures Babuji & logs dose.
            </p>
          </button>

          {/* Test 2: Accidental Overdose (2 Pills) */}
          <button
            onClick={() => runBoxSimulation('hazard_double')}
            disabled={isAnalyzing}
            className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-98 ${
              activeScenario === 'hazard_double'
                ? 'bg-rose-950/80 border-rose-500 text-white ring-2 ring-rose-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-rose-500/50 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-rose-400 uppercase">Scenario 2 (Hazard)</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Babuji pulls out 2 Pills!</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              AI counts 2 pills. Instant loud voice alarm: "That's wrong, put one back!" + WhatsApp alert.
            </p>
          </button>

          {/* Test 3: Wrong Slot Hazard */}
          <button
            onClick={() => runBoxSimulation('hazard_wrong_slot')}
            disabled={isAnalyzing}
            className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-98 ${
              activeScenario === 'hazard_wrong_slot'
                ? 'bg-amber-950/80 border-amber-400 text-white ring-2 ring-amber-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-amber-500/50 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-400 uppercase">Scenario 3 (Wrong Slot)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Opens Night Box at 10 AM</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              AI spots invalid compartment. Warns Babuji before he swallows his sleeping tablet.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
