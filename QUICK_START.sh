#!/bin/bash

echo "🚀 OutRank Buddy - Quick Connection Setup"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Supabase CLI ready"
echo ""

# Login to Supabase
echo "Step 1: Login to Supabase"
echo "-------------------------"
npx supabase login

echo ""
echo "Step 2: Link to your project"
echo "---------------------------"
npx supabase link --project-ref pxuvkioelzbbrbhtnpgs

echo ""
echo "📝 Now you need to add API keys:"
echo ""
echo "Get your API keys from:"
echo "  • Firecrawl: https://firecrawl.dev"
echo "  • OpenAI: https://platform.openai.com/api-keys"
echo ""
echo "Then run these commands:"
echo ""
echo "  npx supabase secrets set FIRECRAWL_API_KEY=\"your_key_here\""
echo "  npx supabase secrets set OPENAI_API_KEY=\"your_key_here\""
echo ""
echo "Step 3: Apply database migrations"
echo "--------------------------------"
read -p "Press Enter to apply migrations..."
npx supabase db push

echo ""
echo "Step 4: Deploy edge functions"
echo "----------------------------"
read -p "Press Enter to deploy functions..."
npx supabase functions deploy seo-analysis

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your API keys (see above)"
echo "2. Run: npm run dev"
echo "3. Test SEO Analysis feature"
echo ""
