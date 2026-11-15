'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { ElderMode } from '../components/ElderMode';
import { SmartBoxSentinel } from '../components/SmartBoxSentinel';
import { CaregiverMode } from '../components/CaregiverMode';
import { DemoControlBar } from '../components/DemoControlBar';
import { PitchModal } from '../components/PitchModal';
import { SystemAuditModal } from '../components/SystemAuditModal';
import { 
  initialSeniorProfile, 
  initialMedications, 
  initialLogs, 
  initialOrders 
} from '../data/mockData';
import { Medication, AdherenceLog, PharmacyOrder } from '../types';
import { SpeechService } from '../utils/speech';

export default function Home() {
  const [currentView, setCurrentView] = useState<'elder' | 'somabox' | 'caregiver'>('elder');
  const [highlightedMedicationId, setHighlightedMedicationId] = useState<string | undefined>();
  const [profile, setProfile] = useState(initialSeniorProfile);
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [logs, setLogs] = useState<AdherenceLog[]>(initialLogs);
  const [orders, setOrders] = useState<PharmacyOrder[]>(initialOrders);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  const handleAddLog = (newLog: AdherenceLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAddOrder = (newOrder: PharmacyOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleSaveMedication = (medication: Medication) => {
    setMedications(previous => previous.some(existing => existing.id === medication.id)
      ? previous.map(existing => existing.id === medication.id ? medication : existing)
      : [...previous, medication]);
  };

  const handleTriggerRefillFromCaregiver = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: PharmacyOrder = {
      id: orderId,
      medicationName: `${med.name} (Pack of 30)`,
      quantity: '1 Box (30 Tablets)',
      price: med.price,
      orderedAt: 'Just now',
      status: 'Demo only',
      partner: med.pharmacyPartner as PharmacyOrder['partner'],
      paidBy: 'Local demo record • no payment taken',
    };

    const newLog: AdherenceLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      medicationName: `${med.name} Refill Triggered`,
      status: 'refill_ordered',
      notes: `Caregiver selected a demo refill for ${med.name}. No pharmacy request or payment was made.`,
      verificationMethod: 'manual',
    };

    setOrders(prev => [newOrder, ...prev]);
    setLogs(prev => [newLog, ...prev]);

    alert(`Demo refill record ${orderId} saved locally. No order was sent and no payment was taken.`);
  };

  const handleRunScenario = (scenario: 'morning' | 'vision' | 'somabox' | 'doubledose' | 'refill') => {
    SpeechService.stopSpeaking();

    if (scenario === 'morning') {
      setCurrentView('elder');
      SpeechService.speak(
        "Namaste Babuji! It is 10:00 AM. Time for your morning sugar tablet after breakfast. Did you take it?"
      );
    } else if (scenario === 'vision') {
      setCurrentView('elder');
      SpeechService.speak(
        "I can show the sample medicine-checking flow, but I cannot identify a real medicine from the camera."
      );
    } else if (scenario === 'somabox') {
      setCurrentView('somabox');
      SpeechService.speak(
        "SomaBox tray demonstration opened. This screen uses scripted scenarios and is not connected to a physical tray."
      );
    } else if (scenario === 'doubledose') {
      setCurrentView('elder');
      const med = medications[0];
      const newLog: AdherenceLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        medicationName: `${med.name} (Double-Dose Intercept)`,
        status: 'warning',
        notes: `Demo warning: the saved list says ${med.name} was marked taken. No physical dose was blocked and no caregiver message was sent.`,
        verificationMethod: 'voice',
      };
      setLogs(prev => [newLog, ...prev]);
      SpeechService.speak(
        `Your saved list says you marked ${med.name} taken at 9:12 AM. Please check your medicine record and ask your caregiver or pharmacist if you are unsure. This app cannot stop a physical dose.`
      );
    } else if (scenario === 'refill') {
      setCurrentView('elder');
      const med = medications[0];
      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: PharmacyOrder = {
        id: orderId,
        medicationName: `${med.name} (30 Tablets)`,
        quantity: '1 Strip',
        price: med.price,
        orderedAt: 'Just now',
        status: 'Demo only',
        partner: 'Tata 1mg',
        paidBy: 'Local demo record • no payment taken',
      };
      const newLog: AdherenceLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        medicationName: `${med.name} Voice Reorder`,
        status: 'refill_ordered',
        notes: `Demo refill choice for ${med.name}. No pharmacy request or payment was made.`,
        verificationMethod: 'voice',
      };
      setOrders(prev => [newOrder, ...prev]);
      setLogs(prev => [newLog, ...prev]);
      SpeechService.speak(
        `I saved a demo refill choice for ${med.name}. No pharmacy order or payment was made. Please ask your caregiver to arrange a refill.`
      );
    }
  };

  const handleResetData = () => {
    setProfile(initialSeniorProfile);
    setMedications(initialMedications);
    setLogs(initialLogs);
    setOrders(initialOrders);
    SpeechService.stopSpeaking();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenPitchGuide={() => setPitchOpen(true)}
        onOpenSystemAudit={() => setAuditOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        {currentView === 'elder' ? (
          <ElderMode
            profile={profile}
            medications={medications}
            logs={logs}
            orders={orders}
            onUpdateMedications={setMedications}
            onAddLog={handleAddLog}
            onAddOrder={handleAddOrder}
            onOpenBox={(medicationId) => {
              setHighlightedMedicationId(medicationId);
              setCurrentView('somabox');
            }}
          />
        ) : currentView === 'somabox' ? (
          <SmartBoxSentinel
            profile={profile}
            medications={medications}
            onAddLog={handleAddLog}
            highlightedMedicationId={highlightedMedicationId}
          />
        ) : (
          <CaregiverMode
            profile={profile}
            medications={medications}
            logs={logs}
            orders={orders}
            onTriggerRefill={handleTriggerRefillFromCaregiver}
            onSaveMedication={handleSaveMedication}
          />
        )}
      </main>

      {/* Demo Floating Control Bar (Hackathon Superpower) */}
      <DemoControlBar
        onRunScenario={handleRunScenario}
        onReset={handleResetData}
      />

      {/* Business Pitch Modal */}
      <PitchModal
        isOpen={pitchOpen}
        onClose={() => setPitchOpen(false)}
      />

      {/* System Engineering, Security & OpenAPI Audit Modal */}
      <SystemAuditModal
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
      />
    </div>
  );
}
