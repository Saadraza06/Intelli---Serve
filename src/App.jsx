import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, List, FileText, Layers, ActivitySquare, Zap, Activity, Settings, X, Key, Eye, EyeOff, Check, Trash2, AlertCircle, ExternalLink, Globe } from 'lucide-react';
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
  const { isSettingsOpen, setIsSettingsOpen, triggerApiKeyUpdate, apiKeyVersion } = useIntent();

  // Local state for settings form inputs inside the modal
  const [geminiKeyInput, setGeminiKeyInput] = React.useState('');
  const [mapsKeyInput, setMapsKeyInput] = React.useState('');
  const [showGeminiKey, setShowGeminiKey] = React.useState(false);
  const [showMapsKey, setShowMapsKey] = React.useState(false);
  const [isSavedToastVisible, setIsSavedToastVisible] = React.useState(false);

  // Sync inputs with local storage when settings modal opens
  React.useEffect(() => {
    if (isSettingsOpen) {
      setGeminiKeyInput(localStorage.getItem('VITE_GEMINI_API_KEY') || '');
      setMapsKeyInput(localStorage.getItem('VITE_GOOGLE_MAPS_API_KEY') || '');
      setIsSavedToastVisible(false);
    }
  }, [isSettingsOpen, apiKeyVersion]);

  // Pre-populate default keys into localStorage if none exist to enable Live Mode by default
  React.useEffect(() => {
    const currentGemini = localStorage.getItem('VITE_GEMINI_API_KEY');
    const currentMaps = localStorage.getItem('VITE_GOOGLE_MAPS_API_KEY');
    
    let updated = false;
    if (!currentGemini) {
      localStorage.setItem('VITE_GEMINI_API_KEY', 'AIzaSyAZMlEO--a7roKHthOEt7xH-1V6RwsX6FY');
      updated = true;
    }
    if (!currentMaps) {
      localStorage.setItem('VITE_GOOGLE_MAPS_API_KEY', 'AIzaSyDmVrL7oRkUZB2qb2s_Oxu2g8CnsVWzT7E');
      updated = true;
    }
    if (updated) {
      triggerApiKeyUpdate();
    }
  }, []);

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

          {/* AI Active & Settings Pill Container */}
          <div className="flex items-center space-x-2">
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

            {/* Premium Settings Cog */}
            <button
              id="header-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow"
              style={{
                borderColor: '#ffd5b0',
                background: 'rgba(255,252,248,0.9)',
                color: '#ff5500',
              }}
            >
              <Settings size={16} className="hover:rotate-90 transition-transform duration-500" />
            </button>
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

      {/* ── System Preferences Modal ── */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(26, 15, 0, 0.45)', backdropFilter: 'blur(8px)' }}
        >
          {/* Modal Background Dismiss Tap */}
          <div
            className="absolute inset-0 z-0"
            onClick={() => setIsSettingsOpen(false)}
          />

          {/* Modal Card Content */}
          <div
            className="relative z-10 w-full max-w-md bg-[#fdf6ee] border-t sm:border border-[#ffd5b0] shadow-2xl rounded-t-[32px] sm:rounded-[28px] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none transform transition-transform duration-300 animate-scale-in"
            style={{
              boxShadow: '0 20px 60px rgba(255, 85, 0, 0.18)',
              background: 'linear-gradient(180deg, #fffcf8 0%, #fdf6ee 100%)',
            }}
          >
            {/* Slide drawer handle indicator for mobile view */}
            <div className="flex justify-center py-2 sm:hidden shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-[#ffe5cc]" />
            </div>

            {/* Modal Header */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-[#ffe5cc] shrink-0">
              <div className="flex items-center space-x-2">
                <Settings size={20} className="text-[#ff5500]" />
                <h3 className="text-lg font-800 text-[#1a0f00]" style={{ fontWeight: 800 }}>
                  System Preferences
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-50 transition-all border border-[#ffe5cc] text-[#c09070] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 py-5 overflow-y-auto space-y-5 flex-1 max-h-[70vh] sm:max-h-none">
              
              {/* Dynamic Status Pill Card */}
              <div
                className="p-4 rounded-2xl flex items-center space-x-3 border"
                style={{
                  background: geminiKeyInput.trim() ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 85, 0, 0.05)',
                  borderColor: geminiKeyInput.trim() ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 85, 0, 0.2)',
                }}
              >
                <span className="relative flex h-3 w-3 shrink-0">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      geminiKeyInput.trim() ? 'animate-ping bg-emerald-400' : 'animate-ping bg-orange-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      geminiKeyInput.trim() ? 'bg-emerald-500' : 'bg-[#ff5500]'
                    }`}
                  />
                </span>
                <div>
                  <h4 className="text-xs font-800 uppercase tracking-wider text-[#1a0f00]">
                    {geminiKeyInput.trim() ? 'Live Orchestration Active 🟢' : 'Simulation Mode Active ⚡'}
                  </h4>
                  <p className="text-[11px] font-500 text-[#c09070] mt-0.5 leading-relaxed">
                    {geminiKeyInput.trim()
                      ? 'The app is securely querying Gemini 2.5 and live Google Maps data near your location!'
                      : 'Provide a Gemini API Key to enable real-time searches in Faisalabad and across Pakistan.'
                    }
                  </p>
                </div>
              </div>

              {/* Gemini API Key Form field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-800 text-[#1a0f00] flex items-center gap-1.5">
                    <Key size={13} className="text-[#ff5500]" /> GEMINI API KEY
                  </label>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-700 text-[#ff5500] hover:underline flex items-center gap-0.5"
                  >
                    Get Free Key <ExternalLink size={10} />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-xs px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#ff8533] transition-all"
                    style={{ borderColor: '#ffd5b0', color: '#1a0f00' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c09070] hover:text-[#ff5500]"
                  >
                    {showGeminiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[10px] font-500 text-[#c09070] leading-normal">
                  Your key is stored strictly on your local browser and is never uploaded anywhere.
                </p>
              </div>

              {/* Google Maps API Key Form field */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-800 text-[#1a0f00] flex items-center gap-1.5">
                  <Globe size={13} className="text-[#ff5500]" /> GOOGLE MAPS API KEY (OPTIONAL)
                </label>
                <div className="relative">
                  <input
                    type={showMapsKey ? 'text' : 'password'}
                    value={mapsKeyInput}
                    onChange={(e) => setMapsKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-xs px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#ff8533] transition-all"
                    style={{ borderColor: '#ffd5b0', color: '#1a0f00' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMapsKey(!showMapsKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c09070] hover:text-[#ff5500]"
                  >
                    {showMapsKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[10px] font-500 text-[#c09070] leading-normal">
                  Leave blank to use our high-speed Nominatim fallback and standard browser script key automatically.
                </p>
              </div>

              {/* Save & Clear Buttons Container */}
              <div className="flex flex-col space-y-2 pt-3 shrink-0">
                <button
                  onClick={() => {
                    localStorage.setItem('VITE_GEMINI_API_KEY', geminiKeyInput.trim());
                    localStorage.setItem('VITE_GOOGLE_MAPS_API_KEY', mapsKeyInput.trim());
                    triggerApiKeyUpdate();
                    setIsSavedToastVisible(true);
                    setTimeout(() => {
                      setIsSavedToastVisible(false);
                      setIsSettingsOpen(false);
                    }, 1200);
                  }}
                  className="btn-shimmer w-full py-3 rounded-xl text-xs font-800 tracking-wide text-white transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow"
                  style={{
                    background: 'linear-gradient(135deg, #ff5500, #ff8533)',
                    boxShadow: '0 4px 14px rgba(255,85,0,0.3)',
                  }}
                >
                  <Check size={14} />
                  <span>Save & Enable Live Mode</span>
                </button>

                {(localStorage.getItem('VITE_GEMINI_API_KEY') || localStorage.getItem('VITE_GOOGLE_MAPS_API_KEY')) && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('VITE_GEMINI_API_KEY');
                      localStorage.removeItem('VITE_GOOGLE_MAPS_API_KEY');
                      setGeminiKeyInput('');
                      setMapsKeyInput('');
                      triggerApiKeyUpdate();
                      setIsSavedToastVisible(true);
                      setTimeout(() => {
                        setIsSavedToastVisible(false);
                        setIsSettingsOpen(false);
                      }, 1200);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-700 border transition-all text-[#d9534f] border-[#f5c6cb] hover:bg-[#f8d7da] cursor-pointer flex items-center justify-center space-x-1.5"
                    style={{ background: 'rgba(217, 83, 79, 0.02)' }}
                  >
                    <Trash2 size={13} />
                    <span>Clear Credentials & Reset</span>
                  </button>
                )}
              </div>

              {/* Success Notification feedback inline */}
              {isSavedToastVisible && (
                <div
                  className="p-3.5 rounded-xl border flex items-center space-x-2 bg-emerald-50 border-emerald-200 text-emerald-800 text-xs font-700 animate-pulse shrink-0"
                >
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>System configuration saved successfully!</span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
