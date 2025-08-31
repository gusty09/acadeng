import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProjects } from '../../hooks/useProjects';
import { TaskCard } from '../../components/TaskCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { Task } from '../../types';

export default function TasksScreen() {
  const { projects, updateTask, deleteTask } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
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
        { text: 'إلغاء', style: 'cancel' },
        { text: 'موافق', onPress: onConfirm }
      ] : undefined);
    }
  };

  // Get all tasks from all projects
  const allTasks = useMemo(() => {
    const tasksWithProject: Array<Task & { projectId: string; projectName: string }> = [];
    
    projects.forEach(project => {
      project.tasks.forEach(task => {
        tasksWithProject.push({
          ...task,
          projectId: project.id,
          projectName: project.name,
        });
      });
    });

    return tasksWithProject;
  }, [projects]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(query) && 
            !task.description.toLowerCase().includes(query) &&
            !task.projectName.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'completed' && !task.completed) return false;
      if (statusFilter === 'pending' && task.completed) return false;

      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [allTasks, searchQuery, priorityFilter, statusFilter, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allTasks.map(task => task.category));
    return Array.from(cats);
  }, [allTasks]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter(task => task.completed).length;
    const high = allTasks.filter(task => task.priority === 'high').length;
    const medium = allTasks.filter(task => task.priority === 'medium').length;
    const low = allTasks.filter(task => task.priority === 'low').length;
    
    return {
      total,
      completed,
      pending: total - completed,
      high,
      medium,
      low,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [allTasks]);

  const handleUpdateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(projectId, taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      showAlert('خطأ', 'فشل في تحديث المهمة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDeleteTask = async (projectId: string, taskId: string, taskTitle: string) => {
    showAlert(
      'حذف المهمة',
      `هل أنت متأكد من حذف "${taskTitle}"؟`,
      async () => {
        try {
          await deleteTask(projectId, taskId);
        } catch (error) {
          console.error('Error deleting task:', error);
          showAlert('خطأ', 'فشل في حذف المهمة. يرجى المحاولة مرة أخرى.');
        }
      }
    );
  };

  const renderStats = () => (
    <Card style={styles.statsCard}>
      <Text style={styles.statsTitle}>إحصائيات المهام</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>إجمالي</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.secondary }]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>مكتمل</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            {stats.pending}
          </Text>
          <Text style={styles.statLabel}>معلق</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.high }]}>
            {stats.high}
          </Text>
          <Text style={styles.statLabel}>عالية</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>معدل الإنجاز</Text>
          <Text style={styles.progressValue}>{Math.round(stats.completionRate)}%</Text>
        </View>
        <ProgressBar 
          progress={stats.completionRate} 
          height={8}
          color={stats.completionRate === 100 ? Colors.secondary : Colors.primary}
        />
      </View>
    </Card>
  );

  const renderFilters = () => (
    <Card style={styles.filtersCard}>
      <Text style={styles.filtersTitle}>تصفية المهام</Text>
      
      {/* Priority Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>الأولوية</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterOptions}>
            {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterOption,
                  priorityFilter === priority && styles.filterOptionSelected
                ]}
                onPress={() => setPriorityFilter(priority)}
              >
                <Text style={[
                  styles.filterOptionText,
                  priorityFilter === priority && styles.filterOptionTextSelected
                ]}>
                  {priority === 'all' ? 'الكل' : 
                   priority === 'high' ? 'عالية' :
                   priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Status Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>الحالة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterOptions}>
            {(['all', 'completed', 'pending'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  statusFilter === status && styles.filterOptionSelected
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === status && styles.filterOptionTextSelected
                ]}>
                  {status === 'all' ? 'الكل' : 
                   status === 'completed' ? 'مكتمل' : 'معلق'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Category Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>الفئة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                categoryFilter === 'all' && styles.filterOptionSelected
              ]}
              onPress={() => setCategoryFilter('all')}
            >
              <Text style={[
                styles.filterOptionText,
                categoryFilter === 'all' && styles.filterOptionTextSelected
              ]}>
                الكل
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterOption,
                  categoryFilter === category && styles.filterOptionSelected
                ]}
                onPress={() => setCategoryFilter(category)}
              >
                <Text style={[
                  styles.filterOptionText,
                  categoryFilter === category && styles.filterOptionTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyStateCard}>
      <Ionicons name="clipboard-outline" size={64} color={Colors.textLight} />
      <Text style={styles.emptyStateTitle}>لا توجد مهام</Text>
      <Text style={styles.emptyStateMessage}>
        {searchQuery || priorityFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all'
          ? 'لا توجد مهام تطابق المرشحات المحددة'
          : 'لم يتم إنشاء أي مهام بعد. ابدأ بإنشاء مشروع وإضافة مهام إليه.'}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>إدارة المهام</Text>
          <Text style={styles.headerSubtitle}>
            {filteredTasks.length} من {stats.total} مهمة
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المهام..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
          <Ionicons 
            name="search" 
            size={20} 
            color={Colors.textLight} 
            style={styles.searchIcon}
          />
        </View>

        {/* Statistics */}
        {renderStats()}

        {/* Filters */}
        {renderFilters()}

        {/* Tasks List */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Text style={styles.tasksSectionTitle}>
              المهام ({filteredTasks.length})
            </Text>
            {filteredTasks.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setPriorityFilter('all');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                style={styles.clearFiltersButton}
              >
                <Text style={styles.clearFiltersText}>مسح المرشحات</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredTasks.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => (
                <View key={`${task.projectId}-${task.id}`} style={styles.taskWrapper}>
                  <View style={styles.taskProjectHeader}>
                    <Ionicons name="folder-outline" size={16} color={Colors.primary} />
                    <Text style={styles.taskProjectName}>{task.projectName}</Text>
                  </View>
                  <TaskCard
                    task={task}
                    onUpdate={(updates) => handleUpdateTask(task.projectId, task.id, updates)}
                    onDelete={() => handleDeleteTask(task.projectId, task.id, task.title)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

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
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    ...Shadows.medium,
  },
  headerContent: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.textOnPrimary,
    fontSize: 24,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textOnPrimary + 'CC',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingRight: 48,
    fontSize: 16,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    ...Shadows.small,
  },
  searchIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsTitle: {
    ...Typography.subheading,
    marginBottom: Spacing.md,
    textAlign: 'right',
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.title,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 4,
  },
  progressSection: {
    marginTop: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    ...Typography.bodyMedium,
  },
  progressValue: {
    ...Typography.bodyMedium,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  filtersCard: {
    marginBottom: Spacing.lg,
  },
  filtersTitle: {
    ...Typography.subheading,
    marginBottom: Spacing.md,
    textAlign: 'right',
    color: Colors.primary,
  },
  filterGroup: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  filterOptions: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filterOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  filterOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: Colors.textOnPrimary,
  },
  tasksSection: {
    flex: 1,
  },
  tasksSectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tasksSectionTitle: {
    ...Typography.heading,
  },
  clearFiltersButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  clearFiltersText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  tasksList: {
    gap: Spacing.md,
  },
  taskWrapper: {
    marginBottom: Spacing.sm,
  },
  taskProjectHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  taskProjectName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateTitle: {
    ...Typography.subheading,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyStateMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
    textAlign: 'right',
  },
  alertMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'right',
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