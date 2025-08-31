import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project } from '../types';

const PROJECTS_KEY = '@teyaseer_projects';
const SETTINGS_KEY = '@teyaseer_settings';

export class StorageService {
  static async getProjects(): Promise<Project[]> {
    try {
      const projectsJson = await AsyncStorage.getItem(PROJECTS_KEY);
      if (projectsJson) {
        const projects = JSON.parse(projectsJson);
        // Ensure all projects have required properties with proper defaults
        return projects.map((project: any) => ({
          ...project,
          siteVisits: project.siteVisits || [],
          tasks: project.tasks || [],
          phases: project.phases || [
            { id: 'prep', name: 'تجهيز الموقع', key: 'sitePreparation', progress: 0, status: 'notStarted', tasks: [] },
            { id: 'foundation', name: 'أعمال الأساسات', key: 'foundationWork', progress: 0, status: 'notStarted', tasks: [] },
            { id: 'structural', name: 'الأعمال الإنشائية', key: 'structuralWork', progress: 0, status: 'notStarted', tasks: [] },
            { id: 'finishing', name: 'أعمال التشطيب', key: 'finishingWork', progress: 0, status: 'notStarted', tasks: [] },
            { id: 'landscaping', name: 'تنسيق الموقع', key: 'landscaping', progress: 0, status: 'notStarted', tasks: [] }
          ],
          // Enhanced project fields
          projectNumber: project.projectNumber || `TEYASEER-${Date.now()}`,
          municipalProjectNumber: project.municipalProjectNumber || '',
          consultantName: project.consultantName || 'أكاد للاستشارات الهندسية - شركة التفحص الواحد م.م',
          projectType: project.projectType || 'residential',
          totalArea: project.totalArea || 0,
          buildingHeight: project.buildingHeight || 0,
          numberOfFloors: project.numberOfFloors || 1,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  static async saveProjects(projects: Project[]): Promise<void> {
    try {
      const projectsJson = JSON.stringify(projects);
      await AsyncStorage.setItem(PROJECTS_KEY, projectsJson);
    } catch (error) {
      console.error('Error saving projects:', error);
      throw new Error('فشل في حفظ المشاريع');
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PROJECTS_KEY, SETTINGS_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('فشل في مسح البيانات');
    }
  }

  // Enhanced storage methods for better data management
  static async exportData(): Promise<string> {
    try {
      const projects = await this.getProjects();
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      
      const exportData = {
        projects,
        settings: settings ? JSON.parse(settings) : {},
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('فشل في تصدير البيانات');
    }
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.projects) {
        await this.saveProjects(importData.projects);
      }
      
      if (importData.settings) {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(importData.settings));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('فشل في استيراد البيانات');
    }
  }
}