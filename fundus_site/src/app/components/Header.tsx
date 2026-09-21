import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import fundusLogo from '../../imports/fundus_logo.jpeg';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  user?: any;
  onLogout?: () => void;
}

function UserAvatar({ user }: { user: any }) {
  const avatarUrl = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-red-500/50"
      />
    );
  }

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
    >
      {initials || '?'}
    </div>
  );
}

export function Header({ onLoginClick, onRegisterClick, user, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Account';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center shrink-0 group">
            <div className="relative w-10 h-10 rounded-full logo-pulse-ring">
              <img
                src={fundusLogo}
                alt="Fundus Limited"
                className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.12)' }}
              />
            </div>
            <span className="ml-2.5 text-lg font-bold text-white tracking-tight">
              Fundus<span className="text-red-500">EC</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8 ml-12">
            <a href="#programs" className="text-gray-300 hover:text-white transition text-sm">Programs</a>
            <a href="#features" className="text-gray-300 hover:text-white transition text-sm">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition text-sm">Pricing</a>
            <a href="#rules" className="text-gray-300 hover:text-white transition text-sm">Trading Rules</a>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/[0.06]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <UserAvatar user={user} />
                  <span className="text-white text-sm font-medium max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl py-1 overflow-hidden z-50"
                    style={{
                      background: 'rgba(15,15,15,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                    }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar user={user} />
                        <div className="min-w-0">
                          <div className="text-white text-sm font-medium truncate">{displayName}</div>
                          <div className="text-gray-500 text-xs truncate">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { onLogout?.(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all text-sm"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Login
                </button>
                <button
                  onClick={onRegisterClick}
                  className="px-5 py-2 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex flex-col gap-1 mb-4">
              {[
                { label: 'Programs', href: '#programs' },
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Trading Rules', href: '#rules' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white text-sm px-3 py-2.5 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {user ? (
              <div className="flex flex-col gap-2">
                <div
                  className="flex items-center gap-3 px-3 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">{displayName}</div>
                    <div className="text-gray-500 text-xs truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => { onLogout?.(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-300 rounded-xl text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { onLoginClick(); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 text-gray-300 rounded-xl text-sm text-left transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Login
                </button>
                <button
                  onClick={() => { onRegisterClick(); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 text-white rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
}
