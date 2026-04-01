# 🔌 Connection Setup Guide - Make It Real!

## Current Status Check ✅

### Already Connected:
- ✅ **Supabase Database**: Connected (pxuvkioelzbbrbhtnpgs.supabase.co)
- ✅ **Frontend Environment**: `.env` file configured
- ✅ **Development Server**: Can run locally

### Still Need to Connect:
- ⚠️ **Supabase Edge Functions**: Need API keys
- ⚠️ **Database Migrations**: Need to apply
- ⚠️ **Firecrawl API**: Need API key
- ⚠️ **OpenAI API**: Need API key

---

## 🎯 Step-by-Step: Make It Work for Real

### **STEP 1: Get Firecrawl API Key** 🔑

**What it does**: Fetches search engine results for SEO analysis

**How to get it**:
1. Go to https://firecrawl.dev
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Copy your API key

**Free tier**: 500 requests/month

---

### **STEP 2: Get OpenAI API Key** 🤖

**What it does**: Powers the AI analysis of competitor data

**How to get it**:
1. Go to https://platform.openai.com/signup
2. Sign up or login to your account
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy your API key (starts with sk-)

**Cost**: Pay-as-you-go, ~$0.10-0.50 per analysis

---

### **STEP 3: Add API Keys to Supabase** 🔐

**Run these commands**:

```bash
# Login to Supabase (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref pxuvkioelzbbrbhtnpgs

# Set Firecrawl API key
npx supabase secrets set FIRECRAWL_API_KEY="your_firecrawl_key_here"

# Set OpenAI API key
npx supabase secrets set OPENAI_API_KEY="your_openai_key_here"
```

**Verify they're set**:
```bash
npx supabase secrets list
```

---

### **STEP 4: Apply Database Migrations** 📊

**This adds the optimizations we created**:

```bash
# Push migrations to Supabase
npx supabase db push
```

**Expected output**: "Migration applied successfully"

**What this does**:
- Adds indexes for faster queries
- Optimizes serp_analyses table
- Enables historical tracking

---

### **STEP 5: Deploy Edge Functions** ⚡

**Deploy the updated SEO analysis function**:

```bash
# Deploy seo-analysis function with improvements
npx supabase functions deploy seo-analysis
```

**Expected output**: "Function deployed successfully"

---

### **STEP 6: Test the Connection** 🧪

**Test from your local app**:

1. **Start dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open browser**: http://localhost:8080/

3. **Login** to your account

4. **Navigate to** SEO Analysis page

5. **Click** "Run SERP Analysis"

6. **Watch for**:
   - ✅ Progress bar appears
   - ✅ Analysis completes (30-60 seconds)
   - ✅ Results display
   - ✅ No error messages

**If it works** → You're fully connected! 🎉

---

## 🔄 Alternative: Use OpenAI Instead of Lovable

If you prefer OpenAI's API:

### **1. Get OpenAI API Key**
- Go to https://platform.openai.com/
- Sign up and get API key
- Add billing (pay-as-you-go)

### **2. Modify Edge Function**

Replace in `supabase/functions/seo-analysis/index.ts`:

```typescript
// Change this:
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// To this:
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// And change the API call:
const aiResp = await fetch(
  "https://api.openai.com/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // or "gpt-3.5-turbo" for cheaper
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  }
);
```

### **3. Set OpenAI Key**
```bash
npx supabase secrets set OPENAI_API_KEY="your_openai_key_here"
```

### **4. Redeploy**
```bash
npx supabase functions deploy seo-analysis
```

---

## 💰 Cost Breakdown

### **Free Tier (Testing)**:
- Supabase: FREE (500MB database)
- Firecrawl: FREE (500 requests/month)
- OpenAI: $5 free credits (new accounts)
- **Total: $0/month**

### **Paid (Production)**:
- Supabase: $25/month (Pro plan)
- Firecrawl: $20/month (1,000 requests)
- OpenAI (gpt-4o-mini): ~$10-15/month usage
- **Total: ~$55-60/month**

### **OpenAI Cost Details**:
- GPT-4o-mini: ~$0.15 per 1M tokens
- ~$0.10-0.15 per analysis
- 100 analyses = ~$10-15/month

---

## 🚨 Troubleshooting

### **Error: "Unauthorized"**
- ✅ Check API keys are set: `npx supabase secrets list`
- ✅ Re-login: `npx supabase login`
- ✅ Re-link: `npx supabase link --project-ref pxuvkioelzbbrbhtnpgs`

### **Error: "Analysis failed"**
- ✅ Check Firecrawl API key is valid
- ✅ Check you have credits remaining
- ✅ View logs: Supabase Dashboard → Edge Functions → Logs

### **Error: "Rate limit exceeded"**
- ⏰ You've hit free tier limit
- 💰 Upgrade Firecrawl plan
- 🔄 Wait 24 hours for reset

### **Error: Migration fails**
- ✅ Check you're linked to correct project
- ✅ Try: `npx supabase db reset` then `npx supabase db push`

---

## ✅ Final Checklist

Before marking as "connected":

- [ ] Firecrawl API key obtained
- [ ] OpenAI API key obtained
- [ ] API keys added to Supabase secrets
- [ ] Database migrations applied
- [ ] Edge function deployed
- [ ] Test analysis runs successfully
- [ ] No errors in browser console
- [ ] Results display correctly

---

## 🎉 You're Connected When...

✅ You can run an SEO analysis from your app  
✅ Progress bar shows during analysis  
✅ Results load with competitor data  
✅ CSV export works  
✅ History shows past analyses  
✅ No error messages appear  

**Then you're 100% connected and production-ready!** 🚀

---

## 📞 Quick Help

**Command cheat sheet**:
```bash
# Check connection
npx supabase status

# View logs
npx supabase functions logs seo-analysis

# Test function locally
npx supabase functions serve seo-analysis

# Redeploy after changes
npx supabase functions deploy seo-analysis

# Check secrets
npx supabase secrets list
```

---

## 🚀 After Everything is Connected

1. Test thoroughly (see [TESTING_GUIDE.md](TESTING_GUIDE.md))
2. Deploy to production (see [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md))
3. Monitor usage and costs
4. Scale as needed

---

**Need help?** Check the Supabase Dashboard logs or Firecrawl dashboard for debugging info.

**Ready to connect?** Start with Step 1 above! 👆
