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
import { LinearGradient } from 'expo-linear-gradient';
import { useProjects } from '../../hooks/useProjects';
import { ProjectCard } from '../../components/ProjectCard';
import { FloatingActionMenu } from '../../components/ui/FloatingActionMenu';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { LocalizationService } from '../../services/localizationService';

export default function ProjectsScreen() {
  const { projects, loading, searchProjects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredProjects = searchQuery 
    ? searchProjects(searchQuery) 
    : projects;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddProject = () => {
    router.push('/create-project');
  };

  const handleQuickReport = () => {
    if (projects.length > 0) {
      router.push(`/project/${projects[0].id}`);
    } else {
      router.push('/create-project');
    }
  };

  const renderEmptyState = () => (
    <Card style={styles.emptyStateCard}>
      <LinearGradient
        colors={[Colors.accent + '20', Colors.accent + '10']}
        style={styles.emptyStateGradient}
      >
        <Ionicons name="folder-outline" size={64} color={Colors.accent} />
        <Text style={styles.emptyStateTitle}>
          ابدأ مشروعك الأول
        </Text>
        <Text style={styles.emptyStateMessage}>
          أنشئ مشروع تفتيش هندسي جديد وابدأ في تتبع المهام وإنشاء التقارير الفنية
        </Text>
        <TouchableOpacity
          style={styles.addFirstProjectButton}
          onPress={handleAddProject}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={20} color={Colors.textOnPrimary} />
            <Text style={styles.addFirstProjectText}>
              إنشاء مشروع جديد
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Card>
  );

  const renderProjectStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0);
    const avgCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    if (totalProjects === 0) return null;

    return (
      <Card style={styles.statsCard}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.statsHeader}
        >
          <Text style={styles.statsHeaderTitle}>نظرة عامة على المشاريع</Text>
          <Text style={styles.statsHeaderSubtitle}>إحصائيات شاملة</Text>
        </LinearGradient>
        
        <View style={styles.statsContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="folder" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{totalProjects}</Text>
              <Text style={styles.statLabel}>إجمالي المشاريع</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accent + '20' }]}>
                <Ionicons name="trending-up" size={24} color={Colors.accent} />
              </View>
              <Text style={[styles.statValue, { color: Colors.accent }]}>
                {activeProjects}
              </Text>
              <Text style={styles.statLabel}>نشط</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.secondary + '20' }]}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
              </View>
              <Text style={[styles.statValue, { color: Colors.secondary }]}>
                {completedProjects}
              </Text>
              <Text style={styles.statLabel}>مكتمل</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.info + '20' }]}>
                <Ionicons name="analytics" size={24} color={Colors.info} />
              </View>
              <Text style={[styles.statValue, { color: Colors.info }]}>
                {Math.round(avgCompletion)}%
              </Text>
              <Text style={styles.statLabel}>معدل الإنجاز</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>ACAD</Text>
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>أكاد للتفتيش الهندسي</Text>
                <Text style={styles.companyTagline}>الجودة والتميز في التفتيش</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textOnPrimary} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerBottom}>
            <Text style={styles.headerTitle}>إدارة المشاريع</Text>
            <Text style={styles.headerSubtitle}>
              {projects.length} مشروع • {projects.filter(p => p.status === 'active').length} نشط
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في المشاريع والمهام..."
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
        </View>

        {/* Project Stats */}
        {renderProjectStats()}

        {/* Quick Actions */}
        {projects.length > 0 && (
          <Card style={styles.quickActionsCard}>
            <Text style={styles.quickActionsTitle}>الإجراءات السريعة</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={handleAddProject}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight]}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="add-circle" size={32} color={Colors.textOnPrimary} />
                  <Text style={styles.quickActionText}>مشروع جديد</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/reports')}
              >
                <LinearGradient
                  colors={[Colors.accent, Colors.accentLight]}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="document-text" size={32} color={Colors.textOnAccent} />
                  <Text style={[styles.quickActionText, { color: Colors.textOnAccent }]}>
                    التقارير
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/tasks')}
              >
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryDark]}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="checkmark-circle" size={32} color={Colors.textOnPrimary} />
                  <Text style={styles.quickActionText}>المهام</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Projects List */}
        <View style={styles.projectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              المشاريع {filteredProjects.length > 0 && `(${filteredProjects.length})`}
            </Text>
            {searchQuery && filteredProjects.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Text style={styles.clearSearchText}>مسح البحث</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {filteredProjects.length === 0 ? (
            projects.length === 0 ? renderEmptyState() : (
              <Card style={styles.noResultsCard}>
                <Ionicons name="search" size={48} color={Colors.textLight} />
                <Text style={styles.noResultsTitle}>
                  لا توجد نتائج
                </Text>
                <Text style={styles.noResultsText}>
                  لم يتم العثور على مشاريع تطابق البحث "{searchQuery}"
                </Text>
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchText}>مسح البحث</Text>
                </TouchableOpacity>
              </Card>
            )
          ) : (
            <View style={styles.projectsList}>
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onPress={() => router.push(`/project/${project.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Enhanced Floating Action Menu */}
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
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    ...Shadows.medium,
  },
  headerContent: {
    gap: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: Colors.textOnAccent,
    fontWeight: 'bold',
    fontSize: 18,
  },
  companyInfo: {
    alignItems: 'flex-end',
  },
  companyName: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  companyTagline: {
    color: Colors.textOnPrimary + 'CC',
    fontSize: 12,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerBottom: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...Typography.title,
    color: Colors.textOnPrimary,
    fontSize: 28,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textOnPrimary + 'DD',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  searchInputContainer: {
    position: 'relative',
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
    padding: 0,
    overflow: 'hidden',
  },
  statsHeader: {
    padding: Spacing.lg,
    alignItems: 'flex-end',
  },
  statsHeaderTitle: {
    color: Colors.textOnPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsHeaderSubtitle: {
    color: Colors.textOnPrimary + 'CC',
    fontSize: 14,
    marginTop: 4,
  },
  statsContent: {
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.title,
    color: Colors.text,
    fontSize: 24,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsCard: {
    marginBottom: Spacing.lg,
  },
  quickActionsTitle: {
    ...Typography.subheading,
    marginBottom: Spacing.md,
    textAlign: 'right',
    color: Colors.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  projectsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.heading,
  },
  clearSearchButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  clearSearchText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  projectsList: {
    gap: Spacing.md,
  },
  emptyStateCard: {
    padding: 0,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
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
    lineHeight: 24,
  },
  addFirstProjectButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  addFirstProjectText: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  noResultsCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noResultsTitle: {
    ...Typography.subheading,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  noResultsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});