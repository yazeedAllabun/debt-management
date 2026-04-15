// نظام الجولة التدريبية لمحتسب إمكان
(function () {
    'use strict';

    const TOUR_STORAGE_KEY = 'calcTourCompleted_FincPln';

    // تعريف خطوات الجولة التدريبية لإمكان
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
            title: 'إدخال راتب العميل',
            description: 'أدخل راتب العميل الشهري الأساسي. في برنامج إمكان، يتم احتساب التمويل بناءً على الراتب الأساسي.',
            position: 'bottom'
        },
        {
            element: '.role-col',
            title: 'نوع وظيفة العميل',
            description: 'حدد ما إذا كان العميل موظفاً حكومياً أو متقاعداً. هذا يؤثر على شروط التمويل والاستقطاع المسموح في برنامج إمكان.',
            position: 'bottom'
        },
        {
            element: '#clientType',
            title: 'نوع العميل',
            description: 'اختر نوع العميل من القائمة (مدني، عسكري، قطاع خاص، إلخ). كل نوع له معايير خاصة في برنامج إمكان تؤثر على المبلغ المتاح.',
            position: 'bottom'
        },
        {
            element: '#months',
            title: 'مدة التمويل',
            description: 'أدخل مدة التمويل المطلوبة بالأشهر. برنامج إمكان له حدود معينة للمدة حسب نوع الوظيفة والراتب.',
            position: 'bottom'
        },
        {
            element: '#rate',
            title: 'نسبة الفائدة لبرنامج إمكان',
            description: 'أدخل نسبة الفائدة السنوية المطبقة. برنامج إمكان عادة له نسب فائدة تنافسية مقارنة بالتمويل التقليدي.',
            position: 'bottom'
        },
        {
            element: '#commitment1',
            title: 'الالتزامات المالية للعميل',
            description: 'أدخل التزامات العميل الحالية. برنامج إمكان يأخذ في الاعتبار جميع الالتزامات عند حساب الأهلية.',
            position: 'bottom'
        },
        {
            element: '#calcBtn',
            title: 'حساب التمويل المتاح',
            description: 'بعد إدخال جميع البيانات، اضغط هنا لحساب مبلغ التمويل المتاح حسب معايير برنامج إمكان. ستظهر النتائج أسفل الشاشة.',
            position: 'top'
        }
    ];

    let currentStep = 0;
    let tourActive = false;

    // إنشاء عناصر الجولة
    function createTourElements() {
        const overlay = document.createElement('div');
        overlay.id = 'tourOverlay';
        overlay.className = 'tour-overlay';
        document.body.appendChild(overlay);

        const spotlight = document.createElement('div');
        spotlight.id = 'tourSpotlight';
        spotlight.className = 'tour-spotlight';
        document.body.appendChild(spotlight);

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

        tooltip.querySelector('.tour-btn-skip').addEventListener('click', skipTour);
        tooltip.querySelector('.tour-btn-prev').addEventListener('click', prevStep);
        tooltip.querySelector('.tour-btn-next').addEventListener('click', nextStep);
        overlay.addEventListener('click', skipTour);
    }

    function removeTourElements() {
        const elements = ['tourOverlay', 'tourSpotlight', 'tourTooltip'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }

    function updateTourPosition() {
        const step = tourSteps[currentStep];
        const element = document.querySelector(step.element);

        if (!element) return;

        const rect = element.getBoundingClientRect();
        const spotlight = document.getElementById('tourSpotlight');
        const tooltip = document.getElementById('tourTooltip');

        spotlight.style.top = (rect.top - 8) + 'px';
        spotlight.style.left = (rect.left - 8) + 'px';
        spotlight.style.width = (rect.width + 16) + 'px';
        spotlight.style.height = (rect.height + 16) + 'px';
        spotlight.style.display = 'block';

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            const updatedRect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            let top, left;

            if (step.position === 'bottom' || updatedRect.top > window.innerHeight / 2) {
                top = updatedRect.bottom + 16;
            } else {
                top = updatedRect.top - tooltipRect.height - 16;
            }

            left = updatedRect.left + (updatedRect.width / 2) - (tooltipRect.width / 2);

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

            const finalRect = element.getBoundingClientRect();
            spotlight.style.top = (finalRect.top - 8) + 'px';
            spotlight.style.left = (finalRect.left - 8) + 'px';
        }, 400);
    }

    function updateTourContent() {
        const step = tourSteps[currentStep];
        const tooltip = document.getElementById('tourTooltip');

        tooltip.querySelector('.tour-step-number').textContent = `${currentStep + 1} / ${tourSteps.length}`;
        tooltip.querySelector('.tour-title').textContent = step.title;
        tooltip.querySelector('.tour-description').textContent = step.description;

        const dotsContainer = tooltip.querySelector('.tour-dots');
        dotsContainer.innerHTML = tourSteps.map((_, i) =>
            `<span class="tour-dot ${i === currentStep ? 'active' : ''}"></span>`
        ).join('');

        const prevBtn = tooltip.querySelector('.tour-btn-prev');
        const nextBtn = tooltip.querySelector('.tour-btn-next');

        prevBtn.style.display = currentStep > 0 ? 'inline-block' : 'none';
        nextBtn.textContent = currentStep === tourSteps.length - 1 ? 'إنهاء' : 'التالي';

        updateTourPosition();
    }

    function nextStep() {
        if (currentStep < tourSteps.length - 1) {
            currentStep++;
            updateTourContent();
        } else {
            endTour(true);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            updateTourContent();
        }
    }

    function skipTour() {
        if (confirm('هل أنت متأكد من تخطي الجولة التدريبية؟')) {
            endTour(true);
        }
    }

    function endTour(completed) {
        tourActive = false;
        removeTourElements();
        if (completed) {
            localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        }
    }

    function startTour() {
        if (tourActive) return;

        tourActive = true;
        currentStep = 0;
        createTourElements();

        setTimeout(() => {
            updateTourContent();
        }, 100);
    }

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addRestartButton();
            checkAutoStart();
        });
    } else {
        addRestartButton();
        checkAutoStart();
    }

    window.addEventListener('resize', () => {
        if (tourActive) {
            updateTourPosition();
        }
    });

    window.startCalcTour = startTour;
})();
