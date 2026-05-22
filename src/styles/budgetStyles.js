// src/styles/budgetStyles.js - Centralized Design System
export const colors = {
  // Primary
  primary: '#0A84FF',
  primaryLight: '#F0F9FF',
  primaryDark: '#0066CC',
  
  // Success
  success: '#34C759',
  successLight: '#E6F7E6',
  
  // Warning
  warning: '#FF9F0A',
  warningLight: '#FFF4E5',
  
  // Danger
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  
  // Info
  info: '#5856D6',
  infoLight: '#EEEDFF',
  
  // Neutrals
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Category Groups
  bills: '#0A84FF',
  billsLight: '#E8F1FF',
  wants: '#FF2D55',
  wantsLight: '#FFE5E9',
  needs: '#34C759',
  needsLight: '#E6F7E6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  round: 999,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  small: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textSecondary,
  },
};