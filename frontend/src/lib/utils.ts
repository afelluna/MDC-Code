export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}

// Backend event timestamps are always stamped in Asia/Manila (moment-timezone).
// Mock/simulated events must match that format so the event log never disagrees
// with the header clock, which is also pinned to Asia/Manila.
export function nowInManila(date: Date = new Date()): string {
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Manila' });
}
