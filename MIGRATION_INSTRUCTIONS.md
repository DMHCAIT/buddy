# 🔧 Migration Instructions to Fix Loading Issues

## Problem
The pages are not loading because the database is missing required columns that were added in recent updates:
- `wp_url`, `wp_username`, `wp_app_password` (WordPress integration)
- `subscription_tier`, `stripe_customer_id`, `posts_quota_monthly`, `posts_used_this_month` (Billing)
- `notification_preferences`, `onboarding_completed` (User features)

## Solution: Run the Database Migration

### Option 1: Using Supabase Dashboard (RECOMMENDED - EASIEST)

1. **Open your Supabase project:**
   - Go to: https://supabase.com/dashboard/project/offwxwpbhxklatnqlbcc

2. **Navigate to SQL Editor:**
   - Click on "SQL Editor" in the left sidebar

3. **Copy the migration SQL:**
   - Open the file: `supabase/migrations/20260320000001_add_wordpress_and_subscription_fields.sql`
   - Copy ALL the contents (130 lines)

4. **Run the migration:**
   - Paste the SQL into the SQL Editor
   - Click "Run" button
   - You should see "Success. No rows returned"

5. **Refresh your app:**
   - Go back to http://localhost:8080
   - Hard refresh (Cmd + Shift + R)
   - All pages should now work!

### Option 2: Using Supabase CLI (if you have service role key)

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref offwxwpbhxklatnqlbcc

# Push migration
npx supabase db push
```

## What This Migration Does

✅ Adds WordPress integration columns to profiles table
✅ Adds subscription/billing columns to profiles table  
✅ Adds notification preferences to profiles table
✅ Adds onboarding tracking to profiles table
✅ Creates `subscriptions` table for detailed billing
✅ Creates `publishing_logs` table for tracking WordPress publishes
✅ Creates helper functions: `check_and_increment_quota()` and `reset_monthly_quota()`
✅ Sets up Row Level Security (RLS) policies for new tables

## After Migration - Features That Will Work

1. ✅ **Analytics Dashboard** - View post metrics and charts
2. ✅ **Content Calendar** - Visual scheduling with drag-drop
3. ✅ **Content Templates** - 15 ready-to-use templates
4. ✅ **WordPress Publishing** - Auto-publish to WordPress
5. ✅ **Billing Page** - Subscription plans and usage quotas
6. ✅ **Profile Settings** - WordPress configuration
7. ✅ **Create Post** - With template selection
8. ✅ **All other pages** - Should load without errors

## Troubleshooting

### If pages still won't load after migration:

1. **Check browser console:**
   - Open DevTools (F12)
   - Look for error messages
   - Share them with me

2. **Clear browser cache:**
   - Hard refresh: Cmd + Shift + R (Mac) or Ctrl + Shift + R (Windows)
   - Or clear site data in DevTools

3. **Check if migration ran successfully:**
   - In Supabase Dashboard, go to "Table Editor"
   - Open "profiles" table
   - You should see new columns: wp_url, subscription_tier, etc.

4. **Verify Supabase connection:**
   - Check that .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

## Content Templates Location

The templates are in: `src/lib/templates.ts`

They should be visible in the "Create Post" page after selecting a template. If not visible:
1. Ensure migration is run
2. Check browser console for errors
3. Try refreshing the page

## Need Help?

Share:
1. Browser console errors (F12 → Console tab)
2. Supabase SQL Editor result after running migration
3. Which specific page is not loading
