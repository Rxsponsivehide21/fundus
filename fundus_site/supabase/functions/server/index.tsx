// v5
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

app.get("/make-server-3f69e9c8/health", (c) => c.json({ status: "ok" }));

type AuthUser = { id: string; email?: string };

async function getCaller(request: Request): Promise<AuthUser | null> {
  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization?.startsWith("Bearer ") || !supabaseUrl || !anonKey) return null;

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user?.email) return null;
  return { id: user.id, email: user.email };
}

async function isAdmin(userId: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase server configuration is incomplete");

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(`Admin role lookup failed: ${error.message}`);
  return Boolean(data);
}

async function requireAdmin(c: any): Promise<AuthUser | Response> {
  const user = await getCaller(c.req.raw);
  if (!user) return c.json({ error: "Authentication required" }, 401);
  if (!(await isAdmin(user.id))) return c.json({ error: "Admin permission required" }, 403);
  return user;
}

app.get("/make-server-3f69e9c8/admin/access", async (c) => {
  try {
    const authorization = await requireAdmin(c);
    if (authorization instanceof Response) return authorization;
    return c.json({ allowed: true });
  } catch (e) {
    console.error("Admin access check failed:", e);
    return c.json({ error: "Unable to verify admin permission" }, 500);
  }
});

// Send a message from a user — marks session as pending
app.post("/make-server-3f69e9c8/chat/send", async (c) => {
  try {
    const user = await getCaller(c.req.raw);
    if (!user) return c.json({ error: "Authentication required" }, 401);
    const { text } = await c.req.json();
    if (typeof text !== "string" || !text.trim()) return c.json({ error: "Message text is required" }, 400);
    if (text.length > 4000) return c.json({ error: "Message is too long" }, 413);
    const userEmail = user.email!.toLowerCase();

    const sessionKey = `chat:${userEmail}`;
    const existing = await kv.get(sessionKey) as any[] | null;
    const messages = Array.isArray(existing) ? existing : [];

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: text.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    messages.push(message);
    await kv.set(sessionKey, messages);

    // Track active sessions
    const sessionsKey = "chat:sessions";
    const sessions = await kv.get(sessionsKey) as string[] | null;
    const sessionList = Array.isArray(sessions) ? sessions : [];
    if (!sessionList.includes(userEmail)) {
      sessionList.push(userEmail);
      await kv.set(sessionsKey, sessionList);
    }

    // Mark session as pending (user sent message, waiting for agent)
    if (sender === "user") {
      const pendingKey = "chat:pending";
      const pending = await kv.get(pendingKey) as string[] | null;
      const pendingList = Array.isArray(pending) ? pending : [];
      if (!pendingList.includes(userEmail)) {
        pendingList.push(userEmail);
        await kv.set(pendingKey, pendingList);
      }
    }

    return c.json({ ok: true, message });
  } catch (e) {
    console.log("Error in /chat/send:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// Get messages for a specific user session
app.get("/make-server-3f69e9c8/chat/messages/:userEmail", async (c) => {
  try {
    const caller = await getCaller(c.req.raw);
    if (!caller) return c.json({ error: "Authentication required" }, 401);
    const userEmail = c.req.param("userEmail").toLowerCase();
    if (caller.email!.toLowerCase() !== userEmail && !(await isAdmin(caller.id))) {
      return c.json({ error: "Forbidden" }, 403);
    }
    const messages = await kv.get(`chat:${userEmail}`);
    return c.json({ messages: messages ?? [] });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// Get all chat sessions with pending flags (admin)
app.get("/make-server-3f69e9c8/chat/sessions", async (c) => {
  try {
    const authorization = await requireAdmin(c);
    if (authorization instanceof Response) return authorization;
    const [sessions, pending] = await Promise.all([
      kv.get("chat:sessions") as Promise<string[] | null>,
      kv.get("chat:pending") as Promise<string[] | null>,
    ]);
    return c.json({
      sessions: sessions ?? [],
      pending: pending ?? [],
    });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// Mark session as read (admin opened it) — clears pending badge
app.post("/make-server-3f69e9c8/chat/read", async (c) => {
  try {
    const authorization = await requireAdmin(c);
    if (authorization instanceof Response) return authorization;
    const { userEmail } = await c.req.json();
    if (!userEmail) return c.json({ error: "Missing userEmail" }, 400);
    const pending = await kv.get("chat:pending") as string[] | null;
    const pendingList = Array.isArray(pending) ? pending.filter((e) => e !== userEmail) : [];
    await kv.set("chat:pending", pendingList);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// Owner replies to a user — clears pending flag
app.post("/make-server-3f69e9c8/chat/reply", async (c) => {
  try {
    const authorization = await requireAdmin(c);
    if (authorization instanceof Response) return authorization;
    const { userEmail, text } = await c.req.json();
    if (typeof userEmail !== "string" || typeof text !== "string" || !text.trim()) return c.json({ error: "Missing fields" }, 400);
    if (text.length > 4000) return c.json({ error: "Message is too long" }, 413);
    const targetEmail = userEmail.toLowerCase();

    const sessionKey = `chat:${targetEmail}`;
    const existing = await kv.get(sessionKey) as any[] | null;
    const messages = Array.isArray(existing) ? existing : [];

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: text.trim(),
      sender: "agent",
      timestamp: new Date().toISOString(),
    };
    messages.push(message);
    await kv.set(sessionKey, messages);

    // Clear pending for this session
    const pending = await kv.get("chat:pending") as string[] | null;
    const pendingList = Array.isArray(pending) ? pending.filter((e) => e !== targetEmail) : [];
    await kv.set("chat:pending", pendingList);

    return c.json({ ok: true, message });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// Stats for admin dashboard
app.get("/make-server-3f69e9c8/admin/stats", async (c) => {
  try {
    const authorization = await requireAdmin(c);
    if (authorization instanceof Response) return authorization;
    const [sessions, pending] = await Promise.all([
      kv.get("chat:sessions") as Promise<string[] | null>,
      kv.get("chat:pending") as Promise<string[] | null>,
    ]);
    const sessionList = Array.isArray(sessions) ? sessions : [];
    let totalMessages = 0;
    for (const email of sessionList) {
      const msgs = await kv.get(`chat:${email}`) as any[] | null;
      totalMessages += Array.isArray(msgs) ? msgs.length : 0;
    }
    return c.json({
      totalSessions: sessionList.length,
      totalMessages,
      pendingCount: Array.isArray(pending) ? pending.length : 0,
    });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

Deno.serve(app.fetch);
