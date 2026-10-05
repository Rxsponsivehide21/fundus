(function () {
  const C = window.FUNDUS_CONFIG;
  const API = `${C.SUPABASE_URL}/functions/v1/${C.FUNCTION_NAME}`;
  const HDR = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + C.SUPABASE_ANON_KEY };
  const sb = window.supabase && window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, {
    auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }
  });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let user = null;
  if (!sb) console.error('supabase-js failed to load (check your internet connection / CDN access)');
  const need = () => { if (!sb) { toast('Could not reach the auth service. Please refresh and try again.', 1); return true; } };

  function toast(msg, err) {
    const d = document.createElement('div');
    if (err) d.className = 'err';
    d.textContent = msg; $('#toast').appendChild(d);
    setTimeout(() => d.remove(), 4000);
  }

  // Background orbs
  $('#bg').innerHTML = [[10, 20, 600], [70, 60, 500], [40, 80, 400], [85, 10, 350]]
    .map(([x, y, s], i) => `<div class="orb" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${i * 1.5}s;animation-duration:${14 + i * 3}s"></div>`).join('');

  // Ticker (static sample data, same as original)
  const T = [['EUR/USD', '1.0842', '+0.12%', 1], ['GBP/USD', '1.2731', '+0.08%', 1], ['USD/JPY', '149.62', '-0.21%', 0], ['XAU/USD', '2,384.50', '+0.64%', 1], ['BTC/USD', '67,214', '+2.35%', 1], ['ETH/USD', '3,412', '+1.18%', 1], ['US30', '38,912', '-0.14%', 0], ['NAS100', '17,845', '+0.47%', 1], ['WTI/USD', '78.34', '-0.32%', 0], ['AUD/USD', '0.6512', '+0.05%', 1]];
  const row = T.map(([s, p, c, u]) => `<div class="ti"><b style="color:#d1d5db">${s}</b><b>${p}</b><span class="${u ? 'up' : 'dn'}">${u ? '▲' : '▼'} ${c}</span></div>`).join('');
  $('#ticker').innerHTML = row + row;

  // Pricing
  const P = [['$10K', 155, '$10,000', '80%'], ['$25K', 275, '$25,000', '80%'], ['$50K', 425, '$50,000', '80%', 1], ['$100K', 575, '$100,000', '80%'], ['$200K', '1,275', '$200,000', '90%']];
  $('#plans').innerHTML = P.map(([n, f, b, s, pop]) => `
    <div class="plan glass${pop ? ' pop' : ''}">
      ${pop ? '<div class="tag">Most Popular</div>' : ''}
      <h3>${n}</h3><small>${b} Account</small>
      <div class="fee"><p>One-time fee</p><b>$${f}</b><span class="red" style="font-size:.75rem">Refunded at first payout</span></div>
      <p>Account Balance</p><b>${b}</b><p>Your Profit Share</p><b class="red">${s}</b>
      <button data-start>Start Now</button>
    </div>`).join('');
  const mq = P.map(([n, f, , , pop]) => `<span class="${pop ? 'hot' : ''}">${pop ? '🔥 ' : ''}${n} ACCOUNT — $${f} <i style="opacity:.2;margin-left:1rem">•</i></span>`)
    .concat(['UP TO 90% PROFIT SPLIT', 'REFUNDABLE FEE AT FIRST PAYOUT'].map(t => `<span>${t} <i style="opacity:.2;margin-left:1rem">•</i></span>`)).join('');
  $('#marq').innerHTML = mq + mq;

  // Auth UI
  function renderAuth() {
    const name = user && (user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0]);
    const ini = user ? (name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?') : '';
    $('#auth').innerHTML = user
      ? `<button class="btn ghost" id="ubtn"><span class="avatar">${esc(ini)}</span> ${esc(name)} ▾</button>
         <div id="umenu"><div style="padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,.07);font-size:.75rem;color:#6b7280">${esc(user.email)}</div><button data-logout>Sign out</button></div>`
      : `<button class="btn ghost" data-open="m-login">Login</button><button class="btn" data-open="m-register">Get Started</button>`;
    $('#mobile').innerHTML = `<a href="#pricing">Pricing</a><a href="#rules">Trading Rules</a>` + (user
      ? `<button class="btn ghost" data-logout>Sign out (${esc(user.email)})</button>`
      : `<button class="btn ghost" data-open="m-login">Login</button><button class="btn" data-open="m-register">Get Started</button>`);
    const ub = $('#ubtn'); if (ub) ub.onclick = () => $('#umenu').classList.toggle('open');
  }

  const open = id => { $$('.modal.open').forEach(m => m.classList.remove('open')); $('#' + id).classList.add('open'); $('#mobile').classList.remove('open'); };
  const closeAll = () => { $$('.modal.open').forEach(m => m.classList.remove('open')); $('#reg-form').hidden = false; $('#reg-ok').hidden = true; };

  document.addEventListener('click', e => {
    const t = e.target;
    const o = t.closest('[data-open]'); if (o) return open(o.dataset.open);
    const s = t.closest('[data-switch]'); if (s) return open(s.dataset.switch);
    if (t.closest('[data-close]') || t.classList.contains('modal')) return closeAll();
    if (t.closest('[data-start]')) return user ? openChat() : open('m-register');
    if (t.closest('[data-logout]')) { if (sb) sb.auth.signOut(); user = null; renderAuth(); closeChat(); return; }
    if (t.closest('[data-close-chat]')) return closeChat();
    if (t.closest('#burger')) return $('#mobile').classList.toggle('open');
    if (!t.closest('#umenu') && !t.closest('#ubtn')) { const m = $('#umenu'); if (m) m.classList.remove('open'); }
  });

  $('#f-login').addEventListener('submit', async e => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(e.target));
    if (!email.includes('@')) return toast('Please enter a valid email address', 1);
    if (need()) return;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return toast(error.message, 1);
    toast('Welcome back!'); closeAll(); e.target.reset();
  });

  $('#f-register').addEventListener('submit', async e => {
    e.preventDefault();
    const { email, password, confirm } = Object.fromEntries(new FormData(e.target));
    if (password !== confirm) return toast('Passwords do not match', 1);
    if (password.length < 6) return toast('Password must be at least 6 characters', 1);
    if (need()) return;
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) return toast(error.message, 1);
    if (data.user) { $('#reg-email').textContent = email; $('#reg-form').hidden = true; $('#reg-ok').hidden = false; e.target.reset(); }
  });

  // Chat
  let poll, msgs = [];
  const fmt = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  function drawChat() {
    const box = $('#chat-msgs');
    box.innerHTML = `<div style="text-align:center;font-size:.75rem;color:#6b7280">Chat started — a team member will reply shortly</div>` +
      (msgs.length ? '' : '<div class="m">Hi! Welcome to FundusEC. How can we help you today?</div>') +
      msgs.map(m => `<div class="m ${m.sender === 'user' ? 'user' : ''}">${esc(m.text)}<div style="font-size:.65rem;opacity:.6;margin-top:.25rem">${fmt(m.timestamp)}</div></div>`).join('');
    box.scrollTop = box.scrollHeight;
  }
  async function fetchMsgs() {
    try {
      const r = await fetch(`${API}/chat/messages/${encodeURIComponent(user.email)}`, { headers: HDR });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json(); if (Array.isArray(d.messages)) { msgs = d.messages; drawChat(); }
    } catch (err) { console.error('[chat]', err); if (!msgs.length) $('#chat-msgs').insertAdjacentHTML('beforeend', '<div style="text-align:center;font-size:.75rem;color:#f87171">Could not connect to support. Please try again.</div>'); }
  }
  function openChat() { $('#chat').classList.add('open'); drawChat(); fetchMsgs(); clearInterval(poll); poll = setInterval(fetchMsgs, 4000); }
  function closeChat() { $('#chat').classList.remove('open'); clearInterval(poll); }
  $('#chat-form').addEventListener('submit', async e => {
    e.preventDefault();
    const inp = $('#chat-input'), text = inp.value.trim(); if (!text || !user) return;
    inp.value = ''; msgs.push({ id: 'tmp', text, sender: 'user', timestamp: new Date().toISOString() }); drawChat();
    try {
      const r = await fetch(`${API}/chat/send`, { method: 'POST', headers: HDR, body: JSON.stringify({ userEmail: user.email, text, sender: 'user' }) });
      if (!r.ok) throw 0; fetchMsgs();
    } catch { toast('Failed to send message. Please try again.', 1); msgs = msgs.filter(m => m.id !== 'tmp'); drawChat(); }
  });

  // Session
  if (sb) sb.auth.onAuthStateChange((_ev, s) => { user = s?.user ?? null; renderAuth(); });
  (async () => {
    if (!sb) return renderAuth();
    const code = new URLSearchParams(location.search).get('code');
    if (code) { const { data, error } = await sb.auth.exchangeCodeForSession(code); if (!error && data.session) user = data.session.user; history.replaceState({}, document.title, location.pathname); }
    else { const { data } = await sb.auth.getSession(); user = data.session?.user ?? null; }
    renderAuth();
  })();
  renderAuth();

  // Connection check (see browser console)
  fetch(`${API}/health`, { headers: HDR }).then(r => r.json()).then(d => console.log('[Supabase] edge function:', d.status === 'ok' ? 'connected' : d)).catch(e => console.warn('[Supabase] edge function unreachable:', e.message));
})();
