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
import { ProjectCard } from '../../components/ProjectCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { LocalizationService } from '../../services/localizationService';

interface ReportItem {
  id: string;
  projectId: string;
  projectName: string;
  generatedAt: string;
  type: 'comprehensive' | 'summary' | 'site-visit';
  status: 'ready' | 'generating' | 'failed';
}

export default function ReportsScreen() {
  const { projects, generatePDFReport, shareReport } = useProjects();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<'comprehensive' | 'summary' | 'site-visit'>('comprehensive');
  const [generatedReports, setGeneratedReports] = useState<ReportItem[]>([]);
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
        { text: 'موافق', onPress: onConfirm }
      ] : undefined);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.location?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const projectsStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0);
    
    return {
      total,
      active,
      completed,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }, [projects]);

  const handleGenerateReport = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setLoading(prev => ({ ...prev, [projectId]: true }));
    
    try {
      // Add report to generating list
      const reportItem: ReportItem = {
        id: `report_${Date.now()}`,
        projectId,
        projectName: project.name,
        generatedAt: new Date().toISOString(),
        type: selectedReportType,
        status: 'generating',
      };
      
      setGeneratedReports(prev => [reportItem, ...prev]);

      const pdfUri = await generatePDFReport(projectId);
      
      // Update report status to ready
      setGeneratedReports(prev => 
        prev.map(r => 
          r.id === reportItem.id 
            ? { ...r, status: 'ready' as const }
            : r
        )
      );

      await shareReport(pdfUri, project.name);
      
      showAlert(
        'تم إنشاء التقرير',
        `تم إنشاء تقرير فني شامل لمشروع "${project.name}" بنجاح!`
      );
    } catch (error) {
      console.error('Error generating report:', error);
      
      // Update report status to failed
      setGeneratedReports(prev => 
        prev.map(r => 
          r.projectId === projectId && r.status === 'generating'
            ? { ...r, status: 'failed' as const }
            : r
        )
      );
      
      showAlert(
        'خطأ في إنشاء التقرير',
        'فشل في إنشاء التقرير. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleRetryReport = async (report: ReportItem) => {
    setGeneratedReports(prev => 
      prev.map(r => 
        r.id === report.id 
          ? { ...r, status: 'generating' as const }
          : r
      )
    );

    try {
      const pdfUri = await generatePDFReport(report.projectId);
      
      setGeneratedReports(prev => 
        prev.map(r => 
          r.id === report.id 
            ? { ...r, status: 'ready' as const }
            : r
        )
      );

      await shareReport(pdfUri, report.projectName);
    } catch (error) {
      setGeneratedReports(prev => 
        prev.map(r => 
          r.id === report.id 
            ? { ...r, status: 'failed' as const }
            : r
        )
      );
    }
  };

  const renderReportTypes = () => (
    <Card style={styles.reportTypesCard}>
      <Text style={styles.sectionTitle}>نوع التقرير</Text>
      <View style={styles.reportTypes}>
        {[
          { key: 'comprehensive', label: 'تقرير شامل', desc: 'تقرير فني مفصل مع جميع البيانات' },
          { key: 'summary', label: 'تقرير مختصر', desc: 'ملخص سريع للتقدم والحالة' },
          { key: 'site-visit', label: 'تقرير زيارة موقع', desc: 'تقرير خاص بزيارة الموقع' },
        ].map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.reportType,
              selectedReportType === type.key && styles.reportTypeSelected
            ]}
            onPress={() => setSelectedReportType(type.key as any)}
          >
            <View style={styles.reportTypeContent}>
              <Text style={[
                styles.reportTypeTitle,
                selectedReportType === type.key && styles.reportTypeTextSelected
              ]}>
                {type.label}
              </Text>
              <Text style={[
                styles.reportTypeDesc,
                selectedReportType === type.key && styles.reportTypeDescSelected
              ]}>
                {type.desc}
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              selectedReportType === type.key && styles.radioButtonSelected
            ]}>
              {selectedReportType === type.key && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderProjectsOverview = () => (
    <Card style={styles.overviewCard}>
      <Text style={styles.sectionTitle}>نظرة عامة على المشاريع</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{projectsStats.total}</Text>
          <Text style={styles.statLabel}>إجمالي المشاريع</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            {projectsStats.active}
          </Text>
          <Text style={styles.statLabel}>نشط</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.secondary }]}>
            {projectsStats.completed}
          </Text>
          <Text style={styles.statLabel}>مكتمل</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.accent }]}>
            {projectsStats.totalTasks}
          </Text>
          <Text style={styles.statLabel}>إجمالي المهام</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>معدل الإنجاز العام</Text>
          <Text style={styles.progressValue}>
            {Math.round(projectsStats.completionRate)}%
          </Text>
        </View>
        <ProgressBar 
          progress={projectsStats.completionRate} 
          height={8}
          color={projectsStats.completionRate === 100 ? Colors.secondary : Colors.primary}
        />
      </View>
    </Card>
  );

  const renderRecentReports = () => (
    <Card style={styles.recentReportsCard}>
      <View style={styles.recentReportsHeader}>
        <Text style={styles.sectionTitle}>التقارير الأخيرة</Text>
        <TouchableOpacity 
          onPress={() => setGeneratedReports([])}
          style={styles.clearReportsButton}
        >
          <Text style={styles.clearReportsText}>مسح الكل</Text>
        </TouchableOpacity>
      </View>

      {generatedReports.length === 0 ? (
        <View style={styles.noReportsContainer}>
          <Ionicons name="document-outline" size={48} color={Colors.textLight} />
          <Text style={styles.noReportsText}>لم يتم إنشاء تقارير بعد</Text>
        </View>
      ) : (
        <View style={styles.reportsList}>
          {generatedReports.slice(0, 5).map((report) => (
            <View key={report.id} style={styles.reportItem}>
              <View style={styles.reportItemContent}>
                <Text style={styles.reportItemTitle} numberOfLines={1}>
                  {report.projectName}
                </Text>
                <Text style={styles.reportItemDate}>
                  {LocalizationService.formatDate(report.generatedAt)}
                </Text>
                <View style={styles.reportItemMeta}>
                  <Text style={styles.reportItemType}>
                    {report.type === 'comprehensive' ? 'شامل' :
                     report.type === 'summary' ? 'مختصر' : 'زيارة موقع'}
                  </Text>
                  <View style={[
                    styles.reportItemStatus,
                    { backgroundColor: 
                      report.status === 'ready' ? Colors.secondary + '20' :
                      report.status === 'generating' ? Colors.warning + '20' :
                      Colors.error + '20'
                    }
                  ]}>
                    <Text style={[
                      styles.reportItemStatusText,
                      { color: 
                        report.status === 'ready' ? Colors.secondary :
                        report.status === 'generating' ? Colors.warning :
                        Colors.error
                      }
                    ]}>
                      {report.status === 'ready' ? 'جاهز' :
                       report.status === 'generating' ? 'جاري الإنشاء' : 'فشل'}
                    </Text>
                  </View>
                </View>
              </View>
              
              {report.status === 'failed' && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => handleRetryReport(report)}
                >
                  <Ionicons name="refresh" size={16} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </Card>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyStateCard}>
      <Ionicons name="document-text-outline" size={64} color={Colors.textLight} />
      <Text style={styles.emptyStateTitle}>لا توجد مشاريع</Text>
      <Text style={styles.emptyStateMessage}>
        ابدأ بإنشاء مشروعك الأول لتتمكن من إنشاء التقارير.
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
          <Text style={styles.headerTitle}>التقارير والتحليلات</Text>
          <Text style={styles.headerSubtitle}>
            إنشاء ومشاركة التقارير الفنية
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Projects Overview */}
        {renderProjectsOverview()}

        {/* Report Types */}
        {renderReportTypes()}

        {/* Recent Reports */}
        {renderRecentReports()}

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

        {/* Projects List */}
        <Card style={styles.projectsListCard}>
          <Text style={styles.sectionTitle}>
            المشاريع المتاحة ({filteredProjects.length})
          </Text>
          
          {filteredProjects.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.projectsList}>
              {filteredProjects.map((project) => (
                <View key={project.id} style={styles.projectItem}>
                  <View style={styles.projectItemContent}>
                    <ProjectCard 
                      project={project}
                      onPress={() => {}}
                    />
                  </View>
                  <View style={styles.projectActions}>
                    <Button
                      onPress={() => handleGenerateReport(project.id)}
                      loading={loading[project.id]}
                      size="small"
                      style={styles.generateButton}
                    >
                      <Ionicons 
                        name="document-text-outline" 
                        size={16} 
                        color={Colors.textOnPrimary} 
                      />
                      <Text style={styles.generateButtonText}>إنشاء تقرير</Text>
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => {
                  alertConfig.onConfirm?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.alertButtonText}>موافق</Text>
              </TouchableOpacity>
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
  sectionTitle: {
    ...Typography.subheading,
    marginBottom: Spacing.md,
    textAlign: 'right',
    color: Colors.primary,
  },
  overviewCard: {
    marginBottom: Spacing.lg,
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
  reportTypesCard: {
    marginBottom: Spacing.lg,
  },
  reportTypes: {
    gap: Spacing.sm,
  },
  reportType: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  reportTypeSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  reportTypeContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  reportTypeTitle: {
    ...Typography.bodyMedium,
    textAlign: 'right',
  },
  reportTypeTextSelected: {
    color: Colors.textOnPrimary,
  },
  reportTypeDesc: {
    ...Typography.caption,
    textAlign: 'right',
    marginTop: 2,
  },
  reportTypeDescSelected: {
    color: Colors.textOnPrimary + 'CC',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  recentReportsCard: {
    marginBottom: Spacing.lg,
  },
  recentReportsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  clearReportsButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  clearReportsText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  noReportsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noReportsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  reportsList: {
    gap: Spacing.sm,
  },
  reportItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reportItemContent: {
    flex: 1,
  },
  reportItemTitle: {
    ...Typography.bodyMedium,
    textAlign: 'right',
    marginBottom: 4,
  },
  reportItemDate: {
    ...Typography.small,
    color: Colors.textLight,
    textAlign: 'right',
    marginBottom: 4,
  },
  reportItemMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reportItemType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reportItemStatus: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  reportItemStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  retryButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
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
  projectsListCard: {
    marginBottom: Spacing.lg,
  },
  projectsList: {
    gap: Spacing.md,
  },
  projectItem: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  projectItemContent: {
    marginBottom: Spacing.sm,
  },
  projectActions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  generateButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  generateButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
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
  alertButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  alertButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
});