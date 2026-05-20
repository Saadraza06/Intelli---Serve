import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, MessageSquare, Smartphone, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { useIntent } from '../context/IntentContext';
import { callGeminiAPI } from '../services/geminiService';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { provider, pricing } = location.state || {};
  const { setBookingState, addLog, stressTest } = useIntent();
  const [booking, setBooking] = useState(null);
  const [isBooking, setIsBooking] = useState(true);
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    if (!provider || !pricing) { navigate('/'); return; }
    confirmBooking();
  }, [provider, pricing]);

  const confirmBooking = async () => {
    const startTime = Date.now();
    const systemInstruction = `You are a Booking Agent. Given booking_details, check for conflicts and confirm. Return: booking_id (format KB-YYYY-XXXXX), confirmation_status, conflict_detected (bool), conflict_resolution if needed, sms_message (in Roman Urdu, under 160 chars), whatsapp_message (formatted), scheduled_reminder_time. Return JSON.`;
    const prompt = JSON.stringify({ provider_id: provider.id, provider_name: provider.name, amount: pricing.total_pkr, time: '10:00 AM', date: 'Tomorrow' });
    try {
      const result = await callGeminiAPI(systemInstruction, prompt, true);
      const execTime = Date.now() - startTime;
      if (stressTest && Math.random() > 0.5) {
        result.conflict_detected = true;
        result.conflict_resolution = 'Original slot booked. Offered alternative slot at 12:00 PM.';
        result.confirmation_status = 'PENDING_RESOLUTION';
      }
      addLog({ agent: 'Booking Agent', executionTime: execTime, inputs: { provider_id: provider.id }, prompt_snippet: systemInstruction.substring(0, 50) + '...', response: result, decision: result.conflict_detected ? `Conflict: ${result.conflict_resolution}` : `Confirmed: ${result.booking_id}`, level: result.conflict_detected ? 'WARNING' : 'DECISION' });
      if (result.conflict_detected) {
        setConflict(true); setIsBooking(false);
        setTimeout(() => { result.conflict_detected = false; result.confirmation_status = 'CONFIRMED'; result.scheduled_reminder_time = '11:00 AM'; setConflict(false); setBooking(result); setBookingState('CONFIRMED'); }, 3000);
      } else { setBooking(result); setBookingState('CONFIRMED'); setIsBooking(false); }
    } catch (e) { console.error(e); setIsBooking(false); }
  };
  const handleAddToCalendar = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    const startStr = `${yyyy}${mm}${dd}T100000`;
    const endStr = `${yyyy}${mm}${dd}T110000`;

    const title = encodeURIComponent(`IntelliServe: ${provider?.name || 'Service'}`);
    const details = encodeURIComponent(`Booking ID: ${booking?.booking_id}\nProvider: ${provider?.name}\nTotal: PKR ${pricing?.total_pkr || 1650}`);
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startStr}/${endStr}`;
    window.open(url, '_blank');
  };


  if (isBooking) return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6" style={{ background: 'transparent' }}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#ff8533', borderTopColor: 'transparent' }} />
        <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)' }}>
          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl mb-2" style={{ fontWeight: 800, color: '#1a0f00' }}>Booking your service…</h2>
        <p style={{ color: '#c09070' }}>Gemini Booking Agent is checking calendar availability.</p>
      </div>
    </div>
  );

  if (conflict) return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 text-center" style={{ background: 'transparent' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(217,119,6,0.12)', border: '2px solid rgba(217,119,6,0.30)' }}>
        <Calendar size={32} style={{ color: '#d97706' }} />
      </div>
      <div>
        <h2 className="text-xl mb-2" style={{ fontWeight: 800, color: '#1a0f00' }}>Slot Conflict Detected!</h2>
        <p style={{ color: '#c09070' }}>The Booking Agent found a double-booking. Attempting to resolve automatically…</p>
      </div>
      <Loader2 size={32} className="animate-spin mt-4" style={{ color: '#d97706' }} />
    </div>
  );

  if (!booking) return null;

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'transparent' }}>
      <div className="flex-1 overflow-y-auto">

        {/* Success header */}
        <div className="p-6 pb-10 rounded-b-[40px] flex flex-col items-center text-center"
          style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', boxShadow: '0 8px 30px rgba(255,85,0,0.30)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mt-2"
            style={{ background: 'rgba(255,255,255,0.20)', border: '2px solid rgba(255,255,255,0.40)' }}>
            <CheckCircle size={42} className="text-white" />
          </div>
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 800 }}>Booking Confirmed!</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>ID: {booking.booking_id}</p>
        </div>

        {/* Pipeline pills */}
        <div className="px-4 -mt-5 mb-6 relative z-10 flex justify-center">
          <div className="flex items-center space-x-1 text-[10px] px-4 py-2.5 rounded-full"
            style={{ background: '#fff', border: '1.5px solid #ffe5cc', boxShadow: '0 4px 16px rgba(255,85,0,0.12)', fontWeight: 700 }}>
            {['Intent ✓', 'Ranked ✓', 'Priced ✓', 'Booked ✓'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span style={{ color: '#ff5500' }}>{step}</span>
                {i < arr.length - 1 && <ArrowRight size={9} style={{ color: '#c09070' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Receipt card */}
        <div className="px-4 mb-5">
          <div className="warm-card p-5 relative overflow-hidden">
            <h3 className="text-center mb-4 pb-3" style={{ fontWeight: 700, color: '#1a0f00', borderBottom: '1.5px dashed #ffd5b0' }}>
              Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Base Rate',          val: `PKR ${pricing.base_rate}` },
                { label: 'Distance Surcharge', val: `PKR ${pricing.distance_surcharge}` },
                ...(pricing.loyalty_discount > 0 ? [{ label: 'Loyalty Discount', val: `-PKR ${pricing.loyalty_discount}`, green: true }] : []),
                { label: 'Service Fee', val: `PKR ${pricing.service_fee}` },
              ].map(({ label, val, green }) => (
                <div key={label} className="flex justify-between" style={{ color: green ? '#16a34a' : '#7a4020' }}>
                  <span>{label}</span><span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 flex justify-between items-center" style={{ borderTop: '1.5px dashed #ffd5b0' }}>
              <span style={{ fontWeight: 700, color: '#1a0f00' }}>Total Paid</span>
              <span style={{ fontWeight: 800, color: '#ff5500', fontSize: '1.2rem' }}>PKR {pricing.total}</span>
            </div>
          </div>
        </div>

        {/* SMS preview */}
        <div className="px-4 mb-4">
          <div className="warm-card p-4">
            <div className="flex items-center space-x-2 text-sm mb-3" style={{ fontWeight: 700, color: '#1a0f00' }}>
              <Smartphone size={15} style={{ color: '#ff5500' }} />
              <span>SMS Notification</span>
            </div>
            <div className="p-3 text-sm rounded-2xl rounded-tl-none" style={{ background: '#fff7f0', border: '1.5px solid #ffe5cc', color: '#1a0f00' }}>
              {booking.sms_message}
            </div>
          </div>
        </div>

        {/* WhatsApp preview */}
        <div className="px-4 mb-6">
          <div className="warm-card p-4">
            <div className="flex items-center space-x-2 text-sm mb-3" style={{ fontWeight: 700, color: '#1a0f00' }}>
              <MessageSquare size={15} style={{ color: '#25D366' }} />
              <span>WhatsApp Notification</span>
            </div>
            <div className="p-3.5 text-sm rounded-2xl rounded-tr-none whitespace-pre-wrap" style={{ background: '#dcf8c6', color: '#111b21' }}>
              {booking.whatsapp_message}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-4 mb-4 p-4 rounded-3xl z-20 shrink-0 flex space-x-3"
        style={{ background: 'rgba(255,252,248,0.96)', backdropFilter: 'blur(20px)', border: '1.5px solid #ffe5cc', boxShadow: '0 -4px 24px rgba(255,85,0,0.10)' }}>
        <button id="add-to-cal-btn" onClick={handleAddToCalendar} className="flex-1 py-3.5 rounded-2xl flex items-center justify-center text-sm font-700 transition-all hover:scale-[1.02] cursor-pointer"
          style={{ background: 'rgba(255,85,0,0.06)', border: '1.5px solid #ffd5b0', color: '#cc5500', fontWeight: 700 }}>
          <Calendar size={17} className="mr-2" /> Add to Cal
        </button>
        <button id="track-service-btn" onClick={() => navigate('/followup')}
          className="btn-shimmer flex-1 py-3.5 rounded-2xl flex items-center justify-center text-sm font-700 transition-all hover:scale-[1.02] cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', color: '#fff', fontWeight: 700, boxShadow: '0 6px 20px rgba(255,85,0,0.35)' }}>
          Track Service
        </button>
      </div>
    </div>
  );
}
