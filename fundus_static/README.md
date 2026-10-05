# Fundus static site

No build step. Open `index.html` directly, or serve the folder (`python3 -m http.server`).
Email-confirmation links from Supabase need a real URL, so add your hosted URL under
Supabase > Auth > URL Configuration.

## Admin access setup

Admin authentication is verified on the server by the `admin-chat` Supabase Edge Function. The old browser-only `sessionStorage` owner shortcut has been removed. The browser sends the signed-in user's Supabase access token; the function verifies it with Supabase Auth and checks for an explicit `admin` entry in `public.user_roles` before proxying any admin chat request.

1. Apply `supabase/migrations/20261003000000_user_roles.sql` in the Supabase SQL Editor.
2. Deploy `supabase/functions/admin-chat/index.ts` as the `admin-chat` Edge Function. Set `CHAT_FUNCTION_NAME` to `make-server-3f69e9c8` if using a different deployed chat function name. Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions; never put the service-role key in `js/config.js` or any browser code.
3. In Supabase **Authentication → Users**, identify the owner account and copy its user UUID. Grant the role using the SQL Editor, replacing the UUID:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('YOUR-AUTH-USER-UUID', 'admin')
   on conflict (user_id) do update set role = excluded.role;
   ```

4. Ensure the `admin-chat` function is deployed with JWT verification enabled. Sign in with the owner account at the site and open `admin.html`.

## Important: protect the legacy chat function too

The repository does not contain the source for the already-deployed `make-server-3f69e9c8` Edge Function. The new `admin-chat` gateway validates the admin role before forwarding dashboard calls, but that alone cannot stop someone from calling legacy admin routes directly if the old function currently allows anonymous access. Before treating dashboard/chat data as secured, update that function's `/chat/sessions`, `/chat/messages/:email`, and `/chat/reply` routes to require and validate a Supabase bearer token and verify `public.user_roles.role = 'admin'` server-side (or move the database logic into `admin-chat`). Deploy the secured legacy function before enabling admin access. Keep customer send/read routes separate and scoped to the authenticated customer's own user ID.

Never authorize access based on an email address, request body identity, client-side storage, or a hardcoded browser password. The anon key is public by design; the service-role key must remain an Edge Function secret.
