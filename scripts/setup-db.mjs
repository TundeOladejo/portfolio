/**
 * Applies RLS policies and Storage bucket setup to Supabase
 * using the Supabase Management API.
 *
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env
 *   - SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Usage:
 *   node scripts/setup-db.mjs
 *
 * Find your service role key:
 *   Supabase Dashboard → Settings → API → service_role (secret)
 */

import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\n❌  Missing environment variables.\n');
  console.error('Add the following to your .env file:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
  console.error('\nFind it in: Supabase Dashboard → Settings → API → service_role\n');
  process.exit(1);
}

// Extract project ref from URL: https://<ref>.supabase.co
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

async function runSql(label, filePath) {
  console.log(`\n▶  Applying ${label}...`);
  const sql = readFileSync(filePath, 'utf8');

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    // 400 with "already exists" errors are safe to ignore
    if (body.includes('already exists')) {
      console.log(`  ⚠  Some objects already exist — skipping (safe to ignore).`);
      return;
    }
    console.error(`  ✗  Failed: ${res.status} ${body}`);
    process.exit(1);
  }

  console.log(`  ✓  ${label} applied.`);
}

async function main() {
  console.log('\n🔧  Supabase post-migration setup');
  console.log(`    Project: ${supabaseUrl}\n`);

  await runSql('RLS policies (supabase/rls.sql)', 'supabase/rls.sql');
  await runSql('Storage bucket (supabase/storage.sql)', 'supabase/storage.sql');

  console.log('\n✅  Done. Database is fully configured.');
  console.log(
    '\nNext: create an admin user in Supabase Dashboard → Authentication → Users\n'
  );
}

main().catch((err) => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
