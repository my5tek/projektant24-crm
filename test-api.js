const https = require('https');

const options = {
  hostname: 'tzvmcguzsxsaoilecclt.supabase.co',
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dm1jZ3V6c3hzYW9pbGVjY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyMDA0LCJleHAiOjIwOTMzMzgwMDR9.-qvQV0uRKtbadBDZwDsl_0POkpF-fRPamNNNYyz6C2E',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dm1jZ3V6c3hzYW9pbGVjY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyMDA0LCJleHAiOjIwOTMzMzgwMDR9.-qvQV0uRKtbadBDZwDsl_0POkpF-fRPamNNNYyz6C2E'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', e => console.error('Error:', e));
req.end();