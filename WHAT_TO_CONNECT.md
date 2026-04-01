# 🔌 What Needs to Connect - Visual Guide

## Current Connection Status

```
┌─────────────────────────────────────────────────────────┐
│                 YOUR APPLICATION                        │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Frontend   │ ──✅──→ │   Supabase   │            │
│  │  (Browser)   │         │   Database   │            │
│  └──────────────┘         └──────────────┘            │
│         ↓                         ↓                     │
│         ↓                         ↓                     │
│         ↓                  ┌──────────────┐            │
│         ↓         ────❌──→│ Edge Function│            │
│         ↓                  │(seo-analysis)│            │
│         ↓                  └──────────────┘            │
│         ↓                         │                     │
│         ↓                         │                     │
│         ↓                         ├──❌──→ Firecrawl   │
│         ↓                         │       (Need Key)    │
│         ↓                         │                     │
│         ↓                         └──❌──→ OpenAI      │
│         ↓                                 (Need Key)    │
└─────────────────────────────────────────────────────────┘

✅ = Connected
❌ = Need to Connect
```

---

## What Each Connection Does

### 1. **Frontend ↔ Supabase Database** ✅
- **Status**: Already Connected
- **What it does**: Stores user data, analyses, auth
- **Configured in**: `.env` file
- **No action needed!**

### 2. **Edge Function ↔ Firecrawl API** ❌
- **Status**: NEEDS CONNECTION
- **What it does**: Fetches Google search results
- **Required for**: SEO competitor analysis
- **Action**: Get API key from https://firecrawl.dev

### 3. **Edge Function ↔ OpenAI** ❌
- **Status**: NEEDS CONNECTION  
- **What it does**: AI analysis of competitor data
- **Required for**: Generating insights & recommendations
- **Action**: Get API key from https://platform.openai.com/api-keys

---

## 3 Things You MUST Do to Make It Work

### 🔑 **1. Get Firecrawl API Key**

**What you get**:
```
Free tier: 500 searches/month
Perfect for testing!
```

**Steps**:
1. Go to https://firecrawl.dev
2. Click "Sign Up" (free)
3. Verify email
4. Dashboard → API Keys → Copy

**Paste it here** (save for Step 3):
```
FIRECRAWL_API_KEY="paste_your_key_here"
```

---

### 🤖 **2. Get OpenAI API Key**

**What you get**:
```
AI-powered competitor analysis
Content strategy recommendations
GPT-4o-mini model (~$0.10 per analysis)
```

**Steps**:
1. Go to https://platform.openai.com/signup
2. Sign up or login
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with sk-)

**Paste it here** (save for Step 3):
```
OPENAI_API_KEY="paste_your_key_here"
```

---

### ⚙️ **3. Connect Everything** 

**Option A: Automated Setup** (Recommended)
```bash
# Run the automated script
./QUICK_START.sh

# When prompted, enter your API keys
```

**Option B: Manual Setup**
```bash
# 1. Login to Supabase
npx supabase login

# 2. Link to your project
npx supabase link --project-ref pxuvkioelzbbrbhtnpgs

# 3. Add API keys (use your actual keys)
npx supabase secrets set FIRECRAWL_API_KEY="your_firecrawl_key"
npx supabase secrets set OPENAI_API_KEY="your_openai_key"

# 4. Apply database optimizations
npx supabase db push

# 5. Deploy the improved function
npx supabase functions deploy seo-analysis
```

---

## After Connecting - Test It Works

### Quick Test:
```bash
# 1. Start dev server
npm run dev

# 2. Open browser
http://localhost:8080/

# 3. Login

# 4. Go to SEO Analysis

# 5. Click "Run SERP Analysis"
```

### What Should Happen:
```
✅ Progress bar appears
✅ Status shows "Analyzing keyword X of Y..."
✅ After 30-60 seconds, results appear
✅ You see competitor data
✅ Charts and tables display
✅ Export buttons work
```

### If It Fails:
```
❌ Check browser console (F12)
❌ Check API keys are correct
❌ View logs: npx supabase functions logs seo-analysis
❌ Verify you have API credits remaining
```

---

## Connection Diagram (After Setup)

```
┌─────────────────────────────────────────────────────────┐
│                 YOUR APPLICATION                        │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Frontend   │ ──✅──→ │   Supabase   │            │
│  │  (Browser)   │         │   Database   │            │
│  └──────────────┘         └──────────────┘            │
│         │                         │                     │
│         │                         │                     │
│         │                  ┌──────────────┐            │
│         │         ────✅──→│ Edge Function│            │
│         │                  │(seo-analysis)│            │
│         │                  └──────────────┘            │
│         │                         │                     │
│         │                         │                     │
│         │                         ├──✅──→ Firecrawl   │
│         │                         │       ✅ Connected  │
│         │                         │                     │
│         └─────────────────────────┴──✅──→ OpenAI      │
│                                           ✅ Connected  │
└─────────────────────────────────────────────────────────┘

✅ = Fully Connected & Working!
```

---

## Cost After Connecting

### Free Tier (Good for Testing):
```
Supabase:  FREE (500MB database)
Firecrawl: FREE (500 requests/month)
OpenAI:    $5 free credits (new accounts)
───────────────────────────────────
Total:     $0/month
```

### Paid (For Production):
```
Supabase:  $25/month (Pro - 8GB database)
Firecrawl: $20/month (1,000 requests)
OpenAI:    $10-15/month (gpt-4o-mini usage)
───────────────────────────────────
Total:     $55-60/month
```

---

## Summary - What to Do NOW

1. ✅ **Get Firecrawl key** → https://firecrawl.dev
2. ✅ **Get OpenAI key** → https://platform.openai.com/api-keys
3. ✅ **Run setup script** → `./QUICK_START.sh`
4. ✅ **Test it works** → `npm run dev`

**Total time: 10-15 minutes** ⏱️

---

## 🎯 You'll Know It's Working When...

✨ You run an analysis and see real competitor data  
✨ Charts show actual search results  
✨ AI generates insights and recommendations  
✨ CSV export contains real data  
✨ No error messages appear  

**Then you're 100% connected and ready to use!** 🚀

---

## Need Help?

📖 Read [CONNECTION_SETUP.md](CONNECTION_SETUP.md) for detailed guide  
🧪 See [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing steps  
🚀 Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for production deploy

**Still stuck?** Check Supabase logs:
```bash
npx supabase functions logs seo-analysis --tail
```
