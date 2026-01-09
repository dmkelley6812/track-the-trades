/**
 * Color Palette Manager
 * Handles palette selection, persistence, and application
 */

export const PALETTES = [
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Dark neutral with blue accent',
    preview: {
      background: '#020617',
      primary: '#3b82f6',
      accent: '#60a5fa'
    }
  },
  {
    id: 'graphite',
    label: 'Graphite',
    description: 'Dark charcoal with teal accent',
    preview: {
      background: '#0f172a',
      primary: '#14b8a6',
      accent: '#2dd4bf'
    }
  },
  {
    id: 'aurora',
    label: 'Aurora',
    description: 'Dark with emerald accent (current)',
    preview: {
      background: '#0a0f1e',
      primary: '#10b981',
      accent: '#34d399'
    }
  },
  {
    id: 'sandstone',
    label: 'Sandstone',
    description: 'Warm light with amber accent',
    preview: {
      background: '#faf8f5',
      primary: '#f59e0b',
      accent: '#fbbf24'
    }
  },
  {
    id: 'rose',
    label: 'Rose',
    description: 'Light with rose accent',
    preview: {
      background: '#fdf8fa',
      primary: '#ec4899',
      accent: '#f472b6'
    }
  }
];

const STORAGE_KEY = 'app-palette';
const DEFAULT_PALETTE = 'aurora';

/**
 * Get the initial palette from localStorage or default
 */
export function getInitialPalette() {
  if (typeof window === 'undefined') return DEFAULT_PALETTE;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PALETTES.find(p => p.id === stored)) {
      return stored;
    }
  } catch (e) {
    console.warn('Failed to read palette from localStorage:', e);
  }
  
  return DEFAULT_PALETTE;
}

/**
 * Apply a palette to the document
 */
export function applyPalette(paletteId) {
  if (typeof window === 'undefined') return;
  
  const palette = PALETTES.find(p => p.id === paletteId);
  if (!palette) {
    console.warn(`Palette "${paletteId}" not found, using default`);
    paletteId = DEFAULT_PALETTE;
  }
  
  document.documentElement.setAttribute('data-palette', paletteId);
}

/**
 * Persist palette selection to localStorage
 */
export function persistPalette(paletteId) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, paletteId);
  } catch (e) {
    console.warn('Failed to persist palette to localStorage:', e);
  }
}

/**
 * Change palette (apply + persist)
 */
export function setPalette(paletteId) {
  applyPalette(paletteId);
  persistPalette(paletteId);
}

// Apply initial palette immediately on module load
if (typeof window !== 'undefined') {
  applyPalette(getInitialPalette());
}