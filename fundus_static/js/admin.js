(function () {
  const C = window.FUNDUS_CONFIG;
  const API = `${C.SUPABASE_URL}/functions/v1/${C.ADMIN_FUNCTION_NAME}`;
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let sessions = [], last = {}, read = new Set(), selected = null, total = 0, accessToken = '';

  async function request(path, options = {}) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      location.replace('index.html');
      throw new Error('Authentication required.');
    }
    accessToken = session.access_token;
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        apikey: C.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    if (response.status === 401 || response.status === 403) {
      await sb.auth.signOut();
      location.replace('index.html');
      throw new Error('Admin permission required.');
    }
    if (!response.ok) throw new Error(`Admin API returned HTTP ${response.status}`);
    return response.json();
  }

  const pending = email => last[email]?.sender === 'user' && !read.has(email);
  function drawList() {
    $('#s-sess').textContent = sessions.length;
    $('#s-msgs').textContent = total;
    $('#s-pend').textContent = sessions.filter(pending).length;
    $('#list').innerHTML = sessions.length
      ? sessions.map(email => `<button class="sess ${email === selected ? 'on' : pending(email) ? 'new' : ''}" data-e="${esc(email)}">${pending(email) ? '● ' : ''}${esc(email)}</button>`).join('')
      : '<p style="color:#4b5563;font-size:.75rem;text-align:center;padding:2rem 0">No customer chats yet</p>';
  }

  async function loadSessions() {
    try {
      const data = await request('/chat/sessions');
      sessions = Array.isArray(data.sessions) ? data.sessions : [];
      total = 0;
      await Promise.all(sessions.map(async email => {
        const data = await request(`/chat/messages/${encodeURIComponent(email)}`);
        const messages = Array.isArray(data.messages) ? data.messages : [];
        total += messages.length;
        if (messages.length) last[email] = messages[messages.length - 1];
      }));
      drawList();
    } catch (error) { if (error.message !== 'Admin permission required.') console.error('[admin chat]', error); }
  }

  async function loadMessages() {
    if (!selected) return;
    try {
      const data = await request(`/chat/messages/${encodeURIComponent(selected)}`);
      const messages = Array.isArray(data.messages) ? data.messages : [];
      if (messages.length) last[selected] = messages[messages.length - 1];
      $('#msgs').innerHTML = messages.map(message => `<div class="m ${message.sender === 'agent' ? 'me' : ''}">${esc(message.text)}<div style="font-size:.65rem;opacity:.6;margin-top:.25rem">${message.sender === 'agent' ? 'You' : 'Customer'} · ${fmt(message.timestamp)}</div></div>`).join('');
      $('#msgs').scrollTop = $('#msgs').scrollHeight;
    } catch (error) { if (error.message !== 'Admin permission required.') console.error('[admin chat]', error); }
  }

  $('#list').addEventListener('click', event => {
    const button = event.target.closest('[data-e]');
    if (!button) return;
    selected = button.dataset.e;
    read.add(selected);
    $('#empty').style.display = 'none';
    $('#panel').style.display = 'flex';
    $('#who').textContent = selected;
    drawList();
    loadMessages();
  });

  $('#rf').addEventListener('submit', async event => {
    event.preventDefault();
    const text = $('#reply').value.trim();
    if (!text || !selected) return;
    $('#reply').value = '';
    try {
      await request('/chat/reply', { method: 'POST', body: JSON.stringify({ userEmail: selected, text }) });
      last[selected] = { sender: 'agent', text, timestamp: new Date().toISOString() };
      await loadMessages();
      drawList();
    } catch (error) { console.error('[admin reply]', error); }
  });

  $('#refresh').addEventListener('click', loadSessions);
  $('#out').addEventListener('click', async () => {
    await sb.auth.signOut();
    location.replace('index.html');
  });

  (async () => {
    const { data, error } = await sb.auth.getSession();
    if (error || !data.session) return location.replace('index.html');
    accessToken = data.session.access_token;
    try {
      await request('/chat/sessions');
      await loadSessions();
      setInterval(loadSessions, 8000);
      setInterval(loadMessages, 4000);
    } catch (error) {
      if (error.message !== 'Admin permission required.') console.error('[admin init]', error);
    }
  })();
})();
