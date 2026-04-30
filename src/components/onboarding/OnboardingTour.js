import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const TOUR_KEY = 'rakan_tour_done'

const steps = [
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

function createDriver(onDone) {
  let drvr
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

export function runTour() {
  if (localStorage.getItem(TOUR_KEY)) return
  createDriver(() => localStorage.setItem(TOUR_KEY, '1')).drive()
}

export function forceTour() {
  createDriver(() => localStorage.setItem(TOUR_KEY, '1')).drive()
}
