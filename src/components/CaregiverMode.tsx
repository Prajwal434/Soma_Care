'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShoppingBag, Activity, Clock, AlertTriangle, CheckCircle2, MapPin, CreditCard, Sparkles, Plus, Smile } from 'lucide-react';
import { Medication, AdherenceLog, PharmacyOrder, SeniorProfile } from '../types';
import { CareSetupPanel } from './CareSetupPanel';

interface CaregiverModeProps {
  profile: SeniorProfile;
  medications: Medication[];
  logs: AdherenceLog[];
  orders: PharmacyOrder[];
  onTriggerRefill: (medId: string) => void;
  onSaveMedication: (medication: Medication) => void;
}

export const CaregiverMode: React.FC<CaregiverModeProps> = ({
  profile,
  medications,
  logs,
  orders,
  onTriggerRefill,
  onSaveMedication,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pharmacy' | 'insurance' | 'logs' | 'appointments' | 'access'>('overview');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCareSetup, setShowCareSetup] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [showMedicationForm, setShowMedicationForm] = useState(false);

  // Compute adherence stats
  const takenCount = medications.filter(m => m.takenToday).length;
  const totalCount = medications.length;
  const todayAdherence = totalCount ? Math.round((takenCount / totalCount) * 100) : 0;
  const lowStockCount = medications.filter(med => med.remainingPills <= med.refillThreshold).length;

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
            Prototype view for <strong className="text-white">{profile.caregiverName}</strong> • Sample care data; no external services are connected.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setShowCertificateModal(true)}
            className="flex-1 sm:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Business model concept
          </button>
          <button
            onClick={() => { setEditingMedication(null); setShowMedicationForm(true); }}
            className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add medication
          </button>
        </div>
      </div>

      {showMedicationForm && (
        <form
          className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 space-y-4"
          onSubmit={event => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const totalPills = Number(data.get('totalPills'));
            const remainingPills = Number(data.get('remainingPills'));
            const refillThreshold = Number(data.get('refillThreshold'));
            if (remainingPills > totalPills || refillThreshold > totalPills) {
              window.alert('Pills remaining and the refill threshold must not exceed the pack quantity.');
              return;
            }
            const medication: Medication = {
              id: editingMedication?.id ?? `med-${crypto.randomUUID()}`,
              name: String(data.get('name')).trim(),
              genericName: String(data.get('genericName')).trim(),
              dosage: String(data.get('dosage')).trim(),
              timeSlot: data.get('timeSlot') as Medication['timeSlot'],
              scheduledTime: String(data.get('scheduledTime')).trim(),
              instructions: String(data.get('instructions')).trim(),
              pillColor: editingMedication?.pillColor ?? 'Not specified',
              shape: editingMedication?.shape ?? 'Not specified',
              takenToday: editingMedication?.takenToday ?? false,
              takenAt: editingMedication?.takenAt,
              remainingPills,
              totalPills,
              refillThreshold,
              price: editingMedication?.price ?? 0,
              pharmacyPartner: editingMedication?.pharmacyPartner ?? 'Not connected',
            };
            onSaveMedication(medication);
            setShowMedicationForm(false);
            setEditingMedication(null);
          }}
        >
          <div className="flex justify-between items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">{editingMedication ? 'Edit medicine schedule' : 'Add medicine'}</h2>
              <p className="text-sm text-slate-400">Enter the details from the prescription. This saves in the current demo session.</p>
            </div>
            <button type="button" onClick={() => setShowMedicationForm(false)} className="min-h-11 px-4 rounded-xl bg-slate-800 text-white">Cancel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm text-slate-300">Medicine name<input name="name" required defaultValue={editingMedication?.name} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
            <label className="text-sm text-slate-300">Generic name<input name="genericName" defaultValue={editingMedication?.genericName} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
            <label className="text-sm text-slate-300">Dose<input name="dosage" required defaultValue={editingMedication?.dosage} placeholder="As written on prescription" className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
            <label className="text-sm text-slate-300">Time of day<select name="timeSlot" defaultValue={editingMedication?.timeSlot ?? 'Morning'} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white">{['Morning', 'Afternoon', 'Evening', 'Night'].map(slot => <option key={slot}>{slot}</option>)}</select></label>
            <label className="text-sm text-slate-300">Scheduled time<input name="scheduledTime" required defaultValue={editingMedication?.scheduledTime} placeholder="09:00 AM" className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
            <label className="text-sm text-slate-300">Pills remaining<input name="remainingPills" type="number" min="0" required defaultValue={editingMedication?.remainingPills ?? 30} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
            <label className="text-sm text-slate-300">Pack quantity<input name="totalPills" type="number" min="1" required defaultValue={editingMedication?.totalPills ?? 30} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
            <label className="text-sm text-slate-300">Refill reminder threshold<input name="refillThreshold" type="number" min="0" required defaultValue={editingMedication?.refillThreshold ?? 5} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
          </div>
          <label className="block text-sm text-slate-300">Instructions from prescription<textarea name="instructions" rows={2} defaultValue={editingMedication?.instructions} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
          <button type="submit" className="min-h-12 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold">Save medicine schedule</button>
        </form>
      )}

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
            <span className="text-3xl font-black text-white">{todayAdherence}%</span>
            <span className="text-xs font-semibold text-slate-400">today</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {takenCount} of {totalCount} scheduled doses marked taken today
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${todayAdherence}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Sample local activity */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sample activity</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Smile className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{logs.length} events</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Local demonstration events only. SomaCare does not assess mood, cognition, or voice biomarkers.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <Activity className="w-3.5 h-3.5" /> No clinical score is calculated
          </div>
        </div>

        {/* KPI 3: Refill inventory */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refill Inventory</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-400">{lowStockCount} low stock</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Based on the medicine quantities in this sample schedule. Review before arranging a refill.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> No order is placed automatically
          </div>
        </div>

        {/* KPI 4: InsurTech Premium Savings (The B2B Hook) */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insurer connection</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-300">Concept only</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            No insurer is connected. This prototype calculates no discount or savings.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
            No policy data is verified
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-indigo-950/40 border border-indigo-500/30 rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-300">Next appointment</p>
          <h2 className="text-xl font-bold text-white mt-2">Dr. Meera Kapoor • Cardiology</h2>
          <p className="text-sm text-slate-300 mt-1">Thursday, 19 Nov at 11:30 AM • City Care Clinic, Lucknow</p>
          <p className="text-xs text-indigo-200 mt-3">Sample appointment. Configure reminder preferences in care setup; this prototype does not send email.</p>
        </section>
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Shared care access</p>
          <h2 className="text-xl font-bold text-white mt-2">Family access by passcode</h2>
          <p className="text-sm text-slate-300 mt-1">Ramesh remains in control of who can see and manage his care plan.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-3 py-2 rounded-xl bg-slate-800 text-sm text-white">Rahul • Caregiver • Edit</span>
            <span className="px-3 py-2 rounded-xl bg-slate-800 text-sm text-white">Anita • Family • View</span>
            <button onClick={() => setShowCareSetup(true)} className="px-3 py-2 rounded-xl bg-emerald-600 text-sm font-bold text-white">Prepare demo invite</button>
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
          { id: 'pharmacy', label: 'Refill review (demo)' },
          { id: 'logs', label: 'Care activity (demo)' },
          { id: 'insurance', label: 'Future insurer model' },
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
            <button onClick={() => setShowCareSetup(true)} className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl">Open appointment setup</button>
          </div>
          <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <h4 className="text-lg font-bold text-white">Sample: Dr. Meera Kapoor • Cardiology</h4>
            <p className="text-slate-300">Thursday, 19 Nov • 11:30 AM • City Care Clinic, Lucknow</p>
            <p className="text-sm text-indigo-200 mt-2">Reminder preview only. Set preferences in care setup; no email is sent.</p>
          </div>
        </section>
      )}
      {activeTab === 'access' && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">People sharing Ramesh&apos;s care</h3>
          <p className="text-sm text-slate-400">Access uses a personal passcode. The senior decides who can view or change the care plan.</p>
          {[['Rahul Sharma', 'Primary caregiver', 'Can manage medicines and appointments'], ['Anita Sharma', 'Family member', 'Can view schedule and adherence']].map(([name, role, access]) => <div key={name} className="p-4 rounded-2xl bg-slate-800 flex flex-col sm:flex-row sm:justify-between gap-1"><strong className="text-white">{name} • {role}</strong><span className="text-sm text-slate-300">{access}</span></div>)}
          <button onClick={() => setShowCareSetup(true)} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Open demo family setup</button>
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
                      Refill preference: <strong className="text-slate-200">{med.pharmacyPartner === 'Not connected' ? 'none selected' : med.pharmacyPartner}</strong>{med.price > 0 ? ` (₹${med.price}/strip)` : ' (price not set)'}
                    </span>
                    {med.remainingPills <= med.refillThreshold && (
                      <button
                        onClick={() => onTriggerRefill(med.id)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                      >
                        <ShoppingBag className="w-3 h-3" /> Review demo refill
                      </button>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => { setEditingMedication(med); setShowMedicationForm(true); }} className="mt-3 min-h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-slate-200">Edit schedule</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Refill flow concept */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-950/60 via-slate-900 to-indigo-950/60 border border-orange-500/30 rounded-3xl p-6 sm:p-7">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs uppercase tracking-wider">
                  Prototype flow
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">
                  Refill review and approval
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Review sample medicine quantities and choose when a caregiver should arrange a refill. No pharmacy, payment, or ordering service is connected; any listed orders are sample records.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400">External services:</span>
                <p className="text-sm font-bold text-white">Not connected</p>
                <span className="text-xs text-emerald-400 font-semibold">No payment is taken</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" /> Sample refill records
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
              Local demonstration activity
            </h3>
            <span className="text-xs text-slate-400">Sample events; no other device is connected</span>
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
        <div className="bg-slate-900/80 border border-teal-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-2xl font-bold text-white">Possible future insurer partnership</h3>
          <p className="text-slate-300">A future partner might choose to support medication routines, but this prototype has no insurer integration. It does not calculate risk, verify adherence for an insurer, issue certificates, or promise discounts or health outcomes.</p>
          <p className="text-sm text-slate-400">Any partnerships would require consent, privacy and security review, and evidence before claims about clinical or financial impact.</p>
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
                  <h3 className="text-xl font-bold text-white">Business model concept</h3>
                  <p className="text-xs text-slate-400">No insurer integration is connected</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300">An insurer partnership is a future business concept only. No patient adherence is shared, no insurer decision is made, and no savings or clinical outcome is verified by this demo.</p>

            <div className="flex gap-3">
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
