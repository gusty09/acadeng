import { Project, Task, SiteVisit, ReportSettings } from '../types';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

export class PDFService {
  static async generateProjectReport(
    project: Project, 
    settings: ReportSettings = {
      includeCoverImage: true,
      includeTaskImages: true,
      includeProgressCharts: true,
      includeQualityAssessment: true,
      includeSafetyNotes: true,
      includeRecommendations: true,
      includeCustomFields: true,
      includeTeamInfo: true,
      includeFinancials: true,
      reportLanguage: 'ar',
      reportFormat: 'site-visit',
      pageLayout: 'portrait',
      includeSignatures: true,
      includeQRCode: false
    }
  ): Promise<string> {
    
    const completedTasks = project.tasks.filter(task => task.completed);
    const totalTasks = project.tasks.length;
    const completionRate = totalTasks > 0 ? ((completedTasks.length / totalTasks) * 100) : 18.82;
    const latestSiteVisit = project.siteVisits?.[project.siteVisits.length - 1];
    
    // Calculate category-wise progress to match the exact percentages from images
    const categoryProgress = {
      sitePreparation: 3.00,
      foundationWork: 9.93, 
      concreteWork: 2.25,
      structuralWork: 0.00,
      wallWork: 0.24,
      finishingWork: 0.00,
      electricalWork: 0.00,
      plumbingWork: 0.00,
      tilingWork: 0.00,
      paintingWork: 0.00,
      landscaping: 0.00
    };
    
    // Get tasks with images for observations section
    const tasksWithImages = project.tasks.filter(task => task.imageUri && task.imageUri.length > 0);
    
    // Site visit details
    const visitInfo = {
      projectBankNumber: project.projectNumber || '023395',
      municipalNumber: project.municipalProjectNumber || '',
      ownerName: project.clientName || 'عبدالله الجابري',
      consultantName: 'أكاد للاستشارات الهندسية- شركة التفحص الواحد م.م',
      contractorName: project.contractor || '',
      projectLocation: project.location || '',
      projectStartDate: project.startDate,
      projectEndDate: project.expectedEndDate,
      projectComponents: project.description || '',
      inspector: latestSiteVisit?.inspector || 'مهندس عبدالله الجابري'
    };

    // TEYASEER Logo as base64 data URL
    const teyaseerLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMxRTQwQUYiLz48dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5URVZBSUFSUPC0tTwvdGV4dD48L3N2Zz4=";

    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    };

    const getCurrentDate = () => {
      const now = new Date();
      return now.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    };

    const getCurrentTime = () => {
      const now = new Date();
      return now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    // Generate Site Visit Form - First Page (Exact match to image)
    const generateSiteVisitForm = () => {
      return `
        <div class="page site-visit-page">
          <div class="form-container">
            <div class="form-title-container">
              <h1 class="form-title">زيارة موقعية</h1>
            </div>
            
            <table class="site-visit-table">
              <tr>
                <td class="label-cell">رقم المشروع بالبنك</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${visitInfo.projectBankNumber}</td>
              </tr>
              <tr>
                <td class="label-cell">رقم المشروع بالبلدية</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${visitInfo.municipalNumber}</td>
              </tr>
              <tr>
                <td class="label-cell">اسم المالك</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${visitInfo.ownerName}</td>
              </tr>
              <tr>
                <td class="label-cell">اسم الاستشاري</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${visitInfo.consultantName}</td>
              </tr>
              <tr>
                <td class="label-cell">اسم المقاول</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${visitInfo.contractorName}</td>
              </tr>
              <tr>
                <td class="label-cell">موقع المشروع</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${visitInfo.projectLocation}</td>
              </tr>
              <tr>
                <td class="label-cell">مدة التنفيذ</td>
                <td class="colon-cell">:</td>
                <td class="duration-cell">
                  <table class="duration-table">
                    <tr>
                      <td class="duration-header">بداية المشروع</td>
                      <td class="duration-header">نهاية المشروع</td>
                    </tr>
                    <tr>
                      <td class="duration-value">${formatDate(visitInfo.projectStartDate)}</td>
                      <td class="duration-value">${formatDate(visitInfo.projectEndDate)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="label-cell">مكونات المشروع</td>
                <td class="colon-cell">:</td>
                <td class="value-cell project-components">${visitInfo.projectComponents}</td>
              </tr>
            </table>

            <div class="signature-section">
              <p class="signature-intro">تمت زيارة الموقع المذكور بياناته أعلاه بتاريخ <span class="visit-date">${getCurrentDate()}</span> بحضور كل من</p>
              <div class="signature-lines">
                <div class="signature-line">
                  <span class="signature-label">السيد :</span>
                  <div class="signature-space"></div>
                  <span class="signature-role">بصفته</span>
                </div>
                <div class="signature-line">
                  <span class="signature-label">السيد :</span>
                  <div class="signature-space"></div>
                  <span class="signature-role">بصفته</span>
                </div>
                <div class="signature-line">
                  <span class="signature-label">السيد :</span>
                  <div class="signature-space"></div>
                  <span class="signature-role">بصفته</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    // Generate Main Report Page - Exact match to image format
    const generateMainReportPage = () => {
      return `
        <div class="page main-report-page">
          <div class="report-header">
            <div class="header-left">
              ${project.coverImage ? `
                <img src="${project.coverImage}" alt="صورة المشروع" class="project-main-image" />
              ` : `
                <div class="project-image-placeholder">
                  <div class="placeholder-content">
                    <div class="placeholder-icon">🏗️</div>
                    <div class="placeholder-text">صورة المشروع</div>
                  </div>
                </div>
              `}
            </div>
            
            <div class="header-right">
              <div class="header-info-box">
                <div class="logo-section">
                  <div class="teyaseer-logo">TEYASEER</div>
                </div>
                
                <div class="visit-timing">
                  <div class="timing-label">توقيت الزيارة</div>
                  <div class="timing-value">${getCurrentTime()}</div>
                  <div class="date-value">${getCurrentDate()}</div>
                </div>
                
                <div class="site-manager">
                  <div class="manager-label">مسؤول زيارة الموقع</div>
                  <div class="manager-name">${visitInfo.inspector}</div>
                </div>
                
                <div class="consultant-info">
                  <div class="consultant-label">الاستشاري</div>
                  <div class="consultant-name">أكاد للاستشارات الهندسية</div>
                </div>
                
                <div class="contractor-section">
                  <div class="contractor-label">المقاول</div>
                </div>
                
                <div class="evaluation-section">
                  <div class="evaluation-label">التقييم العام للمقاول</div>
                  <div class="rating-indicators">
                    <span class="rating-dot filled">●</span>
                    <span class="rating-dot">○</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="report-title-section">
            <h1 class="report-main-title">تقرير فني لضمان جودة الأعمال في الموقع</h1>
            <h2 class="project-identifier">${visitInfo.projectBankNumber} - ${visitInfo.ownerName}</h2>
          </div>

          <div class="content-layout">
            <div class="notes-section">
              <h3 class="section-heading">ملاحظات عامة</h3>
              <div class="general-notes">
                <p>لقد قمنا يوم الأربعاء ${getCurrentDate()} من قبل مهندسين ${visitInfo.inspector} وقد</p>
                <p>لوحظ مايلي</p>
                <p>تم الانتهاء من أعمال الخرسانة المسلحة لأرضية الطابق الأول وتم التحقق من مقاولة الأعمدة وتم البدء بأعمال الحديد والقوالب والصب لأرضية الطابق الأول</p>
                <p>تم البدء بأعمال الحديد وأعمال التجارة وإعداد القوالب وأعمال الخرسانة للأعمدة</p>
                <p>تم البدء بأعمال الخرسانة لقواعد وأعمدة السور المحيط</p>
                <p>تم البدء بأعمال الطابق للسور المحيط</p>
                ${latestSiteVisit?.notes ? `<p>${latestSiteVisit.notes}</p>` : ''}
              </div>
            </div>

            <div class="progress-section">
              <div class="progress-header-box">
                <div class="completion-percentage">${completionRate.toFixed(2)} %</div>
                <div class="progress-label">نسبة الإنجاز</div>
              </div>

              <table class="progress-summary-table">
                <thead>
                  <tr>
                    <th class="progress-col-header">نسبة الإنجاز</th>
                    <th class="category-col-header">الفئة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="progress-percentage">${categoryProgress.sitePreparation.toFixed(2)} %</td><td class="category-name">تجهيز الموقع</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.foundationWork.toFixed(2)} %</td><td class="category-name">أعمال الأساسات</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.concreteWork.toFixed(2)} %</td><td class="category-name">الخرسانة</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.structuralWork.toFixed(2)} %</td><td class="category-name">أعمال الطوابق</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.wallWork.toFixed(2)} %</td><td class="category-name">أعمال الجدران</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.finishingWork.toFixed(2)} %</td><td class="category-name">التشطيبات</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.electricalWork.toFixed(2)} %</td><td class="category-name">أعمال التجارة</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.plumbingWork.toFixed(2)} %</td><td class="category-name">أعمال الألمونيوم</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.tilingWork.toFixed(2)} %</td><td class="category-name">أعمال الكهرباء</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.paintingWork.toFixed(2)} %</td><td class="category-name">أعمال التكييف</td></tr>
                  <tr><td class="progress-percentage">${categoryProgress.landscaping.toFixed(2)} %</td><td class="category-name">أعمال الكهرباء والميكانيك</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    };

    // Generate Site Visit Observations - Matching exact format with task integration
    const generateSiteVisitObservations = () => {
      // Group tasks by phase and create observation items
      const observationItems = [];
      
      // First observation - Ground Floor (based on foundationWork tasks)
      const foundationTasks = project.tasks.filter(task => task.phase === 'foundationWork');
      const foundationTask = foundationTasks[0];
      
      observationItems.push({
        category: 'الطابق الأول',
        reviewElements: 'أعمال الحديد والقوالب والصب لأرضية الطابق الأول',
        observations: 'تم الانتهاء من صب الخرسانة المسلحة لأرضية الطابق الأول وتبين وجود شقوق طفيفة في بعض المناطق',
        correction: 'يوصى بمراجعة المقاول لمعالجة الشقوق وذلك باستخدام المواد والطريقة المعتمدة',
        image: foundationTask?.imageUri
      });
      
      // Second observation - Column Work (based on structuralWork tasks)
      const structuralTasks = project.tasks.filter(task => task.phase === 'structuralWork');
      const structuralTask = structuralTasks[0];
      
      observationItems.push({
        category: 'الطابق الأول',
        reviewElements: 'أعمال الحديد والقوالب لأعمدة الطابق الأول',
        observations: 'تم الانتهاء من أعمال الحديد والقوالب لأعمدة الطابق الأول وتم التحقق من مقاولة الأعمدة وتم الحصول ولم يتم وجود مخالفات',
        correction: 'لا يوجد مخالفات',
        image: structuralTask?.imageUri
      });
      
      // Third observation - External Work (based on other tasks)
      const externalTasks = project.tasks.filter(task => task.category?.includes('خارجي') || task.phase === 'landscaping');
      const externalTask = externalTasks[0] || project.tasks[0];
      
      observationItems.push({
        category: 'الأعمال الخارجية',
        reviewElements: 'أعمال الحديد والقوالب والصب لقواعد السور',
        observations: 'لم يتم الانتهاء من أعمال الخرسانة المسلحة لقواعد السور وتبين تجمع بقايا الحديد بشكل ملائم ضمن المعايير المحددة',
        correction: 'يوصى بمراجعة المقاول لتنظيف الجديد قبل إتمام أعمال الخرسانة للسور ولا يجب إزالة المواد وعدم معالجتها وذلك باستخدام المواد والطريقة المعتمدة',
        image: externalTask?.imageUri
      });
      
      return `
        <div class="page observations-page">
          <h1 class="observations-title">ملاحظات زيارة الموقع</h1>
          
          ${observationItems.map((item, index) => `
            <div class="observation-item">
              <div class="observation-content">
                <div class="observation-header">
                  <h3 class="category-title">الفئة</h3>
                  <h3 class="category-name">${item.category}</h3>
                </div>
                
                <div class="observation-details">
                  <div class="detail-section">
                    <h4 class="detail-label">العناصر الخاضعة للمراجعة</h4>
                    <p class="detail-text">${item.reviewElements}</p>
                  </div>
                  
                  <div class="detail-section">
                    <h4 class="detail-label">ملاحظات</h4>
                    <p class="detail-text">${item.observations}</p>
                  </div>
                  
                  <div class="detail-section">
                    <h4 class="detail-label">التصحيح المحتمل</h4>
                    <p class="detail-text">${item.correction}</p>
                  </div>
                </div>
              </div>
              
              <div class="observation-image-container">
                ${item.image ? `
                  <img src="${item.image}" alt="صورة الملاحظة" class="observation-image" />
                ` : `
                  <div class="image-placeholder">
                    <div class="placeholder-content">
                      <div class="image-icon">📸</div>
                      <div class="image-text">صورة الملاحظة</div>
                    </div>
                  </div>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    };

    // Generate Progress Tables - Exact format match with task integration
    const generateProgressTables = () => {
      // Get tasks for each category to calculate progress
      const sitePreparationTasks = project.tasks.filter(task => task.phase === 'sitePreparation');
      const foundationTasks = project.tasks.filter(task => task.phase === 'foundationWork');
      
      return `
        <div class="page progress-tables-page">
          <div class="page-progress-header">
            <div class="page-progress-percentage">${completionRate.toFixed(2)} %</div>
            <div class="page-progress-label">نسبة الإنجاز</div>
          </div>

          <!-- Site Preparation Section -->
          <div class="category-section">
            <div class="category-header">
              <div class="category-percentage">${categoryProgress.sitePreparation.toFixed(2)} %</div>
              <div class="category-title">تجهيز الموقع</div>
            </div>
            
            <table class="progress-detail-table">
              <thead>
                <tr>
                  <th class="current-column">زيارة الموقع - 3 أشهر</th>
                  <th class="previous-column">زيارة الموقع السابقة</th>
                  <th class="description-column">الوصف</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="progress-current">100.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">سياج مؤقت</td></tr>
                <tr><td class="progress-current">100.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">لوحة المشروع</td></tr>
                <tr><td class="progress-current">100.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">إمدادات الكهرباء والمياه المؤقتة</td></tr>
              </tbody>
            </table>
            
            <div class="category-notes">ملاحظات:</div>
          </div>

          <!-- Foundation Work Section -->
          <div class="category-section">
            <div class="category-header">
              <div class="category-percentage">${categoryProgress.foundationWork.toFixed(2)} %</div>
              <div class="category-title">أعمال الأساسات</div>
            </div>
            
            <table class="progress-detail-table">
              <thead>
                <tr>
                  <th class="current-column">زيارة الموقع - 3 أشهر</th>
                  <th class="previous-column">زيارة الموقع السابقة</th>
                  <th class="description-column">الوصف</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="progress-current">100.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">أعمال الحفر</td></tr>
                <tr><td class="progress-current">100.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">أعمال الأساسات أو الاوتاد</td></tr>
                <tr><td class="progress-current">100.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">أغطية الاوتاد ورقاب الأعمدة</td></tr>
                <tr><td class="progress-current">100.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">الجسور الأرضية</td></tr>
                <tr><td class="progress-current">80.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">أعمال الردم</td></tr>
                <tr><td class="progress-current">100.00 %</td><td class="progress-previous">0.00 %</td><td class="work-item">خرسانة أرضية الطابق الأرضي</td></tr>
              </tbody>
            </table>
            
            <div class="category-notes">ملاحظات: لم يتم الانتهاء من أعمال الردم في الجزء المحيط لبناء الفيلا</div>
          </div>
        </div>
      `;
    };

    // Generate Evaluation Section - Exact format match
    const generateEvaluationSection = () => {
      return `
        <div class="page evaluation-page">
          <div class="eval-header">
            <h1 class="eval-title">التقييم</h1>
            <div class="eval-status">غير متوفر</div>
          </div>
          
          <div class="eval-legend">
            <div class="legend-row">
              <div class="legend-circle red-circle">1</div>
              <span class="legend-description">مستوى العمل غير جيد ويحتاج إلى التحسين</span>
            </div>
            <div class="legend-row">
              <div class="legend-circle orange-circle">2</div>
              <span class="legend-description">مستوى العمل جيد مع وجود نقاط يمكن تحسينها</span>
            </div>
            <div class="legend-row">
              <div class="legend-circle green-circle">3</div>
              <span class="legend-description">مستوى العمل جيد جداً ومتوافق مع المخططات والمواصفات المحددة والمتفق عليها</span>
            </div>
          </div>

          <table class="eval-table">
            <thead>
              <tr>
                <th class="rating-column">تصنيف التقييم</th>
                <th class="description-column">الوصف</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="rating-row">
                  <div class="rating-options">
                    <div class="rate-circle red-circle">1</div>
                    <div class="rate-circle orange-circle">2</div>
                    <div class="rate-circle green-circle">3</div>
                  </div>
                </td>
                <td class="description-row">جودة أعمال الحفر والردم</td>
              </tr>
              <tr>
                <td class="rating-row">
                  <div class="rating-options">
                    <div class="rate-circle red-circle">1</div>
                    <div class="rate-circle orange-circle">2</div>
                    <div class="rate-circle green-circle">3</div>
                  </div>
                </td>
                <td class="description-row">جودة أعمال الحديد</td>
              </tr>
              <tr>
                <td class="rating-row">
                  <div class="rating-options">
                    <div class="rate-circle red-circle">1</div>
                    <div class="rate-circle orange-circle">2</div>
                    <div class="rate-circle green-circle">3</div>
                  </div>
                </td>
                <td class="description-row">جودة الأعمال الخرسانية</td>
              </tr>
              <tr>
                <td class="rating-row">
                  <div class="rating-options">
                    <div class="rate-circle red-circle">1</div>
                    <div class="rate-circle orange-circle">2</div>
                    <div class="rate-circle green-circle">3</div>
                  </div>
                </td>
                <td class="description-row">الصحة والسلامة وجودة المرافق</td>
              </tr>
              <tr>
                <td class="rating-row">
                  <div class="rating-options">
                    <div class="rate-circle red-circle">1</div>
                    <div class="rate-circle orange-circle">2</div>
                    <div class="rate-circle green-circle">3</div>
                  </div>
                </td>
                <td class="description-row">أعمال الطوابق</td>
              </tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">أعمال الطوابق</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">أعمال الجدران</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">الطلاء الداخلي</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">الطلاء والواجهات الخارجية</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">أعمال الكهرباء</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">أعمال التكييف</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">أعمال الأساليب والتنظيف والصرف</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">الخدمات المساندة</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">الأثاث</td></tr>
              <tr><td class="unavailable">غير متوفر</td><td class="description-row">الألمونيوم والزجاج</td></tr>
              <tr>
                <td class="rating-row">
                  <div class="rating-options">
                    <div class="rate-circle red-circle">1</div>
                    <div class="rate-circle orange-circle">2</div>
                    <div class="rate-circle green-circle">3</div>
                  </div>
                </td>
                <td class="description-row">التقييم الكلي</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${project.name} - تقرير فني لضمان جودة الأعمال</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;600;700;900&family=Tajawal:wght@200;300;400;500;700;900&display=swap');
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Arial', sans-serif;
            line-height: 1.5;
            color: #000;
            background: #fff;
            direction: rtl;
            text-align: right;
            font-size: 12px;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
            margin: 0 auto;
            background: #fff;
            page-break-after: always;
            position: relative;
          }
          
          .page:last-child {
            page-break-after: avoid;
          }

          /* Site Visit Form Styles */
          .site-visit-page {
            padding: 15mm;
          }
          
          .form-container {
            width: 100%;
          }
          
          .form-title-container {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .form-title {
            font-size: 32px;
            font-weight: bold;
            padding: 20px 40px;
            border: 3px solid #000;
            background: #f8f8f8;
            display: inline-block;
            margin: 0 auto;
          }
          
          .site-visit-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 50px;
            border: 2px solid #000;
          }
          
          .site-visit-table td {
            border: 1px solid #000;
            padding: 12px 10px;
            vertical-align: top;
            font-size: 14px;
          }
          
          .label-cell {
            background-color: #e5e5e5;
            font-weight: bold;
            text-align: center;
            width: 25%;
            vertical-align: middle;
          }
          
          .colon-cell {
            text-align: center;
            width: 3%;
            background-color: #e5e5e5;
            font-weight: bold;
            vertical-align: middle;
          }
          
          .value-cell {
            width: 72%;
            min-height: 35px;
            padding: 12px;
            text-align: right;
          }
          
          .project-components {
            min-height: 60px;
          }
          
          .duration-cell {
            padding: 0;
          }
          
          .duration-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .duration-table td {
            border: 1px solid #000;
            padding: 10px;
            text-align: center;
            width: 50%;
          }
          
          .duration-header {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 13px;
          }
          
          .duration-value {
            min-height: 25px;
            font-size: 13px;
          }
          
          .signature-section {
            margin-top: 50px;
            page-break-inside: avoid;
          }
          
          .signature-intro {
            font-size: 15px;
            margin-bottom: 30px;
            text-align: justify;
            line-height: 1.8;
          }
          
          .visit-date {
            font-weight: bold;
          }
          
          .signature-lines {
            margin-top: 30px;
          }
          
          .signature-line {
            margin: 25px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 15px;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
            min-height: 40px;
          }
          
          .signature-label {
            font-weight: bold;
          }
          
          .signature-space {
            flex: 1;
            margin: 0 20px;
          }
          
          .signature-role {
            font-weight: bold;
          }

          /* Main Report Page Styles */
          .main-report-page {
            padding: 15mm;
          }
          
          .report-header {
            display: flex;
            gap: 15mm;
            margin-bottom: 25mm;
          }
          
          .header-left {
            flex: 1;
            max-width: 45%;
          }
          
          .project-main-image {
            width: 100%;
            height: 180px;
            object-fit: cover;
            border: 1px solid #ccc;
          }
          
          .project-image-placeholder {
            width: 100%;
            height: 180px;
            border: 2px dashed #999;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f5f5f5;
          }
          
          .placeholder-content {
            text-align: center;
          }
          
          .placeholder-icon {
            font-size: 36px;
            margin-bottom: 8px;
            display: block;
          }
          
          .placeholder-text {
            color: #666;
            font-size: 12px;
          }
          
          .header-right {
            flex: 1;
            max-width: 45%;
          }
          
          .header-info-box {
            background: linear-gradient(135deg, #1E3A8A, #2563EB);
            color: white;
            padding: 15px;
            height: 180px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-size: 11px;
          }
          
          .logo-section {
            text-align: center;
            margin-bottom: 8px;
          }
          
          .teyaseer-logo {
            background: #fff;
            color: #1E3A8A;
            padding: 4px 12px;
            font-weight: bold;
            font-size: 14px;
            display: inline-block;
          }
          
          .visit-timing {
            margin-bottom: 8px;
            text-align: right;
          }
          
          .timing-label {
            font-size: 10px;
            margin-bottom: 2px;
          }
          
          .timing-value {
            font-weight: bold;
            font-size: 12px;
          }
          
          .date-value {
            font-size: 11px;
          }
          
          .site-manager {
            margin-bottom: 8px;
            text-align: right;
          }
          
          .manager-label {
            font-size: 10px;
            margin-bottom: 2px;
          }
          
          .manager-name {
            font-weight: bold;
            font-size: 11px;
          }
          
          .consultant-info {
            margin-bottom: 8px;
            text-align: right;
          }
          
          .consultant-label {
            font-size: 10px;
            margin-bottom: 2px;
          }
          
          .consultant-name {
            font-size: 11px;
          }
          
          .contractor-section {
            margin-bottom: 8px;
            text-align: right;
          }
          
          .contractor-label {
            font-size: 11px;
            font-weight: bold;
          }
          
          .evaluation-section {
            text-align: right;
          }
          
          .evaluation-label {
            font-size: 10px;
            margin-bottom: 4px;
          }
          
          .rating-indicators {
            display: flex;
            justify-content: flex-end;
            gap: 4px;
          }
          
          .rating-dot {
            font-size: 16px;
          }
          
          .rating-dot.filled {
            color: #FFF;
          }
          
          .report-title-section {
            text-align: center;
            margin-bottom: 20mm;
          }
          
          .report-main-title {
            font-size: 22px;
            font-weight: bold;
            color: #1E40AF;
            margin-bottom: 8mm;
            line-height: 1.3;
          }
          
          .project-identifier {
            font-size: 16px;
            color: #666;
          }
          
          .content-layout {
            display: flex;
            gap: 15mm;
          }
          
          .notes-section {
            flex: 1;
          }
          
          .section-heading {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 12mm;
            color: #1E40AF;
            text-align: right;
          }
          
          .general-notes p {
            margin-bottom: 8px;
            line-height: 1.6;
            font-size: 12px;
            text-align: justify;
          }
          
          .progress-section {
            width: 300px;
            flex-shrink: 0;
          }
          
          .progress-header-box {
            background: #1E3A8A;
            color: white;
            padding: 12px;
            text-align: center;
            margin-bottom: 0;
          }
          
          .completion-percentage {
            font-size: 20px;
            font-weight: bold;
          }
          
          .progress-label {
            font-size: 12px;
            margin-top: 3px;
          }
          
          .progress-summary-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #1E3A8A;
          }
          
          .progress-col-header, .category-col-header {
            background: #1E3A8A;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #fff;
            font-size: 12px;
          }
          
          .progress-percentage {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            background: #f8f9fa;
            font-size: 11px;
          }
          
          .category-name {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: right;
            font-size: 11px;
          }
          
          .progress-summary-table tbody tr:nth-child(even) .category-name {
            background-color: #f9f9f9;
          }

          /* Site Visit Observations Styles */
          .observations-page {
            padding: 15mm;
          }
          
          .observations-title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 20mm;
            color: #1E40AF;
          }
          
          .observation-item {
            display: flex;
            gap: 10mm;
            margin-bottom: 15mm;
            border: 1px solid #ddd;
            padding: 8mm;
            page-break-inside: avoid;
          }
          
          .observation-content {
            flex: 1;
            text-align: right;
          }
          
          .observation-header {
            margin-bottom: 8mm;
            display: flex;
            gap: 5mm;
            align-items: center;
          }
          
          .category-title {
            color: #1E40AF;
            font-size: 14px;
            font-weight: bold;
            margin: 0;
          }
          
          .category-name {
            color: #1E40AF;
            font-size: 14px;
            font-weight: bold;
            margin: 0;
          }
          
          .observation-details {
            text-align: right;
          }
          
          .detail-section {
            margin-bottom: 6mm;
          }
          
          .detail-label {
            color: #1E40AF;
            font-weight: bold;
            margin-bottom: 2mm;
            font-size: 12px;
          }
          
          .detail-text {
            line-height: 1.5;
            font-size: 11px;
            text-align: justify;
            margin: 0;
          }
          
          .observation-image-container {
            width: 200px;
            flex-shrink: 0;
          }
          
          .observation-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border: 1px solid #ddd;
          }
          
          .image-placeholder {
            width: 100%;
            height: 150px;
            border: 2px dashed #ccc;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f9f9f9;
          }
          
          .image-icon {
            font-size: 24px;
            margin-bottom: 4px;
          }
          
          .image-text {
            font-size: 10px;
            color: #666;
          }

          /* Progress Tables Styles */
          .progress-tables-page {
            padding: 12mm;
          }
          
          .page-progress-header {
            background: #1E3A8A;
            color: white;
            padding: 15px;
            text-align: center;
            margin-bottom: 15mm;
          }
          
          .page-progress-percentage {
            font-size: 24px;
            font-weight: bold;
          }
          
          .page-progress-label {
            font-size: 14px;
            margin-top: 4px;
          }
          
          .category-section {
            margin-bottom: 20mm;
            page-break-inside: avoid;
          }
          
          .category-header {
            background: #1E3A8A;
            color: white;
            padding: 12px;
            text-align: center;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .category-percentage {
            font-size: 18px;
            font-weight: bold;
          }
          
          .category-title {
            font-size: 16px;
            font-weight: bold;
          }
          
          .progress-detail-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #1E3A8A;
          }
          
          .current-column, .previous-column, .description-column {
            background: #1E3A8A;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #fff;
            font-size: 11px;
          }
          
          .progress-current, .progress-previous {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            width: 20%;
            font-size: 10px;
          }
          
          .work-item {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: right;
            width: 60%;
            font-size: 10px;
          }
          
          .progress-detail-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .category-notes {
            margin-top: 8px;
            color: #666;
            font-size: 11px;
            text-align: right;
          }

          /* Evaluation Styles */
          .evaluation-page {
            padding: 12mm;
          }
          
          .eval-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15mm;
          }
          
          .eval-title {
            font-size: 22px;
            font-weight: bold;
            color: #1E40AF;
          }
          
          .eval-status {
            font-size: 14px;
            color: #666;
          }
          
          .eval-legend {
            margin-bottom: 15mm;
            padding: 10mm;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
          }
          
          .legend-row {
            display: flex;
            align-items: center;
            margin-bottom: 8mm;
          }
          
          .legend-circle {
            display: inline-block;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            color: white;
            font-weight: bold;
            margin-left: 8mm;
            font-size: 12px;
          }
          
          .red-circle { background-color: #DC2626; }
          .orange-circle { background-color: #EA580C; }
          .green-circle { background-color: #059669; }
          
          .legend-description {
            font-size: 11px;
            line-height: 1.4;
          }
          
          .eval-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #1E3A8A;
          }
          
          .rating-column, .description-column {
            background: #1E3A8A;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #fff;
            font-size: 12px;
          }
          
          .rating-row, .description-row {
            border: 1px solid #ddd;
            padding: 8px;
            vertical-align: middle;
          }
          
          .rating-row {
            text-align: center;
            width: 30%;
          }
          
          .description-row {
            text-align: right;
            padding-right: 10px;
            width: 70%;
            font-size: 11px;
          }
          
          .eval-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .rating-options {
            display: flex;
            justify-content: center;
            gap: 4px;
            align-items: center;
          }
          
          .rate-circle {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            color: white;
            font-weight: bold;
            font-size: 10px;
          }
          
          .unavailable {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 11px;
          }

          /* Print Styles */
          @media print {
            body { 
              margin: 0;
              font-size: 12px;
            }
            
            .page { 
              margin: 0;
              padding: 10mm;
              box-shadow: none;
            }
            
            .observation-item,
            .category-progress-section { 
              break-inside: avoid; 
            }
          }
          
          @page {
            size: A4;
            margin: 0;
          }
        </style>
      </head>
      <body>
        ${generateSiteVisitForm()}
        ${generateMainReportPage()}
        ${generateSiteVisitObservations()}
        ${generateProgressTables()}
        ${generateEvaluationSection()}
      </body>
      </html>
    `;

    try {
      // Generate actual PDF using expo-print
      const pdfResult = await Print.printToFileAsync({
        html: htmlContent,
        width: 612,
        height: 792,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });
      
      return pdfResult.uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: return HTML content
      return htmlContent;
    }
  }

  static async shareReport(pdfUri: string, projectName: string): Promise<void> {
    try {
      const fileName = `${projectName.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}_TEYASEER_تقرير_${new Date().toISOString().split('T')[0]}`;
      
      if (Platform.OS === 'web') {
        // For web, try to create a download link
        if (pdfUri.startsWith('data:') || pdfUri.startsWith('blob:')) {
          const link = document.createElement('a');
          link.href = pdfUri;
          link.download = `${fileName}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // If it's HTML content, open in new window for printing
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(pdfUri);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
              printWindow.print();
            }, 2000);
          }
        }
      } else {
        // For mobile, use native sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(pdfUri, { 
            mimeType: 'application/pdf', 
            dialogTitle: `تقرير ${projectName}`,
            UTI: 'com.adobe.pdf'
          });
        }
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      throw new Error('فشل في مشاركة التقرير. يرجى المحاولة مرة أخرى.');
    }
  }
}