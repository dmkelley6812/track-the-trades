// Palette Manager - Handles palette switching and persistence
// Initialize palette on page load (runs before React)
if (typeof window !== 'undefined') {
  const palette = localStorage.getItem('color-palette') || 'emerald-dark';
  document.documentElement.setAttribute('data-palette', palette);
}

export const PALETTES = [
  {
    id: 'emerald-dark',
    name: 'Emerald Dark',
    description: 'Classic dark theme with emerald accents',
    preview: ['#10b981', '#1e293b', '#0f172a', '#a855f7']
  },
  {
    id: 'blue-ocean',
    name: 'Blue Ocean',
    description: 'Cool blue theme with oceanic vibes',
    preview: ['#3b82f6', '#1e293b', '#030712', '#8b5cf6']
  },
  {
    id: 'purple-midnight',
    name: 'Purple Midnight',
    description: 'Deep purple theme for night owls',
    preview: ['#a855f7', '#1e1e2e', '#110617', '#ec4899']
  },
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean light theme for daytime',
    preview: ['#6366f1', '#f8fafc', '#ffffff', '#8b5cf6']
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Minimal grayscale aesthetic',
    preview: ['#d4d4d4', '#262626', '#171717', '#c8c8c8']
  }
];

export function getCurrentPalette() {
  if (typeof window === 'undefined') return 'emerald-dark';
  return localStorage.getItem('color-palette') || 'emerald-dark';
}

export function setPalette(paletteId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('color-palette', paletteId);
  document.documentElement.setAttribute('data-palette', paletteId);
}