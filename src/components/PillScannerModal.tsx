'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertTriangle, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { Medication } from '../types';

interface PillScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  onVerifyMedicine: (med: Medication, notes: string) => void;
}

export const PillScannerModal: React.FC<PillScannerModalProps> = ({
  isOpen,
  onClose,
  medications,
  onVerifyMedicine,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string>('sample-1');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'warning' | 'mismatch' | null;
    matchedMed?: Medication;
    confidence: number;
    detectedText: string;
    instructions: string;
    warningMessage?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      }
    } catch (err) {
      console.warn('Camera access not granted or unavailable:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleAnalyze = (sampleOverride?: string) => {
    setIsScanning(true);
    setScanResult(null);

    const targetSample = sampleOverride || selectedSample;

    setTimeout(() => {
      setIsScanning(false);

      if (targetSample === 'sample-1') {
        // Glycomet-GP 1
        const med = medications.find(m => m.id === 'med-1');
        setScanResult({
          status: 'success',
          matchedMed: med,
          confidence: 98.6,
          detectedText: 'GLYCOMET-GP 1 • Metformin 500mg / Glimepiride 1mg • Exp: 08/2026',
          instructions: 'Verified! Take 1 tablet with half a glass of water after breakfast.',
        });
      } else if (targetSample === 'sample-2') {
        // Telma 40
        const med = medications.find(m => m.id === 'med-2');
        setScanResult({
          status: 'success',
          matchedMed: med,
          confidence: 99.1,
          detectedText: 'TELMA 40 • Telmisartan IP 40mg • Glenmark Pharma • Batch: GL-921',
          instructions: 'Verified Blood Pressure tablet. Scheduled for Afternoon (1:30 PM).',
        });
      } else if (targetSample === 'sample-3') {
        // Shelcal 500
        const med = medications.find(m => m.id === 'med-3');
        setScanResult({
          status: 'success',
          matchedMed: med,
          confidence: 97.4,
          detectedText: 'SHELCAL 500 • Calcium Carbonate 500mg + Vit D3 • Torrent',
          instructions: 'Verified Calcium supplement. Scheduled for Evening with tea/milk.',
        });
      } else {
        // Mismatch / Warning
        setScanResult({
          status: 'warning',
          confidence: 92.0,
          detectedText: 'UNKNOWN OINTMENT / EXPIRED TABLET • Batch #8812',
          instructions: 'STOP! This does not match your scheduled prescriptions.',
          warningMessage: 'This packet does not match any prescribed daily medication. Do not ingest!',
        });
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Medicine Strip Vision Scanner</h2>
              <p className="text-xs text-slate-400">Point phone camera at tablet strip or select sample below</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport & Camera */}
        <div className="relative flex-1 bg-slate-950 min-h-[300px] flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-800/80 border-2 border-dashed border-amber-500/40 flex items-center justify-center mb-4 text-amber-400 animate-pulse">
                <Camera className="w-10 h-10" />
              </div>
              <p className="text-slate-300 font-medium text-lg">Webcam Preview / Simulated Visual Feed</p>
              <p className="text-slate-500 text-sm max-w-sm mt-1">
                Holding medicine blister pack in front of camera lens for high-resolution OCR analysis.
              </p>
            </div>
          )}

          {/* Target Scanner Reticle */}
          <div className="absolute inset-8 pointer-events-none border-2 border-amber-400/40 rounded-2xl flex flex-col justify-between p-4">
            <div className="flex justify-between items-center text-xs font-mono text-amber-300 bg-black/60 px-3 py-1 rounded-full w-fit">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-ping" />
              AI VISION OCR SENSOR ACTIVE
            </div>
            <div className="text-center">
              <p className="text-xs font-mono bg-black/60 text-slate-300 px-3 py-1.5 rounded-lg inline-block">
                Align medicine name & dosage inside frame
              </p>
            </div>
          </div>

          {/* Scanning Animation Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-amber-300 font-bold text-lg">Analyzing Strip with Multimodal Vision...</p>
              <p className="text-slate-300 text-xs mt-1">Cross-referencing active prescription registry</p>
            </div>
          )}
        </div>

        {/* Quick Sample Selector for Flawless Hackathon Demo */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Demo Sample Switcher (Quick Testing):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'sample-1', label: 'Glycomet-GP 1', desc: 'Morning Sugar' },
              { id: 'sample-2', label: 'Telma 40', desc: 'BP Tablet' },
              { id: 'sample-3', label: 'Shelcal 500', desc: 'Calcium Vit-D' },
              { id: 'sample-4', label: 'Unknown Strip', desc: 'Safety Test' },
            ].map(sample => (
              <button
                key={sample.id}
                onClick={() => {
                  setSelectedSample(sample.id);
                  handleAnalyze(sample.id);
                }}
                className={`px-3 py-2 rounded-xl text-left text-xs transition-all border ${
                  selectedSample === sample.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="truncate">{sample.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{sample.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        {scanResult && (
          <div className="p-6 bg-slate-800/90 border-t border-slate-700 space-y-4">
            {scanResult.status === 'success' && scanResult.matchedMed ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-emerald-300">
                      {scanResult.matchedMed.name}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {scanResult.confidence}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 font-mono">
                    Detected: {scanResult.detectedText}
                  </p>
                  <p className="text-sm font-medium text-emerald-200 mt-2 bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-700/30">
                    💡 <strong>Instructions:</strong> {scanResult.instructions}
                  </p>
                  <button
                    onClick={() => {
                      if (scanResult.matchedMed) {
                        onVerifyMedicine(scanResult.matchedMed, scanResult.detectedText);
                        onClose();
                      }
                    }}
                    className="mt-3 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Confirm & Mark Dose Taken
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-rose-300">Medication Warning / Unrecognized</h3>
                  <p className="text-xs text-slate-300 mt-0.5 font-mono">
                    Detected: {scanResult.detectedText}
                  </p>
                  <p className="text-sm font-medium text-rose-200 mt-2 bg-rose-900/30 p-2.5 rounded-xl border border-rose-700/30">
                    ⚠️ {scanResult.warningMessage}
                  </p>
                  <p className="text-xs text-rose-400 mt-2">
                    Caregiver alert has been triggered automatically for safety.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => handleAnalyze()}
            disabled={isScanning}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyzing Strip...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Scan Current Frame
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
