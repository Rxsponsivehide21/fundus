import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3f69e9c8`;
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` };

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function CustomerCareChat({ isOpen, onClose, userEmail }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollBottom, [messages]);

  const fetchMessages = useCallback(async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`${BASE}/chat/messages/${encodeURIComponent(userEmail)}`, { headers: H });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
        setError(null);
      }
    } catch (e) {
      console.error('[Chat] fetch error:', e);
      setError('Could not connect to support. Please try again.');
    }
  }, [userEmail]);

  // Load on open + poll every 4s
  useEffect(() => {
    if (!isOpen || !userEmail) return;
    fetchMessages();
    const t = setInterval(fetchMessages, 4000);
    return () => clearInterval(t);
  }, [isOpen, userEmail, fetchMessages]);

  if (!isOpen) return null;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userEmail || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setError(null);

    // Optimistic UI
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`${BASE}/chat/send`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ userEmail, text, sender: 'user' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchMessages(); // Sync with server (removes optimistic, gets real)
    } catch (e) {
      console.error('[Chat] send error:', e);
      setError('Failed to send message. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const fmt = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl w-[calc(100vw-2rem)] sm:w-96"
      style={{
        background: 'rgba(8,8,8,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(24px)',
        maxHeight: '520px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 shrink-0"
        style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <MessageCircle size={15} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">FundusEC Support</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white/80 text-xs">Live — we reply fast</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition p-1">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0, maxHeight: '380px' }}>
        {/* Welcome note - always shown */}
        <div className="text-center">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs text-gray-500"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            Chat started — a team member will reply shortly
          </span>
        </div>

        {messages.length === 0 && !error && (
          <div className="flex justify-start">
            <div
              className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm text-gray-300"
              style={{ background: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: '4px' }}
            >
              Hi! Welcome to FundusEC. How can we help you today?
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[80%]">
              <div
                className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  msg.sender === 'user'
                    ? {
                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                        color: '#fff',
                        borderBottomRightRadius: '4px',
                        opacity: msg.id.startsWith('tmp-') ? 0.7 : 1,
                      }
                    : {
                        background: 'rgba(255,255,255,0.09)',
                        color: '#e5e7eb',
                        borderBottomLeftRadius: '4px',
                      }
                }
              >
                {msg.text}
              </div>
              <div className={`text-xs text-gray-600 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {fmt(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {error && (
          <div className="text-center">
            <span className="text-red-400 text-xs">{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 px-3 py-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 shrink-0"
          style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
        >
          {sending ? <Loader2 size={13} className="text-white animate-spin" /> : <Send size={13} className="text-white" />}
        </button>
      </form>
    </motion.div>
  );
}
