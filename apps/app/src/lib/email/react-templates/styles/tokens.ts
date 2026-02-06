/**
 * Cuidly Email Design Tokens
 * Based on Linear Login / Stripe Welcome / GitHub Notification styles
 */

export const colors = {
  // Brand - Cuidly fuchsia
  fuchsia: {
    50: '#f7eef9',
    100: '#eedbf3',
    500: '#ba6fc6',
    600: '#9e50a9',
    700: '#84408b',
  },

  // Neutrals (muted slate for text - like Stripe)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Semantic
  green: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#166534',
  },
  yellow: {
    50: '#fef3c7',
    100: '#fef9c3',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Background (light blue-gray like Stripe)
  background: '#f6f9fc',
  white: '#ffffff',
};

export const typography = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  container: {
    maxWidth: '560px',
    padding: '40px',
    paddingMobile: '24px',
  },
  section: '24px',
  sectionLarge: '32px',
};
