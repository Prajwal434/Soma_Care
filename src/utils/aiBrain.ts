import { Medication, AdherenceLog, PharmacyOrder } from '../types';
import { SecurityGuard } from './security';

export interface AIResponse {
  spokenText: string;
  displayText: string;
  actionTaken?: 'med_taken' | 'double_dose_blocked' | 'refill_confirmed' | 'escalation_alert' | 'scan_prompt';
  affectedMedId?: string;
  newLog?: AdherenceLog;
  newOrder?: PharmacyOrder;
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

  // 1. Check if agreeing to an active auto-refill prompt (COMMERCE ENGINE HOOK)
  if (
    activeRefillPromptMedId && 
    (lower.includes('yes') || lower.includes('order') || lower.includes('haan') || lower.includes('theek hai') || lower.includes('kharid') || lower.includes('sure') || lower.includes('kar do'))
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

  // 2. Check for Double-Dose Attempt (SAFETY RISK HOOK)
  if (
    (lower.includes('again') || lower.includes('dobara') || lower.includes('another') || lower.includes('one more') || lower.includes('sugar tablet')) &&
    (lower.includes('take') || lower.includes('taking') || lower.includes('khau') || lower.includes('kha raha'))
  ) {
    const morningMed = medications.find(m => m.timeSlot === 'Morning');
    if (morningMed && morningMed.takenToday) {
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
