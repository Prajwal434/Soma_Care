export type FamilyRole = 'Viewer' | 'Caregiver';

export interface ReminderPreferences {
  email: string;
  upcomingDose: boolean;
  missedDose: boolean;
  appointment: boolean;
  reminderMinutes: number;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function createDemoPasscode(seed: number): string {
  const code = String(Math.abs(Math.trunc(seed)) % 1_000_000).padStart(6, '0');
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

export function getEnabledReminderLabels(preferences: ReminderPreferences): string[] {
  const labels: string[] = [];
  if (preferences.upcomingDose) labels.push('upcoming doses');
  if (preferences.missedDose) labels.push('missed doses');
  if (preferences.appointment) labels.push('appointments');
  return labels;
}

/** Returns null for speech without the wake word, or the command after “Soma”. */
export function extractWakeWordCommand(transcript: string): string | null {
  const wakeMatch = transcript.match(/\b(?:hey\s+)?soma\b[,:]?\s*/i);
  if (!wakeMatch || wakeMatch.index === undefined) return null;
  return transcript.slice(wakeMatch.index + wakeMatch[0].length).trim();
}

export function parseWakeWordUtterance(transcript: string, alreadyAwake: boolean): { awake: boolean; command: string | null } {
  const wakeCommand = extractWakeWordCommand(transcript);
  if (alreadyAwake) return { awake: true, command: wakeCommand ?? transcript.trim() };
  if (wakeCommand === null) return { awake: false, command: null };
  return { awake: true, command: wakeCommand };
}

export type BoxSlot = 'Slot 1' | 'Slot 2' | 'Slot 3' | 'Slot 4';

export function getNextScheduledMedication<T extends { takenToday: boolean; scheduledTime: string }>(medications: T[]): T | undefined {
  return medications
    .filter(medication => !medication.takenToday)
    .sort((a, b) => toMinutes(a.scheduledTime) - toMinutes(b.scheduledTime))[0];
}

function toMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(match[2]);
}

export function getBoxSlot(timeSlot: string): BoxSlot | undefined {
  const slotByTime: Record<string, BoxSlot> = {
    Morning: 'Slot 1',
    Afternoon: 'Slot 2',
    Evening: 'Slot 3',
    Night: 'Slot 4',
  };
  return slotByTime[timeSlot];
}
