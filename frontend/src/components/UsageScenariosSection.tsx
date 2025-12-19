export default function UsageScenariosSection() {
  const scenarios = [
    {
      title: 'Split PDF by Page Range',
      description: 'Split PDF by Page Range allows you to enter custom page ranges such as 1-3, 5, 8-10. The tool extracts and generates new PDF files from the selected ranges.'
    },
    {
      title: 'Split PDF Every X Pages',
      description: 'Split PDF Every X Pages divides a PDF into equal parts. Entering "5" will generate a new PDF every five pages.'
    },
    {
      title: 'Extract Pages from PDF',
      description: 'Extract Pages allows selecting specific pages, generating a new PDF containing only those pages.'
    }
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Usage Scenarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenarios.map((scenario, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {scenario.title}
              </h3>
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
