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
      status: 'Processing',
      partner: med.pharmacyPartner as PharmacyOrder['partner'],
      paidBy: 'Triggered by Caregiver (Rahul Sharma - Auto Pay)',
    };

    const newLog: AdherenceLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      medicationName: `${med.name} Refill Triggered`,
      status: 'refill_ordered',
      notes: `Caregiver manually approved 30-day refill via ${med.pharmacyPartner}. Delivery scheduled for Lucknow address.`,
      verificationMethod: 'manual',
      moodDetected: 'calm',
    };

    setOrders(prev => [newOrder, ...prev]);
    setLogs(prev => [newLog, ...prev]);

    // Update remaining pills back to 30
    setMedications(prev => prev.map(m => 
      m.id === medId ? { ...m, remainingPills: m.totalPills } : m
    ));

    alert(`Order ${orderId} dispatched to ${med.pharmacyPartner} for ₹${med.price}!`);
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
        "Hold the medicine strip up to the camera screen so I can verify the name and dosage for you."
      );
    } else if (scenario === 'somabox') {
      setCurrentView('somabox');
      SpeechService.speak(
        "SomaBox Ambient Sentinel active. Monitoring physical medicine tray compartments and hand actions."
      );
    } else if (scenario === 'doubledose') {
      setCurrentView('elder');
      const med = medications[0];
      const newLog: AdherenceLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        medicationName: `${med.name} (Double-Dose Intercept)`,
        status: 'warning',
        notes: `CRITICAL SAFETY INTERCEPT: Babuji attempted to take ${med.name} again. Intercepted by voice AI. Caregiver notified.`,
        verificationMethod: 'voice',
        moodDetected: 'confused',
      };
      setLogs(prev => [newLog, ...prev]);
      SpeechService.speak(
        `Wait, Babuji! Please do not take that pill! You already took your morning ${med.name} at 9:12 AM. Taking another can cause severe hypoglycemia. Please rest!`
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
        status: 'Processing',
        partner: 'Tata 1mg',
        paidBy: 'Voice Authorized by Senior • Billed to Rahul Sharma',
      };
      const newLog: AdherenceLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        medicationName: `${med.name} Voice Reorder`,
        status: 'refill_ordered',
        notes: `Voice-authorized reorder dispatched via Tata 1mg for ₹${med.price}. Caregiver card billed.`,
        verificationMethod: 'voice',
        moodDetected: 'cheerful',
      };
      setOrders(prev => [newOrder, ...prev]);
      setLogs(prev => [newLog, ...prev]);
      SpeechService.speak(
        `Order confirmed, Babuji! I have placed an order for ${med.name} through Tata 1mg for rupees 245. A WhatsApp update has been sent to Rahul. Delivery tomorrow by 2 PM.`
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
            onAddPrescription={() => {
              alert('Prescription scanner: Upload doctor Rx photo to auto-extract schedules into Caregiver database.');
            }}
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
