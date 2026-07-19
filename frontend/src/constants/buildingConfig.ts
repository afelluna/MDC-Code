const FLOOR_HEIGHT_KEY = 'usher-mdc-floor-height-mm';

/** Fallback used until a structural engineer/admin configures the real value. */
export const DEFAULT_FLOOR_HEIGHT_MM = 3000;

export function isFloorHeightConfigured(): boolean {
  return localStorage.getItem(FLOOR_HEIGHT_KEY) !== null;
}

export function loadFloorHeightMm(): number {
  try {
    const raw = localStorage.getItem(FLOOR_HEIGHT_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_FLOOR_HEIGHT_MM;
  } catch {
    return DEFAULT_FLOOR_HEIGHT_MM;
  }
}

export function saveFloorHeightMm(mm: number): void {
  if (!Number.isFinite(mm) || mm <= 0) {
    throw new Error('Floor height must be a positive number.');
  }
  localStorage.setItem(FLOOR_HEIGHT_KEY, String(mm));
}
