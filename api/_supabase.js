const { createClient } = require('@supabase/supabase-js');

let cachedClient;
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    const error = new Error('Server configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.');
    error.statusCode = 500;
    throw error;
  }
  if (!cachedClient) {
    cachedClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  }
  return cachedClient;
}

function send(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.json(payload);
}

function toPatient(row) {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    age: row.age,
    gender: row.gender,
    phone: row.phone,
    address: row.address,
    bloodGroup: row.blood_group,
    symptoms: row.symptoms,
    registeredAt: row.registered_at ? String(row.registered_at).slice(0, 10) : ''
  };
}

function cleanPayload(body) {
  const fullName = String(body?.fullName ?? '').trim();
  const age = Number(body?.age);
  const gender = String(body?.gender ?? '').trim();
  const phone = String(body?.phone ?? '').trim();
  const address = String(body?.address ?? '').trim();
  const bloodGroup = String(body?.bloodGroup ?? '').trim();
  const symptoms = String(body?.symptoms ?? '').trim();
  if (!fullName || fullName.length > 100) throw new Error('Enter a patient name (maximum 100 characters).');
  if (!Number.isInteger(age) || age < 0 || age > 120) throw new Error('Age must be a whole number from 0 to 120.');
  if (!['Female', 'Male', 'Other'].includes(gender)) throw new Error('Choose a valid gender.');
  if (!phone || phone.length > 20) throw new Error('Enter a phone number (maximum 20 characters).');
  if (!address || address.length > 250) throw new Error('Enter an address (maximum 250 characters).');
  if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].includes(bloodGroup)) throw new Error('Choose a valid blood group.');
  if (!symptoms || symptoms.length > 300) throw new Error('Enter symptoms/reason for visit (maximum 300 characters).');
  return {
    full_name: fullName,
    age,
    gender,
    phone,
    address,
    blood_group: bloodGroup,
    symptoms
  };
}

module.exports = { getSupabase, send, toPatient, cleanPayload };
