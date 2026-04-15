// نظام الجولة التدريبية للمحتسب
(function () {
    'use strict';

    const TOUR_STORAGE_KEY = 'calcTourCompleted';

    // تعريف خطوات الجولة التدريبية
    const tourSteps = [
        {
            element: 'body',
            title: 'مرحباً بك في المحتسب الشامل! 👋',
            description: 'شاهد هذا الفيديو القصير لتتعرف على كيفية استخدام المحتسب ',
            position: 'center',
            isVideo: true,
            videoUrl: './assets/الشرح.mp4' // ضع الفيديو في مجلد assets
        },
        {
            element: '#customerName',
            title: 'اسم العميل',
            description: 'اسم العميل اختياري وهو لحفظ الاحتساب باسم العميل عند تصدير النتيجة.',
            position: 'bottom'
        },
        {
            element: '#salary',
            title: 'إدخال الراتب',
            description: 'أدخل راتب العميل الشهري مع البدلات الثابتة فقط. لا تُدخل البدلات المتغيرة أو المكافآت غير المنتظمة.',
            position: 'bottom'
        },
        {
            element: '.role-col',
            title: 'نوع وظيفة العميل',
            description: 'حدد ما إذا كان العميل موظفاً أو متقاعداً. هذا التحديد يؤثر على نسبة الاستقطاع المسموح بها في الحساب.',
            position: 'bottom'
        },
        {
            element: '#months',
            title: 'مدة التمويل',
            description: 'أدخل مدة التمويل المطلوبة من العميل بالأشهر (من 6 إلى 60 شهر). المدة الأطول تعني قسطاً شهرياً أقل.',
            position: 'bottom'
        },
        {
            element: '#rate',
            title: 'نسبة الفائدة السنوية',
            description: 'أدخل نسبة الفائدة السنوية المطبقة على التمويل.',
            position: 'bottom'
        },
        {
            element: '#commitment1',
            title: 'إضافة الالتزامات المالية',
            description: 'أدخل التزامات العميل الشهرية (أقساط تمويل سابقة، بطاقات ائتمان، إلخ). حدد نوع كل التزام من القائمة المنسدلة.',
            position: 'bottom'
        },
        {
            element: '#calcBtn',
            title: 'حساب النتائج',
            description: 'بعد إدخال جميع البيانات المطلوبة، اضغط هذا الزر لحساب مبلغ التمويل المتاح والقسط الشهري ونسبة الاستقطاع. ستظهر النتائج أسفل الشاشة.',
            position: 'top'
        }
    ];

    let currentStep = 0;
    let tourActive = false;

    // إنشاء عناصر الجولة
    function createTourElements() {
        // إنشاء الخلفية المعتمة
        const overlay = document.createElement('div');
        overlay.id = 'tourOverlay';
        overlay.className = 'tour-overlay';
        document.body.appendChild(overlay);

        // إنشاء Spotlight للعنصر المستهدف
        const spotlight = document.createElement('div');
        spotlight.id = 'tourSpotlight';
        spotlight.className = 'tour-spotlight';
        document.body.appendChild(spotlight);

        // إنشاء مربع الشرح
        const tooltip = document.createElement('div');
        tooltip.id = 'tourTooltip';
        tooltip.className = 'tour-tooltip';
        tooltip.innerHTML = `
            <div class="tour-tooltip-content">
                <div class="tour-step-number"></div>
                <h3 class="tour-title"></h3>
                <p class="tour-description"></p>
                <div class="tour-footer">
                    <div class="tour-dots"></div>
                    <div class="tour-buttons">
                        <button class="tour-btn tour-btn-skip">تخطي الجولة</button>
                        <button class="tour-btn tour-btn-prev" style="display: none;">السابق</button>
                        <button class="tour-btn tour-btn-next">التالي</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(tooltip);

        // ربط الأحداث
        tooltip.querySelector('.tour-btn-skip').addEventListener('click', skipTour);
        tooltip.querySelector('.tour-btn-prev').addEventListener('click', prevStep);
        tooltip.querySelector('.tour-btn-next').addEventListener('click', nextStep);
        overlay.addEventListener('click', skipTour);
    }

    // حذف عناصر الجولة
    function removeTourElements() {
        const elements = ['tourOverlay', 'tourSpotlight', 'tourTooltip'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }

    // تحديث موضع Spotlight والـ Tooltip
    function updateTourPosition() {
        const step = tourSteps[currentStep];

        // خطوة الفيديو لا تحتاج spotlight
        if (step.isVideo) {
            const spotlight = document.getElementById('tourSpotlight');
            const tooltip = document.getElementById('tourTooltip');

            spotlight.style.display = 'none';

            // توسيط الـ tooltip
            const tooltipRect = tooltip.getBoundingClientRect();
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.opacity = '1';
            return;
        }

        const element = document.querySelector(step.element);

        if (!element) return;

        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        const spotlight = document.getElementById('tourSpotlight');
        const tooltip = document.getElementById('tourTooltip');

        // إعادة transform للقيمة الافتراضية
        tooltip.style.transform = 'none';

        // تحديث Spotlight باستخدام fixed positioning (لا يحتاج scroll offset)
        spotlight.style.top = (rect.top - 8) + 'px';
        spotlight.style.left = (rect.left - 8) + 'px';
        spotlight.style.width = (rect.width + 16) + 'px';
        spotlight.style.height = (rect.height + 16) + 'px';
        spotlight.style.display = 'block';

        // التمرير للعنصر
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // تحديث Tooltip باستخدام fixed positioning
        setTimeout(() => {
            // إعادة الحصول على rect بعد التمرير
            const updatedRect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            let top, left;

            // تحديد الموضع حسب المساحة المتاحة
            if (step.position === 'bottom' || updatedRect.top > window.innerHeight / 2) {
                top = updatedRect.bottom + 16;
            } else {
                top = updatedRect.top - tooltipRect.height - 16;
            }

            // توسيط أفقياً مع العنصر
            left = updatedRect.left + (updatedRect.width / 2) - (tooltipRect.width / 2);

            // التأكد من عدم خروج Tooltip من الشاشة
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top < 10) top = updatedRect.bottom + 16;
            if (top + tooltipRect.height > window.innerHeight - 10) {
                top = updatedRect.top - tooltipRect.height - 16;
            }

            tooltip.style.top = top + 'px';
            tooltip.style.left = left + 'px';
            tooltip.style.opacity = '1';

            // تحديث spotlight مرة أخرى بعد التمرير
            const finalRect = element.getBoundingClientRect();
            spotlight.style.top = (finalRect.top - 8) + 'px';
            spotlight.style.left = (finalRect.left - 8) + 'px';
        }, 400);
    }

    // تحديث محتوى الجولة
    function updateTourContent() {
        const step = tourSteps[currentStep];
        const tooltip = document.getElementById('tourTooltip');

        tooltip.querySelector('.tour-step-number').textContent = `${currentStep + 1} / ${tourSteps.length}`;
        tooltip.querySelector('.tour-title').textContent = step.title;

        // إضافة الفيديو إذا كانت خطوة فيديو
        const descriptionEl = tooltip.querySelector('.tour-description');
        if (step.isVideo && step.videoUrl) {
            descriptionEl.innerHTML = `
                <div style="margin-bottom: 16px;">${step.description}</div>
                <div class="tour-video-container">
                    <video 
                        controls 
                        controlsList="nodownload"
                        preload="metadata"
                        style="width: 100%; height: 100%; border-radius: 8px; background: #000;">
                        <source src="${step.videoUrl}" type="video/mp4">
                        متصفحك لا يدعم تشغيل الفيديو. يرجى تحديث المتصفح.
                    </video>
                </div>
            `;
        } else {
            descriptionEl.textContent = step.description;
        }

        // تحديث النقاط
        const dotsContainer = tooltip.querySelector('.tour-dots');
        dotsContainer.innerHTML = tourSteps.map((_, i) =>
            `<span class="tour-dot ${i === currentStep ? 'active' : ''}"></span>`
        ).join('');

        // تحديث الأزرار
        const prevBtn = tooltip.querySelector('.tour-btn-prev');
        const nextBtn = tooltip.querySelector('.tour-btn-next');
        const skipBtn = tooltip.querySelector('.tour-btn-skip');

        // في خطوة الفيديو، تغيير نصوص الأزرار
        if (step.isVideo) {
            prevBtn.style.display = 'none';
            nextBtn.textContent = 'المتابعة للخطوات';
            skipBtn.textContent = 'تخطي الجولة';
        } else {
            prevBtn.style.display = currentStep > 0 ? 'inline-block' : 'none';
            nextBtn.textContent = currentStep === tourSteps.length - 1 ? 'إنهاء' : 'التالي';
            skipBtn.textContent = 'تخطي الجولة';
        }

        updateTourPosition();
    }

    // الانتقال للخطوة التالية
    function nextStep() {
        if (currentStep < tourSteps.length - 1) {
            currentStep++;
            updateTourContent();
        } else {
            endTour(true);
        }
    }

    // الرجوع للخطوة السابقة
    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            updateTourContent();
        }
    }

    // تخطي الجولة
    function skipTour() {
        if (confirm('هل أنت متأكد من تخطي الجولة التدريبية؟')) {
            endTour(true);
        }
    }

    // إنهاء الجولة
    function endTour(completed) {
        tourActive = false;
        removeTourElements();
        if (completed) {
            localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        }
    }

    // بدء الجولة
    function startTour() {
        if (tourActive) return;

        tourActive = true;
        currentStep = 0;
        createTourElements();

        setTimeout(() => {
            updateTourContent();
        }, 100);
    }

    // التحقق من عرض الجولة تلقائياً
    function checkAutoStart() {
        const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
        if (!tourCompleted) {
            // التحقق من وجود العناصر قبل البدء
            function waitForElements() {
                const firstElement = document.querySelector(tourSteps[0].element);
                if (firstElement) {
                    setTimeout(startTour, 500);
                } else {
                    setTimeout(waitForElements, 200);
                }
            }
            waitForElements();
        }
    }

    // إضافة زر لإعادة الجولة (اختياري)
    function addRestartButton() {
        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn-ghost tour-restart-btn';
        restartBtn.textContent = '؟';
        restartBtn.title = 'بدء الجولة التدريبية';
        restartBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; padding: 0; font-size: 18px; border-radius: 50%;';
        restartBtn.addEventListener('click', startTour);

        const container = document.querySelector('.container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(restartBtn);
        }
    }

    // تهيئة الجولة عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addRestartButton();
            checkAutoStart();
        });
    } else {
        addRestartButton();
        checkAutoStart();
    }

    // إعادة حساب المواضع عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        if (tourActive) {
            updateTourPosition();
        }
    });

    // تصدير الدالة للاستخدام الخارجي
    window.startCalcTour = startTour;
})();
