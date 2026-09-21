// v5
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

app.get("/make-server-3f69e9c8/health", (c) => c.json({ status: "ok" }));

// Send a message from a user — marks session as pending
app.post("/make-server-3f69e9c8/chat/send", async (c) => {
  try {
    const { userEmail, text, sender } = await c.req.json();
    if (!userEmail || !text || !sender) return c.json({ error: "Missing fields" }, 400);

    const sessionKey = `chat:${userEmail}`;
    const existing = await kv.get(sessionKey) as any[] | null;
    const messages = Array.isArray(existing) ? existing : [];

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      sender,
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
    const userEmail = decodeURIComponent(c.req.param("userEmail"));
    const messages = await kv.get(`chat:${userEmail}`);
    return c.json({ messages: messages ?? [] });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// Get all chat sessions with pending flags (admin)
app.get("/make-server-3f69e9c8/chat/sessions", async (c) => {
  try {
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
    const { userEmail, text } = await c.req.json();
    if (!userEmail || !text) return c.json({ error: "Missing fields" }, 400);

    const sessionKey = `chat:${userEmail}`;
    const existing = await kv.get(sessionKey) as any[] | null;
    const messages = Array.isArray(existing) ? existing : [];

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      sender: "agent",
      timestamp: new Date().toISOString(),
    };
    messages.push(message);
    await kv.set(sessionKey, messages);

    // Clear pending for this session
    const pending = await kv.get("chat:pending") as string[] | null;
    const pendingList = Array.isArray(pending) ? pending.filter((e) => e !== userEmail) : [];
    await kv.set("chat:pending", pendingList);

    return c.json({ ok: true, message });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// Stats for admin dashboard
app.get("/make-server-3f69e9c8/admin/stats", async (c) => {
  try {
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
