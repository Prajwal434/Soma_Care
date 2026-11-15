'use client';

import React from 'react';
import { X, Sparkles, Users, ShieldCheck, ShoppingBag, DollarSign } from 'lucide-react';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">SomaCare: Pitch Deck & Business Model</h2>
              <p className="text-xs text-slate-400">Judges Cheatsheet • Catalyst Hackathon 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 30-Second Pitch */}
        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            ⚡ The 30-Second Elevator Pitch
          </h3>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            &ldquo;Over 140 million seniors in India live with chronic illnesses, and 60% fail their medication schedules because apps and push notifications have too much friction. <strong>The senior is the user, but the working child is the buyer.</strong> SomaCare is a zero-touch, voice-first companion that speaks to aging parents in natural Hinglish, verifies pill strips via multimodal AI, prevents double-dosing, and turns verified adherence into automatic pharmacy refills with partner pharmacies.&rdquo;
          </p>
        </div>

        {/* 3 Defensible Revenue Streams */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> 3 Defensible Revenue Streams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Users className="w-4 h-4" /> B2C Distance Caregiver SaaS
              </div>
              <h4 className="text-lg font-bold text-white">₹1,499 / month</h4>
              <p className="text-xs text-slate-400">
                Paid by 30M+ working tech workers / NRIs living away from aging parents. Buys anxiety relief & WhatsApp heartbeat.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold">
                <ShoppingBag className="w-4 h-4" /> Voice Refill Commerce
              </div>
              <h4 className="text-lg font-bold text-white">12% - 18% Take Rate</h4>
              <p className="text-xs text-slate-400">
                Pill depletion auto-triggers 1-click voice reorders fulfilled via Tata 1mg & Apollo. High recurring monthly GMV.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" /> B2B InsurTech Integration
              </div>
              <h4 className="text-lg font-bold text-white">₹4,200 Premium Rebate</h4>
              <p className="text-xs text-slate-400">
                Insurers reward &gt;90% verified adherence to avoid expensive ICU readmissions. Shared revenue per policyholder.
              </p>
            </div>
          </div>
        </div>

        {/* The Moat */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            🛡️ Why This Isn&apos;t Just Another AI Wrapper (The Moat):
          </h3>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc pl-5">
            <li><strong>Zero Cognitive Friction:</strong> Built entirely for tech-illiterate elders using conversational speech and computer vision rather than buttons or dropdowns.</li>
            <li><strong>Double-Dosing Safety Lock:</strong> Saves lives by preventing dementia/confusion related overdoses before ingestion.</li>
            <li><strong>Closed-Loop Commerce Engine:</strong> Bridges daily voice adherence directly to pharmaceutical fulfillment.</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-sm"
        >
          Got It, Ready to Demo!
        </button>
      </div>
    </div>
  );
};
