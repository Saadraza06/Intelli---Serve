import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Shield, Clock, Calendar as CalendarIcon, CheckCircle, AlertTriangle, Zap, ChevronRight, ActivitySquare, PhoneCall, Loader2, MessageCircle, Mail } from 'lucide-react';
import { useIntent } from '../context/IntentContext';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProvider } = useIntent();
  const [provider, setProvider] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState('Call Provider (Masked)');
  const [emailError, setEmailError] = useState(false);
  const reviewsRef = React.useRef(null);

  const scrollToReviews = () => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const handleEmailClick = () => {
    if (provider.email) window.location.href = `mailto:${provider.email}`;
    else { setEmailError(true); setTimeout(() => setEmailError(false), 3000); }
  };
  const handleCall = () => {
    setIsCalling(true); setCallStatus('Connecting via Twilio...');
    setTimeout(() => { setCallStatus('Ringing...'); setTimeout(() => { setIsCalling(false); setCallStatus('Call Provider (Masked)'); }, 3500); }, 1500);
  };
  useEffect(() => {
    if (selectedProvider?.provider) { setProvider(selectedProvider.provider); setPricing(selectedProvider.pricing); }
    else navigate('/providers');
  }, [selectedProvider, navigate]);

  if (!provider) return null;

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'transparent' }}>
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-5 pb-4">
          <div className="warm-card p-5">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shrink-0"
                style={{ background: 'linear-gradient(135deg,rgba(255,133,51,0.18),rgba(255,85,0,0.10))', border: '2.5px solid #ffd5b0', color: '#ff5500', fontWeight: 800 }}>
                {provider.initials || provider.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl leading-tight" style={{ fontWeight: 800, color: '#1a0f00' }}>{provider.name}</h1>
                <p className="text-sm mt-0.5" style={{ fontWeight: 600, color: '#ff5500' }}>{provider.specialization}</p>
                <div className="flex items-center text-sm mt-1.5 space-x-3">
                  <button onClick={scrollToReviews} className="flex items-center group">
                    <Star size={13} className="mr-1" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    <span style={{ color: '#1a0f00', fontWeight: 600 }}>{provider.rating} ({provider.review_count} reviews)</span>
                  </button>
                  {provider.reliability_pct > 90 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center" style={{ background: 'rgba(22,163,74,0.10)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.28)', fontWeight: 700 }}>
                      <CheckCircle size={10} className="mr-1" /> Guarantee
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 italic" style={{ color: '#7a4020' }}>"{provider.ranking_reason}"</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {provider.certifications?.map((cert, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full flex items-center" style={{ background: 'rgba(255,85,0,0.08)', color: '#cc5500', border: '1px solid #ffd5b0', fontWeight: 600 }}>
                  <Shield size={11} className="mr-1" /> {cert}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 border-t pt-4" style={{ borderColor: '#ffe5cc' }}>
              <Stat label="Experience" value={`${provider.experience_years}y`} />
              <Stat label="Cancel Rate" value={`${provider.cancel_rate_pct}%`} />
              <Stat label="Reliability" value={`${provider.reliability_pct}%`} />
            </div>
            <div className="mt-5 border-t pt-5 flex flex-col space-y-3" style={{ borderColor: '#ffe5cc' }}>
              <button id="call-provider-btn" onClick={handleCall} disabled={isCalling}
                className={`w-full py-3.5 rounded-2xl flex items-center justify-center text-sm transition-all duration-300 ${isCalling ? 'cursor-not-allowed' : 'btn-shimmer hover:scale-[1.02] cursor-pointer'}`}
                style={isCalling ? { background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.25)', color: '#16a34a' } : { background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontWeight: 700, boxShadow: '0 6px 20px rgba(22,163,74,0.30)' }}>
                {isCalling ? <Loader2 size={17} className="mr-2 animate-spin" /> : <PhoneCall size={17} className="mr-2 animate-pulse" />}
                {callStatus}
              </button>
              <div className="flex space-x-3">
                <button id="whatsapp-btn" onClick={() => window.open('https://wa.me/923000000000', '_blank')}
                  className="flex-1 py-3 rounded-2xl flex items-center justify-center text-sm hover:scale-[1.02] transition-all"
                  style={{ background: 'rgba(37,211,102,0.10)', border: '1.5px solid rgba(37,211,102,0.30)', color: '#22a04b', fontWeight: 700 }}>
                  <MessageCircle size={17} className="mr-2" /> WhatsApp
                </button>
                <button id="email-btn" onClick={handleEmailClick}
                  className="flex-1 py-3 rounded-2xl flex items-center justify-center text-sm hover:scale-[1.02] transition-all"
                  style={{ background: 'rgba(255,85,0,0.06)', border: '1.5px solid #ffd5b0', color: '#cc5500', fontWeight: 700 }}>
                  <Mail size={17} className="mr-2" /> Email
                </button>
              </div>
              {emailError && <div className="text-xs py-2 rounded-xl text-center" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)', fontWeight: 700 }}>Provider email is not available</div>}
              <p className="text-center text-[10px]" style={{ color: '#c09070' }}>Calls are recorded and your personal number is kept private.</p>
            </div>
          </div>
        </div>

        <div className="px-5 mb-4">
          <div className="warm-card overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#ffe5cc', background: 'rgba(255,245,238,0.60)' }}>
              <h3 className="text-sm flex items-center" style={{ fontWeight: 700, color: '#1a0f00' }}>
                <Zap size={15} className="mr-2 animate-bolt-pulse" style={{ color: '#ff5500' }} /> Dynamic Pricing
              </h3>
            </div>
            <div className="p-4">
              {pricing && (
                <div className="space-y-3 text-sm">
                  <PriceRow label="Base Rate" amount={pricing.base_rate} note="Standard base rate" />
                  <PriceRow label="Distance Surcharge" amount={pricing.distance_surcharge} note={`${provider.distance_km}km away`} />
                  {pricing.urgency_multiplier > 1.0 && <PriceRow label="Urgency Multiplier" amount={`×${pricing.urgency_multiplier}`} note="Same-day request" />}
                  {pricing.complexity_add > 0 && <PriceRow label="Complexity Add" amount={`+${pricing.complexity_add}`} note="Job complexity" />}
                  {pricing.loyalty_discount > 0 && <PriceRow label="Loyalty Discount" amount={`−${pricing.loyalty_discount}`} note="Returning user" isDiscount />}
                  <PriceRow label="Service Fee" amount={pricing.service_fee_amount} note="Platform fee" />
                  <div className="pt-3 mt-3 border-t flex justify-between items-center" style={{ borderColor: '#ffe5cc' }}>
                    <span style={{ fontWeight: 700, color: '#1a0f00' }}>Total Estimated</span>
                    <span style={{ fontWeight: 800, color: '#ff5500', fontSize: '1.2rem' }}>PKR {pricing.total_pkr}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 mb-4">
          <div className="warm-card p-4">
            <h3 className="text-sm flex items-center mb-4" style={{ fontWeight: 700, color: '#1a0f00' }}>
              <CalendarIcon size={15} className="mr-2" style={{ color: '#ffb380' }} /> Available Slots Today
            </h3>
            <div className="flex flex-wrap gap-2">
              {provider.available_slots?.length > 0
                ? provider.available_slots.map((slot, i) => (
                    <div key={i} className="px-4 py-2 rounded-full text-sm" style={{ background: 'rgba(22,163,74,0.10)', color: '#16a34a', border: '1.5px solid rgba(22,163,74,0.28)', fontWeight: 600 }}>{slot}</div>
                  ))
                : <div className="text-sm" style={{ color: '#c09070' }}>No slots available.</div>
              }
            </div>
          </div>
        </div>

        <div ref={reviewsRef} className="px-5 mb-6 scroll-mt-4 animate-fade-in-up delay-300">
          <div className="warm-card p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm flex items-center" style={{ fontWeight: 700, color: '#1a0f00' }}>
                <Star size={15} className="mr-2 animate-pulse" style={{ color: '#f59e0b', fill: '#f59e0b' }} /> Customer Reviews
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,85,0,0.08)', color: '#cc5500', border: '1px solid #ffd5b0', fontWeight: 600 }}>
                {provider.review_count || 142} Reviews
              </span>
            </div>
            <div className="flex items-center space-x-5 pb-5 mb-5" style={{ borderBottom: '1px solid #ffe5cc' }}>
              <div className="text-center shrink-0">
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1a0f00' }}>{provider.rating || '4.8'}</div>
                <div className="flex justify-center my-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} style={{ fill: '#f59e0b', color: '#f59e0b' }} />)}
                </div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: '#c09070', fontWeight: 700 }}>Out of 5.0</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[{ s: 5, p: 76 }, { s: 4, p: 16 }, { s: 3, p: 6 }, { s: 2, p: 1 }, { s: 1, p: 1 }].map(({ s, p }) => (
                  <div key={s} className="flex items-center space-x-2 text-[11px]" style={{ color: '#c09070' }}>
                    <span className="w-3 text-right">{s}</span>
                    <Star size={10} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: '#ffeedd' }}>
                      <div className="h-full rounded-full" style={{ width: `${p}%`, background: 'linear-gradient(90deg,#ff5500,#ff8533)' }} />
                    </div>
                    <span className="w-7 text-right">{p}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {generateReviews(provider).map((rev, i) => (
                <div key={i} className="p-4 rounded-2xl" style={{ background: 'rgba(255,245,238,0.70)', border: '1px solid #ffe5cc' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span style={{ fontWeight: 700, color: '#1a0f00', fontSize: '0.875rem' }}>{rev.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(22,163,74,0.10)', color: '#16a34a', fontWeight: 700 }}>Verified</span>
                      </div>
                      <div className="flex mt-0.5">{Array.from({ length: 5 }).map((_, idx) => <Star key={idx} size={10} style={{ fill: idx < rev.rating ? '#f59e0b' : 'transparent', color: '#f59e0b', opacity: idx < rev.rating ? 1 : 0.3 }} />)}</div>
                    </div>
                    <span style={{ color: '#c09070', fontSize: '0.625rem' }}>{rev.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed italic" style={{ color: '#7a4020' }}>"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 p-4 rounded-3xl z-20 shrink-0"
        style={{ background: 'rgba(255,252,248,0.96)', backdropFilter: 'blur(20px)', border: '1.5px solid #ffe5cc', boxShadow: '0 -4px 30px rgba(255,85,0,0.10)' }}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: '#ff5500', fontWeight: 700 }}>Final Amount</p>
            <p style={{ fontWeight: 900, color: '#1a0f00', fontSize: '1.5rem' }}>PKR {pricing?.total_pkr || '---'}</p>
          </div>
          <button id="confirm-booking-btn" onClick={() => navigate('/booking', { state: { provider, pricing } })} disabled={!pricing}
            className="btn-shimmer flex items-center px-6 py-3.5 rounded-full transition-all duration-300 disabled:opacity-50 hover:scale-[1.03] cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', color: '#fff', fontWeight: 700, boxShadow: '0 6px 20px rgba(255,85,0,0.38)' }}>
            Confirm Booking <ChevronRight size={17} className="ml-1.5 animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center p-2">
      <span style={{ fontWeight: 800, color: '#1a0f00', fontSize: '1rem' }}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: '#c09070', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function PriceRow({ label, amount, note, isDiscount }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span style={{ color: '#7a4020' }}>{label}</span>
        <span style={{ fontWeight: 600, color: isDiscount ? '#16a34a' : '#1a0f00' }}>{amount}</span>
      </div>
      <p className="text-[10px]" style={{ color: '#c09070' }}>{note}</p>
    </div>
  );
}

function generateReviews(provider) {
  const s = (provider.specialization || provider.name || '').toLowerCase();
  if (s.includes('ac') || s.includes('cool')) return [
    { name: 'Muhammad Usman', rating: 5, time: 'Yesterday',  comment: 'Excellent AC service! Split clean kiya bilkul nayi jesa. Highly recommended.' },
    { name: 'Ayesha Bibi',   rating: 5, time: '3 days ago', comment: 'Very professional. Inverter unit ka sensor issue diagnose kiya same day. Honest rates.' },
    { name: 'Sajjad Ali',    rating: 4, time: '1 week ago', comment: 'AC gas leakage repair done perfectly. Transparent pricing, no hidden charges.' },
  ];
  if (s.includes('plumb') || s.includes('pipe')) return [
    { name: 'M. Bilal',      rating: 5, time: '2 days ago', comment: 'Zabardast plumbing service. Kitchen pipe leak fix within 20 mins. Very polite.' },
    { name: 'Kiran Shah',    rating: 5, time: '4 days ago', comment: 'Geyser repair was extremely quick. Checked for pressure and leaks before leaving.' },
    { name: 'Zainab Fatima', rating: 4, time: '1 week ago', comment: 'Commode repair done cleanly. Rates fair with market. Recommended.' },
  ];
  return [
    { name: 'Hamza Malik',   rating: 5, time: 'Yesterday',  comment: 'Acha kaam kiya, bohot professional. Highly satisfied.' },
    { name: 'Zoya Butt',     rating: 5, time: '3 days ago', comment: 'Very polite, background checked. Punctual, arrived exactly on time.' },
    { name: 'Asad Chaudhry', rating: 4, time: '1 week ago', comment: 'Good service for the price, will book again.' },
  ];
}
