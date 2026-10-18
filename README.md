# ☕🌙 Day&Night Cafe — Aesthetic Website & Supabase Backend

Day&Night Cafe aik luxury, aesthetic aur modern website hai jo **HTML5**, **CSS3**, aur **JavaScript** mein design ki gayi hai aur **Supabase Database Backend** ke sath fully connected hai.

---

## ✨ Features (Khasusiyaat)

1. **Aesthetic & Luxury Design:**
   - Cinematic fonts (`Playfair Display`, `Cormorant Garamond`, `Plus Jakarta Sans`).
   - Ambient glowing background lighting aur Glassmorphism effect.
   - Fully responsive for mobile, tablet, aur desktop.

2. **Dual Atmosphere (Day & Night Mode Switcher):**
   - ☀️ **Day Shift (Morning Glow):** Warm amber & cream tones, specialty brews, fresh croissants, and brunch focus.
   - 🌙 **Night Shift (Twilight Lounge):** Moody obsidian velvet theme, ambient jazz vibes, botanical mocktails, truffle flatbreads, and late-night desserts.
   - One-click toggle button navbar aur hero section mein.

3. **Curated Menu Items & Filtering:**
   - Categories: **Specialty Coffee ☕**, **Artisan Bakery 🥐**, **Night Sips 🍸**, **Gourmet Bites 🍕**, **Sweet Cravings 🍰**.
   - Real-time search filter and category pills.
   - Prices in PKR (Rs.) with ratings, mood tags, and pictures.

4. **Live Supabase Backend Integration:**
   - **`menu_items` Table:** Menu items ko live database se fetch karta hai.
   - **`reservations` Table:** Online table reservation form jo customer ka data sidha Supabase database mein save karta hai.
   - **Direct "Add New Item" Modal:** Naye menu items ko image URL, price, category, aur Day/Night mood ke sath direct Supabase mein add karne ki sahulat.
   - **Smart Fallback:** Agar Supabase abhi configure na bhi ho, tab bhi website 100% aesthetic demo items aur local storage ke sath smoothly chalti hai!

5. **Shopping & Order Cart Drawer:**
   - Add to Cart, quantity increment/decrement, and subtotal calculation with order confirmation toast notification.

---

## 🚀 Supabase Backend Kaise Connect Karein (Step-by-Step Guide)

Aapka Supabase backend connect karna intehai aasan hai:

### Step 1: Supabase Free Project Banayein
1. [supabase.com](https://supabase.com) par jayein aur **Sign In** ya **Sign Up** karein (Free account).
2. **"New Project"** par click karein aur project ka naam (jaise: `daynight-cafe`) aur database password set karein.

### Step 2: Database Tables Create Karein (SQL Run Karein)
1. Supabase Dashboard mein baen (left) taraf **SQL Editor** par click karein.
2. **"New query"** par click karein.
3. Is folder mein mojood file [`supabase_schema.sql`](file:///c:/Users/Admin/Desktop/Day&Night%20Cafe/supabase_schema.sql) ka saara code copy karein aur SQL Editor mein paste karke **"Run"** daba dein.
   *(Is se `menu_items` aur `reservations` tables ban jayengi aur demo items bhi automatically insert ho jayenge).*

### Step 3: Project URL aur Anon Key Hasil Karein
1. Supabase Dashboard mein neechay baen taraf **Settings (⚙️ Gear Icon)** ➔ **API** par jayein.
2. Wahan se:
   - **Project URL** copy karein (maslan: `https://xyzcompany.supabase.co`)
   - **Project API keys** ke andar se **`anon public`** key copy karein.

### Step 4: Website Mein Paste Karein
1. Apni website [`index.html`](file:///c:/Users/Admin/Desktop/Day&Night%20Cafe/index.html) ko browser mein open karein (double click karein).
2. Navbar mein mojood **"Demo Mode (Click to Connect)"** ya hero section ke **"Supabase Setup"** button par click karein.
3. Apna **Project URL** aur **Anon Key** paste karein aur **"Test Connection"** daba kar check karein.
4. **"Save & Connect"** par click kar dein!
5. Navbar ka dot green 🟢 ho jayega aur aapka backend live connect ho jayega!

---

## 📁 File Structure

```text
Day&Night Cafe/
├── index.html            # Main website structure & UI layout
├── style.css             # Aesthetic styling, animations & Day/Night themes
├── app.js                # Frontend interactive logic, cart, & menu handlers
├── supabase-client.js    # Supabase backend SDK integration & CRUD methods
├── supabase_schema.sql   # Ready-to-run SQL schema for Supabase tables
└── README.md             # Complete guide & documentation
```

---

## 💻 Kaise Open Karein?

Aap directly `index.html` file par double click karke kisi bhi browser (Chrome, Edge, Firefox) mein open kar sakte hain!
