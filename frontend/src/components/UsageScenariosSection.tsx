export default function UsageScenariosSection() {
  const scenarios = [
    {
      title: 'Split PDF by Page Range',
      description: 'Split PDF by Page Range allows you to split a PDF file using custom page ranges such as 1-3, 5, or 8-10. This is ideal when you only need specific sections from a large document.'
    },
    {
      title: 'Split PDF Every X Pages',
      description: 'Split PDF Every X Pages divides a PDF into multiple files with a fixed number of pages per file. Entering "5" will generate a new PDF every five pages, making it useful for bulk processing.'
    },
    {
      title: 'Extract Pages from PDF',
      description: 'Extract Pages from PDF allows you to select individual pages and generate a new PDF containing only those pages. This is useful for sharing or archiving specific content.'
    }
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Usage Scenarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenarios.map((scenario, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {scenario.title}
              </h2>
              <p className="text-gray-600">
                {scenario.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
