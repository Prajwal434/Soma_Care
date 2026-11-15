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
              <h2 className="text-2xl font-black text-white">SomaCare: Product and business hypothesis</h2>
              <p className="text-xs text-slate-400">Prototype scope and possible next steps</p>
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
            ⚡ The problem and approach
          </h3>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            SomaCare is designed around a shared care routine: the older adult stays at the centre of daily decisions, while a trusted family member can help organize medicines, appointments, and reminders. Voice is available after the person enables microphone access; large touch controls remain available. This prototype demonstrates the flows locally and does not perform clinical detection or contact external services.
          </p>
        </div>

        {/* Possible revenue models to validate */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Business model hypotheses to validate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Users className="w-4 h-4" /> B2C Distance Caregiver SaaS
              </div>
              <h4 className="text-lg font-bold text-white">Family plan</h4>
              <p className="text-xs text-slate-400">
                Test whether families value a continuing shared schedule, caregiver setup, and routine visibility enough to pay for a subscription.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold">
                <ShoppingBag className="w-4 h-4" /> Voice Refill Commerce
              </div>
              <h4 className="text-lg font-bold text-white">Optional refill support</h4>
              <p className="text-xs text-slate-400">
                Explore pharmacy referrals only with partner agreements and clear consent. A caregiver or senior should approve every order.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" /> B2B InsurTech Integration
              </div>
              <h4 className="text-lg font-bold text-white">Possible provider partnerships</h4>
              <p className="text-xs text-slate-400">
                Consider provider or insurer programs only after privacy, reliability, adoption, and health outcome evidence exists.
              </p>
            </div>
          </div>
        </div>

        {/* The Moat */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            🛡️ Product choices behind the prototype:
          </h3>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc pl-5">
            <li><strong>Two roles, one care routine:</strong> Keep recurring coordination in a caregiver view and daily choices in the senior view.</li>
            <li><strong>Voice plus visible controls:</strong> Voice can reduce navigation, while explicit buttons and a visible off switch provide fallback and control.</li>
            <li><strong>Physical context:</strong> The tray map explores how a future device might relate a dose schedule to a compartment; current scenarios are simulations.</li>
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
