# 🚀 Quick Setup Instructions
**Get Your App Running in 30 Minutes**

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js installed (v18 or higher)
- [ ] npm or bun package manager
- [ ] Text editor (VS Code recommended)
- [ ] Internet connection

**Check Node version:**
```bash
node --version  # Should be v18.0.0 or higher
```

If not installed: https://nodejs.org/

---

## 🎯 Step-by-Step Setup

### **Step 1: Install Dependencies** (2 minutes)

```bash
cd c:\Users\hp\Downloads\buddy-main\buddy-main
npm install
```

✅ **Expected output:** "added 605 packages"

---

### **Step 2: Set Up Supabase** (10 minutes)

#### 2A: Check if Project Exists

1. Go to: https://supabase.com/dashboard
2. Log in (or create account)
3. Look for project: `offwxwpbhxklatnqlbcc`

**If project EXISTS:**
```bash
# Link to existing project
npx supabase login
npx supabase link --project-ref offwxwpbhxklatnqlbcc
```

**If project DOESN'T exist:**
```bash
# Create new project
1. Click "New Project" at https://supabase.com/dashboard
2. Name: "buddy-seo-generator"
3. Database Password: (save this somewhere safe!)
4. Region: Choose closest to you
5. Click "Create new project" (takes 2 mins)
6. Copy the new project ID
7. Update supabase/config.toml with new ID
```

#### 2B: Get API Credentials

1. Go to your project dashboard
2. Click **Settings** → **API**
3. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

#### 2C: Create .env File

```bash
# In project root directory
# Copy the example file
cp .env.example .env

# Or on Windows PowerShell:
Copy-Item .env.example .env
```

Edit `.env` file and paste your values:

```env
VITE_SUPABASE_URL=https://offwxwpbhxklatnqlbcc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...your_actual_key_here
```

✅ **Test:** Run `cat .env` to verify file was created

---

### **Step 3: Apply Database Migrations** (3 minutes)

```bash
# Make sure you're linked to project first
npx supabase db push
```

✅ **Expected output:** "Applying migration... Done"

**If this fails:**
```bash
# Try remote database sync instead
npx supabase db pull
```

---

### **Step 4: Get OpenAI API Key** (5 minutes)

**Why needed:** Generates blog content with AI

**How to get:**

1. Go to: https://platform.openai.com/api-keys
2. Sign in (or create account)
3. Click **"Create new secret key"**
4. Name: `buddy-seo-generator`
5. Click **Create**
6. Copy the key (starts with `sk-...`)
7. **SAVE IT** - you won't see it again!

**Set the key in Supabase:**

```bash
npx supabase secrets set OPENAI_API_KEY="sk-your-actual-key-here"
```

✅ **Expected output:** "Finished supabase secrets set"

**Cost Warning:**
- OpenAI charges per token
- 1 blog post ≈ $0.002-0.005 (less than 1 cent)
- Set spending limit: https://platform.openai.com/settings/organization/billing/limits
- Recommended limit: $10/month for testing

---

### **Step 5: Get Firecrawl API Key** (5 minutes) - OPTIONAL

**Why needed:** SEO competitor analysis

**How to get:**

1. Go to: https://firecrawl.dev
2. Sign up for free account
3. Go to **Dashboard** → **API Keys**
4. Copy your API key (starts with `fc-...`)

**Set the key:**

```bash
npx supabase secrets set FIRECRAWL_API_KEY="fc-your-actual-key-here"
```

✅ **Free tier:** 500 requests/month (enough for testing)

**Skip for now?** You can test blog generation without this. SEO analysis won't work until you add it.

---

### **Step 6: Start Development Server** (1 minute)

```bash
npm run dev
```

✅ **Expected output:**
```
VITE v5.4.19  ready in 543 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Open in browser:** http://localhost:5173

---

### **Step 7: Test Blog Generation** (5 minutes)

1. **Sign Up**
   - Go to: http://localhost:5173/auth
   - Enter email and password
   - Click "Sign Up"

2. **Complete Onboarding**
   - Go to: http://localhost:5173/get-started
   - Enter your niche (e.g., "dental care", "web development")
   - Enter keywords (e.g., "teeth whitening, cavity prevention")
   - Click "Save & Continue"

3. **Generate Content Plan**
   - Go to: http://localhost:5173/content-plan
   - Click "Generate 30-Day Plan"
   - Wait 10-15 seconds
   - ✅ Should see 30 blog topics

4. **Generate Today's Blog**
   - Go to: http://localhost:5173/todays-blog
   - Click "Generate Today's Blog"
   - Wait 15-20 seconds
   - ✅ Should see full blog post with title, content, keywords

5. **Test WordPress Settings** (Optional)
   - Go to: http://localhost:5173/profile
   - Scroll to "WordPress Integration"
   - Enter your WordPress URL, username, app password
   - Click "Test Connection"
   - ✅ Should see "Connection successful"

---

## ✅ Success Checklist

You should now have:

- [x] Dependencies installed
- [x] Supabase project created/linked
- [x] `.env` file with credentials
- [x] Database migrations applied
- [x] OpenAI API key set
- [x] (Optional) Firecrawl API key set
- [x] Dev server running
- [x] Test blog post generated

**If ALL checked:** 🎉 **YOU'RE READY TO GO!**

---

## 🐛 Troubleshooting

### Issue: "VITE_SUPABASE_URL is undefined"

**Fix:**
```bash
# Make sure .env file exists
cat .env  # or type .env on Windows

# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

### Issue: "OPENAI_API_KEY is not configured"

**Fix:**
```bash
# Verify secret was set
npx supabase secrets list

# If not listed, set it again
npx supabase secrets set OPENAI_API_KEY="sk-your-key"
```

### Issue: "Failed to generate content"

**Possible causes:**

1. **No OpenAI credits**
   - Go to: https://platform.openai.com/settings/organization/billing
   - Add payment method
   - Set spending limit

2. **Wrong API key**
   - Regenerate at: https://platform.openai.com/api-keys
   - Update in Supabase: `npx supabase secrets set OPENAI_API_KEY="sk-new-key"`

3. **Rate limit exceeded**
   - Wait 1 minute and try again
   - OpenAI has rate limits for new accounts

### Issue: "Cannot read properties of null"

**Fix:** Make sure you completed onboarding (Step 7.2)

```bash
# Go to /get-started and fill in:
# - Niche
# - Keywords
```

### Issue: Database connection error

**Fix:**
```bash
# Re-apply migrations
npx supabase db push

# Or pull from remote
npx supabase db pull
```

### Issue: Port 5173 already in use

**Fix:**
```bash
# Kill existing process
npx kill-port 5173

# Or use different port
npm run dev -- --port 5174
```

---

## 📊 Verify Everything Works

Run this test script:

```bash
# Open dev tools in browser (F12)
# Go to Console tab
# Paste this:

console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key set:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

✅ **Expected output:**
```
Supabase URL: https://offwxwpbhxklatnqlbcc.supabase.co
Supabase Key set: true
```

---

## 🎯 What's Next?

### Option 1: Keep Testing Locally

- Generate more blog posts
- Try different niches
- Test WordPress publishing
- Explore content calendar

### Option 2: Deploy to Production

Follow: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

- Deploy to Vercel
- Set up custom domain
- Configure production database
- Enable daily automation

### Option 3: Improve the Code

Follow: [CODE_REVIEW_REPORT.md](CODE_REVIEW_REPORT.md)

- Fix TypeScript warnings
- Add error boundaries
- Improve content quality (1200-2000 words)
- Enable daily auto-publishing

---

## 📚 Documentation

- **Setup:** You are here!
- **Code Review:** [CODE_REVIEW_REPORT.md](CODE_REVIEW_REPORT.md)
- **Market Strategy:** [MARKET_STRATEGY.md](MARKET_STRATEGY.md)
- **Gap Analysis:** [PRD_GAP_ANALYSIS.md](PRD_GAP_ANALYSIS.md)
- **Deployment:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 💬 Need Help?

**Common Questions:**

**Q: How much will OpenAI cost?**
A: ~$0.002-0.005 per blog post. 100 posts = $0.50. Very cheap!

**Q: Can I use a different AI provider?**
A: Yes! Edit `supabase/functions/generate-blog/index.ts` and change the API endpoint.

**Q: How do I add more users?**
A: Just share the URL. Supabase auth handles multi-tenancy automatically.

**Q: Can I customize the blog templates?**
A: Yes! Edit the system prompt in `supabase/functions/generate-blog/index.ts`

**Q: How do I enable Team features?**
A: Not implemented yet. See [PRD_GAP_ANALYSIS.md](PRD_GAP_ANALYSIS.md) for roadmap.

---

## ✅ Setup Complete!

**Estimated time:** 30-45 minutes  
**Difficulty:** Beginner-friendly  
**Result:** Fully functional local development environment

**Next Step:** Generate your first real blog post! 🚀

**File created:** April 1, 2026  
**Last updated:** April 1, 2026
