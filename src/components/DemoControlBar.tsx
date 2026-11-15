'use client';

import React from 'react';
import { Sparkles, RefreshCcw, Camera, ShieldAlert, ShoppingBag, Mic, Layers } from 'lucide-react';

interface DemoControlBarProps {
  onRunScenario: (scenario: 'morning' | 'vision' | 'doubledose' | 'refill' | 'somabox') => void;
  onReset: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  onRunScenario,
  onReset,
}) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border-2 border-indigo-500/50 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-xl flex items-center gap-2 max-w-[95vw] overflow-x-auto">
      <div className="flex items-center gap-1.5 text-xs font-black text-indigo-300 pr-2 border-r border-slate-700 shrink-0">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">DEMO RUNNER:</span>
      </div>

      <button
        onClick={() => onRunScenario('morning')}
        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 border border-slate-700"
      >
        <Mic className="w-3.5 h-3.5 text-emerald-400" />
        <span>1. Voice Check-in</span>
      </button>

      <button
        onClick={() => onRunScenario('vision')}
        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 border border-slate-700"
      >
        <Camera className="w-3.5 h-3.5 text-amber-400" />
        <span>2. Pill Vision OCR</span>
      </button>

      <button
        onClick={() => onRunScenario('somabox')}
        className="px-2.5 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900/80 text-teal-300 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 border border-teal-500/50 ring-1 ring-teal-400/40"
      >
        <Layers className="w-3.5 h-3.5 text-teal-400" />
        <span>3. SomaBox™ Micro-Cam</span>
      </button>

      <button
        onClick={() => onRunScenario('doubledose')}
        className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 border border-rose-500/40"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        <span>4. Double-Dose Lock</span>
      </button>

      <button
        onClick={() => onRunScenario('refill')}
        className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 border border-emerald-500/40"
      >
        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
        <span>5. Voice Refill (1mg)</span>
      </button>

      <button
        onClick={onReset}
        title="Reset Demo State"
        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0 ml-1 transition-all"
      >
        <RefreshCcw className="w-4 h-4" />
      </button>
    </div>
  );
};
