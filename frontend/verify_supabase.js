const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Minimal .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  });
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', url);
console.log('Service Key Exists:', !!serviceKey);
console.log('Anon Key Exists:', !!anonKey);

async function testKey(keyName, key) {
  if (!key) {
    console.log(`[SKIPPED] ${keyName} is missing`);
    return;
  }
  
  console.log(`\nTesting ${keyName}...`);
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false }
    });
    
    // Perform a simple query (e.g. check health or list users if service role)
    // For service role, we can try to list users (admin only)
    // For anon, we can try to just get session or health check (usually not exposed directly)
    // A simple public table query would be best, but we don't know tables.
    // We can try authentication methods.
    
    if (keyName === 'Service Role') {
      const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (error) throw error;
      console.log(`[SUCCESS] ${keyName} is VALID. Found ${data.users.length} users (paginated).`);
    } else {
      // For Anon key, we might not have permission to do much without a session.
      // But initialization shouldn't fail.
      // We can try to sign up a dummy user (and fail) or just check if client creates without error.
      // Actually client creation is synchronous.
      // We need a network request.
      // Let's try getting public config or something.
      // Or just a select on a non-existent table to see if we get "Relation not found" (auth success) vs "Invalid API Key" (auth fail).
      
      const { error } = await client.from('non_existent_table').select('*').limit(1);
      
      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('relation') || error.message.includes('permission')) {
             console.log(`[SUCCESS] ${keyName} is VALID (Auth successful, but table missing/denied as expected). Msg: ${error.message}`);
        } else {
             throw error;
        }
      } else {
         console.log(`[SUCCESS] ${keyName} is VALID.`);
      }
    }
  } catch (err) {
    console.error(`[FAILED] ${keyName} is INVALID.`);
    console.error('Error:', err.message);
    if (err.hint) console.error('Hint:', err.hint);
  }
}

(async () => {
    await testKey('Anon Key', anonKey);
    await testKey('Service Role', serviceKey);
})();
