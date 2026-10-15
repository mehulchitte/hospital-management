const { getSupabase, send, toPatient, cleanPayload } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Method not allowed.' });
  }
  try {
    const supabase = getSupabase();
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('patients').select('*').order('id', { ascending: false }).limit(1000);
      if (error) throw error;
      const q = String(req.query?.q ?? '').trim().toLowerCase();
      let patients = (data || []).map(toPatient);
      if (q) {
        patients = patients.filter(p =>
          String(p.id).includes(q) ||
          `pt-${String(p.id).padStart(4, '0')}`.includes(q) ||
          p.fullName.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.symptoms.toLowerCase().includes(q)
        );
      }
      return send(res, 200, patients);
    }
    let payload;
    try { payload = cleanPayload(req.body); }
    catch (e) { return send(res, 400, { error: e.message }); }
    const { data, error } = await supabase.from('patients').insert(payload).select('*').single();
    if (error) throw error;
    return send(res, 201, toPatient(data));
  } catch (error) {
    console.error('Patients API error:', error);
    return send(res, error.statusCode || 500, { error: error.statusCode ? error.message : 'Database request failed. Check the Supabase table and Vercel environment variables.' });
  }
};
