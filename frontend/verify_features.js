const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');


// Load env
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
    }
  });
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TEST_EMAIL = `feature_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';

async function runTest() {
  console.log('--- Feature Verification (Dashboard & Upload) ---');
  
  // 1. Create User
  console.log(`Creating test user ${TEST_EMAIL}...`);
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { firstName: 'FeatureTester' }
  });
  
  if (userError) {
    console.error('Failed to create user:', userError);
    return;
  }
  
  const userId = userData.user.id;
  console.log('User created:', userId);

  // 1b. Create Public Profile
  // We need this because there is no automatic trigger, and transactions table references public.users
  console.log('Creating public user profile...');
  const { error: profileError } = await supabase.from('users').insert({
    id: userId,
    email: TEST_EMAIL,
    full_name: 'FeatureTester'
  });
  
  if (profileError) {
    console.error('Failed to create profile:', profileError);
    // Proceeding might fail on FK constraint
  }

  // 2. Insert Mock Transactions (For Dashboard)
  console.log('Inserting transactions...');
  const transactions = [
    {
      user_id: userId,
      transaction_date: new Date().toISOString(),
      description: 'Test Salary',
      amount: 500000.00,
      type: 'credit',
      category_name: 'Salary',
      is_income: true
    },
    {
      user_id: userId,
      transaction_date: new Date().toISOString(),
      description: 'Test Grocery',
      amount: 45000.50,
      type: 'debit',
      category_name: 'Groceries',
      is_income: false
    }
  ];

  const { error: txError } = await supabase.from('transactions').insert(transactions);
  
  if (txError) {
    console.error('Failed to insert transactions:', txError);
  } else {
    console.log('Transactions inserted successfully.');
    console.log('Dashboard verification: SUCCESS (Data seeded).');
  }

  // 3. Test Upload Route
  console.log('Testing upload route (Simulating PDF upload)...');
  const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/Name /F1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000157 00000 n\n0000000302 00000 n\n0000000392 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n486\n%%EOF';
  
  const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('statement', blob, 'test_statement.pdf');
  formData.append('userId', userId);
  
  try {
      // Use standard fetch (Node 18+)
      const uploadRes = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const text = await uploadRes.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse upload response:', text);
      }
      
      if (uploadRes.ok && json) {
        console.log('Upload response:', json);
        if (json.text) {
             console.log('Upload verification: SUCCESS (PDF processed).');
             console.log('Extracted text length:', json.text.length);
        } else {
             console.error('Upload verification: WARNING (No text returned).');
        }
      } else {
        console.error('Upload failed:', text);
      }
  } catch (err) {
      console.error('Upload request failed:', err.message);
  }

  // 4. Cleanup
  console.log('Cleaning up...');
  await supabase.from('transactions').delete().eq('user_id', userId);
  // Also delete statements and users
  const { data: stmts } = await supabase.from('statements').select('id').eq('user_id', userId);
  if (stmts && stmts.length > 0) {
      await supabase.from('statements').delete().in('id', stmts.map(s => s.id));
  }
  
  await supabase.from('users').delete().eq('id', userId);
  await supabase.auth.admin.deleteUser(userId);
  console.log('Cleanup done.');
}

runTest().catch(console.error);
