import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Colors';
import { LocalizationService } from '../../services/localizationService';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export function Header({ 
  title, 
  subtitle, 
  showLogo = true,
  rightAction 
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* ACAD Logo Section */}
      {showLogo && (
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>ACAD</Text>
            </View>
            <View style={styles.logoInfo}>
              <Text style={styles.companyName}>
                {LocalizationService.t('acadInspection')}
              </Text>
              <Text style={styles.tagline}>
                {LocalizationService.t('qualityAssurance')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>        
        {rightAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightAction.onPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={rightAction.icon as any} 
              size={24} 
              color={Colors.primary} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoSection: {
    marginBottom: Spacing.md,
  },
  logoContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  logoText: {
    color: Colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  companyName: {
    ...Typography.bodyMedium,
    color: Colors.primary,
  },
  tagline: {
    ...Typography.small,
    color: Colors.accent,
  },
  titleSection: {
    flex: 1,
    marginBottom: Spacing.sm,
    alignItems: 'flex-end',
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    textAlign: 'right',
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 4,
    textAlign: 'right',
  },
  actionsSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
  },
});