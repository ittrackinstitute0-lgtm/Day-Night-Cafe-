/**
 * Day&Night Cafe - Supabase Backend Integration Client
 * Handles connection, real-time database sync, and fallback caching.
 */

// Fallback seed items shown when Supabase credentials are not configured yet
const DEFAULT_MENU_ITEMS = [
  {
    id: 1,
    name: 'Golden Amber Cappuccino',
    category: 'coffee',
    time_mood: 'day',
    price: 550,
    description: 'Velvety espresso paired with steamed oat milk, dusted with organic Ceylon cinnamon and edible gold flake.',
    image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    is_featured: true
  },
  {
    id: 2,
    name: 'Midnight Roast Cold Brew',
    category: 'coffee',
    time_mood: 'both',
    price: 620,
    description: '18-hour cold steeped single-origin Ethiopian beans infused with vanilla bean and hints of dark cocoa.',
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    is_featured: true
  },
  {
    id: 3,
    name: 'Pistachio Rose Croissant',
    category: 'bakery',
    time_mood: 'day',
    price: 480,
    description: 'Flaky double-baked French butter croissant filled with pistachio creme and crushed Turkish rose petals.',
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    is_featured: true
  },
  {
    id: 4,
    name: 'Avocado Tartine & Poached Egg',
    category: 'bakery',
    time_mood: 'day',
    price: 750,
    description: 'Toasted artisan sourdough, hass avocado mousse, heirloom tomatoes, and soft organic poached egg.',
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    is_featured: false
  },
  {
    id: 5,
    name: 'Matcha Velvet Latte',
    category: 'coffee',
    time_mood: 'day',
    price: 580,
    description: 'Ceremonial grade Uji matcha whisked with warm almond milk, lightly sweetened with pure agave.',
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    is_featured: false
  },
  {
    id: 6,
    name: 'Twilight Blueberry Mocktail',
    category: 'night_sips',
    time_mood: 'night',
    price: 680,
    description: 'Smoked butterfly pea flower tea, wild blueberries, fresh mint, and sparkling botanical tonic over crystal ice.',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    is_featured: true
  },
  {
    id: 7,
    name: 'Smoked Truffle Flatbread',
    category: 'bites',
    time_mood: 'night',
    price: 1150,
    description: 'Wood-fired sourdough crust with wild portobello mushrooms, black truffle oil, caramelized onions & fresh mozzarella.',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    is_featured: true
  },
  {
    id: 8,
    name: 'Midnight Ember Espresso Tonic',
    category: 'night_sips',
    time_mood: 'night',
    price: 650,
    description: 'Spiced espresso float over citrus botanical tonic water with charred rosemary garnish.',
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    is_featured: false
  },
  {
    id: 9,
    name: 'Gourmet Saffron Sliders',
    category: 'bites',
    time_mood: 'night',
    price: 1250,
    description: 'Wagyu-style smashed patties with saffron aioli, cheddar melt and microgreens on toasted brioche buns.',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    is_featured: true
  },
  {
    id: 10,
    name: 'Dark Galaxy Lava Cake',
    category: 'dessert',
    time_mood: 'both',
    price: 820,
    description: 'Warm molten Belgian dark chocolate cake served with Madagascar vanilla gelato and berry compote.',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    is_featured: true
  },
  {
    id: 11,
    name: 'Lotus Biscoff Dream Cheesecake',
    category: 'dessert',
    time_mood: 'both',
    price: 780,
    description: 'Silky baked New York cheesecake topped with caramelized Lotus spread and crunchy biscuit crumbles.',
    image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    is_featured: false
  }
];

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  // Load configuration from localStorage or default settings
  getConfig() {
    const url = localStorage.getItem('daynight_supabase_url') || '';
    const key = localStorage.getItem('daynight_supabase_key') || '';
    return { url, key };
  }

  saveConfig(url, key) {
    if (url) localStorage.setItem('daynight_supabase_url', url.trim());
    else localStorage.removeItem('daynight_supabase_url');

    if (key) localStorage.setItem('daynight_supabase_key', key.trim());
    else localStorage.removeItem('daynight_supabase_key');

    this.init();
  }

  init() {
    const { url, key } = this.getConfig();
    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isConnected = true;
        console.log('⚡ Supabase Client Initialized with custom credentials.');
      } catch (err) {
        console.error('Error creating Supabase client:', err);
        this.client = null;
        this.isConnected = false;
      }
    } else {
      this.client = null;
      this.isConnected = false;
    }
  }

  // Test current connection
  async testConnection() {
    if (!this.client) {
      return { success: false, message: 'Supabase URL ya Anon Key mojood nahi hai.' };
    }
    try {
      const { data, error } = await this.client
        .from('menu_items')
        .select('id')
        .limit(1);

      if (error) throw error;
      return { success: true, message: 'Supabase backend se kamyabi se connect ho gaya!' };
    } catch (err) {
      console.warn('Supabase test ping failed:', err);
      return { 
        success: false, 
        message: err.message || 'Supabase connect nahi ho saka. Barah-e-karam URL aur Key check karein aur SQL schema run karein.' 
      };
    }
  }

  // Fetch menu items from Supabase or fallback to defaults
  async getMenuItems() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('menu_items')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.warn('Supabase query error, using local fallback:', error.message);
          return { items: this.getLocalCustomItems(), source: 'local' };
        }

        if (data && data.length > 0) {
          return { items: data, source: 'supabase' };
        } else {
          // If table exists but is empty, try to seed or return default items
          console.log('Table is empty. Returning default starter items.');
          return { items: this.getLocalCustomItems(), source: 'local_empty_db' };
        }
      } catch (err) {
        console.warn('Network error reaching Supabase:', err);
        return { items: this.getLocalCustomItems(), source: 'local' };
      }
    }

    return { items: this.getLocalCustomItems(), source: 'local' };
  }

  // Local storage custom items support so user can add items even without Supabase!
  getLocalCustomItems() {
    const localSaved = localStorage.getItem('daynight_custom_items');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...DEFAULT_MENU_ITEMS, ...parsed];
        }
      } catch (e) {
        console.error('Failed to parse local custom items:', e);
      }
    }
    return DEFAULT_MENU_ITEMS;
  }

  // Add new menu item (inserts into Supabase if configured, also saves to local storage)
  async addMenuItem(itemData) {
    const cleanItem = {
      name: itemData.name,
      category: itemData.category || 'coffee',
      time_mood: itemData.time_mood || 'both',
      price: parseFloat(itemData.price) || 0,
      description: itemData.description || '',
      image_url: itemData.image_url || 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80',
      rating: parseFloat(itemData.rating) || 5.0,
      is_featured: !!itemData.is_featured
    };

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('menu_items')
          .insert([cleanItem])
          .select();

        if (error) throw error;
        return { success: true, item: data[0], source: 'supabase' };
      } catch (err) {
        console.error('Error inserting item to Supabase:', err);
        // Fallback save to local storage
        this.saveItemToLocal(cleanItem);
        return { 
          success: true, 
          item: cleanItem, 
          source: 'local_fallback', 
          warning: 'Supabase insert fail hui (' + err.message + '), item local storage mein save ho gaya.' 
        };
      }
    } else {
      this.saveItemToLocal(cleanItem);
      return { success: true, item: cleanItem, source: 'local' };
    }
  }

  saveItemToLocal(item) {
    const localSaved = localStorage.getItem('daynight_custom_items');
    let items = [];
    if (localSaved) {
      try { items = JSON.parse(localSaved); } catch (e) { items = []; }
    }
    item.id = Date.now();
    items.unshift(item);
    localStorage.setItem('daynight_custom_items', JSON.stringify(items));
  }

  // Submit Reservation
  async submitReservation(reservationData) {
    const cleanData = {
      customer_name: reservationData.customer_name,
      phone: reservationData.phone,
      email: reservationData.email || '',
      guests: parseInt(reservationData.guests, 10) || 2,
      reservation_date: reservationData.reservation_date,
      reservation_time: reservationData.reservation_time,
      mood_preference: reservationData.mood_preference || 'both',
      special_request: reservationData.special_request || ''
    };

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('reservations')
          .insert([cleanData])
          .select();

        if (error) throw error;
        return { success: true, data: data[0], source: 'supabase' };
      } catch (err) {
        console.error('Supabase reservation error:', err);
        this.saveReservationLocal(cleanData);
        return { 
          success: true, 
          data: cleanData, 
          source: 'local_fallback',
          warning: 'Supabase table connect nahi hui lekin reservation browser mein save ho gai!' 
        };
      }
    } else {
      this.saveReservationLocal(cleanData);
      return { success: true, data: cleanData, source: 'local' };
    }
  }

  saveReservationLocal(res) {
    const saved = localStorage.getItem('daynight_reservations');
    let list = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) { list = []; }
    }
    res.id = Date.now();
    res.created_at = new Date().toISOString();
    list.unshift(res);
    localStorage.setItem('daynight_reservations', JSON.stringify(list));
  }
}

// Global instance
window.cafeSupabase = new SupabaseService();
