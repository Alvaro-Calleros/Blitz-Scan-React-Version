import { useState } from 'react';

const steps = [
  {
    number: 1,
    title: 'Ingresa la URL',
    description: 'Introduce la dirección del sitio web que deseas analizar en el campo de entrada.',
    image: '/link_scanner.png',
    alt: 'Interfaz para ingresar URL',
  },
  {
    number: 2,
    title: 'Tipo de Escaneo',
    description: 'Elige el tipo de escaneo que deseas realizar según tus necesidades de seguridad.',
    image: '/tipo_scanner.png',
    alt: 'Opciones de tipo de escaneo',
  },
  {
    number: 3,
    title: 'Informe Detallado',
    description: 'Recibe un informe completo con las vulnerabilidades detectadas y recomendaciones para solucionarlas.',
    image: '/resultado_scanner.png',
    alt: 'Ejemplo de informe de resultados',
  },
];

const HowItWorks = () => {
  const [modalImg, setModalImg] = useState<string | null>(null);

  return (
    <section id="how-it-works" className="py-20 bg-[#f4f6fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">¿Cómo Funciona?</h2>
          <div className="mx-auto w-24 h-1 bg-blue-500 rounded-full mb-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative bg-white rounded-2xl shadow-md pt-10 pb-8 px-6 flex flex-col items-center text-center min-h-[480px]">
              {/* Step number */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-base mb-6">{step.description}</p>
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={step.image}
                  alt={step.alt}
                  className="rounded-xl shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105 max-h-56 mx-auto"
                  onClick={() => setModalImg(step.image)}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal de imagen */}
      {modalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setModalImg(null)}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-2xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="Vista ampliada" className="rounded-xl max-h-[70vh] w-auto object-contain" />
            <button
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              onClick={() => setModalImg(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar imagen
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;
