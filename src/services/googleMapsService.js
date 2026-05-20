const getMapsApiKey = () => {
  return localStorage.getItem('VITE_GOOGLE_MAPS_API_KEY') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
};

// ─── Haversine Formula: km distance between two lat/lng points ────────────────
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
};

// --- Step 1: Geocode location text with smart variants + Nominatim Fallback ---
export const geocodeLocation = async (locationText) => {
  const isNumeric = /^\d{1,2}$/.test(locationText.trim());
  const variants = isNumeric
    ? [
        `G-${locationText} Islamabad, Pakistan`,
        `F-${locationText} Islamabad, Pakistan`,
        `I-${locationText} Islamabad, Pakistan`,
        `Sector ${locationText} Islamabad, Pakistan`,
      ]
    : [`${locationText}, Pakistan`];

  const mapsApiKey = getMapsApiKey();
  for (const query of variants) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${mapsApiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng, formattedAddress: data.results[0].formatted_address };
      }
    } catch (e) { console.warn('[Maps] Google Geocoding failed for:', query); }
  }

  for (const query of variants) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), formattedAddress: data[0].display_name };
      }
    } catch (e) { console.warn('[Maps] Nominatim failed for:', query); }
  }

  console.warn('[Maps] All geocoding failed. Defaulting to Islamabad.');
  return { lat: 33.6844, lng: 73.0479, formattedAddress: 'Islamabad, Pakistan' };
};


// ─── Step 2: Search nearby real providers via browser Places API (New) (CORS-Safe)

// Helper: transform raw Google Places result into our UI schema
const transformPlaces = (places, lat, lng, serviceType) => {
  return places.map((p, idx) => {
    const provLat = typeof p.location?.lat === 'function' ? p.location.lat() : (p.location?.lat ?? p.location?.latitude ?? lat);
    const provLng = typeof p.location?.lng === 'function' ? p.location.lng() : (p.location?.lng ?? p.location?.longitude ?? lng);
    let distance_km = haversineDistance(lat, lng, provLat, provLng);
    if (distance_km === 0) distance_km = parseFloat((Math.random() * 4 + 0.5).toFixed(1));

    const eta_min = Math.round(distance_km * 4 + 5);
    const rating = p.rating ?? (3.5 + Math.random() * 1.5);
    const review_count = p.userRatingCount ?? Math.floor(Math.random() * 80 + 20);
    const isOpen = p.regularOpeningHours?.openNow ?? true;
    const reliability_pct = Math.min(98, Math.round(rating * 18 + 10));
    const cancel_rate_pct = Math.max(2, Math.round((5 - rating) * 5));
    const base_price_pkr = [1600, 1800, 2000, 2200, 2500][idx % 5];
    const nameParts = (p.displayName || 'Unknown Provider').split(' ');
    const initials = nameParts.slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const real_reviews = p.reviews?.slice(0, 4).map(r => ({
      name: r.authorAttribution?.displayName || 'Google User',
      rating: r.rating || rating,
      text: r.text || '',
      time: r.relativePublishTimeDescription || 'Recently'
    })) || [];

    return {
      id: p.id || `real_${idx}`,
      name: p.displayName || 'Unknown Provider',
      initials,
      specialization: serviceType,
      experience_years: Math.floor(Math.random() * 8 + 2),
      distance_km,
      eta_min,
      rating: parseFloat(rating.toFixed(1)),
      review_count,
      last_review_days_ago: Math.floor(Math.random() * 20 + 1),
      reliability_pct,
      cancel_rate_pct,
      base_price_pkr,
      available: isOpen,
      certifications: [],
      phone: null,
      address: p.formattedAddress || null,
      factor_scores: {},
      composite_score: 0,
      ranking_reason: '',
      real_reviews,
      available_slots: isOpen
        ? ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'].slice(0, 3 + (idx % 3))
        : [],
    };
  });
};

export const searchNearbyProviders = async (lat, lng, serviceType) => {
  try {
    const google = window.google;
    if (!google || !google.maps || !google.maps.places || !google.maps.places.Place) {
      console.warn('[Maps] Google Maps JS SDK Place class is not loaded globally yet.');
      return [];
    }

    // Map serviceType to Places (New) includedTypes
    const normalised = serviceType.toLowerCase();
    let includedTypes = ['plumber']; // default fallback

    if (normalised.includes('ac') || normalised.includes('hvac') || normalised.includes('air condition')) {
      includedTypes = ['electrician'];
    } else if (normalised.includes('electric') || normalised.includes('bijli') || normalised.includes('wiring')) {
      includedTypes = ['electrician'];
    } else if (normalised.includes('paint') || normalised.includes('rang')) {
      includedTypes = ['painter'];
    } else if (normalised.includes('clean') || normalised.includes('safai') || normalised.includes('sweep')) {
      includedTypes = ['house_cleaning_service'];
    } else if (normalised.includes('carpenter') || normalised.includes('wood') || normalised.includes('furniture') || normalised.includes('lakri')) {
      includedTypes = ['general_contractor'];
    } else if (normalised.includes('beauty') || normalised.includes('beautician') || normalised.includes('salon') || normalised.includes('parlour') || normalised.includes('parlor') || normalised.includes('makeup') || normalised.includes('mehndi') || normalised.includes('wax')) {
      includedTypes = ['beauty_salon'];
    } else if (normalised.includes('tutor') || normalised.includes('teacher') || normalised.includes('ustaz') || normalised.includes('padhai') || normalised.includes('coaching') || normalised.includes('math') || normalised.includes('english') || normalised.includes('science') || normalised.includes('academy') || normalised.includes('school') || normalised.includes('institute') || normalised.includes('education')) {
      // Education searches work better with text search than strict category
      // Return a special marker to use text search directly
      includedTypes = null;
    } else if (normalised.includes('gas') || normalised.includes('geyser') || normalised.includes('cylinder')) {
      includedTypes = ['plumber'];
    } else if (normalised.includes('cctv') || normalised.includes('camera') || normalised.includes('security') || normalised.includes('alarm')) {
      includedTypes = ['electrician'];
    } else if (normalised.includes('plumb') || normalised.includes('nal') || normalised.includes('pipe') || normalised.includes('drain') || normalised.includes('leakage')) {
      includedTypes = ['plumber'];
    } else if (normalised.includes('maid') || normalised.includes('khaana') || normalised.includes('cook') || normalised.includes('bawarchi') || normalised.includes('chef')) {
      includedTypes = ['house_cleaning_service'];
    } else if (normalised.includes('driver') || normalised.includes('chauffeur') || normalised.includes('car') || normalised.includes('gaadi')) {
      includedTypes = ['taxi_stand'];
    } else if (normalised.includes('laundry') || normalised.includes('wash') || normalised.includes('dhulai') || normalised.includes('iron')) {
      includedTypes = ['laundry'];
    } else if (normalised.includes('pest') || normalised.includes('spray') || normalised.includes('cockroach') || normalised.includes('mosquito') || normalised.includes('termite')) {
      includedTypes = ['pest_control_service'];
    } else if (normalised.includes('nanny') || normalised.includes('babysitter') || normalised.includes('child') || normalised.includes('baby')) {
      includedTypes = ['child_care_agency'];
    } else if (normalised.includes('handyman') || normalised.includes('repair') || normalised.includes('fix') || normalised.includes('maintenance')) {
      includedTypes = ['general_contractor'];
    } else if (normalised.includes('massage') || normalised.includes('physio') || normalised.includes('therapy')) {
      includedTypes = ['physiotherapist'];
    }

    console.log(`[Maps] Querying Places (New) SDK:`, includedTypes ? `searchNearby type=${includedTypes}` : 'text search (better for education)');

    // If includedTypes is null, jump directly to text search (better for education/academy)
    if (!includedTypes) {
      try {
        const textRequest = {
          textQuery: `${serviceType} in ${lat},${lng}`,
          fields: ['id', 'displayName', 'location', 'rating', 'userRatingCount', 'businessStatus', 'regularOpeningHours', 'formattedAddress', 'reviews'],
          locationBias: { circle: { center: { lat, lng }, radius: 10000 } },
          maxResultCount: 8
        };
        const textResult = await google.maps.places.Place.searchByText(textRequest);
        if (textResult.places && textResult.places.length > 0) {
          console.log(`[Maps] Direct text search returned ${textResult.places.length} results for "${serviceType}"`);
          return transformPlaces(textResult.places, lat, lng, serviceType);
        }
      } catch (e) {
        console.warn('[Maps] Direct text search failed:', e);
      }
      return [];
    }

    const request = {
      fields: ['id', 'displayName', 'location', 'rating', 'userRatingCount', 'businessStatus', 'regularOpeningHours', 'formattedAddress', 'reviews'],
      locationRestriction: {
        center: { lat: lat, lng: lng },
        radius: 8000
      },
      includedTypes,
      maxResultCount: 8
    };

    const { places } = await google.maps.places.Place.searchNearby(request);

    if (!places || places.length === 0) {
      console.warn('[Maps] searchNearby returned empty. Trying text search fallback...');
      
      // ── TEXT SEARCH FALLBACK: Search by keyword when category search fails ──
      try {
        const textRequest = {
          textQuery: `${serviceType} near ${lat},${lng}`,
          fields: ['id', 'displayName', 'location', 'rating', 'userRatingCount', 'businessStatus', 'regularOpeningHours', 'formattedAddress', 'reviews'],
          locationBias: {
            circle: {
              center: { lat, lng },
              radius: 10000
            }
          },
          maxResultCount: 8
        };
        const textResult = await google.maps.places.Place.searchByText(textRequest);
        if (textResult.places && textResult.places.length > 0) {
          console.log(`[Maps] Text search returned ${textResult.places.length} results for "${serviceType}"`);
          // reuse same transform below
          return transformPlaces(textResult.places, lat, lng, serviceType);
        }
      } catch (textErr) {
        console.warn('[Maps] Text search fallback also failed:', textErr);
      }
      
      return [];
    }

    console.log(`[Maps] Google SDK (New) returned ${places.length} real providers`);
    return transformPlaces(places, lat, lng, serviceType);


  } catch (e) {
    console.error('[Maps] Places SDK (New) searchNearby error:', e);
    return [];
  }
};
