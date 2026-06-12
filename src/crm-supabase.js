// MCNA CRM VN - Supabase persistence layer
// Loads every table into the in-memory *_DB arrays at boot, then runs a
// write-behind sync loop: every few seconds it diffs the arrays against
// the last snapshot and pushes upserts/deletes to Supabase. This keeps
// the existing crm.js mutation code untouched while making data durable.
'use strict';

import { createClient } from '@supabase/supabase-js';
import {
  USERS_DB, COMPANIES_DB, CONTACTS_DB, LEADS_DB, DEALS_DB, TASKS_DB,
  ACTIVITIES_DB, QUOTES_DB, INVOICES_DB, PRODUCTS_DB, TICKETS_DB,
  AUDIT_LOG_DB, NOTIFICATIONS_DB, REVENUE_DATA
} from './crm-database.js';

// Known typed columns per table (everything else is folded into `extra`).
const TABLE_COLUMNS = {
  staff_users: ['email','pw','name','role','dept','phone','initials','color','status','joinedAt','lastLogin','target','dealsWon','revenue'],
  companies: ['name','industry','size','website','phone','address','contactsCount','dealsCount','revenue','ownerId','notes'],
  contacts: ['firstName','lastName','fullName','title','companyId','companyName','phone','email','source','ownerId','tags','dealsCount','lastActivity','createdAt','notes'],
  leads: ['leadType','name','company','phone','email','source','status','value','ownerId','createdAt','deadline','priority','notes','tags'],
  deals: ['name','contactId','contactName','companyId','companyName','value','stage','probability','ownerId','expectedClose','createdAt','lastActivity','notes','tags'],
  tasks: ['title','type','description','relatedTo','relatedId','ownerId','dueDate','priority','status','completed','subtasks','tags'],
  activities: ['type','title','contactId','dealId','ownerId','datetime','date','duration','outcome','notes','direction','user'],
  products: ['name','code','category','price','unit','stock','description','emoji','status'],
  quotes: ['number','contactId','contactName','dealId','items','subtotal','vat','total','status','createdAt','validUntil','ownerId','terms','notes'],
  invoices: ['number','quoteId','contactId','contactName','dealId','companyName','items','amount','total','status','dueDate','paidAt','createdAt','notes'],
  tickets: ['number','subject','contactId','contactName','channel','priority','status','agentId','createdAt','lastReply','slaHours','tags','messages'],
  audit_log: ['timestamp','user','action','resource','ip','status'],
  notifications: ['type','title','body','content','time','unread','userId','user'],
};

const TABLE_BINDINGS = {
  staff_users: USERS_DB,
  companies: COMPANIES_DB,
  contacts: CONTACTS_DB,
  leads: LEADS_DB,
  deals: DEALS_DB,
  tasks: TASKS_DB,
  activities: ACTIVITIES_DB,
  products: PRODUCTS_DB,
  quotes: QUOTES_DB,
  invoices: INVOICES_DB,
  tickets: TICKETS_DB,
  audit_log: AUDIT_LOG_DB,
  notifications: NOTIFICATIONS_DB,
};

const SYNC_INTERVAL_MS = 4000;
const LOAD_TIMEOUT_MS = 12000;

let supabase = null;
let cloudReady = false;
const snapshots = {}; // table -> Map(id -> stringified row)
let syncing = false;

export function isCloudEnabled() {
  return cloudReady;
}

// DB row -> app object: merge extra back in, drop null fields, hide seq.
function rowToObject(row) {
  const { seq, extra, ...cols } = row;
  const obj = {};
  for (const [k, v] of Object.entries(cols)) {
    if (v !== null && v !== undefined) obj[k] = v;
  }
  if (extra && typeof extra === 'object') Object.assign(obj, extra);
  return obj;
}

// App object -> uniform DB row: every known column present (null when
// absent) so PostgREST bulk upserts accept mixed-shape records.
function objectToRow(table, obj) {
  const known = TABLE_COLUMNS[table];
  const row = { id: String(obj.id), extra: {} };
  for (const col of known) row[col] = null;
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'id') continue;
    if (v === undefined) continue;
    if (known.includes(k)) row[k] = v;
    else row.extra[k] = v;
  }
  return row;
}

async function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, rej) => {
    timer = setTimeout(() => rej(new Error(`Timeout loading ${label}`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function takeSnapshot(table) {
  const map = new Map();
  for (const obj of TABLE_BINDINGS[table]) {
    if (obj && obj.id !== undefined) map.set(String(obj.id), JSON.stringify(obj));
  }
  snapshots[table] = map;
}

// Boot: pull every table from Supabase into the in-memory arrays.
// Returns true when cloud data is live; false -> caller falls back to seeds.
export async function bootLoadFromCloud() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY chưa cấu hình - chạy chế độ offline.');
    return false;
  }

  supabase = createClient(url, key);

  try {
    const tables = Object.keys(TABLE_BINDINGS);
    // seq DESC: the app's convention is newest-first (records are unshifted
    // onto the front of each array), so loads must match or new rows end up
    // buried at the bottom of every list after a reload.
    const queries = tables.map(t =>
      supabase.from(t).select('*').order('seq', { ascending: false }).limit(2000)
    );
    queries.push(supabase.from('revenue_months').select('*').order('seq', { ascending: true }));

    const results = await withTimeout(Promise.all(queries), LOAD_TIMEOUT_MS, 'tables');

    for (const res of results) {
      if (res.error) throw new Error(res.error.message);
    }

    const staffRows = results[tables.indexOf('staff_users')].data || [];
    if (staffRows.length === 0) {
      console.warn('[Supabase] Bảng staff_users trống - dùng dữ liệu seed offline.');
      return false;
    }

    tables.forEach((t, idx) => {
      const arr = TABLE_BINDINGS[t];
      arr.length = 0;
      for (const row of results[idx].data || []) arr.push(rowToObject(row));
      takeSnapshot(t);
    });

    // Heal legacy rows: leads created by older builds lack leadType and were
    // invisible in both the B2B and B2C tabs. Mutating after the snapshot
    // means the sync loop writes the fix back to Supabase automatically.
    for (const l of LEADS_DB) {
      if (!l.leadType) {
        l.leadType = (l.company && l.company !== 'Khách hàng cá nhân') ? 'b2b' : 'b2c';
      }
    }

    // Revenue history is load-only (charts never mutate it).
    const revRows = results[results.length - 1].data || [];
    if (revRows.length > 0) {
      REVENUE_DATA.length = 0;
      for (const row of revRows) {
        REVENUE_DATA.push({ month: row.month, revenue: Number(row.revenue), wonDeals: Number(row.wonDeals) });
      }
    }

    cloudReady = true;
    startSyncLoop();
    console.info(`[Supabase] Đã nạp dữ liệu cloud: ${CONTACTS_DB.length} khách hàng, ${USERS_DB.length} nhân sự, ${LEADS_DB.length} leads.`);
    return true;
  } catch (err) {
    console.error('[Supabase] Lỗi nạp dữ liệu, chuyển sang chế độ offline:', err);
    cloudReady = false;
    return false;
  }
}

async function syncTable(table) {
  const arr = TABLE_BINDINGS[table];
  const prev = snapshots[table] || new Map();
  const seenIds = new Set();
  const upserts = [];

  for (const obj of arr) {
    if (!obj || obj.id === undefined) continue;
    const id = String(obj.id);
    seenIds.add(id);
    const json = JSON.stringify(obj);
    if (prev.get(id) !== json) upserts.push(objectToRow(table, obj));
  }

  const deletes = [];
  for (const id of prev.keys()) {
    if (!seenIds.has(id)) deletes.push(id);
  }

  if (upserts.length === 0 && deletes.length === 0) return;

  if (upserts.length > 0) {
    const { error } = await supabase.from(table).upsert(upserts, { onConflict: 'id' });
    if (error) throw new Error(`upsert ${table}: ${error.message}`);
  }
  if (deletes.length > 0) {
    const { error } = await supabase.from(table).delete().in('id', deletes);
    if (error) throw new Error(`delete ${table}: ${error.message}`);
  }

  takeSnapshot(table);
}

export async function syncNow() {
  if (!cloudReady || syncing) return;
  syncing = true;
  try {
    for (const table of Object.keys(TABLE_BINDINGS)) {
      await syncTable(table);
    }
  } catch (err) {
    // Network hiccups are retried on the next tick; data stays in memory.
    console.warn('[Supabase] Sync lỗi (sẽ thử lại):', err.message || err);
  } finally {
    syncing = false;
  }
}

function startSyncLoop() {
  setInterval(syncNow, SYNC_INTERVAL_MS);
  window.addEventListener('beforeunload', () => { syncNow(); });
  if (typeof window !== 'undefined') window.forceCrmSync = syncNow;
}
