// Tipos para el agente BlitzScanIA
export type AIQueryType = 
  | 'security_report'    // Reporte de seguridad específico
  | 'general_chat'       // Chat general
  | 'vulnerability_analysis' // Análisis de vulnerabilidades
  | 'security_advice'    // Consejos de seguridad
  | 'tool_recommendation' // Recomendación de herramientas
  | 'risk_assessment'    // Evaluación de riesgos
  | 'technical_explanation' // Explicación técnica
  | 'compliance_check'   // Verificación de cumplimiento
  | 'incident_response'  // Respuesta a incidentes
  | 'penetration_testing' // Testing de penetración

export interface AIQuery {
  type: AIQueryType;
  scanType?: string;
  scanData?: any;
  userMessage?: string;
  context?: string;
  conversationHistory?: Array<{sender: 'user' | 'bot', text: string}>;
  currentScan?: any;
}

// Sistema de contexto para mantener el estado de la conversación
export interface ConversationContext {
  currentScan?: {
    type: string;
    data: any;
    url: string;
    timestamp: string;
  };
  conversationHistory: Array<{sender: 'user' | 'bot', text: string}>;
  userExpertise: 'beginner' | 'intermediate' | 'expert';
  focusArea?: 'web_security' | 'network_security' | 'application_security' | 'social_engineering';
  previousTopics: string[];
}

// Prompts específicos para cada tipo de consulta
export const AI_PROMPTS = {
  // Reporte de seguridad estructurado
  security_report: (scanType: string, scanData: any) => `
Eres BlitzScanIA, un experto asistente de ciberseguridad especializado en análisis de seguridad web.

TAREA: Generar un reporte de seguridad profesional y estructurado.

INSTRUCCIONES:
- Analiza los datos del escaneo proporcionados
- Identifica vulnerabilidades y riesgos específicos
- Proporciona recomendaciones prácticas y priorizadas
- Usa un tono profesional pero accesible
- Estructura la respuesta con secciones claras

FORMATO DEL REPORTE:
## 🔍 Resumen Ejecutivo
[Breve resumen de los hallazgos principales]

## 🚨 Vulnerabilidades Detectadas
[Lista de vulnerabilidades encontradas con nivel de riesgo]

## 📊 Análisis de Riesgo
[Evaluación del impacto y probabilidad]

## 🛡️ Recomendaciones Prioritarias
[Acciones específicas para mitigar riesgos]

## 📈 Medidas Preventivas
[Estrategias para prevenir futuros incidentes]

TIPO DE ESCANEO: ${scanType}
DATOS DEL ESCANEO:
${typeof scanData === 'string' ? scanData : JSON.stringify(scanData, null, 2)}

Genera el reporte siguiendo el formato especificado.
`,

  // Chat general de ciberseguridad
  general_chat: (userMessage: string) => `
Eres BlitzScanIA, un asistente de ciberseguridad amigable y experto.

CONTEXTO: El usuario está haciendo una pregunta general sobre ciberseguridad.

INSTRUCCIONES:
- Responde de forma clara y accesible
- Proporciona información práctica y útil
- SOLO recomienda herramientas que están disponibles en BlitzScan
- Mantén un tono conversacional pero profesional
- No generes reportes estructurados para preguntas simples
- NO menciones herramientas externas como Nessus, OpenVAS, OWASP ZAP, etc.

HERRAMIENTAS DISPONIBLES EN BLITZSCAN:
- Fuzzing Web: Búsqueda de directorios y archivos ocultos
- Nmap Scan: Escaneo de puertos y servicios
- WHOIS Lookup: Información del dominio y registrante
- Subfinder: Enumeración de subdominios
- ParamSpider: Extracción de parámetros vulnerables
- WhatWeb: Fingerprinting de tecnologías web
- theHarvester: Recolección de correos y hosts públicos

PREGUNTA DEL USUARIO: ${userMessage}

Responde de manera natural y útil, recomendando SOLO las herramientas de BlitzScan.
`,

  // Análisis específico de vulnerabilidades
  vulnerability_analysis: (scanData: any, context: string) => `
Eres BlitzScanIA, especialista en análisis de vulnerabilidades.

TAREA: Analizar vulnerabilidades específicas en los datos proporcionados.

INSTRUCCIONES:
- Identifica vulnerabilidades específicas
- Evalúa el nivel de riesgo de cada una
- Explica el impacto potencial
- Sugiere métodos de explotación (para propósitos educativos)
- Proporciona contramedidas específicas

CONTEXTO: ${context}
DATOS PARA ANALIZAR:
${typeof scanData === 'string' ? scanData : JSON.stringify(scanData, null, 2)}

Realiza un análisis detallado de las vulnerabilidades encontradas.
`,

  // Consejos de seguridad
  security_advice: (topic: string) => `
Eres BlitzScanIA, consultor de seguridad experto.

TAREA: Proporcionar consejos prácticos de seguridad.

INSTRUCCIONES:
- Ofrece consejos específicos y accionables
- Explica el "por qué" de cada recomendación
- Incluye mejores prácticas de la industria
- Mantén un tono educativo y útil

TEMA: ${topic}

Proporciona consejos de seguridad relevantes y prácticos.
`,

  // Recomendación de herramientas
  tool_recommendation: (context: string) => `
Eres BlitzScanIA, experto en herramientas de ciberseguridad.

TAREA: Recomendar herramientas apropiadas SOLO de las disponibles en BlitzScan.

INSTRUCCIONES:
- Sugiere SOLO herramientas que están en BlitzScan
- Explica por qué cada herramienta es útil para el contexto
- NO menciones herramientas externas como Nessus, OpenVAS, OWASP ZAP, etc.
- Considera el nivel de experiencia del usuario
- Proporciona casos de uso específicos

HERRAMIENTAS DISPONIBLES EN BLITZSCAN:
- Fuzzing Web: Para encontrar rutas sensibles, archivos de backup, paneles de administración
- Nmap Scan: Para identificar puertos abiertos, servicios activos, vulnerabilidades de red
- WHOIS Lookup: Para información del dominio, fechas de expiración, datos del registrante
- Subfinder: Para encontrar subdominios, ampliar la superficie de ataque
- ParamSpider: Para encontrar parámetros URL, posibles puntos de inyección
- WhatWeb: Para identificar tecnologías, frameworks, versiones de software
- theHarvester: Para encontrar correos electrónicos, hosts, información de la organización

CONTEXTO: ${context}

Recomienda SOLO herramientas de BlitzScan apropiadas para este contexto.
`,

  // Evaluación de riesgos
  risk_assessment: (data: any) => `
Eres BlitzScanIA, especialista en evaluación de riesgos de seguridad.

TAREA: Evaluar el nivel de riesgo de los hallazgos.

INSTRUCCIONES:
- Clasifica los riesgos por severidad (Alto/Medio/Bajo)
- Explica el impacto potencial de cada riesgo
- Considera la probabilidad de explotación
- Proporciona métricas de riesgo cuando sea posible
- Sugiere prioridades de mitigación

DATOS PARA EVALUAR:
${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}

Realiza una evaluación de riesgos detallada.
`,

  // Explicación técnica
  technical_explanation: (topic: string, context?: ConversationContext) => `
Eres BlitzScanIA, experto técnico en ciberseguridad.

TAREA: Proporcionar una explicación técnica clara y detallada.

INSTRUCCIONES:
- Explica el concepto de manera técnica pero accesible
- Incluye ejemplos prácticos cuando sea relevante
- Menciona herramientas relacionadas si aplica
- Considera el nivel de experiencia del usuario
- Proporciona contexto histórico o de la industria cuando sea útil

TEMA A EXPLICAR: ${topic}
${context?.currentScan ? `CONTEXTO DEL ESCANEO ACTUAL: ${context.currentScan.type} en ${context.currentScan.url}` : ''}

Proporciona una explicación técnica completa y detallada.
`,

  // Verificación de cumplimiento
  compliance_check: (standard: string, context?: ConversationContext) => `
Eres BlitzScanIA, especialista en cumplimiento y regulaciones de seguridad.

TAREA: Verificar el cumplimiento con estándares de seguridad.

INSTRUCCIONES:
- Identifica los requisitos relevantes del estándar
- Evalúa el nivel de cumplimiento actual
- Identifica brechas de cumplimiento
- Proporciona recomendaciones específicas
- Menciona consecuencias de no cumplir
- Incluye mejores prácticas de la industria

ESTÁNDAR/CUMPLIMIENTO: ${standard}
${context?.currentScan ? `CONTEXTO DEL ESCANEO: ${context.currentScan.type} en ${context.currentScan.url}` : ''}

Realiza una evaluación de cumplimiento detallada.
`,

  // Respuesta a incidentes
  incident_response: (incident: string, context?: ConversationContext) => `
Eres BlitzScanIA, especialista en respuesta a incidentes de seguridad.

TAREA: Proporcionar guía para responder a un incidente de seguridad.

INSTRUCCIONES:
- Define los pasos inmediatos a seguir
- Establece prioridades de respuesta
- Identifica stakeholders que deben ser notificados
- Sugiere herramientas de análisis forense
- Proporciona plantillas de documentación
- Incluye consideraciones legales y regulatorias

INCIDENTE DESCRITO: ${incident}
${context?.currentScan ? `ESCANEO RELACIONADO: ${context.currentScan.type} en ${context.currentScan.url}` : ''}

Proporciona un plan de respuesta a incidentes detallado.
`,

  // Testing de penetración
  penetration_testing: (target: string, context?: ConversationContext) => `
Eres BlitzScanIA, experto en testing de penetración y hacking ético.

TAREA: Proporcionar guía para testing de penetración.

INSTRUCCIONES:
- Define el alcance del pentest
- Sugiere metodologías apropiadas (OWASP, NIST, etc.)
- Recomienda herramientas específicas
- Establece reglas de engagement
- Proporciona plantillas de reporte
- Incluye consideraciones éticas y legales

OBJETIVO DEL PENTEST: ${target}
${context?.currentScan ? `CONTEXTO DEL ESCANEO: ${context.currentScan.type} en ${context.currentScan.url}` : ''}

Proporciona una guía completa para testing de penetración.
`
};

// Herramientas disponibles en BlitzScan
export const BLITZSCAN_TOOLS = {
  fuzzing: {
    name: 'Fuzzing Web',
    description: 'Búsqueda de directorios y archivos ocultos',
    use_case: 'Encontrar rutas sensibles, archivos de backup, paneles de administración'
  },
  nmap: {
    name: 'Nmap Scan',
    description: 'Escaneo de puertos y servicios',
    use_case: 'Identificar puertos abiertos, servicios activos, vulnerabilidades de red'
  },
  whois: {
    name: 'WHOIS Lookup',
    description: 'Información del dominio y registrante',
    use_case: 'Información del dominio, fechas de expiración, datos del registrante'
  },
  subfinder: {
    name: 'Subfinder',
    description: 'Enumeración de subdominios',
    use_case: 'Encontrar subdominios, ampliar la superficie de ataque'
  },
  paramspider: {
    name: 'ParamSpider',
    description: 'Extracción de parámetros vulnerables',
    use_case: 'Encontrar parámetros URL, posibles puntos de inyección'
  },
  whatweb: {
    name: 'WhatWeb',
    description: 'Fingerprinting de tecnologías web',
    use_case: 'Identificar tecnologías, frameworks, versiones de software'
  },
  theharvester: {
    name: 'theHarvester',
    description: 'Recolección de correos y hosts públicos',
    use_case: 'Encontrar correos electrónicos, hosts, información de la organización'
  }
};

// Función para obtener recomendaciones de herramientas específicas de BlitzScan
export function getBlitzScanToolRecommendations(context: string): string[] {
  const recommendations = [];
  
  if (context.toLowerCase().includes('backend') || context.toLowerCase().includes('api')) {
    recommendations.push('Fuzzing Web - Para encontrar endpoints ocultos y rutas sensibles');
    recommendations.push('Nmap Scan - Para identificar puertos y servicios expuestos');
    recommendations.push('ParamSpider - Para encontrar parámetros vulnerables en APIs');
  }
  
  if (context.toLowerCase().includes('dominio') || context.toLowerCase().includes('sitio web')) {
    recommendations.push('WHOIS Lookup - Para información del dominio y registrante');
    recommendations.push('Subfinder - Para encontrar subdominios relacionados');
    recommendations.push('WhatWeb - Para identificar tecnologías del sitio');
  }
  
  if (context.toLowerCase().includes('vulnerabilidad') || context.toLowerCase().includes('seguridad')) {
    recommendations.push('Nmap Scan - Para identificar servicios vulnerables');
    recommendations.push('Fuzzing Web - Para encontrar rutas sensibles');
    recommendations.push('ParamSpider - Para detectar parámetros vulnerables');
  }
  
  if (context.toLowerCase().includes('información') || context.toLowerCase().includes('reconocimiento')) {
    recommendations.push('WHOIS Lookup - Para información del dominio');
    recommendations.push('theHarvester - Para encontrar correos y hosts');
    recommendations.push('WhatWeb - Para fingerprinting de tecnologías');
  }
  
  // Si no hay contexto específico, recomendar herramientas generales
  if (recommendations.length === 0) {
    recommendations.push('Nmap Scan - Para un análisis completo de puertos y servicios');
    recommendations.push('Fuzzing Web - Para encontrar rutas y archivos ocultos');
    recommendations.push('WHOIS Lookup - Para información del dominio');
  }
  
  return recommendations;
}

// Función para determinar el tipo de consulta basado en el mensaje del usuario
export function classifyQuery(
  userMessage: string, 
  scanType?: string, 
  scanData?: any,
  context?: ConversationContext
): AIQueryType {
  const message = userMessage.toLowerCase();
  
  // Palabras clave más específicas y robustas
  const keywords = {
    security_report: [
      'reporte', 'report', 'análisis completo', 'evaluación completa', 
      'genera reporte', 'crea reporte', 'haz un reporte', 'reporte de seguridad'
    ],
    vulnerability_analysis: [
      'vulnerabilidad', 'vulnerability', 'exploit', 'ataque', 'brecha', 'falla',
      'análisis de vulnerabilidades', 'buscar vulnerabilidades', 'encontrar vulnerabilidades',
      'exploit', 'exploitación', 'ataque', 'intrusión'
    ],
    security_advice: [
      'consejo', 'advice', 'recomendación', 'mejor práctica', 'protección',
      'cómo proteger', 'cómo defenderme', 'medidas de seguridad', 'prevención',
      'qué hacer', 'cómo mejorar', 'recomendaciones'
    ],
    tool_recommendation: [
      'herramienta', 'tool', 'software', 'aplicación', 'programa', 'utilidad',
      'qué herramienta', 'recomienda herramienta', 'mejor herramienta', 'alternativa',
      'software de seguridad', 'aplicación de seguridad'
    ],
    risk_assessment: [
      'riesgo', 'risk', 'peligro', 'amenaza', 'evaluación de riesgo',
      'qué tan peligroso', 'nivel de riesgo', 'análisis de riesgo',
      'evaluar riesgo', 'medir riesgo', 'clasificar riesgo'
    ],
    technical_explanation: [
      'explica', 'explain', 'qué significa', 'cómo funciona', 'definición',
      'técnicamente', 'detalles técnicos', 'explicación técnica', 'cómo se hace',
      'proceso', 'método', 'técnica'
    ],
    compliance_check: [
      'cumplimiento', 'compliance', 'norma', 'estándar', 'regulación',
      'gdpr', 'hipaa', 'sox', 'pci', 'iso', 'certificación',
      'auditoría', 'audit', 'verificación de cumplimiento'
    ],
    incident_response: [
      'incidente', 'incident', 'ataque', 'breach', 'intrusión',
      'qué hacer si', 'respuesta a incidente', 'plan de respuesta',
      'emergencia', 'crisis', 'alerta de seguridad'
    ],
    penetration_testing: [
      'pentest', 'penetration test', 'testing de penetración', 'prueba de penetración',
      'ethical hacking', 'hacking ético', 'test de seguridad', 'auditoría de seguridad',
      'simulación de ataque', 'red team'
    ]
  };

  // Verificar si es un reporte de seguridad específico
  if (scanType && scanData) {
    return 'security_report';
  }

  // Clasificar basado en palabras clave con prioridad
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => message.includes(word))) {
      return type as AIQueryType;
    }
  }

  // Análisis de contexto para determinar el tipo
  if (context) {
    // Si hay un escaneo activo y la pregunta es sobre él
    if (context.currentScan && (
      message.includes('este escaneo') || 
      message.includes('los resultados') || 
      message.includes('lo que encontraste')
    )) {
      return 'vulnerability_analysis';
    }

    // Si la conversación previa fue sobre herramientas
    if (context.previousTopics.some(topic => 
      topic.includes('herramienta') || topic.includes('tool')
    )) {
      return 'tool_recommendation';
    }

    // Si la conversación previa fue sobre vulnerabilidades
    if (context.previousTopics.some(topic => 
      topic.includes('vulnerabilidad') || topic.includes('exploit')
    )) {
      return 'vulnerability_analysis';
    }
  }

  // Por defecto, es chat general
  return 'general_chat';
}

// Función para generar el prompt apropiado
export function generatePrompt(query: AIQuery): string {
  switch (query.type) {
    case 'security_report':
      return AI_PROMPTS.security_report(query.scanType!, query.scanData!);
    
    case 'general_chat':
      return AI_PROMPTS.general_chat(query.userMessage!);
    
    case 'vulnerability_analysis':
      return AI_PROMPTS.vulnerability_analysis(query.scanData!, query.context || '');
    
    case 'security_advice':
      return AI_PROMPTS.security_advice(query.userMessage!);
    
    case 'tool_recommendation':
      return AI_PROMPTS.tool_recommendation(query.context || '');
    
    case 'risk_assessment':
      return AI_PROMPTS.risk_assessment(query.scanData!);
    
    case 'technical_explanation':
      return AI_PROMPTS.technical_explanation(query.userMessage!, query.conversationHistory ? { conversationHistory: query.conversationHistory } as ConversationContext : undefined);
    
    case 'compliance_check':
      return AI_PROMPTS.compliance_check(query.userMessage!, query.conversationHistory ? { conversationHistory: query.conversationHistory } as ConversationContext : undefined);
    
    case 'incident_response':
      return AI_PROMPTS.incident_response(query.userMessage!, query.conversationHistory ? { conversationHistory: query.conversationHistory } as ConversationContext : undefined);
    
    case 'penetration_testing':
      return AI_PROMPTS.penetration_testing(query.userMessage!, query.conversationHistory ? { conversationHistory: query.conversationHistory } as ConversationContext : undefined);
    
    default:
      return AI_PROMPTS.general_chat(query.userMessage || '');
  }
}

// Función para procesar la consulta del usuario
export function processAIQuery(
  userMessage: string, 
  scanType?: string, 
  scanData?: any
): { prompt: string; queryType: AIQueryType } {
  const queryType = classifyQuery(userMessage, scanType, scanData);
  
  const query: AIQuery = {
    type: queryType,
    scanType,
    scanData,
    userMessage,
    context: userMessage
  };

  const prompt = generatePrompt(query);
  
  return { prompt, queryType };
}

// Sugerencias contextuales basadas en el tipo de consulta
export const CONTEXTUAL_SUGGESTIONS = {
  security_report: [
    "¿Cuál es el nivel de riesgo de estos hallazgos?",
    "¿Qué medidas de mitigación recomiendas?",
    "¿Necesito actualizar mi configuración de seguridad?",
    "¿Qué herramientas adicionales puedo usar?"
  ],
  general_chat: [
    "¿Puedes explicarme más sobre este tema?",
    "¿Qué herramientas recomiendas para esto?",
    "¿Cuáles son las mejores prácticas?",
    "¿Hay algún recurso adicional que pueda consultar?"
  ],
  vulnerability_analysis: [
    "¿Cómo puedo explotar esta vulnerabilidad?",
    "¿Qué contramedidas específicas debo implementar?",
    "¿Cuál es el impacto potencial de esta vulnerabilidad?",
    "¿Necesito notificar a alguien sobre esto?"
  ],
  security_advice: [
    "¿Puedes darme ejemplos prácticos?",
    "¿Qué herramientas me ayudan con esto?",
    "¿Cuáles son los errores más comunes?",
    "¿Cómo puedo verificar que estoy protegido?"
  ],
  tool_recommendation: [
    "¿Esta herramienta es gratuita?",
    "¿Cuál es la curva de aprendizaje?",
    "¿Hay alternativas más simples?",
    "¿Cómo se integra con mi flujo de trabajo?"
  ],
  risk_assessment: [
    "¿Cuál es la probabilidad de que esto ocurra?",
    "¿Qué impacto tendría en mi negocio?",
    "¿Cuáles son mis opciones de mitigación?",
    "¿Necesito un plan de respuesta a incidentes?"
  ],
  technical_explanation: [
    "¿Puedes darme un ejemplo práctico?",
    "¿Qué herramientas están relacionadas con esto?",
    "¿Cuáles son las mejores prácticas?",
    "¿Hay algún recurso para aprender más?"
  ],
  compliance_check: [
    "¿Qué consecuencias tiene no cumplir?",
    "¿Cuánto tiempo toma implementar esto?",
    "¿Necesito un auditor externo?",
    "¿Qué documentación necesito?"
  ],
  incident_response: [
    "¿Cuáles son los primeros pasos críticos?",
    "¿A quién debo notificar primero?",
    "¿Qué herramientas forenses necesito?",
    "¿Cómo documentar todo el proceso?"
  ],
  penetration_testing: [
    "¿Cuál es el alcance recomendado?",
    "¿Qué metodología debo seguir?",
    "¿Qué herramientas son esenciales?",
    "¿Cómo preparar el reporte final?"
  ]
};

// Función para obtener sugerencias contextuales
export function getContextualSuggestions(queryType: AIQueryType): string[] {
  return CONTEXTUAL_SUGGESTIONS[queryType] || CONTEXTUAL_SUGGESTIONS.general_chat;
} 