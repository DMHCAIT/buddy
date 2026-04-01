# 🔑 New Supabase Project Setup

## Updated Project Configuration

Your project is now configured to use:
- **Project ID**: `offwxwpbhxklatnqlbcc`
- **URL**: https://offwxwpbhxklatnqlbcc.supabase.co

---

## ⚠️ IMPORTANT: Get Your Anon Key

You need to add your Supabase Anon Key to the `.env` file.

### **How to Get Your Anon Key:**

1. Go to https://supabase.com/dashboard/project/offwxwpbhxklatnqlbcc
2. Click **Settings** (gear icon in sidebar)
3. Click **API**
4. Copy the **anon/public** key (under "Project API keys")

### **Update .env File:**

Open `.env` and replace `YOUR_ANON_KEY_HERE` with your actual key:

```env
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🚀 Complete Setup for New Project

### **Step 1: Get Anon Key** (see above)

### **Step 2: Link Project**
```bash
npx supabase login
npx supabase link --project-ref offwxwpbhxklatnqlbcc
```

### **Step 3: Apply Database Migrations**
```bash
npx supabase db push
```

This will create:
- `profiles` table
- `posts` table  
- `content_plans` table
- `serp_analyses` table (with optimizations)
- All indexes and RLS policies

### **Step 4: Set API Keys for Edge Functions**
```bash
# Get these keys first:
# - Firecrawl: https://firecrawl.dev
# - Lovable AI: https://lovable.dev (or use OpenAI)

npx supabase secrets set FIRECRAWL_API_KEY="your_firecrawl_key"
npx supabase secrets set OPENAI_API_KEY="your_openai_key"
```

### **Step 5: Deploy Edge Functions**
```bash
npx supabase functions deploy analyze-site
npx supabase functions deploy seo-analysis
npx supabase functions deploy generate-content-plan
npx supabase functions deploy generate-blog
```

### **Step 6: Test Connection**
```bash
npm run dev
# Open http://localhost:8080
# Try to login and run SEO analysis
```

---

## 📋 Quick Checklist

- [ ] Get Anon Key from Supabase Dashboard
- [ ] Update `.env` file with Anon Key
- [ ] Login to Supabase CLI: `npx supabase login`
- [ ] Link project: `npx supabase link --project-ref offwxwpbhxklatnqlbcc`
- [ ] Push migrations: `npx supabase db push`
- [ ] Get Firecrawl API key
- [ ] Get OpenAI API key
- [ ] Set secrets in Supabase
- [ ] Deploy all edge functions
- [ ] Test the app

---

## 🔍 Verify Setup

**Check if everything is connected:**

```bash
# 1. Check database tables exist
npx supabase db diff

# 2. Check edge functions are deployed
npx supabase functions list

# 3. Check secrets are set
npx supabase secrets list

# 4. View logs (after testing)
npx supabase functions logs seo-analysis
```

---

## 💰 New Project Quotas

**Free Tier Includes:**
- 500 MB Database
- 1 GB File Storage
- 2 GB Bandwidth
- 500K Edge Function Invocations
- Unlimited API Requests

**Perfect for development and testing!**

---

## 🚨 If Something Goes Wrong

### **Can't connect to database:**
- Verify Anon Key is correct in `.env`
- Restart dev server: Stop and run `npm run dev` again
- Clear browser cache and reload

### **Migrations fail:**
```bash
# Reset and try again
npx supabase db reset
npx supabase db push
```

### **Edge functions not working:**
- Check API keys are set: `npx supabase secrets list`
- View logs: `npx supabase functions logs seo-analysis --tail`
- Redeploy: `npx supabase functions deploy seo-analysis`

---

## ✅ You're Ready When...

✅ Dev server runs without errors  
✅ Can login to the app  
✅ SEO Analysis runs successfully  
✅ Results display with data  
✅ CSV export works  
✅ History shows past analyses  

---

**Next:** Follow the steps above to complete the setup! 🚀
