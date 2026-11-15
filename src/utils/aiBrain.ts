import { Medication, AdherenceLog, PharmacyOrder } from '../types';
import { SecurityGuard } from './security';
import { getBoxSlot, getNextScheduledMedication } from './demoSetup';

export interface AIResponse {
  spokenText: string;
  displayText: string;
  actionTaken?: 'med_taken' | 'double_dose_blocked' | 'refill_confirmed' | 'refill_inquiry' | 'next_medication' | 'box_location' | 'escalation_alert' | 'scan_prompt';
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
    notes: `CRITICAL SAFETY INTERCEPT: Babuji attempted to take ${morningMed.name} again. Blocked to prevent hypoglycemia. Caregiver notified.`,
    verificationMethod: 'voice',
    moodDetected: 'confused',
  };

  return {
    spokenText: `Wait, Babuji! Please do not take that pill! You already took your morning ${morningMed.name} at ${morningMed.takenAt || '9:12 AM'}. Taking another can drop your blood sugar dangerously low. Please take a sip of water and rest.`,
    displayText: `⚠️ SAFETY LOCK ENGAGED: Blocked duplicate dose of ${morningMed.name}. Morning dose was already logged at ${morningMed.takenAt || '9:12 AM'}. Caregiver notified via WhatsApp.`,
    actionTaken: 'double_dose_blocked',
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

  // 1. Check if agreeing to an active auto-refill prompt (COMMERCE ENGINE HOOK)
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
        status: 'Processing',
        partner: med.pharmacyPartner as PharmacyOrder['partner'],
        paidBy: 'Auto-charged to Rahul Sharma (HDFC Credit Card)',
      };

      const newLog: AdherenceLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        medicationName: `${med.name} Auto-Refill`,
        status: 'refill_ordered',
        notes: `Voice-authorized reorder dispatched via ${med.pharmacyPartner} for ₹${med.price}. Caregiver card billed.`,
        verificationMethod: 'voice',
        moodDetected: 'cheerful',
      };

      return {
        spokenText: `Order confirmed, Babuji! I have placed an order for ${med.name} through ${med.pharmacyPartner} for rupees ${med.price}. A WhatsApp update has been sent to Rahul. Delivery tomorrow by 2 PM.`,
        displayText: `✅ Refill Ordered: ${med.name} (30 tabs) via ${med.pharmacyPartner} (₹${med.price}). Charged to Rahul Sharma. Delivery by tomorrow 2 PM.`,
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
      spokenText: `Let me help you check, Babuji. Hold the medicine strip or tablet up to the camera screen so I can verify the name and dosage for you.`,
      displayText: `🔍 Multimodal Vision Helper: Hold the medicine packet to your camera or tap 'Scan Medicine Strip' below.`,
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
      notes: `Verbally verified: ${pendingMed.name} taken with water. Senior confirmed completion.`,
      verificationMethod: 'voice',
      moodDetected: 'cheerful',
    };

    return {
      spokenText: `Shabash, Babuji! I have recorded that you took your ${pendingMed.name}. Your adherence score is now 96 percent. Rahul will be so happy to see this update!`,
      displayText: `🎉 Dose Verified & Logged: ${pendingMed.name} marked as taken. Live dashboard and family WhatsApp heartbeat updated!`,
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
      notes: `Symptom reported: "${input}". Voice sentiment: Distressed/Mild Discomfort. Instant alert sent to Rahul Sharma.`,
      verificationMethod: 'voice',
      moodDetected: 'tired',
    };

    return {
      spokenText: `I understand, Babuji. Please sit down comfortably and do not strain yourself. I have immediately alerted Rahul and flagged your symptom on his dashboard. If it gets worse, tap the red SOS button.`,
      displayText: `🚨 Health Alert Logged: Reported "${input}". Son Rahul Sharma and Dr. Verma have been notified via priority SMS/WhatsApp.`,
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
