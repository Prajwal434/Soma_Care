'use client';

import React from 'react';
import { Heart, User, Users, Sparkles, Layers, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: 'elder' | 'somabox' | 'caregiver';
  onViewChange: (view: 'elder' | 'somabox' | 'caregiver') => void;
  onOpenPitchGuide: () => void;
  onOpenSystemAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenPitchGuide,
  onOpenSystemAudit,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white tracking-tight">SomaCare</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              साथी
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Voice-first shared care prototype
          </p>
        </div>
      </div>

      {/* 3-View Switcher Toggle */}
      <div className="flex items-center bg-slate-900 border border-slate-700 p-1 rounded-2xl shadow-inner gap-1">
        <button
          onClick={() => onViewChange('elder')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentView === 'elder'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">1. Senior Voice</span>
          <span className="sm:hidden">Senior</span>
        </button>

        <button
          onClick={() => onViewChange('somabox')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentView === 'somabox'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">2. SomaBox™ Smart Tray</span>
          <span className="sm:hidden">SomaBox</span>
        </button>

        <button
          onClick={() => onViewChange('caregiver')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentView === 'caregiver'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">3. Caregiver Portal</span>
          <span className="sm:hidden">Portal</span>
        </button>
      </div>

      {/* Audit & Pitch Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSystemAudit}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System &amp; Security Audit</span>
        </button>

        <button
          onClick={onOpenPitchGuide}
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Pitch &amp; Business</span>
        </button>
      </div>
    </header>
  );
};
