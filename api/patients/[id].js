const { getSupabase, send, toPatient, cleanPayload } = require('../_supabase');

module.exports = async function handler(req, res) {
  if (!['PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'PUT, DELETE');
    return send(res, 405, { error: 'Method not allowed.' });
  }
  const id = Number(req.query?.id);
  if (!Number.isSafeInteger(id) || id < 1) return send(res, 400, { error: 'Invalid patient ID.' });
  try {
    const supabase = getSupabase();
    if (req.method === 'DELETE') {
      const { data, error } = await supabase.from('patients').delete().eq('id', id).select('id').maybeSingle();
      if (error) throw error;
      if (!data) return send(res, 404, { error: 'Patient record not found.' });
      return send(res, 200, { success: true });
    }
    let payload;
    try { payload = cleanPayload(req.body); }
    catch (e) { return send(res, 400, { error: e.message }); }
    const { data, error } = await supabase.from('patients').update(payload).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return send(res, 404, { error: 'Patient record not found.' });
    return send(res, 200, toPatient(data));
  } catch (error) {
    console.error('Patient detail API error:', error);
    return send(res, error.statusCode || 500, { error: error.statusCode ? error.message : 'Database request failed. Check the Supabase table and Vercel environment variables.' });
  }
};
