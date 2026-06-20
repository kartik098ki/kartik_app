/* =====================================================
   RAILQUICK — Complete Application JavaScript
   API Integration · Cart · Checkout · Premium UX
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

function loadState() {
  try {
    const saved = localStorage.getItem('railquick_state');
    if (saved) {
      const p = JSON.parse(saved);
      appState.user = p.user || null;
      appState.cart = Array.isArray(p.cart) ? p.cart : [];
      appState.orders = Array.isArray(p.orders) ? p.orders : [];
      appState.pnrData = p.pnrData || null;
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('railquick_state', JSON.stringify({
      user: appState.user,
      cart: appState.cart,
      orders: appState.orders,
      pnrData: appState.pnrData
    }));
  } catch(e) {}
}

// ===== PRODUCTS DATABASE =====
const PRODUCTS = [
  { id: 1, name: 'Bisleri Mineral Water 1L', price: 20, mrp: 25, category: 'beverages', img: 'product_water.png', rating: 4.7, reviews: 1240, description: 'Fresh and pure mineral water. Stay hydrated throughout your train journey. ISI certified, sealed bottle.', tags: ['Hydration', 'ISI Certified', '1 Litre'] },
  { id: 2, name: "Haldiram's Aloo Bhujia 150g", price: 30, mrp: 35, category: 'snacks', img: 'product_haldirams.png', rating: 4.6, reviews: 892, description: "Crispy, crunchy and spicy Aloo Bhujia from Haldiram's. The ultimate train snack — original Bikaneri recipe.", tags: ['Vegetarian', 'Crispy', 'Bikaneri Recipe'] },
  { id: 3, name: 'Ambrane 10000mAh Power Bank', price: 499, mrp: 799, category: 'electronics', img: 'product_powerbank.png', rating: 4.6, reviews: 543, description: 'Never run out of charge. Dual USB output, fast charge support. Compact and light for journeys.', tags: ['Fast Charge', 'Dual USB', '10000mAh'] },
  { id: 4, name: 'Travel Hygiene Kit', price: 35, mrp: 50, category: 'hygiene', img: 'product_toothbrush.png', rating: 4.5, reviews: 337, description: 'Complete travel kit with toothbrush, mini toothpaste, face towel & soap. Everything for a fresh journey.', tags: ['Complete Kit', 'Travel Size', 'Colgate+Dove'] },
  { id: 5, name: 'Dettol Hand Sanitizer 50ml', price: 45, mrp: 60, category: 'hygiene', img: 'product_sanitizer.png', rating: 4.8, reviews: 2145, description: 'Kill 99.9% of germs. No water required. Compact travel size fits in your pocket easily.', tags: ['Kills 99.9% Germs', 'Travel Size', 'Instant'] },
  { id: 6, name: 'Wagh Bakri Instant Chai Kit', price: 40, mrp: 55, category: 'beverages', img: 'product_tea.png', rating: 4.4, reviews: 451, description: 'Authentic masala chai anywhere on your journey. 10 cups pack with sugar & spices. Just add hot water!', tags: ['Masala Chai', '10 Cups', 'Instant'] },
  { id: 7, name: 'Inflatable Travel Neck Pillow', price: 149, mrp: 249, category: 'comfort', img: 'product_neckpillow.png', rating: 4.3, reviews: 788, description: 'Sleep comfortably on long overnight journeys. Soft velvet cover, portable inflatable design.', tags: ['Velvet Cover', 'Inflatable', 'Ergonomic'] },
  { id: 8, name: 'boAt Wired Earphones', price: 199, mrp: 399, category: 'electronics', img: 'product_earphones.png', rating: 4.5, reviews: 1120, description: 'Premium audio quality with mic. Great for music, calls & videos during train journey. 3.5mm jack.', tags: ['With Mic', '3.5mm Jack', 'Premium Sound'] }
];

// ===== NAVIGATION =====
function navigateTo(pageId) {
  const current = document.getElementById(appState.currentPage);
  const target = document.getElementById(pageId);
  if (!target || pageId === appState.currentPage) return;

  current.classList.remove('active');
  current.classList.add('slide-out');
  setTimeout(() => { current.classList.remove('slide-out'); }, 400);

  target.classList.add('active');
  appState.currentPage = pageId;

  const hideNavPages = ['page-splash', 'page-pnr', 'page-cart', 'page-checkout'];
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    bottomNav.style.display = hideNavPages.includes(pageId) ? 'none' : 'flex';
  }

  const navMap = { 'page-shop': 'home', 'page-orders': 'orders', 'page-offers': 'offers', 'page-account': 'account' };
  const navName = navMap[pageId];
  if (navName) activateNav(navName);

  if (pageId === 'page-shop') initShopPage();
  if (pageId === 'page-cart') initCartPage();
  if (pageId === 'page-orders') initOrdersPage();
  if (pageId === 'page-account') initAccountPage();
  if (pageId === 'page-checkout') initCheckoutPage();
}

function activateNav(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`nav-${name}`);
  if (btn) btn.classList.add('active');
}

// ===== PNR PAGE =====
function switchPNRTab(tab) {
  document.getElementById('panel-pnr').classList.toggle('hidden', tab !== 'pnr');
  document.getElementById('panel-live').classList.toggle('hidden', tab !== 'live');
  document.getElementById('tab-pnr').classList.toggle('active', tab === 'pnr');
  document.getElementById('tab-live').classList.toggle('active', tab === 'live');
  document.getElementById('pnr-results').classList.add('hidden');
  document.getElementById('pnr-results').innerHTML = '';
}

function validatePNR(input) { input.value = input.value.slice(0, 10); }

function validateApiResponse(data) {
  if (!data || !data.success || !data.data) throw new Error(data?.error || 'Failed to fetch data');
  const payload = data.data;
  if (payload.success === false || payload.error) throw new Error(payload.error || 'No data found');
  return payload;
}

async function checkPNRStatus() {
  const pnr = document.getElementById('pnr-input').value.trim();
  if (pnr.length !== 10) { showToast('Please enter a valid 10-digit PNR', 'warning'); return; }

  showLoading('Checking PNR Status...');
  try {
    const resp = await fetch(`${API_BASE}/api/pnr/${pnr}`);
    const data = await resp.json();
    hideLoading();

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
    appState.pnrData = mapped;
    saveState();
    renderPNRResult(mapped);
    showContinueBar(mapped);
    showToast('PNR details fetched successfully!');
  } catch (err) {
    hideLoading();
    showToast(err.message || 'Could not fetch PNR.', 'warning');
  }
}

function renderPNRResult(d) {
  const paxHTML = (d.passengerList || []).map(p => `
    <div class="passenger-chip"><strong>${p.serialNumber}</strong>: ${p.currentStatus}</div>
  `).join('');
  const chartColor = (d.chartPrepared || '').toLowerCase().includes('prepared') ? 'green' : 'orange';

  document.getElementById('pnr-results').innerHTML = `
    <div class="result-header">
      <div class="result-train-name">${d.trainName || 'Train'}</div>
      <div class="result-train-num">#${d.trainNumber || '—'}</div>
    </div>
    <div class="result-body">
      <div class="result-row"><span class="result-label">PNR Number</span><span class="result-value">${d.pnrNumber}</span></div>
      <div class="result-row"><span class="result-label">Journey Date</span><span class="result-value">${d.dateOfJourney || '—'}</span></div>
      <div class="result-row"><span class="result-label">From → To</span><span class="result-value" style="font-size:0.78rem">${d.source} → ${d.destination}</span></div>
      <div class="result-row"><span class="result-label">Class</span><span class="result-value">${d.reservationClass || '—'}</span></div>
      <div class="result-row"><span class="result-label">Chart Status</span><span class="result-value ${chartColor}">${d.chartPrepared || '—'}</span></div>
      ${d.fare ? `<div class="result-row"><span class="result-label">Fare</span><span class="result-value">₹${d.fare}</span></div>` : ''}
      ${paxHTML}
    </div>`;
  document.getElementById('pnr-results').classList.remove('hidden');
}

function showContinueBar(data) {
  const bar = document.getElementById('continue-bar');
  const info = document.getElementById('train-info-mini');
  const pax = data.passengerList && data.passengerList[0];
  const seat = pax ? pax.currentStatus : data.reservationClass || '—';
  info.innerHTML = `<strong>${data.trainName || 'Train'}</strong><br/><span style="color:var(--orange)">Seat: ${seat}</span>`;
  bar.classList.remove('hidden');
}

function proceedToShop() { navigateTo('page-shop'); }

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
    renderLiveTrainResult(d, trainNo);
    showToast('Live status fetched!');
  } catch(err) {
    hideLoading();
    showToast(err.message || 'Could not fetch live status.', 'warning');
  }
}

function renderLiveTrainResult(d, trainNo) {
  let currentStation = '—', nextStation = '—';
  if (d.timeline && d.timeline.length > 0) {
    let current = d.timeline.find(t => t.status === 'current');
    if (!current && d.currentStationCode) current = d.timeline.find(t => t.stationCode === d.currentStationCode);
    if (!current) { const passed = d.timeline.filter(t => t.status === 'passed'); if (passed.length) current = passed[passed.length - 1]; }
    if (current) {
      currentStation = `${current.stationName || current.stationCode} (${current.stationCode})`;
      const idx = d.timeline.indexOf(current);
      if (idx < d.timeline.length - 1) { const up = d.timeline.slice(idx + 1).find(t => t.status === 'upcoming'); if (up) nextStation = `${up.stationName || up.stationCode} (${up.stationCode})`; }
    }
    if (nextStation === '—') { const up = d.timeline.find(t => t.status === 'upcoming'); if (up) nextStation = `${up.stationName || up.stationCode} (${up.stationCode})`; }
  }

  const statusNote = d.statusNote || 'Running';
  const isDelayed = statusNote.toLowerCase().includes('late') || statusNote.toLowerCase().includes('delay');
  let timelineHTML = '';
  if (d.timeline && d.timeline.length > 0) {
    const stops = d.timeline.filter(t => t.type === 'stoppage').slice(0, 6);
    timelineHTML = stops.map(s => {
      const sc = s.status === 'passed' ? 'green' : (s.status === 'current' ? 'orange' : '');
      const dep = s.departure?.actual || s.departure?.scheduled || '—';
      const arr = s.arrival?.actual || s.arrival?.scheduled || '—';
      return `<div class="result-row"><span class="result-label">${s.stationName} (${s.stationCode})</span><span class="result-value ${sc}" style="font-size:0.75rem">${arr} / ${dep}</span></div>`;
    }).join('');
  }

  document.getElementById('pnr-results').innerHTML = `
    <div class="result-header" style="background:linear-gradient(135deg,#1E3A5F,#2a5298)">
      <div class="result-train-name">${d.trainName || 'Train ' + trainNo}</div>
      <div class="result-train-num">Updated: ${d.lastUpdate || 'Just now'}</div>
    </div>
    <div class="result-body">
      <div class="result-row"><span class="result-label">Train Number</span><span class="result-value">#${d.trainNo || trainNo}</span></div>
      <div class="result-row"><span class="result-label">Status</span><span class="result-value ${isDelayed ? 'orange' : 'green'}">${statusNote}</span></div>
      ${currentStation !== '—' ? `<div class="result-row"><span class="result-label">Current Station</span><span class="result-value">${currentStation}</span></div>` : ''}
      ${nextStation !== '—' ? `<div class="result-row"><span class="result-label">Next Station</span><span class="result-value orange">${nextStation}</span></div>` : ''}
      ${timelineHTML ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:0.72rem;font-weight:700;color:var(--text-light);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">STATION TIMELINE</div>${timelineHTML}</div>` : ''}
    </div>`;
  document.getElementById('pnr-results').classList.remove('hidden');
}

async function searchTrain() {
  const query = document.getElementById('train-search-input').value.trim();
  if (!query) { showToast('Enter train number or name', 'warning'); return; }
  showLoading('Searching train...');
  try {
    const resp = await fetch(`${API_BASE}/api/train-info/${query}`);
    const data = await resp.json();
    hideLoading();
    const d = validateApiResponse(data);
    renderTrainSchedule(d);
    showToast('Train info fetched!');
  } catch (err) {
    hideLoading();
    showToast(err.message || 'Could not find train.', 'warning');
  }
}

function renderTrainSchedule(d) {
  const info = d.trainInfo || {};
  const stations = (d.route || []).slice(0, 8);
  const stationsHTML = stations.map(s => `
    <div class="result-row"><span class="result-label">${s.stnName || s.stationName} (${s.stnCode || s.stationCode || ''})</span><span class="result-value" style="font-size:0.78rem">${s.arrival || '—'} / ${s.departure || '—'}</span></div>
  `).join('');
  document.getElementById('pnr-results').innerHTML = `
    <div class="result-header"><div class="result-train-name">${info.train_name || 'Train'} (${info.train_no || ''})</div><div class="result-train-num">${info.from_stn_name || ''} → ${info.to_stn_name || ''} · ${info.travel_time || ''}</div></div>
    <div class="result-body">
      <div class="result-row" style="background:#FFF3ED;border-radius:8px;padding:8px 12px;margin-bottom:4px;"><span class="result-label" style="font-size:0.7rem;font-weight:700">STATION</span><span class="result-label" style="font-size:0.7rem;font-weight:700">ARR / DEP</span></div>
      ${stationsHTML}
    </div>`;
  document.getElementById('pnr-results').classList.remove('hidden');
}

// ===== SHOP PAGE =====
function initShopPage() { renderProducts(PRODUCTS); updateTrainStrip(); updateCartFAB(); }

function updateTrainStrip() {
  const strip = document.getElementById('train-strip');
  if (appState.pnrData) {
    const d = appState.pnrData;
    const seat = d.passengerList && d.passengerList[0] ? d.passengerList[0].currentStatus : d.reservationClass || '—';
    document.getElementById('strip-train-name').textContent = `${d.trainName || 'Train'} #${d.trainNumber || ''}`;
    document.getElementById('strip-seat').textContent = `Seat: ${seat}`;
    strip.classList.remove('hidden');
  } else { strip.classList.add('hidden'); }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!products.length) {
    grid.innerHTML = `<div style="grid-column:span 2;text-align:center;padding:40px 0;color:var(--text-light)"><div style="font-size:2rem;margin-bottom:8px">🔍</div><div style="font-weight:600">No products found</div></div>`;
    return;
  }
  grid.innerHTML = products.map(p => {
    const inCart = appState.cart.find(c => c.id === p.id);
    const qty = inCart ? inCart.qty : 0;
    const discount = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    return `
      <div class="product-card" onclick="openProductModal(${p.id})">
        <div class="product-img-wrapper">
          <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='product_water.png'" />
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-rating"><span class="stars">★ ${p.rating}</span><span class="rating-num">(${p.reviews})</span></div>
          <div class="product-footer">
            <div>
              <span class="product-price">₹${p.price}</span>
              ${p.mrp > p.price ? `<span class="product-mrp">₹${p.mrp}</span>` : ''}
            </div>
            ${qty > 0
              ? `<div class="product-qty-control"><button class="product-qty-btn" onclick="event.stopPropagation();changeProductQty(${p.id},-1)">−</button><span class="product-qty-val">${qty}</span><button class="product-qty-btn" onclick="event.stopPropagation();changeProductQty(${p.id},1)">+</button></div>`
              : `<button class="add-btn" onclick="event.stopPropagation();addToCart(${p.id})">+</button>`}
          </div>
        </div>
      </div>`;
  }).join('');
}

function getStars(r) { return '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.floor(r) - (r % 1 >= 0.5 ? 1 : 0)); }

function filterCategory(cat, el) {
  appState.currentFilter = cat;
  document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  renderProducts(cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat));
}

function filterProducts(q) {
  appState.searchQuery = q.toLowerCase();
  renderProducts(PRODUCTS.filter(p => p.name.toLowerCase().includes(appState.searchQuery) || p.category.toLowerCase().includes(appState.searchQuery)));
}

function scrollToProducts() { document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' }); }
function focusSearch() { document.getElementById('product-search').focus(); }
function showNotif() { showToast('No new notifications', 'info'); }

// ===== COUPONS =====
function copyCoupon(code, btn) {
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    showToast(`Code ${code} copied!`);
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  }).catch(() => showToast('Failed to copy', 'error'));
}

function getCartTotals() {
  const subtotal = appState.cart.reduce((s, c) => s + c.price * c.qty, 0);
  let discount = 0;
  if (appState.appliedCoupon === 'RAILQUICK15') { discount = Math.min(Math.round(subtotal * 0.15), 50); }
  const gst = Math.round((subtotal - discount) * 0.05);
  return { subtotal, discount, gst, total: subtotal - discount + gst };
}

function applyPromoCode() {
  const input = document.getElementById('promo-input');
  const status = document.getElementById('promo-status');
  const code = (input?.value || '').trim().toUpperCase();
  if (!code) { showToast('Please enter a coupon code', 'warning'); return; }
  if (code === 'RAILQUICK15') {
    appState.appliedCoupon = code;
    status.textContent = 'Coupon applied: 15% OFF (Max ₹50)'; status.style.color = 'var(--success)'; status.style.display = 'block';
    showToast('Coupon applied successfully!'); updateCartSummary();
  } else if (code === 'FREEDEL') {
    appState.appliedCoupon = code;
    status.textContent = 'Free Delivery activated!'; status.style.color = 'var(--success)'; status.style.display = 'block';
    showToast('Coupon applied!'); updateCartSummary();
  } else {
    showToast('Invalid coupon code', 'error');
    status.textContent = 'Invalid coupon code'; status.style.color = 'var(--danger)'; status.style.display = 'block';
  }
}

// ===== CART =====
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = appState.cart.find(c => c.id === productId);
  if (existing) existing.qty++; else appState.cart.push({ ...product, qty: 1 });
  saveState(); updateCartFAB();
  showToast(`✓ ${product.name.split(' ').slice(0, 3).join(' ')} added!`);
  renderProducts(getFilteredProducts());
}

function changeProductQty(id, delta) {
  const item = appState.cart.find(c => c.id === id);
  if (!item) { if (delta > 0) addToCart(id); return; }
  item.qty += delta;
  if (item.qty <= 0) appState.cart = appState.cart.filter(c => c.id !== id);
  saveState(); updateCartFAB(); renderProducts(getFilteredProducts());
}

function getFilteredProducts() {
  let p = appState.currentFilter === 'all' ? PRODUCTS : PRODUCTS.filter(x => x.category === appState.currentFilter);
  if (appState.searchQuery) p = p.filter(x => x.name.toLowerCase().includes(appState.searchQuery));
  return p;
}

function updateCartFAB() {
  const fab = document.getElementById('cart-fab');
  const count = appState.cart.reduce((s, c) => s + c.qty, 0);
  const total = appState.cart.reduce((s, c) => s + c.price * c.qty, 0);
  if (count > 0 && appState.currentPage === 'page-shop') {
    fab.classList.remove('hidden');
    document.getElementById('cart-fab-count').textContent = count;
    document.getElementById('cart-fab-price').textContent = `₹${total}`;
  } else { fab.classList.add('hidden'); }
}

function initCartPage() {
  const cartList = document.getElementById('cart-items-list');
  const emptyEl = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');
  if (appState.cart.length === 0) {
    cartList.innerHTML = ''; emptyEl.classList.remove('hidden'); summary.style.display = 'none';
  } else {
    emptyEl.classList.add('hidden'); summary.style.display = 'flex'; renderCartItems(); updateCartSummary();
  }
  if (appState.pnrData) {
    const d = appState.pnrData;
    const seat = d.passengerList && d.passengerList[0] ? d.passengerList[0].currentStatus : d.reservationClass;
    document.getElementById('delivery-detail').textContent = `${d.trainName || 'Train'} · Seat: ${seat || '—'} · New Delhi (NDLS)`;
  }
}

function renderCartItems() {
  document.getElementById('cart-items-list').innerHTML = appState.cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.src='product_water.png'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} each</div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="updateCartItemQty(${item.id},-1)">−</button>
          <span class="cart-qty-val">${item.qty}</span>
          <button class="cart-qty-btn" onclick="updateCartItemQty(${item.id},1)">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <button class="cart-item-delete" onclick="removeCartItem(${item.id})">
          <svg class="icon-svg" viewBox="0 0 24 24" style="width:18px;height:18px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
        <div class="cart-item-total">₹${item.price * item.qty}</div>
      </div>
    </div>`).join('');
}

function updateCartItemQty(id, delta) {
  const item = appState.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) appState.cart = appState.cart.filter(c => c.id !== id);
  saveState(); initCartPage();
}

function removeCartItem(id) {
  appState.cart = appState.cart.filter(c => c.id !== id);
  saveState(); initCartPage(); updateCartFAB(); showToast('Item removed', 'info');
}

function clearCart() {
  if (!appState.cart.length) return;
  appState.cart = []; saveState(); initCartPage(); updateCartFAB();
}

function updateCartSummary() {
  if (!appState.cart.length) { appState.appliedCoupon = null; }
  const { subtotal, discount, gst, total } = getCartTotals();
  document.getElementById('summary-subtotal').textContent = `₹${subtotal}`;
  document.getElementById('summary-gst').textContent = `₹${gst}`;

  let discountRow = document.getElementById('summary-discount-row');
  if (!discountRow) {
    const summaryBlock = document.getElementById('cart-summary');
    discountRow = document.createElement('div');
    discountRow.id = 'summary-discount-row';
    discountRow.className = 'summary-row discount-row';
    discountRow.style.fontWeight = '600';
    discountRow.innerHTML = `<span>Discount</span><span id="summary-discount">-₹0</span>`;
    summaryBlock.insertBefore(discountRow, summaryBlock.querySelector('.summary-divider'));
  }
  if (discount > 0) { discountRow.style.display = 'flex'; document.getElementById('summary-discount').textContent = `-₹${discount}`; }
  else { discountRow.style.display = 'none'; }
  document.getElementById('summary-total').textContent = `₹${total}`;
}

function proceedToCheckout() {
  if (!appState.cart.length) { showToast('Cart is empty!', 'warning'); return; }
  if (!appState.user) { showToast('Please sign in first!', 'warning'); navigateTo('page-account'); return; }
  navigateTo('page-checkout');
}

// ===== CHECKOUT =====
function initCheckoutPage() {
  setCheckoutStep(1);
  const pnrCard = document.getElementById('checkout-pnr-details');
  const manualCard = document.getElementById('checkout-manual-details');
  if (appState.pnrData) {
    pnrCard.classList.remove('hidden'); manualCard.classList.add('hidden');
    const d = appState.pnrData;
    const seat = d.passengerList && d.passengerList[0] ? d.passengerList[0].currentStatus : d.reservationClass || '—';
    document.getElementById('checkout-train').textContent = `${d.trainName} (#${d.trainNumber})`;
    document.getElementById('checkout-seat').textContent = seat;
  } else { pnrCard.classList.add('hidden'); manualCard.classList.remove('hidden'); }
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
  document.getElementById('checkout-items-mini').innerHTML = appState.cart.map(item => `
    <div class="checkout-mini-item">
      <img class="mini-item-img" src="${item.img}" alt="${item.name}" onerror="this.src='product_water.png'" />
      <span class="mini-item-name">${item.name} × ${item.qty}</span>
      <span class="mini-item-price">₹${item.price * item.qty}</span>
    </div>`).join('');
}

function goToPayment() {
  const name = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  if (!name || !phone) { showToast('Please fill your name and phone', 'warning'); return; }
  if (!appState.pnrData) {
    const mt = document.getElementById('manual-train').value.trim();
    const mc = document.getElementById('manual-coach').value.trim();
    const ms = document.getElementById('manual-seat').value.trim();
    if (!mt || !mc || !ms) { showToast('Please enter Train, Coach, and Seat number', 'warning'); return; }
  }
  setCheckoutStep(2);
}

function setCheckoutStep(step) {
  document.getElementById('checkout-step-1').classList.toggle('hidden', step !== 1);
  document.getElementById('checkout-step-2').classList.toggle('hidden', step !== 2);
  document.getElementById('checkout-step-3').classList.toggle('hidden', step !== 3);
  [1, 2, 3].forEach(s => {
    const el = document.getElementById(`step-${s}`);
    el.classList.toggle('active', s === step);
    el.classList.toggle('done', s < step);
  });
  document.querySelectorAll('.step-line').forEach((line, i) => { line.classList.toggle('active', i < step - 1); });
}

function selectPayment(el, type) {
  appState.selectedPayment = type;
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('upi-input-section').style.display = type === 'upi' ? 'block' : 'none';
}

function selectUPIApp(el) {
  document.querySelectorAll('.upi-app').forEach(a => a.classList.remove('selected'));
  el.classList.add('selected');
  showToast(`${el.querySelector('.upi-app-name').textContent} selected`, 'info');
}

function placeOrder() {
  showLoading('Processing payment securely...');
  setTimeout(() => {
    hideLoading();
    const orderId = 'RQ-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    let seat = 'Your Seat', train = 'Train';
    if (appState.pnrData) {
      seat = appState.pnrData.passengerList?.[0]?.currentStatus || appState.pnrData.reservationClass || '—';
      train = appState.pnrData.trainName || 'Train';
    } else {
      const mt = document.getElementById('manual-train')?.value?.trim();
      const mc = document.getElementById('manual-coach')?.value?.trim()?.toUpperCase();
      const ms = document.getElementById('manual-seat')?.value?.trim();
      if (mt) train = mt;
      if (mc && ms) seat = `Coach ${mc}, Seat ${ms}`;
    }
    const { subtotal, discount, gst, total } = getCartTotals();
    appState.orders.unshift({ id: orderId, items: [...appState.cart], date: new Date().toLocaleDateString('en-IN'), status: 'preparing', subtotal, discount, gst, total, seat, train });
    appState.appliedCoupon = null; appState.cart = []; saveState(); updateCartFAB();
    document.getElementById('order-id-display').textContent = orderId;
    document.getElementById('success-seat').textContent = seat;
    setCheckoutStep(3);
    showToast('Order placed successfully! 🎉');
  }, 2500);
}

// ===== ORDERS =====
function initOrdersPage() {
  const list = document.getElementById('orders-list');
  const empty = document.getElementById('orders-empty');
  if (!appState.orders.length) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  list.innerHTML = appState.orders.map(order => {
    const statusLabel = { preparing: 'Preparing', 'in-transit': 'In Transit', delivered: 'Delivered' };
    const itemImgs = order.items.slice(0, 4).map(i => `<img class="order-item-thumb" src="${i.img}" alt="${i.name}" onerror="this.src='product_water.png'" />`).join('');
    return `
      <div class="order-card">
        <div class="order-card-header"><span class="order-id">${order.id}</span><span class="order-date">${order.date}</span></div>
        <div class="order-status ${order.status || 'preparing'}">${statusLabel[order.status] || 'Preparing'}</div>
        <div class="order-items-preview">${itemImgs}</div>
        <div style="font-size:0.78rem;color:var(--text-light);margin-bottom:8px;">${order.train || 'Train'} · Seat: ${order.seat || '—'}</div>
        <div class="order-footer">
          <div><div class="order-total-label">Total Paid</div><div class="order-total-val">₹${order.total}</div></div>
          <button class="order-track-btn" onclick="trackOrder('${order.id}')">Track Order</button>
        </div>
      </div>`;
  }).join('');
}

function trackOrder(id) { showToast(`Order ${id} is on the way! 🚂`, 'info'); }

// ===== ACCOUNT =====
function initAccountPage() {
  const logged = document.getElementById('account-logged-section');
  const login = document.getElementById('account-login-section');
  if (appState.user) {
    login.classList.add('hidden'); logged.classList.remove('hidden');
    document.getElementById('profile-name').textContent = appState.user.name || 'User';
    document.getElementById('profile-email').textContent = appState.user.email || '';
    document.getElementById('profile-avatar').textContent = (appState.user.name || 'U')[0].toUpperCase();
  } else { login.classList.remove('hidden'); logged.classList.add('hidden'); }
}

function googleSignIn() {
  showLoading('Signing in with Google...');
  setTimeout(() => {
    hideLoading();
    appState.user = { name: 'Kartik Guleria', email: 'kartik@gmail.com', phone: '+91 9876543210', avatar: 'K', provider: 'google', loginAt: new Date().toISOString() };
    saveState(); initAccountPage();
    showToast('Signed in successfully! 🎉');
  }, 1500);
}

function showPhoneLogin() { showToast('Phone login — coming soon!', 'info'); }

function signOut() {
  appState.user = null; saveState(); initAccountPage();
  showToast('Signed out', 'info');
}

// ===== PRODUCT MODAL =====
function openProductModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  appState.modalProduct = p; appState.modalQty = 1;
  document.getElementById('modal-img').src = p.img;
  document.getElementById('modal-img').onerror = () => { document.getElementById('modal-img').src = 'product_water.png'; };
  document.getElementById('modal-category').textContent = p.category.charAt(0).toUpperCase() + p.category.slice(1);
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-stars').textContent = getStars(p.rating);
  document.getElementById('modal-reviews').textContent = `(${p.reviews} reviews)`;
  document.getElementById('modal-price').innerHTML = p.mrp > p.price
    ? `₹${p.price} <span style="text-decoration:line-through;color:#9CA3AF;font-size:1rem;">₹${p.mrp}</span> <span style="color:var(--success);font-size:0.85rem;font-weight:600;">${Math.round((1 - p.price / p.mrp) * 100)}% off</span>`
    : `₹${p.price}`;
  document.getElementById('modal-desc').textContent = p.description;
  document.getElementById('modal-tags').innerHTML = p.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');
  document.getElementById('modal-qty').textContent = 1;
  document.getElementById('modal-total').textContent = `₹${p.price}`;
  document.getElementById('product-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
  document.body.style.overflow = '';
  appState.modalProduct = null;
}

function closeModal(event) { if (event.target === document.getElementById('product-modal')) closeProductModal(); }

function changeModalQty(delta) {
  appState.modalQty = Math.max(1, appState.modalQty + delta);
  document.getElementById('modal-qty').textContent = appState.modalQty;
  if (appState.modalProduct) document.getElementById('modal-total').textContent = `₹${appState.modalProduct.price * appState.modalQty}`;
}

function addToCartFromModal() {
  if (!appState.modalProduct) return;
  const id = appState.modalProduct.id, qty = appState.modalQty;
  const existing = appState.cart.find(c => c.id === id);
  if (existing) existing.qty += qty; else appState.cart.push({ ...appState.modalProduct, qty });
  saveState(); updateCartFAB(); closeProductModal();
  showToast(`✓ ${appState.modalProduct.name.split(' ').slice(0, 3).join(' ')} × ${qty} added!`);
  if (appState.currentPage === 'page-shop') renderProducts(getFilteredProducts());
}

// ===== TOAST =====
let toastTimeout;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimeout);
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const text = document.getElementById('toast-msg');
  const icons = { success: '✓', warning: '!', info: 'i', error: '✕' };
  icon.textContent = icons[type] || '✓';
  icon.style.background = type === 'warning' ? '#F59E0B' : type === 'error' ? '#EF4444' : type === 'info' ? '#3B82F6' : 'var(--success)';
  text.textContent = msg;
  toast.classList.remove('hidden');
  toastTimeout = setTimeout(() => { toast.classList.add('hidden'); }, 3000);
}

// ===== LOADING =====
function showLoading(text = 'Loading...') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-overlay').classList.remove('hidden');
}
function hideLoading() { document.getElementById('loading-overlay').classList.add('hidden'); }

// ===== DATE PICKER =====
function setDefaultDates() { document.querySelectorAll('input[type="date"]').forEach(input => { input.value = new Date().toISOString().slice(0, 10); }); }

function renderCustomDatePicker(containerId, inputId) {
  const container = document.getElementById(containerId);
  const hiddenInput = document.getElementById(inputId);
  if (!container || !hiddenInput) return;
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + i); return d; });
  const currentVal = hiddenInput.value || today.toISOString().slice(0, 10);
  container.innerHTML = dates.map((date, i) => {
    const dateStr = date.toISOString().slice(0, 10);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short' });
    return `<div class="date-item ${dateStr === currentVal ? 'selected' : ''}" onclick="selectCustomDate('${containerId}','${inputId}','${dateStr}',this)">
      <span class="date-day">${dayName}</span><span class="date-num">${date.getDate()}</span><span class="date-day" style="font-size:0.62rem;margin-top:2px;">${date.toLocaleDateString('en-IN', { month: 'short' })}</span>
    </div>`;
  }).join('') + `<div class="date-item" onclick="triggerNativeDatePicker('${inputId}')"><span class="date-day">Other</span><span class="date-num">📅</span><span class="date-day" style="font-size:0.62rem;margin-top:2px;">Calendar</span></div>`;
}

function selectCustomDate(cId, iId, dateStr, el) {
  const c = document.getElementById(cId); const h = document.getElementById(iId);
  if (!c || !h) return;
  c.querySelectorAll('.date-item').forEach(i => i.classList.remove('selected'));
  if (el) el.classList.add('selected');
  h.value = dateStr;
}

function triggerNativeDatePicker(inputId) {
  const h = document.getElementById(inputId); if (!h) return;
  h.style.display = 'block'; h.focus(); h.click();
  h.onchange = () => { h.style.display = 'none'; const cId = inputId === 'train-date-input' ? 'search-date-selector' : 'live-date-selector'; renderCustomDatePicker(cId, inputId); };
}

// ===== GESTURES =====
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
  if (dx > 80 && dy < 40 && touchStartX < 60) {
    const backMap = { 'page-pnr': 'page-splash', 'page-shop': 'page-pnr', 'page-cart': 'page-shop', 'page-checkout': 'page-cart', 'page-orders': 'page-shop', 'page-account': 'page-shop' };
    const back = backMap[appState.currentPage];
    if (back) navigateTo(back);
  }
}, { passive: true });

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setDefaultDates();
  renderCustomDatePicker('search-date-selector', 'train-date-input');
  renderCustomDatePicker('live-date-selector', 'live-date-input');
  document.getElementById('page-splash').classList.add('active');
  appState.currentPage = 'page-splash';
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';
  if (appState.user) initAccountPage();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProductModal(); });
  const fab = document.getElementById('cart-fab');
  if (fab) {
    fab.addEventListener('mouseenter', () => { fab.style.transform = 'translateX(-50%) scale(1.06)'; });
    fab.addEventListener('mouseleave', () => { fab.style.transform = 'translateX(-50%) scale(1)'; });
  }
});
