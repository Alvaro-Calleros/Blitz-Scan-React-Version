import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getContextualSuggestions, AIQueryType } from '../utils/blitzScanAI';

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
  messages: { sender: 'user' | 'bot'; text: string }[];
  loading?: boolean;
  children?: React.ReactNode;
  onSaveReport?: (reportText: string) => void;
  isReportGenerated?: boolean;
  onSendMessage?: (message: string) => void;
  currentQueryType?: AIQueryType;
  scanAlreadySaved?: boolean; // Nueva prop para saber si el escaneo ya fue guardado
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ 
  open, 
  onClose, 
  messages, 
  loading, 
  children, 
  onSaveReport,
  isReportGenerated = false,
  onSendMessage,
  currentQueryType = 'general_chat',
  scanAlreadySaved = false
}) => {
  const lastBotMsg = messages.filter(m => m.sender === 'bot').slice(-1)[0]?.text || '';
  
  const handleCopy = () => {
    if (lastBotMsg) {
      navigator.clipboard.writeText(lastBotMsg);
    }
  };
  
  const handleSave = () => {
    if (lastBotMsg && onSaveReport) {
      onSaveReport(lastBotMsg);
    }
  };

  // Obtener sugerencias contextuales basadas en el tipo de consulta
  const suggestionMessages = getContextualSuggestions(currentQueryType);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSendMessage) {
      onSendMessage(suggestion);
    }
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay para cerrar */}
      <div className="flex-1 bg-black bg-opacity-40" onClick={onClose}></div>
      
      {/* Panel lateral de IA */}
      <div className="w-[30%] min-w-[400px] bg-white shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <img src="/Logo.svg" alt="Blitz Scan Logo" className="w-10 h-10 rounded-lg shadow" />
            <span className="text-2xl"></span>
            <div>
              <h2 className="text-lg font-bold">BlitzScan IA</h2>
              <p className="text-xs opacity-90">Asistente de Ciberseguridad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl font-bold"
            aria-label="Cerrar chatbot"
          >
            ×
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.sender === 'bot' ? (
                  <ReactMarkdown 
                    components={{
                      p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      code: ({children}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">{children}</code>,
                      pre: ({children}) => <pre className="bg-gray-200 p-2 rounded text-sm overflow-x-auto">{children}</pre>,
                      ul: ({children}) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                      li: ({children}) => <li className="text-sm">{children}</li>
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <span className="text-sm">{msg.text}</span>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          {/* Sugerencias después de generar un reporte */}
          {isReportGenerated && lastBotMsg && !loading && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center">💡 Sugerencias:</p>
              <div className="flex flex-wrap gap-2">
                {suggestionMessages.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        {lastBotMsg && !loading && isReportGenerated && !scanAlreadySaved && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                📋 Copiar
              </button>
              {onSaveReport && (
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  💾 Guardar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input de chat */}
        {children && (
          <div className="p-4 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotModal; 