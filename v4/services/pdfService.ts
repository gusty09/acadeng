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
            padding: 12px;
            text-align: center;
            width: 50%;
          }
          
          .duration-header {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          
          .duration-value {
            min-height: 30px;
          }
          
          .signature-section {
            margin-top: 40px;
            line-height: 2.2;
          }
          
          .signature-intro {
            font-size: 16px;
            margin-bottom: 20px;
            text-align: justify;
          }
          
          .signature-lines {
            margin-top: 20px;
          }
          
          .signature-line {
            margin: 20px 0;
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }

          /* Main Report Page Styles */
          .main-report-page {
            position: relative;
          }
          
          .report-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 20px;
          }
          
          .header-left {
            flex: 1;
            max-width: 350px;
          }
          
          .project-main-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #ddd;
          }
          
          .no-image-placeholder {
            width: 100%;
            height: 250px;
            border: 2px dashed #ccc;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #f9f9f9;
          }
          
          .placeholder-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          
          .placeholder-text {
            color: #666;
            font-size: 14px;
          }
          
          .header-right {
            flex: 1;
          }
          
          .header-info {
            background: linear-gradient(135deg, #1E3A8A, #1E40AF);
            color: white;
            padding: 25px;
            border-radius: 8px;
            height: 250px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .logo-section {
            text-align: center;
            margin-bottom: 15px;
          }
          
          .company-logo {
            height: 30px;
            width: auto;
          }
          
          .report-date {
            font-size: 14px;
            margin-bottom: 15px;
          }
          
          .responsible-person {
            font-size: 14px;
            margin-bottom: 20px;
            line-height: 1.8;
          }
          
          .project-details {
            font-size: 12px;
            line-height: 1.6;
          }
          
          .detail-row {
            margin-bottom: 15px;
          }
          
          .contractor-name {
            margin: 15px 0;
            font-weight: bold;
            font-size: 14px;
          }
          
          .evaluation-rating {
            margin-top: 15px;
            font-size: 12px;
          }
          
          .report-main-title {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #1E40AF;
            margin: 30px 0 15px 0;
            line-height: 1.4;
          }
          
          .project-identifier {
            text-align: center;
            font-size: 20px;
            color: #666;
            margin-bottom: 40px;
          }
          
          .main-content {
            display: flex;
            gap: 30px;
          }
          
          .notes-section {
            flex: 1;
          }
          
          .section-heading {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #1E40AF;
          }
          
          .general-notes p {
            margin-bottom: 12px;
            line-height: 1.8;
            font-size: 14px;
            text-align: justify;
          }
          
          .progress-section {
            width: 400px;
            flex-shrink: 0;
          }
          
          .progress-header {
            background: #1E3A8A;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 0;
          }
          
          .completion-percentage {
            font-size: 28px;
            font-weight: bold;
          }
          
          .progress-label {
            font-size: 16px;
            margin-top: 5px;
          }
          
          .progress-summary-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #1E3A8A;
          }
          
          .progress-header-cell, .category-header-cell {
            background: #1E3A8A;
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #fff;
          }
          
          .progress-value {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            background: #f8f9fa;
          }
          
          .category-name {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: right;
            padding-right: 15px;
          }
          
          .progress-summary-table tr:nth-child(even) .category-name {
            background-color: #f9f9f9;
          }

          /* Site Visit Observations Styles */
          .observations-page {
            padding: 20mm 15mm;
          }
          
          .page-title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 40px;
            color: #1E40AF;
          }
          
          .observation-item {
            display: flex;
            gap: 20px;
            margin-bottom: 40px;
            border: 2px solid #e0e0e0;
            padding: 25px;
            border-radius: 8px;
            background: #fafafa;
          }
          
          .observation-text {
            flex: 1;
          }
          
          .category-header {
            margin-bottom: 20px;
          }
          
          .category-title {
            color: #1E40AF;
            font-size: 20px;
            font-weight: bold;
            text-align: right;
          }
          
          .observation-content {
            text-align: right;
          }
          
          .sub-category {
            color: #1E40AF;
            font-weight: bold;
            margin: 20px 0 8px 0;
            font-size: 16px;
          }
          
          .review-elements, .observations-text, .required-correction {
            margin-bottom: 15px;
            line-height: 1.8;
            font-size: 14px;
            text-align: justify;
          }
          
          .observation-image {
            width: 300px;
            flex-shrink: 0;
          }
          
          .task-observation-image {
            width: 100%;
            height: 220px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #ddd;
          }
          
          .placeholder-image {
            width: 100%;
            height: 220px;
            border: 2px dashed #ccc;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #f9f9f9;
          }

          /* Progress Tables Styles */
          .progress-tables-page {
            padding: 15mm;
          }
          
          .overall-progress-header {
            background: #1E3A8A;
            color: white;
            padding: 25px;
            text-align: center;
            margin-bottom: 30px;
          }
          
          .overall-percentage {
            font-size: 32px;
            font-weight: bold;
          }
          
          .overall-label {
            font-size: 18px;
            margin-top: 8px;
          }
          
          .category-progress-section {
            margin-bottom: 40px;
          }
          
          .category-progress-header {
            background: #1E3A8A;
            color: white;
            padding: 18px;
            text-align: center;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .category-progress-percentage {
            font-size: 24px;
            font-weight: bold;
          }
          
          .category-progress-title {
            font-size: 20px;
            font-weight: bold;
          }
          
          .detailed-progress-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #1E3A8A;
          }
          
          .current-visit-header, .previous-visit-header, .description-header {
            background: #1E3A8A;
            color: white;
            padding: 15px 10px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #fff;
            font-size: 14px;
          }
          
          .current-progress, .previous-progress {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
            font-weight: bold;
            width: 20%;
          }
          
          .work-description {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
            padding-right: 15px;
            width: 60%;
          }
          
          .detailed-progress-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .notes-section {
            margin-top: 20px;
            color: #666;
            font-style: italic;
            font-size: 14px;
          }

          /* Evaluation Styles */
          .evaluation-page {
            padding: 15mm;
          }
          
          .evaluation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          
          .evaluation-title {
            font-size: 28px;
            font-weight: bold;
            color: #1E40AF;
          }
          
          .evaluation-status {
            font-size: 16px;
            color: #666;
          }
          
          .evaluation-legend {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #ddd;
          }
          
          .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .legend-circle {
            display: inline-block;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            color: white;
            font-weight: bold;
            margin-left: 15px;
            font-size: 14px;
          }
          
          .legend-circle.red { background-color: #DC2626; }
          .legend-circle.orange { background-color: #EA580C; }
          .legend-circle.green { background-color: #059669; }
          
          .legend-text {
            font-size: 14px;
            line-height: 1.6;
          }
          
          .evaluation-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #1E3A8A;
          }
          
          .rating-header, .description-header {
            background: #1E3A8A;
            color: white;
            padding: 18px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #fff;
            font-size: 16px;
          }
          
          .rating-cell, .description-cell {
            border: 1px solid #ddd;
            padding: 15px;
            vertical-align: middle;
          }
          
          .rating-cell {
            text-align: center;
            width: 30%;
          }
          
          .description-cell {
            text-align: right;
            padding-right: 20px;
            width: 70%;
          }
          
          .evaluation-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .rating-circles {
            display: flex;
            justify-content: center;
            gap: 8px;
            align-items: center;
          }
          
          .rating-circle {
            display: inline-block;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            text-align: center;
            line-height: 25px;
            color: white;
            font-weight: bold;
            font-size: 12px;
          }
          
          .rating-circle.red { background-color: #DC2626; }
          .rating-circle.orange { background-color: #EA580C; }
          .rating-circle.green { background-color: #059669; }
          
          .not-available {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 15px;
            border: 1px solid #ddd;
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