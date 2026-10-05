import { useState, useEffect, useRef, useCallback } from 'react';
import { LogOut, MessageSquare, Users, BarChart2, Send, RefreshCw, Inbox } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '../../lib/supabase';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-3f69e9c8`;

async function authorizedFetch(path: string, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Your session has expired. Please sign in again.');
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      apikey: publicAnonKey,
      'Content-Type': 'application/json',
      ...init.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (response.status === 401 || response.status === 403) {
    await supabase.auth.signOut();
    throw new Error('Admin access is no longer authorized.');
  }
  if (!response.ok) throw new Error(`Chat service returned HTTP ${response.status}`);
  return response;
}

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
  const [pendingSessions, setPendingSessions] = useState<Set<string>>(new Set());
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scroll = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scroll, [messages]);

  // Fetch last message for a session to determine pending status
  const fetchLastMessage = useCallback(async (email: string) => {
    try {
      const res = await authorizedFetch(`/chat/messages/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        return data.messages.length;
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not load messages.'); }
    return 0;
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const res = await authorizedFetch('/chat/sessions');
      const data = await res.json();
      const list: string[] = Array.isArray(data.sessions) ? data.sessions : [];
      setSessions(list);
      setPendingSessions(new Set(Array.isArray(data.pending) ? data.pending : []));

      // Fetch last message for each session to compute pending badges
      let total = 0;
      await Promise.all(list.map(async (email) => {
        const count = await fetchLastMessage(email);
        total += count;
      }));
      setTotalMessages(total);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not load inbox.'); }
  }, [fetchLastMessage]);

  const loadMessages = useCallback(async (email: string) => {
    try {
      const res = await authorizedFetch(`/chat/messages/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not load conversation.'); }
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
    setPendingSessions((prev) => {
      const next = new Set(prev);
      next.delete(email);
      return next;
    });
    void authorizedFetch('/chat/read', {
      method: 'POST',
      body: JSON.stringify({ userEmail: email }),
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not update conversation status.'));
    loadMessages(email);
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedSession || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply('');
    try {
      await authorizedFetch('/chat/reply', {
        method: 'POST',
        body: JSON.stringify({ userEmail: selectedSession, text }),
      });
      setError('');
      await loadMessages(selectedSession);
      setPendingSessions((prev) => {
        const next = new Set(prev);
        next.delete(selectedSession);
        return next;
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Reply could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const isPending = (email: string) => pendingSessions.has(email);
  const pendingCount = sessions.filter(isPending).length;
  const fmt = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-5 sm:px-8 py-4 shrink-0"
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
            <div className="text-white font-bold text-sm">FundusEC Support</div>
            <div className="text-gray-500 text-xs">Admin workspace</div>
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

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-7 py-6 sm:py-8 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-red-400 text-xs font-semibold uppercase tracking-[.2em] mb-2">Customer care</div>
            <h1 className="text-white text-2xl sm:text-3xl font-semibold tracking-tight">Messages</h1>
            <p className="text-gray-500 text-sm mt-1">Manage customer conversations in one place.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live inbox · refreshes automatically
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5" aria-label="Support metrics">
          {[
            { icon: Users, label: 'Conversations', value: sessions.length, hint: 'Customer threads' },
            { icon: MessageSquare, label: 'Messages', value: totalMessages, hint: 'Across all conversations' },
            { icon: BarChart2, label: 'Needs reply', value: pendingCount, hint: 'Waiting for your response' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl px-4 py-4 sm:px-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(220,38,38,0.14)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <metric.icon size={18} className="text-red-400" />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 text-xs font-medium">{metric.label}</div>
                <div className="text-white text-2xl font-semibold leading-tight mt-0.5">{metric.value}</div>
                <div className="text-gray-600 text-[11px] mt-0.5">{metric.hint}</div>
              </div>
            </div>
          ))}
        </section>

        {error && <div role="alert" className="mb-4 rounded-xl px-4 py-3 text-sm text-red-200" style={{ background: 'rgba(127,29,29,.25)', border: '1px solid rgba(248,113,113,.2)' }}>{error}</div>}

      <div className="flex flex-col md:flex-row flex-1 min-h-[520px] overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(255,255,255,.09)', background: 'rgba(10,10,12,.72)', boxShadow: '0 24px 80px rgba(0,0,0,.25)' }}>
        {/* Sidebar */}
        <aside className="w-full md:w-[280px] lg:w-[340px] max-h-[38vh] md:max-h-none flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-white/[.07]" style={{ background: 'rgba(0,0,0,0.22)' }}>
          {/* Session list */}
          <div className="px-3 pt-4">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" aria-label="Search conversations" className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none" style={{ background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.08)' }} />
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Inbox <span className="text-gray-700">({sessions.length})</span></span>
              <button onClick={loadSessions} aria-label="Refresh inbox" className="text-gray-600 hover:text-gray-300 transition p-1 rounded-md">
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
                {sessions.filter((email) => email.toLowerCase().includes(search.trim().toLowerCase())).map((email) => {
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
        <section className="flex-1 min-h-[360px] min-w-0 flex flex-col overflow-hidden" aria-label="Selected conversation">
          {!selectedSession ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.07)' }}><MessageSquare className="text-gray-600" size={26} /></div>
              <div><div className="text-gray-300 text-sm font-medium">Your inbox is ready</div><div className="text-gray-600 text-xs mt-1">Choose a conversation to view and reply.</div></div>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: 'rgba(220,38,38,0.3)' }}>
                  {selectedSession[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{selectedSession}</div>
                  <div className="text-gray-500 text-xs">Customer conversation · {messages.length} messages</div>
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
        </section>
      </div>
      </main>
    </div>
  );
}
