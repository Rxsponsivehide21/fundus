import { useState, useEffect, useRef, useCallback } from 'react';
import { LogOut, MessageSquare, Users, BarChart2, Send, RefreshCw, Inbox } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-3f69e9c8`;
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` };

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [sessions, setSessions] = useState<string[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, Message | null>>({});
  const [readSessions, setReadSessions] = useState<Set<string>>(new Set());
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scroll = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scroll, [messages]);

  // Fetch last message for a session to determine pending status
  const fetchLastMessage = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API}/chat/messages/${encodeURIComponent(email)}`, { headers: H });
      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setLastMessages((prev) => ({ ...prev, [email]: data.messages[data.messages.length - 1] }));
        return data.messages.length;
      }
    } catch {}
    return 0;
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/chat/sessions`, { headers: H });
      const data = await res.json();
      const list: string[] = Array.isArray(data.sessions) ? data.sessions : [];
      setSessions(list);

      // Fetch last message for each session to compute pending badges
      let total = 0;
      await Promise.all(list.map(async (email) => {
        const count = await fetchLastMessage(email);
        total += count;
      }));
      setTotalMessages(total);
    } catch {}
  }, [fetchLastMessage]);

  const loadMessages = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API}/chat/messages/${encodeURIComponent(email)}`, { headers: H });
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
        // Update last message for badge
        if (data.messages.length > 0) {
          setLastMessages((prev) => ({ ...prev, [email]: data.messages[data.messages.length - 1] }));
        }
      }
    } catch {}
  }, []);

  // Load sessions on mount + poll every 8s
  useEffect(() => {
    loadSessions();
    const t = setInterval(loadSessions, 8000);
    return () => clearInterval(t);
  }, [loadSessions]);

  // Poll active conversation every 4s
  useEffect(() => {
    if (!selectedSession) return;
    loadMessages(selectedSession);
    const t = setInterval(() => loadMessages(selectedSession), 4000);
    return () => clearInterval(t);
  }, [selectedSession, loadMessages]);

  const selectSession = (email: string) => {
    setSelectedSession(email);
    setReadSessions((prev) => new Set(prev).add(email));
    loadMessages(email);
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedSession || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply('');
    try {
      await fetch(`${API}/chat/reply`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ userEmail: selectedSession, text }),
      });
      await loadMessages(selectedSession);
      // After replying, update the last message so badge clears
      setLastMessages((prev) => ({
        ...prev,
        [selectedSession]: { id: Date.now().toString(), text, sender: 'agent', timestamp: new Date().toISOString() },
      }));
    } catch {
    } finally {
      setSending(false);
    }
  };

  // A session is pending if: last message is from 'user' AND not currently selected (unread)
  const isPending = (email: string) => {
    const last = lastMessages[email];
    return last?.sender === 'user' && !readSessions.has(email);
  };

  const pendingCount = sessions.filter(isPending).length;
  const fmt = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{
          background: 'rgba(0,0,0,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
            <span className="text-white font-bold text-base">F</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm">FundusEC</div>
            <div className="text-gray-500 text-xs">Owner Dashboard</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <LogOut size={15} /> Sign out
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 flex flex-col shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.4)' }}>
          {/* Stats */}
          <div className="p-4 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Overview</div>
            {[
              { icon: Users, label: 'Chat Sessions', value: sessions.length },
              { icon: MessageSquare, label: 'Total Messages', value: totalMessages },
              { icon: BarChart2, label: 'Pending Replies', value: pendingCount },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(220,38,38,0.15)' }}>
                  <s.icon size={15} className="text-red-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-base leading-none">{s.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Inbox</span>
              <button onClick={loadSessions} className="text-gray-600 hover:text-gray-400 transition">
                <RefreshCw size={13} />
              </button>
            </div>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="text-gray-700 mx-auto mb-2" size={28} />
                <p className="text-gray-600 text-xs">No customer chats yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((email) => {
                  const pending = isPending(email);
                  const isSelected = selectedSession === email;
                  return (
                    <button
                      key={email}
                      onClick={() => selectSession(email)}
                      className="w-full text-left px-3 py-3 rounded-xl transition-all"
                      style={
                        isSelected
                          ? { background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }
                          : pending
                          ? { background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: 'rgba(220,38,38,0.3)' }}
                          >
                            {email[0].toUpperCase()}
                          </div>
                          {pending && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-950" style={{ background: '#ef4444' }} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-medium truncate ${pending ? 'text-white' : 'text-gray-300'}`}>{email}</div>
                          <div className="text-xs" style={{ color: pending ? '#f87171' : '#4b5563' }}>
                            {pending ? 'New message' : 'Customer'}
                          </div>
                        </div>
                        {pending && <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: '#ef4444' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Chat panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedSession ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <MessageSquare className="text-gray-700" size={48} />
              <div className="text-gray-500 text-sm">Select a conversation to start replying</div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: 'rgba(220,38,38,0.3)' }}>
                  {selectedSession[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{selectedSession}</div>
                  <div className="text-gray-500 text-xs">{messages.length} messages</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%]">
                      <div
                        className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                        style={
                          msg.sender === 'agent'
                            ? { background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff', borderBottomRightRadius: '4px' }
                            : { background: 'rgba(255,255,255,0.08)', color: '#e5e7eb', borderBottomLeftRadius: '4px' }
                        }
                      >
                        {msg.text}
                      </div>
                      <div className={`text-xs text-gray-600 mt-1 ${msg.sender === 'agent' ? 'text-right' : 'text-left'}`}>
                        {msg.sender === 'agent' ? 'You' : 'Customer'} · {fmt(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={sendReply}
                className="flex items-center gap-3 px-4 py-4 shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}
              >
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={`Reply to ${selectedSession}...`}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button
                  type="submit"
                  disabled={!reply.trim() || sending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
                >
                  <Send size={15} />
                  {sending ? 'Sending...' : 'Reply'}
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
