/**
 * Level Up Arcade — leaderboard backend
 * Paste this whole file into Extensions → Apps Script in your Google Sheet,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 */
const SHEET_NAME = 'Scores';
const TOP_N = 20;

// Score sanity checks, based on the game's maze.
const PELLET_POINTS = 172 * 10;              // every pellet in one maze
const CHERRY_POINTS = 4 * 50;                // four cherries per maze
const BUG_POINTS = 4 * (200 + 400 + 800 + 1600); // all four bugs after every cherry
const MAX_PER_LEVEL = PELLET_POINTS + CHERRY_POINTS + BUG_POINTS;
const MIN_SECONDS_PER_LEVEL = 15;            // fastest realistic clear of one maze
const SECONDS_BETWEEN_POSTS = 8;             // per player name

function doGet() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('top');
  if (hit) return json_({ top: JSON.parse(hit) });
  const top = top_(readAll_(sheet_()));
  cache.put('top', JSON.stringify(top), 10);
  return json_({ top: top });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }

  const name = cleanName_(body.name);
  const score = Math.floor(Number(body.score));
  const level = Math.floor(Number(body.level));
  const secs = Number(body.secs) || 0;

  if (!name) return json_({ ok: false, error: 'bad_name' });
  if (!isFinite(score) || score < 0 || score % 10 !== 0) return json_({ ok: false, error: 'bad_score' });
  if (!isFinite(level) || level < 1 || level > 99) return json_({ ok: false, error: 'bad_score' });
  if (score > maxScore_(level)) return json_({ ok: false, error: 'bad_score' });
  if (secs < MIN_SECONDS_PER_LEVEL * (level - 1)) return json_({ ok: false, error: 'bad_score' });

  const cache = CacheService.getScriptCache();
  const key = 'rl_' + Utilities.base64EncodeWebSafe(name).slice(0, 200);
  if (cache.get(key)) return json_({ ok: false, error: 'too_fast' });
  cache.put(key, '1', SECONDS_BETWEEN_POSTS);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const all = readAll_(sh);
    const mine = all.find(function (r) { return r.name === name; });
    let improved = false, best = score;

    if (!mine) {
      sh.appendRow([name, score, level, new Date()]);
      all.push({ name: name, score: score, level: level });
      improved = true;
    } else if (score > mine.score) {
      sh.getRange(mine.row, 2, 1, 3).setValues([[score, level, new Date()]]);
      mine.score = score; mine.level = level;
      improved = true;
    } else {
      best = mine.score;
    }

    const sorted = all.slice().sort(function (a, b) { return b.score - a.score; });
    const rank = sorted.findIndex(function (r) { return r.name === name; }) + 1;
    const top = top_(all);
    cache.put('top', JSON.stringify(top), 10);
    return json_({ ok: true, improved: improved, best: best, rank: rank, top: top });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- helpers ---------- */
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Name', 'Score', 'Level', 'Updated']);
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@');
  }
  return sh;
}
function readAll_(sh) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 3).getValues()
    .map(function (r, i) { return { row: i + 2, name: String(r[0]).trim(), score: Number(r[1]) || 0, level: Number(r[2]) || 1 }; })
    .filter(function (r) { return r.name; });
}
function top_(all) {
  return all.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, TOP_N)
    .map(function (r) { return { name: r.name, score: r.score, level: r.level }; });
}
function cleanName_(s) {
  return String(s || '')
    .replace(/[^\p{L}\p{N} .'\-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[\-'.]+/, '')
    .toUpperCase();
}
function maxScore_(level) {
  let m = 0;
  for (let l = 1; l <= level; l++) m += MAX_PER_LEVEL + 250 * l;
  return m;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
