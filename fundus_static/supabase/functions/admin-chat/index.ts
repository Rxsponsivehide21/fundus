import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'GET' && request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: 'Server configuration is incomplete' }, 500);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);

  // Validate the caller's access token with Supabase Auth; never trust client-supplied identity or role.
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return json({ error: 'Invalid or expired session' }, 401);

  // Role assignment is held in a table inaccessible to browser clients.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: role, error: roleError } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();
  if (roleError) {
    console.error('Admin role lookup failed:', roleError.message);
    return json({ error: 'Unable to verify admin permission' }, 500);
  }
  if (!role) return json({ error: 'Admin permission required' }, 403);

  // Keep the existing chat implementation as the data service, but only expose its admin routes
  // through this function. The legacy function's admin routes must also be removed or protected.
  const functionName = Deno.env.get('CHAT_FUNCTION_NAME') ?? 'make-server-3f69e9c8';
  const incomingUrl = new URL(request.url);
  const route = incomingUrl.pathname.split('/').slice(4).join('/');
  if (!['chat/sessions', 'chat/reply'].includes(route) && !/^chat\/messages\/[^/]+$/.test(route)) {
    return json({ error: 'Not found' }, 404);
  }

  const upstreamUrl = `${supabaseUrl}/functions/v1/${functionName}/${route}${incomingUrl.search}`;
  const upstreamHeaders = new Headers({
    'Content-Type': 'application/json',
    apikey: anonKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  });
  const body = request.method === 'POST' ? await request.text() : undefined;
  const upstream = await fetch(upstreamUrl, { method: request.method, headers: upstreamHeaders, body });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { ...corsHeaders, 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  });
});
