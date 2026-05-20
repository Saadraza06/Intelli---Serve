import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Globe, Zap, RefreshCw, MapPin } from 'lucide-react';
import { useIntent } from '../context/IntentContext';
import { callGeminiAPI, runAgenticLoop } from '../services/geminiService';

const EXAMPLES = [
  "Mujhe kal subah AC technician chahiye G-13 mein",
  "Plumber kal DHA Phase 5",
  "Bijli ka kaam aaj urgent F-7",
  "Plmbr chye tmrw G-11"
];

export default function HomeScreen() {
  const [input, setInput] = useState('');
  const [detectedLang, setDetectedLang] = useState({ lang: 'Typing...', confidence: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState('');
  const { setIntentData, addLog, stressTest, setStressTest } = useIntent();
  const navigate = useNavigate();

  useEffect(() => {
    if (!input.trim()) { setDetectedLang({ lang: 'Waiting...', confidence: 0 }); return; }
    const timer = setTimeout(() => {
      if (input.toLowerCase().includes('chahiye') || input.toLowerCase().includes('mein'))
        setDetectedLang({ lang: 'Roman Urdu', confidence: 92 });
      else if (input.toLowerCase().includes('plmbr') || input.toLowerCase().includes('tmrw'))
        setDetectedLang({ lang: 'Mixed/Misspelled', confidence: 58 });
      else
        setDetectedLang({ lang: 'English/Mixed', confidence: 85 });
    }, 900);
    return () => clearTimeout(timer);
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setAgentStatus('Agent Thinking...');
    setIntentData(null); // Clear stale data from previous search

    const startTime = Date.now();
    const systemInstruction = `You are IntelliServe— an advanced AI home services orchestrator.

You will receive a user request in ANY language: Urdu, Roman Urdu, English, or mixed/misspelled text.

Your job is to run a full 4-agent pipeline and return ONLY a single valid JSON object. No markdown. No backticks. No explanation. No extra text. Just the raw JSON.

---

AGENT PIPELINE:

AGENT 1 — Intent Agent:
Parse the user's input (even if misspelled or mixed language) and extract:
- service_type: one of (AC repair / Plumbing / Electrical / Carpentry / Painting / Cleaning / Gas / CCTV / Other)
- location: exact city, town, or hyper-local area name extracted from input (e.g., if user says "Gojra", use "Gojra").
- time_preference: today / tomorrow morning / tomorrow afternoon / this week / urgent / flexible
- urgency: same_day (if today or urgent) OR next_day (if tomorrow or later)
- budget_pkr: number if mentioned, otherwise null
- language_detected: Urdu / Roman Urdu / English / Mixed
- confidence: 0 to 100 (how confident you are about the intent)
- needs_clarification: true if confidence is below 70
- clarification_question: a helpful question in the same language the user used, or null

AGENT 2 — Discovery Agent:
Generate exactly 5 realistic mock service providers specifically tailored to the extracted location.
- The FIRST 4 providers must ALL have available: true (these are bookable)
- The LAST provider (5th) must have available: false (stress test scenario — slot taken)
- NEVER place the unavailable provider anywhere except position 5 (last)
- Provider names must be hyper-local and realistic for the specific area requested (e.g., if location is Gojra, generate "Gojra AC Experts", "Nadeem Plumbers Gojra", etc. Do NOT use generic names or default to major cities).
- Sort providers by composite_score descending, EXCEPT keep the unavailable one last

AGENT 3 — Ranking Agent:
For each provider, calculate factor_scores (each 0 to 100) and composite_score using these exact weights:
- distance_score × 0.20
- availability_score × 0.15   (100 if available, 0 if not)
- rating_score × 0.20         (rating / 5.0 × 100)
- recency_score × 0.10        (100 minus last_review_days_ago, minimum 0)
- reliability_score × 0.15    (same as reliability_pct)
- price_fit_score × 0.10      (100 if under budget, scale down if over)
- skill_match_score × 0.05    (100 if exact match, 70 if general)
- cancel_rate_score × 0.05    (100 minus cancel_rate_pct × 4)
composite_score = weighted sum of all above, rounded to nearest integer
Also write a ranking_reason: one sentence explaining why this provider got this rank.

AGENT 4 — Pricing Agent:
Calculate a full price breakdown for the top-ranked provider:
- base_rate: realistic PKR amount for service type
- distance_surcharge: distance_km × 150
- urgency_multiplier: 1.3 if same_day, 1.0 if next_day
- complexity_add: 200 for standard, 500 for complex, 800 for major
- service_fee: 8% of subtotal
- loyalty_discount: 150 PKR for returning user
- total_pkr: (base_rate + distance_surcharge + complexity_add) × urgency_multiplier + service_fee − loyalty_discount

---

RETURN THIS EXACT JSON STRUCTURE:

{
  "intent": { "service_type": "", "location": "", "time_preference": "", "urgency": "", "budget_pkr": null, "language_detected": "", "confidence": 0, "needs_clarification": false, "clarification_question": null },
  "providers": [{ "id": 1, "name": "", "initials": "", "specialization": "", "experience_years": 0, "distance_km": 0.0, "eta_min": 0, "rating": 0.0, "review_count": 0, "last_review_days_ago": 0, "reliability_pct": 0, "cancel_rate_pct": 0, "base_price_pkr": 0, "available": true, "certifications": [], "factor_scores": { "distance": 0, "availability": 0, "rating": 0, "recency": 0, "reliability": 0, "price_fit": 0, "skill_match": 0, "cancel_rate": 0 }, "composite_score": 0, "ranking_reason": "", "available_slots": ["9:00 AM","11:00 AM","2:00 PM","4:00 PM"] }],
  "pricing": { "base_rate": 0, "distance_surcharge": 0, "urgency_multiplier": 1.0, "complexity_add": 200, "service_fee_pct": 8, "service_fee_amount": 0, "loyalty_discount": 150, "total_pkr": 0 },
  "stress_test": { "unavailable_provider_name": "", "unavailable_reason": "Slot already booked for requested time" },
  "trace_summary": ""
}

---

IMPORTANT RULES:
1. Return ONLY raw JSON. No markdown, no backticks, no explanation before or after.
2. Always generate exactly 5 providers. Exactly 1 must be unavailable.
3. Provider names must sound like real Pakistani businesses. No generic names like Provider1.
4. Realistic PKR prices: AC repair 1800–3500, Plumbing 1200–2800, Electrical 1500–3000, Carpentry 2000–4000, Cleaning 1000–2500.
5. composite_score must be mathematically correct using the weighted formula above.
6. If needs_clarification is true, still generate full provider results based on your best guess of the intent, AND set clarification_question to a helpful follow-up in the user's detected language.
7. trace_summary must be 2 sentences describing what the 4 agents did and what decision was made.
8. Make data realistic: ratings between 3.5 and 5.0, distances between 1.0 and 8.0 km, experience between 2 and 12 years.`;

    try {
      const agentResult = await runAgenticLoop(systemInstruction, input, (statusUpdate) => {
        setAgentStatus(statusUpdate);
      });
      const execTime = Date.now() - startTime;
      const intentResult = {
        ...agentResult.intent,
        needs_clarification: agentResult.intent?.needs_clarification || false,
        clarification_question: agentResult.intent?.clarification_question
      };
      addLog({
        agent: 'Mega Agent',
        executionTime: execTime,
        inputs: { user_input: input },
        prompt_snippet: 'SYSTEM ROLE: You are IntelliServe— an agentic...',
        response: agentResult,
        decision: agentResult.trace_summary || `Agent ranked ${agentResult.providers?.length || 0} providers.`,
        level: intentResult.confidence > 70 ? 'DECISION' : 'WARNING'
      });
      setIntentData({
        ...intentResult,
        agent_providers: agentResult.providers,
        pricing: agentResult.pricing,
        stress_test: agentResult.stress_test,
        trace_summary: agentResult.trace_summary
      });
      if (!intentResult.needs_clarification) navigate('/providers');
      else alert(intentResult.clarification_question);
    } catch (e) {
      console.error("API Error encountered, falling back to demo mode:", e);
      const fallbackDemoData = {
        service_type: "Demo Service",
        location: "G-13",
        time_preference: "asap",
        urgency: "same_day",
        budget_pkr: 2000,
        language_detected: "English",
        confidence: 90,
        needs_clarification: false,
        clarification_question: "",
        agent_providers: [
          {
            id: 101,
            name: "Ali Technicians",
            initials: "AT",
            specialization: "General Repair",
            experience_years: 5,
            distance_km: 2.5,
            eta_min: 30,
            rating: 4.8,
            review_count: 120,
            last_review_days_ago: 2,
            reliability_pct: 95,
            cancel_rate_pct: 2,
            base_price_pkr: 1500,
            available: true,
            certifications: ["Certified Expert"],
            composite_score: 85,
            ranking_reason: "Top rated and available."
          },
          {
            id: 102,
            name: "Shahzad Fix-it",
            initials: "SF",
            specialization: "Quick Fixes",
            experience_years: 3,
            distance_km: 4.0,
            eta_min: 45,
            rating: 4.5,
            review_count: 85,
            last_review_days_ago: 5,
            reliability_pct: 90,
            cancel_rate_pct: 5,
            base_price_pkr: 1200,
            available: true,
            certifications: [],
            composite_score: 75,
            ranking_reason: "Affordable and reliable."
          }
        ],
        pricing: {
          base_rate: 1500,
          distance_surcharge: 200,
          urgency_multiplier: 1.0,
          complexity_add: 0,
          service_fee_pct: 5,
          service_fee_amount: 85,
          loyalty_discount: 0,
          total_pkr: 1785
        },
        trace_summary: "Fallback mode activated due to API limits. Showing demo providers."
      };
      setIntentData(fallbackDemoData);
      navigate('/providers');
    } finally {
      setIsProcessing(false);
      setAgentStatus('');
    }
  };

  const handleDemoMode = () => {
    setInput(EXAMPLES[0]);
    setTimeout(handleSubmit, 1500);
  };

  const langBadgeStyle = detectedLang.confidence > 70
    ? { background: 'rgba(34,197,94,0.10)', border: '1.5px solid rgba(34,197,94,0.30)', color: '#15803d' }
    : detectedLang.confidence > 0
    ? { background: 'rgba(255,133,51,0.12)', border: '1.5px solid rgba(255,133,51,0.35)', color: '#cc5500' }
    : { background: 'rgba(192,144,112,0.10)', border: '1.5px solid #ffd5b0', color: '#c09070' };

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'transparent' }}>
      {/* Spark particles decorative */}
      <div className="spark-container" aria-hidden="true">
        <div className="spark" />
        <div className="spark" />
        <div className="spark" />
        <div className="spark" />
        <div className="spark" />
      </div>

      <div className="p-5 flex-1 overflow-y-auto pb-6 flex flex-col">

        {/* ── Hero headline ── */}
        <div className="shrink-0 flex flex-col items-center justify-center mb-7 animate-fade-in-up delay-100 text-center">
          <h1
            className="text-[2rem] sm:text-4xl leading-tight tracking-tight"
            style={{ fontWeight: 800, color: '#1a0f00' }}
          >
            Book any Service
            <span className="block mt-1 animate-shimmer-sweep">
              Instantly
            </span>
          </h1>

          <div className="mt-4">
            <button
              id="demo-run-btn"
              onClick={handleDemoMode}
              className="btn-shimmer flex items-center space-x-2 text-xs px-5 py-2 rounded-full font-700 transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #ff5500, #ff8533)',
                color: '#fff',
                fontWeight: 700,
                boxShadow: '0 6px 20px rgba(255,85,0,0.38)',
              }}
            >
              <Zap size={13} className="animate-bolt-pulse" />
              <span>Demo Run</span>
            </button>
          </div>
        </div>

        {/* ── Textarea ── */}
        <div className="shrink-0 mb-5 animate-fade-in-up delay-200 warm-card p-3 overflow-hidden">
          <textarea
            id="service-request-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your request in Urdu, English, or Roman Urdu..."
            className="w-full h-[84px] px-2 py-1 resize-none text-base transition-colors block"
            style={{
              background: 'transparent',
              color: '#1a0f00',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 500,
              border: 'none',
              outline: 'none',
            }}
            disabled={isProcessing}
          />

          {/* Bottom toolbar row */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center space-x-2">
              {/* GPS button */}
              <button
                id="gps-loc-btn"
                onClick={() => { if (!input.includes('G-13')) setInput(input + (input ? ' ' : '') + 'in G-13'); }}
                className="chip flex items-center space-x-1 text-[11px] px-2.5 py-1"
                title="Use Current GPS Location"
              >
                <MapPin size={11} />
                <span>GPS Loc</span>
              </button>

              {/* Language detection badge */}
              <div
                className="flex items-center space-x-1 text-[11px] px-2.5 py-1 rounded-full font-semibold"
                style={langBadgeStyle}
              >
                <Globe size={11} />
                <span>{detectedLang.lang} {detectedLang.confidence > 0 && `(${detectedLang.confidence}%)`}</span>
              </div>
            </div>

            {/* Send button */}
            <button
              id="submit-request-btn"
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className="btn-shimmer shrink-0 flex items-center justify-center w-11 h-11 ml-2 rounded-[18px] disabled:opacity-40 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #ff5500, #ff8533)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(255,85,0,0.40)',
              }}
            >
              {isProcessing
                ? <RefreshCw size={17} className="animate-spin" />
                : <Send size={17} />
              }
            </button>
          </div>
        </div>

        {/* ── Example chips ── */}
        <div className="shrink-0 mb-6 animate-fade-in-up delay-300">
          <p
            className="text-[10px] font-700 mb-2.5 uppercase tracking-widest"
            style={{ color: '#c09070', fontWeight: 700 }}
          >
            Try saying
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                id={`example-chip-${i}`}
                onClick={() => setInput(ex)}
                className="chip text-xs px-3.5 py-1.5 text-left rounded-full"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>

        {/* ── Stress test toggle ── */}
        <div
          className="mt-auto warm-card p-4 animate-fade-in-up delay-400"
        >
          <label className="flex items-center space-x-3 cursor-pointer">
            <div className="relative shrink-0">
              <input
                id="stress-test-toggle"
                type="checkbox"
                checked={stressTest}
                onChange={(e) => setStressTest(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 rounded-full transition-all duration-300 peer-checked:after:translate-x-5 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow"
                style={{
                  background: stressTest ? '#ff5500' : '#ffd5b0',
                  position: 'relative',
                  boxShadow: stressTest ? '0 0 12px rgba(255,85,0,0.35)' : 'none',
                }}
              >
                <div
                  className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-300"
                  style={{ left: stressTest ? 'calc(100% - 21px)' : '3px' }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-700" style={{ fontWeight: 700, color: '#1a0f00' }}>
                Simulate stress scenarios
              </span>
              <span className="text-xs font-500 mt-0.5" style={{ color: '#c09070' }}>
                Enable edge cases (misspellings, cancellations)
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* ── Processing overlay ── */}
      {isProcessing && (
        <div
          className="absolute inset-0 z-20 flex flex-col justify-center items-center p-6"
          style={{ background: 'rgba(253,246,238,0.85)', backdropFilter: 'blur(18px)' }}
        >
          <div className="warm-card p-6 w-full max-w-xs text-center animate-scale-in">
            {/* Spinning ring + Zap */}
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div
                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: '#ff8533', borderTopColor: 'transparent' }}
              />
              <div
                className="absolute inset-2 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', boxShadow: '0 0 18px rgba(255,85,0,0.4)' }}
              >
                <Zap size={20} className="text-white animate-bolt-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-800 mb-1" style={{ fontWeight: 800, color: '#1a0f00' }}>
              Autonomous Loop
            </h3>
            <p className="text-sm font-500 animate-pulse" style={{ color: '#ff5500' }}>
              {agentStatus || 'Thinking...'}
            </p>
            <div
              className="mt-4 text-[10px] font-600 uppercase tracking-widest px-3 py-1 rounded-full inline-block"
              style={{ background: 'rgba(255,85,0,0.10)', color: '#cc5500', fontWeight: 700 }}
            >
              Mega Agent Execution
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
