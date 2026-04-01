# 🚀 Deployment Checklist

## ✅ Pre-Deployment

- [x] Code changes completed
- [x] All TypeScript errors resolved
- [x] Database migration created
- [ ] Local testing completed
- [ ] Environment variables documented

## 📋 Deployment Steps

### 1. Database Migration (Run First!)
```bash
cd /Users/rubeenakhan/Desktop/outrank-buddy-main

# Login to Supabase CLI
npx supabase login

# Link your project
npx supabase link --project-ref pxuvkioelzbbrbhtnpgs

# Push the new migration
npx supabase db push

# Expected output: "Migration applied successfully"
```

### 2. Deploy Edge Functions
```bash
# Deploy updated seo-analysis function
npx supabase functions deploy seo-analysis

# Verify environment variables are set
npx supabase secrets list

# If missing, set them:
# npx supabase secrets set FIRECRAWL_API_KEY=your_key
# npx supabase secrets set OPENAI_API_KEY=your_key
```

### 3. Deploy Frontend

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set build command: npm run build
# - Set output directory: dist
# - Set environment variables when prompted
```

#### Option B: Manual via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://pxuvkioelzbbrbhtnpgs.supabase.co
   VITE_SUPABASE_ANON_KEY=[your-anon-key]
   ```
6. Click **Deploy**

### 4. Verify Deployment

#### Test Database Migration
```bash
# Connect to your database
npx supabase db remote --project-ref pxuvkioelzbbrbhtnpgs

# Check if indexes were created
SELECT indexname FROM pg_indexes 
WHERE tablename = 'serp_analyses';

# Should show:
# - idx_serp_analyses_user_id
# - idx_serp_analyses_created_at
# - idx_serp_analyses_user_created
# - idx_serp_analyses_niche
# - idx_serp_analyses_analysis_gin
```

#### Test Edge Function
```bash
# Test the function locally first
npx supabase functions serve seo-analysis

# In another terminal, test it:
curl -X POST 'http://localhost:54321/functions/v1/seo-analysis' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "niche": "AI Tools",
    "keywords": ["AI writing tool", "ChatGPT alternative"]
  }'
```

#### Test Frontend
1. Visit your deployed URL
2. Login with test account
3. Navigate to SEO Analysis page
4. Run an analysis with 5-10 keywords
5. ✅ Check progress bar appears
6. ✅ Verify results load correctly
7. ✅ Click "History" button - see past analyses
8. ✅ Click "Export Keywords" - CSV downloads
9. ✅ Click "Export Competitors" - CSV downloads

---

## 🔍 Post-Deployment Checks

### Performance
- [ ] Analysis completes within 30-60 seconds for 10 keywords
- [ ] Progress bar updates smoothly
- [ ] History loads instantly
- [ ] CSV exports download successfully

### Data Quality
- [ ] All keyword fields populated (no undefined)
- [ ] Competitor data shows properly
- [ ] Recommendations are actionable
- [ ] Charts render correctly

### Database
- [ ] Analyses save to database
- [ ] History query returns results
- [ ] No duplicate entries
- [ ] Timestamps are correct

---

## 🐛 Common Issues & Solutions

### Issue: "Migration already exists"
```bash
# Skip if already applied
npx supabase db push --dry-run  # Check what would be applied
# If safe, proceed with force:
npx supabase db push
```

### Issue: Edge Function timeout
**Solution**: Reduce keyword count for testing
```typescript
// In seo-analysis/index.ts
const limitedKeywords = keywords.slice(0, 5); // Reduce to 5 for testing
```

### Issue: CSV export button doesn't work
**Check**:
1. Browser console for errors
2. Result object has data: `console.log(result)`
3. Pop-up blocker isn't blocking downloads

### Issue: History doesn't load
**Check**:
1. Database connection in browser console
2. RLS policies allow SELECT for authenticated users
3. Table `serp_analyses` exists

---

## 📊 Monitoring

### Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/pxuvkioelzbbrbhtnpgs
2. **Database** → Check table size and row counts
3. **Edge Functions** → Monitor invocations and errors
4. **API** → Check request counts
5. **Logs** → Review error logs

### Vercel Dashboard  
1. Go to your project in Vercel
2. **Analytics** → Monitor page views
3. **Speed Insights** → Check performance
4. **Functions** → Not applicable (using Supabase)
5. **Deployments** → Verify build success

---

## 🎯 Rollback Plan (If Needed)

### Rollback Database
```bash
# Create a backup first
npx supabase db dump > backup.sql

# Rollback last migration
npx supabase migration repair --status reverted

# Or restore from backup
psql [connection-string] < backup.sql
```

### Rollback Frontend
1. Go to Vercel Dashboard
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

### Rollback Edge Function
```bash
# Redeploy previous version from git
git checkout [previous-commit-hash]
npx supabase functions deploy seo-analysis
git checkout main
```

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Project Issues**: Create issue in your repo
- **Supabase Support**: https://supabase.com/support

---

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Analysis processes 10 keywords (vs 3 before)
- ✅ Progress bar shows real-time updates
- ✅ History button shows past analyses
- ✅ CSV exports download correctly
- ✅ No errors in browser console
- ✅ Database queries are fast (<100ms)
- ✅ All validations prevent bad data

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Environment**: Production  
**Version**: 2.0.0

---

## 🎉 After Successful Deployment

1. Announce to team/users
2. Monitor error rates for 24 hours
3. Gather user feedback
4. Plan Phase 2 features (PDF export, rank tracking, etc.)

**Good luck with your deployment!** 🚀
