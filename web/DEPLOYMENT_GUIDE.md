# 🚀 Vercel Deployment Guide

## ⚠️ CRITICAL - READ BEFORE DEPLOYING

Your app has been debugged and is ready for Vercel deployment. However, you **MUST** configure these items first or the app will not work.

---

## 📋 Pre-Deployment Checklist

### 1. **Flask Backend API** (REQUIRED)

Your Next.js dashboard needs to communicate with your Flask backend. You have 3 options:

#### Option A: Deploy Flask to a cloud server (Recommended for production)
- Deploy your Flask app to: Railway, Render, Fly.io, AWS, DigitalOcean, etc.
- Get the public URL (e.g., `https://your-flask-app.railway.app`)
- Use this URL in Vercel environment variables

#### Option B: Use Cloudflare Tunnel (Recommended for development)
1. Install cloudflared on your laptop:
   ```bash
   # macOS
   brew install cloudflare/cloudflare/cloudflared

   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. Create a persistent tunnel:
   ```bash
   cloudflared tunnel create traffic-signal
   cloudflared tunnel route dns traffic-signal your-subdomain.your-name.com
   cloudflared tunnel run traffic-signal --url http://localhost:5000
   ```

3. Use your tunnel URL in Vercel environment variables

#### Option C: Use ngrok (Easiest for testing)
1. Install ngrok
2. Run: `ngrok http 5000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Use this in Vercel environment variables

---

### 2. **Supabase Database** (REQUIRED)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → API
4. Copy:
   - Project URL (this is `NEXT_PUBLIC_SUPABASE_URL`)
   - anon/public key (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

5. Run this SQL in your Supabase SQL Editor:
```sql
-- Create traffic_events table
CREATE TABLE IF NOT EXISTS traffic_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  car_count INTEGER,
  queue_level INTEGER,
  traffic_score NUMERIC,
  signal TEXT,
  speed_limit INTEGER,
  is_override BOOLEAN DEFAULT FALSE
);

-- Create system_state table
CREATE TABLE IF NOT EXISTS system_state (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial state
INSERT INTO system_state (key, value) VALUES
  ('tunnel_url', ''),
  ('last_update', NOW()::TEXT)
ON CONFLICT (key) DO NOTHING;

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE traffic_events;
ALTER PUBLICATION supabase_realtime ADD TABLE system_state;
```

---

## 🔧 Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |
| `NEXT_PUBLIC_FLASK_API_URL` | `https://your-flask-api-url.com` | Production, Preview, Development |

**IMPORTANT:** The `NEXT_PUBLIC_` prefix means these variables are exposed to the browser. This is required for your app to work.

---

## 📤 Deploying to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# From the web directory
cd Pushan-main/web
npm install
vercel

# Follow the prompts
# When asked for environment variables, add them
```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repo
5. Configure:
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add environment variables (see above)
7. Click "Deploy"

---

## 🐛 Troubleshooting

### "API URL not configured" Error
**Cause**: Missing `NEXT_PUBLIC_FLASK_API_URL` environment variable

**Fix**: Add the variable in Vercel project settings

### "Missing Supabase environment variables" Error
**Cause**: Missing Supabase credentials

**Fix**: Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### WebSocket connection fails
**Cause**: Mixed content (HTTP on HTTPS page) or WebSocket not supported

**Fix**: Use HTTPS for your Flask API (use Cloudflare Tunnel or deploy to cloud)

### Live Feed shows "Camera not configured"
**Cause**: `tunnel_url` not set in Supabase system_state table

**Fix**: Run this in Supabase SQL Editor:
```sql
INSERT INTO system_state (key, value) VALUES
  ('tunnel_url', 'https://your-tunnel-url.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### Images not loading from ESP32-CAM
**Cause**: ESP32-CAM uses HTTP, Vercel uses HTTPS

**Fix**: Your ESP32-CAM stream MUST be proxied through HTTPS. Use Cloudflare Tunnel in front of the ESP32-CAM stream URL.

---

## 🔄 Post-Deployment Steps

1. **Test your deployment**: Visit your Vercel URL
2. **Check browser console** for any errors
3. **Verify API connectivity**: Dashboard should show live data
4. **Test override panel**: Try setting a manual override
5. **Check analytics page**: Should show charts and stats

---

## 📊 What Was Fixed

All 25 bugs have been fixed:

✅ Critical deployment bugs (9)
- Fixed hardcoded localhost URLs
- Added proper environment variable handling
- Fixed WebSocket connection handling
- Added graceful fallbacks when API is unavailable

✅ High priority bugs (5)
- Settings page now saves to localStorage
- "Clear All Logs" button now functional
- Fixed TypeScript type issues
- Added proper environment variable validation

✅ Medium bugs (6)
- Fixed inconsistent data types
- Fixed metric calculations
- Added null safety checks
- Fixed Tailwind dynamic class names

✅ Low priority issues (5)
- Upgraded Next.js from 14.2.21 → 15.0.3
- Added Error Boundary component
- Improved error messages
- Removed fake/hardcoded values

---

## 🆘 Still Having Issues?

1. Check the browser console (F12) for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set
4. Ensure your Flask API is running and accessible
5. Verify Supabase tables are created

---

## 📝 Important Notes

- Your Flask API **must be running** for the dashboard to work
- The ESP32-CAM stream needs HTTPS when deployed on Vercel
- Environment variables must have the `NEXT_PUBLIC_` prefix to work in the browser
- WebSocket connections require your Flask API to support WebSockets
- Consider using server-side API routes instead of client-side calls for better security

---

## 🎉 You're Ready!

Once you've configured the environment variables, your app is fully debugged and ready to deploy to Vercel!

Good luck! 🚀
