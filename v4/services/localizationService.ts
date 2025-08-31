export class LocalizationService {
  // Core construction inspection terminology in Arabic
  private static translations = {
    // App Navigation & Core
    appTitle: 'أكاد للتفتيش الهندسي',
    projects: 'المشاريع',
    tasks: 'المهام',
    reports: 'التقارير',
    settings: 'الإعدادات',
    
    // Project Management
    createProject: 'إنشاء مشروع جديد',
    editProject: 'تعديل المشروع',
    projectName: 'اسم المشروع',
    projectDescription: 'وصف المشروع',
    projectLocation: 'موقع المشروع',
    projectManager: 'مدير المشروع',
    contractor: 'المقاول',
    clientName: 'اسم العميل',
    budget: 'الميزانية',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    projectStatus: 'حالة المشروع',
    
    // Construction Categories
    sitePreparation: 'تجهيز الموقع',
    foundationWork: 'أعمال الأساسات',
    structuralWork: 'الأعمال الإنشائية',
    concreteWork: 'أعمال الخرسانة',
    steelWork: 'أعمال الحديد',
    masonryWork: 'أعمال البناء',
    roofingWork: 'أعمال الأسقف',
    finishingWork: 'أعمال التشطيب',
    electricalWork: 'الأعمال الكهربائية',
    plumbingWork: 'أعمال السباكة',
    tilingWork: 'أعمال البلاط',
    paintingWork: 'أعمال الدهان',
    landscapingWork: 'أعمال تنسيق الحدائق',
    
    // Task Management
    addTask: 'إضافة مهمة',
    editTask: 'تعديل المهمة',
    taskTitle: 'عنوان المهمة',
    taskDescription: 'وصف المهمة',
    taskCategory: 'فئة المهمة',
    priority: 'الأولوية',
    highPriority: 'عالية',
    mediumPriority: 'متوسطة',
    lowPriority: 'منخفضة',
    taskStatus: 'حالة المهمة',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    pending: 'معلق',
    
    // Site Visit Form - Exact match to image
    siteVisitForm: 'زيارة موقعية',
    projectNumber: 'رقم المشروع',
    municipalProjectNumber: 'رقم المشروع البلدية',
    contractorName: 'اسم المقاول',
    consultantName: 'اسم الاستشاري',
    projectDuration: 'مدة التنفيذ',
    projectComponents: 'مكونات المشروع',
    visitDate: 'تاريخ الزيارة',
    inspector: 'المفتش',
    
    // Report Sections
    technicalReport: 'تقرير فني لضمان جودة الأعمال في الموقع',
    siteVisitObservations: 'ملاحظات زيارة الموقع',
    generalNotes: 'ملاحظات عامة',
    progressPercentage: 'نسبة الإنجاز',
    categoryProgress: 'تقدم الفئات',
    currentVisit: 'زيارة الموقع - 3 أشهر',
    previousVisit: 'زيارة الموقع السابقة',
    
    // Quality Assessment
    qualityAssessment: 'تقييم الجودة',
    safetyCompliance: 'الامتثال للسلامة',
    overallProgress: 'التقدم العام',
    workmanshipQuality: 'جودة التنفيذ',
    materialQuality: 'جودة المواد',
    
    // Evaluation Levels
    excellent: 'ممتاز',
    good: 'جيد',
    satisfactory: 'مرضي',
    needsImprovement: 'يحتاج تحسين',
    poor: 'ضعيف',
    
    // Actions
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    share: 'مشاركة',
    generateReport: 'إنشاء التقرير',
    exportPDF: 'تصدير PDF',
    
    // Status Messages
    projectCreated: 'تم إنشاء المشروع بنجاح',
    taskCompleted: 'تم إكمال المهمة',
    reportGenerated: 'تم إنشاء التقرير بنجاح',
    noProjectsFound: 'لا توجد مشاريع',
    noTasksFound: 'لا توجد مهام',
    
    // Construction Phases with exact Arabic terms
    phases: {
      sitePreparation: 'تجهيز الموقع',
      foundationWork: 'أعمال الأساسات', 
      structuralWork: 'الأعمال الإنشائية',
      finishingWork: 'أعمال التشطيب',
      landscaping: 'تنسيق الموقع'
    }
  };

  static t(key: string): string {
    return this.translations[key as keyof typeof this.translations] || key;
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static getConstructionCategories(): Array<{key: string, label: string}> {
    return [
      { key: 'sitePreparation', label: 'تجهيز الموقع' },
      { key: 'foundationWork', label: 'أعمال الأساسات' },
      { key: 'structuralWork', label: 'الأعمال الإنشائية' },
      { key: 'concreteWork', label: 'أعمال الخرسانة' },
      { key: 'steelWork', label: 'أعمال الحديد' },
      { key: 'masonryWork', label: 'أعمال البناء' },
      { key: 'roofingWork', label: 'أعمال الأسقف' },
      { key: 'finishingWork', label: 'أعمال التشطيب' },
      { key: 'electricalWork', label: 'الأعمال الكهربائية' },
      { key: 'plumbingWork', label: 'أعمال السباكة' },
      { key: 'tilingWork', label: 'أعمال البلاط' },
      { key: 'paintingWork', label: 'أعمال الدهان' },
      { key: 'landscapingWork', label: 'تنسيق الحدائق' }
    ];
  }
}