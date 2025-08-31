import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProjects } from '../../hooks/useProjects';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { StorageService } from '../../services/storageService';

export default function SettingsScreen() {
  const { projects } = useProjects();
  const [settings, setSettings] = useState({
    notifications: true,
    autoSync: true,
    offlineMode: false,
    dataBackup: true,
    reportLanguage: 'ar' as 'ar' | 'en',
    reportFormat: 'comprehensive' as 'comprehensive' | 'summary',
    imageQuality: 'high' as 'high' | 'medium' | 'low',
    autoSave: true,
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
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

  const handleExportData = async () => {
    setLoading(prev => ({ ...prev, export: true }));
    try {
      const exportData = await StorageService.exportData();
      
      if (Platform.OS === 'web') {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `acad_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      showAlert('تم التصدير', 'تم تصدير البيانات بنجاح!');
    } catch (error) {
      console.error('Export error:', error);
      showAlert('خطأ', 'فشل في تصدير البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const handleClearData = () => {
    showAlert(
      'حذف جميع البيانات',
      'هل أنت متأكد من حذف جميع المشاريع والبيانات؟ لا يمكن التراجع عن هذا الإجراء.',
      async () => {
        setLoading(prev => ({ ...prev, clear: true }));
        try {
          await StorageService.clearAllData();
          showAlert('تم الحذف', 'تم حذف جميع البيانات بنجاح!');
        } catch (error) {
          console.error('Clear error:', error);
          showAlert('خطأ', 'فشل في حذف البيانات. يرجى المحاولة مرة أخرى.');
        } finally {
          setLoading(prev => ({ ...prev, clear: false }));
        }
      }
    );
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => onToggle(!value)}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.textLight}
        ios_backgroundColor={Colors.border}
      />
    </TouchableOpacity>
  );

  const renderOptionItem = (
    icon: string,
    title: string,
    description: string,
    value: string,
    options: { value: string; label: string }[],
    onSelect: (value: string) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  value === option.value && styles.optionButtonSelected
                ]}
                onPress={() => onSelect(option.value)}
              >
                <Text style={[
                  styles.optionButtonText,
                  value === option.value && styles.optionButtonTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderActionItem = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void,
    loading?: boolean,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, danger && styles.dangerItem]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
        <Ionicons 
          name={loading ? "hourglass-outline" : icon as any} 
          size={24} 
          color={danger ? Colors.error : Colors.primary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Ionicons 
        name="chevron-back" 
        size={20} 
        color={danger ? Colors.error : Colors.textLight} 
      />
    </TouchableOpacity>
  );

  const renderAppInfo = () => (
    <Card style={styles.appInfoCard}>
      <View style={styles.appInfoHeader}>
        <View style={styles.appLogo}>
          <Text style={styles.appLogoText}>ACAD</Text>
        </View>
        <View style={styles.appInfoContent}>
          <Text style={styles.appName}>أكاد للتفتيش الهندسي</Text>
          <Text style={styles.appVersion}>الإصدار 1.0.0</Text>
          <Text style={styles.appDescription}>
            تطبيق احترافي لإدارة مشاريع التفتيش الهندسي وإنشاء التقارير الفنية
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{projects.length}</Text>
          <Text style={styles.statLabel}>المشاريع</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {projects.reduce((sum, p) => sum + p.tasks.length, 0)}
          </Text>
          <Text style={styles.statLabel}>المهام</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {projects.reduce((sum, p) => sum + (p.siteVisits?.length || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>الزيارات</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>الإعدادات</Text>
          <Text style={styles.headerSubtitle}>
            تخصيص التطبيق وإدارة البيانات
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        {renderAppInfo()}

        {/* General Settings */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>الإعدادات العامة</Text>
          
          {renderSettingItem(
            'notifications-outline',
            'الإشعارات',
            'تلقي إشعارات التطبيق والتذكيرات',
            settings.notifications,
            (value) => updateSetting('notifications', value)
          )}

          {renderSettingItem(
            'sync-outline',
            'المزامنة التلقائية',
            'مزامنة البيانات تلقائياً عند الاتصال',
            settings.autoSync,
            (value) => updateSetting('autoSync', value)
          )}

          {renderSettingItem(
            'cloud-offline-outline',
            'الوضع غير المتصل',
            'العمل بدون اتصال بالإنترنت',
            settings.offlineMode,
            (value) => updateSetting('offlineMode', value)
          )}

          {renderSettingItem(
            'save-outline',
            'الحفظ التلقائي',
            'حفظ التغييرات تلقائياً',
            settings.autoSave,
            (value) => updateSetting('autoSave', value)
          )}
        </Card>

        {/* Report Settings */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>إعدادات التقارير</Text>
          
          {renderOptionItem(
            'document-text-outline',
            'تنسيق التقرير الافتراضي',
            'النوع الافتراضي للتقارير المنشأة',
            settings.reportFormat,
            [
              { value: 'comprehensive', label: 'شامل' },
              { value: 'summary', label: 'مختصر' },
            ],
            (value) => updateSetting('reportFormat', value)
          )}

          {renderOptionItem(
            'image-outline',
            'جودة الصور',
            'جودة الصور في التقارير',
            settings.imageQuality,
            [
              { value: 'high', label: 'عالية' },
              { value: 'medium', label: 'متوسطة' },
              { value: 'low', label: 'منخفضة' },
            ],
            (value) => updateSetting('imageQuality', value)
          )}
        </Card>

        {/* Data Management */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>إدارة البيانات</Text>
          
          {renderActionItem(
            'download-outline',
            'تصدير البيانات',
            'تصدير جميع المشاريع والبيانات كنسخة احتياطية',
            handleExportData,
            loading.export
          )}

          {renderActionItem(
            'cloud-upload-outline',
            'استيراد البيانات',
            'استيراد البيانات من نسخة احتياطية',
            () => setShowImportModal(true)
          )}

          {renderActionItem(
            'trash-outline',
            'حذف جميع البيانات',
            'حذف جميع المشاريع والبيانات نهائياً',
            handleClearData,
            loading.clear,
            true
          )}
        </Card>

        {/* Support */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>الدعم والمساعدة</Text>
          
          {renderActionItem(
            'help-circle-outline',
            'مركز المساعدة',
            'الحصول على المساعدة والأسئلة الشائعة',
            () => showAlert('مركز المساعدة', 'سيتم توفير هذه الميزة قريباً.')
          )}

          {renderActionItem(
            'mail-outline',
            'اتصل بنا',
            'إرسال ملاحظات أو الإبلاغ عن مشكلة',
            () => showAlert('اتصل بنا', 'يمكنك التواصل معنا عبر: support@acad.com')
          )}

          {renderActionItem(
            'information-circle-outline',
            'حول التطبيق',
            'معلومات حول التطبيق والفريق',
            () => showAlert(
              'حول التطبيق', 
              'أكاد للتفتيش الهندسي\nتطبيق احترافي لإدارة مشاريع التفتيش الهندسي\n\nتم التطوير بواسطة فريق أكاد\nالإصدار 1.0.0'
            )
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
  appInfoCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  appInfoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  appLogo: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  appLogoText: {
    color: Colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  appInfoContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  appName: {
    ...Typography.subheading,
    color: Colors.primary,
  },
  appVersion: {
    ...Typography.caption,
    marginTop: 2,
  },
  appDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.heading,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 4,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subheading,
    marginBottom: Spacing.lg,
    textAlign: 'right',
    color: Colors.primary,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  settingContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  settingTitle: {
    ...Typography.bodyMedium,
    textAlign: 'right',
  },
  settingDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  optionsList: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  optionButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  optionButtonTextSelected: {
    color: Colors.textOnPrimary,
  },
  dangerItem: {
    backgroundColor: Colors.error + '05',
  },
  dangerIcon: {
    backgroundColor: Colors.error + '20',
  },
  dangerText: {
    color: Colors.error,
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
    lineHeight: 22,
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