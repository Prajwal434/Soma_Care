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
