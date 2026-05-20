import React, { useState } from 'react';
import { CheckCircle, Clock, Truck, Wrench, Star, MessageSquare, Send, Loader2 } from 'lucide-react';
import { callGeminiAPI } from '../services/geminiService';
import { useIntent } from '../context/IntentContext';

const STAGES = [
  { id: 'confirmed',   label: 'Confirmed',     icon: <CheckCircle size={18} /> },
  { id: 'reminder',   label: 'Reminder Sent',  icon: <Clock size={18} /> },
  { id: 'en_route',   label: 'En Route',       icon: <Truck size={18} /> },
  { id: 'in_progress',label: 'In Progress',    icon: <Wrench size={18} /> },
  { id: 'completed',  label: 'Completed',      icon: <Star size={18} /> },
];

export default function FollowUp() {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewResponse, setReviewResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addLog } = useIntent();

  const advanceTimeline = () => { if (currentStageIdx < STAGES.length - 1) setCurrentStageIdx(p => p + 1); };

  const submitReview = async () => {
    if (!review.trim() || rating === 0) return;
    setIsSubmitting(true);
    const startTime = Date.now();
    try {
      const result = await callGeminiAPI(
        `You are a sentiment analysis and response generation agent. Analyze this review. Determine sentiment (Positive/Neutral/Negative). Suggest a professional provider response in English/Roman Urdu. Return JSON with 'sentiment' and 'suggested_response'.`,
        `Rating: ${rating} stars\nReview: ${review}`, true
      );
      const execTime = Date.now() - startTime;
      addLog({ agent: 'Review Agent', executionTime: execTime, inputs: { rating, review }, prompt_snippet: 'Sentiment analysis...', response: result, decision: `Sentiment: ${result.sentiment}`, level: 'INFO' });
      if (!result.suggested_response) {
        result.sentiment = rating >= 4 ? 'Positive' : 'Negative';
        result.suggested_response = rating >= 4 ? 'Thank you for the great review! Glad we could help.' : "We're sorry for the inconvenience. We'll improve our service.";
      }
      setReviewResponse(result);
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col h-full relative pb-20" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="p-4 shrink-0 flex justify-between items-center" style={{ borderBottom: '1.5px solid #ffe5cc' }}>
        <h2 className="text-xl" style={{ fontWeight: 800, color: '#1a0f00' }}>Service Tracking</h2>
        {currentStageIdx < STAGES.length - 1 && (
          <button id="demo-next-state-btn" onClick={advanceTimeline}
            className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
            style={{ background: 'rgba(255,85,0,0.10)', color: '#cc5500', border: '1.5px solid #ffd5b0', fontWeight: 700 }}>
            Demo Next State
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5">

        {/* Timeline */}
        <div className="mb-7 relative">
          <div className="absolute left-[21px] top-4 bottom-4 w-0.5 rounded-full" style={{ background: '#ffeedd' }} />
          <div className="absolute left-[21px] top-4 w-0.5 rounded-full transition-all duration-700" style={{ background: 'linear-gradient(180deg,#ff5500,#ff8533)', height: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }} />
          <div className="space-y-6 relative">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIdx, isCurrent = idx === currentStageIdx, isFuture = idx > currentStageIdx;
              return (
                <div key={stage.id} className="flex items-center">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300"
                    style={isPast
                      ? { background: 'linear-gradient(135deg,#ff5500,#ff8533)', color: '#fff', boxShadow: '0 4px 14px rgba(255,85,0,0.30)' }
                      : isCurrent
                      ? { background: '#fff', border: '2.5px solid #ff5500', color: '#ff5500', boxShadow: '0 0 14px rgba(255,85,0,0.25)' }
                      : { background: '#fff', border: '2px solid #ffe5cc', color: '#c09070' }}>
                    {stage.icon}
                  </div>
                  <div className={`ml-4 transition-opacity duration-300 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                    <h3 className="text-sm" style={{ fontWeight: 700, color: isCurrent ? '#ff5500' : '#1a0f00' }}>{stage.label}</h3>
                    {isCurrent && <p className="text-xs mt-0.5" style={{ color: '#c09070' }}>Updated just now</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reminders */}
        {currentStageIdx < 4 && (
          <div className="warm-card p-4 mb-6">
            <h3 className="text-sm flex items-center mb-3" style={{ fontWeight: 700, color: '#1a0f00' }}>
              <Clock size={15} className="mr-2" style={{ color: '#ffb380' }} /> Scheduled Reminders
            </h3>
            <div className="space-y-3">
              {[
                { label: '1. Booking Confirmation', status: 'Sent', done: true },
                { label: '2. Pre-arrival (1 hour before)', status: 'Pending', done: false },
                { label: '3. Post-service Feedback', status: 'Scheduled', done: false },
              ].map(({ label, status, done }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span style={{ color: done ? '#c09070' : '#1a0f00', textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
                  <span className="text-xs" style={{ fontWeight: 700, color: done ? '#16a34a' : status === 'Pending' ? '#ff5500' : '#c09070' }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review form */}
        {currentStageIdx === STAGES.length - 1 && (
          <div className="warm-card p-5 animate-fade-in-up">
            <h3 className="text-lg mb-1" style={{ fontWeight: 800, color: '#1a0f00' }}>Rate your service</h3>
            <p className="text-xs mb-5" style={{ color: '#c09070' }}>Your feedback helps us improve.</p>
            <div className="flex justify-center space-x-2 mb-5">
              {[1,2,3,4,5].map(star => (
                <button key={star} id={`star-${star}-btn`} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                  <Star size={36} style={{ color: '#f59e0b', fill: star <= rating ? '#f59e0b' : 'transparent', transition: 'fill 0.2s' }} />
                </button>
              ))}
            </div>
            <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Write a review..."
              className="w-full p-3 text-sm resize-none h-24 mb-4"
              style={{ background: 'rgba(255,245,238,0.70)', border: '1.5px solid #ffe5cc', borderRadius: 16, color: '#1a0f00', outline: 'none', fontFamily: 'inherit' }} />
            <button id="submit-review-btn" onClick={submitReview} disabled={isSubmitting || rating === 0 || !review.trim() || !!reviewResponse}
              className="btn-shimmer w-full py-3 rounded-2xl flex items-center justify-center text-sm font-700 disabled:opacity-50 transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#ff5500,#ff8533)', color: '#fff', fontWeight: 700, boxShadow: '0 6px 20px rgba(255,85,0,0.35)' }}>
              {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <><span>Submit Feedback</span><Send size={15} className="ml-2" /></>}
            </button>

            {reviewResponse && (
              <div className="mt-5 p-4 rounded-2xl animate-fade-in-up flex items-center justify-center"
                style={{ background: 'rgba(255,85,0,0.06)', border: '1.5px solid #ffd5b0' }}>
                <span className="text-sm" style={{ fontWeight: 700, color: '#cc5500' }}>Thanks for Your Response</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
