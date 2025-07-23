
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

const tecnologias = [
  { nombre: 'React', tipo: 'Frontend' },
  { nombre: 'TypeScript', tipo: 'Frontend' },
  { nombre: 'TailwindCSS', tipo: 'Frontend' },
  { nombre: 'Python', tipo: 'Backend' },
  { nombre: 'Flask', tipo: 'Backend' },
  { nombre: 'Supabase', tipo: 'Base de datos' },
  { nombre: 'PostgreSQL', tipo: 'Base de datos' },
  { nombre: 'Nmap', tipo: 'Escaneo' },
  { nombre: 'Dirsearch', tipo: 'Escaneo' },
  { nombre: 'Subfinder', tipo: 'Escaneo' },
];

const modulos = [
  { icono: '🛡️', nombre: 'Escaneo de vulnerabilidades' },
  { icono: '📊', nombre: 'Reportes inteligentes con IA' },
  { icono: '⚙️', nombre: 'Configuración personalizada' },
  { icono: '📁', nombre: 'Historial y exportación de informes' },
];

const preguntas = [
  {
    pregunta: '¿Qué tipos de escaneo realiza Blitz Scan?',
    respuesta: 'Blitz Scan permite escaneos de directorios y archivos ocultos (Dirsearch), puertos y servicios (Nmap), subdominios (Subfinder) y consulta de información WHOIS. Todos los resultados se presentan en reportes claros y accionables.'
  },
  {
    pregunta: '¿Cómo se protegen mis datos?',
    respuesta: 'Tus datos y resultados de escaneo se almacenan de forma segura en Supabase/PostgreSQL. Solo tú tienes acceso a tus informes y puedes eliminarlos en cualquier momento.'
  },
  {
    pregunta: '¿Puedo exportar los reportes?',
    respuesta: 'Sí, puedes descargar los reportes en formato PDF o TXT desde la plataforma, listos para compartir o archivar.'
  },
  {
    pregunta: '¿Qué hago si encuentro un error?',
    respuesta: 'Contacta al soporte técnico en soporte@blitzscan.io o utiliza el formulario de contacto en la plataforma.'
  },
];

const buenasPracticas = [
  'Utiliza siempre dominios o IPs sobre los que tengas autorización para escanear.',
  'No compartas tus credenciales de acceso.',
  'Revisa los reportes y aplica las recomendaciones de seguridad sugeridas.',
  'Actualiza tus datos y contraseñas periódicamente.',
];

export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-8">📘 Documentación Técnica - BLITZ SCAN</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bienvenido a la documentación de Blitz Scan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-2">
            Blitz Scan es una plataforma avanzada de ciberseguridad que automatiza el análisis de vulnerabilidades y la generación de reportes inteligentes, integrando herramientas de escaneo líderes y un backend robusto en Python/Flask.
          </p>
          <Alert className="mt-4 mb-2">
            <AlertTitle>¡Importante!</AlertTitle>
            <AlertDescription>
              Utiliza Blitz Scan solo en sistemas sobre los que tengas permiso. El uso indebido puede ser ilegal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tecnologias">Tecnologías</TabsTrigger>
          <TabsTrigger value="flujo">Flujo de uso</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="buenas">Buenas prácticas</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="soporte">Soporte</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <h2 className="text-2xl font-semibold mb-2">¿Qué es Blitz Scan?</h2>
          <p className="mb-4 text-gray-700">
            Blitz Scan es una solución integral para la evaluación de seguridad web e infraestructura. Permite a profesionales y empresas identificar vulnerabilidades, obtener recomendaciones prácticas y gestionar reportes de manera centralizada.
          </p>
          <Separator className="my-4" />
          <h3 className="text-xl font-semibold mb-2">Objetivo</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-2">
            <li>Automatizar y simplificar auditorías de seguridad.</li>
            <li>Ofrecer reportes claros y accionables.</li>
            <li>Reducir costos y barreras técnicas para el análisis de seguridad.</li>
          </ul>
        </TabsContent>
        <TabsContent value="tecnologias">
          <h2 className="text-2xl font-semibold mb-4">Tecnologías utilizadas</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {tecnologias.map((t, i) => (
              <Badge key={i} variant={t.tipo === 'Frontend' ? 'default' : t.tipo === 'Backend' ? 'secondary' : 'outline'}>
                {t.nombre}
              </Badge>
            ))}
          </div>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Frontend:</strong> React, TypeScript, TailwindCSS</li>
            <li><strong>Backend:</strong> Python (Flask)</li>
            <li><strong>Base de datos:</strong> Supabase (PostgreSQL)</li>
            <li><strong>Herramientas de escaneo:</strong> Nmap, Dirsearch, Subfinder</li>
            <li><strong>IA:</strong> Generación de reportes en lenguaje natural</li>
          </ul>
        </TabsContent>
        <TabsContent value="flujo">
          <h2 className="text-2xl font-semibold mb-4">Flujo de uso</h2>
          <ol className="list-decimal pl-6 text-gray-700 mb-4">
            <li>Regístrate o inicia sesión en la plataforma.</li>
            <li>Accede al panel principal y selecciona el tipo de escaneo (Fuzzing, Nmap, Subfinder, WHOIS).</li>
            <li>Introduce el dominio o IP objetivo.</li>
            <li>Ejecuta el escaneo y espera los resultados.</li>
            <li>Visualiza los resultados y recomendaciones generadas por IA.</li>
            <li>Guarda o exporta el reporte en PDF/TXT.</li>
          </ol>
          <Alert className="mb-2" variant="default">
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>
              Puedes realizar múltiples escaneos y consultar el historial en cualquier momento.
            </AlertDescription>
          </Alert>
        </TabsContent>
        <TabsContent value="modulos">
          <h2 className="text-2xl font-semibold mb-4">Módulos de la plataforma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulos.map((m, i) => (
              <Card key={i} className="flex flex-row items-center gap-4 p-4">
                <span className="text-3xl">{m.icono}</span>
                <span className="text-lg font-medium text-gray-800">{m.nombre}</span>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="buenas">
          <h2 className="text-2xl font-semibold mb-4">Buenas prácticas de uso</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            {buenasPracticas.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <Alert variant="default">
            <AlertTitle>Recuerda</AlertTitle>
            <AlertDescription>
              El uso responsable de las herramientas de seguridad es fundamental para evitar problemas legales y éticos.
            </AlertDescription>
          </Alert>
        </TabsContent>
        <TabsContent value="faq">
          <h2 className="text-2xl font-semibold mb-4">Preguntas frecuentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {preguntas.map((p, i) => (
              <AccordionItem value={`item-${i}`} key={i}>
                <AccordionTrigger>{p.pregunta}</AccordionTrigger>
                <AccordionContent>{p.respuesta}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="soporte">
          <h2 className="text-2xl font-semibold mb-4">Soporte y contacto</h2>
          <p className="mb-2 text-gray-700">
            Para soporte técnico, sugerencias o reportes de errores, contáctanos en:
          </p>
          <div className="mb-4">
            <Badge variant="secondary">soporte@blitzscan.io</Badge>
          </div>
          <Alert variant="default">
            <AlertTitle>¿Tienes una sugerencia?</AlertTitle>
            <AlertDescription>
              ¡Tu feedback es valioso! Ayúdanos a mejorar Blitz Scan enviando tus ideas o reportes.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
      <footer className="mt-12 text-center text-gray-500 text-sm">
        © 2025 BLITZ SCAN. Todos los derechos reservados.
      </footer>
    </div>
  );
}