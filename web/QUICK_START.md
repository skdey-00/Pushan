# ⚡ QUICK START GUIDE

## 5 Minutes to Live Dashboard

### 1. Install Dependencies (1 min)
```bash
cd Pushan-main/web
npm install
```

### 2. Configure Environment (1 min)
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
```

### 3. Run Locally (1 min)
```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Deploy to Vercel (2 min)
1. Push code to GitHub
2. Go to vercel.com → Import Project
3. Set root directory to: `web`
4. Add environment variables (see step 2)
5. Click Deploy

---

## 🚨 COMMON ISSUES

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Supabase connection error"
- Check URL is correct (include https://)
- Check project is active in Supabase dashboard
- Check anon key is correct (not service role key)

### "Camera feed not loading"
- Ensure Flask backend is running (`python laptop/main.py`)
- Check `NEXT_PUBLIC_FLASK_API_URL` is correct
- Start cloudflared tunnel for remote access

---

## 📱 PWA INSTALL

**Desktop:** Click install icon in address bar

**Mobile:** Browser menu → "Add to Home Screen"

---

## 🎨 CUSTOMIZE

### Change Colors
Edit `tailwind.config.js` → `colors.traffic`

### Change App Name
Edit `public/manifest.json` → `name` + `short_name`

### Add App Icons
Place `icon-192.png` and `icon-512.png` in `public/`

---

## 📚 FULL DOCUMENTATION

- **SETUP.md** - Complete setup & deployment guide
- **BUILD_SUMMARY.md** - Everything that was built
- **README.md** - Project documentation

---

**Built for the Adaptive Traffic Signal System** 🚦
