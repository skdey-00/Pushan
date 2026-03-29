# 🚀 SETUP & DEPLOYMENT GUIDE

## Phase 7: Web Dashboard Complete Setup

This guide will walk you through setting up and deploying the Next.js dashboard for your Adaptive Traffic Signal System.

---

## 📋 PREREQUISITES CHECKLIST

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download here](https://nodejs.org/))
- [ ] **npm** or **yarn** package manager
- [ ] **Supabase project** created (from Phase 5)
- [ ] **Flask backend** running on laptop (from Phase 5)
- [ ] **Git** installed (for Vercel deployment)
- [ ] **GitHub account** (for Vercel deployment)

---

## 🔧 LOCAL SETUP

### Step 1: Install Dependencies

```bash
cd Pushan-main/web
npm install
```

### Step 2: Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit with your values
nano .env.local
```

**Fill in your credentials:**

```env
# Supabase (from Phase 5)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# Flask Backend (your laptop's IP or localhost)
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
```

**Where to find these values:**

1. **Supabase URL & Key:**
   - Go to [supabase.com](https://supabase.com)
   - Select your project
   - Go to Settings → API
   - Copy "Project URL" and "anon public key"

2. **Flask API URL:**
   - Local testing: `http://localhost:5000`
   - From another device: `http://YOUR-LAPTOP-IP:5000`
   - Deployed: Your ngrok/Cloudflare URL

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 DEPLOYMENT TO VERCEL

### Step 1: Prepare for Deployment

**Make sure your Flask backend is accessible from the internet:**

1. **Install cloudflared** (recommended):
```bash
# On Windows (Chocolatey)
choco install cloudflared

# On macOS
brew install cloudflared

# On Linux
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

2. **Start tunnel** (run on your laptop):
```bash
cloudflared tunnel --url http://localhost:5000
```

3. **Copy the HTTPS URL** it gives you, e.g.:
   ```
   https://abc123.trycloudflare.com
   ```

### Step 2: Push Code to GitHub

```bash
# Initialize git if not already
cd Pushan-main
git init
git add .
git commit -m "Initial commit: Adaptive Traffic Signal Dashboard"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/traffic-signal-system.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/login with GitHub**
3. **Click "Add New Project"**
4. **Import your GitHub repository**
5. **Configure Project:**

   **Framework Preset:** Next.js

   **Root Directory:** `web` (important!)

   **Environment Variables** (add these):
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   NEXT_PUBLIC_FLASK_API_URL = https://abc123.trycloudflare.com
   ```

6. **Click "Deploy"**

7. **Wait ~2 minutes** for deployment to complete

8. **Visit your Vercel URL**, e.g.:
   ```
   https://traffic-signal-system.vercel.app
   ```

---

## 📱 PWA INSTALLATION

After deployment, you can install the dashboard as an app:

### On Desktop (Chrome/Edge):
1. Visit your Vercel URL
2. Click the install icon in the address bar
3. Click "Install"

### On Mobile:
1. Visit your Vercel URL
2. Tap browser menu (⋮ or ≡)
3. Tap "Add to Home Screen"

---

## 🎨 CUSTOMIZATION

### Change App Name

Edit `web/public/manifest.json`:

```json
{
  "name": "Your Custom Name",
  "short_name": "ShortName",
  ...
}
```

Edit `web/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Your Custom Title",
  ...
};
```

### Add App Icons

1. Create two PNG images:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)

2. Place them in `web/public/`

**Quick way to generate icons:**
- Use [favicon.io](https://favicon.io)
- Upload any image
- Download 192x192 and 512x512 versions
- Rename and place in `web/public/`

### Change Colors

Edit `web/tailwind.config.js`:

```javascript
colors: {
  traffic: {
    red: '#YOUR_HEX',
    yellow: '#YOUR_HEX',
    green: '#YOUR_HEX',
  },
}
```

---

## 🔍 TESTING CHECKLIST

After deployment, test these features:

- [ ] **Dashboard loads** without errors
- [ ] **Live feed displays** camera stream
- [ ] **Traffic signal** glows and animates
- [ ] **Metrics cards** show real data
- [ ] **Manual override** works (click and check Flask logs)
- [ ] **Analytics page** loads with charts
- [ ] **Settings page** loads
- [ ] **About page** loads
- [ ] **Mobile navigation** works (resize browser)
- [ ] **Real-time updates** work (check browser console)
- [ ] **PWA installs** on mobile

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Module not found" error

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Camera feed not loading

**Cause:** Cloudflare tunnel not running or CORS blocked

**Solution:**
1. Ensure `cloudflared` is running on laptop
2. Check browser console (F12) for errors
3. Verify `tunnel_url` in Supabase `system_state` table

### Issue 3: Real-time updates not working

**Cause:** Supabase Realtime not enabled

**Solution:**
1. Go to Supabase Dashboard
2. Database → Replication
3. Enable Realtime for `traffic_events` table

### Issue 4: Override button does nothing

**Cause:** Flask API not reachable

**Solution:**
1. Check Flask is running: `python laptop/main.py`
2. Check `NEXT_PUBLIC_FLASK_API_URL` is correct
3. Check laptop firewall allows port 5000

### Issue 5: Build fails on Vercel

**Solution:**
1. Check "Root Directory" is set to `web`
2. Check all environment variables are set
3. Check Node.js version (should be 18+)
4. Check deployment logs for specific errors

---

## 📊 MONITORING

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Database → Logs
3. Filter by table: `traffic_events`

### Check Flask Logs

```bash
# On your laptop, where Flask is running
# Check terminal output for errors
```

### Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click latest deployment → "View Logs"

---

## 🚀 PERFORMANCE TIPS

### 1. Enable Image Optimization

Already configured in `next.config.js` - no action needed.

### 2. Enable Compression

Vercel does this automatically ✅

### 3. Use CDN

Vercel Edge Network does this automatically ✅

### 4. Monitor Bundle Size

```bash
npm run build
# Check output for bundle sizes
```

---

## 🔐 SECURITY BEST PRACTICES

### 1. Environment Variables

✅ **DO:**
- Use `NEXT_PUBLIC_*` prefix for client-side vars
- Never commit `.env.local`
- Use different keys for dev/prod

❌ **DON'T:**
- Hardcode credentials
- Share anon keys publicly (they're safe, but still)
- Use service role key in frontend

### 2. Supabase RLS

Enable Row Level Security in Supabase:

```sql
-- Allow all reads (public dashboard)
ALTER TABLE traffic_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON traffic_events
  FOR SELECT USING (true);

-- Allow system inserts (from Flask)
CREATE POLICY "Service insert access" ON traffic_events
  FOR INSERT WITH CHECK (true);
```

---

## 📞 SUPPORT & DOCUMENTATION

- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## ✅ DEPLOYMENT COMPLETE

If you've made it this far, congratulations! 🎉

Your Adaptive Traffic Signal System is now:
- ✅ Hardware ready (ESP32s + sensors)
- ✅ Backend running (Flask + YOLOv8)
- ✅ Database connected (Supabase)
- ✅ Dashboard deployed (Vercel)

**What's Next?**
1. Install dashboard on your phone
2. Test manual override from mobile
3. Show it off to judges/friends!
4. Deploy to more junctions 🚀

---

**Built with ❤️ for the Adaptive Traffic Signal System**
