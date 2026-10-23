/**
 * Theme: "paper" (light, the real print) or "ink" (dark).
 * The first paint is handled by the inline script in Base.astro; this module handles the
 * toggle, persistence and following the OS setting until the user has chosen.
 */

export type Theme = 'paper' | 'ink';

const KEY = 'theme';
const root = document.documentElement;
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'paper' || value === 'ink' ? value : null;
  } catch {
    return null;
  }
}

export function currentTheme(): Theme {
  return root.dataset.theme === 'ink' ? 'ink' : 'paper';
}

function syncToggles(theme: Theme) {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-set]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeSet === theme));
  });
}

function apply(theme: Theme) {
  root.dataset.theme = theme;
  syncToggles(theme);
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function setTheme(theme: Theme, persist = true) {
  if (theme === currentTheme()) return;
  if (persist) {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* private mode: the choice just won't persist */
    }
  }

  // An "ink roller" wipe between themes where View Transitions are available.
  if (!reducedQuery.matches && 'startViewTransition' in document) {
    root.classList.add('theme-wipe');
    const transition = document.startViewTransition(() => apply(theme));
    transition.finished.finally(() => root.classList.remove('theme-wipe'));
  } else {
    apply(theme);
  }
}

function bindToggles() {
  syncToggles(currentTheme());
  document.querySelectorAll<HTMLButtonElement>('[data-theme-set]').forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      const theme = button.dataset.themeSet === 'ink' ? 'ink' : 'paper';
      setTheme(theme);
    });
  });
}

// Follow the OS only until the user has made a choice.
darkQuery.addEventListener('change', (event) => {
  if (!stored()) setTheme(event.matches ? 'ink' : 'paper', false);
});

document.addEventListener('astro:page-load', bindToggles);
