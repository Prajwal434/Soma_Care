import { Medication, AdherenceLog, PharmacyOrder } from '../types';
import { SecurityGuard } from './security';
import { getBoxSlot, getNextScheduledMedication } from './demoSetup';

export interface AIResponse {
  spokenText: string;
  displayText: string;
  actionTaken?: 'med_taken' | 'double_dose_warning' | 'refill_confirmed' | 'refill_inquiry' | 'next_medication' | 'box_location' | 'escalation_alert' | 'scan_prompt';
  affectedMedId?: string;
  newLog?: AdherenceLog;
  newOrder?: PharmacyOrder;
}

function buildDoubleDoseResponse(morningMed: Medication): AIResponse {
  const newLog: AdherenceLog = {
    id: `log-${Date.now()}`,
    timestamp: 'Just now',
    medicationName: morningMed.name,
    status: 'warning',
    notes: `Demo warning: the saved list says ${morningMed.name} was marked taken. The app cannot physically prevent another dose or notify a caregiver.`,
    verificationMethod: 'voice',
  };

  return {
    spokenText: `Your saved list says you marked ${morningMed.name} taken at ${morningMed.takenAt || '9:12 AM'}. Please check your medicine record and contact your caregiver or pharmacist if you are unsure. This app cannot stop a physical dose.`,
    displayText: `Dose check: ${morningMed.name} is marked taken in the saved list. No caregiver message was sent.`,
    actionTaken: 'double_dose_warning',
    affectedMedId: morningMed.id,
    newLog,
  };
}

export function processSeniorUtterance(
  input: string,
  medications: Medication[],
  recentLogs: AdherenceLog[],
  activeRefillPromptMedId: string | null
): AIResponse {
  // Defensive Security Check against prompt injection or adversarial jailbreaks
  const { cleanInput, isBlocked, threatReason } = SecurityGuard.sanitizeVoiceInput(input);
  if (isBlocked) {
    return {
      spokenText: "I am sorry Babuji, I could not understand that request. For your safety, I can only assist with your prescribed daily medicines.",
      displayText: `🛡️ SECURITY INTERCEPT: Blocked potential adversarial input (${threatReason}). Data privacy secured.`,
    };
  }

  const lower = cleanInput.toLowerCase().trim();

  const possibleDoubleDose =
    /\b(again|dobara|another|one more|sugar tablet)\b/i.test(lower) &&
    /\b(take|taking|khau|kha raha)\b/i.test(lower);
  if (possibleDoubleDose) {
    const morningMed = medications.find(m => m.timeSlot === 'Morning');
    if (morningMed?.takenToday) return buildDoubleDoseResponse(morningMed);
  }

  // 1. Add a local demo refill record only after explicit confirmation.
  if (
    activeRefillPromptMedId && 
    /\b(yes|yeah|haan|theek hai|kharid do|sure|go ahead|please order|order it|place the order|kar do)\b/i.test(lower)
  ) {
    const med = medications.find(m => m.id === activeRefillPromptMedId);
    if (med) {
      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: PharmacyOrder = {
        id: orderId,
        medicationName: `${med.name} (Pack of 30)`,
        quantity: '1 Strip (30 Tablets)',
        price: med.price,
        orderedAt: 'Just now',
        status: 'Demo only',
        partner: med.pharmacyPartner as PharmacyOrder['partner'],
        paidBy: 'Local demo record • no payment taken',
      };

      const newLog: AdherenceLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        medicationName: `${med.name} Auto-Refill`,
        status: 'refill_ordered',
        notes: `Senior confirmed a demo refill choice for ${med.name}. No pharmacy request or payment was made.`,
        verificationMethod: 'voice',
      };

      return {
        spokenText: `I saved your demo refill choice for ${med.name}. No pharmacy order or payment was made. Please ask your caregiver to arrange the refill.`,
        displayText: `Demo refill choice saved for ${med.name}. No order or payment was made.`,
        actionTaken: 'refill_confirmed',
        affectedMedId: med.id,
        newLog,
        newOrder,
      };
    }
  }

  // 2a. Answer low-stock questions before the generic “which pill?” scan prompt.
  if (/\b(refill|refill|running out|low stock|need to order|needs ordering)\b/i.test(lower)) {
    const lowStockMeds = medications.filter(med => med.remainingPills <= med.refillThreshold);
    if (lowStockMeds.length === 0) {
      return {
        spokenText: 'Your saved medicine list does not show any low-stock medicines right now. I can ask your caregiver to check the supplies if you are unsure.',
        displayText: 'No medicines are currently below their refill threshold in the saved list.',
        actionTaken: 'refill_inquiry',
      };
    }
    const med = lowStockMeds[0];
    return {
      spokenText: `${med.name} is running low. The saved list shows ${med.remainingPills} tablets left. Would you like me to request a refill from your caregiver? I will wait for your confirmation.`,
      displayText: `Low stock: ${med.name} has ${med.remainingPills} tablets left. Refill requires your confirmation.`,
      actionTaken: 'refill_inquiry',
      affectedMedId: med.id,
    };
  }

  // 2b. Answer what is next from the saved schedule and map it to the demo tray.
  const asksNextDose = !possibleDoubleDose && /\b(next|due|should i take|what.*take|which.*take|medicine.*take)\b/i.test(lower);
  const asksBoxLocation = /\b(box|compartment|slot|where.*(pill|medicine|tablet|it)|where.*find)\b/i.test(lower);
  if (asksNextDose || asksBoxLocation) {
    const nextMed = getNextScheduledMedication(medications);
    if (!nextMed) {
      return {
        spokenText: 'Your saved schedule shows that all medicines for today are marked as taken.',
        displayText: 'All scheduled medicines are marked taken for today.',
        actionTaken: 'next_medication',
      };
    }
    const slot = getBoxSlot(nextMed.timeSlot);
    const location = slot ? `${slot}, ${nextMed.timeSlot} compartment` : `${nextMed.timeSlot} section`;
    const locationResponse = asksBoxLocation;
    return {
      spokenText: locationResponse
        ? `Based on your saved schedule, your next medicine is ${nextMed.name}, at ${nextMed.scheduledTime}. In this SomaBox demo, it is in ${location}. I am opening the box map so you can see it highlighted.`
        : `Based on your saved schedule, your next medicine is ${nextMed.name} at ${nextMed.scheduledTime}, in the ${nextMed.timeSlot.toLowerCase()}.`,
      displayText: locationResponse
        ? `Next dose: ${nextMed.name} at ${nextMed.scheduledTime}. SomaBox location: ${location}. The matching tray slot is highlighted.`
        : `Next scheduled dose: ${nextMed.name} at ${nextMed.scheduledTime} (${nextMed.timeSlot}).`,
      actionTaken: locationResponse ? 'box_location' : 'next_medication',
      affectedMedId: nextMed.id,
    };
  }

  // 3. Check for Confusion / "Which pill should I take?"
  if (
    lower.includes('which') || lower.includes('kaun') || lower.includes('confused') || 
    lower.includes('packet') || lower.includes('strip') || lower.includes('what pill') || 
    lower.includes('identify') || lower.includes('color')
  ) {
    return {
      spokenText: `I can show a sample medicine-checking flow, but I cannot identify a real tablet. Please read the label or ask your caregiver or pharmacist.`,
      displayText: `Sample scan demo only. The camera feed is not analyzed and cannot identify a medicine.`,
      actionTaken: 'scan_prompt',
    };
  }

  // 4. Check for Confirmation of taking medicine ("I took it", "Maine le liya")
  if (
    lower.includes('took') || lower.includes('taken') || lower.includes('le liya') || 
    lower.includes('done') || lower.includes('had it') || lower.includes('kha liya') || 
    lower.includes('finish')
  ) {
    // Find next pending medication
    const pendingMed = medications.find(m => !m.takenToday) || medications[0];
    const newLog: AdherenceLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      medicationName: pendingMed.name,
      status: 'taken',
      notes: `The senior reported taking ${pendingMed.name}. This is self-reported and was not independently verified.`,
      verificationMethod: 'voice',
    };

    return {
      spokenText: `I recorded that you took ${pendingMed.name}. Please follow the instructions from your clinician.`,
      displayText: `Self-reported dose recorded for ${pendingMed.name}. No family message was sent.`,
      actionTaken: 'med_taken',
      affectedMedId: pendingMed.id,
      newLog,
    };
  }

  // 5. Check for Symptom / Pain complaints (ESCALATION HOOK)
  if (
    lower.includes('pain') || lower.includes('dard') || lower.includes('dizzy') || 
    lower.includes('chakkar') || lower.includes('headache') || lower.includes('nausea') || 
    lower.includes('unwell') || lower.includes('fever')
  ) {
    const newLog: AdherenceLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      medicationName: 'Health Symptom Logged',
      status: 'warning',
      notes: `The senior reported: "${input}". This prototype does not assess severity or send an alert.`,
      verificationMethod: 'voice',
    };

    return {
      spokenText: `I recorded what you said, but I cannot assess symptoms or contact anyone. If you feel in immediate danger, call your local emergency number or ask someone nearby for help.`,
      displayText: `Symptom note saved locally. No alert or message was sent.`,
      actionTaken: 'escalation_alert',
      newLog,
    };
  }

  // 6. Default warm conversation
  return {
    spokenText: `Namaste Babuji! I am right here listening. It's a wonderful day. Let me know if you want to check your medicines, verify a pill strip, or need a glass of water.`,
    displayText: `💬 "Namaste Babuji! I am here. Tell me what medicine you'd like to check or tap the big mic anytime."`,
  };
}
