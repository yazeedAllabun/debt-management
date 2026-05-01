import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const TOUR_KEY = 'rakan_tour_done'

const mainSteps = [
  {
    element: '[data-tour="dashboard"]',
    popover: {
      title: 'لوحة التحكم',
      description: 'نظرة عامة على أداء المكتب — إجمالي العملاء، المبالغ، وآخر النشاطات.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="clients"]',
    popover: {
      title: 'العملاء',
      description: 'قائمة بجميع العملاء مع إمكانية البحث والتصفية، إضافة عميل جديد، تعديله، وحذفه.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="reports"]',
    popover: {
      title: 'التقارير',
      description: 'تقارير مالية شهرية وسنوية مع رسوم بيانية وإمكانية التصدير.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="muhtasib"]',
    popover: {
      title: 'المحتسب',
      description: 'احسب أقصى تمويل شخصي أو عبر شركات التمويل، اربطه بعميل واحفظه مباشرة.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="calculations"]',
    popover: {
      title: 'الحسبات',
      description: 'جميع الحسبات المحفوظة في مكان واحد — يمكن البحث عنها وتحميلها كصورة.',
      side: 'left',
      align: 'start',
    },
  },
]

function createDriver(onDone, openSidebar) {
  const isMobile = window.innerWidth < 768
  let drvr

  const steps = isMobile ? [
    {
      element: '[data-tour="menu-toggle"]',
      popover: {
        title: 'افتح القائمة أولاً',
        description: 'اضغط "التالي" وسيتم فتح القائمة الجانبية تلقائياً للبدء بالجولة.',
        side: 'bottom',
        align: 'start',
        onNextClick: () => {
          if (openSidebar) openSidebar()
          // انتظر انتهاء انيميشن الشريط الجانبي ثم انتقل
          setTimeout(() => drvr.moveNext(), 350)
        },
      },
    },
    ...mainSteps,
  ] : mainSteps

  drvr = driver({
    animate: true,
    overlayOpacity: 0.55,
    showProgress: true,
    progressText: '{{current}} من {{total}}',
    nextBtnText: 'التالي →',
    prevBtnText: '→ السابق',
    doneBtnText: 'تم ✓',
    allowClose: true,
    stagePadding: 8,
    popoverClass: 'rakan-tour-popover',
    onDestroyStarted: () => {
      onDone()
      drvr.destroy()
    },
    steps,
  })
  return drvr
}

export function runTour(openSidebar) {
  if (localStorage.getItem(TOUR_KEY)) return
  createDriver(() => localStorage.setItem(TOUR_KEY, '1'), openSidebar).drive()
}

export function forceTour(openSidebar) {
  createDriver(() => localStorage.setItem(TOUR_KEY, '1'), openSidebar).drive()
}
