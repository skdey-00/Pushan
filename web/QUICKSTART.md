# ⚡ QUICK START - Deploy in 5 Minutes

## Step 1: Install Dependencies
```bash
cd Pushan-main/web
npm install
```

## Step 2: Set Environment Variable

Create `.env.local`:
```bash
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
```

## Step 3: Run Flask API

In your laptop folder:
```bash
cd Pushan-main/laptop
python main.py
```

## Step 4: Start Next.js

```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## Deploy to Vercel

### 1. Expose Your Flask API

**Option A: ngrok (Easiest)**
```bash
ngrok http 5000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Option B: Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://localhost:5000
```

### 2. Deploy to Vercel

```bash
vercel
```

When asked for environment variable:
```
NEXT_PUBLIC_FLASK_API_URL = https://your-tunnel-url.com
```

That's it! Your app is live! 🚀

---

## What's Different from Before?

✅ **No Supabase needed** - Everything works through Flask
✅ **Only 1 environment variable** - Simpler setup
✅ **Faster** - Direct API calls
✅ **Free** - No database costs
✅ **Easier** - Less to configure

---

## Flask API Endpoints Needed

Make sure your Flask API has these:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/status` | GET | Returns system state |
| `/events` | GET | Returns traffic events |
| `/override` | POST | Sets manual override |
| `/clear_override` | POST | Clears override |
| `/clear-logs` | DELETE | Clears all logs |

See `NO_SUPABASE_DEPLOYMENT.md` for details.

---

## Need Help?

- Full guide: `NO_SUPABASE_DEPLOYMENT.md`
- Bug fixes: `BUG_FIXES_SUMMARY.md`
- Deployment: `DEPLOY_INSTRUCTIONS.md`

**Happy deploying! 🎉**
