const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    bg: 'bg-blue-500',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    bg: 'bg-purple-500',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    bg: 'bg-green-500',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    bg: 'bg-red-500',
  },
];

const titles = [
  'Detección de SQL Injection',
  'Análisis de Puertos Vulnerables',
  'Diagnóstico del Dominio y Encabezados HTTP',
  'Directorios Inseguros',
];
const descriptions = [
  'Identifica vulnerabilidades de inyección SQL básicas en formularios y parámetros de URL.',
  'Examina los puertos abiertos en una IP para identificar servicios expuestos y posibles fallos de seguridad.',
  'Evalúa la configuración del dominio y los encabezados HTTP, proponiendo mejoras para proteger contra ataques como clickjacking y sniffing.',
  'Identifica directorios y archivos potencialmente inseguros o expuestos.',
];

const Features = () => {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Características Principales</h2>
          <div className="mx-auto w-24 h-1 bg-blue-500 rounded-full mb-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={
                `group bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm transition-all duration-200 ` +
                `hover:scale-105 hover:border-purple-500 hover:shadow-lg`
              }
              style={{ minHeight: 280 }}
            >
              <div className={`mb-5 flex items-center justify-center w-14 h-14 rounded-full ${feature.bg} transition-all duration-200`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{titles[idx]}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{descriptions[idx]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
