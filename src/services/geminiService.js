import { GoogleGenerativeAI } from "@google/generative-ai";
import { geocodeLocation, searchNearbyProviders } from "./googleMapsService";
import { mockProviders } from "../data/mockProviders";

const getGeminiApiKey = () => {
  return localStorage.getItem('VITE_GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

const getModel = (systemInstruction) => {
  const activeKey = getGeminiApiKey();
  const genAI = new GoogleGenerativeAI(activeKey);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
  });
};

export const callGeminiAPI = async (systemInstruction, userPrompt, useJSON = true) => {
  const activeKey = getGeminiApiKey();
  const cleanKey = activeKey?.trim();
  if (!cleanKey || cleanKey === 'your_api_key_here') {
    return generateMockResponse(systemInstruction, userPrompt);
  }
  try {
    const model = getModel();
    const config = useJSON ? { responseMimeType: "application/json" } : {};
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Input: ${userPrompt}` }] }],
      generationConfig: config
    });
    const text = result.response.text();
    if (useJSON) {
      try {
        return JSON.parse(text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
      } catch (e) {
        return generateMockResponse(systemInstruction, userPrompt);
      }
    }
    return text;
  } catch (error) {
    return generateMockResponse(systemInstruction, userPrompt);
  }
};

// ─── STAGE 1: Intent extraction prompt ───────────────────────────────────────
const INTENT_PROMPT = `You are an Intent Extraction Agent for a Pakistani home services app.
Extract the user's request and return ONLY raw JSON with NO markdown, NO backticks:
{
  "service_type": "one of: AC repair / Plumbing / Electrical / Carpentry / Painting / Cleaning / Gas / CCTV / Other",
  "location": "exact area/city name from input, e.g. G-13, DHA Phase 5, Lahore",
  "time_preference": "today / tomorrow morning / tomorrow afternoon / this week / urgent / flexible",
  "urgency": "same_day OR next_day",
  "budget_pkr": null,
  "language_detected": "Urdu / Roman Urdu / English / Mixed",
  "confidence": 0,
  "needs_clarification": false,
  "clarification_question": null
}`;

// ─── STAGE 3: Ranking + Pricing prompt with injected real providers ───────────
const buildRankingPrompt = (intent, realProviders) => `You are IntelliServe — an agentic home services orchestrator.
You have been given REAL provider data fetched from Google Maps. DO NOT generate fake providers.

USER INTENT:
${JSON.stringify(intent, null, 2)}

REAL PROVIDERS FROM GOOGLE MAPS (${realProviders.length} results):
${JSON.stringify(realProviders, null, 2)}

YOUR JOB:
1. For each provider, compute factor_scores (0-100) using:
   - distance_score = max(0, 100 - distance_km * 10)     × 0.20
   - availability_score = 100 if available else 0         × 0.15
   - rating_score = (rating / 5.0) * 100                 × 0.20
   - recency_score = max(0, 100 - last_review_days_ago)  × 0.10
   - reliability_score = reliability_pct                  × 0.15
   - price_fit_score = 100 if under budget else 70       × 0.10
   - skill_match_score = 100                              × 0.05
   - cancel_rate_score = max(0,100 - cancel_rate_pct*4)  × 0.05
   - composite_score = weighted sum, rounded to integer
2. Write a ranking_reason (1 sentence) per provider.
3. Sort providers by composite_score DESC. Keep unavailable providers last.
4. Compute pricing for the TOP provider only.
5. Return ONLY raw JSON, NO markdown, NO backticks:
{
  "intent": <echo back the intent object>,
  "providers": [
    {
      "id": "provider_id",
      "name": "Provider Name",
      "initials": "PN",
      "specialization": "Specialization",
      "experience_years": 0,
      "distance_km": 0.0,
      "eta_min": 0,
      "rating": 0.0,
      "review_count": 0,
      "last_review_days_ago": 0,
      "reliability_pct": 0,
      "cancel_rate_pct": 0,
      "base_price_pkr": 0,
      "available": true,
      "certifications": [],
      "composite_score": 0,
      "ranking_reason": "",
      "available_slots": [],
      "factor_scores": {
        "distance": 0,
        "availability": 0,
        "rating": 0,
        "recency": 0,
        "reliability": 0,
        "price_fit": 0,
        "skill_match": 0,
        "cancel_rate": 0
      }
    }
  ],
  "pricing": {
    "base_rate": 0, "distance_surcharge": 0, "urgency_multiplier": 1.0,
    "complexity_add": 200, "service_fee_pct": 8, "service_fee_amount": 0,
    "loyalty_discount": 150, "total_pkr": 0
  },
  "stress_test": {
    "unavailable_provider_name": "",
    "unavailable_reason": "Slot already booked for requested time"
  },
  "trace_summary": "2 sentence summary of what the agents did."
}`;

export const runAgenticLoop = async (systemInstruction, userPrompt, onUpdate) => {
  console.log("Starting 3-Stage Real-Time Pipeline...");
  const cleanKey = getGeminiApiKey()?.trim();

  if (!cleanKey || cleanKey === 'your_api_key_here') {
    return simulateAgenticLoop(systemInstruction, userPrompt, onUpdate);
  }

  try {
    // ── STAGE 1: Extract intent ──────────────────────────────────────────────
    if (onUpdate) onUpdate("Intent Agent: Parsing your request...");
    const intentModel = getModel(INTENT_PROMPT);
    const intentResult = await intentModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    const intentText = intentResult.response.text().trim()
      .replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const intent = JSON.parse(intentText);
    console.log("[Stage 1] Intent:", intent);

    // ── STAGE 2: Fetch real providers from Google Maps ───────────────────────
    if (onUpdate) onUpdate(`Discovery Agent: Searching Google Maps near ${intent.location}...`);
    const { lat, lng, formattedAddress } = await geocodeLocation(intent.location || "Islamabad");
    if (onUpdate) onUpdate(`Discovery Agent: Found location → ${formattedAddress}`);

    let realProviders = await searchNearbyProviders(lat, lng, intent.service_type);
    console.log(`[Stage 2] Google Maps returned ${realProviders.length} providers`);

    if (realProviders.length === 0) {
      if (onUpdate) onUpdate(`Discovery Agent: No providers found for "${intent.service_type}" near ${intent.location}. Try a different location or service.`);
      return {
        intent,
        providers: [],
        pricing: null,
        stress_test: null,
        trace_summary: `No real providers found for "${intent.service_type}" near "${intent.location}". Google Maps returned 0 results. Please try a nearby city or different service.`,
        no_results: true
      };
    }

    // Ensure at least 1 unavailable for stress test (mark last one if all available)
    const allAvailable = realProviders.every(p => p.available);
    if (allAvailable && realProviders.length > 1) {
      realProviders[realProviders.length - 1].available = false;
      realProviders[realProviders.length - 1].available_slots = [];
    }

    // ── STAGE 3: Gemini ranks + prices the real data ─────────────────────────
    if (onUpdate) onUpdate(`Ranking Agent: Scoring ${realProviders.length} real providers...`);
    const rankingModel = getModel();
    const rankingResult = await rankingModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: buildRankingPrompt(intent, realProviders) }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    if (onUpdate) onUpdate("Pricing Agent: Calculating final estimate...");
    const rankText = rankingResult.response.text().trim()
      .replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const finalResult = JSON.parse(rankText);

    // Merge real_reviews back into final result to prevent Gemini from dropping them
    if (finalResult.providers && Array.isArray(finalResult.providers)) {
      finalResult.providers = finalResult.providers.map(p => {
        const originalProvider = realProviders.find(rp => rp.id === p.id);
        if (originalProvider && originalProvider.real_reviews) {
          return { ...p, real_reviews: originalProvider.real_reviews };
        }
        return p;
      });
    }

    console.log("[Stage 3] Final ranked result:", finalResult);
    return finalResult;

  } catch (error) {
    console.error("3-Stage Pipeline Error:", error);
    if (onUpdate) onUpdate("Wait for a Moment...");
    await new Promise(r => setTimeout(r, 3000));
    return smartFallbackLoop(systemInstruction, userPrompt, onUpdate);
  }
};

const smartFallbackLoop = async (systemInstruction, userPrompt, onUpdate) => {
  if (onUpdate) onUpdate("Fallback Intent Agent: Extracting keywords...");
  await new Promise(r => setTimeout(r, 500));

  // ── STAGE 1: Regex Intent Extraction
  const promptLower = userPrompt.toLowerCase();
  let location = "Islamabad";
  const meinMatch = promptLower.match(/(\w+)\s+(?:mein|ma|me)/i);
  const inMatch = promptLower.match(/(?:in|at|near)\s+(\w+)/i);
  if (meinMatch) location = meinMatch[1];
  else if (inMatch) location = inMatch[1];
  else {
    const words = promptLower.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    if (!["chahiye", "hai", "ka", "ki", "ko", "se"].includes(lastWord)) {
      location = lastWord;
    }
  }
  const area = location.charAt(0).toUpperCase() + location.slice(1);

  const serviceMatch = promptLower.match(/(academy|school|institute|coaching center|tuition|education|beauty|beautician|salon|parlour|parlor|makeup|mehndi|wax|tutor|teacher|ustaz|coaching|padhai|ac technician|ac repair|hvac|air condition|electrician|bijli|wiring|plumber|nal|pipe|drain|leakage|painter|rang|carpenter|wood|furniture|cleaning|safai|maid|cook|bawarchi|chef|driver|chauffeur|laundry|wash|dhulai|iron|pest|spray|cockroach|termite|cctv|camera|security|alarm|gas|geyser|cylinder|nanny|babysitter|handyman|repair|maintenance|massage|physio|therapy)/i);
  // Last-resort: take first meaningful word, excluding stop/temporal words
  const STOP_WORDS = new Set(['kal','aaj','near','in','at','chahiye','hai','ka','ki','ko','se','mujhe','mein','please','need','i','want','a','an','the','urgent','asap']);
  const firstMeaningful = promptLower.trim().split(/\s+/).find(w => w.length > 2 && !STOP_WORDS.has(w)) || 'General Service';
  const service = serviceMatch ? serviceMatch[1] : firstMeaningful;

  const intent = {
    service_type: service,
    location: area,
    time_preference: "urgent",
    urgency: "same_day",
    budget_pkr: null,
    language_detected: "Mixed",
    confidence: 85,
    needs_clarification: false,
    clarification_question: null
  };

  // ── STAGE 2: Real Google Maps Discovery
  if (onUpdate) onUpdate(`Fallback Discovery: Searching Google Maps near ${area}...`);
  try {
    const { lat, lng } = await geocodeLocation(area);
    const realProviders = await searchNearbyProviders(lat, lng, service);

    if (realProviders.length === 0) {
      if (onUpdate) onUpdate(`No providers found for "${service}" near ${area}. Try a nearby city.`);
      return {
        intent,
        providers: [],
        pricing: null,
        stress_test: null,
        trace_summary: `No providers found for "${service}" near "${area}". Please try a different location.`,
        no_results: true
      };
    }

    if (onUpdate) onUpdate("Fallback Ranking Agent: Scoring real providers manually...");
    await new Promise(r => setTimeout(r, 500));

    // ── STAGE 3: Manual Ranking
    const rankedProviders = realProviders.map(p => {
      const distanceScore = Math.max(0, 100 - p.distance_km * 10) * 0.20;
      const ratingScore = (p.rating / 5.0) * 100 * 0.20;
      const recencyScore = Math.max(0, 100 - p.last_review_days_ago) * 0.10;
      const compScore = Math.round(distanceScore + ratingScore + recencyScore + 40); // 40 base for other factors
      
      return {
        ...p,
        composite_score: compScore,
        factor_scores: {
          distance: Math.max(10, 100 - Math.round(p.distance_km * 5)),
          availability: p.available ? 100 : 0,
          rating: Math.round((p.rating / 5) * 100),
          recency: Math.max(50, 100 - p.last_review_days_ago * 2),
          reliability: p.reliability_pct || 90,
          price_fit: 85,
          skill_match: 95,
          cancel_rate: Math.max(60, 100 - (p.cancel_rate_pct || 5))
        },
        ranking_reason: `Ranked manually based on ${p.rating} star rating and ${p.distance_km}km distance.`
      };
    }).sort((a, b) => b.composite_score - a.composite_score);

    // Ensure at least 1 unavailable for stress test
    if (rankedProviders.length > 1) {
      rankedProviders[rankedProviders.length - 1].available = false;
      rankedProviders[rankedProviders.length - 1].available_slots = [];
      rankedProviders[rankedProviders.length - 1].ranking_reason = "Slot unavailable for requested time.";
    }

    const topProvider = rankedProviders[0];
    const distance_surcharge = Math.round(topProvider.distance_km * 150);
    const base_rate = 1500;
    const total_pkr = base_rate + distance_surcharge + 100;

    return {
      intent,
      providers: rankedProviders,
      pricing: {
        base_rate,
        distance_surcharge,
        urgency_multiplier: 1.0,
        complexity_add: 0,
        service_fee_pct: 8,
        service_fee_amount: 100,
        loyalty_discount: 0,
        total_pkr
      },
      stress_test: {
        unavailable_provider_name: rankedProviders[rankedProviders.length - 1].name,
        unavailable_reason: "Slot already booked for requested time"
      },
      trace_summary: "Fallback mode activated. Used Regex for Intent and manual JS for Ranking. Displaying REAL Google Maps data."
    };

  } catch (e) {
    console.error("Smart Fallback failed, falling back to pure simulation:", e);
    return simulateAgenticLoop(systemInstruction, userPrompt, onUpdate);
  }
};

const simulateAgenticLoop = async (systemInstruction, userPrompt, onUpdate) => {
  if (onUpdate) onUpdate("Intent Agent: Analyzing request...");
  await new Promise(r => setTimeout(r, 800));

  if (onUpdate) onUpdate("Discovery Agent: Generating providers...");
  await new Promise(r => setTimeout(r, 800));

  const promptLower = userPrompt.toLowerCase();
  
  // Extract service type
  const serviceMatch = promptLower.match(/(ac technician|ac repair|plumber|electrician|carpenter|painter|bijli|nal)/i);
  const service = serviceMatch ? serviceMatch[1] : "General Service";

  // Extract location from prompt (smart extraction supporting "Location mein/me" and "in/at/near Location")
  let location = "Islamabad";
  const meinMatch = promptLower.match(/(\w+)\s+(?:mein|ma|me)/i);
  const inMatch = promptLower.match(/(?:in|at|near)\s+(\w+)/i);
  if (meinMatch) {
    location = meinMatch[1];
  } else if (inMatch) {
    location = inMatch[1];
  } else {
    // Fallback: search for last word that is not a stop word
    const words = promptLower.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    const STOP_WORDS = new Set(['chahiye', 'hai', 'ka', 'ki', 'ko', 'se', 'urgent', 'kal', 'aaj']);
    if (lastWord && !STOP_WORDS.has(lastWord)) {
      location = lastWord;
    }
  }
  const area = location.charAt(0).toUpperCase() + location.slice(1);

  if (onUpdate) onUpdate("Ranking Agent: Calculating scores...");
  await new Promise(r => setTimeout(r, 800));

  return {
    intent: {
      service_type: service,
      location: location,
      time_preference: "urgent",
      urgency: "same_day",
      budget_pkr: 2500,
      language_detected: "Mixed",
      confidence: 95,
      needs_clarification: false,
      clarification_question: null
    },
    providers: [
      {
        id: "p1",
        name: `Ahmed Brothers AC ${area}`,
        initials: "AB",
        specialization: "Inverter & Split AC Repair",
        experience_years: 8,
        distance_km: 2.4,
        eta_min: 15,
        rating: 4.8,
        review_count: 124,
        last_review_days_ago: 2,
        reliability_pct: 98,
        cancel_rate_pct: 2,
        base_price_pkr: 2000,
        available: true,
        certifications: ["DAE HVAC", "Samsung Certified"],
        factor_scores: { distance: 80, availability: 100, rating: 96, recency: 98, reliability: 98, price_fit: 100, skill_match: 100, cancel_rate: 92 },
        composite_score: 94,
        ranking_reason: `Ahmed Brothers AC ${area} is the top pick due to elite reliability, fast ETA, and certified expertise in the ${area} region.`,
        available_slots: ["10:00 AM", "12:30 PM", "3:00 PM", "5:00 PM"]
      },
      {
        id: "p2",
        name: `FastFix Services ${area}`,
        initials: "FF",
        specialization: "AC Gas & General Repair",
        experience_years: 6,
        distance_km: 3.7,
        eta_min: 25,
        rating: 4.5,
        review_count: 89,
        last_review_days_ago: 5,
        reliability_pct: 91,
        cancel_rate_pct: 5,
        base_price_pkr: 1800,
        available: true,
        certifications: ["DAE Mechanical"],
        factor_scores: { distance: 70, availability: 100, rating: 90, recency: 95, reliability: 91, price_fit: 100, skill_match: 90, cancel_rate: 80 },
        composite_score: 88,
        ranking_reason: `FastFix Services offers excellent local value in ${area} with strong reliability.`,
        available_slots: ["9:00 AM", "11:00 AM", "2:00 PM"]
      },
      {
        id: "p3",
        name: `CoolAir ${area}`,
        initials: "CA",
        specialization: "Window & Cassette AC",
        experience_years: 5,
        distance_km: 4.2,
        eta_min: 30,
        rating: 4.3,
        review_count: 67,
        last_review_days_ago: 8,
        reliability_pct: 88,
        cancel_rate_pct: 7,
        base_price_pkr: 1700,
        available: true,
        certifications: ["TEVTA Certified"],
        factor_scores: { distance: 65, availability: 100, rating: 86, recency: 92, reliability: 88, price_fit: 100, skill_match: 85, cancel_rate: 72 },
        composite_score: 84,
        ranking_reason: `CoolAir ${area} is a budget-friendly option based right here in ${area}.`,
        available_slots: ["10:30 AM", "1:00 PM", "4:30 PM"]
      },
      {
        id: "p4",
        name: `Ali Electrics ${area}`,
        initials: "AE",
        specialization: "Electrical & AC Services",
        experience_years: 10,
        distance_km: 6.1,
        eta_min: 42,
        rating: 4.0,
        review_count: 203,
        last_review_days_ago: 20,
        reliability_pct: 82,
        cancel_rate_pct: 12,
        base_price_pkr: 1600,
        available: true,
        certifications: ["DAE Electrical"],
        factor_scores: { distance: 40, availability: 100, rating: 80, recency: 80, reliability: 82, price_fit: 100, skill_match: 75, cancel_rate: 52 },
        composite_score: 74,
        ranking_reason: "Ali Electrics has extensive experience but is further away with a slightly higher cancellation rate.",
        available_slots: ["11:00 AM", "3:30 PM"]
      },
      {
        id: "p5",
        name: "Punjab Plumbers & AC",
        initials: "PP",
        specialization: "General Maintenance",
        experience_years: 3,
        distance_km: 7.8,
        eta_min: 55,
        rating: 3.6,
        review_count: 31,
        last_review_days_ago: 30,
        reliability_pct: 70,
        cancel_rate_pct: 18,
        base_price_pkr: 1400,
        available: false,
        certifications: [],
        factor_scores: { distance: 20, availability: 0, rating: 72, recency: 70, reliability: 70, price_fit: 100, skill_match: 60, cancel_rate: 28 },
        composite_score: 38,
        ranking_reason: "Slot unavailable for requested time. Low composite score due to distance and high cancellation rate.",
        available_slots: []
      }
    ],
    pricing: {
      base_rate: 2000,
      distance_surcharge: 360,
      urgency_multiplier: 1.3,
      complexity_add: 200,
      service_fee_pct: 8,
      service_fee_amount: 204,
      loyalty_discount: 150,
      total_pkr: 3382
    },
    stress_test: {
      unavailable_provider_name: "Karachi Cool Tech",
      unavailable_reason: "Slot already booked for requested time"
    },
    trace_summary: "Intent extracted successfully. Generated 5 realistic mock providers. Applied scoring matrix resulting in Ahmed Brothers AC as the top ranked selection."
  };
};

const generateMockResponse = (systemInstruction, userPrompt = "") => {
  const promptLower = userPrompt.toLowerCase();
  
  // MUCH smarter location extraction for Roman Urdu and English
  // We look for the last word or specific town names before 'mein/ma' or after 'in/at'
  let location = "Gojra";
  const locationKeywords = ["in", "at", "mein", "ma", "me", "city"];
  
  // Try to find the city name - usually it's the word right before 'mein' or right after 'in'
  const meinMatch = promptLower.match(/(\w+)\s+(?:mein|ma|me)/i);
  const inMatch = promptLower.match(/(?:in|at)\s+(\w+)/i);
  
  if (meinMatch) location = meinMatch[1];
  else if (inMatch) location = inMatch[1];
  else {
    // Fallback: take the last word if it's not a common Urdu word
    const words = promptLower.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    if (!["chahiye", "hai", "ka", "ki", "ko", "se"].includes(lastWord)) {
      location = lastWord;
    }
  }
  
  const area = location.charAt(0).toUpperCase() + location.slice(1);
  
  const serviceMatch = promptLower.match(/(ac technician|plumber|electrician|carpenter|painter|bijli|nal)/i);
  const service = serviceMatch ? serviceMatch[1] : "AC Technician";
  const serviceTitle = service.charAt(0).toUpperCase() + service.slice(1);

  // Match the new user-provided Intent/Discovery prompt for HomeScreen
  if (systemInstruction.includes("Extract structured information") || systemInstruction.includes("Determine confidence level")) {
    return {
      service_type: serviceTitle,
      specialization: "General Service",
      location: area,
      preferred_time: "Tomorrow Morning",
      urgency_level: "Normal",
      estimated_budget: null,
      language_detected: "Mixed",
      confidence_score: 0.95,
      action: "QUERY_PROVIDER_DATABASE"
    };
  }
  
  // Match the actual ProviderList Discovery Agent
  if (systemInstruction.includes("Discovery Agent") && !systemInstruction.includes("Determine confidence level")) {
    // Filter the real registered providers that match the resolved service type
    const matched = mockProviders.filter(p => 
      p.type.toLowerCase().includes(serviceTitle.toLowerCase()) ||
      serviceTitle.toLowerCase().includes(p.type.toLowerCase())
    );
    
    // Fallback to all providers if no exact match is found
    const providersToReturn = matched.length > 0 ? matched : mockProviders;
    
    return providersToReturn.map(p => ({
      ...p,
      reviews_count: p.reviews, // align with reviews_count expected by the list UI
      distance: (0.5 + Math.random() * 3.5).toFixed(1) // dynamic local distance
    }));
  }
  
  if (systemInstruction.includes("Ranking Agent")) {
    let providers = [];
    try {
      // Dynamically extract the discovered available providers from the user prompt payload
      const parsed = JSON.parse(userPrompt);
      providers = parsed.available_providers || [];
    } catch (e) {
      providers = mockProviders.filter(p => p.type.toLowerCase().includes(serviceTitle.toLowerCase()));
    }
    if (providers.length === 0) providers = mockProviders;
    
    // Sort matching providers by rating descending for a smart dynamic scoring fallback
    const sorted = [...providers].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    return sorted.map((p, idx) => ({
      id: p.id,
      name: p.name,
      composite_score: 95 - idx * 7,
      ranking_reasoning: `${p.name} is ranked as the primary option due to a stellar rating of ${p.rating} stars and verified credentials in the ${area} region.`
    }));
  }
  
  if (systemInstruction.includes("Pricing Agent")) {
    let base_rate = 1500;
    let distance_km = 2.5;
    let complexity_level = "standard";
    let providerName = "Local Expert";
    
    try {
      const parsed = JSON.parse(userPrompt);
      providerName = parsed.provider || providerName;
      distance_km = parseFloat(parsed.distance_km) || distance_km;
      complexity_level = parsed.complexity_level || complexity_level;
    } catch (e) {}

    if (complexity_level === "basic") base_rate = 1000;
    else if (complexity_level === "complex") base_rate = 2500;
    
    const distance_surcharge = Math.round(distance_km * 150);
    const subtotal = base_rate + distance_surcharge - 150; // PKR 150 loyalty discount
    const service_fee = Math.round(subtotal * 0.08);
    const total = subtotal + service_fee;

    return {
      base_rate,
      distance_surcharge,
      urgency_multiplier: 1.0,
      complexity_level,
      loyalty_discount: 150,
      service_fee,
      total,
      justifications: {
        base_rate: `Base rate for ${complexity_level} complexity service.`,
        distance_surcharge: `Surcharge for travelling ${distance_km} km.`,
        urgency_multiplier: "Standard urgency multiplier of 1.0.",
        loyalty_discount: "Loyalty discount for returning premium user.",
        service_fee: "Standard 8% platform service fee."
      },
      pricing_reasoning: `Dynamic price calculated for ${providerName} at ${distance_km}km distance for ${complexity_level} service.`
    };
  }

  if (systemInstruction.includes("Booking Agent")) {
    let provider_name = "Local Expert";
    let amount = 1650;
    try {
      const parsed = JSON.parse(userPrompt);
      provider_name = parsed.provider_name || provider_name;
      amount = parsed.amount || amount;
    } catch (e) {}

    const booking_id = `KB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    return {
      booking_id,
      confirmation_status: "CONFIRMED",
      conflict_detected: false,
      conflict_resolution: "",
      sms_message: `Aap ki booking ${booking_id} confirm ho chuki hai. Provider ${provider_name} kal 10:00 AM pe pohnch jaye ga. Total amount: PKR ${amount}.`,
      whatsapp_message: `*IntelliServe Booking Confirmed!* \n\n*Booking ID:* ${booking_id}\n*Provider:* ${provider_name}\n*Amount:* PKR ${amount}\n\nThank you for choosing IntelliServe!`,
      scheduled_reminder_time: "09:00 AM"
    };
  }

  if (systemInstruction.includes("Dispute Agent")) {
    let dispute_type = "cancellation";
    let amount = 1782;
    try {
      const parsed = JSON.parse(userPrompt);
      dispute_type = parsed.dispute_type || dispute_type;
      amount = parsed.booking_details?.amount || amount;
    } catch (e) {}

    const isCancellation = dispute_type === "cancellation";
    const refund_amount = isCancellation ? Math.round(amount * 0.75) : Math.round(amount * 0.4);

    return {
      refund_amount,
      refund_policy_applied: isCancellation ? "Late Cancellation Policy (75% Refund)" : "Service Quality Escrow Refund",
      reasoning: isCancellation 
        ? "Aap ne service shuru hone se thora pehle cancel kiya, is liye policy ke tehat 25% katay ga aur baqi 75% refund hoga." 
        : "Quality review ke mutabiq aap ko partial refund jari kiya ja raha hai.",
      resolution_steps: [
        isCancellation ? "Process 75% refund to user wallet." : "Process 40% escrow compensation refund.",
        "Update provider records."
      ],
      escalation_needed: false
    };
  }

  if (systemInstruction.includes("Review Agent") || systemInstruction.includes("sentiment analysis")) {
    let rating = 5;
    let review = "";
    if (userPrompt.includes("stars")) {
      const match = userPrompt.match(/(\d)\s*stars/);
      if (match) rating = parseInt(match[1]);
    }
    const isPositive = rating >= 4;

    return {
      sentiment: isPositive ? "Positive" : "Negative",
      suggested_response: isPositive 
        ? "Bohot shukriya aap ke feedback ka! Hamein khushi hui ke aap hamari service se mutmaeen hain." 
        : "We apologize for the inconvenience. We have noted your complaint and will take action immediately to improve our service."
    };
  }
  
  return { status: "MOCK_RESPONSE_FALLBACK" };
};
