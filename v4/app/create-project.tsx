import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProjects } from '../hooks/useProjects';
import { useImagePicker } from '../hooks/useImagePicker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/Colors';
import { Image } from 'expo-image';

export default function CreateProjectScreen() {
  const { addProject } = useProjects();
  const { pickImage, loading: imageLoading } = useImagePicker();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contractor: '',
    clientName: '',
    projectManager: '',
    budget: '',
    startDate: '',
    expectedEndDate: '',
    coverImage: '',
    projectNumber: '',
    municipalProjectNumber: '',
    consultantName: 'أكاد للاستشارات الهندسية - شركة التفحص الواحد م.م',
    projectDuration: '',
    projectValue: '',
    contractDate: '',
    projectType: 'residential',
    totalArea: '',
    buildingHeight: '',
    numberOfFloors: '1',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    budget?: string;
    projectValue?: string;
    totalArea?: string;
    buildingHeight?: string;
    numberOfFloors?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المشروع مطلوب';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'اسم المشروع يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف المشروع مطلوب';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'الميزانية يجب أن تكون رقماً صحيحاً';
    }

    if (formData.projectValue && isNaN(Number(formData.projectValue))) {
      newErrors.projectValue = 'قيمة المشروع يجب أن تكون رقماً صحيحاً';
    }

    if (formData.totalArea && isNaN(Number(formData.totalArea))) {
      newErrors.totalArea = 'المساحة الإجمالية يجب أن تكون رقماً صحيحاً';
    }

    if (formData.buildingHeight && isNaN(Number(formData.buildingHeight))) {
      newErrors.buildingHeight = 'ارتفاع المبنى يجب أن يكون رقماً صحيحاً';
    }

    if (formData.numberOfFloors && isNaN(Number(formData.numberOfFloors))) {
      newErrors.numberOfFloors = 'عدد الطوابق يجب أن يكون رقماً صحيحاً';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: 'active' as const,
        tasks: [],
        location: formData.location.trim() || undefined,
        contractor: formData.contractor.trim() || undefined,
        clientName: formData.clientName.trim() || undefined,
        projectManager: formData.projectManager.trim() || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        startDate: formData.startDate || undefined,
        expectedEndDate: formData.expectedEndDate || undefined,
        coverImage: formData.coverImage || undefined,
        projectNumber: formData.projectNumber.trim() || `ACAD-${Date.now()}`,
        municipalProjectNumber: formData.municipalProjectNumber.trim() || undefined,
        consultantName: formData.consultantName.trim(),
        projectDuration: formData.projectDuration.trim() || undefined,
        projectValue: formData.projectValue ? Number(formData.projectValue) : undefined,
        contractDate: formData.contractDate || undefined,
        projectType: formData.projectType as any,
        totalArea: formData.totalArea ? Number(formData.totalArea) : undefined,
        buildingHeight: formData.buildingHeight ? Number(formData.buildingHeight) : undefined,
        numberOfFloors: formData.numberOfFloors ? Number(formData.numberOfFloors) : 1,
      };

      await addProject(projectData);
      router.back();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handlePickCoverImage = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setFormData(prev => ({ ...prev, coverImage: imageUri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleRemoveCoverImage = () => {
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const renderInput = (
    key: keyof typeof formData,
    label: string,
    placeholder: string,
    options: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric' | 'email-address';
      required?: boolean;
      type?: 'date';
    } = {}
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {options.required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          options.multiline ? styles.textArea : styles.input,
          errors[key as keyof typeof errors] && styles.inputError
        ]}
        value={options.type === 'date' ? formatDateForInput(formData[key]) : formData[key]}
        onChangeText={(text) => {
          if (options.type === 'date') {
            // Convert back to ISO string
            const dateValue = text ? new Date(text).toISOString() : '';
            setFormData(prev => ({ ...prev, [key]: dateValue }));
          } else {
            setFormData(prev => ({ ...prev, [key]: text }));
          }
          if (errors[key as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
          }
        }}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        multiline={options.multiline}
        numberOfLines={options.multiline ? 3 : 1}
        textAlignVertical={options.multiline ? 'top' : 'center'}
        keyboardType={options.keyboardType || 'default'}
        textAlign="right"
      />
      {errors[key as keyof typeof errors] && (
        <Text style={styles.errorText}>
          {errors[key as keyof typeof errors]}
        </Text>
      )}
    </View>
  );

  const renderSelectInput = (
    key: keyof typeof formData,
    label: string,
    options: { value: string; label: string }[],
    required?: boolean
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.selectOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.selectOption,
                formData[key] === option.value && styles.selectOptionSelected
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, [key]: option.value }));
                if (errors[key as keyof typeof errors]) {
                  setErrors(prev => ({ ...prev, [key]: undefined }));
                }
              }}
            >
              <Text style={[
                styles.selectOptionText,
                formData[key] === option.value && styles.selectOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {errors[key as keyof typeof errors] && (
        <Text style={styles.errorText}>{errors[key as keyof typeof errors]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Ionicons name="arrow-forward" size={24} color={Colors.textOnPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>مشروع جديد</Text>
          <Text style={styles.headerSubtitle}>إنشاء مشروع تفتيش هندسي</Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Ionicons 
            name={loading ? "hourglass-outline" : "checkmark"} 
            size={24} 
            color={Colors.textOnPrimary} 
          />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* صورة الغلاف */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>صورة الغلاف</Text>
            
            {formData.coverImage ? (
              <View style={styles.coverImageContainer}>
                <Image
                  source={{ uri: formData.coverImage }}
                  style={styles.coverImage}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveCoverImage}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={handlePickCoverImage}
                >
                  <Ionicons name="camera" size={16} color={Colors.primary} />
                  <Text style={styles.changeImageText}>تغيير</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addCoverImageButton}
                onPress={handlePickCoverImage}
                disabled={imageLoading}
              >
                <LinearGradient
                  colors={[Colors.accent + '20', Colors.accent + '10']}
                  style={styles.addImageGradient}
                >
                  <Ionicons 
                    name={imageLoading ? "hourglass-outline" : "camera"} 
                    size={32} 
                    color={Colors.accent} 
                  />
                  <Text style={styles.addCoverImageText}>
                    {imageLoading ? 'جاري التحميل...' : 'إضافة صورة الغلاف'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Card>

          {/* المعلومات الأساسية */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
            
            {renderInput('name', 'اسم المشروع', 'أدخل اسم المشروع', { required: true })}
            {renderInput('description', 'وصف المشروع', 'اكتب وصف شامل للمشروع', { 
              multiline: true, 
              required: true 
            })}
            {renderInput('location', 'موقع المشروع', 'عنوان المشروع أو الموقع')}
            {renderInput('projectNumber', 'رقم المشروع', 'رقم المشروع الداخلي')}
            {renderInput('municipalProjectNumber', 'رقم المشروع البلدية', 'رقم الرخصة أو التصريح')}
          </Card>

          {/* تفاصيل المشروع */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>تفاصيل المشروع</Text>
            
            {renderInput('contractor', 'اسم المقاول', 'اسم شركة المقاولات')}
            {renderInput('clientName', 'اسم العميل', 'اسم المالك أو العميل')}
            {renderInput('projectManager', 'مدير المشروع', 'اسم مدير المشروع')}
            {renderInput('consultantName', 'اسم الاستشاري', 'اسم الشركة الاستشارية')}
            {renderInput('budget', 'الميزانية', 'ميزانية المشروع (ريال سعودي)', { 
              keyboardType: 'numeric' 
            })}
            {renderInput('projectValue', 'قيمة المشروع', 'القيمة الإجمالية للمشروع', { 
              keyboardType: 'numeric' 
            })}
          </Card>

          {/* الجدول الزمني */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>الجدول الزمني</Text>
            
            {renderInput('startDate', 'تاريخ البدء', 'اختر تاريخ بداية المشروع', { 
              type: 'date' 
            })}
            {renderInput('expectedEndDate', 'تاريخ الانتهاء المتوقع', 'اختر تاريخ انتهاء المشروع', { 
              type: 'date' 
            })}
            {renderInput('contractDate', 'تاريخ التعاقد', 'تاريخ توقيع العقد', { 
              type: 'date' 
            })}
            {renderInput('projectDuration', 'مدة التنفيذ', 'مدة تنفيذ المشروع (بالأشهر)')}
          </Card>

          {/* المواصفات التقنية */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>المواصفات التقنية</Text>
            
            {renderSelectInput('projectType', 'نوع المشروع', [
              { value: 'residential', label: 'سكني' },
              { value: 'commercial', label: 'تجاري' },
              { value: 'infrastructure', label: 'بنية تحتية' },
              { value: 'industrial', label: 'صناعي' },
            ])}
            
            {renderInput('totalArea', 'المساحة الإجمالية', 'المساحة بالمتر المربع', { 
              keyboardType: 'numeric' 
            })}
            {renderInput('buildingHeight', 'ارتفاع المبنى', 'الارتفاع بالمتر', { 
              keyboardType: 'numeric' 
            })}
            {renderInput('numberOfFloors', 'عدد الطوابق', 'عدد الطوابق في المبنى', { 
              keyboardType: 'numeric' 
            })}
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          >
            إلغاء
          </Button>
          <Button
            onPress={handleSubmit}
            loading={loading}
            style={styles.createButton}
          >
            إنشاء المشروع
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    ...Shadows.medium,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.textOnPrimary,
    fontSize: 20,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textOnPrimary + 'CC',
    marginTop: 2,
  },
  saveButton: {
    padding: Spacing.sm,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
    textAlign: 'right',
  },
  coverImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  coverImage: {
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
    ...Shadows.small,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    ...Shadows.small,
  },
  changeImageText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  addCoverImageButton: {
    marginBottom: Spacing.md,
  },
  addImageGradient: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.accent + '30',
    borderStyle: 'dashed',
  },
  addCoverImageText: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    marginTop: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    minHeight: 52,
    textAlign: 'right',
    ...Shadows.small,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    textAlign: 'right',
    ...Shadows.small,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  selectOptions: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  selectOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 100,
    alignItems: 'center',
    ...Shadows.small,
  },
  selectOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  selectOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  selectOptionTextSelected: {
    color: Colors.textOnPrimary,
  },
  footer: {
    flexDirection: 'row-reverse',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.small,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
  },
});