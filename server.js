// Skin Check server proxy — Node 18+ (built-in fetch, no dependencies).
// Run: YOUCAM_API_KEY=your_key node server.js
// Serves index.html and POST /api/skin-analysis.
// The key is read ONLY from the environment, never from the repo or page.
const http = require('http');
const fs = require('fs');
const path = require('path');
const API = 'https://yce-api-01.makeupar.com';
const KEY = process.env.YOUCAM_API_KEY;
if (!KEY) { console.error('Set YOUCAM_API_KEY first.'); process.exit(1); }
const headers = { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };
async function call(p, body) {
  const r = await fetch(API + p, { method: 'POST', headers, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.data?.error || ('YouCam error ' + r.status));
  return j;
}
async function analyse(srcUrl) {
  const task = await call('/s2s/v2.0/task/skin-analysis', {
    src_file_url: srcUrl, format: 'json', pf_camera_kit: false,
    dst_actions: ['acne','dark_circle_v2','droopy_lower_eyelid','droopy_upper_eyelid','eye_bag','firmness','moisture','oiliness','pore','radiance','redness','age_spot','texture','wrinkle','skin_type','tear_trough'],
    miniserver_args: { enable_mask_overlay: false }
  });
  const id = task.data?.task_id || task.task_id;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const r = await fetch(API + '/s2s/v2.0/task/skin-analysis/' + id, { headers });
    const j = await r.json();
    const st = j.data?.task_status || j.task_status;
    if (st === 'success') return j.data || j;
    if (st === 'failed') throw new Error('Skin analysis failed');
  }
  throw new Error('Timed out waiting for Skin AI');
}
function scores(d) {
  const ui = d.ui_scores || {};
  const top = Object.entries(ui).sort((a,b) => (a[1] < b[1] ? 1 : -1)).slice(0, 3).map(([k]) => k.replace(/_/g, ' '));
  return { overall: d.overall_score ?? d.score, skin_type: d.skin_type?.whole || d.skin_type, top_concerns: top,
    next_step: top.length ? ('Focus first on ' + top[0] + ': use a simple routine for it and re-check in two weeks.') : 'Re-check in two weeks.',
    raw: d };
}
const server = http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, {'Content-Type':'text/html'}); return res.end(fs.readFileSync(path.join(__dirname,'index.html')));
  }
  if (req.method === 'POST' && req.url === '/api/skin-analysis') {
    let body = ''; req.on('data', c => body += c); req.on('end', async () => {
      try {
        // This demo endpoint accepts a JSON body {src_file_url} for simplicity.
        // A production upload path would POST /s2s/v2.0/file then PUT the image first.
        const { src_file_url } = JSON.parse(body || '{}');
        if (!src_file_url) throw new Error('Send src_file_url');
        const d = await analyse(src_file_url);
        res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify(scores(d)));
      } catch (e) { res.writeHead(500, {'Content-Type':'application/json'}); res.end(JSON.stringify({error: e.message})); }
    }); return;
  }
  res.writeHead(404); res.end('Not found');
});
server.listen(3000, () => console.log('Skin Check on http://localhost:3000'));
