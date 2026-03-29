# 🚦 Adaptive Traffic Signal System - Web Dashboard

Real-time traffic signal management dashboard built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- **Live Camera Feed** - Real-time MJPEG stream from ESP32-CAM via Cloudflare tunnel
- **Traffic State Display** - Animated traffic light with glow effects
- **Manual Override** - One-click signal override from anywhere
- **Real-time Analytics** - Charts and graphs using Recharts
- **System Health Monitoring** - Device status and heartbeat tracking
- **Responsive Design** - Works on desktop, tablet, and mobile
- **PWA Support** - Installable as mobile app
- **Dark Mode** - Beautiful dark theme by default

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Flask backend running on laptop (port 5000)

### Installation

1. **Install dependencies:**
```bash
cd web
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
```
http://localhost:3000
```

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Deploy to Vercel

1. **Push code to GitHub**
2. **Import project in Vercel**
3. **Add environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_FLASK_API_URL` (use your ngrok/Cloudflare URL)
4. **Deploy!**

## 📁 Project Structure

```
web/
├── app/
│   ├── analytics/
│   │   └── page.tsx          # Analytics dashboard
│   ├── api/
│   │   ├── override/
│   │   │   └── route.ts      # Override API endpoint
│   │   └── clear-override/
│   │       └── route.ts      # Clear override endpoint
│   ├── settings/
│   │   └── page.tsx          # Settings page
│   ├── about/
│   │   └── page.tsx          # About page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home/dashboard
├── components/
│   ├── AlertBanner.tsx       # Congestion alert
│   ├── HistoryChart.tsx      # Recharts line chart
│   ├── HistoryTable.tsx      # Event log table
│   ├── LiveFeed.tsx          # Camera stream
│   ├── MetricsCard.tsx       # Stats card
│   ├── Navigation.tsx        # Top nav bar
│   ├── OverridePanel.tsx     # Manual override controls
│   ├── StatusBadge.tsx       # Online/offline badge
│   ├── SystemHealth.tsx      # Device status panel
│   ├── TrafficSignal.tsx     # Animated traffic light
│   └── TrafficState.tsx      # Traffic metrics
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── types.ts              # TypeScript types
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   ├── icon-192.png          # App icon (192x192)
│   └── icon-512.png          # App icon (512x512)
└── package.json
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  traffic: {
    red: '#EF4444',
    yellow: '#F59E0B',
    green: '#10B981',
  },
}
```

### Styling

Global styles are in `app/globals.css`. Custom animations and utilities are defined there.

## 🔌 API Integration

The dashboard connects to:

1. **Flask Backend** (`NEXT_PUBLIC_FLASK_API_URL`)
   - `GET /status` - Current system state
   - `POST /override` - Set manual override
   - `POST /clear_override` - Clear override

2. **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`)
   - `traffic_events` table - Event log
   - `system_state` table - Configuration
   - Real-time subscriptions

## 📱 PWA Features

To add app icons:

1. Create `public/icon-192.png` (192x192)
2. Create `public/icon-512.png` (512x512)
3. Update `public/manifest.json` with your app details

## 🐛 Troubleshooting

### Camera feed not loading

- Check if Cloudflare tunnel is running
- Verify `tunnel_url` in Supabase `system_state` table
- Check browser console for CORS errors

### Real-time updates not working

- Verify Supabase Realtime is enabled
- Check RLS policies on `traffic_events` table
- Ensure WebSocket connection is open

### Build errors

```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📊 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Database:** Supabase
- **Deployment:** Vercel

## 🤝 Contributing

This is part of the Adaptive Traffic Signal System project. See main README for details.

## 📄 License

MIT

## 👥 Authors

Built with ❤️ for the Adaptive Traffic Signal System project
