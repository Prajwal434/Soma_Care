'use client';

import React, { useState } from 'react';
import { Bell, CalendarPlus, Mail, ShieldCheck, Users } from 'lucide-react';
import { createDemoPasscode, getEnabledReminderLabels, isValidEmail, type FamilyRole, type ReminderPreferences } from '../utils/demoSetup';

export const CareSetupPanel: React.FC = () => {
  const [email, setEmail] = useState('rahul@example.com');
  const [role, setRole] = useState<FamilyRole>('Caregiver');
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    email: 'rahul@example.com', upcomingDose: true, missedDose: true, appointment: true, reminderMinutes: 30,
  });
  const [passcode, setPasscode] = useState('');
  const [status, setStatus] = useState('');
  const [appointment, setAppointment] = useState({ clinician: '', date: '', time: '', location: '' });
  const [savedAppointment, setSavedAppointment] = useState<{ clinician: string; date: string; time: string; location: string } | null>(null);

  const updatePreference = (key: keyof ReminderPreferences, value: boolean | number | string) => {
    setPreferences(current => ({ ...current, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <section className="bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4" aria-labelledby="invite-setup-title">
        <div className="flex items-center gap-3"><Users className="w-6 h-6 text-indigo-300"/><div><h3 id="invite-setup-title" className="text-lg font-bold text-white">Connect family</h3><p className="text-xs text-slate-400">Create a demo invite with chosen access</p></div></div>
        <label className="block text-sm text-slate-300">Family member email<input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@example.com" className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
        <label className="block text-sm text-slate-300">Access level<select value={role} onChange={e => setRole(e.target.value as FamilyRole)} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white"><option>Caregiver</option><option>Viewer</option></select></label>
        <button onClick={() => { if (!isValidEmail(email)) { setStatus('Enter a valid email address to prepare an invite.'); return; } setPasscode(createDemoPasscode(Date.now())); setStatus(`Demo invite ready for ${email} as ${role}.`); }} className="w-full min-h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Prepare family invite</button>
        {passcode && <div role="status" className="rounded-xl bg-emerald-950/50 border border-emerald-500/40 p-4"><p className="text-sm text-emerald-200">{status}</p><p className="text-xs text-slate-300 mt-2">Share this demo passcode with the invited person:</p><p className="text-2xl font-black tracking-[0.2em] text-white mt-1">{passcode}</p></div>}
        {!passcode && status && <p role="alert" className="text-sm text-amber-200">{status}</p>}
        <p className="text-xs text-slate-500 flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0"/>Prototype only: no account is created and the passcode is not an authentication credential.</p>
      </section>

      <section className="bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4" aria-labelledby="reminder-setup-title">
        <div className="flex items-center gap-3"><Bell className="w-6 h-6 text-amber-300"/><div><h3 id="reminder-setup-title" className="text-lg font-bold text-white">Email reminders</h3><p className="text-xs text-slate-400">Choose what the family should receive</p></div></div>
        <label className="block text-sm text-slate-300">Send demo reminders to<input value={preferences.email} onChange={e => updatePreference('email', e.target.value)} type="email" className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
        {([
          ['upcomingDose', 'Upcoming dose reminders'], ['missedDose', 'Missed dose alerts'], ['appointment', 'Appointment reminders'],
        ] as const).map(([key, label]) => <label key={key} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 text-sm text-white"><input type="checkbox" checked={preferences[key]} onChange={e => updatePreference(key, e.target.checked)} className="w-5 h-5 accent-amber-500"/>{label}</label>)}
        <label className="block text-sm text-slate-300">Dose reminder lead time<select value={preferences.reminderMinutes} onChange={e => updatePreference('reminderMinutes', Number(e.target.value))} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white"><option value={15}>15 minutes before</option><option value={30}>30 minutes before</option><option value={60}>1 hour before</option></select></label>
        <button onClick={() => setStatus(isValidEmail(preferences.email) ? `Reminder plan saved for ${preferences.email}: ${getEnabledReminderLabels(preferences).join(', ') || 'no alerts selected'}. Demo only; no email was sent.` : 'Enter a valid reminder email address.')} className="w-full min-h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">Save reminder choices</button>
        {status.includes('Reminder plan') && <p role="status" className="text-sm text-amber-200">{status}</p>}
        <p className="text-xs text-slate-500 flex gap-2"><Mail className="w-4 h-4 shrink-0"/>Demo configuration only. Email delivery is not connected.</p>
      </section>

      <section className="bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4" aria-labelledby="appointment-setup-title">
        <div className="flex items-center gap-3"><CalendarPlus className="w-6 h-6 text-teal-300"/><div><h3 id="appointment-setup-title" className="text-lg font-bold text-white">Add appointment</h3><p className="text-xs text-slate-400">Keep the shared care calendar up to date</p></div></div>
        <label className="block text-sm text-slate-300">Doctor or clinic<input value={appointment.clinician} onChange={e => setAppointment({...appointment, clinician: e.target.value})} placeholder="Doctor name" className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="block text-sm text-slate-300">Date<input type="date" value={appointment.date} onChange={e => setAppointment({...appointment, date: e.target.value})} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-3 py-3 text-white" /></label><label className="block text-sm text-slate-300">Time<input type="time" value={appointment.time} onChange={e => setAppointment({...appointment, time: e.target.value})} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-3 py-3 text-white" /></label></div>
        <label className="block text-sm text-slate-300">Location<input value={appointment.location} onChange={e => setAppointment({...appointment, location: e.target.value})} placeholder="Clinic or hospital" className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-600 px-4 py-3 text-white" /></label>
        <button onClick={() => { if (!appointment.clinician || !appointment.date || !appointment.time) { setStatus('Enter the doctor, date, and time to prepare the appointment.'); setSavedAppointment(null); return; } setSavedAppointment(appointment); setStatus(''); }} className="w-full min-h-12 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold">Save appointment</button>
        {savedAppointment && <div role="status" className="p-4 rounded-xl bg-teal-950/50 border border-teal-500/40"><p className="text-sm font-bold text-teal-100">Appointment added to this demo schedule</p><p className="text-sm text-white mt-1">{savedAppointment.clinician} • {savedAppointment.date} at {savedAppointment.time}</p><p className="text-xs text-slate-300">{savedAppointment.location || 'Location not provided'} • Reminder preview only; no email was sent.</p></div>}
        {!savedAppointment && status.startsWith('Enter the doctor') && <p role="alert" className="text-sm text-amber-200">{status}</p>}
        <p className="text-xs text-slate-500">Appointments and reminders stay in this demo session.</p>
      </section>
    </div>
  );
};
