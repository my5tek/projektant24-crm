const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tzvmcguzsxsaoilecclt.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dm1jZ3V6c3hzYW9pbGVjY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NjIwMDQsImV4cCI6MjA5MzMzODAwNH0.Vw_nV2vjXUG7TJ3C9FLSmjuTWXfGwButwPsTzanJXzU';

const supabase = createClient(supabaseUrl, anonKey);

async function test() {
  // Test profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name');
  console.log('Profiles:', profilesError ? profilesError.message : profiles);

  // Test projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, client_name');
  console.log('Projects:', projectsError ? projectsError.message : projects);
}

test();