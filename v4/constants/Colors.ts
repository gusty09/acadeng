export const Colors = {
  // TEYASEER Primary Branding - Blue & Orange
  primary: '#1E40AF', // TEYASEER Deep Blue
  primaryLight: '#3B82F6',
  primaryDark: '#1E3A8A',
  
  accent: '#EA580C', // TEYASEER Orange
  accentLight: '#FB923C',
  accentDark: '#DC2626',
  
  // Secondary Colors
  secondary: '#10B981', // Success Green
  secondaryDark: '#059669',
  
  // Surface & Background
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceAccent: '#FFF7ED', // Light orange tint
  
  // Text Colors
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  
  // Border Colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderAccent: '#FED7AA',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',
  
  // Priority Colors
  high: '#DC2626',
  medium: '#EA580C',
  low: '#059669',
  
  // Gradient Colors
  gradientPrimary: ['#1E40AF', '#EA580C'],
  gradientSecondary: ['#059669', '#10B981'],
  
  // TEYASEER Specific
  teyaseerBlue: '#1E40AF',
  teyaseerOrange: '#EA580C',
  teyaseerGray: '#6B7280',
  teyaseerLightBlue: '#EBF4FF',
  teyaseerLightOrange: '#FFF7ED',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 50,
};

export const Typography = {
  // Arabic-optimized typography
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.text,
    lineHeight: 40,
    textAlign: 'right' as const,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 32,
    textAlign: 'right' as const,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 28,
    textAlign: 'right' as const,
  },
  body: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    textAlign: 'right' as const,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 24,
    textAlign: 'right' as const,
  },
  caption: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right' as const,
  },
  small: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
    textAlign: 'right' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

// Shadows for modern design
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  teyaseer: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};