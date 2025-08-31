import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography } from '../../constants/Colors';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  style?: any;
}

export function ProgressBar({
  progress,
  height = 8,
  showPercentage = false,
  color = Colors.primary,
  backgroundColor = Colors.border,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, style]}>
      <View 
        style={[
          styles.track, 
          { 
            height, 
            backgroundColor,
            borderRadius: height / 2,
          }
        ]}
      >
        <View 
          style={[
            styles.fill, 
            { 
              width: `${clampedProgress}%`, 
              height,
              backgroundColor: color,
              borderRadius: height / 2,
            }
          ]} 
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.sm,
    minWidth: 2,
  },
  percentage: {
    ...Typography.caption,
    marginLeft: 8,
    minWidth: 32,
    textAlign: 'right',
  },
});