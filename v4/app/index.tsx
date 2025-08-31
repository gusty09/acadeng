import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { Header } from '../components/ui/Header';
import { FloatingActionMenu } from '../components/ui/FloatingActionMenu';
import { Card } from '../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';
import { LocalizationService } from '../services/localizationService';
import { Alert } from 'react-native';
import { Project } from '../types';

export default function HomeScreen() {
  const { projects, loading, searchProjects, generatePDFReport, shareReport } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredProjects: Project[] = searchQuery 
    ? searchProjects(searchQuery) 
    : projects;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Add any refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddProject = () => {
    router.push('/create-project');
  };

  const handleQuickReport = async () => {
    try {
      if (!projects || projects.length === 0) {
        Alert.alert('لا توجد مشاريع', 'أضف مشروعًا أولاً لإنشاء تقرير.');
        return;
      }
      const recent = projects[0];
      const html = await generatePDFReport(recent.id);
      await shareReport(html, recent.name);
    } catch (e) {
      console.error(e);
      Alert.alert('خطأ', 'تعذر إنشاء أو مشاركة التقرير.');
    }
  };

  const renderEmptyState = () => (
    <Card style={styles.emptyStateCard}>
      <Ionicons name="folder-outline" size={48} color={Colors.textLight} />
      <Text style={styles.emptyStateTitle}>
        {LocalizationService.t('noProjectsYet')}
      </Text>
      <Text style={styles.emptyStateMessage}>
        {LocalizationService.t('addFirstProject')}
      </Text>
      <TouchableOpacity
        style={styles.addFirstProjectButton}
        onPress={handleAddProject}
      >
        <Ionicons name="add" size={20} color={Colors.textOnPrimary} />
        <Text style={styles.addFirstProjectText}>
          {LocalizationService.t('addProject')}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const renderProjectStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p: Project) => p.status === 'active').length;
    const completedProjects = projects.filter((p: Project) => p.status === 'completed').length;
    
    if (totalProjects === 0) return null;

    return (
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>إحصائيات المشاريع</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalProjects}</Text>
            <Text style={styles.statLabel}>إجمالي</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {activeProjects}
            </Text>
            <Text style={styles.statLabel}>نشط</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.secondary }]}>
              {completedProjects}
            </Text>
            <Text style={styles.statLabel}>مكتمل</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="مشاريع التفتيش"
        subtitle={`${projects.length} مشروع`}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المشاريع..."
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

        {/* Project Stats */}
        {renderProjectStats()}

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          projects.length === 0 ? renderEmptyState() : (
            <Card style={styles.noResultsCard}>
              <Ionicons name="search" size={32} color={Colors.textLight} />
              <Text style={styles.noResultsText}>
                لا توجد نتائج للبحث "{searchQuery}"
              </Text>
            </Card>
          )
        ) : (
          <View style={styles.projectsList}>
            {filteredProjects.map((project: Project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onPress={() => router.push(`/project/${project.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionMenu
        onAddProject={handleAddProject}
        onQuickReport={handleQuickReport}
      />
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
    paddingBottom: 120,
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
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
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
  projectsList: {
    gap: Spacing.md,
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateTitle: {
    ...Typography.heading,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  addFirstProjectButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  addFirstProjectText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  noResultsCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noResultsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});