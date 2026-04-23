export function CalculatorPage() {
  return (
    <div className="space-y-6">

      {/* المحتسب الأصلي */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">المحتسب</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">محتسب التمويل الشخصي وشركات التمويل</p>
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <iframe
            src="/calculator/index.html"
            className="w-full h-full border-0"
            title="المحتسب"
            loading="eager"
          />
        </div>
      </div>

      {/* محتسب كلاود */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">محتسب كلاود</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">محتسب التمويل الشخصي وشركات التمويل</p>
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <iframe
            src="/muhtasib.html"
            className="w-full h-full border-0"
            title="محتسب كلاود"
            loading="lazy"
          />
        </div>
      </div>

    </div>
  )
}
