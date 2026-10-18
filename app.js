/**
 * Day&Night Cafe - Main Interactive Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let menuItems = [];
  let cart = [];
  let currentCategory = 'all';
  let searchQuery = '';

  // DOM Elements
  const menuGrid = document.getElementById('menuGrid');
  const categoryPills = document.querySelectorAll('.filter-pill');
  const searchInput = document.getElementById('menuSearchInput');
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalAmount = document.getElementById('cartTotalAmount');
  const cartBadge = document.getElementById('cartBadge');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Theme Switcher
  const themeSwitchBtn = document.getElementById('themeSwitchBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  // Supabase Pill & Modals
  const supabasePill = document.getElementById('supabasePill');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  // Settings Modal
  const supabaseModal = document.getElementById('supabaseModal');
  const openSupabaseSettingsBtn = document.getElementById('openSupabaseSettingsBtn');
  const closeSupabaseModalBtn = document.getElementById('closeSupabaseModalBtn');
  const saveSupabaseConfigBtn = document.getElementById('saveSupabaseConfigBtn');
  const testSupabaseBtn = document.getElementById('testSupabaseBtn');
  const supabaseUrlInput = document.getElementById('supabaseUrlInput');
  const supabaseKeyInput = document.getElementById('supabaseKeyInput');
  const testStatusMsg = document.getElementById('testStatusMsg');
  const copySqlBtn = document.getElementById('copySqlBtn');

  // Add Item Modal
  const addItemBtn = document.getElementById('addItemBtn');
  const addItemModal = document.getElementById('addItemModal');
  const closeAddItemModalBtn = document.getElementById('closeAddItemModalBtn');
  const addItemForm = document.getElementById('addItemForm');

  // Reservation Form
  const reservationForm = document.getElementById('reservationForm');

  // =========================================================
  // THEME MANAGEMENT (DAY / NIGHT)
  // =========================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('daynight_theme') || 'night';
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('daynight_theme', theme);

    if (theme === 'day') {
      themeIcon.className = 'fa-solid fa-sun';
      themeLabel.textContent = 'Day Mode';
      themeSwitchBtn.style.borderColor = '#E28743';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      themeLabel.textContent = 'Night Mode';
      themeSwitchBtn.style.borderColor = 'rgba(212, 175, 55, 0.4)';
    }
  }

  themeSwitchBtn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'night';
    const next = current === 'night' ? 'day' : 'night';
    applyTheme(next);
    showToast(`Switched to ${next === 'day' ? '☀️ Morning Glow (Day Mode)' : '🌙 Midnight Lounge (Night Mode)'}`);
  });

  // =========================================================
  // SUPABASE STATUS & CONFIGURATION
  // =========================================================
  async function updateSupabaseStatus() {
    const { url, key } = window.cafeSupabase.getConfig();
    if (supabaseUrlInput) supabaseUrlInput.value = url || '';
    if (supabaseKeyInput) supabaseKeyInput.value = key || '';

    if (!url || !key) {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Demo Mode (Click to Connect)';
      return;
    }

    statusDot.className = 'status-dot connected';
    statusText.textContent = 'Supabase Connected ⚡';
  }

  // Open Supabase Settings Modal
  supabasePill?.addEventListener('click', () => {
    supabaseModal.classList.add('active');
  });

  openSupabaseSettingsBtn?.addEventListener('click', () => {
    supabaseModal.classList.add('active');
  });

  closeSupabaseModalBtn?.addEventListener('click', () => {
    supabaseModal.classList.remove('active');
  });

  // Save Supabase Settings
  saveSupabaseConfigBtn?.addEventListener('click', async () => {
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();

    window.cafeSupabase.saveConfig(url, key);
    showToast('Supabase settings update ho gayi hain!', 'success');
    await updateSupabaseStatus();
    loadMenuItems();
    supabaseModal.classList.remove('active');
  });

  // Test Supabase Connection
  testSupabaseBtn?.addEventListener('click', async () => {
    testStatusMsg.textContent = 'Testing connection...';
    testStatusMsg.style.color = '#F3CA65';

    // Temporarily apply input values for test
    const tempUrl = supabaseUrlInput.value.trim();
    const tempKey = supabaseKeyInput.value.trim();

    if (!tempUrl || !tempKey) {
      testStatusMsg.textContent = 'Barah-e-karam URL aur Anon Key dono darj karein.';
      testStatusMsg.style.color = '#EF4444';
      return;
    }

    window.cafeSupabase.saveConfig(tempUrl, tempKey);
    const result = await window.cafeSupabase.testConnection();

    if (result.success) {
      testStatusMsg.textContent = '✅ ' + result.message;
      testStatusMsg.style.color = '#10B981';
      showToast('Supabase Connection Kamyab!', 'success');
      updateSupabaseStatus();
    } else {
      testStatusMsg.textContent = '❌ ' + result.message;
      testStatusMsg.style.color = '#EF4444';
      showToast('Connection failed: Check URL, key, or SQL schema', 'error');
    }
  });

  // Copy SQL Schema
  copySqlBtn?.addEventListener('click', () => {
    const sqlText = `-- Create menu_items and reservations table in Supabase SQL editor:
create table if not exists public.menu_items (
    id bigint generated by default as identity primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    category text not null,
    time_mood text default 'both',
    price numeric not null,
    description text,
    image_url text,
    rating numeric default 4.9,
    is_featured boolean default false
);

create table if not exists public.reservations (
    id bigint generated by default as identity primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    customer_name text not null,
    phone text not null,
    email text,
    guests integer not null default 2,
    reservation_date date not null,
    reservation_time text not null,
    mood_preference text default 'both',
    special_request text
);

alter table public.menu_items enable row level security;
alter table public.reservations enable row level security;

create policy "Allow public read on menu_items" on public.menu_items for select using (true);
create policy "Allow public insert on menu_items" on public.menu_items for insert with check (true);
create policy "Allow public update on menu_items" on public.menu_items for update using (true);
create policy "Allow public delete on menu_items" on public.menu_items for delete using (true);

create policy "Allow public insert on reservations" on public.reservations for insert with check (true);
create policy "Allow public read on reservations" on public.reservations for select using (true);`;

    navigator.clipboard.writeText(sqlText).then(() => {
      showToast('SQL Schema clipboard pr copy ho gaya!', 'success');
    }).catch(() => {
      showToast('Clipboard access unavailable, please copy manually', 'error');
    });
  });

  // =========================================================
  // LOAD & RENDER MENU ITEMS
  // =========================================================
  async function loadMenuItems() {
    menuGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.2rem; color: var(--gold-primary);"></i>
        <p style="margin-top: 1rem; color: var(--text-muted);">Curating Day&Night aesthetic menu...</p>
      </div>
    `;

    const result = await window.cafeSupabase.getMenuItems();
    menuItems = result.items || [];
    renderMenu();
  }

  function renderMenu() {
    let filtered = menuItems;

    // Filter by Category
    if (currentCategory !== 'all') {
      filtered = filtered.filter(item => item.category === currentCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      menuGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
          <i class="fa-solid fa-mug-hot" style="font-size: 3rem; color: var(--text-subtle); margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No items found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Is category ya search term mein koi item nahi mila.</p>
          <button class="btn-primary" onclick="window.clearMenuFilter()">Tamam Items Dekhein</button>
        </div>
      `;
      return;
    }

    menuGrid.innerHTML = filtered.map(item => {
      const moodClass = item.time_mood === 'day' ? 'mood-day' : (item.time_mood === 'night' ? 'mood-night' : 'mood-both');
      const moodLabel = item.time_mood === 'day' ? '☀️ Day Mood' : (item.time_mood === 'night' ? '🌙 Night Lounge' : '✨ Day & Night');

      return `
        <div class="menu-card" data-id="${item.id}">
          <div class="card-img-box">
            <img src="${item.image_url || 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80'">
            <span class="card-mood-tag ${moodClass}">${moodLabel}</span>
          </div>
          <div class="card-content">
            <div class="card-meta">
              <span class="card-category">${formatCategoryName(item.category)}</span>
              <span class="card-rating"><i class="fa-solid fa-star"></i> ${item.rating || 4.9}</span>
            </div>
            <h4 class="card-title">${escapeHtml(item.name)}</h4>
            <p class="card-desc">${escapeHtml(item.description || 'Artisan blend crafted specially for Day&Night cafe guests.')}</p>
            <div class="card-footer">
              <div class="card-price">
                <span class="card-currency">Rs.</span>${item.price}
              </div>
              <button class="btn-add-to-cart" data-action="addToCart" data-id="${item.id}">
                <i class="fa-solid fa-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener for "Add to Cart"
    menuGrid.querySelectorAll('[data-action="addToCart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10) || e.currentTarget.getAttribute('data-id');
        const item = menuItems.find(i => i.id == id);
        if (item) addToCart(item);
      });
    });
  }

  window.clearMenuFilter = () => {
    currentCategory = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    categoryPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === 'all'));
    renderMenu();
  };

  function formatCategoryName(cat) {
    switch (cat) {
      case 'coffee': return 'Specialty Coffee';
      case 'bakery': return 'Artisan Bakery';
      case 'night_sips': return 'Night Sips & Mocktails';
      case 'bites': return 'Gourmet Bites';
      case 'dessert': return 'Sweet Cravings';
      default: return cat;
    }
  }

  // Filter Categories
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      renderMenu();
    });
  });

  // Search Input
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderMenu();
  });

  // =========================================================
  // ADD NEW ITEM MODAL & SUPABASE INSERT
  // =========================================================
  addItemBtn?.addEventListener('click', () => {
    addItemModal.classList.add('active');
  });

  closeAddItemModalBtn?.addEventListener('click', () => {
    addItemModal.classList.remove('active');
  });

  addItemForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = addItemForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;

    const newItemData = {
      name: document.getElementById('newItemName').value.trim(),
      category: document.getElementById('newItemCategory').value,
      time_mood: document.getElementById('newItemMood').value,
      price: parseFloat(document.getElementById('newItemPrice').value),
      description: document.getElementById('newItemDesc').value.trim(),
      image_url: document.getElementById('newItemImage').value.trim() || 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80',
      rating: parseFloat(document.getElementById('newItemRating').value) || 5.0,
      is_featured: false
    };

    const res = await window.cafeSupabase.addMenuItem(newItemData);

    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    if (res.success) {
      showToast(`✨ "${newItemData.name}" kamyabi se add ho gaya!`, 'success');
      addItemForm.reset();
      addItemModal.classList.remove('active');
      await loadMenuItems();
    } else {
      showToast('Item add karne mein masla hua.', 'error');
    }
  });

  // =========================================================
  // TABLE RESERVATION LOGIC
  // =========================================================
  reservationForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming...';
    submitBtn.disabled = true;

    const reservationData = {
      customer_name: document.getElementById('resName').value.trim(),
      phone: document.getElementById('resPhone').value.trim(),
      email: document.getElementById('resEmail').value.trim(),
      guests: document.getElementById('resGuests').value,
      reservation_date: document.getElementById('resDate').value,
      reservation_time: document.getElementById('resTime').value,
      mood_preference: document.getElementById('resMood').value,
      special_request: document.getElementById('resNotes').value.trim()
    };

    const result = await window.cafeSupabase.submitReservation(reservationData);

    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    if (result.success) {
      showToast(`🎉 Reservation confirmed for ${reservationData.customer_name}!`, 'success');
      reservationForm.reset();
    } else {
      showToast('Reservation submit karne mein masla hua.', 'error');
    }
  });

  // Set default reservation date to today
  const resDateInput = document.getElementById('resDate');
  if (resDateInput) {
    const today = new Date().toISOString().split('T')[0];
    resDateInput.value = today;
    resDateInput.min = today;
  }

  // =========================================================
  // CART DRAWER & ORDER LOGIC
  // =========================================================
  function addToCart(item) {
    const existing = cart.find(c => c.id == item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    showToast(`🛒 "${item.name}" order list mein add ho gaya!`);
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadge.textContent = totalCount;
    cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-bag-shopping" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--text-subtle);"></i>
          <p>Aapka order cart khali hai.</p>
        </div>
      `;
      cartTotalAmount.textContent = 'Rs. 0';
      return;
    }

    let total = 0;
    cartItemsList.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      return `
        <div class="cart-item">
          <img src="${item.image_url || 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(item.name)}">
          <div class="cart-item-details">
            <h5 class="cart-item-name">${escapeHtml(item.name)}</h5>
            <div class="cart-item-price">Rs. ${item.price}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="window.modifyQty('${item.id}', -1)">-</button>
              <span style="font-size: 0.9rem; font-weight: 600;">${item.qty}</span>
              <button class="qty-btn" onclick="window.modifyQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <div style="font-weight: 700; color: var(--gold-primary); font-size: 0.95rem;">
            Rs. ${itemTotal}
          </div>
        </div>
      `;
    }).join('');

    cartTotalAmount.textContent = `Rs. ${total}`;
  }

  window.modifyQty = (id, delta) => {
    const item = cart.find(c => c.id == id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(c => c.id != id);
    }
    updateCartUI();
  };

  cartBtn?.addEventListener('click', () => {
    cartDrawer.classList.add('active');
    cartDrawerOverlay.classList.add('active');
  });

  const closeCart = () => {
    cartDrawer.classList.remove('active');
    cartDrawerOverlay.classList.remove('active');
  };

  closeCartBtn?.addEventListener('click', closeCart);
  cartDrawerOverlay?.addEventListener('click', closeCart);

  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Aapka cart khali hai!', 'error');
      return;
    }
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    showToast(`Order Placed! Total: Rs. ${total}. Cafe staff is preparing your delicious treats!`, 'success');
    cart = [];
    updateCartUI();
    closeCart();
  });

  // Close modals when clicking outside
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Helper Escape HTML
  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  window.showToast = showToast;

  // Initialize
  initTheme();
  updateSupabaseStatus();
  loadMenuItems();
});
