import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProjects } from '../../hooks/useProjects';
import { TaskCard } from '../../components/TaskCard';
import { SiteVisitForm } from '../../components/SiteVisitForm';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { LocalizationService } from '../../services/localizationService';
import { Task, SiteVisit } from '../../types';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    projects, 
    addTask, 
    updateTask, 
    deleteTask, 
    addSiteVisit,
    generatePDFReport, 
    shareReport
  } = useProjects();
  
  const [loading, setLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showSiteVisitForm, setShowSiteVisitForm] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'foundationWork',
    phase: 'foundationWork' as Task['phase'],
    priority: 'medium' as Task['priority'],
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const project = useMemo(() => 
    projects.find(p => p.id === id), 
    [projects, id]
  );

  const filteredTasks = useMemo(() => {
    if (!project) return [];
    
    switch (taskFilter) {
      case 'completed':
        return project.tasks.filter(task => task.completed);
      case 'pending':
        return project.tasks.filter(task => !task.completed);
      default:
        return project.tasks;
    }
  }, [project, taskFilter]);

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onConfirm });
    } else {
      Alert.alert(title, message, onConfirm ? [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'موافق', onPress: onConfirm }
      ] : undefined);
    }
  };

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="المشروع غير موجود" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>المشروع غير موجود</Text>
          <Text style={styles.errorMessage}>
            لم يتم العثور على المشروع المطلوب.
          </Text>
          <Button onPress={() => router.back()}>
            العودة
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const completedTasks = project.tasks.filter(task => task.completed);
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  const latestSiteVisit = project.siteVisits?.[project.siteVisits.length - 1];

  const validateTaskForm = () => {
    const newErrors: typeof errors = {};

    if (!taskForm.title.trim()) {
      newErrors.title = 'عنوان المهمة مطلوب';
    }

    if (!taskForm.description.trim()) {
      newErrors.description = 'وصف المهمة مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTask = async () => {
    if (!validateTaskForm()) return;

    setLoading(true);
    try {
      await addTask(project.id, {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        category: taskForm.category,
        phase: taskForm.phase,
        priority: taskForm.priority,
        completed: false,
      });

      setTaskForm({ 
        title: '', 
        description: '', 
        category: 'foundationWork',
        phase: 'foundationWork',
        priority: 'medium' 
      });
      setShowAddTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(project.id, taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    showAlert(
      'حذف المهمة',
      `هل أنت متأكد من حذف "${taskTitle}"؟`,
      async () => {
        try {
          await deleteTask(project.id, taskId);
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      }
    );
  };

  const handleAddSiteVisit = async (siteVisitData: Omit<SiteVisit, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      await addSiteVisit(project.id, siteVisitData);
      setShowSiteVisitForm(false);
    } catch (error) {
      console.error('Error adding site visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const pdfUri = await generatePDFReport(project.id);
      await shareReport(pdfUri, project.name);
    } catch (error) {
      console.error('Error generating report:', error);
      showAlert('خطأ', 'فشل في إنشاء التقرير. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return Colors.high;
      case 'medium': return Colors.medium;
      case 'low': return Colors.low;
      default: return Colors.textLight;
    }
  };

  const renderProjectHeader = () => (
    <Card style={styles.headerCard} padding="none">
      {/* Project Cover Image */}
      {project.coverImage && (
        <View style={styles.coverImageContainer}>
          <Image
            source={{ uri: project.coverImage }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          >
            <Text style={styles.projectTitle}>
              {project.name}
            </Text>
          </LinearGradient>
        </View>
      )}

      <View style={styles.headerContent}>
        {!project.coverImage && (
          <Text style={styles.projectTitle}>
            {project.name}
          </Text>
        )}

        <Text style={styles.projectDescription}>
          {project.description}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalTasks}</Text>
            <Text style={styles.statLabel}>إجمالي المهام</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.secondary }]}>
              {completedTasks.length}
            </Text>
            <Text style={styles.statLabel}>مكتمل</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {Math.round(progress)}%
            </Text>
            <Text style={styles.statLabel}>التقدم</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>
              {project.siteVisits?.length || 0}
            </Text>
            <Text style={styles.statLabel}>الزيارات</Text>
          </View>
        </View>

        <ProgressBar 
          progress={progress} 
          height={12} 
          color={progress === 100 ? Colors.secondary : Colors.primary}
          style={styles.progressBar}
        />

        {/* Latest Site Visit Info */}
        {latestSiteVisit && (
          <Card style={styles.latestVisitCard}>
            <Text style={styles.latestVisitTitle}>آخر زيارة موقع</Text>
            <View style={styles.latestVisitInfo}>
              <View style={styles.visitDetail}>
                <Text style={styles.visitLabel}>المفتش</Text>
                <Text style={styles.visitValue}>{latestSiteVisit.inspector}</Text>
              </View>
              <View style={styles.visitDetail}>
                <Text style={styles.visitLabel}>التقدم</Text>
                <Text style={styles.visitValue}>{latestSiteVisit.overallProgress}%</Text>
              </View>
              <View style={styles.visitDetail}>
                <Text style={styles.visitLabel}>الجودة</Text>
                <Text style={styles.visitValue}>
                  {'★'.repeat(latestSiteVisit.qualityRating)}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </View>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Button
        onPress={() => setShowAddTask(true)}
        style={styles.addButton}
      >
        <Ionicons name="add" size={16} color={Colors.textOnPrimary} />
        <Text style={styles.addButtonText}>إضافة مهمة</Text>
      </Button>
      
      <Button
        onPress={() => setShowSiteVisitForm(true)}
        variant="outline"
        style={styles.siteVisitButton}
      >
        <Ionicons name="clipboard-outline" size={16} color={Colors.primary} />
        <Text style={styles.siteVisitButtonText}>زيارة موقع</Text>
      </Button>
      
      <Button
        onPress={handleGenerateReport}
        variant="accent"
        loading={loading}
        style={styles.reportButton}
      >
        <Ionicons name="document-text-outline" size={16} color={Colors.textOnAccent} />
        <Text style={styles.reportButtonText}>التقرير</Text>
      </Button>
    </View>
  );

  const renderTaskFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>
        المهام ({filteredTasks.length})
      </Text>
      
      <View style={styles.filterButtons}>
        {(['all', 'pending', 'completed'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              taskFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setTaskFilter(filter)}
          >
            <Text style={[
              styles.filterButtonText,
              taskFilter === filter && styles.filterButtonTextActive
            ]}>
              {filter === 'all' ? 'الكل' : filter === 'pending' ? 'معلق' : 'مكتمل'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyTasks = () => (
    <Card style={styles.emptyTasksCard}>
      <Ionicons name="clipboard-outline" size={48} color={Colors.textLight} />
      <Text style={styles.emptyTasksTitle}>لا توجد مهام حتى الآن</Text>
      <Text style={styles.emptyTasksMessage}>
        أضف مهمتك الأولى للبدء في هذا المشروع.
      </Text>
    </Card>
  );

  const categories = LocalizationService.getConstructionCategories();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title={project.name}
        subtitle={`${Math.round(progress)}% مكتمل`}
        rightAction={{
          icon: 'create-outline',
          onPress: () => router.push(`/edit-project/${project.id}`)
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProjectHeader()}
        {renderActionButtons()}
        {renderTaskFilter()}
        
        {/* Tasks List */}
        <View style={styles.tasksSection}>
          {filteredTasks.length === 0 ? (
            renderEmptyTasks()
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                onDelete={() => handleDeleteTask(task.id, task.title)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Task Modal - Modern Arabic Design */}
      <Modal
        visible={showAddTask}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddTask(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowAddTask(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>إضافة مهمة جديدة</Text>
              <TouchableOpacity
                onPress={handleAddTask}
                style={styles.modalSaveButton}
                disabled={loading}
              >
                <Text style={[
                  styles.modalSaveText,
                  loading && styles.disabledText
                ]}>
                  {loading ? 'جاري الإضافة...' : 'إضافة'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>عنوان المهمة *</Text>
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  value={taskForm.title}
                  onChangeText={(text) => {
                    setTaskForm(prev => ({ ...prev, title: text }));
                    if (errors.title) {
                      setErrors(prev => ({ ...prev, title: undefined }));
                    }
                  }}
                  placeholder="أدخل عنوان المهمة"
                  placeholderTextColor={Colors.textLight}
                  textAlign="right"
                />
                {errors.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>الوصف *</Text>
                <TextInput
                  style={[styles.textArea, errors.description && styles.inputError]}
                  value={taskForm.description}
                  onChangeText={(text) => {
                    setTaskForm(prev => ({ ...prev, description: text }));
                    if (errors.description) {
                      setErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }}
                  placeholder="اكتب وصف المهمة المطلوب تنفيذها"
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  textAlign="right"
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>فئة العمل</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryOptions}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.key}
                        style={[
                          styles.categoryOption,
                          taskForm.category === category.key && styles.categoryOptionSelected
                        ]}
                        onPress={() => {
                          setTaskForm(prev => ({ 
                            ...prev, 
                            category: category.key,
                            phase: category.key as Task['phase']
                          }));
                        }}
                      >
                        <Text style={[
                          styles.categoryText,
                          taskForm.category === category.key && styles.categoryTextSelected
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>الأولوية</Text>
                <View style={styles.priorityOptions}>
                  {(['low', 'medium', 'high'] as const).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        taskForm.priority === priority && styles.priorityOptionSelected,
                        { borderColor: getPriorityColor(priority) }
                      ]}
                      onPress={() => setTaskForm(prev => ({ ...prev, priority }))}
                    >
                      <Text style={[
                        styles.priorityText,
                        taskForm.priority === priority && { color: getPriorityColor(priority) }
                      ]}>
                        {priority === 'high' ? 'عالية' : priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Site Visit Form Modal */}
      <Modal
        visible={showSiteVisitForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSiteVisitForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <SiteVisitForm
            onSubmit={handleAddSiteVisit}
            onCancel={() => setShowSiteVisitForm(false)}
            loading={loading}
          />
        </SafeAreaView>
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
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.alertButton, styles.confirmButton]}
                  onPress={() => {
                    alertConfig.onConfirm?.();
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Text style={styles.confirmButtonText}>موافق</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    ...Typography.heading,
    marginVertical: Spacing.md,
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  headerCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  coverImageContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  headerContent: {
    padding: Spacing.md,
  },
  projectTitle: {
    ...Typography.title,
    color: Colors.surface,
    marginBottom: Spacing.sm,
  },
  projectDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.heading,
    color: Colors.secondary,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 2,
  },
  progressBar: {
    marginBottom: Spacing.md,
  },
  latestVisitCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceAccent,
    borderRadius: BorderRadius.md,
    borderRightWidth: 4,
    borderRightColor: Colors.accent,
  },
  latestVisitTitle: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  latestVisitInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  visitDetail: {
    alignItems: 'center',
  },
  visitLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  visitValue: {
    ...Typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addButton: {
    flex: 2,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  siteVisitButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  siteVisitButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  reportButtonText: {
    color: Colors.textOnAccent,
    fontWeight: '600',
    fontSize: 12,
  },
  filterSection: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading,
  },
  filterButtons: {
    flexDirection: 'row-reverse',
    gap: Spacing.xs,
  },
  filterButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.textOnPrimary,
  },
  tasksSection: {
    flex: 1,
  },
  emptyTasksCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTasksTitle: {
    ...Typography.subheading,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyTasksMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  modalCancelButton: {
    padding: Spacing.sm,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  modalTitle: {
    ...Typography.subheading,
  },
  modalSaveButton: {
    padding: Spacing.sm,
  },
  modalSaveText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  modalForm: {
    flex: 1,
    padding: Spacing.md,
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
    minHeight: 48,
    color: Colors.text,
    ...Shadows.small,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    color: Colors.text,
    ...Shadows.small,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  categoryOptions: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  categoryOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 120,
    alignItems: 'center',
    ...Shadows.small,
  },
  categoryOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: Colors.textOnPrimary,
  },
  priorityOptions: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  priorityOptionSelected: {
    backgroundColor: Colors.surfaceLight,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    ...Shadows.large,
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
    flexDirection: 'row-reverse',
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
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
});