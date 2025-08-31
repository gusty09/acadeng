import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';
import { LocalizationService } from '../services/localizationService';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const completedTasks = project.tasks.filter(task => task.completed);
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.primary;
      case 'completed': return Colors.secondary;
      case 'onHold': return Colors.warning;
      case 'cancelled': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'onHold': return 'موقوف';
      case 'cancelled': return 'ملغى';
      default: return status;
    }
  };

  return (
    <Card style={styles.container} padding="none">
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {/* Cover Image */}
        {project.coverImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: project.coverImage }}
              style={styles.coverImage}
              contentFit="cover"
            />
            <View style={styles.imageOverlay}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                <Text style={styles.statusText}>
                  {getStatusText(project.status)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {project.name}
              </Text>
              {!project.coverImage && (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(project.status)}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={Colors.textLight} 
            />
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {project.description}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="list-outline" size={16} color={Colors.primary} />
              <Text style={styles.statText}>
                {totalTasks} {LocalizationService.t('tasks')}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
              <Text style={styles.statText}>
                {completedTasks.length} {LocalizationService.t('completed')}
              </Text>
            </View>

            {project.siteVisits && project.siteVisits.length > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="location-outline" size={16} color={Colors.accent} />
                <Text style={styles.statText}>
                  {project.siteVisits.length} زيارة
                </Text>
              </View>
            )}
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {LocalizationService.t('progress')}
              </Text>
              <Text style={styles.progressValue}>
                {Math.round(progress)}%
              </Text>
            </View>
            <ProgressBar 
              progress={progress} 
              height={6}
              color={progress === 100 ? Colors.secondary : Colors.primary}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.dateText}>
              {LocalizationService.formatDate(project.createdAt)}
            </Text>
            {project.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={12} color={Colors.textLight} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {project.location}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.subheading,
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'right',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  progressValue: {
    ...Typography.caption,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dateText: {
    ...Typography.small,
    color: Colors.textLight,
  },
  locationContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  locationText: {
    ...Typography.small,
    color: Colors.textLight,
    textAlign: 'right',
  },
});