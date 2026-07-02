/* =====================================================
   RAILQUICK — Complete Application JavaScript
   Premium Emerald & Gold Theme · Stitch-Style UI Replicas
   ===================================================== */

'use strict';

// ===== API CONFIG =====
const origin = window.location.origin || '';
const API_BASE = (origin.startsWith('file://') || origin === 'null')
  ? 'http://localhost:3000'
  : origin;

// ===== APP STATE =====
let appState = {
  currentPage: 'page-splash',
  user: null,
  cart: [],
  orders: [],
  pnrData: null,
  trainData: null,
  selectedPayment: 'upi',
  modalProduct: null,
  modalQty: 1,
  currentFilter: 'all',
  searchQuery: '',
  appliedCoupon: null
};

// Global Clerk Instance (initialized on load)
let clerkInstance = null;

// ===== PRODUCTS DATABASE (STITCH COPIED) =====
const PRODUCTS = [
  // --- Snacks Category ---
  {
    id: 101,
    name: "Lay's India's Magic Masala Potato Chips",
    price: 25,
    category: 'snacks',
    weight: '50 g',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrN4hJZPcCQDQZDeKvTCS5D9hroj-616x6zM2536RKkLc1W9gywWALB4QBaZrXiI1t8b7kNxHpM6l3VmI6sX3_kub-guMONOWUp5OjBHOufHmY9N6oh0UinjbUzm5fgsRfn7717zRPac7HRD3gW8PjaDt4KUm3dVh-SR4oKssc8YshYmunkk2cpG6_CORUfMWvnWD1KsDI3Pu5fVWyGxuQZGgSlCphTCR911lbBoQLdsa9di_aD2FnVSWiaY1UVaMOBUPPdfaGpzA',
    rating: 4.8,
    reviews: 890,
    description: "Lay's India's Magic Masala chips are spiced to perfection with a blend of onion, garlic, tomato, and spices. Made from selected high-quality potatoes.",
    tags: ['Crispy', 'Spicy', 'Veg', 'Classic']
  },
  {
    id: 102,
    name: 'Uncle Chipps Spicy Treat Flavour Potato Crisps',
    price: 20,
    category: 'snacks',
    weight: '53 g',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1DTScDYSIZ3ZY4_5_-QLCh9MRX63Pd0fKTMtoyNVqLanNFRcAU50IV6D6Mtwn6D5Rmlu8vQ55iq2hdK-JWVEpCb7pfoBJEnWLYeBjTaMAIFwFEsrfXvHX555GvtYqHkt6_65oiL52zIXUzntZSvCZToizsOz8X_FC411-m4Ag64gCP9XlEv4CSCONT6VpCUH5TIjaZIkqzH6G8TPAVdlm7pkkZnEoAjDe9DCrddgLx_JlemrveKPklolEB6nvczPJq7qRqD9Lpp8',
    rating: 4.7,
    reviews: 654,
    description: "The classic Indian spiced potato crisps. Uncle Chipps Spicy Treat has been a favorite travel companion for decades with its warm, traditional Indian spice blend.",
    tags: ['Traditional', 'Spicy', 'Veg', 'Snack']
  },
  {
    id: 103,
    name: "Haldiram's Bhujia Sev Namkeen",
    price: 55,
    category: 'snacks',
    weight: '200 g',
    img: 'product_haldirams.png',
    rating: 4.9,
    reviews: 1042,
    description: "Crispy and spicy tepary bean and chickpea flour noodles. Haldiram's original Bikaneri recipe bhujia makes a crunchy side snack for tea time.",
    tags: ['Bikaneri', 'Spicy', 'Namkeen', 'Veg']
  },
  {
    id: 104,
    name: 'Amul 99% Cacao Bitter Chocolate',
    price: 150,
    category: 'snacks',
    weight: '100 g',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuJsYSA-t2uwl01C-fHgNZp_UBhZtG45hb0RXKD-5AcICirSnllXuPeyjuKyhw6AR7wI8RA5P_Gdbn_Gs0zbVWVnXksFaruAnAJ9fBGTd48KSyTNbQSlHO96sUiXkYpWU7dG9qiJxulcsYQrTjnWHBRCYr_1up0tQxMut_LMwvvyAxN_JcuZKjXlxLVndoLB6WQ9E2ebzdp1C5mQ7bzMm6RStM-0yksgvamoK67YjX6aRbw_5XNbuNOehKMgxVR9E1ejPqxkCyock',
    rating: 4.6,
    reviews: 320,
    description: "Amul Bitter Chocolate is made with 99% Cacao. A rich dark chocolate that brings out the intense flavor notes of pure roasted cocoa beans.",
    tags: ['Dark Chocolate', '99% Cacao', 'Bitter', 'Veg']
  },
  {
    id: 105,
    name: 'Hot Steaming Masala Samosa (2 Pcs)',
    price: 40,
    category: 'snacks',
    weight: 'Plate',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuefeogj7oybJsv1Gq1fM4aXMjpmZi6n6u-ZkHEKuQ66n73qN-xLyUygXvOQzMI-FJ_iWwbvv2BLfAh5M-dbqXZquiySkYW-v-t93YN8lBLiysURu0gKM67qBSPy1Eyt4QQS58rSjZsaQyr0Xi6bDEPqvMfDp5YeNxnMmfONic03kvH0qbYaVwSeugpJcvtbbscmmWJd4VFKr_s_lJJb5A8TOVRVYOhOilEabMjNJQELhq_qH0DmCrYZhQPf5rA_ABOdv2mPPo3fGA',
    rating: 4.8,
    reviews: 2110,
    description: "Crispy triangular golden pastries stuffed with spicy mashed potatoes and peas, served with sweet and sour chutneys.",
    tags: ['Hot Food', 'Indian', 'Samosa', 'Veg']
  },
  {
    id: 106,
    name: 'Veg Grilled Cheese Sandwich',
    price: 90,
    category: 'snacks',
    weight: '1 Unit',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFdXnywuj4dJgIfUKJoCzXMqyzNfyNyzPZKzIZMs2Ks4t7B5Z5peLf0yBWUTD8qFTw2qhC3FvJn4V6UJ5Ex6SnL2fBExZQL2X9wZVu347ULUjqvdM4zfKT2wopLyNgNNd2WYJgxd1tA-7w8RQ4uh2QLjFfJ85KZwSjADcH1rlYKepuhMFKTgIl2aN5lycWEB7IsvxXxeTsDeoK9ZJloaTkXjvR6mKwmWB__i4h0P_YjN6aJ3Cpe7Yw1sAOgm7e7pSM9FbHiSYHo3I',
    rating: 4.5,
    reviews: 432,
    description: "Freshly toasted white bread stuffed with sliced tomatoes, cucumbers, onions, capsicum, and loaded with mozzarella cheese.",
    tags: ['Sandwich', 'Cheese', 'Veg', 'Toasted']
  },
  {
    id: 107,
    name: 'Kurkure Masala Munch Crunchy Snacks',
    price: 20,
    category: 'snacks',
    weight: '90 g',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuefeogj7oybJsv1Gq1fM4aXMjpmZi6n6u-ZkHEKuQ66n73qN-xLyUygXvOQzMI-FJ_iWwbvv2BLfAh5M-dbqXZquiySkYW-v-t93YN8lBLiysURu0gKM67qBSPy1Eyt4QQS58rSjZsaQyr0Xi6bDEPqvMfDp5YeNxnMmfONic03kvH0qbYaVwSeugpJcvtbbscmmWJd4VFKr_s_lJJb5A8TOVRVYOhOilEabMjNJQELhq_qH0DmCrYZhQPf5rA_ABOdv2mPPo3fGA',
    rating: 4.8,
    reviews: 1540,
    description: "Tedhe-medhe crispy corn puff snacks seasoned with high-impact chili and Indian spices.",
    tags: ['Spicy', 'Crunchy', 'Teatime', 'Veg']
  },
  {
    id: 108,
    name: 'Britannia Good Day Cashew Cookies',
    price: 30,
    category: 'snacks',
    weight: '120 g',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuefeogj7oybJsv1Gq1fM4aXMjpmZi6n6u-ZkHEKuQ66n73qN-xLyUygXvOQzMI-FJ_iWwbvv2BLfAh5M-dbqXZquiySkYW-v-t93YN8lBLiysURu0gKM67qBSPy1Eyt4QQS58rSjZsaQyr0Xi6bDEPqvMfDp5YeNxnMmfONic03kvH0qbYaVwSeugpJcvtbbscmmWJd4VFKr_s_lJJb5A8TOVRVYOhOilEabMjNJQELhq_qH0DmCrYZhQPf5rA_ABOdv2mPPo3fGA',
    rating: 4.7,
    reviews: 980,
    description: "Rich buttery cookies loaded with premium cashew nut pieces. A perfect sweet accompaniment for hot tea.",
    tags: ['Butter', 'Cashew', 'Sweet', 'Veg']
  },

  // --- Beverages Category ---
  {
    id: 201,
    name: 'Kinley Mineral Water Bottle',
    price: 20,
    category: 'beverages',
    weight: '1 Ltr',
    img: 'product_water.png',
    rating: 4.9,
    reviews: 2450,
    description: "Pure and fresh drinking water from Kinley. Undergoes multiple stages of filtration and disinfection.",
    tags: ['Water', 'Sealed', 'Pure', 'Hydration']
  },
  {
    id: 202,
    name: 'Coca-Cola Can',
    price: 40,
    category: 'beverages',
    weight: '300 ml',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqMMtEKggKG8CZVhfbY6SxkoZovknOgWi7oYxM1sha8OkH2AFTOE2Q_RqplGo2JUMB6YcGDtAp1lAByW9AOr-cn6x0W9WYXgxPoHEGnbnX3l6y4ol37BAUmFXRb9umnibA9CavRlDjJpmWZCyJNwOi65MkxLpIVlJyyMV26vLAq1jOXqG4Qu3OkpaWNHQxMxYsT5_7j40XNUB_Nfy-KBa8D-DnR4qes80qI45JQFPrGgJXYrk3_PZ7sdggnF5DPmI8Nc4koqyqDvE',
    rating: 4.8,
    reviews: 1890,
    description: "Chilled Coca-Cola in a travel-safe aluminum can. Sweet, bubbly, and refreshing soda.",
    tags: ['Bubbly', 'Chilled', 'Cold Drink']
  },
  {
    id: 203,
    name: 'Claypot Masala Chai (Hot Kulhad Tea)',
    price: 25,
    category: 'beverages',
    weight: '1 Cup',
    img: 'product_tea.png',
    rating: 4.9,
    reviews: 4320,
    description: "Traditional hot tea brewed with ginger, cardamom, cloves, and milk, served fresh in an eco-friendly clay pot (kulhad).",
    tags: ['Chai', 'Kulhad', 'Hot Drink', 'Traditional']
  },
  {
    id: 204,
    name: 'Nescafe Premium Hot Coffee',
    price: 35,
    category: 'beverages',
    weight: '1 Cup',
    img: 'product_tea.png',
    rating: 4.6,
    reviews: 1200,
    description: "Rich, aromatic Nescafe coffee prepared with steamed milk and cocoa dusting.",
    tags: ['Hot Coffee', 'Espresso', 'Nescafe', 'Energising']
  },
  {
    id: 205,
    name: 'Paper Boat Aamras Mango Juice',
    price: 45,
    category: 'beverages',
    weight: '250 ml',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLPb7_nhxqW4VywoHrLH75FaRRKAUwvw2ROas_OMTZHhid7Lp_thESG_2SFjkfbwsGpqhf82LXOKJsMejjJaiGW-9R3H1HIKlWYhR_BNSTZEqPrfzty4mow18fEvhroDHjWc_K9kM264o4HmPrcddie1U7IJInhn9S36tiwjeOUUbawEymsoAnuqaplsnu1SX63EliabaCwaRHPH8b8xTonDgKZi9khl1yXNTPXWDB470NX3eoRTdJ9U9YlMnHANfVO4Ul0htodR4',
    rating: 4.8,
    reviews: 1560,
    description: "Authentic mango pulp juice made with sweet Indian Alphonso mangoes. No artificial colors or preservatives.",
    tags: ['Mango', 'Fruit Juice', 'Aamras', 'Paper Boat']
  },
  {
    id: 206,
    name: 'Amul Kool Kesar Badam Milk Can',
    price: 45,
    category: 'beverages',
    weight: '200 ml',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLPb7_nhxqW4VywoHrLH75FaRRKAUwvw2ROas_OMTZHhid7Lp_thESG_2SFjkfbwsGpqhf82LXOKJsMejjJaiGW-9R3H1HIKlWYhR_BNSTZEqPrfzty4mow18fEvhroDHjWc_K9kM264o4HmPrcddie1U7IJInhn9S36tiwjeOUUbawEymsoAnuqaplsnu1SX63EliabaCwaRHPH8b8xTonDgKZi9khl1yXNTPXWDB470NX3eoRTdJ9U9YlMnHANfVO4Ul0htodR4',
    rating: 4.8,
    reviews: 843,
    description: "Chilled milk flavored with high-grade saffron (kesar) and almond (badam) chunks.",
    tags: ['Milk', 'Kesar', 'Almond', 'Cold Drink']
  },

  // --- Hygiene Category ---
  {
    id: 301,
    name: 'Dettol Hand Sanitizer',
    price: 50,
    category: 'hygiene',
    weight: '50 ml',
    img: 'product_sanitizer.png',
    rating: 4.8,
    reviews: 1450,
    description: "Dettol Instant Hand Sanitizer kills 99.9% of germs without water. Compact pocket-sized bottle.",
    tags: ['99.9% Germs', 'Travel size', 'Clean hands']
  },
  {
    id: 302,
    name: 'Colgate Travel Toothbrush & Paste Kit',
    price: 60,
    category: 'hygiene',
    weight: '1 Pack',
    img: 'product_toothbrush.png',
    rating: 4.7,
    reviews: 624,
    description: "All-in-one travel oral hygiene kit. Includes a foldable premium toothbrush and a 20g tube of Colgate toothpaste.",
    tags: ['Dental', 'Oral care', 'Colgate', 'Foldable']
  },
  {
    id: 303,
    name: 'Anti-Bacterial Wet Wipes',
    price: 85,
    category: 'hygiene',
    weight: '30 Wipes',
    img: 'product_sanitizer.png',
    rating: 4.7,
    reviews: 935,
    description: "Anti-bacterial wet wipes that cleanse, moisturize, and sanitise your skin instantly. pH balanced.",
    tags: ['Anti-Bacterial', 'Moisturising', 'Cleansing']
  },
  {
    id: 304,
    name: 'Dettol Anti-Septic Soap Bar',
    price: 35,
    category: 'hygiene',
    weight: '75 g',
    img: 'product_sanitizer.png',
    rating: 4.6,
    reviews: 512,
    description: "Dettol soap provides trusted germ protection and keeps you feeling fresh all day.",
    tags: ['Soap', 'Dettol', 'Germ protection']
  },
  {
    id: 305,
    name: 'Whisper Ultra Clean Sanitary Pads',
    price: 99,
    category: 'hygiene',
    weight: '7 Pads',
    img: 'product_sanitizer.png',
    rating: 4.9,
    reviews: 890,
    description: "Wings sanitary napkins with dry weave cover that traps fluid quickly, providing complete travel protection.",
    tags: ['Sanitary', 'Wings', 'Dry protection']
  },

  // --- Tech Category ---
  {
    id: 401,
    name: 'boAt Wired Earphones (With HD Mic)',
    price: 349,
    category: 'tech',
    weight: 'With Mic',
    img: 'product_earphones.png',
    rating: 4.7,
    reviews: 3200,
    description: "Boat wired bassheads with tangle-free cable, L-shaped 3.5mm jack, and HD call microphone.",
    tags: ['Audio Jack', 'Boat', 'HD mic', 'Bass']
  },
  {
    id: 402,
    name: '10,000mAh Power Bank (20W PD)',
    price: 899,
    category: 'tech',
    weight: '20W PD Fast',
    img: 'product_powerbank.png',
    rating: 4.8,
    reviews: 4500,
    description: "Slim and sleek power backup with dual output ports. Safely charge phones and tablets in your coach.",
    tags: ['Power bank', 'Fast charge', 'USB-C']
  },
  {
    id: 403,
    name: 'Memory Foam Travel Neck Pillow',
    price: 450,
    category: 'tech',
    weight: 'Ergonomic',
    img: 'product_neckpillow.png',
    rating: 4.8,
    reviews: 1140,
    description: "Ergonomically designed travel neck pillow made of high-density memory foam.",
    tags: ['Ergonomic', 'Memory foam', 'Neck pillow', 'Travel comfort']
  },
  {
    id: 404,
    name: 'India Today English Weekly News',
    price: 75,
    category: 'tech',
    weight: 'Magazine',
    img: 'product_neckpillow.png',
    rating: 4.6,
    reviews: 432,
    description: "India Today is a leading weekly English news magazine. Offers in-depth reporting on national news.",
    tags: ['News', 'National', 'Weekly', 'Reading']
  },
  {
    id: 405,
    name: 'Premium Sleep Eye Mask & Earplugs Kit',
    price: 150,
    category: 'tech',
    weight: '1 Kit',
    img: 'product_neckpillow.png',
    rating: 4.7,
    reviews: 654,
    description: "Total blackout padded 3D eye mask with soft memory foam and 2 pairs of noise-reduction foam earplugs.",
    tags: ['Blackout', 'Sleep mask', 'Earplugs', 'Silent travel']
  },
  {
    id: 406,
    name: 'Fast USB-C to USB-C Braided Cable',
    price: 199,
    category: 'tech',
    weight: '1.2 Meter',
    img: 'product_powerbank.png',
    rating: 4.5,
    reviews: 189,
    description: "Ultra-durable nylon braided charging cable, supporting up to 60W charge capacity.",
    tags: ['USB-C', 'Braided', 'Charging']
  },
  {
    id: 109,
    name: 'Warm Butter Croissant',
    price: 80,
    category: 'snacks',
    weight: '75 g',
    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 154,
    description: "Flaky, buttery, freshly baked French-style croissant. Warm and delicious.",
    tags: ['Bakery', 'Warm', 'Butter', 'Veg']
  },
  {
    id: 110,
    name: 'Roasted Salted Almonds',
    price: 120,
    category: 'snacks',
    weight: '100 g',
    img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 320,
    description: "Premium California almonds, dry-roasted and lightly tossed in pink Himalayan salt.",
    tags: ['Nuts', 'Roasted', 'Healthy', 'Veg']
  },
  {
    id: 207,
    name: 'Chilled Cold Coffee Can',
    price: 60,
    category: 'beverages',
    weight: '250 ml',
    img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 580,
    description: "Rich, creamy cold brew coffee in a ready-to-drink chilled can.",
    tags: ['Coffee', 'Chilled', 'Cold Brew']
  },
  {
    id: 208,
    name: 'Fresh Lime Soda',
    price: 40,
    category: 'beverages',
    weight: '300 ml',
    img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 910,
    description: "Squeezed fresh limes blended with soda and sugar syrup for instant replenishment.",
    tags: ['Lime', 'Soda', 'Chilled', 'Refreshing']
  },
  {
    id: 306,
    name: 'Pocket Wet Wipes',
    price: 30,
    category: 'hygiene',
    weight: '10 Wipes',
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 402,
    description: "Mini pocket pack of gentle, alcohol-free refreshing wet wipes.",
    tags: ['Wipes', 'Travel size', 'Gentle']
  },
  {
    id: 407,
    name: 'Universal Multi-Charging Cable',
    price: 299,
    category: 'tech',
    weight: '3-in-1',
    img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 2150,
    description: "3-in-1 nylon braided charging cable with Type-C, Lightning, and Micro-USB connectors.",
    tags: ['3-in-1', 'Multi cable', 'Fast charge']
  }
];

// ===== MOCK DATA GENERATORS =====
function getMockPNRData(pnr) {
  const pnrStr = String(pnr);
  const oddPnr = parseInt(pnrStr.charAt(pnrStr.length - 1)) % 2 !== 0;
  
  const trainNo = oddPnr ? '12301' : '12424';
  const trainName = oddPnr ? 'Rajdhani Express' : 'Vande Bharat Express';
  const dateStr = new Date().toLocaleDateString('en-IN');
  const coach = oddPnr ? 'B2' : 'C4';
  const seat = oddPnr ? '45' : '18';
  const berth = oddPnr ? 'UB' : 'WS'; // Upper Berth vs Window Seat

  return {
    pnrNumber: pnrStr,
    trainNumber: trainNo,
    trainName: trainName,
    dateOfJourney: dateStr,
    source: 'New Delhi (NDLS)',
    destination: oddPnr ? 'Howrah Junction (HWH)' : 'Dibrugarh (DBRG)',
    reservationClass: oddPnr ? 'AC 3 Tier (3A)' : 'AC Chair Car (CC)',
    chartPrepared: 'Prepared',
    fare: oddPnr ? 1640 : 1250,
    passengerList: [
      {
        serialNumber: 'Passenger 1',
        bookingStatus: `CNF / ${coach} / ${seat} / ${berth}`,
        currentStatus: `CNF / ${coach} / ${seat} / ${berth}`,
        coach: coach,
        berth: seat,
        berthCode: berth
      }
    ]
  };
}

function getMockLiveStatus(trainNo, routeInfo = null) {
  const now = new Date();
  const updateTime = 'Just now';
  
  if (routeInfo && routeInfo.route && routeInfo.route.length > 0) {
    const stations = routeInfo.route;
    const total = stations.length;
    const currentIdx = Math.floor(total * 0.7) || 0; // train is 70% through journey
    
    const timeline = stations.map((s, idx) => {
      let status = 'upcoming';
      if (idx < currentIdx) status = 'passed';
      else if (idx === currentIdx) status = 'current';
      
      const actualTime = s.arrival === 'Source' || s.arrival === '--' ? s.departure : s.arrival;
      
      return {
        stationName: s.stnName || s.stationName,
        stationCode: s.stnCode || s.stationCode,
        type: 'stoppage',
        status: status,
        platform: s.platform || '1',
        arrival: {
          actual: actualTime,
          scheduled: actualTime
        },
        departure: {
          actual: s.departure,
          scheduled: s.departure
        }
      };
    });
    
    const curStation = timeline[currentIdx];
    return {
      trainNo: routeInfo.trainInfo?.train_no || trainNo,
      trainName: routeInfo.trainInfo?.train_name || 'Express Special',
      lastUpdate: updateTime,
      statusNote: `Departed from ${curStation.stationName}(${curStation.stationCode}) at ${curStation.departure?.actual || '10:00'}`,
      currentStationCode: curStation.stationCode,
      timeline: timeline
    };
  }
  
  // Specific real routes fallback
  if (trainNo === '12301') {
    return {
      trainNo: '12301',
      trainName: 'Howrah - New Delhi Rajdhani Express',
      lastUpdate: updateTime,
      statusNote: 'Departed from KANPUR CENTRAL(CNB) at 05:18 (28 mins late)',
      currentStationCode: 'CNB',
      timeline: [
        { stationName: 'Howrah Jn', stationCode: 'HWH', type: 'stoppage', status: 'passed', arrival: { actual: 'Source', scheduled: 'Source' }, departure: { actual: '16:50', scheduled: '16:50' }, platform: '9' },
        { stationName: 'Asansol Jn', stationCode: 'ASN', type: 'stoppage', status: 'passed', arrival: { actual: '18:47', scheduled: '18:47' }, departure: { actual: '18:49', scheduled: '18:49' }, platform: '4' },
        { stationName: 'Dhanbad Jn', stationCode: 'DHN', type: 'stoppage', status: 'passed', arrival: { actual: '19:55', scheduled: '19:55' }, departure: { actual: '20:00', scheduled: '20:00' }, platform: '3' },
        { stationName: 'Parasnath', stationCode: 'PNME', type: 'stoppage', status: 'passed', arrival: { actual: '20:30', scheduled: '20:30' }, departure: { actual: '20:32', scheduled: '20:32' }, platform: '2' },
        { stationName: 'Gaya Jn', stationCode: 'GAYA', type: 'stoppage', status: 'passed', arrival: { actual: '22:32', scheduled: '22:32' }, departure: { actual: '22:35', scheduled: '22:35' }, platform: '1' },
        { stationName: 'Pt. Deen Dayal Upadhyaya Jn', stationCode: 'DDU', type: 'stoppage', status: 'passed', arrival: { actual: '00:43', scheduled: '00:43' }, departure: { actual: '00:50', scheduled: '00:50' }, platform: '5' },
        { stationName: 'Prayagraj Jn', stationCode: 'PRYJ', type: 'stoppage', status: 'passed', arrival: { actual: '02:40', scheduled: '02:40' }, departure: { actual: '02:42', scheduled: '02:42' }, platform: '6' },
        { stationName: 'Kanpur Central', stationCode: 'CNB', type: 'stoppage', status: 'current', arrival: { actual: '05:08', scheduled: '04:45' }, departure: { actual: '05:18', scheduled: '04:50' }, platform: '1' },
        { stationName: 'New Delhi', stationCode: 'NDLS', type: 'stoppage', status: 'upcoming', arrival: { scheduled: '10:05' }, departure: { scheduled: 'DSTN' }, platform: '14' }
      ]
    };
  } else if (trainNo === '12424') {
    return {
      trainNo: '12424',
      trainName: 'New Delhi - Dibrugarh Rajdhani Express',
      lastUpdate: updateTime,
      statusNote: 'Departed from PATNA JN(PNBE) at 21:40 (10 mins late)',
      currentStationCode: 'PNBE',
      timeline: [
        { stationName: 'New Delhi', stationCode: 'NDLS', type: 'stoppage', status: 'passed', arrival: { actual: 'Source', scheduled: 'Source' }, departure: { actual: '16:10', scheduled: '16:10' }, platform: '16' },
        { stationName: 'Kanpur Central', stationCode: 'CNB', type: 'stoppage', status: 'passed', arrival: { actual: '21:02', scheduled: '21:02' }, departure: { actual: '21:07', scheduled: '21:07' }, platform: '1' },
        { stationName: 'Prayagraj Jn', stationCode: 'PRYJ', type: 'stoppage', status: 'passed', arrival: { actual: '23:08', scheduled: '23:08' }, departure: { actual: '23:10', scheduled: '23:10' }, platform: '6' },
        { stationName: 'Pt. Deen Dayal Upadhyaya Jn', stationCode: 'DDU', type: 'stoppage', status: 'passed', arrival: { actual: '01:25', scheduled: '01:25' }, departure: { actual: '01:35', scheduled: '01:35' }, platform: '2' },
        { stationName: 'Patna Jn', stationCode: 'PNBE', type: 'stoppage', status: 'current', arrival: { actual: '21:30', scheduled: '21:20' }, departure: { actual: '21:40', scheduled: '21:30' }, platform: '1' },
        { stationName: 'Guwahati', stationCode: 'GHY', type: 'stoppage', status: 'upcoming', arrival: { scheduled: '12:40' }, departure: { scheduled: '12:55' }, platform: '1' },
        { stationName: 'Dibrugarh', stationCode: 'DBRG', type: 'stoppage', status: 'upcoming', arrival: { scheduled: '20:15' }, departure: { scheduled: 'DSTN' }, platform: '1' }
      ]
    };
  }

  // General fallback mock if train is not known
  return {
    trainNo: trainNo || '12301',
    trainName: 'Express Special',
    lastUpdate: updateTime,
    statusNote: 'Running 15 mins late',
    currentStationCode: 'CNB',
    timeline: [
      { stationName: 'Source Station', stationCode: 'SRC', type: 'stoppage', status: 'passed', arrival: { actual: 'Source', scheduled: 'Source' }, departure: { actual: '08:00', scheduled: '08:00' }, platform: '1' },
      { stationName: 'Midway Stop', stationCode: 'CNB', type: 'stoppage', status: 'current', arrival: { actual: '12:15', scheduled: '12:00' }, departure: { actual: '12:25', scheduled: '12:10' }, platform: '2' },
      { stationName: 'Destination Station', stationCode: 'DSTN', type: 'stoppage', status: 'upcoming', arrival: { scheduled: '16:30' }, departure: { scheduled: 'DSTN' }, platform: '3' }
    ]
  };
}

function getMockTrainSchedule(query) {
  return {
    trainInfo: {
      train_name: 'New Delhi Express',
      train_no: query || '12002',
      from_stn_name: 'NDLS',
      to_stn_name: 'KLK',
      travel_time: '4h 15m'
    },
    route: [
      { stationName: 'New Delhi', stationCode: 'NDLS', arrival: 'Source', departure: '07:40' },
      { stationName: 'Panipat Junction', stationCode: 'PNP', arrival: '08:50', departure: '08:52' },
      { stationName: 'Ambala Cantt', stationCode: 'UMB', arrival: '10:05', departure: '10:07' },
      { stationName: 'Chandigarh', stationCode: 'CDG', arrival: '11:00', departure: '11:05' },
      { stationName: 'Kalka', stationCode: 'KLK', arrival: '11:55', departure: 'Destination' }
    ]
  };
}

// ===== STATE STORAGE =====
function loadState() {
  try {
    const saved = localStorage.getItem('railquick_state');
    if (saved) {
      const p = JSON.parse(saved);
      appState.user = p.user || null;
      appState.cart = []; // Start fresh so View Cart only shows when they add an item in the session
      appState.orders = Array.isArray(p.orders) ? p.orders : [];
      appState.pnrData = p.pnrData || null;
      appState.pnrLiveData = p.pnrLiveData || null;
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('railquick_state', JSON.stringify({
      user: appState.user,
      cart: appState.cart,
      orders: appState.orders,
      pnrData: appState.pnrData,
      pnrLiveData: appState.pnrLiveData
    }));
  } catch(e) {}
}

// ===== NAVIGATION =====
function navigateTo(pageId) {
  const current = document.getElementById(appState.currentPage);
  const target = document.getElementById(pageId);
  if (!target || pageId === appState.currentPage) return;

  if (current) {
    current.classList.remove('active');
    current.classList.add('slide-out');
    setTimeout(() => { current.classList.remove('slide-out'); }, 400);
  }

  target.classList.add('active');
  appState.currentPage = pageId;

  if (pageId === 'page-shop') initShopPage();
  if (pageId === 'page-cart') initCartPage();
  if (pageId === 'page-orders') initOrdersPage();
  if (pageId === 'page-account') initAccountPage();
  if (pageId === 'page-checkout') initCheckoutPage();
  if (pageId === 'page-track-order') initTrackOrderPage();
  
  // Hide continue bar if navigating away from PNR page
  const continueBar = document.getElementById('continue-bar');
  if (continueBar && pageId !== 'page-pnr') {
    continueBar.classList.add('hidden');
  }
  
  updateCartFAB();
  updateBottomNav(pageId);
}

// activateNav removed — bottom nav bar has been removed

// ===== PNR & LIVE STATUS FLOWS =====
function switchPNRTab(tab) {
  document.getElementById('panel-pnr').classList.toggle('hidden', tab !== 'pnr');
  document.getElementById('panel-live').classList.toggle('hidden', tab !== 'live');
  
  const tabPnrBtn = document.getElementById('tab-pnr');
  const tabLiveBtn = document.getElementById('tab-live');
  
  if (tab === 'pnr') {
    tabPnrBtn.className = 'flex-1 pb-3 font-headline font-bold text-primary border-primary border-b-2';
    tabLiveBtn.className = 'flex-1 pb-3 font-headline font-semibold text-on-surface-variant hover:text-primary transition-colors border-b-2 border-transparent';
  } else {
    tabLiveBtn.className = 'flex-1 pb-3 font-headline font-bold text-primary border-primary border-b-2';
    tabPnrBtn.className = 'flex-1 pb-3 font-headline font-semibold text-on-surface-variant hover:text-primary transition-colors border-b-2 border-transparent';
  }
  
  document.getElementById('pnr-results').classList.add('hidden');
  document.getElementById('pnr-results').innerHTML = '';
}

function validatePNR(input) { input.value = input.value.slice(0, 10); }

function validateApiResponse(data) {
  if (!data || !data.success || !data.data) throw new Error(data?.error || 'Failed to fetch data');
  let payload = data.data;
  // SDK wraps responses double: { success, data: { success, data: { actual } } }
  if (payload.success !== undefined && payload.data !== undefined) {
    if (payload.success === false || payload.error) throw new Error(payload.error || 'No data found');
    payload = payload.data;
  }
  if (payload.success === false || payload.error) throw new Error(payload.error || 'No data found');
  return payload;
}

// Check PNR Status with Mock fallback
async function checkPNRStatus() {
  const pnr = document.getElementById('pnr-input').value.trim();
  if (pnr.length !== 10) { showToast('Please enter a valid 10-digit PNR', 'warning'); return; }

  showLoading('Checking PNR & Live Status...');
  try {
    const resp = await fetch(`${API_BASE}/api/pnr/${pnr}`);
    const data = await resp.json();
    
    const d = validateApiResponse(data);
    const mapped = {
      pnrNumber: d.pnr,
      trainNumber: d.train?.number || '—',
      trainName: d.train?.name || 'Train',
      dateOfJourney: d.journey?.dateOfJourney || '—',
      source: `${d.journey?.source?.name || '—'} (${d.journey?.source?.code || ''})`,
      destination: `${d.journey?.destination?.name || '—'} (${d.journey?.destination?.code || ''})`,
      reservationClass: d.journey?.class || '—',
      chartPrepared: d.chart?.status || '—',
      fare: d.booking?.fare || null,
      passengerList: (d.passengers || []).map(p => ({
        serialNumber: p.serialNumber || 'Passenger',
        bookingStatus: p.booking?.details || '—',
        currentStatus: p.current?.details || '—',
        coach: p.current?.coach || p.booking?.coach || '',
        berth: p.current?.berthNo || p.booking?.berthNo || '',
        berthCode: p.current?.berthCode || p.booking?.berthCode || ''
      }))
    };

    // Fetch live train status
    let liveData = null;
    if (mapped.trainNumber && mapped.trainNumber !== '—') {
      try {
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`;
        const liveResp = await fetch(`${API_BASE}/api/track-train/${mapped.trainNumber}/${dateStr}`);
        const liveJson = await liveResp.json();
        if (liveJson && liveJson.success && liveJson.data) {
          liveData = validateApiResponse(liveJson);
        }
      } catch (e) {
        console.warn('Failed to fetch live train position for PNR:', e.message);
      }
    }
    if (!liveData && mapped.trainNumber) {
      liveData = getMockLiveStatus(mapped.trainNumber);
    }

    appState.pnrData = mapped;
    appState.pnrLiveData = liveData;
    saveState();
    
    hideLoading();
    renderPNRResult(mapped, liveData);
    showContinueBar(mapped);
    updateShopTopbar();
    showToast('PNR & Live status loaded!');
    
    // Automatically transition to order page after 5 seconds to let them read the status
    setTimeout(() => {
      navigateTo('page-shop');
    }, 5000);
  } catch (err) {
    // API Offline -> Realistic Fallback
    console.warn('API Offline, running fallback mock:', err.message);
    const mock = getMockPNRData(pnr);
    const liveData = getMockLiveStatus(mock.trainNumber);
    
    appState.pnrData = mock;
    appState.pnrLiveData = liveData;
    saveState();
    
    hideLoading();
    renderPNRResult(mock, liveData);
    showContinueBar(mock);
    updateShopTopbar();
    showToast('Mock PNR & Live status loaded', 'info');
    
    // Automatically transition to order page after 5 seconds to let them read the status
    setTimeout(() => {
      navigateTo('page-shop');
    }, 5000);
  }
}

function renderPNRResult(d, liveData) {
  const paxHTML = (d.passengerList || []).map(p => `
    <div class="flex justify-between items-center bg-[#F8F9FA] border border-outline-variant/60 rounded-xl px-4 py-3 text-xs">
      <span class="font-bold text-on-surface">${p.serialNumber}</span>
      <span class="text-primary font-bold">${p.currentStatus}</span>
    </div>
  `).join('');
  const isPrepared = (d.chartPrepared || '').toLowerCase().includes('prepared');
  const chartBadge = isPrepared
    ? `<span class="bg-emerald-50 text-primary border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-lg">Chart Prepared</span>`
    : `<span class="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2.5 py-1 rounded-lg">Chart Not Prepared</span>`;

  let liveStatusHTML = '';
  if (liveData) {
    const statusNote = liveData.statusNote || 'Running';
    const isDelayed = statusNote.toLowerCase().includes('late') || statusNote.toLowerCase().includes('delay');
    
    let timelineHTML = '';
    if (liveData.timeline && liveData.timeline.length > 0) {
      timelineHTML = liveData.timeline.map((s, idx) => {
        let nodeClass = 'upcoming';
        if (s.status) {
          nodeClass = s.status;
        } else {
          const curIdx = liveData.timeline.findIndex(x => x.stationCode === liveData.currentStationCode);
          if (curIdx !== -1) {
            if (idx < curIdx) nodeClass = 'passed';
            else if (idx === curIdx) nodeClass = 'current';
            else nodeClass = 'upcoming';
          }
        }
        
        const timeArr = s.arrival?.actual || s.arrival?.scheduled || '—';
        const timeSch = s.arrival?.scheduled || '';
        
        let delayTagHTML = '';
        if (nodeClass === 'current') {
          delayTagHTML = `<span class="delay-tag ${isDelayed ? 'late' : 'ontime'}">${statusNote}</span>`;
        }
        
        return `
          <div class="timeline-node ${nodeClass}">
            <div class="node-dot"></div>
            <div class="node-content">
              <div>
                <div class="node-station font-bold text-xs text-on-surface">${s.stationName} (${s.stationCode})</div>
                <div class="text-[10px] text-gray-500 mt-0.5">Platform ${s.platform || '—'}</div>
                ${delayTagHTML}
              </div>
              <div class="text-right">
                <div class="time-actual font-mono text-xs">${timeArr}</div>
                ${timeSch && timeSch !== timeArr ? `<div class="time-sched font-mono text-[10px] text-gray-400">${timeSch}</div>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
    
    const containerHTML = generateTimelineContainerHTML(liveData, statusNote, isDelayed, timelineHTML);
    liveStatusHTML = `
      <div class="border-t border-dashed border-gray-200 pt-4 mt-4">
        <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Live Route Tracker</div>
        ${containerHTML}
      </div>
    `;
  }

  document.getElementById('pnr-results').innerHTML = `
    <div class="bg-white border border-outline-variant/60 rounded-[2rem] overflow-hidden shadow-premium">
      <div class="gradient-header p-5 text-white flex justify-between items-start">
        <div>
          <h3 class="font-serif-display text-xl text-white font-bold">${d.trainName || 'Train'}</h3>
          <p class="font-mono text-[10px] text-white/70 mt-1">Train #${d.trainNumber || '—'}</p>
        </div>
        <div>
          <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest text-right">Journey Date</p>
          <p class="text-xs font-bold text-secondary mt-0.5 text-right">${d.dateOfJourney || '—'}</p>
        </div>
      </div>
      
      <div class="p-5 space-y-4">
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-400 font-medium">PNR Number</span>
          <strong class="text-on-surface font-mono font-bold">${d.pnrNumber}</strong>
        </div>
        
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-400 font-medium">Class / Category</span>
          <strong class="text-on-surface">${d.reservationClass || '—'}</strong>
        </div>
        
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-400 font-medium">Chart Status</span>
          ${chartBadge}
        </div>
        
        <div class="border-t border-dashed border-gray-100 pt-3">
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Passenger Seat Allocations</div>
          <div class="space-y-2">
            ${paxHTML}
          </div>
        </div>
        
        ${d.fare ? `
          <div class="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
            <span class="text-gray-400 font-medium">Total Ticket Fare</span>
            <strong class="text-secondary font-black text-sm">₹${d.fare}</strong>
          </div>
        ` : ''}
        
        ${liveStatusHTML}
      </div>
    </div>`;
  document.getElementById('pnr-results').classList.remove('hidden');
}

function showContinueBar(data) {
  const bar = document.getElementById('continue-bar');
  const info = document.getElementById('train-info-mini');
  const pax = data.passengerList && data.passengerList[0];
  const seat = pax ? `${pax.coach}, Seat ${pax.berth}` : data.reservationClass || '—';
  
  if (info) {
    info.innerHTML = `<strong class="text-sm text-primary">${data.trainName || 'Train'}</strong><span class="text-xs text-secondary font-bold">Delivery to: ${seat}</span>`;
  }
  if (bar) bar.classList.remove('hidden');
}

function proceedToShop() { navigateTo('page-shop'); }

// Get Live Train Status with Mock fallback
async function checkLiveStatus() {
  const trainNo = document.getElementById('live-train-input').value.trim();
  const dateInput = document.getElementById('live-date-input').value;
  if (!trainNo) { showToast('Enter a train number', 'warning'); return; }

  let dateStr;
  if (dateInput) {
    const [y, m, d] = dateInput.split('-');
    dateStr = `${d}-${m}-${y}`;
  } else {
    const now = new Date();
    dateStr = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`;
  }

  showLoading('Getting live train position...');
  try {
    const resp = await fetch(`${API_BASE}/api/track-train/${trainNo}/${dateStr}`);
    const data = await resp.json();
    hideLoading();
    const d = validateApiResponse(data);
    
    // Save train info to appState so shop topbar updates
    const source = d.timeline && d.timeline.length > 0 ? d.timeline[0] : null;
    const dest = d.timeline && d.timeline.length > 0 ? d.timeline[d.timeline.length - 1] : null;
    appState.pnrData = {
      pnrNumber: '—',
      trainNumber: d.trainNo || trainNo,
      trainName: d.trainName || 'Train ' + trainNo,
      dateOfJourney: dateStr,
      source: source ? `${source.stationName} (${source.stationCode})` : '—',
      destination: dest ? `${dest.stationName} (${dest.stationCode})` : '—',
      reservationClass: '—',
      chartPrepared: '—',
      fare: null,
      passengerList: []
    };
    appState.pnrLiveData = d;
    saveState();
    
    renderLiveTrainResult(d, trainNo);
    updateShopTopbar();
    showToast('Live status fetched!');
  } catch(err) {
    console.warn('API Offline, running mock live position:', err.message);
    
    // Attempt to fetch train info for a dynamic route mock
    let routeInfo = null;
    try {
      const infoResp = await fetch(`${API_BASE}/api/train-info/${trainNo}`);
      const infoData = await infoResp.json();
      if (infoData.success) {
        routeInfo = validateApiResponse(infoData);
      }
    } catch (e) {
      console.warn('Failed to fetch train schedule for dynamic mock:', e.message);
    }
    
    const mock = getMockLiveStatus(trainNo, routeInfo);
    
    // Save mock train info
    const source = mock.timeline && mock.timeline.length > 0 ? mock.timeline[0] : null;
    const dest = mock.timeline && mock.timeline.length > 0 ? mock.timeline[mock.timeline.length - 1] : null;
    appState.pnrData = {
      pnrNumber: '—',
      trainNumber: mock.trainNo || trainNo,
      trainName: mock.trainName || 'Train ' + trainNo,
      dateOfJourney: dateStr,
      source: source ? `${source.stationName} (${source.stationCode})` : '—',
      destination: dest ? `${dest.stationName} (${dest.stationCode})` : '—',
      reservationClass: '—',
      chartPrepared: '—',
      fare: null,
      passengerList: []
    };
    appState.pnrLiveData = mock;
    saveState();
    
    renderLiveTrainResult(mock, trainNo);
    updateShopTopbar();
    hideLoading();
    showToast('Mock status loaded (API offline)', 'info');
  }
}

// Generate premium, collapsed summary-first live timeline layout
function generateTimelineContainerHTML(d, statusNote, isDelayed, timelineHTML) {
  let summaryCardHTML = '';
  
  if (d.timeline && d.timeline.length > 0) {
    // Find the current active/pulsing station node
    const curIdx = d.timeline.findIndex(x => x.stationCode === d.currentStationCode || x.status === 'current');
    if (curIdx !== -1) {
      const curStation = d.timeline[curIdx];
      const lastStation = curIdx > 0 ? d.timeline[curIdx - 1] : null;
      const nextStation = curIdx < d.timeline.length - 1 ? d.timeline[curIdx + 1] : null;
      
      const lastTime = lastStation ? (lastStation.departure?.actual || lastStation.departure?.scheduled || '—') : '';
      const nextTime = nextStation ? (nextStation.arrival?.scheduled || nextStation.arrival?.actual || '—') : '';
      
      summaryCardHTML = `
        <div class="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 flex flex-col items-center justify-center text-center">
          <div class="flex items-center gap-1.5 mb-1.5 select-none">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span class="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Current Position</span>
          </div>
          <h4 class="text-base font-serif-display font-black text-on-surface mb-0.5">${curStation.stationName} (${curStation.stationCode})</h4>
          <p class="text-xs font-bold text-gray-500 mb-4">${statusNote}</p>
          
          <!-- Mini Progress Track -->
          <div class="flex items-center justify-between w-full max-w-[280px] px-1 text-[10px] text-on-surface-variant/80 font-bold mb-1">
            <div class="w-[35%] text-left truncate text-gray-400 font-semibold">${lastStation ? lastStation.stationName.split(' ')[0] : 'Start'}</div>
            <div class="flex-grow flex items-center justify-center relative px-2">
              <div class="w-full h-[2px] bg-outline-variant/60 relative">
                <span class="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-primary select-none animate-pulse">train</span>
              </div>
            </div>
            <div class="w-[35%] text-right truncate text-gray-600 font-semibold">${nextStation ? nextStation.stationName.split(' ')[0] : 'End'}</div>
          </div>
          
          <div class="flex justify-between w-full max-w-[280px] px-1 text-[9px] text-gray-400 font-black font-mono">
            <div class="text-left">${lastTime ? `DEP: ${lastTime}` : ''}</div>
            <div class="text-right">${nextTime ? `ETA: ${nextTime}` : ''}</div>
          </div>
        </div>
      `;
    } else {
      summaryCardHTML = `
        <div class="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 text-center">
          <div class="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Live Status</div>
          <h4 class="text-base font-serif-display font-black text-on-surface mb-0.5">${d.trainName || 'Train'}</h4>
          <p class="text-xs font-bold text-gray-500">${statusNote}</p>
        </div>
      `;
    }
  }

  return `
    ${summaryCardHTML}
    <details class="group mt-2">
      <summary class="list-none flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary cursor-pointer hover:opacity-85 select-none py-2 bg-primary/5 rounded-xl border border-primary/10">
        <span>View Full Station Route</span>
        <span class="material-symbols-outlined text-[16px] transition-transform group-open:rotate-180">expand_more</span>
      </summary>
      <div class="train-timeline mt-4 pl-7 pr-2">
        ${timelineHTML}
      </div>
    </details>
  `;
}

// Render vertical premium timeline route visualization with pulsing train icon
function renderLiveTrainResult(d, trainNo) {
  const statusNote = d.statusNote || 'Running';
  const isDelayed = statusNote.toLowerCase().includes('late') || statusNote.toLowerCase().includes('delay');
  
  let timelineHTML = '';
  if (d.timeline && d.timeline.length > 0) {
    timelineHTML = d.timeline.map((s, idx) => {
      let nodeClass = 'upcoming'; // passed, current, upcoming
      if (s.status) {
        nodeClass = s.status;
      } else {
        const curIdx = d.timeline.findIndex(x => x.stationCode === d.currentStationCode);
        if (curIdx !== -1) {
          if (idx < curIdx) nodeClass = 'passed';
          else if (idx === curIdx) nodeClass = 'current';
          else nodeClass = 'upcoming';
        }
      }
      
      const timeArr = s.arrival?.actual || s.arrival?.scheduled || '—';
      const timeSch = s.arrival?.scheduled || '';
      
      let delayTagHTML = '';
      if (nodeClass === 'current') {
        delayTagHTML = `<span class="delay-tag ${isDelayed ? 'late' : 'ontime'}">${statusNote}</span>`;
      }
      
      return `
        <div class="timeline-node ${nodeClass}">
          <div class="node-dot"></div>
          <div class="node-content">
            <div>
              <div class="node-station font-bold text-xs text-on-surface">${s.stationName} (${s.stationCode})</div>
              <div class="text-[10px] text-gray-500 mt-0.5">Platform ${s.platform || '—'}</div>
              ${delayTagHTML}
            </div>
            <div class="text-right">
              <div class="time-actual font-mono text-xs">${timeArr}</div>
              ${timeSch && timeSch !== timeArr ? `<div class="time-sched font-mono text-[10px] text-gray-400">${timeSch}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const containerHTML = generateTimelineContainerHTML(d, statusNote, isDelayed, timelineHTML);

  document.getElementById('pnr-results').innerHTML = `
    <div class="bg-white border border-outline-variant/60 rounded-[2rem] overflow-hidden shadow-premium">
      <div class="gradient-header p-5 text-white">
        <h3 class="font-serif-display text-xl text-white font-bold">${d.trainName || 'Train ' + trainNo}</h3>
        <p class="font-mono text-[10px] text-white/70 mt-1">Train #${d.trainNo || trainNo} · Last updated: ${d.lastUpdate || 'Just now'}</p>
      </div>
      
      <div class="p-5">
        ${containerHTML}
      </div>
    </div>`;
  document.getElementById('pnr-results').classList.remove('hidden');
}

// Search Train Route
async function searchTrain() {
  const query = document.getElementById('train-search-input').value.trim();
  if (!query) { showToast('Enter train number or name', 'warning'); return; }
  showLoading('Searching train route...');
  try {
    const resp = await fetch(`${API_BASE}/api/train-info/${query}`);
    const data = await resp.json();
    hideLoading();
    const d = validateApiResponse(data);
    const info = d.trainInfo || {};
    const route = d.route || [];
    
    // Save train info to appState so shop topbar updates
    appState.pnrData = {
      pnrNumber: '—',
      trainNumber: info.train_no || query,
      trainName: info.train_name || 'Train ' + query,
      dateOfJourney: new Date().toLocaleDateString('en-IN'),
      source: `${route[0]?.stnName || route[0]?.stationName || info.from_stn_name || '—'} (${route[0]?.stnCode || route[0]?.stationCode || ''})`,
      destination: `${route[route.length-1]?.stnName || route[route.length-1]?.stationName || info.to_stn_name || '—'} (${route[route.length-1]?.stnCode || route[route.length-1]?.stationCode || ''})`,
      reservationClass: '—',
      chartPrepared: '—',
      fare: null,
      passengerList: []
    };
    saveState();
    
    renderTrainSchedule(d);
    updateShopTopbar();
    showToast('Train route loaded!');
  } catch (err) {
    console.warn('API Offline, running mock route schedule:', err.message);
    const mock = getMockTrainSchedule(query);
    const info = mock.trainInfo || {};
    const route = mock.route || [];
    
    // Save mock train info
    appState.pnrData = {
      pnrNumber: '—',
      trainNumber: info.train_no || query,
      trainName: info.train_name || 'Train ' + query,
      dateOfJourney: new Date().toLocaleDateString('en-IN'),
      source: `${route[0]?.stationName || info.from_stn_name || '—'} (${route[0]?.stationCode || ''})`,
      destination: `${route[route.length-1]?.stationName || info.to_stn_name || '—'} (${route[route.length-1]?.stationCode || ''})`,
      reservationClass: '—',
      chartPrepared: '—',
      fare: null,
      passengerList: []
    };
    saveState();
    
    renderTrainSchedule(mock);
    updateShopTopbar();
    hideLoading();
    showToast('Mock route loaded (API offline)', 'info');
  }
}

function renderTrainSchedule(d) {
  const info = d.trainInfo || {};
  const stations = d.route || [];
  const stationsHTML = stations.map(s => `
    <div class="flex justify-between items-center py-2.5 border-b border-gray-50 text-xs">
      <div>
        <span class="font-bold text-on-surface">${s.stnName || s.stationName}</span>
        <span class="text-[9px] text-gray-400 font-bold ml-1.5">${s.stnCode || s.stationCode || ''}</span>
      </div>
      <span class="font-mono text-gray-600">${s.arrival || 'Source'} / ${s.departure || 'Destination'}</span>
    </div>
  `).join('');

  document.getElementById('pnr-results').innerHTML = `
    <div class="bg-white border border-outline-variant/60 rounded-[2rem] overflow-hidden shadow-premium">
      <div class="gradient-header p-5 text-white">
        <h3 class="font-serif-display text-xl text-white font-bold">${info.train_name || 'Train'}</h3>
        <p class="font-mono text-[10px] text-white/70 mt-1">#${info.train_no || ''} · ${info.from_stn_name || ''} → ${info.to_stn_name || ''}</p>
      </div>
      
      <div class="p-5">
        <div class="flex justify-between items-center text-xs pb-3 border-b border-gray-100 mb-3">
          <span class="text-gray-400 font-medium">Total Travel Time</span>
          <strong class="text-on-surface font-bold">${info.travel_time || '—'}</strong>
        </div>
        
        <div class="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          <span>Station</span>
          <span>Arr / Dep</span>
        </div>
        
        <div class="max-h-[300px] overflow-y-auto no-scrollbar">
          ${stationsHTML}
        </div>
      </div>
    </div>`;
  document.getElementById('pnr-results').classList.remove('hidden');
}

// ===== SHOP PAGE =====
function initShopPage() {
  showProductSkeletons();
  setTimeout(() => {
    renderProducts(PRODUCTS);
  }, 300);
  updateShopTopbar();
  updateCartFAB();
}

// Dynamic header showing train name, seat number, and birth details
function updateShopTopbar() {
  const labelEl = document.getElementById('shop-delivering-label');
  const headerEl = document.getElementById('shop-delivery-header');
  const seatEl = document.getElementById('shop-pnr-seat');
  const statusEl = document.getElementById('shop-pnr-status');
  const fromEl = document.getElementById('shop-pnr-from');
  const toEl = document.getElementById('shop-pnr-to');
  const strip = document.getElementById('train-strip');

  if (appState.pnrData) {
    const d = appState.pnrData;
    const pax = d.passengerList && d.passengerList[0];
    const coach = pax ? pax.coach : '—';
    const seat = pax ? pax.berth : '—';
    const berth = pax ? pax.berthCode : '';

    if (labelEl) {
      labelEl.innerHTML = `Deliver in <span class="text-xs font-headline font-bold text-secondary block mt-1 tracking-normal normal-case">${d.trainName}</span>`;
    }
    if (headerEl) {
      headerEl.className = "flex flex-col gap-1 mt-1 text-white text-left items-start justify-start";
      headerEl.innerHTML = `
        <div class="flex items-center gap-1 font-mono text-[10px] text-white/80 font-semibold uppercase tracking-wider">
          <span class="material-symbols-outlined text-[12px] text-secondary">train</span>
          <span>Train No: ${d.trainNumber} · Seat: ${coach}-${seat} ${berth ? `(${berth})` : ''}</span>
        </div>
        <div class="flex items-center gap-1 text-[10px] text-white/60 font-medium">
          <span class="material-symbols-outlined text-[12px] text-secondary">route</span>
          <span>${d.source.split('(')[0].trim()} to ${d.destination.split('(')[0].trim()}</span>
        </div>
      `;
    }
    if (seatEl) seatEl.textContent = `Seat ${coach}-${seat} ${berth ? `(${berth})` : ''}`;
    if (statusEl) statusEl.textContent = 'Verified';
    if (fromEl) fromEl.textContent = d.source.split('(')[0].trim();
    if (toEl) toEl.textContent = d.destination.split('(')[0].trim();
    
    if (strip) {
      document.getElementById('strip-train-name').textContent = `${d.trainName} #${d.trainNumber}`;
      document.getElementById('strip-seat').textContent = `Coach ${coach}, Seat ${seat}`;
      strip.classList.remove('hidden');
    }
  } else {
    if (labelEl) labelEl.textContent = 'Deliver in';
    if (headerEl) {
      headerEl.className = "flex items-center gap-1.5 mt-0.5";
      headerEl.innerHTML = `
        <span class="material-symbols-outlined text-[14px] text-secondary">train</span>
        <span class="font-mono text-[10px] text-white/80 font-semibold uppercase tracking-widest">Select Train / PNR</span>
      `;
    }
    if (seatEl) seatEl.textContent = 'Seat —';
    if (statusEl) statusEl.textContent = 'No Ticket';
    if (fromEl) fromEl.textContent = 'New Delhi';
    if (toEl) toEl.textContent = 'Select Station';
    if (strip) strip.classList.add('hidden');
  }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  const filtered = products.filter(p => {
    const matchesCat = appState.currentFilter === 'all' || p.category === appState.currentFilter;
    const matchesQuery = !appState.searchQuery || p.name.toLowerCase().includes(appState.searchQuery) || p.category.toLowerCase().includes(appState.searchQuery);
    return matchesCat && matchesQuery;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="col-span-2 text-center py-16 text-gray-400 text-xs font-semibold">No products found.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const inCart = appState.cart.find(c => c.id === p.id);
    const qty = inCart ? inCart.qty : 0;
    const weightText = p.weight ? p.weight : 'Standard Size';
    const ratingVal = p.rating ? p.rating.toFixed(1) : '4.5';
    
    const buttonHTML = qty > 0
      ? `<div class="flex items-center bg-primary rounded-full text-white overflow-hidden shadow-md border border-primary/20 shrink-0">
           <button class="w-8 h-8 flex items-center justify-center hover:bg-black/10 active:bg-black/20 font-bold transition-colors text-xs" onclick="event.stopPropagation();changeProductQty(${p.id},-1)">−</button>
           <span class="px-2 font-mono text-xs font-bold">${qty}</span>
           <button class="w-8 h-8 flex items-center justify-center hover:bg-black/10 active:bg-black/20 font-bold transition-colors text-xs" onclick="event.stopPropagation();changeProductQty(${p.id},1)">+</button>
         </div>`
      : `<button class="border border-primary bg-primary/5 hover:bg-primary text-primary hover:text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm min-w-[72px] text-center" onclick="event.stopPropagation();addToCart(${p.id})">ADD</button>`;

    return `
      <div class="bg-white rounded-3xl p-4.5 shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-outline-variant/60 flex flex-col group cursor-pointer hover:border-primary/30 active:scale-[0.98] transition-all relative overflow-hidden" onclick="openProductModal(${p.id})">
        <!-- Rating Badge -->
        <div class="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md text-[#004D3C] px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-0.5 border border-black/[0.03] shadow-sm z-10">
          <span class="material-symbols-outlined text-[10px] text-secondary fill-1">star</span>
          <span>${ratingVal}</span>
        </div>
        
        <div class="w-full aspect-square bg-[#F4F6F5]/70 rounded-2xl p-4 mb-3 flex items-center justify-center relative overflow-hidden shrink-0">
          <img alt="${p.name}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" src="${p.img}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';">
        </div>
        <h4 class="text-xs font-bold text-on-surface line-clamp-2 mb-1 min-h-[32px]">${p.name}</h4>
        <p class="text-[9px] font-bold text-gray-400 mb-3">${weightText}</p>
        <div class="flex justify-between items-center mt-auto pt-1 gap-2">
          <span class="text-sm font-black text-primary">₹${p.price}</span>
          ${buttonHTML}
        </div>
      </div>`;
  }).join('');
}

function getStars(r) { return '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.floor(r) - (r % 1 >= 0.5 ? 1 : 0)); }

function filterCategory(cat, el) {
  appState.currentFilter = cat;
  document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  
  // Update section title
  const sectionTitle = document.getElementById('products-section');
  if (sectionTitle) {
    const titles = {
      'all': 'Trending Essentials',
      'snacks': 'Snacks & Munchies',
      'beverages': 'Beverages & Drinks',
      'hygiene': 'Hygiene & Care',
      'tech': 'Tech & Comfort'
    };
    sectionTitle.textContent = titles[cat] || 'Trending Essentials';
  }
  
  // Render inline on shop page (no navigation)
  renderProducts(PRODUCTS);
  
  // Scroll to products section smoothly
  const productsEl = document.getElementById('products-section');
  if (productsEl) productsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCategoryProducts(cat) {
  const grid = document.getElementById('category-products-grid');
  if (!grid) return;
  
  const filtered = PRODUCTS.filter(p => p.category === cat);
  
  if (!filtered.length) {
    grid.innerHTML = `<div class="col-span-2 text-center py-16 text-gray-400 text-xs font-semibold">No items available.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const inCart = appState.cart.find(c => c.id === p.id);
    const qty = inCart ? inCart.qty : 0;
    const weightText = p.weight ? p.weight : 'Standard Size';
    const ratingVal = p.rating ? p.rating.toFixed(1) : '4.5';
    
    const buttonHTML = qty > 0
      ? `<div class="flex items-center bg-primary rounded-full text-white overflow-hidden shadow-md border border-primary/20 shrink-0">
           <button class="w-8 h-8 flex items-center justify-center hover:bg-black/10 active:bg-black/20 font-bold transition-colors text-xs" onclick="event.stopPropagation();changeCategoryProductQty(${p.id},-1,'${cat}')">−</button>
           <span class="px-2 font-mono text-xs font-bold">${qty}</span>
           <button class="w-8 h-8 flex items-center justify-center hover:bg-black/10 active:bg-black/20 font-bold transition-colors text-xs" onclick="event.stopPropagation();changeCategoryProductQty(${p.id},1,'${cat}')">+</button>
         </div>`
      : `<button class="border border-primary bg-primary/5 hover:bg-primary text-primary hover:text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm min-w-[72px] text-center" onclick="event.stopPropagation();addCategoryProductToCart(${p.id},'${cat}')">ADD</button>`;

    return `
      <div class="bg-white rounded-3xl p-4.5 shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-outline-variant/60 flex flex-col group cursor-pointer hover:border-primary/30 active:scale-[0.98] transition-all relative overflow-hidden" onclick="openProductModal(${p.id})">
        <!-- Rating Badge -->
        <div class="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md text-[#004D3C] px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-0.5 border border-black/[0.03] shadow-sm z-10">
          <span class="material-symbols-outlined text-[10px] text-secondary fill-1">star</span>
          <span>${ratingVal}</span>
        </div>
        
        <div class="w-full aspect-square bg-[#F4F6F5]/70 rounded-2xl p-4 mb-3 flex items-center justify-center relative overflow-hidden shrink-0">
          <img alt="${p.name}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" src="${p.img}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';">
        </div>
        <h4 class="text-xs font-bold text-on-surface line-clamp-2 mb-1 min-h-[32px]">${p.name}</h4>
        <p class="text-[9px] font-bold text-gray-400 mb-3">${weightText}</p>
        <div class="flex justify-between items-center mt-auto pt-1 gap-2">
          <span class="text-sm font-black text-primary">₹${p.price}</span>
          ${buttonHTML}
        </div>
      </div>`;
  }).join('');
}

function addCategoryProductToCart(id, cat) {
  addToCart(id);
  renderCategoryProducts(cat);
}

function changeCategoryProductQty(id, delta, cat) {
  changeProductQty(id, delta);
  renderCategoryProducts(cat);
}

let isListening = false;

function startVoiceSearch() {
  if (isListening) return;
  
  const searchInput = document.getElementById('product-search');
  const micIcon = document.getElementById('mic-icon');
  
  if (!searchInput) return;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    isListening = true;
    showToast('Voice Search: Listening...', 'info');
    if (micIcon) {
      micIcon.textContent = 'settings_voice';
      micIcon.style.color = '#EF4444';
      micIcon.classList.add('animate-pulse');
    }
    
    const sampleQueries = ['lays', 'water', 'coca cola', 'chocolate', 'brush'];
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    
    setTimeout(() => {
      let i = 0;
      searchInput.value = '';
      const interval = setInterval(() => {
        if (i < randomQuery.length) {
          searchInput.value += randomQuery[i];
          i++;
          filterProducts(searchInput.value);
        } else {
          clearInterval(interval);
          isListening = false;
          if (micIcon) {
            micIcon.textContent = 'mic';
            micIcon.style.color = '';
            micIcon.classList.remove('animate-pulse');
          }
          showToast(`Searched for "${randomQuery}"`, 'success');
        }
      }, 120);
    }, 1200);
    
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    isListening = true;
    showToast('Listening to your voice...', 'info');
    if (micIcon) {
      micIcon.textContent = 'settings_voice';
      micIcon.style.color = '#EF4444';
      micIcon.classList.add('animate-pulse');
    }
  };
  
  recognition.onresult = (event) => {
    const result = event.results[0][0].transcript;
    searchInput.value = result;
    filterProducts(result);
    showToast(`Voice input: "${result}"`, 'success');
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    showToast('Speech recognition failed. Try typing!', 'warning');
  };
  
  recognition.onend = () => {
    isListening = false;
    if (micIcon) {
      micIcon.textContent = 'mic';
      micIcon.style.color = '';
      micIcon.classList.remove('animate-pulse');
    }
  };
  
  recognition.start();
}

function filterProducts(q) {
  appState.searchQuery = q.toLowerCase();
  renderProducts(PRODUCTS);
}

function scrollToProducts() { document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' }); }
function showNotif() { showToast('Delivering orders to platforms 1-8 currently.', 'info'); }

// ===== CART LOGIC =====
function getCartTotals() {
  const subtotal = appState.cart.reduce((s, c) => s + c.price * c.qty, 0);
  let discount = 0;
  let deliveryFee = 30;
  const handlingFee = 10;

  if (appState.appliedCoupon === 'RAILQUICK15') {
    discount = Math.min(Math.round(subtotal * 0.15), 50);
  } else if (appState.appliedCoupon === 'RAIL50' && subtotal >= 200) {
    discount = Math.min(Math.round(subtotal * 0.50), 100);
  } else if (appState.appliedCoupon === 'CHAI20') {
    discount = Math.min(Math.round(subtotal * 0.20), 30);
  } else if (appState.appliedCoupon === 'RAIL100' && subtotal >= 300) {
    discount = 100;
  } else if (appState.appliedCoupon === 'FREEDEL') {
    deliveryFee = 0;
  }

  const gst = Math.round(Math.max(subtotal - discount, 0) * 0.05);
  const total = Math.max(subtotal - discount, 0) + gst + deliveryFee + handlingFee;

  return { subtotal, discount, gst, deliveryFee, handlingFee, total };
}

function applyPromoCode() {
  const input = document.getElementById('promo-input');
  const status = document.getElementById('promo-status');
  const code = (input?.value || '').trim().toUpperCase();
  if (!code) { showToast('Please enter a coupon code', 'warning'); return; }
  
  const subtotal = appState.cart.reduce((s, c) => s + c.price * c.qty, 0);

  let valid = false;
  let msg = '';

  if (code === 'RAILQUICK15') {
    valid = true;
    msg = 'Coupon applied: 15% OFF (Max ₹50)';
  } else if (code === 'RAIL50') {
    if (subtotal >= 200) {
      valid = true;
      msg = 'Coupon applied: 50% OFF (Max ₹100)';
    } else {
      showToast('Valid on orders above ₹200 only', 'warning');
      return;
    }
  } else if (code === 'CHAI20') {
    valid = true;
    msg = 'Coupon applied: 20% OFF (Max ₹30)';
  } else if (code === 'RAIL100') {
    if (subtotal >= 300) {
      valid = true;
      msg = 'Coupon applied: Flat ₹100 OFF';
    } else {
      showToast('Valid on orders above ₹300 only', 'warning');
      return;
    }
  } else if (code === 'FREEDEL') {
    valid = true;
    msg = 'Coupon applied: FREE Delivery';
  }

  if (valid) {
    appState.appliedCoupon = code;
    status.textContent = msg; 
    status.className = 'text-[10px] font-bold text-primary mt-2';
    status.style.display = 'block';
    showToast('Coupon applied!', 'success'); 
    updateCartSummary();
  } else {
    showToast('Invalid coupon code', 'error');
    status.textContent = 'Invalid coupon code'; 
    status.className = 'text-[10px] font-bold text-red-500 mt-2';
    status.style.display = 'block';
  }
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = appState.cart.find(c => c.id === productId);
  if (existing) existing.qty++; else appState.cart.push({ ...product, qty: 1 });
  saveState(); 
  updateCartFAB();
  showToast(`✓ ${product.name.split(' ').slice(0, 3).join(' ')} added!`);
  renderProducts(PRODUCTS);
}

function changeProductQty(id, delta) {
  const item = appState.cart.find(c => c.id === id);
  if (!item) { if (delta > 0) addToCart(id); return; }
  item.qty += delta;
  if (item.qty <= 0) appState.cart = appState.cart.filter(c => c.id !== id);
  saveState(); 
  updateCartFAB(); 
  renderProducts(PRODUCTS);
}

function updateCartFAB() {
  const fab = document.getElementById('cart-fab');
  const count = appState.cart.reduce((s, c) => s + c.qty, 0);
  const total = appState.cart.reduce((s, c) => s + c.price * c.qty, 0);
  if (count > 0 && (appState.currentPage === 'page-shop' || appState.currentPage === 'page-category-view')) {
    fab.classList.remove('hidden');
    document.getElementById('cart-fab-count').textContent = `${count} item${count > 1 ? 's' : ''}`;
    document.getElementById('cart-fab-price').textContent = `₹${total}`;
  } else { 
    fab.classList.add('hidden'); 
  }
}

function initCartPage() {
  const cartList = document.getElementById('cart-items-list');
  const emptyEl = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');
  
  if (appState.cart.length === 0) {
    if (cartList) cartList.innerHTML = ''; 
    if (emptyEl) emptyEl.classList.remove('hidden'); 
    if (summary) summary.style.display = 'none';
  } else {
    if (emptyEl) emptyEl.classList.add('hidden'); 
    if (summary) summary.style.display = 'block'; 
    renderCartItems(); 
    updateCartSummary();
  }
  
  const detailEl = document.getElementById('delivery-detail');
  if (appState.pnrData && detailEl) {
    const d = appState.pnrData;
    const pax = d.passengerList && d.passengerList[0];
    const coach = pax ? pax.coach : '—';
    const seat = pax ? pax.berth : '—';
    detailEl.textContent = `${d.trainName || 'Train'} · Coach ${coach}, Seat ${seat} · New Delhi (NDLS)`;
  }
}

function renderCartItems() {
  const list = document.getElementById('cart-items-list');
  if (!list) return;
  list.innerHTML = appState.cart.map(item => `
    <div class="bg-white border border-outline-variant/50 rounded-2xl p-4 flex gap-4 shadow-sm">
      <div class="w-16 h-16 bg-[#F4F6F5] rounded-xl flex items-center justify-center p-2 shrink-0">
        <img class="max-h-full max-w-full object-contain" src="${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';" />
      </div>
      <div class="flex-grow flex flex-col justify-between py-0.5">
        <div>
          <div class="text-xs font-bold text-on-surface line-clamp-1">${item.name}</div>
          <div class="text-[9px] text-gray-400 font-bold mt-0.5">${item.weight || 'Standard'} • ₹${item.price} each</div>
        </div>
        <div class="flex items-center bg-[#F4F6F5] border border-outline-variant/60 rounded-xl overflow-hidden w-fit mt-2">
          <button class="w-8 h-8 flex items-center justify-center font-bold text-primary text-xs" onclick="updateCartItemQty(${item.id},-1)">−</button>
          <span class="font-mono text-xs font-bold text-on-surface min-w-[24px] text-center">${item.qty}</span>
          <button class="w-8 h-8 flex items-center justify-center font-bold text-primary text-xs" onclick="updateCartItemQty(${item.id},1)">+</button>
        </div>
      </div>
      <div class="flex flex-col justify-between items-end py-0.5">
        <button class="text-gray-400 hover:text-red-500" onclick="removeCartItem(${item.id})">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
        <strong class="text-xs font-black text-primary">₹${item.price * item.qty}</strong>
      </div>
    </div>`).join('');
}

function updateCartItemQty(id, delta) {
  const item = appState.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) appState.cart = appState.cart.filter(c => c.id !== id);
  saveState(); 
  initCartPage();
}

function removeCartItem(id) {
  appState.cart = appState.cart.filter(c => c.id !== id);
  saveState(); 
  initCartPage(); 
  updateCartFAB(); 
  showToast('Item removed', 'info');
}

function clearCart() {
  if (!appState.cart.length) return;
  appState.cart = []; 
  saveState(); 
  initCartPage(); 
  updateCartFAB();
}

function updateCartSummary() {
  if (!appState.cart.length) { appState.appliedCoupon = null; }
  const { subtotal, discount, gst, deliveryFee, handlingFee, total } = getCartTotals();
  
  const subtotalEl = document.getElementById('summary-subtotal');
  const gstEl = document.getElementById('summary-gst');
  const deliveryEl = document.getElementById('summary-delivery');
  const handlingEl = document.getElementById('summary-handling');
  const totalEl = document.getElementById('summary-total');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (gstEl) gstEl.textContent = `₹${gst}`;
  
  if (deliveryEl) {
    deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    if (deliveryFee === 0) {
      deliveryEl.className = 'text-primary font-bold';
    } else {
      deliveryEl.className = 'text-gray-500';
    }
  }
  if (handlingEl) handlingEl.textContent = `₹${handlingFee}`;

  let discRow = document.getElementById('summary-discount-row');
  if (!discRow) {
    const summaryBlock = document.getElementById('cart-summary');
    if (summaryBlock) {
      discRow = document.createElement('div');
      discRow.id = 'summary-discount-row';
      discRow.className = 'flex justify-between text-xs text-red-500 font-bold';
      discRow.innerHTML = `<span>Discount Applied</span><span id="summary-discount">-₹0</span>`;
      summaryBlock.insertBefore(discRow, summaryBlock.querySelector('.border-t'));
    }
  }
  if (discount > 0 && discRow) { 
    discRow.style.display = 'flex'; 
    document.getElementById('summary-discount').textContent = `-₹${discount}`; 
  } else if (discRow) { 
    discRow.style.display = 'none'; 
  }
  if (totalEl) totalEl.textContent = `₹${total}`;
}

function proceedToCheckout() {
  if (!appState.cart.length) { showToast('Cart is empty!', 'warning'); return; }
  if (!appState.user) { 
    showToast('Please sign in first to place your order', 'info'); 
    navigateTo('page-account');
    return; 
  }
  navigateTo('page-checkout');
}

// ===== CHECKOUT FLOW =====
function initCheckoutPage() {
  setCheckoutStep(1);
  const pnrCard = document.getElementById('checkout-pnr-details');
  const manualCard = document.getElementById('checkout-manual-details');
  
  if (appState.pnrData) {
    if (pnrCard) pnrCard.classList.remove('hidden'); 
    if (manualCard) manualCard.classList.add('hidden');
    
    const d = appState.pnrData;
    const pax = d.passengerList && d.passengerList[0];
    const seat = pax ? `${pax.coach}, Seat ${pax.berth}` : '—';
    
    const trainEl = document.getElementById('checkout-train');
    const seatEl = document.getElementById('checkout-seat');
    const stationEl = document.getElementById('checkout-station');
    const timeEl = document.getElementById('checkout-time');
    const etaEl = document.getElementById('checkout-eta');
    
    if (trainEl) trainEl.textContent = `${d.trainName} (#${d.trainNumber})`;
    if (seatEl) seatEl.textContent = seat;
    
    if (stationEl) {
      stationEl.textContent = d.destination ? d.destination.split('(')[0].trim() : 'New Delhi (NDLS)';
    }
    
    if (timeEl) {
      timeEl.textContent = d.dateOfJourney || 'Today';
    }
    
    if (etaEl) {
      if (appState.pnrLiveData && appState.pnrLiveData.statusNote) {
        const note = appState.pnrLiveData.statusNote;
        if (note.toLowerCase().includes('late') || note.toLowerCase().includes('delay')) {
          etaEl.textContent = note.split('at')[0].trim();
        } else {
          etaEl.textContent = 'On-Time';
        }
      } else {
        etaEl.textContent = 'Scheduled';
      }
    }
  } else { 
    if (pnrCard) pnrCard.classList.add('hidden'); 
    if (manualCard) manualCard.classList.remove('hidden'); 
  }
  
  if (appState.user) {
    document.getElementById('contact-name').value = appState.user.name || '';
    document.getElementById('contact-phone').value = appState.user.phone || '';
  }
  renderCheckoutMiniItems();
  const { total } = getCartTotals();
  document.getElementById('checkout-total-amt').textContent = `₹${total}`;
  document.getElementById('pay-total-amt').textContent = `₹${total}`;
}

function renderCheckoutMiniItems() {
  const mini = document.getElementById('checkout-items-mini');
  if (!mini) return;
  mini.innerHTML = appState.cart.map(item => `
    <div class="bg-white border border-outline-variant/40 rounded-xl px-4 py-2.5 flex justify-between items-center text-xs shadow-sm">
      <span class="text-gray-500 font-medium">${item.name} <strong class="text-primary ml-1">× ${item.qty}</strong></span>
      <strong class="text-on-surface">₹${item.price * item.qty}</strong>
    </div>`).join('');
}

function goToPayment() {
  const name = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  if (!name || !phone) { showToast('Please fill contact details', 'warning'); return; }
  
  if (!appState.pnrData) {
    const mt = document.getElementById('manual-train').value.trim();
    const mc = document.getElementById('manual-coach').value.trim();
    const ms = document.getElementById('manual-seat').value.trim();
    if (!mt || !mc || !ms) { showToast('Please enter Train, Coach & Seat details', 'warning'); return; }
  }
  setCheckoutStep(2);
}

function setCheckoutStep(step) {
  document.getElementById('checkout-step-1').classList.toggle('hidden', step !== 1);
  document.getElementById('checkout-step-2').classList.toggle('hidden', step !== 2);
  document.getElementById('checkout-step-3').classList.toggle('hidden', step !== 3);
  
  for (let s = 1; s <= 3; s++) {
    const circle = document.getElementById(`step-circle-${s}`);
    const text = document.getElementById(`step-${s}`)?.querySelector('span:last-child');
    if (circle && text) {
      if (s === step) {
        circle.className = 'w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center';
        text.className = 'text-[10px] font-bold text-primary';
      } else if (s < step) {
        circle.className = 'w-6 h-6 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center';
        text.className = 'text-[10px] font-bold text-emerald-800';
      } else {
        circle.className = 'w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center';
        text.className = 'text-[10px] font-bold text-gray-500';
      }
    }
  }
}

function selectPayment(el, type) {
  appState.selectedPayment = type;
  document.querySelectorAll('.payment-option').forEach(o => {
    o.className = 'payment-option border border-outline-variant bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer';
    const radio = o.querySelector('.pay-radio');
    if (radio) radio.innerHTML = '';
  });
  
  el.className = 'payment-option border-2 border-primary bg-emerald-50/40 rounded-2xl p-4 flex items-center gap-4 cursor-pointer';
  const radio = el.querySelector('.pay-radio');
  if (radio) {
    radio.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-primary"></span>`;
  }
  document.getElementById('upi-input-section').style.display = type === 'upi' ? 'block' : 'none';
}

function selectUPIApp(el) {
  document.querySelectorAll('.upi-app').forEach(a => {
    a.querySelector('.upi-app-icon')?.classList.remove('ring-4', 'ring-primary/20');
  });
  el.querySelector('.upi-app-icon')?.classList.add('ring-4', 'ring-primary/20');
  showToast(`${el.querySelector('span').textContent} selected`, 'info');
}

function placeOrder() {
  showLoading('Processing payment securely...');
  setTimeout(() => {
    hideLoading();
    const orderId = 'RQ-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    let seat = 'Seat info not provided', train = 'Train';
    
    if (appState.pnrData) {
      const pax = appState.pnrData.passengerList?.[0];
      seat = pax ? `Coach ${pax.coach}, Seat ${pax.berth}` : appState.pnrData.reservationClass || '—';
      train = `${appState.pnrData.trainName} (#${appState.pnrData.trainNumber})`;
    } else {
      const mt = document.getElementById('manual-train').value.trim();
      const mc = document.getElementById('manual-coach').value.trim().toUpperCase();
      const ms = document.getElementById('manual-seat').value.trim();
      if (mt) train = mt;
      if (mc && ms) seat = `Coach ${mc}, Seat ${ms}`;
    }
    
    const { subtotal, discount, gst, total } = getCartTotals();
    appState.orders.unshift({
      id: orderId,
      items: [...appState.cart],
      date: new Date().toLocaleDateString('en-IN'),
      status: 'preparing',
      subtotal,
      discount,
      gst,
      total,
      seat,
      train
    });
    
    appState.appliedCoupon = null; 
    appState.cart = []; 
    saveState(); 
    updateCartFAB();
    
    document.getElementById('order-id-display').textContent = orderId;
    document.getElementById('success-seat').textContent = seat;
    setCheckoutStep(3);
    showToast('Order placed successfully!');
  }, 2000);
}

// ===== ORDERS PAGE =====
function initOrdersPage() {
  const list = document.getElementById('orders-list');
  const empty = document.getElementById('orders-empty');
  if (!list) return;
  
  if (!appState.orders.length) { 
    list.innerHTML = ''; 
    if (empty) empty.classList.remove('hidden'); 
    return; 
  }
  if (empty) empty.classList.add('hidden');
  
  list.innerHTML = appState.orders.map(order => {
    const itemsHTML = order.items.map(i => `
      <div class="flex justify-between items-center text-xs py-1 border-b border-gray-50">
        <span class="text-gray-500">${i.name} <strong class="text-primary ml-1">× ${i.qty}</strong></span>
        <strong class="text-on-surface">₹${i.price * i.qty}</strong>
      </div>`).join('');

    let statusText = 'Preparing essentials...';
    let statusColorClass = 'text-yellow-600 bg-yellow-50 border-yellow-100';
    
    if (order.status === 'delivered') {
      statusText = 'Delivered to seat!';
      statusColorClass = 'text-primary bg-emerald-50 border-emerald-100';
    } else if (order.status === 'in-transit') {
      statusText = 'Out for delivery!';
      statusColorClass = 'text-blue-600 bg-blue-50 border-blue-100';
    }

    return `
      <div class="bg-white border border-outline-variant/60 rounded-3xl p-5 shadow-premium space-y-4">
        <!-- Order Shop Header -->
        <div class="flex justify-between items-start">
          <div class="flex gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow">RQ</div>
            <div>
              <h4 class="text-xs font-bold text-on-surface">RailQuick Express Store</h4>
              <p class="text-[9px] text-gray-400 font-bold mt-0.5">${order.date} • ID: ${order.id}</p>
            </div>
          </div>
          <span class="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${statusColorClass}">${statusText}</span>
        </div>

        <!-- PNR/Seat Details -->
        <div class="bg-[#F8F9FA] rounded-xl px-4 py-2.5 flex justify-between items-center text-xs">
          <span class="flex items-center gap-1 text-gray-500 font-bold"><span class="material-symbols-outlined text-[16px]">train</span> ${order.train}</span>
          <strong class="text-primary font-bold">${order.seat}</strong>
        </div>

        <!-- Items list -->
        <div class="space-y-1">
          <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Order Items</div>
          ${itemsHTML}
        </div>

        <!-- Delivery Partner Details Card -->
        <div class="border-t border-gray-100 pt-3.5 flex justify-between items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary shadow-sm shrink-0"><span class="material-symbols-outlined text-lg">directions_run</span></div>
          <div class="flex-grow">
            <div class="text-xs font-bold text-on-surface">Ramesh Kumar</div>
            <div class="text-[9px] text-gray-500 mt-0.5">Delivering to Platform at NDLS</div>
          </div>
          <button class="bg-[#F4F6F5] border border-outline-variant rounded-xl text-xs font-bold px-4 py-2 hover:bg-gray-100 active:scale-95 transition-all text-on-surface shadow-sm" onclick="showToast('Calling Ramesh (+91 98765 43210)...', 'info')">Call</button>
        </div>

        <!-- Card Footer -->
        <div class="border-t border-gray-100 pt-3.5 flex justify-between items-center">
          <div>
            <div class="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid</div>
            <div class="text-base font-black text-secondary">₹${order.total}</div>
          </div>
          <button class="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-primary-light transition-all" onclick="trackOrder('${order.id}')">Track Order</button>
        </div>
      </div>`;
  }).join('');
}

// ===== TRACK ORDER PAGE =====
function initTrackOrderPage() {
  const order = appState.trackingOrder || (appState.orders.length > 0 ? appState.orders[0] : null);
  if (!order) {
    showToast('No active order to track', 'warning');
    return;
  }
  
  const heroTitle = document.getElementById('track-hero-title');
  const heroDesc = document.getElementById('track-hero-desc');
  const heroOrderId = document.getElementById('track-hero-order-id');
  const heroSeat = document.getElementById('track-hero-seat');
  const agentName = document.getElementById('track-agent-name');
  
  // Determine delivery station from PNR data
  const station = appState.pnrData ? appState.pnrData.destination.split('(')[0].trim() : 'NDLS';
  
  // Status-based display
  const statusMap = {
    'preparing': { title: `Preparing at ${station}`, desc: 'Your essentials are being packed and sealed by our kitchen partner.' },
    'in-transit': { title: `Delivering at ${station}`, desc: `Order is ready! Agent is heading to Platform with your order.` },
    'delivered': { title: 'Delivered to your seat!', desc: 'Your order has been successfully delivered. Enjoy your journey!' }
  };
  
  const statusInfo = statusMap[order.status] || statusMap['preparing'];
  
  if (heroTitle) heroTitle.textContent = statusInfo.title;
  if (heroDesc) heroDesc.textContent = statusInfo.desc;
  if (heroOrderId) heroOrderId.textContent = `Order ID: #${order.id}`;
  if (heroSeat) heroSeat.textContent = order.seat || 'Seat —';
  
  // Update delivery agent step
  const agents = ['Ramesh Kumar', 'Sunil Sharma', 'Vikram Singh', 'Arjun Patel', 'Deepak Verma'];
  const agentIdx = Math.abs(order.id.charCodeAt(3) || 0) % agents.length;
  const agent = agents[agentIdx];
  
  if (agentName) agentName.textContent = agent;

  // Render milestones dynamically
  const milestonesEl = document.getElementById('track-milestones');
  if (milestonesEl) {
    const isPrep = order.status === 'preparing';
    const isTransit = order.status === 'in-transit';
    const isDelivered = order.status === 'delivered';

    milestonesEl.innerHTML = `
      <!-- Step 1: Confirmed -->
      <div class="relative flex items-start gap-4 pb-2">
        <span class="absolute left-[-23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 ring-emerald-500/20 bg-emerald-600"></span>
        <div>
          <div class="font-black text-on-surface text-xs leading-none">Order Placed &amp; Confirmed</div>
          <div class="text-[10px] text-gray-500 mt-1">Kitchen Partner accepted. Payment verified.</div>
        </div>
      </div>
      <!-- Step 2: Prepared -->
      <div class="relative flex items-start gap-4 pb-2 ${isPrep ? '' : ''}">
        <span class="absolute left-[-23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isPrep ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : (isTransit || isDelivered ? 'bg-emerald-600' : 'bg-gray-200')}"></span>
        <div>
          <div class="font-black ${isPrep ? 'text-primary' : 'text-on-surface'} text-xs leading-none">Food Prepared &amp; Sealed</div>
          <div class="text-[10px] text-gray-500 mt-1">Packed in eco-safe double-sealed travel container.</div>
        </div>
      </div>
      <!-- Step 3: Out for Delivery -->
      <div class="relative flex items-start gap-4 pb-2 ${isPrep ? 'opacity-40' : ''}">
        <span class="absolute left-[-23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isTransit ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : (isDelivered ? 'bg-emerald-600' : 'bg-gray-200')}"></span>
        <div>
          <div class="font-black ${isTransit ? 'text-primary' : 'text-on-surface'} text-xs leading-none">Handed to ${agent}</div>
          <div class="text-[10px] text-gray-500 mt-1">${agent} is waiting at the platform for the train arrival.</div>
        </div>
      </div>
      <!-- Step 4: Seat Delivery -->
      <div class="relative flex items-start gap-4 ${isDelivered ? '' : 'opacity-40'}">
        <span class="absolute left-[-23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isDelivered ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : 'bg-gray-200'}"></span>
        <div>
          <div class="font-black ${isDelivered ? 'text-primary' : 'text-on-surface'} text-xs leading-none">Delivery to ${order.seat || 'Seat'}</div>
          <div class="text-[10px] text-gray-500 mt-1">Direct seat delivery completed. Verification OTP checked.</div>
        </div>
      </div>
    `;
  }
}

function trackOrder(orderId) {
  const order = appState.orders.find(o => o.id === orderId);
  if (order) {
    appState.trackingOrder = order;
    navigateTo('page-track-order');
  }
}

// ===== ACCOUNT & AUTH =====

function initAccountPage() {
  const logged = document.getElementById('account-logged-section');
  const login = document.getElementById('account-login-section');
  if (appState.user) {
    if (login) login.classList.add('hidden'); 
    if (logged) logged.classList.remove('hidden');
    document.getElementById('profile-name').textContent = appState.user.name || 'User';
    document.getElementById('profile-email').textContent = appState.user.email || '';
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
      if (appState.user.avatarUrl) {
        avatarEl.innerHTML = `<img src="${appState.user.avatarUrl}" class="w-full h-full object-cover rounded-full" />`;
      } else {
        avatarEl.textContent = (appState.user.name || 'U')[0].toUpperCase();
      }
    }
    // Unmount Clerk sign-in if it was mounted
    const mountEl = document.getElementById('clerk-sign-in-mount');
    if (mountEl && clerkInstance) {
      try { clerkInstance.unmountSignIn(mountEl); } catch(e) {}
      mountEl.innerHTML = '';
    }
  } else { 
    if (login) login.classList.remove('hidden'); 
    if (logged) logged.classList.add('hidden');
    // Mount Clerk's embedded sign-in form
    const mountEl = document.getElementById('clerk-sign-in-mount');
    if (mountEl && clerkInstance && clerkInstance.loaded) {
      // Remove any loading state
      const loadingEl = mountEl.querySelector('.clerk-loading-state');
      if (loadingEl) loadingEl.remove();
      
      // Only mount if not already mounted
      if (!mountEl.querySelector('.cl-rootBox') && !mountEl.querySelector('.cl-component')) {
        mountEl.innerHTML = '';
        // Small delay to allow DOM to settle before mounting
        setTimeout(() => {
          try {
            clerkInstance.mountSignIn(mountEl, {
              appearance: {
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 p-0 w-full max-w-sm mx-auto bg-transparent',
                  formButtonPrimary: 'bg-[#004D3C] hover:bg-[#006A4E]',
                }
              }
            });
          } catch(e) {
            console.warn('[Clerk] Could not mount sign-in:', e);
            mountEl.innerHTML = `
              <button class="w-full bg-primary hover:bg-primary-light text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-all shadow-md" onclick="googleSignIn()">
                <span class="material-symbols-outlined text-lg">login</span>
                Sign In with Clerk
              </button>
            `;
          }
        }, 50);
      }
    } else if (mountEl && !clerkInstance) {
      // Clerk not loaded yet — show loading or retry button
      if (!mountEl.querySelector('.clerk-loading-state') && !mountEl.querySelector('button')) {
        mountEl.innerHTML = `
          <div class="clerk-loading-state flex flex-col items-center justify-center py-6 gap-3">
            <div class="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-gray-400 font-medium">Loading sign-in...</p>
          </div>
        `;
        // Auto-retry after a short delay if Clerk hasn't loaded
        setTimeout(() => {
          if (!clerkInstance && mountEl) {
            mountEl.innerHTML = `
              <div class="flex flex-col items-center gap-3 py-4">
                <button class="w-full bg-primary hover:bg-primary-light text-white rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-all shadow-md" onclick="retryClerkInit(); setTimeout(() => initAccountPage(), 2000);">
                  <span class="material-symbols-outlined text-lg">refresh</span>
                  Load Sign-In
                </button>
                <p class="text-[10px] text-gray-400">Tap to connect to sign-in service</p>
              </div>
            `;
          }
        }, 5000);
      }
    }
  }
}

function closeGoogleLoginModal(force = false) {
  const modal = document.getElementById('modal-google-login');
  if (modal) modal.classList.add('hidden');
}

function googleSignIn() {
  const clerk = clerkInstance || window.Clerk;
  if (clerk && clerk.loaded) {
    try {
      clerk.openSignIn({
        afterSignInUrl: window.location.href,
        afterSignUpUrl: window.location.href,
        redirectUrl: window.location.href
      });
    } catch(e) {
      console.warn('[Clerk] openSignIn failed, navigating to account page:', e);
      navigateTo('page-account');
    }
  } else {
    // Clerk not ready yet, go to account page where mount will happen
    navigateTo('page-account');
    // Also try to initialize Clerk if it hasn't been done
    if (!clerkInstance) {
      initClerk();
    }
  }
}

function simulateGoogleLogin() {
  closeGoogleLoginModal();
  googleSignIn();
}

function showPhoneLogin() { showPhoneLoginPrompt(); }



function syncClerkUser() {
  if (!clerkInstance) return;
  const user = clerkInstance.user;
  if (user) {
    appState.user = {
      name: user.fullName || user.firstName || user.username || 'User',
      email: user.primaryEmailAddress?.emailAddress || '',
      phone: user.primaryPhoneNumber?.phoneNumber || '',
      avatarUrl: user.imageUrl || '',
      avatar: (user.fullName || user.firstName || 'U')[0].toUpperCase(),
      provider: 'clerk',
      clerkId: user.id,
      loginAt: new Date().toISOString()
    };
  } else {
    appState.user = null;
  }
  saveState();
  initAccountPage();
}

function signOut() {
  const clerk = clerkInstance || window.Clerk;
  if (clerk) {
    clerk.signOut().then(() => {
      appState.user = null;
      saveState();
      initAccountPage();
      showToast('Signed out', 'info');
    });
  } else {
    appState.user = null;
    saveState();
    initAccountPage();
    showToast('Signed out', 'info');
  }
}

// ===== PRODUCT MODAL DETAILS =====
function openProductModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  appState.modalProduct = p; 
  appState.modalQty = 1;
  
  document.getElementById('modal-img').src = p.img;
  document.getElementById('modal-img').onerror = function() { this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'; };
  document.getElementById('modal-category').textContent = p.category.charAt(0).toUpperCase() + p.category.slice(1);
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-stars').textContent = getStars(p.rating);
  document.getElementById('modal-reviews').textContent = `(${p.reviews} reviews)`;
  
  document.getElementById('modal-price').innerHTML = `₹${p.price}`;
  document.getElementById('modal-desc').textContent = p.description;
  document.getElementById('modal-tags').innerHTML = p.tags.map(t => `<span class="px-2.5 py-1 bg-gray-100 rounded-full text-[9px] text-gray-500 font-bold">${t}</span>`).join('');
  
  document.getElementById('modal-qty').textContent = 1;
  document.getElementById('modal-total').textContent = `₹${p.price}`;
  document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
  appState.modalProduct = null;
}

function closeModal(event) { if (event.target === document.getElementById('product-modal')) closeProductModal(); }

function changeModalQty(delta) {
  appState.modalQty = Math.max(1, appState.modalQty + delta);
  document.getElementById('modal-qty').textContent = appState.modalQty;
  if (appState.modalProduct) {
    document.getElementById('modal-total').textContent = `₹${appState.modalProduct.price * appState.modalQty}`;
  }
}

function addToCartFromModal() {
  if (!appState.modalProduct) return;
  const id = appState.modalProduct.id, qty = appState.modalQty;
  const existing = appState.cart.find(c => c.id === id);
  if (existing) existing.qty += qty; else appState.cart.push({ ...appState.modalProduct, qty });
  
  saveState(); 
  updateCartFAB(); 
  closeProductModal();
  showToast(`✓ ${appState.modalProduct.name.split(' ').slice(0, 3).join(' ')} × ${qty} added!`);
  renderProducts(PRODUCTS);
}

// ===== TOAST NOTIFICATION =====
let toastTimeout;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimeout);
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const text = document.getElementById('toast-msg');
  const icons = { success: '✓', warning: '!', info: 'i', error: '✕' };
  
  if (!toast || !icon || !text) return;
  
  icon.textContent = icons[type] || '✓';
  icon.style.background = type === 'warning' ? '#D4AF37' : type === 'error' ? '#EF4444' : type === 'info' ? '#3B82F6' : '#004D3C';
  text.textContent = msg;
  toast.classList.remove('hidden');
  
  toastTimeout = setTimeout(() => { toast.classList.add('hidden'); }, 3000);
}

// ===== LOADING INDICATORS =====
function showLoading(text = 'Loading...') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-overlay').classList.remove('hidden');
}
function hideLoading() { document.getElementById('loading-overlay').classList.add('hidden'); }

// ===== DATE INITIALIZATION =====
function setDefaultDates() { 
  document.querySelectorAll('input[type="date"]').forEach(input => { 
    input.value = new Date().toISOString().slice(0, 10); 
  }); 
}

// ===== OFFERS, SUPPORT & GAMES LOGIC =====

// Apply promo/coupon code
function applyCouponCode(code) {
  if (appState.cart.length === 0) {
    showToast('Your cart is empty! Add items first.', 'warning');
    return;
  }
  
  const subtotal = appState.cart.reduce((s, c) => s + c.price * c.qty, 0);
  
  if (code === 'RAIL50' && subtotal < 200) {
    showToast('RAIL50 requires a minimum order of ₹200', 'warning');
    return;
  }
  if (code === 'RAIL100' && subtotal < 300) {
    showToast('RAIL100 requires a minimum order of ₹300', 'warning');
    return;
  }

  appState.appliedCoupon = code;
  saveState();
  showToast(`Coupon "${code}" applied successfully!`, 'success');
  
  // Update the input field value if present
  const promoInput = document.getElementById('promo-input');
  if (promoInput) promoInput.value = code;
  
  navigateTo('page-cart');
  initCartPage();
}

// Support Chat Bot
function sendSupportMessage(text) {
  const container = document.getElementById('support-chat-messages');
  if (!container) return;
  
  // User bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'flex items-start gap-2.5 max-w-[85%] ml-auto justify-end';
  userBubble.innerHTML = `
    <div class="bg-primary text-white rounded-2xl p-3.5 shadow-sm text-xs font-semibold leading-relaxed">
      ${text}
    </div>
  `;
  container.appendChild(userBubble);
  container.scrollTop = container.scrollHeight;
  
  // Disable replies while typing
  const replies = document.getElementById('support-quick-replies');
  if (replies) replies.style.pointerEvents = 'none';
  
  // Bot typing bubble
  const typingBubble = document.createElement('div');
  typingBubble.className = 'flex items-start gap-2.5 max-w-[85%]';
  typingBubble.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
      <span class="material-symbols-outlined text-sm">robot_2</span>
    </div>
    <div class="bg-white border border-outline-variant/60 rounded-2xl p-3 px-4 shadow-sm text-xs font-bold text-gray-400 flex gap-1 items-center italic">
      Typing<span class="animate-bounce">.</span><span class="animate-bounce [animation-delay:0.2s]">.</span><span class="animate-bounce [animation-delay:0.4s]">.</span>
    </div>
  `;
  
  setTimeout(() => {
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;
  }, 400);
  
  // Bot response logic
  setTimeout(() => {
    typingBubble.remove();
    if (replies) replies.style.pointerEvents = 'auto';
    
    let replyText = "I'm checking on that for you. Can you please check your PNR status or contact our customer desk at 1800-RAIL-QUICK?";
    if (text.includes('delayed')) {
      replyText = "If your train is delayed, our delivery agents will automatically track the live train schedule and deliver your order precisely when the train arrives at the station. No hassle!";
    } else if (text.includes('delivered')) {
      replyText = "We partner with authorized catering services at stations. When the train pulls in, our delivery agent will come directly to your coach and hand the package to you at your seat/berth!";
    } else if (text.includes('cancel')) {
      replyText = "You can cancel your order up to 1 hour before the scheduled arrival of the train at your delivery station. Cancel options are available in the 'Orders' tab.";
    }
    
    const botBubble = document.createElement('div');
    botBubble.className = 'flex items-start gap-2.5 max-w-[85%]';
    botBubble.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-sm">robot_2</span>
      </div>
      <div class="bg-white border border-outline-variant/60 rounded-2xl p-3.5 shadow-sm text-xs font-medium text-on-surface leading-relaxed animate-fade-in-up">
        ${replyText}
      </div>
    `;
    container.appendChild(botBubble);
    container.scrollTop = container.scrollHeight;
  }, 1800);
}

// Lucky Wheel Game
let isWheelSpinning = false;
let wonCoupon = '';

function spinWheel() {
  if (isWheelSpinning) return;
  isWheelSpinning = true;
  
  const wheel = document.getElementById('lucky-wheel');
  const btn = document.getElementById('spin-button');
  const resultCard = document.getElementById('game-result-card');
  
  if (btn) btn.disabled = true;
  if (resultCard) resultCard.classList.add('hidden');
  
  // Set random rotations (between 5 and 10 full spins) + ending angle
  const segments = ['RAIL50', 'TRY AGAIN', 'CHAI20', 'FREEDEL', 'TRY AGAIN', 'RAIL100'];
  const winIdx = Math.floor(Math.random() * segments.length);
  wonCoupon = segments[winIdx];
  
  // Calculate angle (each segment is 60 degrees. 0 = RAIL50, 60 = TRY AGAIN...)
  const angle = 3600 + (360 - (winIdx * 60)); 
  
  if (wheel) {
    wheel.style.transform = `rotate(${angle}deg)`;
  }
  
  setTimeout(() => {
    isWheelSpinning = false;
    if (btn) btn.disabled = false;
    
    const title = document.getElementById('game-result-title');
    const code = document.getElementById('game-result-code');
    const resultSub = document.getElementById('game-result-sub');
    
    if (wonCoupon === 'TRY AGAIN') {
      if (title) title.textContent = "Better Luck Next Time!";
      if (resultSub) resultSub.textContent = "Spin again to win exclusive travel food rewards.";
      if (code) code.parentElement.style.display = 'none';
    } else {
      if (title) title.textContent = "Congratulations! You Won!";
      if (resultSub) resultSub.textContent = "Use this code at checkout to claim your reward.";
      if (code) {
        code.textContent = wonCoupon;
        code.parentElement.style.display = 'flex';
      }
    }
    
    if (resultCard) resultCard.classList.remove('hidden');
  }, 4100);
}

function applyGameCoupon() {
  if (wonCoupon && wonCoupon !== 'TRY AGAIN') {
    applyCouponCode(wonCoupon);
  }
}

// ===== BOTTOM NAVIGATION BAR =====
const NAV_PAGES = ['page-shop', 'page-pnr', 'page-orders', 'page-account'];

function navTo(pageId) {
  navigateTo(pageId);
  updateBottomNav(pageId);
}

function updateBottomNav(pageId) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  
  // Show/hide nav based on page
  const showNavPages = ['page-shop', 'page-pnr', 'page-orders', 'page-account', 'page-cart', 'page-offers', 'page-support', 'page-games', 'page-category-view'];
  if (showNavPages.includes(pageId)) {
    nav.classList.remove('hidden-nav');
  } else {
    nav.classList.add('hidden-nav');
  }
  
  // Update active states
  const items = nav.querySelectorAll('.nav-item');
  items.forEach(item => {
    const targetPage = item.dataset.page;
    const icon = item.querySelector('.nav-icon');
    if (targetPage === pageId || 
        (targetPage === 'page-account' && ['page-offers', 'page-support', 'page-games'].includes(pageId)) ||
        (targetPage === 'page-shop' && pageId === 'page-category-view')) {
      item.classList.add('active');
      if (icon) icon.classList.add('fill-1');
    } else {
      item.classList.remove('active');
      if (icon) icon.classList.remove('fill-1');
    }
  });
  
  // Update orders badge
  updateOrdersBadge();
}

function updateOrdersBadge() {
  const badge = document.getElementById('nav-orders-badge');
  if (badge) {
    const count = appState.orders.length;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Ripple effect utility
function addRipple(event, element) {
  const rect = element.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
  ripple.classList.add('ripple');
  element.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Skeleton loading for products
function showProductSkeletons() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  let html = '';
  for (let i = 0; i < 4; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text-sm"></div>
        <div class="skeleton skeleton-btn"></div>
      </div>
    `;
  }
  grid.innerHTML = html;
}

// ===== INITIAL DOM CONTENT LOADED HOOK =====
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setDefaultDates();
  
  document.getElementById('page-splash').classList.add('active');
  appState.currentPage = 'page-splash';
  
  // Initialize bottom nav
  updateBottomNav('page-splash');
  
  // Reset PNR and ticket data on launch so past search data is not shown
  appState.pnrData = null;
  appState.pnrLiveData = null;
  saveState();

  // Prevent zoom in mobile browser (App Experience)
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchstart', e => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProductModal(); });
});

// ===== CLERK AUTHENTICATION =====
// Robust initialization with script load detection and error recovery.

let clerkInitDone = false;

function setupClerkListeners(clerk) {
  if (!clerk || clerkInitDone) return;
  clerkInitDone = true;
  clerkInstance = clerk;
  console.log('[Clerk] Ready. Signed in:', clerk.user?.fullName || 'Not signed in');

  // Sync the current session state immediately
  syncClerkUser();

  // React to sign-in / sign-out events
  clerk.addListener(({ user }) => {
    const wasSignedIn = !!appState.user;
    const isNowSignedIn = !!user;

    if (isNowSignedIn) {
      appState.user = {
        name: user.fullName || user.firstName || user.username || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: user.primaryPhoneNumber?.phoneNumber || '',
        avatarUrl: user.imageUrl || '',
        avatar: (user.fullName || user.firstName || 'U')[0].toUpperCase(),
        provider: 'clerk',
        clerkId: user.id,
        loginAt: new Date().toISOString()
      };
    } else {
      appState.user = null;
    }
    saveState();

    if (!wasSignedIn && isNowSignedIn) {
      closeGoogleLoginModal();
      showToast(`Welcome, ${appState.user.name}!`);
      initAccountPage();
      if (appState.cart.length > 0) {
        setTimeout(() => { navigateTo('page-checkout'); initCheckoutPage(); }, 800);
      }
    } else if (wasSignedIn && !isNowSignedIn) {
      showToast('Signed out', 'info');
      initAccountPage();
    } else {
      initAccountPage();
    }
  });

  // Remove loading state from mount area
  const mountEl = document.getElementById('clerk-sign-in-mount');
  if (mountEl) {
    const loadingEl = mountEl.querySelector('.clerk-loading-state');
    if (loadingEl) loadingEl.remove();
  }

  // If we're currently on the account page, re-init it now that Clerk is ready
  if (appState.currentPage === 'page-account') {
    initAccountPage();
  }
}

const CLERK_PUBLISHABLE_KEY = 'pk_test_c21vb3RoLWphY2thbC0xOC5jbGVyay5hY2NvdW50cy5kZXYk';

// Initialize Clerk: wait for the script, call .load() to boot SDK, then set up listeners
async function initClerk() {
  if (clerkInstance && clerkInstance.loaded) return;

  let clerk = window.Clerk;
  
  // Wait up to 5 seconds for the script to load (checks both script flags and window.Clerk)
  let attempts = 0;
  while (!clerk && !window.__clerkScriptFailed && attempts < 25) {
    await new Promise(r => setTimeout(r, 200));
    clerk = window.Clerk;
    attempts++;
  }

  // If the initial script failed to load (network error / file scheme) or timed out, attempt local fallback
  if (!clerk || window.__clerkScriptFailed) {
    console.warn('[Clerk] Primary CDN script failed/timed out. Injecting local fallback script...');
    window.__clerkScriptFailed = false; // Reset flag
    
    // Inject local script if not already present
    const existingLocal = document.querySelector('script[src="/clerk.browser.js"]');
    if (!existingLocal) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
      script.src = '/clerk.browser.js';
      script.onload = () => { window.__clerkScriptLoaded = true; };
      script.onerror = () => { window.__clerkScriptFailed = true; };
      document.head.appendChild(script);
    }

    // Wait another 5 seconds for fallback script to load
    attempts = 0;
    while (!window.Clerk && !window.__clerkScriptFailed && attempts < 25) {
      await new Promise(r => setTimeout(r, 200));
      attempts++;
    }
  }

  clerk = window.Clerk;
  if (!clerk) {
    console.error('[Clerk] Failed to load Clerk script (both primary and fallback failed)');
    showClerkFallback();
    return;
  }

  // Check if window.Clerk is the class constructor (common in NPM build environments) or an instance
  if (typeof clerk === 'function') {
    console.log('[Clerk] Instantiating Clerk class...');
    try {
      clerk = new clerk(CLERK_PUBLISHABLE_KEY);
      window.Clerk = clerk;
    } catch (e) {
      console.error('[Clerk] Failed to instantiate Clerk class:', e);
      showClerkFallback();
      return;
    }
  }

  try {
    if (!clerk.loaded) {
      console.log('[Clerk] Calling clerk.load()...');
      await clerk.load({
        publishableKey: CLERK_PUBLISHABLE_KEY,
        appearance: {
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border-0 p-0 w-full max-w-sm mx-auto bg-transparent',
            formButtonPrimary: 'bg-[#004D3C] hover:bg-[#006A4E]',
          }
        }
      });
    }
    console.log('[Clerk] Loaded successfully. User:', clerk.user?.fullName || 'Not signed in');
    setupClerkListeners(clerk);
  } catch (err) {
    console.error('[Clerk] load() failed:', err);
    showClerkFallback();
  }
}

function showClerkFallback() {
  const mountEl = document.getElementById('clerk-sign-in-mount');
  if (mountEl) {
    mountEl.innerHTML = `
      <div class="text-center py-6">
        <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-red-400 text-2xl">cloud_off</span>
        </div>
        <p class="text-sm font-semibold text-gray-700 mb-1">Connection Issue</p>
        <p class="text-xs text-gray-500 mb-4">Unable to connect to sign-in service.<br/>Please check your internet and try again.</p>
        <button class="w-full bg-primary hover:bg-primary-light text-white rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-all shadow-md" onclick="retryClerkInit()">
          <span class="material-symbols-outlined text-lg">refresh</span>
          Retry Connection
        </button>
      </div>
    `;
  }
}

function retryClerkInit() {
  const mountEl = document.getElementById('clerk-sign-in-mount');
  if (mountEl) {
    mountEl.innerHTML = `
      <div class="clerk-loading-state flex flex-col items-center justify-center py-8 gap-4">
        <div class="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs text-gray-400 font-medium">Reconnecting...</p>
      </div>
    `;
  }
  
  // Reset flags for retry
  clerkInitDone = false;
  window.__clerkScriptFailed = false;
  window.Clerk = null;
  
  // Remove existing scripts to allow clean reload
  const oldScripts = document.querySelectorAll('script[src*="clerk"]');
  oldScripts.forEach(s => s.remove());
  
  // Re-inject primary CDN script
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
  script.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5.22.0/dist/clerk.browser.js';
  script.onload = () => { window.__clerkScriptLoaded = true; };
  script.onerror = () => { window.__clerkScriptFailed = true; };
  document.head.appendChild(script);
  
  initClerk();
}

// Boot Clerk as soon as the DOM is ready (or immediately if already ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initClerk());
} else {
  initClerk();
}
