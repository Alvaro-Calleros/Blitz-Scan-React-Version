import React from 'react';

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
  messages: { sender: 'user' | 'bot'; text: string }[];
  loading?: boolean;
  children?: React.ReactNode;
  onSaveReport?: (reportText: string) => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ open, onClose, messages, loading, children, onSaveReport }) => {
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-10 relative animate-fadeInUp min-h-[400px] min-w-[400px]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
          aria-label="Cerrar chatbot"
        >
          ×
        </button>
        <div className="flex items-center gap-4 mb-4">
          <img src="/Logo.svg" alt="Blitz Scan Logo" className="w-12 h-12 rounded-xl shadow" />
          <h2 className="text-3xl font-bold text-blue-700">Blitz Scan IA</h2>
        </div>
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-xl px-4 py-2 text-base max-w-[90%] ${
                msg.sender === 'user'
                  ? 'bg-blue-100 self-end text-right'
                  : msg.text.toLowerCase().includes('error')
                  ? 'bg-red-100 text-red-700 self-start text-left'
                  : 'bg-gray-100 self-start text-left'
              }`}
            >
              {msg.sender === 'bot' ? (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {msg.text}
                </pre>
              ) : (
                msg.text
              )}
            </div>
          ))}
          {loading && (
            <div className="rounded-xl px-4 py-2 text-base max-w-[90%] bg-gray-100 self-start text-left flex items-center gap-2 text-gray-500">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando reporte...
            </div>
          )}
        </div>
        {lastBotMsg && !loading && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              Copiar reporte
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
            >
              Guardar reporte
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default ChatbotModal; 