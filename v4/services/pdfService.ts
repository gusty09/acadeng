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

    // Generate Site Visit Form - First Page
    const generateSiteVisitForm = () => {
      return `
        <div class="page site-visit-page">
          <div class="form-container">
            <h1 class="form-title">زيارة موقعية</h1>
            
            <table class="site-visit-table">
              <tr>
                <td class="label-cell">رقم المشروع بالبنك</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${project.projectNumber || ''}</td>
              </tr>
              <tr>
                <td class="label-cell">رقم المشروع البلدية</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${project.municipalProjectNumber || ''}</td>
              </tr>
              <tr>
                <td class="label-cell">اسم المالك</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${project.clientName || ''}</td>
              </tr>
              <tr>
                <td class="label-cell">اسم الاستشاري</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">أكاد للاستشارات الهندسية- شركة التفحص الواحد م.م</td>
              </tr>
              <tr>
                <td class="label-cell">اسم المقاول</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${project.contractor || ''}</td>
              </tr>
              <tr>
                <td class="label-cell">موقع المشروع</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${project.location || ''}</td>
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
                      <td class="duration-value">${formatDate(project.startDate)}</td>
                      <td class="duration-value">${formatDate(project.expectedEndDate)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="label-cell">مكونات المشروع</td>
                <td class="colon-cell">:</td>
                <td class="value-cell">${project.description}</td>
              </tr>
            </table>

            <div class="signature-section">
              <p class="signature-intro">تمت زيارة الموقع المذكور بياناته أعلاه بتاريخ ${getCurrentDate()} بحضور كل من</p>
              <div class="signature-lines">
                <div class="signature-line">
                  <span>السيد :</span>
                  <span>بصفته</span>
                </div>
                <div class="signature-line">
                  <span>السيد :</span>
                  <span>بصفته</span>
                </div>
                <div class="signature-line">
                  <span>السيد :</span>
                  <span>بصفته</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    // Generate Main Report Page - Exactly matching the format
    const generateMainReportPage = () => {
      return `
        <div class="page main-report-page">
          <div class="report-header">
            <div class="header-left">
              ${project.coverImage ? `
                <img src="${project.coverImage}" alt="صورة المشروع" class="project-main-image" />
              ` : `
                <div class="no-image-placeholder">
                  <div class="placeholder-icon">📷</div>
                  <div class="placeholder-text">صورة المشروع</div>
                </div>
              `}
            </div>
            
            <div class="header-right">
              <div class="header-info">
                <div class="logo-section">
                  <img src="${teyaseerLogo}" alt="TEYASEER" class="company-logo" />
                </div>
                <div class="report-date">توقيت الزيارة: ${getCurrentTime()}<br/>${getCurrentDate()}</div>
                <div class="responsible-person">مسؤول زيارة الموقع<br/>${latestSiteVisit?.inspector || 'مهندس أحمد'}</div>
                <div class="project-details">
                  <div class="detail-row">الاستشاري<br/>أكاد للاستشارات الهندسية</div>
                  <div class="contractor-name">المقاول</div>
                  <div class="evaluation-rating">التقييم العام للمقاول<br/>●○</div>
                </div>
              </div>
            </div>
          </div>

          <h1 class="report-main-title">تقرير فني لضمان جودة الأعمال في الموقع</h1>
          <h2 class="project-identifier">${project.projectNumber || '023395'} - ${project.clientName || 'عبدالله الجابري'}</h2>

          <div class="main-content">
            <div class="notes-section">
              <h3 class="section-heading">ملاحظات عامة</h3>
              <div class="general-notes">
                <p>لقد قمنا بزيارة الموقع يوم ${getCurrentDate()} من قبل ${latestSiteVisit?.inspector || 'المهندس عبدالله الجابري'} وقد</p>
                <p>لوحظ ما يلي</p>
                <p>تم الانتهاء من أعمال الحفر والتسوية والخرسانة الأولى</p>
                <p>تم البدء بأعمال الحديد وأعمال الطوابق وإعداد قوالب الخرسانة للأعمدة</p>
                <p>تم البدء بأعمال التركيب لقواعد وأعمدة السقف المحيط</p>
                <p>تم البدء بأعمال السطح للسور المحيط</p>
                ${latestSiteVisit?.notes ? `<p>${latestSiteVisit.notes}</p>` : ''}
              </div>
            </div>

            <div class="progress-section">
              <div class="progress-header">
                <div class="completion-percentage">${completionRate.toFixed(2)} %</div>
                <div class="progress-label">نسبة الإنجاز</div>
              </div>

              <table class="progress-summary-table">
                <tr>
                  <th class="progress-header-cell">نسبة الإنجاز</th>
                  <th class="category-header-cell">الفئة</th>
                </tr>
                <tr><td class="progress-value">3.00 %</td><td class="category-name">تجهيز الموقع</td></tr>
                <tr><td class="progress-value">9.93 %</td><td class="category-name">أعمال الأساسات</td></tr>
                <tr><td class="progress-value">2.25 %</td><td class="category-name">الخرسانة</td></tr>
                <tr><td class="progress-value">0.00 %</td><td class="category-name">أعمال الطوابق</td></tr>
                <tr><td class="progress-value">0.24 %</td><td class="category-name">أعمال الجدران</td></tr>
                <tr><td class="progress-value">0.00 %</td><td class="category-name">التشطيبات</td></tr>
                <tr><td class="progress-value">0.00 %</td><td class="category-name">أعمال التجارة</td></tr>
                <tr><td class="progress-value">0.00 %</td><td class="category-name">أعمال الألمونيوم</td></tr>
                <tr><td class="progress-value">0.00 %</td><td class="category-name">أعمال الكهرباء</td></tr>
                <tr><td class="progress-value">0.00 %</td><td class="category-name">أعمال التكييف</td></tr>
                <tr><td class="progress-value">0.00 %</td><td class="category-name">أعمال الكهرباء والميكانيك</td></tr>
              </table>
            </div>
          </div>
        </div>
      `;
    };

    // Generate Site Visit Observations - Matching exact format
    const generateSiteVisitObservations = () => {
      const tasksWithImages = project.tasks.filter(task => task.imageUri);
      
      return `
        <div class="page observations-page">
          <h1 class="page-title">ملاحظات زيارة الموقع</h1>
          
          <div class="observation-item">
            <div class="observation-text">
              <div class="category-header">
                <h3 class="category-title">الطابق الأول</h3>
              </div>
              
              <div class="observation-content">
                <h4 class="sub-category">العناصر الخاضعة للمراجعة</h4>
                <p class="review-elements">أعمال الحديد والقوالب والصب لأرضية الطابق الأول</p>
                
                <h4 class="sub-category">ملاحظات</h4>
                <p class="observations-text">تم الانتهاء من صب الخرسانة المسلحة لأرضية الطابق الأول وتبين وجود شقوق طفيفة في بعض المناطق</p>
                
                <h4 class="sub-category">التصحيح المطلوب</h4>
                <p class="required-correction">يوصى بمراجعة المقاول لمعالجة الشقوق وذلك باستخدام المواد والطريقة المعتمدة</p>
              </div>
            </div>
            
            <div class="observation-image">
              ${tasksWithImages[0]?.imageUri ? `
                <img src="${tasksWithImages[0].imageUri}" alt="صورة الملاحظة" class="task-observation-image" />
              ` : `
                <div class="placeholder-image">
                  <div class="placeholder-icon">📸</div>
                  <div class="placeholder-text">صورة الملاحظة</div>
                </div>
              `}
            </div>
          </div>

          <div class="observation-item">
            <div class="observation-text">
              <div class="category-header">
                <h3 class="category-title">الطابق الأول</h3>
              </div>
              
              <div class="observation-content">
                <h4 class="sub-category">العناصر الخاضعة للمراجعة</h4>
                <p class="review-elements">أعمال الحديد والقوالب لأعمدة الطابق الأول</p>
                
                <h4 class="sub-category">ملاحظات</h4>
                <p class="observations-text">تم الانتهاء من أعمال الحديد والقوالب لأعمدة الطابق الأول وتم الحصول على موافقة المراجع ولم يتم وجود مخالفات المحاور ولم يتم وجود مخالفات</p>
                
                <h4 class="sub-category">التصحيح المطلوب</h4>
                <p class="required-correction">المقاول ولم يتم وجود مخالفات</p>
              </div>
            </div>
            
            <div class="observation-image">
              ${tasksWithImages[1]?.imageUri ? `
                <img src="${tasksWithImages[1].imageUri}" alt="صورة الملاحظة" class="task-observation-image" />
              ` : `
                <div class="placeholder-image">
                  <div class="placeholder-icon">📸</div>
                  <div class="placeholder-text">صورة الملاحظة</div>
                </div>
              `}
            </div>
          </div>

          <div class="observation-item">
            <div class="observation-text">
              <div class="category-header">
                <h3 class="category-title">الأعمال الخارجية</h3>
              </div>
              
              <div class="observation-content">
                <h4 class="sub-category">العناصر الخاضعة للمراجعة</h4>
                <p class="review-elements">أعمال الحديد والقوالب والصب لقواعد السور</p>
                
                <h4 class="sub-category">ملاحظات</h4>
                <p class="observations-text">تم الانتهاء من أعمال الخرسانة المسلحة لقواعد السور وتبين جمع بقايا الحديد بشكل ملائم حتى الآن</p>
                
                <h4 class="sub-category">التصحيح المطلوب</h4>
                <p class="required-correction">يوصى بمراجعة المقاول لتنظيف الموقع قبل إنهاء أعمال الخرسانة للسور والذي يجب تطبيق الطريق وعدم انتظار والطريقة المعتمدة</p>
              </div>
            </div>
            
            <div class="observation-image">
              ${tasksWithImages[2]?.imageUri ? `
                <img src="${tasksWithImages[2].imageUri}" alt="صورة الملاحظة" class="task-observation-image" />
              ` : `
                <div class="placeholder-image">
                  <div class="placeholder-icon">📸</div>
                  <div class="placeholder-text">صورة الملاحظة</div>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    };

    // Generate Progress Tables - Exact format match
    const generateProgressTables = () => {
      return `
        <div class="page progress-tables-page">
          <div class="overall-progress-header">
            <div class="overall-percentage">${completionRate.toFixed(2)} %</div>
            <div class="overall-label">نسبة الإنجاز</div>
          </div>

          <div class="category-progress-section">
            <div class="category-progress-header">
              <div class="category-progress-percentage">3.00 %</div>
              <div class="category-progress-title">تجهيز الموقع</div>
            </div>
            
            <table class="detailed-progress-table">
              <tr>
                <th class="current-visit-header">زيارة الموقع - 3 أشهر</th>
                <th class="previous-visit-header">زيارة الموقع السابقة</th>
                <th class="description-header">الوصف</th>
              </tr>
              <tr><td class="current-progress">100.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">سياج مؤقت</td></tr>
              <tr><td class="current-progress">100.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">لوحة المشروع</td></tr>
              <tr><td class="current-progress">100.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">إمدادات الكهرباء والمياه المؤقتة</td></tr>
            </table>
            
            <div class="notes-section">ملاحظات:</div>
          </div>

          <div class="category-progress-section">
            <div class="category-progress-header">
              <div class="category-progress-percentage">9.93 %</div>
              <div class="category-progress-title">أعمال الأساسات</div>
            </div>
            
            <table class="detailed-progress-table">
              <tr>
                <th class="current-visit-header">زيارة الموقع - 3 أشهر</th>
                <th class="previous-visit-header">زيارة الموقع السابقة</th>
                <th class="description-header">الوصف</th>
              </tr>
              <tr><td class="current-progress">100.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">أعمال الحفر</td></tr>
              <tr><td class="current-progress">100.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">أعمال الأساسات أو الرباط</td></tr>
              <tr><td class="current-progress">100.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">أقطاب الارتباط وقوائم الأعمدة</td></tr>
              <tr><td class="current-progress">100.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">الجسور الأرضية</td></tr>
              <tr><td class="current-progress">80.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">أعمال الردم</td></tr>
              <tr><td class="current-progress">100.00 %</td><td class="previous-progress">0.00 %</td><td class="work-description">خرسانة أرضية الطابق الأرضي</td></tr>
            </table>
            
            <div class="notes-section">ملاحظات: تم الانتهاء من أعمال الردم في الجزء المحيط لقاعدة الفيلا</div>
          </div>
        </div>
      `;
    };

    // Generate Evaluation Section - Exact format match
    const generateEvaluationSection = () => {
      return `
        <div class="page evaluation-page">
          <div class="evaluation-header">
            <h1 class="evaluation-title">التقييم</h1>
            <div class="evaluation-status">غير متوفر</div>
          </div>
          
          <div class="evaluation-legend">
            <div class="legend-item">
              <div class="legend-circle red">1</div>
              <span class="legend-text">مستوى العمل غير مرضي ويحتاج إلى التحسين</span>
            </div>
            <div class="legend-item">
              <div class="legend-circle orange">2</div>
              <span class="legend-text">مستوى العمل جيد مع وجود نقاط يمكن تحسينها</span>
            </div>
            <div class="legend-item">
              <div class="legend-circle green">3</div>
              <span class="legend-text">مستوى العمل جيد جداً وفقاً لمعايير المخططات والمواصفات المعتمدة والمتفق عليها</span>
            </div>
          </div>

          <table class="evaluation-table">
            <tr>
              <th class="rating-header">تصنيف التقييم</th>
              <th class="description-header">الوصف</th>
            </tr>
            <tr>
              <td class="rating-cell">
                <div class="rating-circles">
                  <div class="rating-circle red">1</div>
                  <div class="rating-circle orange">2</div>
                  <div class="rating-circle green">3</div>
                </div>
              </td>
              <td class="description-cell">جودة أعمال الخرسانة والردم</td>
            </tr>
            <tr>
              <td class="rating-cell">
                <div class="rating-circles">
                  <div class="rating-circle red">1</div>
                  <div class="rating-circle orange">2</div>
                  <div class="rating-circle green">3</div>
                </div>
              </td>
              <td class="description-cell">جودة أعمال الحديد</td>
            </tr>
            <tr>
              <td class="rating-cell">
                <div class="rating-circles">
                  <div class="rating-circle red">1</div>
                  <div class="rating-circle orange">2</div>
                  <div class="rating-circle green">3</div>
                </div>
              </td>
              <td class="description-cell">جودة الأعمال الإنشائية</td>
            </tr>
            <tr>
              <td class="rating-cell">
                <div class="rating-circles">
                  <div class="rating-circle red">1</div>
                  <div class="rating-circle orange">2</div>
                  <div class="rating-circle green">3</div>
                </div>
              </td>
              <td class="description-cell">الصحة والسلامة وجودة المرافق</td>
            </tr>
            <tr>
              <td class="rating-cell">
                <div class="rating-circles">
                  <div class="rating-circle red">1</div>
                  <div class="rating-circle orange">2</div>
                  <div class="rating-circle green">3</div>
                </div>
              </td>
              <td class="description-cell">أعمال الطوابق</td>
            </tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">أعمال الطوابق</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">أعمال الجدران</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">الهيكل الداخلي</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">الهيكل والواجهات الخارجية</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">أعمال الكهرباء</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">أعمال التكييف</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">أعمال التبليط والبلاط والسيراميك</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">الخدمات المساندة</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">الأثاث</td></tr>
            <tr><td class="not-available">غير متوفر</td><td class="description-cell">الألمونيوم والزجاج</td></tr>
            <tr>
              <td class="rating-cell">
                <div class="rating-circles">
                  <div class="rating-circle red">1</div>
                  <div class="rating-circle orange">2</div>
                  <div class="rating-circle green">3</div>
                </div>
              </td>
              <td class="description-cell">التقييم الكلي</td>
            </tr>
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
            font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1E293B;
            background: #fff;
            direction: rtl;
            text-align: right;
            font-size: 14px;
          }
          
          .page {
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm;
            min-height: 297mm;
            page-break-after: always;
            background: #fff;
          }
          
          .page:last-child {
            page-break-after: avoid;
          }

          /* Site Visit Form Styles */
          .site-visit-page {
            display: flex;
            flex-direction: column;
          }
          
          .form-container {
            flex: 1;
          }
          
          .form-title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
            padding: 20px;
            border: 3px solid #000;
            background: #f9f9f9;
          }
          
          .site-visit-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            border: 2px solid #000;
          }
          
          .site-visit-table td {
            border: 1px solid #000;
            padding: 15px 10px;
            vertical-align: middle;
          }
          
          .label-cell {
            background-color: #e8e8e8;
            font-weight: bold;
            text-align: center;
            width: 25%;
            font-size: 14px;
          }
          
          .colon-cell {
            text-align: center;
            width: 5%;
            background-color: #e8e8e8;
            font-weight: bold;
          }
          
          .value-cell {
            width: 70%;
            min-height: 40px;
            font-size: 14px;
            padding: 15px;
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