import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setShowPulse(false);
    }
  }, [isOpen]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "👋 Assalam o Alaikum! I'm your **SHMS AI Assistant**.\n\nI can help you with:\n• 🏠 Room availability & details\n• 📋 Application status\n• 📢 Hostel notices\n• 🔧 Complaint information\n• ❓ General hostel queries\n\nHow can I help you today?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(trimmed);
      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: response.data.timestamp
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ ${errorMsg}`,
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    try {
      await chatService.clearHistory();
    } catch (e) {
      // ignore
    }
    setMessages([{
      role: 'assistant',
      content: "🔄 Conversation cleared! How can I help you?",
      timestamp: new Date().toISOString()
    }]);
  };

  // Simple markdown-like rendering for bold and lists
  const renderContent = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (processed.startsWith('• ') || processed.startsWith('- ')) {
        processed = `<span style="display:block;padding-left:8px">${processed}</span>`;
      }
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* ===== STYLES ===== */}
      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatBtn {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .chat-widget-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af);
          color: white;
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: ${showPulse ? 'chatPulse 2s infinite, ' : ''}floatBtn 3s ease-in-out infinite;
        }
        .chat-widget-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 12px 35px rgba(37, 99, 235, 0.5);
        }
        .chat-widget-btn.open {
          animation: none;
          transform: rotate(0deg);
        }
        .chat-window {
          position: fixed;
          bottom: 96px;
          right: 24px;
          z-index: 9998;
          width: 400px;
          max-width: calc(100vw - 32px);
          height: 560px;
          max-height: calc(100vh - 120px);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          animation: chatSlideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .chat-header {
          background: linear-gradient(135deg, #1e3a5f, #1e40af, #2563eb);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .chat-header-info h3 {
          color: white;
          font-size: 15px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .chat-header-info p {
          color: rgba(255, 255, 255, 0.75);
          font-size: 12px;
          margin: 2px 0 0;
        }
        .chat-header-actions {
          display: flex;
          gap: 6px;
        }
        .chat-header-actions button {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          font-size: 14px;
        }
        .chat-header-actions button:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f8fafc;
        }
        .chat-messages::-webkit-scrollbar {
          width: 5px;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .chat-msg {
          display: flex;
          gap: 8px;
          animation: chatFadeIn 0.3s ease;
          max-width: 88%;
        }
        .chat-msg.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .chat-msg-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .chat-msg.assistant .chat-msg-avatar {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
        }
        .chat-msg.user .chat-msg-avatar {
          background: linear-gradient(135deg, #64748b, #475569);
          color: white;
        }
        .chat-msg-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          word-wrap: break-word;
        }
        .chat-msg.assistant .chat-msg-bubble {
          background: white;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-top-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .chat-msg.assistant .chat-msg-bubble.error {
          background: #fef2f2;
          border-color: #fecaca;
          color: #991b1b;
        }
        .chat-msg.user .chat-msg-bubble {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-top-right-radius: 4px;
        }
        .chat-msg-bubble strong {
          font-weight: 600;
        }
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 4px;
          animation: chatFadeIn 0.3s ease;
        }
        .typing-dots {
          display: flex;
          gap: 4px;
          background: white;
          padding: 10px 16px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          border-top-left-radius: 4px;
        }
        .typing-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #94a3b8;
          display: block;
        }
        .typing-dots span:nth-child(1) { animation: typingDot 1.4s infinite 0s; }
        .typing-dots span:nth-child(2) { animation: typingDot 1.4s infinite 0.2s; }
        .typing-dots span:nth-child(3) { animation: typingDot 1.4s infinite 0.4s; }
        .chat-input-area {
          padding: 12px 16px;
          border-top: 1px solid #e2e8f0;
          background: white;
          display: flex;
          gap: 8px;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .chat-input-area textarea {
          flex: 1;
          resize: none;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13.5px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          max-height: 80px;
          line-height: 1.4;
          background: #f8fafc;
        }
        .chat-input-area textarea:focus {
          border-color: #2563eb;
          background: white;
        }
        .chat-input-area textarea::placeholder {
          color: #94a3b8;
        }
        .chat-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .chat-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }
        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .chat-window {
            bottom: 0;
            right: 0;
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          .chat-widget-btn {
            bottom: 16px;
            right: 16px;
            width: 54px;
            height: 54px;
          }
        }
      `}</style>

      {/* ===== FLOATING BUTTON ===== */}
      <button
        className={`chat-widget-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with AI Assistant"
        id="ai-chat-toggle"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {/* ===== CHAT WINDOW ===== */}
      {isOpen && (
        <div className="chat-window" id="ai-chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">🤖</div>
              <div className="chat-header-info">
                <h3>SHMS AI Assistant</h3>
                <p>● Online — Powered by AI</p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button onClick={handleClear} title="Clear Chat">
                🗑️
              </button>
              <button onClick={() => setIsOpen(false)} title="Close">
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages" id="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.role}`}>
                <div className="chat-msg-avatar">
                  {msg.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div className={`chat-msg-bubble ${msg.isError ? 'error' : ''}`}>
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <div className="chat-msg-avatar" style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: 'white', flexShrink: 0
                }}>🤖</div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about rooms, notices, complaints..."
              rows={1}
              maxLength={1000}
              disabled={isLoading}
              id="ai-chat-input"
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              title="Send"
              id="ai-chat-send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
