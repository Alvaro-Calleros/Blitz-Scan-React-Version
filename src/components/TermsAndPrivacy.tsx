import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from './ui/dialog';

interface TermsAndPrivacyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsAndPrivacy: React.FC<TermsAndPrivacyProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Términos de Servicio</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <section className="mb-8">
            <p><strong>Última actualización:</strong> Julio 2025</p>
            <p className="mt-2">
              Al utilizar nuestra plataforma <strong>BLITZ SCAN</strong>, aceptas los siguientes términos y condiciones. Esta herramienta está diseñada exclusivamente para profesionales de la ciberseguridad con autorización sobre los sistemas evaluados.
            </p>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Uso permitido</h2>
            <p>
              Solo se permite el uso de la plataforma con fines legales y bajo consentimiento explícito de los propietarios de los sistemas escaneados. El usuario asume toda responsabilidad legal sobre el uso que dé a los resultados generados.
            </p>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Licencia y propiedad</h2>
            <p>
              Todos los derechos sobre el software, diseño y contenido generado por BLITZ SCAN pertenecen a sus desarrolladores. No se permite su redistribución o modificación sin autorización expresa.
            </p>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Limitación de responsabilidad</h2>
            <p>
              La plataforma se proporciona "tal cual", sin garantías de ningún tipo. No garantizamos la detección de todas las vulnerabilidades ni la disponibilidad continua del servicio.
            </p>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Modificaciones</h2>
            <p>
              Nos reservamos el derecho de actualizar estos términos en cualquier momento. Se notificará a los usuarios registrados ante cambios significativos.
            </p>
          </section>
        </DialogDescription>
        <DialogHeader>
          <DialogTitle>Política de Privacidad</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <section>
            <p>
              En <strong>BLITZ SCAN</strong>, respetamos tu privacidad y protegemos la información que procesamos.
            </p>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Datos recopilados</h2>
            <p>
              Recolectamos información técnica necesaria para ejecutar escaneos (URL, cabeceras HTTP, tecnologías detectadas) y datos personales mínimos para crear una cuenta (correo electrónico, nombre de usuario).
            </p>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Uso de los datos</h2>
            <p>Utilizamos tus datos únicamente para:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>Generar reportes automáticos de seguridad</li>
              <li>Mejorar el funcionamiento de la plataforma</li>
              <li>Contactarte con recomendaciones o alertas relevantes</li>
            </ul>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Almacenamiento y protección</h2>
            <p>
              Los datos son almacenados en servidores seguros y se aplican prácticas modernas de seguridad en bases de datos y comunicaciones. No compartimos tu información con terceros.
            </p>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Derechos del usuario</h2>
            <p>
              Puedes solicitar la eliminación de tu cuenta y tus datos en cualquier momento escribiéndonos a soporte@testwebsecure.com.
            </p>
            <h2 className="font-semibold text-indigo-700 mt-6 mb-1">Cookies</h2>
            <p>
              Este sitio utiliza cookies técnicas para mantener tu sesión y mejorar la experiencia del usuario.
            </p>
          </section>
        </DialogDescription>
        <footer className="mt-8 text-center text-xs text-gray-500">
          © 2025 BLITZ SCAN. Todos los derechos reservados.
        </footer>
        <DialogClose asChild>
          <button aria-label="Cerrar">&times;</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndPrivacy;
