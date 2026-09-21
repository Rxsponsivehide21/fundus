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
import { Toaster } from 'sonner';

export default function App() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) setUser(data.session.user);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    init();
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleGetStartedClick = () => {
    if (user) setIsChatOpen(true);
    else setIsRegisterOpen(true);
  };

  // Show admin dashboard if admin is logged in
  if (isAdmin) {
    return (
      <AdminDashboard onLogout={() => setIsAdmin(false)} />
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
          onAdminLogin={() => setIsAdmin(true)}
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
