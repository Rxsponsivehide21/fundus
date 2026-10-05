
# Fundus Limited Website

This is a code bundle for Fundus Limited Website. The original project is available on [Figma](https://www.figma.com/design/shVRX5IpoulMambOG9Ini9/Fundus-Limited-Website).

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Support inbox and admin access

Customer support is a live chat: signed-in customers send and receive messages, and authorized admins manage conversations from the isolated Messages dashboard. Admin permissions are checked server-side against `public.user_roles`; browser storage and hardcoded passwords are not used for authorization.

Before publishing the new website:

1. Run `supabase/migrations/20261005000000_user_roles.sql` in the Supabase SQL Editor.
2. In **Supabase → Authentication → Users**, copy the owner's user UUID and grant access in the SQL Editor:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('YOUR-AUTH-USER-UUID', 'admin')
   on conflict (user_id) do update set role = excluded.role;
   ```

3. Deploy `supabase/functions/server/index.tsx` as the `make-server-3f69e9c8` Edge Function. The function requires the Supabase Auth JWT and checks admin grants for dashboard routes. Supabase's `SUPABASE_SERVICE_ROLE_KEY` must remain a server secret.
4. Build and publish the Vite frontend to Namecheap using the existing cPanel deployment configuration.

The static frontend build alone does not deploy the Edge Function or SQL migration; deploy both Supabase changes for chat and the admin dashboard to work securely.
  