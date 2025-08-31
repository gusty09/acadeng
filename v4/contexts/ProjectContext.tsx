import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Project, Task, SiteVisit, ProjectContextType, ProjectFilter, TaskFilter } from '../types';
import { StorageService } from '../services/storageService';
import { PDFService } from '../services/pdfService';

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'ar'>('ar');

  // Load projects on app start
  useEffect(() => {
    loadProjects();
  }, []);

  const setLanguage = async (language: 'ar') => {
    setCurrentLanguage(language);
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedProjects = await StorageService.getProjects();
      // Ensure all projects have siteVisits array
      const updatedProjects = loadedProjects.map(project => ({
        ...project,
        siteVisits: project.siteVisits || [],
      }));
      setProjects(updatedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل المشاريع');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProjects = async (newProjects: Project[]) => {
    try {
      await StorageService.saveProjects(newProjects);
      setProjects(newProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حفظ المشاريع');
      throw err;
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'siteVisits' | 'phases'>) => {
    try {
      const newProject: Project = {
        ...projectData,
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        siteVisits: [],
        phases: [
          { id: 'prep', name: 'تجهيز الموقع', key: 'sitePreparation', progress: 0, status: 'notStarted', tasks: [] },
          { id: 'foundation', name: 'أعمال الأساسات', key: 'foundationWork', progress: 0, status: 'notStarted', tasks: [] },
          { id: 'structural', name: 'الأعمال الإنشائية', key: 'structuralWork', progress: 0, status: 'notStarted', tasks: [] },
          { id: 'finishing', name: 'أعمال التشطيب', key: 'finishingWork', progress: 0, status: 'notStarted', tasks: [] },
          { id: 'landscaping', name: 'تنسيق الموقع', key: 'landscaping', progress: 0, status: 'notStarted', tasks: [] }
        ],
        tasks: [],
      };

      const updatedProjects = [...projects, newProject];
      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProjects = projects.map(project =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      );
      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const updatedProjects = projects.filter(project => project.id !== id);
      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const addTask = async (projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask: Task = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: [...project.tasks, newTask],
              updatedAt: new Date().toISOString(),
            }
          : project
      );

      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      );

      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    try {
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.filter(task => task.id !== taskId),
              updatedAt: new Date().toISOString(),
            }
          : project
      );

      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const addSiteVisit = async (projectId: string, siteVisitData: Omit<SiteVisit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSiteVisit: SiteVisit = {
        ...siteVisitData,
        id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              siteVisits: [...(project.siteVisits || []), newSiteVisit],
              updatedAt: new Date().toISOString(),
            }
          : project
      );

      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error adding site visit:', err);
      throw err;
    }
  };

  const updateSiteVisit = async (projectId: string, visitId: string, updates: Partial<SiteVisit>) => {
    try {
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              siteVisits: (project.siteVisits || []).map(visit =>
                visit.id === visitId 
                  ? { ...visit, ...updates, updatedAt: new Date().toISOString() } 
                  : visit
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      );

      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error updating site visit:', err);
      throw err;
    }
  };

  const deleteSiteVisit = async (projectId: string, visitId: string) => {
    try {
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              siteVisits: (project.siteVisits || []).filter(visit => visit.id !== visitId),
              updatedAt: new Date().toISOString(),
            }
          : project
      );

      await saveProjects(updatedProjects);
    } catch (err) {
      console.error('Error deleting site visit:', err);
      throw err;
    }
  };

  const searchProjects = (query: string): Project[] => {
    if (!query.trim()) return projects;

    const lowercaseQuery = query.toLowerCase();
    return projects.filter(project =>
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.location?.toLowerCase().includes(lowercaseQuery) ||
      project.contractor?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filterProjects = (filter: ProjectFilter): Project[] => {
    return projects.filter(project => {
      if (filter.status && project.status !== filter.status) return false;
      
      if (filter.contractor && project.contractor !== filter.contractor) return false;
      
      if (filter.dateRange) {
        const projectDate = new Date(project.createdAt);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        if (projectDate < startDate || projectDate > endDate) return false;
      }
      
      if (filter.completionRange) {
        const completedTasks = project.tasks.filter(task => task.completed).length;
        const totalTasks = project.tasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        if (completionRate < filter.completionRange.min || completionRate > filter.completionRange.max) {
          return false;
        }
      }
      
      return true;
    });
  };

  const generatePDFReport = async (projectId: string): Promise<string> => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('المشروع غير موجود');
      }

      return await PDFService.generateProjectReport(project);
    } catch (err) {
      console.error('Error generating PDF:', err);
      throw err;
    }
  };

  const shareReport = async (pdfUri: string, projectName: string): Promise<void> => {
    try {
      await PDFService.shareReport(pdfUri, projectName);
    } catch (err) {
      console.error('Error sharing report:', err);
      throw err;
    }
  };

  const value: ProjectContextType = {
    projects,
    loading,
    error,
    currentLanguage,
    setLanguage,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addSiteVisit,
    updateSiteVisit,
    deleteSiteVisit,
    generatePDFReport,
    shareReport,
    searchProjects,
    filterProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}