'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  Plus, 
  Download, 
  Smile 
} from 'lucide-react';
import { Medication, AdherenceLog, PharmacyOrder, SeniorProfile } from '../types';
import { CareSetupPanel } from './CareSetupPanel';

interface CaregiverModeProps {
  profile: SeniorProfile;
  medications: Medication[];
  logs: AdherenceLog[];
  orders: PharmacyOrder[];
  onTriggerRefill: (medId: string) => void;
  onAddPrescription: () => void;
}

export const CaregiverMode: React.FC<CaregiverModeProps> = ({
  profile,
  medications,
  logs,
  orders,
  onTriggerRefill,
  onAddPrescription,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pharmacy' | 'insurance' | 'logs' | 'appointments' | 'access'>('overview');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCareSetup, setShowCareSetup] = useState(false);

  // Compute adherence stats
  const takenCount = medications.filter(m => m.takenToday).length;
  const totalCount = medications.length;
  const todayAdherence = Math.round((takenCount / totalCount) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 text-slate-100">
      {/* Caregiver Header Card */}
      <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              Distance Care: {profile.seniorCity} ⇄ {profile.caregiverCity}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              {profile.subscriptionPlan}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Care Dashboard: {profile.name} (Age {profile.age})
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Supervised by son <strong className="text-white">{profile.caregiverName}</strong> • Daily biometric voice check-ins & smart fulfillment active.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setShowCertificateModal(true)}
            className="flex-1 sm:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Insurance Certificate
          </button>
          <button
            onClick={onAddPrescription}
            className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Prescription (Scan Rx)
          </button>
        </div>
      </div>

      {/* KPI Cards Row (The Business & Care Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Adherence */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Adherence</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{profile.adherenceRate}%</span>
            <span className="text-xs font-semibold text-emerald-400">+{todayAdherence > 50 ? '2.4%' : '0%'} this wk</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {takenCount} of {totalCount} scheduled doses verified today
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${profile.adherenceRate}%` }} 
            />
          </div>
        </div>

        {/* KPI 2: Cognitive & Mood Sentiment */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voice Sentiment</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Smile className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">Cheerful</span>
            <span className="text-xs font-semibold text-slate-400">Normal Pitch</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Acoustic voice analysis detected high cognitive clarity & calm response.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <Activity className="w-3.5 h-3.5" /> Stability Score: 94/100
          </div>
        </div>

        {/* KPI 3: Smart Refill Inventory (The Commerce Hook) */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refill Inventory</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-400">1 Low Stock</span>
            <span className="text-xs font-semibold text-slate-400">Tata 1mg</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Glycomet-GP has 3 pills remaining. Auto-reorder enabled on prompt.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Reorder Ready
          </div>
        </div>

        {/* KPI 4: InsurTech Premium Savings (The B2B Hook) */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">InsurTech Reward</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-300">₹{profile.annualSavings}</span>
            <span className="text-xs font-semibold text-teal-400">Saved/yr</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Star Health 12% premium discount applied for verified &gt;95% adherence.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
            ✓ Policy {profile.insurancePolicyNumber}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-indigo-950/40 border border-indigo-500/30 rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-300">Next appointment</p>
          <h2 className="text-xl font-bold text-white mt-2">Dr. Meera Kapoor • Cardiology</h2>
          <p className="text-sm text-slate-300 mt-1">Thursday, 19 Nov at 11:30 AM • City Care Clinic, Lucknow</p>
          <p className="text-xs text-indigo-200 mt-3">Email reminder scheduled for you and Ramesh, 24 hours before.</p>
        </section>
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Shared care access</p>
          <h2 className="text-xl font-bold text-white mt-2">Family access by passcode</h2>
          <p className="text-sm text-slate-300 mt-1">Ramesh remains in control of who can see and manage his care plan.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-3 py-2 rounded-xl bg-slate-800 text-sm text-white">Rahul • Caregiver • Edit</span>
            <span className="px-3 py-2 rounded-xl bg-slate-800 text-sm text-white">Anita • Family • View</span>
            <button onClick={() => alert('Demo passcode: 482 916. Share only with a trusted family member.')} className="px-3 py-2 rounded-xl bg-emerald-600 text-sm font-bold text-white">Invite with passcode</button>
          </div>
        </section>
      </div>

      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div><p className="text-xs uppercase tracking-wide text-amber-300 font-bold">Set up shared care</p><h2 className="text-xl text-white font-bold mt-1">Connect family, choose reminders, add appointments</h2><p className="text-sm text-slate-400 mt-1">Configure the demo flow. You stay in control of access and alerts.</p></div>
          <button aria-expanded={showCareSetup} onClick={() => setShowCareSetup(value => !value)} className="min-h-12 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">{showCareSetup ? 'Close setup' : 'Open care setup'}</button>
        </div>
        {showCareSetup && <div className="mt-5"><CareSetupPanel /></div>}
        {!showCareSetup && <p className="text-xs text-slate-500 mt-3">Prototype mode: invites, passcodes, appointments, and email preferences are simulated locally; delivery and authentication are not connected.</p>}
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Medication Schedule & Adherence' },
          { id: 'appointments', label: 'Appointments' },
          { id: 'access', label: 'Family Access' },
          { id: 'pharmacy', label: 'Smart Pharmacy & Auto-Refills (1mg/Apollo)' },
          { id: 'logs', label: 'Live Verification Transcript & Safety Logs' },
          { id: 'insurance', label: 'InsurTech & Hospital Compliance' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'appointments' && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div><h3 className="text-xl font-bold text-white">Doctor appointments</h3><p className="text-sm text-slate-400">Shared schedule and reminder status</p></div>
            <button onClick={() => alert('Appointment added to the shared care calendar.')} className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl">+ Add appointment</button>
          </div>
          <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <h4 className="text-lg font-bold text-white">Dr. Meera Kapoor • Cardiology</h4>
            <p className="text-slate-300">Thursday, 19 Nov • 11:30 AM • City Care Clinic, Lucknow</p>
            <p className="text-sm text-indigo-200 mt-2">Email reminders: patient and caregiver, 24 hours before and on appointment morning.</p>
          </div>
        </section>
      )}
      {activeTab === 'access' && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">People sharing Ramesh&apos;s care</h3>
          <p className="text-sm text-slate-400">Access uses a personal passcode. The senior decides who can view or change the care plan.</p>
          {[['Rahul Sharma', 'Primary caregiver', 'Can manage medicines and appointments'], ['Anita Sharma', 'Family member', 'Can view schedule and adherence']].map(([name, role, access]) => <div key={name} className="p-4 rounded-2xl bg-slate-800 flex flex-col sm:flex-row sm:justify-between gap-1"><strong className="text-white">{name} • {role}</strong><span className="text-sm text-slate-300">{access}</span></div>)}
          <button onClick={() => alert('Demo passcode: 482 916. This prototype does not create real accounts.')} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Create family passcode</button>
        </section>
      )}

      {/* Tab 1: Overview (Medications) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map(med => (
              <div 
                key={med.id} 
                className={`p-6 rounded-3xl border ${
                  med.takenToday 
                    ? 'bg-slate-900/60 border-emerald-500/30' 
                    : 'bg-slate-900/90 border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                      med.takenToday
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {med.timeSlot} • {med.scheduledTime}
                    </span>
                    <h3 className="text-xl font-bold text-white">{med.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{med.genericName}</p>
                  </div>
                  {med.takenToday ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Taken at {med.takenAt}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pills Remaining:</span>
                    <span className={`font-mono font-bold ${
                      med.remainingPills <= med.refillThreshold ? 'text-rose-400' : 'text-slate-200'
                    }`}>
                      {med.remainingPills} of {med.totalPills} Tablets
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        med.remainingPills <= med.refillThreshold ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${(med.remainingPills / med.totalPills) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Partner: <strong className="text-slate-200">{med.pharmacyPartner}</strong> (₹{med.price}/strip)
                    </span>
                    {med.remainingPills <= med.refillThreshold && (
                      <button
                        onClick={() => onTriggerRefill(med.id)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                      >
                        <ShoppingBag className="w-3 h-3" /> Auto-Refill Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Smart Pharmacy (The Commerce Model) */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-950/60 via-slate-900 to-indigo-950/60 border border-orange-500/30 rounded-3xl p-6 sm:p-7">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs uppercase tracking-wider">
                  Recurring Commerce Engine
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">
                  Connected Fulfillment Pipeline (Tata 1mg & Apollo)
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Soma Care actively projects when blister packs will exhaust based on daily adherence verifications. Voice authorization or 1-click caregiver trigger routes orders directly to partner pharmacies with 15% affiliate commission.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400">Billed Card:</span>
                <p className="text-sm font-bold text-white">HDFC Regalia •••• 9214</p>
                <span className="text-xs text-emerald-400 font-semibold">Auto-Pay Authorized</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" /> Recent Automated Orders & Refill History
          </h3>

          <div className="space-y-3">
            {orders.map(order => (
              <div 
                key={order.id}
                className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {order.id}
                    </span>
                    <span className="text-base font-bold text-white">{order.medicationName}</span>
                    <span className="text-xs text-slate-400">({order.quantity})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ordered via <strong className="text-slate-200">{order.partner}</strong> • {order.orderedAt} • {order.paidBy}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-lg font-black text-white">₹{order.price}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Live Verification Logs & Safety */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Real-Time Adherence Timeline & Audio Verification Events
            </h3>
            <span className="text-xs text-slate-400">Auto-synced with Senior device</span>
          </div>

          <div className="space-y-3">
            {logs.map(log => (
              <div
                key={log.id}
                className={`p-5 rounded-2xl border transition-all ${
                  log.status === 'warning'
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : log.status === 'refill_ordered'
                    ? 'bg-orange-950/30 border-orange-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {log.status === 'warning' ? (
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    ) : log.status === 'refill_ordered' ? (
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-white">{log.medicationName}</h4>
                      <span className="text-xs text-slate-400">{log.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300">
                      Method: {log.verificationMethod.toUpperCase()}
                    </span>
                    {log.moodDetected && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 text-[11px] font-semibold">
                        Mood: {log.moodDetected}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 pl-11">
                  {log.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: InsurTech & Compliance (The B2B Model) */}
      {activeTab === 'insurance' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs uppercase tracking-wider">
                  B2B InsurTech Integration
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {profile.insurancePartner} Compliance Rating
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-xl">
                  By mathematically proving daily medicine adherence via voice and camera logs, hospitalizations from stroke and glycemic spikes drop by 38%. Insurers reward policyholders with direct annual premium discounts.
                </p>
              </div>
              <div className="bg-teal-900/30 border border-teal-500/40 p-4 rounded-2xl text-center shrink-0">
                <span className="text-xs font-bold text-teal-300 uppercase">Annual Premium Saved</span>
                <p className="text-3xl font-black text-white">₹{profile.annualSavings}</p>
                <span className="text-xs text-teal-400 font-semibold">Applied on Policy Renewal</span>
              </div>
            </div>
          </div>

          {/* Underwriter Metrics Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white">Actuarial Risk Assessment for Ramesh Sharma</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/60 rounded-2xl">
                <span className="text-xs text-slate-400">90-Day Adherence Score:</span>
                <p className="text-2xl font-black text-emerald-400">96.4%</p>
                <span className="text-[11px] text-slate-400">Benchmark: &gt;80% required</span>
              </div>
              <div className="p-4 bg-slate-800/60 rounded-2xl">
                <span className="text-xs text-slate-400">Double-Dosing Incidents:</span>
                <p className="text-2xl font-black text-teal-400">0 Ingested</p>
                <span className="text-[11px] text-emerald-400">1 Intercepted by AI</span>
              </div>
              <div className="p-4 bg-slate-800/60 rounded-2xl">
                <span className="text-xs text-slate-400">Predicted Emergency Risk:</span>
                <p className="text-2xl font-black text-emerald-300">LOW (0.04)</p>
                <span className="text-[11px] text-slate-400">Eligible for Preferred Tier</span>
              </div>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="mt-4 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" /> Export Verified Underwriter Certificate (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Insurance Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border-2 border-teal-500/50 w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-teal-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Verified Adherence Certificate</h3>
                  <p className="text-xs text-slate-400">Issued by Soma Care Health Network</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl font-mono text-xs text-slate-300 space-y-3 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">PATIENT NAME:</span>
                <span className="text-white font-bold">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">POLICY NUMBER:</span>
                <span className="text-white font-bold">{profile.insurancePolicyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UNDERWRITER:</span>
                <span className="text-teal-400 font-bold">{profile.insurancePartner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AUDITED ADHERENCE:</span>
                <span className="text-emerald-400 font-bold">{profile.adherenceRate}% (Pass &gt; 90%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">APPROVED DISCOUNT:</span>
                <span className="text-teal-300 font-bold">12% (₹{profile.annualSavings}/year)</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                Cryptographically signed by SomaCare Telehealth Engine • Hash: 0x8a92...bf41
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert('Certificate downloaded successfully!');
                  setShowCertificateModal(false);
                }}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
