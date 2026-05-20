import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Star, MapPin, Clock, ShieldCheck, ChevronRight, Code, Zap } from 'lucide-react';
import { useIntent } from '../context/IntentContext';

export default function ProviderList() {
  const { intentData } = useIntent();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rawResponse, setRawResponse] = useState(null);
  const [showTrace, setShowTrace] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (intentData?.agent_providers) {
      setProviders(intentData.agent_providers);
      setRawResponse(intentData.trace_summary || 'No trace generated');
      setIsLoading(false);
    } else if (!intentData) {
      navigate('/');
    }
  }, [intentData, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-4" style={{ background: 'transparent' }}>
        <div
          className="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#ff8533', borderTopColor: 'transparent' }}
        />
        <p className="text-sm font-600" style={{ color: '#c09070', fontWeight: 600 }}>
          Gemini is generating provider network…
        </p>
      </div>
    );
  }

  if (intentData?.no_results || providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-5 text-center" style={{ background: 'transparent' }}>
        <div className="text-5xl">🔍</div>
        <h3 className="text-xl font-800" style={{ fontWeight: 800, color: '#1a0f00' }}>No Providers Found</h3>
        <p className="text-sm" style={{ color: '#c09070', lineHeight: 1.6 }}>
          We couldn't find any <strong style={{ color: '#ff5500' }}>{intentData?.service_type || 'service'}</strong> providers near <strong style={{ color: '#ff5500' }}>{intentData?.location || 'your location'}</strong> on Google Maps.
        </p>
        <p className="text-xs" style={{ color: '#c09070' }}>Try a nearby city, a broader term (e.g. "salon" instead of "beautician"), or check your spelling.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-3 rounded-full text-sm font-700"
          style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', color: '#fff', fontWeight: 700, boxShadow: '0 6px 20px rgba(255,85,0,0.35)' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative pb-20" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="p-4 pb-2 shrink-0">
        <h2 className="text-xl font-800" style={{ fontWeight: 800, color: '#1a0f00' }}>
          Ranked Providers
        </h2>
        <p className="text-sm font-500 mt-0.5" style={{ color: '#c09070' }}>
          {intentData?.service_type || 'Services'} near{' '}
          <span style={{ color: '#ff5500', fontWeight: 600 }}>{intentData?.location || 'you'}</span>
        </p>
        <div className="flex items-center mt-1 space-x-1">
          <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: '#16a34a' }}></span>
          <span className="text-[10px] font-700 uppercase tracking-widest" style={{ color: '#16a34a', fontWeight: 700 }}>Live Data · Google Maps</span>
        </div>
      </div>

      {/* Provider cards list */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 space-y-4 pb-6">
        {providers.map((p, index) => (
          <ProviderCard key={p.id} provider={p} rank={index + 1} intentData={intentData} />
        ))}
      </div>

      {/* View trace button */}
      <div className="fixed bottom-16 w-full max-w-md mx-auto p-4 flex justify-center pointer-events-none z-10">
        <button
          id="view-trace-btn"
          onClick={() => setShowTrace(true)}
          className="pointer-events-auto flex items-center space-x-2 text-sm font-600 px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105"
          style={{
            background: '#fff',
            border: '1.5px solid #ffe5cc',
            color: '#cc5500',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(255,85,0,0.12)',
          }}
        >
          <Code size={15} style={{ color: '#ff5500' }} />
          <span>View Agent Trace Summary</span>
        </button>
      </div>

      {/* Trace bottom sheet */}
      {showTrace && (
        <div
          className="absolute inset-x-0 bottom-0 top-1/3 rounded-t-3xl p-5 z-50 flex flex-col animate-fade-in-up"
          style={{
            background: 'rgba(255,252,248,0.97)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid #ffe5cc',
            boxShadow: '0 -8px 40px rgba(255,85,0,0.12)',
          }}
        >
          <div className="flex justify-between items-center mb-4 shrink-0">
            <span className="font-700 flex items-center text-sm" style={{ fontWeight: 700, color: '#1a0f00' }}>
              <Code size={15} className="mr-2" style={{ color: '#ff5500' }} /> Agent Trace Summary
            </span>
            <button
              id="close-trace-btn"
              onClick={() => setShowTrace(false)}
              className="text-xs font-600 px-3 py-1.5 rounded-full transition-all"
              style={{
                background: 'rgba(255,85,0,0.10)',
                color: '#cc5500',
                fontWeight: 600,
                border: '1.5px solid #ffd5b0',
              }}
            >
              Close
            </button>
          </div>
          <div
            className="overflow-y-auto flex-1 text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: '#7a4020', fontFamily: 'monospace' }}
          >
            {rawResponse}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProviderCard({ provider, rank, intentData }) {
  try {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const { setSelectedProvider } = useIntent();
    const isTop = rank === 1;
    const isUnavailable = provider?.available === false;

    const scores = provider?.factor_scores || {
      distance: 80, availability: 100, rating: 90, recency: 75,
      reliability: 85, price_fit: 80, skill_match: 90, cancel_rate: 95
    };

    const delayClass = rank === 1 ? 'delay-100' : rank === 2 ? 'delay-200' : rank === 3 ? 'delay-300' : rank === 4 ? 'delay-400' : 'delay-500';
    const score = provider?.composite_score || 0;
    const scoreColor = score >= 85 ? '#16a34a' : score >= 70 ? '#d97706' : '#dc2626';
    const scoreBg   = score >= 85 ? 'rgba(22,163,74,0.10)' : score >= 70 ? 'rgba(217,119,6,0.10)' : 'rgba(220,38,38,0.10)';

    return (
      <div
        className={`rounded-[22px] overflow-hidden transition-all duration-300 animate-fade-in-up ${delayClass} ${isUnavailable ? 'opacity-60' : ''}`}
        style={{
          background: '#fff',
          border: '1.5px solid #ffe5cc',
          boxShadow: '0 4px 24px rgba(255,85,0,0.07)',
        }}
      >
        {/* Top pick banner */}
        {!isUnavailable && (
          <div
            className="text-white text-[11px] font-700 tracking-wider uppercase py-2.5 px-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ff5500, #ff8533)',
              fontWeight: 700,
              boxShadow: '0 2px 12px rgba(255,85,0,0.25)',
            }}
          >
            <Star size={12} className="mr-1.5 fill-white" /> IntelliServe Top Pick
          </div>
        )}

        {/* Unavailable strip */}
        {isUnavailable && (
          <div
            className="text-[11px] font-700 tracking-wider uppercase py-1.5 px-4 flex items-center justify-center"
            style={{
              background: 'rgba(220,38,38,0.08)',
              color: '#dc2626',
              border: '0',
              borderBottom: '1px solid rgba(220,38,38,0.20)',
              fontWeight: 700,
            }}
          >
            Slot Unavailable — Stress Test
          </div>
        )}

        <div className="p-5">
          {/* Header row */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div
                className="w-13 h-13 rounded-full flex items-center justify-center text-lg font-800 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,133,51,0.15), rgba(255,85,0,0.08))',
                  border: '2px solid #ffd5b0',
                  color: '#ff5500',
                  width: 52,
                  height: 52,
                  fontWeight: 800,
                }}
              >
                {provider?.initials || provider?.name?.charAt(0) || '?'}
              </div>
                <div>
                <h3 className="font-800 text-lg leading-tight" style={{ fontWeight: 800, color: '#1a0f00' }}>
                  {provider?.name || 'Unknown'}
                </h3>
                {provider?.specialization && (
                  <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: '#ff5500', fontWeight: 700 }}>
                    {provider.specialization}
                  </p>
                )}
                <div className="flex items-center text-xs mt-1 space-x-3" style={{ color: '#c09070' }}>
                  <span className="flex items-center font-600" style={{ fontWeight: 600, color: '#1a0f00' }}>
                    <Star size={12} className="mr-1" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    {provider?.rating || '0.0'}
                  </span>
                  <span className="flex items-center">
                    <MapPin size={12} className="mr-1" style={{ color: '#ffb380' }} />
                    {provider?.distance_km || '0.0'} km
                  </span>
                </div>
                {provider?.address && (
                  <p className="text-[10px] mt-0.5 truncate max-w-[160px]" style={{ color: '#c09070' }}>
                    {provider.address}
                  </p>
                )}
              </div>
            </div>

            {/* Score circle */}
            <div
              className="flex items-center justify-center font-900 text-2xl shrink-0"
              style={{
                width: 52, height: 52,
                borderRadius: '50%',
                background: scoreBg,
                border: `2.5px solid ${scoreColor}`,
                color: scoreColor,
                fontWeight: 900,
              }}
            >
              {score || '--'}
            </div>
          </div>

          {/* Why this ranking */}
          <div
            className="rounded-2xl p-4 mb-4 transition-all duration-300"
            style={{ background: 'rgba(255,245,238,0.70)', border: '1.5px solid #ffe5cc' }}
          >
            <button
              id={`expand-ranking-${provider?.id}`}
              onClick={() => setExpanded(!expanded)}
              className="flex justify-between items-center w-full text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Zap size={16} className="animate-bolt-pulse" style={{ color: '#ff5500' }} />
                <span className="text-sm font-700" style={{ fontWeight: 700, color: '#1a0f00' }}>
                  Why this ranking?
                </span>
              </div>
              {expanded
                ? <ChevronUp size={16} style={{ color: '#c09070' }} />
                : <ChevronDown size={16} style={{ color: '#c09070' }} />}
            </button>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-[#ffe5cc] animate-fade-in-up">
                <p className="text-xs mb-4 italic leading-relaxed" style={{ color: '#7a4020' }}>
                  "{provider?.ranking_reason || 'Ranked based on overall composite score.'}"
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <ProgressBar label="Distance"    value={scores.distance} />
                  <ProgressBar label="Rating"      value={scores.rating} />
                  <ProgressBar label="Reliability" value={scores.reliability} />
                  <ProgressBar label="Price Fit"   value={scores.price_fit} />
                  <ProgressBar label="Availability"value={scores.availability} />
                  <ProgressBar label="Skill Match" value={scores.skill_match} />
                </div>
              </div>
            )}
          </div>

          {/* Price + Book row */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[10px] font-700 uppercase tracking-widest mb-0.5" style={{ color: '#c09070', fontWeight: 700 }}>
                Base Price
              </p>
              <div className="text-xl font-800" style={{ fontWeight: 800, color: '#1a0f00' }}>
                ~ PKR {provider?.base_price_pkr || '0'}
              </div>
            </div>
            <button
              id={`book-provider-${provider?.id}`}
              onClick={() => {
                if (!isUnavailable) {
                  setSelectedProvider({ provider, pricing: intentData?.pricing });
                  navigate(`/provider/${provider?.id}`);
                }
              }}
              disabled={isUnavailable}
              className={`btn-shimmer flex items-center space-x-1.5 px-5 py-3 rounded-full text-sm font-700 transition-all duration-200 ${
                isUnavailable ? 'cursor-not-allowed opacity-40' : 'hover:scale-[1.04] cursor-pointer'
              }`}
              style={
                isUnavailable
                  ? { background: '#f5e9de', color: '#c09070', fontWeight: 700, border: '1.5px solid #ffd5b0' }
                  : {
                      background: 'linear-gradient(135deg, #ff5500, #ff8533)',
                      color: '#fff',
                      fontWeight: 700,
                      boxShadow: '0 6px 20px rgba(255,85,0,0.35)',
                    }
              }
            >
              <span>{isUnavailable ? 'Unavailable' : 'Book Now'}</span>
              {!isUnavailable && <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    );
  } catch (e) {
    console.error('ProviderCard Crash:', e);
    return (
      <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1.5px solid rgba(220,38,38,0.25)' }}>
        Failed to render provider card
      </div>
    );
  }
}

function ProgressBar({ label, value }) {
  const barColor = value >= 80 ? '#16a34a' : value >= 60 ? '#d97706' : '#dc2626';
  return (
    <div className="flex flex-col">
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color: '#c09070', fontWeight: 600 }}>{label}</span>
        <span style={{ color: '#1a0f00', fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#ffeedd' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
