import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, List, FileText, Layers, ActivitySquare, Zap, Activity } from 'lucide-react';
import { useIntent } from './context/IntentContext';
import HomeScreen from './screens/HomeScreen.jsx';
import ProviderList from './screens/ProviderList.jsx';
import ProviderDetail from './screens/ProviderDetail.jsx';
import BookingConfirmation from './screens/BookingConfirmation.jsx';
import FollowUp from './screens/FollowUp.jsx';
import Dispute from './screens/Dispute.jsx';
import BaselineCompare from './screens/BaselineCompare.jsx';
import AgentTrace from './screens/AgentTrace.jsx';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/',         icon: <Home size={22} />,           label: 'Home'     },
    { path: '/providers',icon: <List size={22} />,           label: 'Providers'},
    { path: '/dispute',  icon: <FileText size={22} />,       label: 'Dispute'  },
    { path: '/compare',  icon: <Layers size={22} />,         label: 'Compare'  },
    { path: '/trace',    icon: <ActivitySquare size={22} />, label: 'Trace'    },
  ];

  return (
    <div
      className="flex flex-col h-[100dvh] overflow-hidden relative"
      style={{ background: '#fdf6ee', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ── Animated background blobs ── */}
      <div
        className="absolute top-[-12%] left-[-10%] w-[55vw] h-[55vw] max-w-[520px] max-h-[520px] pointer-events-none z-0 animate-breathe"
        style={{
          background: 'radial-gradient(circle, rgba(255,133,51,0.28) 0%, rgba(255,200,140,0.12) 60%, transparent 80%)',
          animation: 'blob 10s infinite ease-in-out',
          filter: 'blur(55px)',
        }}
      />
      <div
        className="absolute top-[38%] right-[-12%] w-[45vw] h-[45vw] max-w-[440px] max-h-[440px] pointer-events-none z-0 animation-delay-2000"
        style={{
          background: 'radial-gradient(circle, rgba(255,85,0,0.18) 0%, rgba(255,180,100,0.10) 55%, transparent 80%)',
          animation: 'blob 12s infinite ease-in-out',
          animationDelay: '2s',
          filter: 'blur(65px)',
        }}
      />
      <div
        className="absolute bottom-[-8%] left-[8%] w-[50vw] h-[50vw] max-w-[480px] max-h-[480px] pointer-events-none z-0 animation-delay-4000"
        style={{
          background: 'radial-gradient(circle, rgba(255,200,120,0.22) 0%, rgba(255,140,60,0.10) 55%, transparent 80%)',
          animation: 'blob 14s infinite ease-in-out',
          animationDelay: '4s',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Main container ── */}
      <div
        className="flex flex-col w-full max-w-md mx-auto h-full relative z-10 sm:border-x"
        style={{ borderColor: '#ffe5cc', background: 'rgba(253,246,238,0.60)', backdropFilter: 'blur(2px)' }}
      >
        {/* ── Header ── */}
        <header
          className="p-4 flex justify-between items-center z-20 shrink-0"
          style={{
            background: 'rgba(255,252,248,0.88)',
            backdropFilter: 'blur(18px)',
            borderBottom: '1.5px solid #ffe5cc',
            boxShadow: '0 4px 24px rgba(255,85,0,0.06)',
          }}
        >
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <div className="relative group cursor-pointer">
              {/* Glow aura */}
              <div
                className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', filter: 'blur(12px)', zIndex: 0 }}
              />
              <div
                className="relative flex items-center justify-center w-11 h-11 rounded-full group-hover:scale-110 transition-all duration-400"
                style={{
                  background: 'linear-gradient(135deg, #ff5500, #ff8533)',
                  boxShadow: '0 6px 20px rgba(255,85,0,0.40)',
                  zIndex: 1,
                }}
              >
                <Zap size={20} className="text-white animate-bolt-pulse" />
              </div>
            </div>

            <div>
              <h1
                className="text-xl tracking-tight leading-none"
                style={{ fontWeight: 800, color: '#1a0f00' }}
              >
                Intelli<span style={{ color: '#ff5500' }}>Serve</span>
              </h1>
              <p className="text-[10px] font-600 mt-0.5" style={{ color: '#c09070' }}>AI Service Orchestrator</p>
            </div>
          </div>

          {/* AI Active badge */}
          <div
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(255,85,0,0.08)',
              border: '1.5px solid rgba(255,85,0,0.20)',
              color: '#cc5500',
            }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="badge-ping absolute inline-flex h-full w-full rounded-full"
                style={{ background: 'rgba(255,85,0,0.5)' }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ background: '#ff5500', boxShadow: '0 0 6px #ff8533' }}
              />
            </span>
            <span className="hidden sm:inline">AI Active</span>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <Routes>
            <Route path="/"             element={<HomeScreen />}          />
            <Route path="/providers"    element={<ProviderList />}        />
            <Route path="/provider/:id" element={<ProviderDetail />}      />
            <Route path="/booking"      element={<BookingConfirmation />} />
            <Route path="/followup"     element={<FollowUp />}            />
            <Route path="/dispute"      element={<Dispute />}             />
            <Route path="/compare"      element={<BaselineCompare />}     />
            <Route path="/trace"        element={<AgentTrace />}          />
          </Routes>
        </main>

        {/* ── Bottom nav ── */}
        <nav
          className="shrink-0 z-20 pb-[env(safe-area-inset-bottom)]"
          style={{
            background: 'rgba(255,252,248,0.92)',
            backdropFilter: 'blur(20px)',
            borderTop: '1.5px solid #ffd5b0',
            boxShadow: '0 -4px 24px rgba(255,85,0,0.06)',
          }}
        >
          <div className="flex justify-between items-center px-2 py-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  id={`nav-${item.label.toLowerCase()}`}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all duration-250 min-w-[56px] relative"
                  style={
                    isActive
                      ? {
                          color: '#ff5500',
                          background: 'rgba(255,85,0,0.08)',
                          boxShadow: '0 0 14px rgba(255,85,0,0.18)',
                        }
                      : { color: '#c09070' }
                  }
                >
                  {/* Active top-bar indicator */}
                  {isActive && (
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                      style={{ background: 'linear-gradient(90deg,#ff5500,#ff8533)' }}
                    />
                  )}
                  <div
                    style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.6))' } : {}}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[9px] mt-0.5 font-600" style={{ fontWeight: 600 }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
