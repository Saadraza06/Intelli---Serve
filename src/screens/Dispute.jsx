import React, { useState } from 'react';
import { AlertOctagon, RefreshCcw, Clock, ShieldAlert } from 'lucide-react';
import { callGeminiAPI } from '../services/geminiService';
import { useIntent } from '../context/IntentContext';

const TABS = [
  { id: 'cancel',  label: 'Cancel'  },
  { id: 'price',   label: 'Price'   },
  { id: 'quality', label: 'Quality' },
];

export default function Dispute() {
  const [activeTab, setActiveTab] = useState('cancel');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resolution, setResolution] = useState(null);
  const [qualityText, setQualityText] = useState('');
  const { addLog } = useIntent();

  const handleDispute = async (type) => {
    setIsProcessing(true); setResolution(null);
    const startTime = Date.now();
    try {
      const result = await callGeminiAPI(
        `You are a Dispute Agent. Given booking_details, dispute_type, time_of_cancellation. Determine: refund_amount, refund_policy_applied, resolution_steps, escalation_needed. Write reasoning. Return JSON.`,
        JSON.stringify({ booking_details: { amount: 1782, provider: 'CoolTech', service: 'AC Technician' }, dispute_type: type, time_of_cancellation: 'T-2 hours' }),
        true
      );
      const execTime = Date.now() - startTime;
      addLog({ agent: 'Dispute Agent', executionTime: execTime, inputs: { dispute_type: type }, prompt_snippet: 'Dispute Agent...', response: result, decision: `Resolved: ${result.refund_policy_applied}`, level: result.escalation_needed ? 'WARNING' : 'DECISION' });
      setResolution(result);
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-full relative pb-20" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="p-4 shrink-0 flex items-center" style={{ borderBottom: '1.5px solid #ffe5cc' }}>
        <AlertOctagon size={22} className="mr-2" style={{ color: '#dc2626' }} />
        <h2 className="text-xl" style={{ fontWeight: 800, color: '#1a0f00' }}>Dispute Center</h2>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0" style={{ borderBottom: '1.5px solid #ffe5cc' }}>
        {TABS.map(tab => (
          <button key={tab.id} id={`tab-${tab.id}`}
            onClick={() => { setActiveTab(tab.id); setResolution(null); }}
            className="flex-1 py-3.5 text-sm transition-all relative"
            style={{ fontWeight: 700, color: activeTab === tab.id ? '#ff5500' : '#c09070', background: activeTab === tab.id ? 'rgba(255,85,0,0.06)' : 'transparent' }}>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#ff5500,#ff8533)' }} />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'cancel' && (
          <div className="mb-5">
            <h3 className="text-lg mb-2" style={{ fontWeight: 800, color: '#1a0f00' }}>Cancel Booking</h3>
            <p className="text-sm mb-5" style={{ color: '#7a4020' }}>Are you sure you want to cancel? Depending on the time, a cancellation fee may apply.</p>
            <button id="initiate-cancel-btn" onClick={() => handleDispute('cancellation')}
              className="w-full py-3.5 rounded-2xl text-sm font-700 transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1.5px solid rgba(220,38,38,0.25)', fontWeight: 700 }}>
              Initiate Cancellation
            </button>
          </div>
        )}

        {activeTab === 'price' && (
          <div className="mb-5">
            <h3 className="text-lg mb-3" style={{ fontWeight: 800, color: '#1a0f00' }}>Price Dispute</h3>
            <div className="warm-card p-4 mb-4">
              {[
                { label: 'Quoted Amount',    val: 'PKR 1782', color: '#1a0f00' },
                { label: 'Charged Amount',   val: 'PKR 2500', color: '#dc2626' },
                { label: 'Disputed Diff.',   val: 'PKR 718',  color: '#dc2626', small: true },
              ].map(({ label, val, color, small }) => (
                <div key={label} className={`flex justify-between text-sm ${small ? 'mt-2 pt-2 border-t' : 'mb-2'}`} style={{ borderColor: '#ffe5cc' }}>
                  <span style={{ color: '#7a4020' }}>{label}</span>
                  <span style={{ fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
            </div>
            <button id="gemini-resolve-btn" onClick={() => handleDispute('price_mismatch')}
              className="btn-shimmer w-full py-3.5 rounded-2xl text-sm font-700 transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', fontWeight: 700, boxShadow: '0 6px 20px rgba(217,119,6,0.30)' }}>
              Let Gemini Resolve
            </button>
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="mb-5">
            <h3 className="text-lg mb-2" style={{ fontWeight: 800, color: '#1a0f00' }}>Quality Complaint</h3>
            <p className="text-sm mb-4" style={{ color: '#7a4020' }}>Report an issue with the service quality or provider behavior.</p>
            <textarea value={qualityText} onChange={e => setQualityText(e.target.value)} placeholder="Describe the issue..."
              className="w-full p-3 text-sm resize-none h-24 mb-4"
              style={{ background: 'rgba(255,245,238,0.70)', border: '1.5px solid #ffe5cc', borderRadius: 16, color: '#1a0f00', outline: 'none', fontFamily: 'inherit' }} />
            <button id="submit-complaint-btn" onClick={() => handleDispute('quality_complaint')}
              className="btn-shimmer w-full py-3.5 rounded-2xl text-sm font-700 transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', color: '#fff', fontWeight: 700, boxShadow: '0 6px 20px rgba(255,85,0,0.35)' }}>
              Submit Complaint
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="warm-card flex flex-col items-center justify-center p-8 text-center">
            <RefreshCcw size={30} className="animate-spin mb-4" style={{ color: '#ff8533' }} />
            <p style={{ fontWeight: 700, color: '#1a0f00' }}>Gemini Dispute Agent is reviewing…</p>
            <p className="text-xs mt-2" style={{ color: '#c09070' }}>Checking policy and context.</p>
          </div>
        )}

        {resolution && !isProcessing && (
          <div className="warm-card p-5 animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[10px] px-2.5 py-1 rounded-bl-xl" style={{ background: 'rgba(255,85,0,0.12)', color: '#cc5500', fontWeight: 700 }}>
              AI ADJUDICATED
            </div>
            <h3 className="text-lg flex items-center mt-2 mb-3" style={{ fontWeight: 800, color: '#1a0f00' }}>
              <ShieldAlert size={18} className="mr-2" style={{ color: '#ff5500' }} /> Resolution Decision
            </h3>
            <p className="text-sm mb-4 italic leading-relaxed" style={{ color: '#7a4020', borderLeft: '2px solid #ff8533', paddingLeft: 10 }}>
              "{resolution.reasoning || resolution.refund_policy_applied}"
            </p>
            <div className="rounded-xl p-3 space-y-2 text-sm mb-4" style={{ background: 'rgba(255,245,238,0.70)', border: '1px solid #ffe5cc' }}>
              <div className="flex justify-between">
                <span style={{ color: '#7a4020' }}>Refund Amount</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>PKR {resolution.refund_amount}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#7a4020' }}>Policy</span>
                <span className="text-right" style={{ fontWeight: 600, color: '#1a0f00' }}>{resolution.refund_policy_applied}</span>
              </div>
            </div>
            <div className="text-xs" style={{ color: '#7a4020' }}>
              <span className="block mb-1" style={{ fontWeight: 700 }}>Next Steps:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                {(resolution.resolution_steps || ['Refund initiated']).map((step, i) => <li key={i}>{step}</li>)}
              </ul>
            </div>
            {resolution.escalation_needed && (
              <div className="mt-4 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #ffe5cc', fontWeight: 700, color: '#dc2626' }}>
                <span className="flex items-center"><Clock size={13} className="mr-1" /> Human Escalation</span>
                <span>48-hour SLA</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
