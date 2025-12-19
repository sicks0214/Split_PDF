export default function HowToSection() {
  const steps = [
    {
      number: 1,
      title: 'Upload PDF',
      description: 'Click or drag and drop your PDF file into the upload area.'
    },
    {
      number: 2,
      title: 'Select Mode',
      description: 'Choose how you want to split: by range, fixed pages, or extract specific pages.'
    },
    {
      number: 3,
      title: 'Configure Parameters',
      description: 'Enter your page ranges, number of pages per file, or specific page numbers.'
    },
    {
      number: 4,
      title: 'Download Results',
      description: 'Click "Split PDF" and download your split files (as PDF or ZIP).'
    }
  ];

  return (
    <section className="w-full py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          How to Split PDF
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
