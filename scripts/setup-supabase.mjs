// Creates the Supabase project, applies schema.sql + seed.sql, and prints
// the project URL + anon key. Token comes from SUPABASE_ACCESS_TOKEN env.
import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.supabase.com';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('Missing SUPABASE_ACCESS_TOKEN'); process.exit(1); }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.join(__dirname, '..', 'supabase');

async function api(method, route, body) {
  const res = await fetch(`${API}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!res.ok) {
    throw new Error(`${method} ${route} -> ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`);
  }
  return json;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  // 1. Organization
  const orgs = await api('GET', '/v1/organizations');
  if (!orgs?.length) throw new Error('No Supabase organization found on this account.');
  const org = orgs[0];
  console.log(`Org: ${org.name} (${org.id})`);

  // 2. Reuse existing project if present, otherwise create
  const projects = await api('GET', '/v1/projects');
  let project = projects.find(p => p.name === 'crm-mcna');
  if (project) {
    console.log(`Reusing existing project: ${project.id}`);
  } else {
    const dbPass = 'Mcna' + randomBytes(18).toString('base64url') + '9!';
    writeFileSync(path.join(__dirname, 'db-password.local.txt'), dbPass, 'utf8');
    project = await api('POST', '/v1/projects', {
      organization_id: org.id,
      name: 'crm-mcna',
      db_pass: dbPass,
      region: 'ap-southeast-1',
    });
    console.log(`Created project: ${project.id}`);
  }
  const ref = project.id;

  // 3. Wait until healthy
  process.stdout.write('Waiting for project to become healthy');
  for (let i = 0; i < 90; i++) {
    const p = await api('GET', `/v1/projects/${ref}`);
    if (p.status === 'ACTIVE_HEALTHY') { console.log(' OK'); break; }
    if (i === 89) throw new Error(`Project not healthy in time (status: ${p.status})`);
    process.stdout.write('.');
    await sleep(5000);
  }

  // 4. Apply schema then seed
  for (const file of ['schema.sql', 'seed.sql']) {
    const sql = readFileSync(path.join(sqlDir, file), 'utf8');
    console.log(`Applying ${file} (${sql.length} chars)...`);
    await api('POST', `/v1/projects/${ref}/database/query`, { query: sql });
    console.log(`  ${file} OK`);
  }

  // 5. Sanity counts
  const counts = await api('POST', `/v1/projects/${ref}/database/query`, {
    query: `select (select count(*) from contacts) as customers,
                   (select count(*) from staff_users) as staff,
                   (select count(*) from leads) as leads,
                   (select count(*) from deals) as deals;`,
  });
  console.log('Row counts:', JSON.stringify(counts));

  // 6. Anon key
  let keys = await api('GET', `/v1/projects/${ref}/api-keys?reveal=true`).catch(() => null);
  if (!keys) keys = await api('GET', `/v1/projects/${ref}/api-keys`);
  const anon = keys.find(k => k.name === 'anon' || k.id === 'anon');
  if (!anon?.api_key) throw new Error('Could not retrieve anon key: ' + JSON.stringify(keys.map(k => k.name)));

  const url = `https://${ref}.supabase.co`;
  console.log('SUPABASE_URL=' + url);
  console.log('SUPABASE_ANON_KEY=' + anon.api_key);

  writeFileSync(path.join(__dirname, '..', '.env'),
    `VITE_SUPABASE_URL="${url}"\nVITE_SUPABASE_ANON_KEY="${anon.api_key}"\n`, 'utf8');
  console.log('.env written.');
}

main().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
