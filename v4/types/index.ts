export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiline';
  required: boolean;
  options?: string[]; // For select type
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
  category: 'project' | 'task' | 'siteVisit';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  phase: 'sitePreparation' | 'foundationWork' | 'structuralWork' | 'finishingWork' | 'landscaping';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  imageUri?: string;
  notes?: string;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  qualityRating?: number; // 1-5 stars
  materials?: string[];
  equipment?: string[];
  customFields?: { [fieldId: string]: any };
  
  // Enhanced task tracking
  startDate?: string;
  endDate?: string;
  dependencies?: string[]; // Task IDs that must be completed first
  location?: string;
  cost?: number;
  weather?: string;
  safetyNotes?: string;
  qualityChecks?: {
    id: string;
    name: string;
    passed: boolean;
    notes?: string;
    checkedAt: string;
    checkedBy: string;
  }[];
}

export interface SiteVisit {
  id: string;
  visitDate: string;
  inspector: string;
  contractorName: string;
  projectLocation: string;
  weatherConditions: string;
  overallProgress: number; // 0-100
  qualityRating: number; // 1-5
  safetyCompliance: 'excellent' | 'good' | 'satisfactory' | 'fair' | 'poor';
  notes: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  customFields?: { [fieldId: string]: any };
  
  // Enhanced site visit data
  temperature?: string;
  humidity?: string;
  workForceCount?: number;
  equipmentPresent?: string[];
  safetyObservations?: string;
  qualityObservations?: string;
  recommendedActions?: string[];
  nextVisitPlanned?: string;
  attendees?: {
    name: string;
    role: string;
    company: string;
    signature?: string;
  }[];
  
  // Progress by category
  categoryProgress?: {
    [category: string]: {
      current: number;
      previous: number;
      notes?: string;
    };
  };
  
  // Compliance checks
  complianceChecks?: {
    category: string;
    items: {
      description: string;
      status: 'compliant' | 'non-compliant' | 'not-applicable';
      notes?: string;
      correctionRequired?: string;
    }[];
  }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  siteVisits: SiteVisit[];
  createdAt: string;
  updatedAt: string;
  status: 'planning' | 'active' | 'completed' | 'onHold' | 'cancelled';
  customFields?: { [fieldId: string]: any };
  
  // Basic Info
  coverImage?: string;
  location?: string;
  contractor?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  budget?: number;
  clientName?: string;
  projectManager?: string;
  
  // Enhanced Project Data - matching report format
  projectNumber?: string;
  municipalProjectNumber?: string;
  consultantName?: string;
  projectDuration?: string;
  projectValue?: number;
  contractDate?: string;
  
  // Technical Details
  projectType?: 'residential' | 'commercial' | 'infrastructure' | 'industrial';
  totalArea?: number;
  buildingHeight?: number;
  numberOfFloors?: number;
  
  // Progress Tracking
  phases: ProjectPhase[];
  milestones?: Milestone[];
  
  // Quality & Safety
  qualityStandards?: string[];
  safetyRequirements?: string[];
  environmentalConsiderations?: string[];
  
  // Team Management
  team?: {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    company?: string;
  }[];
  
  // Document Management
  documents?: {
    id: string;
    name: string;
    type: 'drawing' | 'specification' | 'permit' | 'report' | 'other';
    uri: string;
    uploadedAt: string;
    uploadedBy: string;
  }[];
  
  // Financial Tracking
  financials?: {
    approvedBudget: number;
    spentAmount: number;
    pendingInvoices: number;
    changeOrders: {
      id: string;
      description: string;
      amount: number;
      status: 'pending' | 'approved' | 'rejected';
      dateRequested: string;
    }[];
  };
}

export interface ProjectPhase {
  id: string;
  name: string;
  key: string;
  startDate?: string;
  endDate?: string;
  progress: number; // 0-100
  status: 'notStarted' | 'inProgress' | 'completed' | 'delayed';
  tasks: string[]; // Task IDs
  dependencies?: string[]; // Phase IDs that must be completed first
  
  // Enhanced phase tracking
  budget?: number;
  actualCost?: number;
  qualityScore?: number; // 1-100
  safetyScore?: number; // 1-100
  notes?: string;
  milestones?: string[]; // Milestone IDs
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  importance: 'low' | 'medium' | 'high' | 'critical';
  
  // Enhanced milestone tracking
  dependencies?: string[]; // Task or Phase IDs
  deliverables?: string[];
  cost?: number;
  responsible?: string;
  notes?: string;
}

export interface ProjectFilter {
  status?: Project['status'];
  contractor?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  completionRange?: {
    min: number;
    max: number;
  };
  projectType?: Project['projectType'];
  budgetRange?: {
    min: number;
    max: number;
  };
  customFields?: { [fieldId: string]: any };
}

export interface TaskFilter {
  phase?: Task['phase'];
  priority?: Task['priority'];
  completed?: boolean;
  assignedTo?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  customFields?: { [fieldId: string]: any };
}

export interface ReportSettings {
  includeCoverImage: boolean;
  includeTaskImages: boolean;
  includeProgressCharts: boolean;
  includeQualityAssessment: boolean;
  includeSafetyNotes: boolean;
  includeRecommendations: boolean;
  includeCustomFields: boolean;
  includeTeamInfo: boolean;
  includeFinancials: boolean;
  reportLanguage: 'ar';
  reportFormat: 'comprehensive' | 'summary' | 'executive' | 'site-visit';
  
  // Advanced report options
  logoUri?: string;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
  watermark?: {
    text: string;
    opacity: number;
  };
  pageLayout: 'portrait' | 'landscape';
  fontFamily?: string;
  includeSignatures: boolean;
  includeQRCode: boolean;
}

export interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  currentLanguage: 'ar';
  setLanguage: (language: 'ar') => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'siteVisits' | 'phases'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  addSiteVisit: (projectId: string, siteVisit: Omit<SiteVisit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSiteVisit: (projectId: string, visitId: string, updates: Partial<SiteVisit>) => Promise<void>;
  deleteSiteVisit: (projectId: string, visitId: string) => Promise<void>;
  generatePDFReport: (projectId: string, settings?: ReportSettings) => Promise<string>;
  shareReport: (pdfUri: string, projectName: string) => Promise<void>;
  searchProjects: (query: string) => Project[];
  filterProjects: (filter: ProjectFilter) => Project[];
}