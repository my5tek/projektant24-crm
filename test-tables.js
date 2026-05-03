const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tzvmcguzsxsaoilecclt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dm1jZ3V6c3hzYW9pbGVjY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyMDA0LCJleHAiOjIwOTMzMzgwMDR9.-qvQV0uRKtbadBDZwDsl_0POkpF-fRPamNNNYyz6C2E';

const supabase = createClient(supabaseUrl, serviceKey);

async function tables() {
  // Sprawdź RLS
  const { data, error } = await supabase.rpc('pg_tables', { schema_name: 'public' });
  console.log('Tables:', data);
  console.log('Error:', error);
}

tables();