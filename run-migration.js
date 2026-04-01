import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://offwxwpbhxklatnqlbcc.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZnd4d3BiaHhrbGF0bnFsYmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODY4MTEsImV4cCI6MjA4OTU2MjgxMX0.uCiRjWaQWhx45Kd_761HeWu8df6pDHGsS-KavRSHfvY';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runMigration() {
  console.log('🚀 Running migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, 'supabase/migrations/20260320000001_add_wordpress_and_subscription_fields.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('⚠️  Note: This script cannot run raw SQL with the anon key.');
    console.log('📋 Please run this SQL manually in your Supabase dashboard:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/offwxwpbhxklatnqlbcc/editor');
    console.log('2. Open the SQL Editor');
    console.log('3. Copy the migration file contents from:');
    console.log('   supabase/migrations/20260320000001_add_wordpress_and_subscription_fields.sql');
    console.log('4. Paste and run it in the SQL Editor\n');
    
    console.log('Or use the Supabase CLI with your service role key:');
    console.log('npx supabase db push\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();
