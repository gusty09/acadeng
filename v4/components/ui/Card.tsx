import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  elevation?: number;
}

export function Card({ 
  children, 
  style, 
  padding = 'medium',
  elevation = 2 
}: CardProps) {
  return (
    <View style={[
      styles.card, 
      styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles],
      { elevation },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: Spacing.sm,
  },
  paddingMedium: {
    padding: Spacing.md,
  },
  paddingLarge: {
    padding: Spacing.lg,
  },
});