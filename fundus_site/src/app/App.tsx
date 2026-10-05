import { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { MarketTicker } from './components/MarketTicker';
import { Hero } from './components/Hero';
import { Pricing } from './components/Pricing';
import { TradingObjectives } from './components/TradingObjectives';
import { Footer } from './components/Footer';
import { AnimatedBackground } from './components/AnimatedBackground';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { CustomerCareChat } from './components/CustomerCareChat';
import { AdminDashboard } from './components/AdminDashboard';
import { SEO } from './components/SEO';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Toaster } from 'sonner';

export default function App() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [roleCheckFailed, setRoleCheckFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const verifyAdmin = async (accessToken?: string) => {
      if (active) setRoleCheckFailed(false);
      if (!accessToken) {
        if (active) { setIsAdmin(false); setRoleCheckFailed(false); }
        return;
      }
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3f69e9c8/admin/access`, {
          headers: { apikey: publicAnonKey, Authorization: `Bearer ${accessToken}` },
        });
        if (response.status === 403) {
          if (active) setIsAdmin(false);
          return;
        }
        if (!response.ok) throw new Error(`Role check failed (${response.status})`);
        if (active) setIsAdmin((await response.json()).allowed === true);
      } catch {
        if (active) { setIsAdmin(false); setRoleCheckFailed(true); }
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthReady(false);
      setUser(session?.user ?? null);
      void verifyAdmin(session?.access_token).finally(() => {
        if (active) setAuthReady(true);
      });
    });

    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          setUser(data.session.user);
          await verifyAdmin(data.session.access_token);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        setAuthReady(true);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      await verifyAdmin(session?.access_token);
      if (active) setAuthReady(true);
    };

    void init();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const handleGetStartedClick = () => {
    if (user) setIsChatOpen(true);
    else setIsRegisterOpen(true);
  };

  // Do not render customer-facing UI until Supabase and server-side role checks finish.
  if (!authReady) {
    return <div className="min-h-screen bg-zinc-950" aria-label="Loading account" />;
  }

  if (roleCheckFailed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="text-white text-lg font-semibold">Account permissions could not be verified</div>
          <p className="text-gray-500 text-sm mt-2">For security, the site is unavailable until Supabase access checks are working.</p>
          <button onClick={handleLogout} className="mt-5 rounded-xl px-4 py-2 text-sm text-white" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>Sign out</button>
        </div>
      </div>
    );
  }

  // Admins only receive the isolated support dashboard, never the customer site UI.
  if (isAdmin) {
    return (
      <AdminDashboard onLogout={handleLogout} />
    );
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-zinc-950">
        <SEO />
        <Toaster position="top-right" theme="dark" />
        <AnimatedBackground />
        <Header
          onLoginClick={() => setIsLoginOpen(true)}
          onRegisterClick={() => setIsRegisterOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
        <div className="pt-16">
          <MarketTicker />
        </div>
        <Hero onGetStartedClick={handleGetStartedClick} />
        <Pricing onGetStartedClick={handleGetStartedClick} />
        <TradingObjectives />
        <Footer />
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onLoginClick={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
        />
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSignUpClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}
        />
        <CustomerCareChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userEmail={user?.email}
        />
      </div>
    </HelmetProvider>
  );
}
