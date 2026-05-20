import React, { useState } from 'react';
import { Layers, Search, CheckCircle, XCircle } from 'lucide-react';

const COMPARISON_ROWS = [
  { feature: 'Language Support',    simple: 'English only',               ai: 'Urdu, Roman Urdu, Mixed, Typos' },
  { feature: 'Intent Extraction',   simple: 'Regex / Keywords',           ai: 'Contextual AI Understanding' },
  { feature: 'Provider Ranking',    simple: 'Distance + Rating only',     ai: '8-factor weighted AI scoring' },
  { feature: 'Pricing Engine',      simple: 'Static rate card',           ai: 'Dynamic context-aware pricing' },
  { feature: 'Conflict Resolution', simple: 'Manual admin intervention',  ai: 'Autonomous Booking Agent' },
  { feature: 'Dispute Handling',    simple: 'Fixed 24hr policy',          ai: 'Reasoned AI Adjudication' },
  { feature: 'User Comms',          simple: 'Static templates',           ai: 'Generated contextual SMS/WhatsApp' },
  { feature: 'Follow-up',          simple: 'None',                        ai: 'AI Sentiment Review Analysis' },
];

const SCENARIOS = [
  { name: 'Double Booking',     simple: 'App crashes or double books',  ai: 'Detects conflict, offers alternative slot' },
  { name: 'Misspelled "Plmbr"', simple: 'No results found',            ai: 'Confidence drops, asks clarification' },
  { name: 'Provider Cancels',   simple: 'User left hanging',            ai: 'Dispute agent re-ranks & replaces' },
];

export default function BaselineCompare() {
  const [demoInput, setDemoInput] = useState('plmbr chye F-7 me urgent');
  const [ranDemo, setRanDemo] = useState(false);

  return (
    <div className="flex flex-col h-full relative pb-20" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="p-4 shrink-0 flex items-center" style={{ borderBottom: '1.5px solid #ffe5cc' }}>
        <Layers size={20} className="mr-2" style={{ color: '#ff5500' }} />
        <h2 className="text-xl" style={{ fontWeight: 800, color: '#1a0f00' }}>System Compare</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Score cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="warm-card p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#c09070', fontWeight: 700 }}>Standard System</span>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#1a0f00' }}>
              28<span style={{ fontSize: '0.875rem', color: '#c09070', fontWeight: 600 }}>/100</span>
            </span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center text-center rounded-[22px]"
            style={{ background: 'linear-gradient(135deg,rgba(255,85,0,0.08),rgba(255,133,51,0.05))', border: '1.5px solid #ffd5b0', boxShadow: '0 4px 24px rgba(255,85,0,0.12)' }}>
            <span className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#ff5500', fontWeight: 700 }}>IntelliServe</span>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#ff5500' }}>
              92<span style={{ fontSize: '0.875rem', color: '#ff8533', fontWeight: 600 }}>/100</span>
            </span>
          </div>
        </div>

        {/* Live test comparison */}
        <div className="warm-card overflow-hidden">
          <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1.5px solid #ffe5cc', background: 'rgba(255,245,238,0.60)' }}>
            <span className="text-sm flex items-center" style={{ fontWeight: 700, color: '#1a0f00' }}>
              <Search size={14} className="mr-2" style={{ color: '#ff5500' }} /> Live Test
            </span>
          </div>
          <div className="p-4">
            <div className="flex space-x-2 mb-4">
              <input
                id="live-test-input"
                type="text"
                value={demoInput}
                onChange={e => setDemoInput(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm rounded-xl"
                style={{ background: 'rgba(255,245,238,0.80)', border: '1.5px solid #ffe5cc', color: '#1a0f00', outline: 'none', fontFamily: 'inherit' }}
              />
              <button
                id="live-test-run-btn"
                onClick={() => setRanDemo(true)}
                className="btn-shimmer px-4 py-2 rounded-xl text-sm font-700 transition-all hover:scale-105 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', color: '#fff', fontWeight: 700, boxShadow: '0 4px 14px rgba(255,85,0,0.30)' }}>
                Run
              </button>
            </div>
            {ranDemo && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
                {/* Standard (fail) */}
                <div className="p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.20)' }}>
                  <span className="text-[10px] font-700 uppercase tracking-wider block mb-2 pb-1" style={{ color: '#dc2626', borderBottom: '1px solid rgba(220,38,38,0.20)' }}>
                    Regex/Keyword
                  </span>
                  <div className="text-xs font-mono" style={{ color: '#dc2626' }}>
                    `plmbr`: undefined<br />
                    `chye`: undefined<br />
                    `urgent`: modifier<br />
                    <br />
                    <strong>Error: Invalid service_type.</strong>
                  </div>
                </div>
                {/* AI (pass) */}
                <div className="p-3 rounded-xl" style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.25)' }}>
                  <span className="text-[10px] font-700 uppercase tracking-wider block mb-2 pb-1" style={{ color: '#16a34a', borderBottom: '1px solid rgba(22,163,74,0.20)' }}>
                    Gemini Intent Agent
                  </span>
                  <div className="text-xs font-mono" style={{ color: '#16a34a' }}>
                    service: "Plumber"<br />
                    location: "F-7"<br />
                    urgency: "High"<br />
                    language: "Roman Urdu"<br />
                    <strong className="mt-1 block">✓ Extracted (85% Conf)</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="warm-card overflow-hidden">
          <div className="grid grid-cols-12 text-[10px] font-700 uppercase tracking-wider" style={{ borderBottom: '1.5px solid #ffe5cc', background: 'rgba(255,245,238,0.60)' }}>
            <div className="col-span-4 p-3" style={{ color: '#c09070' }}>Feature</div>
            <div className="col-span-4 p-3" style={{ color: '#c09070', borderLeft: '1px solid #ffe5cc' }}>Standard</div>
            <div className="col-span-4 p-3" style={{ color: '#ff5500', borderLeft: '1px solid #ffe5cc' }}>IntelliServe</div>
          </div>
          {COMPARISON_ROWS.map((row, i) => (
            <div key={i} className="grid grid-cols-12 text-xs" style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid #fff3e8' : 'none' }}>
              <div className="col-span-4 p-3 flex items-center" style={{ background: 'rgba(255,245,238,0.40)', color: '#1a0f00', fontWeight: 600 }}>{row.feature}</div>
              <div className="col-span-4 p-3 flex items-start space-x-1" style={{ borderLeft: '1px solid #fff3e8', color: '#c09070' }}>
                <XCircle size={13} className="shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                <span>{row.simple}</span>
              </div>
              <div className="col-span-4 p-3 flex items-start space-x-1" style={{ borderLeft: '1px solid #fff3e8', background: 'rgba(255,85,0,0.04)', color: '#cc5500', fontWeight: 600 }}>
                <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                <span>{row.ai}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stress scenarios */}
        <div>
          <h3 className="text-sm mb-3 px-1" style={{ fontWeight: 700, color: '#1a0f00' }}>Stress Scenarios Handling</h3>
          <div className="space-y-3">
            {SCENARIOS.map((s, i) => (
              <div key={i} className="warm-card p-4">
                <div className="mb-2" style={{ fontWeight: 700, color: '#1a0f00', fontSize: '0.875rem' }}>{s.name}</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block mb-1" style={{ color: '#c09070', fontWeight: 600 }}>Standard</span>
                    <span style={{ color: '#c09070', textDecoration: 'line-through', textDecorationColor: '#dc2626' }}>{s.simple}</span>
                  </div>
                  <div>
                    <span className="block mb-1" style={{ color: '#ff5500', fontWeight: 700 }}>IntelliServe</span>
                    <span style={{ color: '#1a0f00', fontWeight: 500 }}>{s.ai}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
