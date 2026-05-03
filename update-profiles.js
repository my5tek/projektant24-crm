const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tzvmcguzsxsaoilecclt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dm1jZ3V6c3hzYW9pbGVjY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyMDA0LCJleHAiOjIwOTMzMzgwMDR9.-qvQV0uRKtbadBDZwDsl_0POkpF-fRPamNNNYyz6C2E';

const supabase = createClient(supabaseUrl, serviceKey);

async function updateProfiles() {
  // Get users from auth.users
  const { data: users, error: usersError } = await supabase
    .auth
    .admin
    .listUsers();

  if (usersError) {
    console.error('Error listing users:', usersError);
    return;
  }

  console.log('Found users:', users.users.map(u => u.email));

  // Find our users
  const przemek = users.users.find(u => u.email === 'pmystkowski@gmail.com');
  const maciej = users.users.find(u => u.email === 'maciej.portison@gmail.com');

  if (!przemek || !maciej) {
    console.error('Users not found! Make sure they exist in Supabase Auth.');
    return;
  }

  // Delete existing profiles
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert new profiles
  const { error: insertError } = await supabase
    .from('profiles')
    .insert([
      { id: przemek.id, display_name: 'Przemek' },
      { id: maciej.id, display_name: 'Maciej' }
    ]);

  if (insertError) {
    console.error('Error inserting profiles:', insertError);
  } else {
    console.log('✅ Profiles updated: Przemek and Maciej');
  }
}

updateProfiles();