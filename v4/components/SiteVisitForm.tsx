import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';
import { LocalizationService } from '../services/localizationService';
import { SiteVisit } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SiteVisitFormProps {
  onSubmit: (siteVisit: Omit<SiteVisit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<SiteVisit>;
  loading?: boolean;
}

export function SiteVisitForm({ onSubmit, onCancel, initialData, loading }: SiteVisitFormProps) {
  const isRTL = LocalizationService.isRTL();
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    visitDate: initialData?.visitDate || new Date().toISOString(),
    inspector: initialData?.inspector || '',
    contractorName: initialData?.contractorName || '',
    projectLocation: initialData?.projectLocation || '',
    weatherConditions: initialData?.weatherConditions || '',
    overallProgress: initialData?.overallProgress || 0,
    qualityRating: initialData?.qualityRating || 5,
    safetyCompliance: initialData?.safetyCompliance || 'excellent' as const,
    notes: initialData?.notes || '',
    images: initialData?.images || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.inspector.trim()) {
      newErrors.inspector = LocalizationService.t('required');
    }
    if (!formData.contractorName.trim()) {
      newErrors.contractorName = LocalizationService.t('required');
    }
    if (!formData.projectLocation.trim()) {
      newErrors.projectLocation = LocalizationService.t('required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit({
      visitDate: formData.visitDate,
      inspector: formData.inspector.trim(),
      contractorName: formData.contractorName.trim(),
      projectLocation: formData.projectLocation.trim(),
      weatherConditions: formData.weatherConditions.trim(),
      overallProgress: formData.overallProgress,
      qualityRating: formData.qualityRating,
      safetyCompliance: formData.safetyCompliance,
      notes: formData.notes.trim(),
      images: formData.images,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, visitDate: selectedDate.toISOString() }));
    }
  };

  const renderRatingStars = (value: number, onChange: (value: number) => void) => (
    <View style={[styles.ratingContainer, isRTL && styles.ratingContainerRTL]}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          style={styles.starButton}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={24}
            color={star <= value ? Colors.accent : Colors.textLight}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProgressSlider = () => (
    <View style={styles.progressContainer}>
      <Text style={[styles.progressLabel, isRTL && styles.textRTL]}>
        {formData.overallProgress}%
      </Text>
      <View style={styles.sliderContainer}>
        {[0, 25, 50, 75, 100].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.sliderButton,
              formData.overallProgress >= value && styles.sliderButtonActive
            ]}
            onPress={() => setFormData(prev => ({ ...prev, overallProgress: value }))}
          >
            <Text style={[
              styles.sliderButtonText,
              formData.overallProgress >= value && styles.sliderButtonTextActive
            ]}>
              {value}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const safetyOptions = [
    { value: 'excellent', label: LocalizationService.t('excellent'), color: Colors.success },
    { value: 'good', label: LocalizationService.t('good'), color: Colors.primary },
    { value: 'satisfactory', label: LocalizationService.t('satisfactory'), color: '#0891B2' },
    { value: 'fair', label: LocalizationService.t('fair'), color: Colors.warning },
    { value: 'poor', label: LocalizationService.t('poor'), color: Colors.error },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.formCard}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {LocalizationService.t('siteVisitForm')}
          </Text>
        </View>

        {/* Visit Date */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('visitDate')} *
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {LocalizationService.formatDate(formData.visitDate)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.visitDate)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Inspector */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('inspector')} *
          </Text>
          <TextInput
            style={[
              styles.input,
              isRTL && styles.inputRTL,
              errors.inspector && styles.inputError
            ]}
            value={formData.inspector}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, inspector: text }));
              if (errors.inspector) {
                setErrors(prev => ({ ...prev, inspector: '' }));
              }
            }}
            placeholder={LocalizationService.t('inspector')}
            placeholderTextColor={Colors.textLight}
          />
          {errors.inspector && (
            <Text style={[styles.errorText, isRTL && styles.textRTL]}>
              {errors.inspector}
            </Text>
          )}
        </View>

        {/* Contractor Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('contractorName')} *
          </Text>
          <TextInput
            style={[
              styles.input,
              isRTL && styles.inputRTL,
              errors.contractorName && styles.inputError
            ]}
            value={formData.contractorName}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, contractorName: text }));
              if (errors.contractorName) {
                setErrors(prev => ({ ...prev, contractorName: '' }));
              }
            }}
            placeholder={LocalizationService.t('contractorName')}
            placeholderTextColor={Colors.textLight}
          />
          {errors.contractorName && (
            <Text style={[styles.errorText, isRTL && styles.textRTL]}>
              {errors.contractorName}
            </Text>
          )}
        </View>

        {/* Project Location */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('projectLocation')} *
          </Text>
          <TextInput
            style={[
              styles.input,
              isRTL && styles.inputRTL,
              errors.projectLocation && styles.inputError
            ]}
            value={formData.projectLocation}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, projectLocation: text }));
              if (errors.projectLocation) {
                setErrors(prev => ({ ...prev, projectLocation: '' }));
              }
            }}
            placeholder={LocalizationService.t('projectLocation')}
            placeholderTextColor={Colors.textLight}
          />
          {errors.projectLocation && (
            <Text style={[styles.errorText, isRTL && styles.textRTL]}>
              {errors.projectLocation}
            </Text>
          )}
        </View>

        {/* Weather Conditions */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('weatherConditions')}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            value={formData.weatherConditions}
            onChangeText={(text) => setFormData(prev => ({ ...prev, weatherConditions: text }))}
            placeholder={LocalizationService.t('weatherConditions')}
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Overall Progress */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('overallProgress')}
          </Text>
          {renderProgressSlider()}
        </View>

        {/* Quality Rating */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('qualityRating')}
          </Text>
          {renderRatingStars(formData.qualityRating, (value) =>
            setFormData(prev => ({ ...prev, qualityRating: value }))
          )}
        </View>

        {          /* Safety Compliance */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('safetyCompliance')}
          </Text>
          <View style={styles.safetyOptions}>
            {safetyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.safetyOption,
                  formData.safetyCompliance === option.value && {
                    borderColor: option.color,
                    backgroundColor: `${option.color}10`,
                  }
                ]}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  safetyCompliance: option.value as any 
                }))}
              >
                <Text style={[
                  styles.safetyOptionText,
                  formData.safetyCompliance === option.value && { color: option.color }
                ]}>
                  {LocalizationService.t(option.value)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {LocalizationService.t('notes')}
          </Text>
          <TextInput
            style={[styles.textArea, isRTL && styles.inputRTL]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder={LocalizationService.t('notes')}
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, isRTL && styles.actionButtonsRTL]}>
          <Button
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          >
            {LocalizationService.t('cancel')}
          </Button>
          <Button
            onPress={handleSubmit}
            loading={loading}
            style={styles.saveButton}
          >
            {LocalizationService.t('save')}
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  formCard: {
    margin: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  headerRTL: {
    alignItems: 'flex-end',
  },
  title: {
    ...Typography.title,
    color: Colors.primary,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    minHeight: 48,
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    ...Typography.heading,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  sliderButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sliderButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  sliderButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sliderButtonTextActive: {
    color: Colors.textOnPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  ratingContainerRTL: {
    flexDirection: 'row-reverse',
  },
  starButton: {
    padding: Spacing.xs,
  },
  safetyOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  safetyOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  safetyOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  actionButtonsRTL: {
    flexDirection: 'row-reverse',
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});