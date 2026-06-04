# 💌 LOVER TAG — Setup Guide

A full-stack React app where couples get a personalized love page with a timer, gallery, quiz, and QR card. Powered by Supabase + PayMongo.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to https://app.supabase.com → Your project
2. Open **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase_schema.sql` and click **Run**
4. This creates the `lover_tags` table + storage bucket + policies

### 3. Configure API Keys

**Supabase** — already set in `src/lib/supabase.js`:
```js
const SUPABASE_URL = 'https://ffuumzbezfxmfusphbgy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

**PayMongo** — edit `src/lib/paymongo.js`:
```js
// Get from: https://dashboard.paymongo.com → Developers → API Keys
const PAYMONGO_PUBLIC_KEY = 'pk_live_YOUR_KEY_HERE';
```

**Admin Password** — edit `src/pages/AdminPage.jsx`:
```js
const ADMIN_PW = 'your_strong_admin_password';
```

### 4. Run locally
```bash
npm start
```
App runs at: http://localhost:3000

---

## 📦 Deploy to Vercel (Free)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → Import Project → pick your repo
3. Click Deploy — done! 🎉

Your app will be live at: `https://your-app.vercel.app`

---

## 🗺️ Pages & Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/signup` | Signup page |
| `/dashboard` | User's love tags list |
| `/create` | 3-step form to create a tag |
| `/pay/:tagId` | Paywall — GCash or Contact Admin |
| `/tag/:slug` | Public lover tag page (with lover pass wall) |
| `/admin` | Admin panel to approve pending payments |

---

## 💳 Payment Flow

### GCash (Automatic via PayMongo)
1. User clicks "Pay via GCash"
2. App creates a PayMongo payment link
3. User is redirected to GCash checkout
4. After payment, PayMongo redirects back
5. Tag is activated automatically

> ⚠️ For full automatic activation, you need a PayMongo **webhook** or **Edge Function**.
> The current setup saves the reference number. You can manually check via the admin panel.

### Contact Admin (Manual)
1. User clicks "Contact Admin"
2. Status set to `pending_admin`
3. User messages you on Facebook
4. User pays you directly
5. You go to `/admin` and click **Approve** ✓
6. Tag is set to `active: true` and `payment_status: 'paid'`

---

## 🔐 Admin Panel

URL: `https://your-app.vercel.app/admin`

Password is set in `src/pages/AdminPage.jsx`:
```js
const ADMIN_PW = 'lovertag_admin_2024'; // CHANGE THIS!
```

From there you can:
- See all pending payments
- Approve or revoke tags
- View any tag

---

## 📁 Project Structure

```
src/
├── lib/
│   ├── supabase.js      ← Supabase client
│   └── paymongo.js      ← PayMongo payment helper
├── hooks/
│   └── useAuth.jsx      ← Auth context
├── components/
│   ├── PetalBg.jsx      ← Floating petals animation
│   └── LoverCard.jsx    ← Digital card + QR code
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── CreateTagPage.jsx  ← 3-step form
│   ├── PaywallPage.jsx    ← Payment screen
│   ├── TagViewPage.jsx    ← Public lover tag page
│   └── AdminPage.jsx      ← Admin approval panel
├── App.jsx               ← Router
├── index.css             ← Global styles
└── index.js              ← Entry point
```

---

## 🎨 Customization

- **Colors** — Edit CSS variables in `src/index.css` (`:root` block)
- **Fonts** — Change Google Fonts import in `index.css`
- **Admin FB Link** — Search for `facebook.com/kenedrian.bucog.5` and replace
- **Price** — Change `AMOUNT = 10000` in `paymongo.js` (in centavos; 10000 = ₱100)

---

Made with ♥ by Ken
