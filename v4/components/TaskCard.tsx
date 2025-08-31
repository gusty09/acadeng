import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useImagePicker } from '../hooks/useImagePicker';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete?: () => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const { pickImage, takePhoto, loading } = useImagePicker();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onConfirm });
    } else {
      Alert.alert(title, message, onConfirm ? [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: onConfirm }
      ] : undefined);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      // On web, only show gallery option
      handleAddImage();
    } else {
      Alert.alert(
        'Add Image',
        'Choose how you want to add an image for this task',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Gallery', onPress: handleAddImage },
        ]
      );
    }
  };

  const handleAddImage = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      onUpdate({ imageUri });
    }
  };

  const handleTakePhoto = async () => {
    const imageUri = await takePhoto();
    if (imageUri) {
      onUpdate({ imageUri });
    }
  };

  const handleToggleComplete = () => {
    const now = new Date().toISOString();
    onUpdate({
      completed: !task.completed,
      completedAt: !task.completed ? now : undefined,
    });
  };

  const handleRemoveImage = () => {
    showAlert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      () => onUpdate({ imageUri: undefined })
    );
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return Colors.high;
      case 'medium': return Colors.medium;
      case 'low': return Colors.low;
      default: return Colors.textLight;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card style={[styles.card, task.completed && styles.completedCard]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={handleToggleComplete}
            activeOpacity={0.7}
          >
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={task.completed ? Colors.success : Colors.border}
            />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[styles.title, task.completed && styles.completedText]}>
              {task.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
              <Text style={styles.priorityText}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.description, task.completed && styles.completedText]}>
          {task.description}
        </Text>

        {task.imageUri ? (
          <View style={styles.imageContainer}>
            <TouchableOpacity
              onPress={() => setImageModalVisible(true)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: task.imageUri }}
                style={styles.taskImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            onPress={showImageOptions}
            variant="outline"
            size="small"
            loading={loading}
            style={styles.addImageButton}
          >
            <Ionicons name="camera" size={16} color={Colors.primary} />
            <Text style={styles.addImageText}>Add Image</Text>
          </Button>
        )}

        <View style={styles.footer}>
          <Text style={styles.dateText}>
            Created {formatDate(task.createdAt)}
          </Text>
          {task.completedAt && (
            <Text style={styles.completedDateText}>
              ✅ {formatDate(task.completedAt)}
            </Text>
          )}
        </View>
      </Card>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Colors.surface} />
            </TouchableOpacity>
            {task.imageUri && (
              <Image
                source={{ uri: task.imageUri }}
                style={styles.modalImage}
                contentFit="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <View style={styles.alertButtons}>
                <TouchableOpacity
                  style={[styles.alertButton, styles.cancelButton]}
                  onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.alertButton, styles.confirmButton]}
                  onPress={() => {
                    alertConfig.onConfirm?.();
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Text style={styles.confirmButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  completedCard: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.success,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  checkbox: {
    marginRight: Spacing.sm,
    paddingTop: 2,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.subheading,
    marginBottom: Spacing.xs,
  },
  completedText: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  taskImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
  },
  removeImageButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  addImageText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...Typography.small,
    color: Colors.textLight,
  },
  completedDateText: {
    ...Typography.small,
    color: Colors.success,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: Spacing.sm,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  // Web alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 280,
    maxWidth: '80%',
  },
  alertTitle: {
    ...Typography.subheading,
    marginBottom: Spacing.sm,
  },
  alertMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  alertButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  cancelButton: {
    backgroundColor: Colors.surfaceLight,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: Colors.surface,
    fontWeight: '600',
  },
});