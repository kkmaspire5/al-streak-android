/* A/L Streak: app logic. Content lives in questions.js. */
const $ = s => document.querySelector(s);
const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SJ = SUBJECTS, SK = Object.keys(SJ);
const AV = ['🦊', '🐼', '🐙', '🦉', '🐝', '🦒', '🦄', '🤖'], DN = 'SMTWTFS';
const VERSION = 4;                       // bumps when saved data needs migrating
const TYPE_ORDER = { mcq: 0, tf: 1, fill: 2, match: 3, order: 4 };

/* ---------- content prep ---------- */
const CH = CHAPTERS.map(c => ({ ...c, key: c.s + '|' + c.title }));
const Q = [];
CH.forEach(c => c.qs.forEach(q => Q.push({ ...q, s: c.s, c: c.title, key: c.key, id: q.q })));

/* ---------- storage + helpers ---------- */
const ld = k => { try { return JSON.parse(localStorage.getItem(k)) } catch (e) { return null } };
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } };
const dt = d => new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const today = () => dt(new Date()), yest = () => dt(new Date(Date.now() - 864e5));
const wkOf = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dt(d) };
const shuf = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b };
const pick1 = a => a[Math.floor(Math.random() * a.length)];
const hash = async (p, s) => {
  const t = s + p;
  if (window.crypto && crypto.subtle) return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(x => x.toString(16).padStart(2, '0')).join('');
  let a = 0xdeadbeef, b = 0x41c6ce57;
  for (let i = 0; i < t.length; i++) { const c = t.charCodeAt(i); a = Math.imul(a ^ c, 2654435761); b = Math.imul(b ^ c, 1597334677) }
  a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909);
  return 'f' + (a >>> 0).toString(16) + (b >>> 0).toString(16);
};

/* ---------- state ---------- */
let U = null, P = null, scr = 'auth', tab = 'home', mode = 'in', err = '', step = 0;
let L = null, R = null, N = null, lsub = 'A', migrated = false, backArm = 0;
let SET = Object.assign({ sfx: true, hap: true }, ld('al3:set') || {});

const newP = () => ({ xp: 0, streak: 0, best: 0, last: '', day: '', dxp: 0, dl: 0, dcb: 0, wk: '', wxp: 0, bad: [], days: {}, mins: {}, chest: '', cd: {}, lessons: 0, maxcb: 0, perf: 0, fixed: 0, papers: 0, wrote: 0, lastCh: '' });
const roll = () => { if (P.day !== today()) { P.day = today(); P.dxp = 0; P.dl = 0; P.dcb = 0 } if (P.wk !== wkOf()) { P.wk = wkOf(); P.wxp = 0 } };
const persist = () => sv('al3:d:' + U.u, { U, P });
const lvl = () => Math.floor(P.xp / 300) + 1;
const subs = () => SK.filter(k => U.subs.includes(k));
const goal = () => U.goal || 60;

/* ---------- sound + haptics ---------- */
let AC = null;
const TONES = {
  tap: [[520, .04]], ok: [[660, .09], [880, .14]], no: [[200, .16], [150, .22]],
  done: [[523, .1], [659, .1], [784, .1], [1047, .28]], lvl: [[392, .1], [523, .1], [659, .1], [784, .1], [1047, .1], [1319, .3]], chest: [[880, .07], [1109, .07], [1319, .2]]
};
function snd(n) {
  if (!SET.sfx) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    let t = AC.currentTime;
    (TONES[n] || []).forEach(([f, d]) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = n === 'no' ? 'sawtooth' : 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .03); t += d * .9;
    });
  } catch (e) { }
}
const buzz = p => { if (SET.hap && navigator.vibrate) { try { navigator.vibrate(p) } catch (e) { } } };
function setOpt(k) { SET[k] = !SET[k]; sv('al3:set', SET); if (SET[k]) { k === 'sfx' ? snd('ok') : buzz(40) } draw() }

/* ---------- small UI pieces ---------- */
function toast(t) { const e = $('#toast'); e.innerHTML = `<div class="t">${esc(t)}</div>`; clearTimeout(toast.h); toast.h = setTimeout(() => e.innerHTML = '', 2400) }
function addXp(g) { P.xp += g; P.dxp += g; P.wxp += g }
function touch() {
  const first = P.last !== today();
  if (first) { P.streak = P.last === yest() ? P.streak + 1 : 1; P.last = today() }
  P.best = Math.max(P.best || 0, P.streak); P.days[today()] = 1; return first;
}
function owl(m, z) {
  const ch = m === 'cheer', sd = m === 'sad';
  return `<svg class="owl ${ch ? 'cheer' : ''}" width="${z}" height="${z * 1.1}" viewBox="0 0 100 110" aria-hidden="true"><ellipse cx="50" cy="106" rx="26" ry="3" fill="#0002"/>
<ellipse cx="40" cy="101" rx="8" ry="3.5" fill="#FF9B3D"/><ellipse cx="60" cy="101" rx="8" ry="3.5" fill="#FF9B3D"/>
<ellipse class="wl" cx="18" cy="64" rx="8" ry="17" fill="#4A3FC4" transform="rotate(12 18 48)"/><ellipse class="wr" cx="82" cy="64" rx="8" ry="17" fill="#4A3FC4" transform="rotate(-12 82 48)"/>
<ellipse cx="50" cy="60" rx="31" ry="40" fill="url(#owlg)"/><ellipse cx="50" cy="78" rx="19" ry="20" fill="#EDEAFF"/><circle cx="37" cy="43" r="13" fill="#F4F1FF"/><circle cx="63" cy="43" r="13" fill="#F4F1FF"/>
${ch ? '<path d="M31 43q6-8 12 0M57 43q6-8 12 0" stroke="#151515" stroke-width="3" fill="none" stroke-linecap="round"/>' : '<g class="eye"><circle cx="37" cy="43" r="7.5" fill="#fff"/><circle cx="37" cy="43" r="4.6" fill="#151515"/><circle cx="35.5" cy="41.5" r="1.6" fill="#fff"/><circle cx="63" cy="43" r="7.5" fill="#fff"/><circle cx="63" cy="43" r="4.6" fill="#151515"/><circle cx="61.5" cy="41.5" r="1.6" fill="#fff"/></g>'}
${sd ? '<path d="M26 34l14-4M60 30l14 4" stroke="#151515" stroke-width="2.4" stroke-linecap="round"/>' : ''}
<path d="M46 50h8l-4 8z" fill="#FF9B3D"/><path d="M32 30v6q18 9 36 0v-6z" fill="#2A3566"/><path d="M15 25l35-14 35 14-35 11z" fill="#151515"/><path d="M50 24l30 4v8" stroke="#FFC857" stroke-width="1.6" fill="none"/><circle cx="80" cy="38" r="2.4" fill="#FFC857"/>${ch ? '<text x="0" y="18" font-size="13">✨</text><text x="84" y="14" font-size="12">⭐</text>' : ''}</svg>`;
}
function ring(p, sz, w, col) {
  const r = (sz - w) / 2, c = 2 * Math.PI * r, m = sz / 2;
  return `<svg class="ring" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="${m}" cy="${m}" r="${r}" stroke="#0001" stroke-width="${w}" fill="none"/><circle cx="${m}" cy="${m}" r="${r}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, p))}" transform="rotate(-90 ${m} ${m})"/></svg>`;
}
const hm = m => [String(Math.floor(m / 60)).padStart(2, '0'), String(m % 60).padStart(2, '0')];
function wk7() { return [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5), k = dt(d); return { k, l: DN[d.getDay()], m: P.mins[k] || 0 } }) }
const chDone = c => Math.min(3, P.cd[c.key] || 0);
const subDone = s => CH.filter(c => c.s === s && chDone(c) >= 3).length;
const subTotal = s => CH.filter(c => c.s === s).length;

/* ---------- auth + onboarding ---------- */
function login(u) {
  const d = ld('al3:d:' + u); if (!d) return false;
  U = d.U; P = Object.assign(newP(), d.P); roll();
  if ((U.v || 1) < VERSION) {            // Business Studies and ICT became two subjects
    if (!U.subs.includes('B')) U.subs.push('B');
    U.goal = U.goal || 60; U.v = VERSION; migrated = true; persist();
  }
  sv('al3:cur', u); scr = U.name ? 'app' : 'onb'; tab = 'home'; lsub = subs()[0] || 'A'; return true;
}
async function submit() {
  const u = $('#u').value.trim().toLowerCase(), p = $('#p').value; err = '';
  if (!/^[a-z0-9_]{3,16}$/.test(u)) err = 'Username: 3-16 letters, numbers or _';
  else if (p.length < 4) err = 'Password needs at least 4 characters';
  else {
    const us = ld('al3:users') || {};
    if (mode === 'up') {
      if (us[u]) err = 'That username is taken on this device';
      else {
        const s = Math.random().toString(36).slice(2);
        us[u] = { s, h: await hash(p, s) }; sv('al3:users', us);
        U = { u, name: '', av: AV[0], stream: 'Commerce', subs: [...SK], goal: 60, v: VERSION }; P = newP(); roll(); persist(); sv('al3:cur', u); scr = 'onb'; step = 0;
      }
    } else { const r = us[u]; if (!r || r.h !== await hash(p, r.s)) err = 'Wrong username or password'; else login(u) }
  }
  draw();
}
function logout() { sv('al3:cur', null); U = P = null; scr = 'auth'; mode = 'in'; draw() }
function authV() {
  const up = mode === 'up';
  return `<div class="q" style="padding-top:20px"><img class="logo" src="logo.png" alt="" onerror="this.style.display='none'"><div class="c pu">A/L Streak</div><div class="c">${owl('happy', 130)}</div>
<h1 class="c">${up ? 'Make your account.' : 'Your brain called. It wants more.'}</h1><p class="mu c">${up ? 'Pick a username and password. No email needed.' : 'Small lessons. Big wins. Zero pressure.'}</p>
<div class="fld"><label>Username</label><input id="u" autocomplete="username" autocapitalize="none" autocorrect="off"></div>
<div class="fld"><label>Password</label><input id="p" type="password" autocomplete="${up ? 'new' : 'current'}-password" onkeydown="if(event.key=='Enter')submit()"></div>
<div style="color:var(--rd);font-weight:700;min-height:20px;padding-left:10px">${esc(err)}</div>
<button class="pill" onclick="submit()">${up ? 'Sign up' : 'Log in'}</button>
<p class="c mu">${up ? 'Have an account?' : 'New here?'} <u class="go" style="color:var(--ink)" onclick="mode='${up ? 'in' : 'up'}';err='';draw()">${up ? 'Log in' : 'Sign up'}</u></p></div>`;
}
function keep() { const n = $('#nm'); if (n) U.name = n.value.trim().slice(0, 16); persist() }
function tgs(k) {
  const i = U.subs.indexOf(k);
  if (i >= 0 && U.subs.length === 1) return toast('Keep at least one subject');
  i < 0 ? U.subs.push(k) : U.subs.splice(i, 1); persist(); if (!subs().includes(lsub)) lsub = subs()[0]; draw();
}
function onbV() {
  if (step === 0) return `<div class="q"><div class="c">${owl('cheer', 110)}</div><h1>Who are you?</h1><p class="mu">Friends will see this on the leaderboard.</p>
<div class="fld"><label>Display name</label><input id="nm" maxlength="16" value="${esc(U.name)}"></div>
<div class="row wr" style="margin:14px 0">${AV.map(a => `<button class="av ${U.av === a ? 'on' : ''}" onclick="U.av='${a}';keep();draw()">${a}</button>`).join('')}</div>
<button class="pill" onclick="keep();if(!U.name)return toast('Enter a name');step=1;draw()">Continue</button></div>`;
  if (step === 1) return `<div class="q"><h1>Your stream</h1><div class="row wr"><button class="chip on">Commerce</button><button class="chip" disabled>Maths · soon</button><button class="chip" disabled>Bio · soon</button><button class="chip" disabled>Arts · soon</button></div>
<h2>Subjects</h2><p class="mu" style="margin:0 0 10px">Pick the ones you study. You can change this later.</p>
<div class="row wr">${SK.map(k => `<button class="chip ${U.subs.includes(k) ? 'on' : ''}" onclick="tgs('${k}')">${SJ[k].icon} ${SJ[k].name}</button>`).join('')}</div>
<button class="pill" style="margin-top:28px" onclick="if(!subs().length)return toast('Pick a subject');step=2;draw()">Continue</button></div>`;
  return `<div class="q"><div class="c">${owl('happy', 100)}</div><h1>Daily goal</h1><p class="mu">How much XP do you want to earn each day? One lesson is about 50 XP.</p>
${goalPick()}<button class="pill" style="margin-top:24px" onclick="lsub=subs()[0];persist();scr='app';draw()">Let's go</button></div>`;
}
function goalPick() {
  return [[30, 'Casual', 'about 1 lesson'], [60, 'Regular', 'about 2 lessons'], [100, 'Serious', 'about 3 lessons']].map(g =>
    `<div class="card go row" style="margin:8px 0;${goal() === g[0] ? 'outline:3px solid var(--blk)' : ''}" onclick="U.goal=${g[0]};persist();snd('tap');draw()"><b style="font-size:22px;width:56px">${g[0]}</b><div class="fl1"><b>${g[1]}</b><div class="mu">${g[2]} a day</div></div>${goal() === g[0] ? '✓' : ''}</div>`).join('');
}

/* ---------- HOME ---------- */
function nextCh() {
  const ok = c => subs().includes(c.s) && chDone(c) < 3;
  const last = CH.findIndex(c => c.key === P.lastCh && ok(c));
  if (last >= 0) return last;
  const i = CH.findIndex(ok); return i >= 0 ? i : Math.max(0, CH.findIndex(c => subs().includes(c.s)));
}
function homeV() {
  const w = wk7(), mx = Math.max(20, ...w.map(x => x.m)), tot = w.reduce((a, x) => a + x.m, 0), ni = nextCh(), nc = CH[ni], [h, m] = hm(tot);
  const gp = P.dxp / goal(), badCount = Q.filter(q => P.bad.includes(q.id)).length;
  const msg = gp >= 1 ? 'Daily goal smashed! Anything extra is a bonus.' : P.dl ? 'Nice work today! One more lesson keeps the streak glowing.' : P.streak ? `You are on a ${P.streak}-day streak. Let's keep it going!` : 'Three short lessons a week builds a habit. I will be right here.';
  return `<div class="row sp"><div class="row"><button class="av" onclick="tab='me';draw()" aria-label="Profile">${U.av}</button><div><b style="font-size:20px">${esc(U.name)}</b><div class="pu">Student · Level ${lvl()}</div></div></div><div class="chipx" style="background:#FFE9D2"><span class="flame">🔥</span> ${P.streak}</div></div>
<div class="card go row" style="background:var(--lav);border-radius:32px;padding:20px;margin-top:16px" onclick="startChap(${ni})"><div class="fl1"><b style="font-size:18px">${P.lessons} lessons completed</b><div class="mu" style="margin:2px 0 12px">Next: ${esc(nc.title)} · ${SJ[nc.s].name}</div><div class="bar sh"><i style="width:${Math.max(6, chDone(nc) / 3 * 100)}%"></i></div></div><div class="av" style="background:var(--blk);width:58px;height:58px;color:#fff;font-size:24px">▶</div></div>
<div class="card row" style="gap:14px"><div style="position:relative;width:78px;height:78px;flex:none">${ring(gp, 78, 10, gp >= 1 ? 'var(--gr)' : 'var(--pu)')}<div style="position:absolute;inset:0;display:grid;place-items:center;font-weight:900;font-size:15px">${gp >= 1 ? '🎯' : Math.round(gp * 100) + '%'}</div></div>
<div class="fl1"><b>Daily goal</b><div class="mu">${Math.min(P.dxp, goal())}/${goal()} XP today</div></div><div>${owl(gp >= 1 ? 'cheer' : 'happy', 56)}</div></div>
<div class="row" style="align-items:flex-start"><div class="tip" style="margin:0 0 0 8px">${esc(msg)}</div></div>
<h2>Subjects</h2><div class="mu" style="margin-bottom:12px">Explore your A/L Commerce journey</div>
<div class="grid">${subs().map(k => `<div class="tile" style="background:${SJ[k].color}" onclick="lsub='${k}';tab='learn';draw()"><div>${SJ[k].name}<small>${subDone(k)}/${subTotal(k)} units done</small></div><span>${SJ[k].icon}</span></div>`).join('')}
<div class="tile" style="background:var(--pink)" onclick="paper()"><div>Past Paper<small>5 min sprint</small></div><span>📝</span></div>
<div class="tile" style="background:var(--mint)" onclick="fixMistakes()">${badCount ? `<i class="cnt" style="font-style:normal">${badCount}</i>` : ''}<div>Fix Mistakes<small>${badCount ? 'Retry what you missed' : 'Nothing to fix'}</small></div><span>🛠️</span></div>
<div class="tile" style="background:var(--pe)" onclick="startWritten()"><div>Written<small>Structured answers</small></div><span>✍️</span></div>
<div class="tile" style="background:var(--lav)" onclick="toast('Duels need internet. Coming with the online version')"><div>Duels<small>Coming soon</small></div><span>⚔️</span></div></div>
<div class="blk"><div style="font-size:13px;color:#fffa">Progress Learning · last 7 days</div><div class="bt"><b>${h}</b><small>hr </small><b>${m}</b><small>min</small></div>
<div class="bars">${w.map((x, i) => `<div>${i === 6 ? `<em>${x.m}m</em>` : ''}<i class="${i === 6 ? 'hi' : ''}" style="height:${Math.max(14, x.m / mx * 92)}px"></i>${x.l}</div>`).join('')}</div></div>`;
}

/* ---------- LEARN (winding path) ---------- */
function learnV() {
  const cs = CH.map((c, i) => [c, i]).filter(x => x[0].s === lsub), curI = nextCh();
  const xs = [-44, 38, -8], names = ['Learn', 'Practice', 'Challenge'];
  const path = cs.map(([c, i], u) => {
    const d = chDone(c);
    const nodes = [0, 1, 2].map(k => {
      const st = k < d ? 'done' : k === d ? 'cur' : 'lock', x = xs[k];
      const ic = st === 'done' ? '⭐' : st === 'lock' ? '🔒' : [c.icon, '💪', '🏆'][k];
      const m = (i === curI && st === 'cur') ? `<div class="mas ${x < 0 ? 'r' : 'l'}">${owl('happy', 62)}</div><div class="start">START</div>` : '';
      return `<div class="nw" style="transform:translateX(${x}px)">${m}<button class="node ${st}" onclick="tapNode(${i},${k})" aria-label="${esc(c.title)} ${names[k]}">${ic}</button><div class="nlab">${names[k]}</div></div>`;
    }).join('');
    return `<div class="ban" style="background:${SJ[c.s].color}"><div><small>UNIT ${u + 1} · ${d}/3</small><b>${c.icon} ${esc(c.title)}</b></div><button class="nb" onclick="openNotes(${i},'view')" aria-label="Notes">📖</button></div><div class="path">${nodes}</div>`;
  }).join('');
  return `<h1 class="c" style="font-size:23px">Check your learning roadmap and upcoming lessons</h1>
<div class="row wr" style="justify-content:center;margin:10px 0">${subs().map(k => `<button class="chip ${k === lsub ? 'on' : ''}" onclick="lsub='${k}';draw()">${SJ[k].icon} ${SJ[k].name}</button>`).join('')}</div>
<div class="card row sp" style="padding:14px 8px">${wk7().map(x => `<div class="c mu fl1">${x.l}<div style="width:34px;height:34px;border-radius:50%;margin:5px auto 0;display:grid;place-items:center;color:#fff;font-size:15px;background:${P.days[x.k] ? 'var(--blk)' : '#EFEDF7'}">${P.days[x.k] ? '🎓' : ''}</div></div>`).join('')}</div>
<h2>My Courses</h2>${path || '<div class="card c mu">No units yet for this subject.</div>'}`;
}
function tapNode(i, k) {
  const c = CH[i], d = chDone(c);
  if (k > d) { snd('no'); return toast('Finish the earlier lesson first') }
  snd('tap'); startChap(i, k);
}

/* ---------- NOTES ---------- */
function openNotes(i, how) { N = { i, n: 0, how }; scr = 'notes'; snd('tap'); draw() }
function notesV() {
  const c = CH[N.i], nt = c.notes, k = nt[N.n], last = N.n === nt.length - 1;
  return `<div class="q"><div class="top"><button class="x" onclick="scr='app';draw()" aria-label="Close">✕</button><div class="dots">${nt.map((_, j) => `<i class="${j <= N.n ? 'on' : ''}"></i>`).join('')}</div></div>
<div class="note" style="background:${SJ[c.s].color}"><div class="em">${c.icon}</div><div class="mu" style="color:#0009;font-weight:800">${esc(c.title)} · Note ${N.n + 1}/${nt.length}</div><h2>${esc(k.h)}</h2><p>${esc(k.b)}</p>${k.k ? `<div class="key">${esc(k.k)}</div>` : ''}</div>
<div class="row">${N.n ? '<button class="pill w" style="flex:1" onclick="N.n--;snd(\'tap\');draw()">Back</button>' : ''}<button class="pill pu2" style="flex:2" onclick="nextNote()">${last ? (N.how === 'learn' ? 'Start lesson' : 'Done') : 'Next'}</button></div></div>`;
}
function nextNote() {
  snd('tap');
  if (N.n < CH[N.i].notes.length - 1) { N.n++; return draw() }
  const i = N.i, how = N.how; N = null; scr = 'app';
  how === 'learn' ? beginChap(i, 0) : draw();
}

/* ---------- LESSON SETUP ---------- */
function startChap(i, k) {
  const c = CH[i], d = chDone(c), no = k == null ? Math.min(d, 2) : k;
  if (no === 0 && d === 0 && c.notes && c.notes.length) return openNotes(i, 'learn');
  beginChap(i, no);
}
function beginChap(i, no) {
  const c = CH[i], own = Q.filter(q => q.key === c.key);
  let list = no === 0 ? [...own].sort((a, b) => TYPE_ORDER[a.t] - TYPE_ORDER[b.t]) : shuf(own);
  if (no > 0) list = [...list.filter(q => P.bad.includes(q.id)), ...list.filter(q => !P.bad.includes(q.id))];
  if (list.length < 5) list = [...list, ...shuf(Q.filter(q => q.s === c.s && q.key !== c.key)).slice(0, 5 - list.length)];
  P.lastCh = c.key; go(list.slice(0, 6), { mode: 'chap', key: c.key, no });
}
function paper() { go(shuf(Q.filter(q => subs().includes(q.s))).slice(0, 8), { mode: 'paper' }) }
function fixMistakes() {
  const l = shuf(Q.filter(q => P.bad.includes(q.id))).slice(0, 8);
  if (!l.length) return toast('No mistakes to fix. Great job! 🎉');
  go(l, { mode: 'fix' });
}
function go(qs, o) {
  if (!qs.length) return toast('No questions yet');
  L = { qs, i: 0, h: 3, right: 0, cb: 0, bc: 0, xp: 0, o: [], mode: o.mode, key: o.key, no: o.no, end: Date.now() + 3e5, t0: Date.now() };
  if (L.mode === 'paper') L.iv = setInterval(() => { const t = Math.max(0, L.end - Date.now()), e = $('#tm'); if (e) e.textContent = Math.floor(t / 6e4) + ':' + String(Math.floor(t / 1e3) % 60).padStart(2, '0'); if (!t) fin() }, 1e3);
  initQ(); scr = 'app'; draw();
}
function initQ() {
  const q = L.qs[L.i];
  L.sel = null; L.ans = false; L.good = false; L.val = ''; L.enter = true; L.xpq = 0;
  if (q.t === 'mcq') L.o = shuf([q.a, ...q.w]);
  if (q.t === 'match') { const ix = q.pairs.map((_, i) => i); L.mt = { l: shuf(ix), r: shuf(ix), sl: null, sr: null, done: [], miss: 0, bad: false } }
  if (q.t === 'order') { const ix = q.items.map((_, i) => i); let b = shuf(ix), n = 0; while (ix.length > 1 && b.join() === ix.join() && n++ < 9) b = shuf(ix); L.od = { bank: b, ans: [] } }
}
const heartsHtml = () => '❤️'.repeat(Math.max(0, L.h)) + '🖤'.repeat(Math.max(0, 3 - L.h));

/* ---------- LESSON SCREEN ---------- */
const OK_MSG = ['Correct!', 'Nice one!', 'You nailed it!', 'Brilliant!', 'Spot on!', 'Great work!'];
const NO_MSG = ["Not quite. You've got this!", 'Almost there!', 'Good try. Learn from it!', 'Oops! Next time.'];
const LABEL = { mcq: 'Choose the answer', tf: 'True or false?', fill: 'Type the answer', match: 'Tap the matching pairs', order: 'Tap the items in the right order' };
function correctText(q) {
  return q.t === 'mcq' ? q.a : q.t === 'tf' ? (q.a ? 'True' : 'False') : q.t === 'fill' ? q.a[0] : q.t === 'order' ? q.items.join(' → ') : q.pairs.map(p => p[0] + ' = ' + p[1]).join(' · ');
}
function qBody(q, on) {
  if (q.t === 'mcq') return L.o.map((o, i) => `<button class="opt ${on ? (o === q.a ? 'ok' : i === L.sel ? 'no' : '') : (L.sel === i ? 'sel' : '')}" ${on ? 'disabled' : ''} onclick="pick(${i})"><i>${'ABCD'[i]}</i>${esc(o)}</button>`).join('');
  if (q.t === 'tf') return `<div class="tfs">${[true, false].map(v => `<button class="tfb ${on ? (v === q.a ? 'ok' : v === L.sel ? 'no' : '') : (L.sel === v ? 'sel' : '')}" ${on ? 'disabled' : ''} onclick="pick(${v})">${v ? '✓ True' : '✗ False'}</button>`).join('')}</div>`;
  if (q.t === 'fill') return `<input id="fi" class="fi ${on ? (L.good ? 'ok' : 'no') : ''}" ${on ? 'disabled' : ''} value="${esc(L.val)}" placeholder="Type here" autocomplete="off" autocapitalize="none" oninput="L.val=this.value;$('#ck').disabled=!this.value.trim()" onkeydown="if(event.key=='Enter'&&L.val.trim())chk()">`;
  if (q.t === 'match') {
    const m = L.mt, cell = (side, i) => {
      const dn = m.done.includes(i), sel = side === 'l' ? m.sl === i : m.sr === i, txt = q.pairs[i][side === 'l' ? 0 : 1];
      return `<button class="mb ${dn ? 'dn c' + (m.done.indexOf(i) % 5) : ''} ${sel ? (m.bad ? 'bad' : 'sel') : ''}" ${dn || on ? 'disabled' : ''} onclick="mtap('${side}',${i})">${esc(txt)}</button>`;
    };
    return `<div class="mt"><div>${m.l.map(i => cell('l', i)).join('')}</div><div>${m.r.map(i => cell('r', i)).join('')}</div></div>`;
  }
  if (q.t === 'order') {
    const od = L.od;
    return `<div class="ol">${od.ans.length ? od.ans.map(i => `<button class="oc" ${on ? 'disabled' : ''} onclick="otap('a',${i})">${esc(q.items[i])}</button>`).join('') : '<span class="ph">Tap the items below</span>'}</div><div class="ob">${od.bank.map(i => `<button class="oc" ${on ? 'disabled' : ''} onclick="otap('b',${i})">${esc(q.items[i])}</button>`).join('')}</div>`;
  }
  return '';
}
function lessonV() {
  if (L.mode === 'written') return writtenV();
  const q = L.qs[L.i], on = L.ans;
  const ready = q.t === 'mcq' || q.t === 'tf' ? L.sel != null : q.t === 'fill' ? !!L.val.trim() : q.t === 'order' ? L.od.ans.length === q.items.length : false;
  const right = on && L.good, msg = right ? OK_MSG[L.i % OK_MSG.length] : NO_MSG[L.i % NO_MSG.length];
  return `<div class="q"><div class="top"><button class="x" onclick="quit()" aria-label="Close">✕</button><span class="chipx">Question ${L.i + 1}/${L.qs.length}</span><span class="fl1"></span>${L.mode === 'paper' ? '<b id="tm" class="timer">5:00</b>' : L.mode === 'chap' ? '<b class="hearts">' + heartsHtml() + '</b>' : ''}</div>
<div class="bar" style="margin:14px 0;background:#DAD6EE"><i style="background:var(--pu);width:${(L.i + (on ? 1 : 0)) / L.qs.length * 100}%"></i></div>
<div class="mu">${SJ[q.s].icon} ${esc(q.c)}${L.cb > 1 ? ` · <b style="color:var(--or)">Combo x${L.cb} 🔥</b>` : ''}</div>
<div class="blk ${L.enter ? 'enter' : ''}" style="margin-top:8px"><div class="lbl">${LABEL[q.t]}</div><div class="qt">${esc(q.q)}</div>${qBody(q, on)}</div>
${on ? `<div style="height:290px"></div><div class="sheet" style="background:${right ? '#D9F6E8' : '#FFE0F4'}"><div>${right ? `<span class="fxp">+${L.xpq} XP</span>` : ''}<div class="row">${owl(right ? 'cheer' : 'sad', 62)}<b style="font-size:19px">${right ? msg + (L.cb > 1 ? ' Combo x' + L.cb + ' 🔥' : '') : msg}</b></div>${right ? '' : `<p style="margin:8px 0 0"><b>Correct answer: ${esc(correctText(q))}</b></p>`}<p style="font-size:13px;margin:6px 0 0">${esc(q.e)}</p>${q.src ? `<p class="mu" style="margin:4px 0 0">Source: ${esc(q.src)}</p>` : ''}<button class="pill ${right ? 'gr' : ''}" onclick="nx()">Continue</button></div></div>`
      : q.t === 'match' ? '<p class="mu c" style="margin-top:18px">Tap one item on the left, then its partner on the right.</p>'
        : `<button id="ck" class="pill pu2" ${ready ? '' : 'disabled'} onclick="chk()">Check</button>`}</div>`;
}
function pick(v) { if (L.ans) return; L.sel = v; snd('tap'); draw() }
function otap(side, i) {
  if (L.ans) return; const od = L.od; snd('tap');
  if (side === 'b') { od.bank = od.bank.filter(x => x !== i); od.ans.push(i) } else { od.ans = od.ans.filter(x => x !== i); od.bank.push(i) }
  draw();
}
function mtap(side, i) {
  const m = L.mt; if (L.ans || m.bad) return;
  if (side === 'l') m.sl = m.sl === i ? null : i; else m.sr = m.sr === i ? null : i;
  snd('tap');
  if (m.sl != null && m.sr != null) {
    if (m.sl === m.sr) {
      m.done.push(m.sl); m.sl = m.sr = null; snd('ok'); buzz(20); draw();
      if (m.done.length === L.qs[L.i].pairs.length) setTimeout(() => settle(m.miss === 0), 450);
    } else { m.miss++; m.bad = true; snd('no'); buzz([30, 40, 30]); draw(); setTimeout(() => { m.bad = false; m.sl = m.sr = null; draw() }, 520) }
    return;
  }
  draw();
}
const nz = s => String(s).toLowerCase().replace(/\s+/g, '').replace(/^rs\.?/, '').replace(/,/g, '').replace(/\.$/, '');
function fillOk(q, v) {
  const n = nz(v); if (!n) return false;
  return q.a.some(a => { const m = nz(a); if (m === n) return true; return /^-?\d+(\.\d+)?$/.test(n) && /^-?\d+(\.\d+)?$/.test(m) && parseFloat(m) === parseFloat(n) });
}
function chk() {
  if (L.ans) return; const q = L.qs[L.i]; let ok = false;
  if (q.t === 'mcq') ok = L.o[L.sel] === q.a;
  else if (q.t === 'tf') ok = L.sel === q.a;
  else if (q.t === 'fill') ok = fillOk(q, L.val);
  else if (q.t === 'order') ok = L.od.ans.map(i => q.items[i]).join('|') === q.items.join('|');
  settle(ok);
}
function settle(ok) {
  if (!L || L.ans) return; const q = L.qs[L.i];
  L.ans = true; L.good = ok;
  if (ok) {
    L.right++; L.cb++; L.bc = Math.max(L.bc, L.cb); L.xpq = 10 + Math.min(L.cb - 1, 3) * 2; L.xp += L.xpq;
    if (P.bad.includes(q.id)) { P.bad = P.bad.filter(x => x !== q.id); P.fixed++ }
    snd('ok'); buzz(25);
  } else {
    L.cb = 0; if (L.mode === 'chap') L.h--;
    if (!P.bad.includes(q.id)) P.bad.push(q.id);
    if (!q.rq && L.mode !== 'paper') L.qs.push({ ...q, rq: 1 });
    snd('no'); buzz([60, 40, 60]);
  }
  draw();
}
function nx() {
  if ((L.mode === 'chap' && L.h <= 0) || L.i >= L.qs.length - 1) return fin();
  L.i++; initQ(); snd('tap'); draw();
}
function quit() { if (L && L.iv) clearInterval(L.iv); L = null; draw() }

/* ---------- WRITTEN PRACTICE ---------- */
function startWritten() {
  const pool = shuf(WRITTEN.filter(w => subs().includes(w.s))).slice(0, 4);
  if (!pool.length) return toast('No written questions yet');
  L = { mode: 'written', qs: pool, i: 0, rev: false, tick: [], txt: '', sc: 0, tot: 0, xp: 0, t0: Date.now(), enter: true };
  scr = 'app'; draw();
}
function writtenV() {
  const q = L.qs[L.i], got = Math.min(L.tick.length, q.marks);
  return `<div class="q"><div class="top"><button class="x" onclick="quit()" aria-label="Close">✕</button><span class="chipx">Written ${L.i + 1}/${L.qs.length}</span><span class="fl1"></span><b>${q.marks} mark${q.marks > 1 ? 's' : ''}</b></div>
<div class="bar" style="margin:14px 0;background:#DAD6EE"><i style="background:var(--pu);width:${(L.i + (L.rev ? 1 : 0)) / L.qs.length * 100}%"></i></div>
<div class="mu">${SJ[q.s].icon} ${SJ[q.s].name}</div>
<div class="blk ${L.enter ? 'enter' : ''}" style="margin-top:8px"><div class="lbl">Write your answer</div><div class="qt">${esc(q.q)}</div>
<textarea class="ta" placeholder="Write it in your own words (or on paper)…" oninput="L.txt=this.value">${esc(L.txt)}</textarea></div>
${L.rev ? `<div class="blk" style="margin-top:0"><div class="lbl">Marking points · tick what you covered</div>${q.pts.map((p, i) => `<button class="pt ${L.tick.includes(i) ? 'on' : ''}" onclick="wtick(${i})"><i>${L.tick.includes(i) ? '✓' : ''}</i>${esc(p)}</button>`).join('')}<p class="mu" style="color:#fffa;margin:10px 0 0">Full marks need ${q.marks} correct point${q.marks > 1 ? 's' : ''}. Be honest, it only helps you!</p></div>
<button class="pill pu2" onclick="wnext()">${got >= q.marks ? '🎉 ' : ''}Score ${got}/${q.marks} · ${L.i >= L.qs.length - 1 ? 'Finish' : 'Next'}</button>`
      : `<button class="pill pu2" onclick="L.rev=true;L.enter=false;snd('tap');draw()">Show marking points</button>`}</div>`;
}
function wtick(i) { const k = L.tick.indexOf(i); k < 0 ? L.tick.push(i) : L.tick.splice(k, 1); snd('tap'); draw() }
function wnext() {
  const q = L.qs[L.i], got = Math.min(L.tick.length, q.marks);
  L.sc += got; L.tot += q.marks; L.xp += got * 6; if (got >= q.marks) L.xp += 4;
  if (L.i >= L.qs.length - 1) return fin();
  L.i++; L.rev = false; L.tick = []; L.txt = ''; L.enter = true; snd(got ? 'ok' : 'no'); draw();
}

/* ---------- FINISH ---------- */
function badgeList() {
  const done = CH.filter(c => chDone(c) >= 3).length, all = subs().length > 0 && subs().every(s => subDone(s) >= 1);
  return [['🔥', 'First Streak', P.streak >= 1], ['📒', 'Unit Pro', done >= 1], ['⚡', 'Combo x5', P.maxcb >= 5], ['🏆', '300 XP', P.xp >= 300],
  ['🌟', 'Perfect Lesson', P.perf >= 1], ['🗓️', '7-Day Streak', P.best >= 7], ['🛠️', 'Mistake Fixer', P.fixed >= 10], ['🎓', 'All-Rounder', all], ['✍️', 'Wordsmith', P.wrote >= 1], ['⏱️', 'Paper Racer', P.papers >= 1]];
}
function fin() {
  if (!L) return; const r = L; if (r.iv) clearInterval(r.iv);
  const before = badgeList().filter(b => b[2]).map(b => b[1]), lv0 = lvl();
  const written = r.mode === 'written', fail = r.mode === 'chap' && r.h <= 0;
  const total = written ? r.tot : r.qs.length, right = written ? r.sc : r.right;
  const perfect = !written && !fail && r.right === r.qs.length && r.mode !== 'paper';
  const g = fail ? Math.round(r.xp / 2) : r.xp + (perfect ? 10 : 0);
  addXp(g); const firstToday = touch();
  if (!fail) { P.dl++; P.lessons++ }
  P.dcb = Math.max(P.dcb, r.bc || 0); P.maxcb = Math.max(P.maxcb, r.bc || 0);
  if (perfect) P.perf++;
  let unitDone = false;
  if (r.mode === 'chap' && !fail && r.no === chDone({ key: r.key })) { P.cd[r.key] = Math.min(3, (P.cd[r.key] || 0) + 1); unitDone = P.cd[r.key] >= 3 }
  if (r.mode === 'paper') P.papers++;
  if (written) P.wrote++;
  P.mins[today()] = (P.mins[today()] || 0) + Math.max(1, Math.round((Date.now() - r.t0) / 6e4));
  const nb = badgeList().filter(b => b[2] && !before.includes(b[1]));
  persist();
  R = { g, fail, perfect, right, n: total, bc: r.bc || 0, written, mode: r.mode, secs: Math.round((Date.now() - r.t0) / 1e3), up: lvl() > lv0, streakNew: firstToday, unitDone, nb };
  L = null; scr = 'res'; snd(R.fail ? 'no' : R.up ? 'lvl' : 'done'); buzz(R.fail ? [80] : [30, 50, 30, 50, 80]); draw();
  countUp();
}
function countUp() {
  const e = $('#xpn'); if (!e) return; const to = R.g, t0 = performance.now();
  (function f(t) { const p = Math.min(1, (t - t0) / 900); e.textContent = '+' + Math.round(to * (1 - Math.pow(1 - p, 3))) + ' XP'; if (p < 1) requestAnimationFrame(f) })(t0);
}
function resV() {
  const cf = [...Array(32)].map((_, i) => `<i style="left:${i * 3.2}%;background:${['#FFE680', '#FFB8EE', '#A9C0FF', '#A9EBCB', '#D3CBFF'][i % 5]};animation-duration:${3 + i % 4}s;animation-delay:-${i % 7}s"></i>`).join('');
  const acc = R.n ? Math.round(R.right / R.n * 100) : 0, m = Math.floor(R.secs / 60), s = R.secs % 60;
  return `${R.fail ? '' : `<div class="cf">${cf}</div>`}<div class="q c" style="padding-top:26px;position:relative">${owl(R.fail ? 'sad' : 'cheer', 180)}
<div id="xpn" style="font-size:50px;font-weight:900;color:var(--bu)">+${R.g} XP</div>
<p class="mu" style="color:#fffa;font-size:15px">${R.fail ? 'Out of hearts. Review and try again!' : R.written ? 'Written practice done! ' + R.right + '/' + R.n + ' marks' : R.perfect ? 'Perfect lesson! Flawless 🌟' : 'Lesson complete! ' + R.right + '/' + R.n + ' correct'}</p>
${R.up ? `<div class="lvl">🎉 Level up! You are now Level ${lvl()}</div>` : ''}
${R.unitDone ? '<div class="lvl" style="background:linear-gradient(135deg,var(--mint),var(--sky))">🎓 Unit complete!</div>' : ''}
<div class="row" style="margin:18px 0 8px"><div class="stat"><b>${acc}%</b><span>Accuracy</span></div><div class="stat"><b>x${R.bc}</b><span>Best combo</span></div><div class="stat"><b>${m}:${String(s).padStart(2, '0')}</b><span>Time</span></div></div>
${R.streakNew ? `<div class="card" style="background:#FFE9D2;margin:8px 0"><div class="row"><span class="flame" style="font-size:34px">🔥</span><div style="text-align:left"><b style="font-size:18px">${P.streak} day streak!</b><div class="mu">You practised today. Come back tomorrow.</div></div></div></div>` : ''}
${R.nb.map(b => `<div class="card" style="background:var(--bu);margin:8px 0;text-align:left"><b>${b[0]} New badge: ${esc(b[1])}</b></div>`).join('')}
<div class="card" style="background:var(--lav);margin-top:14px;text-align:left"><div class="row sp mu"><span>Total XP</span><b>Level ${lvl()}</b></div><div style="font-size:32px;font-weight:900">${P.xp}</div><div class="bar sh"><i style="width:${P.xp % 300 / 3}%"></i></div><div class="mu" style="margin-top:8px">Daily goal: ${Math.min(P.dxp, goal())}/${goal()} XP</div></div>
<button class="pill w" onclick="scr='app';draw()">Continue</button></div>`;
}

/* ---------- QUESTS / PROGRESS ---------- */
function questsV() {
  const qs = [[`Earn ${goal()} XP`, P.dxp, goal()], ['Finish 1 lesson', P.dl, 1], ['Get a 3x combo', P.dcb, 3]], all = qs.every(x => x[1] >= x[2]);
  const done = CH.filter(c => chDone(c) >= 3).length, pct = Math.round(done / CH.length * 100), bd = badgeList();
  return `<h1>My Progress</h1><div class="row" style="margin:14px 0"><div class="card fl1" style="background:var(--mint);margin:0"><span class="mu" style="color:#0008">Completed</span><div style="font-size:30px;font-weight:900">${pct}%</div></div><div class="card fl1" style="background:var(--lav);margin:0"><span class="mu" style="color:#0008">Lessons</span><div style="font-size:30px;font-weight:900">${P.lessons}</div></div></div>
<div class="card"><div class="row"><div class="av" style="background:var(--or);width:54px;height:54px;color:#fff;font-size:24px;font-weight:900">${P.streak}</div><b style="font-size:17px">Day streak. Keep it alive!</b></div><div class="row sp" style="margin-top:14px">${wk7().map(x => `<div class="c mu"><div style="width:34px;height:34px;border-radius:50%;margin-bottom:4px;display:grid;place-items:center;color:#fff;background:${P.days[x.k] ? 'var(--blk)' : '#EFEDF7'}">${P.days[x.k] ? '✓' : ''}</div>${x.l}</div>`).join('')}</div></div>
<h2>Today's quests</h2>${qs.map(x => `<div class="card"><div class="row sp"><b>${x[1] >= x[2] ? '✅' : '⭕'} ${esc(x[0])}</b><span class="mu">${Math.min(x[1], x[2])}/${x[2]}</span></div><div class="bar" style="margin-top:10px"><i style="background:var(--pu);width:${Math.min(100, x[1] / x[2] * 100)}%"></i></div></div>`).join('')}
<button class="pill pu2" ${all && P.chest !== today() ? '' : 'disabled'} onclick="chest()">${P.chest === today() ? '🎁 Chest opened. Back tomorrow' : all ? '🎁 Open your daily chest' : '🔒 Finish all quests for a chest'}</button>
<h2>Badges <span class="mu">${bd.filter(b => b[2]).length}/${bd.length}</span></h2><div class="bdg">${bd.map(b => `<div><b style="background:${b[2] ? 'var(--bu)' : '#E6E2F5'};opacity:${b[2] ? 1 : .4}">${b[0]}</b>${esc(b[1])}</div>`).join('')}</div>
<h2>Units by subject</h2>${subs().map(k => `<div class="card" style="margin:8px 0"><div class="row sp"><b>${SJ[k].icon} ${SJ[k].name}</b><span class="mu">${subDone(k)}/${subTotal(k)}</span></div><div class="bar" style="margin-top:10px"><i style="background:${SJ[k].color};filter:saturate(1.6) brightness(.85);width:${subDone(k) / Math.max(1, subTotal(k)) * 100}%"></i></div></div>`).join('')}`;
}
function chest() { const g = 20 + Math.floor(Math.random() * 41); addXp(g); P.chest = today(); persist(); snd('chest'); buzz([40, 40, 80]); toast('Chest: +' + g + ' XP 🎉'); draw() }

/* ---------- RANKS + PROFILE ---------- */
function ranksV() {
  const us = Object.keys(ld('al3:users') || {}).map(u => { const d = ld('al3:d:' + u); if (!d || !d.U) return null; return { n: d.U.name || u, a: d.U.av, x: d.P.wk === wkOf() ? d.P.wxp : 0, s: d.P.streak } }).filter(Boolean).sort((a, b) => b.x - a.x);
  const p = (r, rk, h, c) => r ? `<div><div class="av" style="width:${rk === 1 ? 66 : 54}px;height:${rk === 1 ? 66 : 54}px;background:#fff;font-size:${rk === 1 ? 34 : 28}px">${r.a}</div>${esc(r.n)}<span style="background:#fff;border-radius:14px;padding:3px 10px;font-size:12px">⭐ ${r.x}</span><div class="b" style="height:${h}px;background:${c}">${rk}</div></div>` : '<div></div>';
  return `<div class="row sp"><h1>Leaderboard</h1><span class="chipx" style="background:#fff7">This week</span></div><div class="pod">${p(us[1], 2, 110, 'var(--pu)')}${p(us[0], 1, 150, 'var(--bu)')}${p(us[2], 3, 85, 'var(--pink)')}</div>
<div class="card" style="margin-top:0;border-radius:30px"><b>On this device</b>${us.map((r, i) => `<div class="row" style="margin:12px 0"><b style="width:22px">${i + 1}</b><div class="av" style="width:40px;height:40px;font-size:20px;background:var(--bg)">${r.a}</div><b class="fl1">${esc(r.n)}</b><span class="mu">⭐ ${r.x} · 🔥${r.s}</span></div>`).join('')}<div class="mu" style="margin-top:8px">A shared online leaderboard for all your friends arrives with the online version.</div></div>`;
}
function meV() {
  return `<div class="row sp"><h1>Profile</h1><button class="x" onclick="tab='home';draw()" aria-label="Close">✕</button></div>
<div class="card c"><div class="av" style="width:90px;height:90px;font-size:50px;margin:auto">${U.av}</div><h2 style="margin-top:10px">${esc(U.name)}</h2><div class="mu">@${esc(U.u)} · ${esc(U.stream)}</div><div class="row sp" style="margin-top:14px"><div><b>${P.xp}</b><div class="mu">XP</div></div><div><b>${P.streak}</b><div class="mu">Streak</div></div><div><b>${lvl()}</b><div class="mu">Level</div></div></div></div>
<h2>My subjects</h2><div class="row wr" style="margin-top:10px">${SK.map(k => `<button class="chip ${U.subs.includes(k) ? 'on' : ''}" onclick="tgs('${k}')">${SJ[k].icon} ${SJ[k].name}</button>`).join('')}</div>
<h2>Daily goal</h2>${goalPick()}
<h2>Settings</h2><div class="card"><div class="row sp"><b>🔊 Sound effects</b><button class="sw ${SET.sfx ? 'on' : ''}" onclick="setOpt('sfx')" aria-label="Sound effects"></button></div><div class="row sp" style="margin-top:14px"><b>📳 Vibration</b><button class="sw ${SET.hap ? 'on' : ''}" onclick="setOpt('hap')" aria-label="Vibration"></button></div></div>
<button class="pill w" style="margin-top:18px" onclick="step=0;scr='onb';draw()">Edit name and picture</button><p class="mu c">You are using the A/L Streak app.</p><button class="pill" onclick="logout()">Log out</button>`;
}

/* ---------- render ---------- */
function draw() {
  const a = $('#app'), n = $('#nav'); n.style.display = 'none';
  document.body.style.background = scr === 'res' ? '#151515' : scr === 'app' && !L ? ({ learn: 'var(--sky)', ranks: 'var(--lav)' }[tab] || 'var(--bg)') : 'var(--bg)';
  if (scr === 'auth') a.innerHTML = authV();
  else if (scr === 'onb') a.innerHTML = onbV();
  else if (scr === 'res') a.innerHTML = resV();
  else if (scr === 'notes') a.innerHTML = notesV();
  else if (L) a.innerHTML = lessonV();
  else {
    n.style.display = 'flex';
    n.innerHTML = [['home', '🏠'], ['learn', '🗺️'], ['quests', '🏆'], ['ranks', '📊']].map(t => `<button class="${tab === t[0] ? 'on' : ''}" aria-label="${t[0]}" onclick="tab='${t[0]}';snd('tap');draw()">${t[1]}</button>`).join('');
    a.innerHTML = { home: homeV, learn: learnV, quests: questsV, ranks: ranksV, me: meV }[tab]();
  }
  if (L) { const was = L.enter; L.enter = false; if (L.mode !== 'written' && !L.ans && L.qs[L.i].t === 'fill' && was) { const f = $('#fi'); if (f) f.focus() } }
  else if (!(scr === 'app' && L)) window.scrollTo(0, 0);
  if (migrated && scr === 'app') { migrated = false; setTimeout(() => toast('Business Studies and ICT are now separate subjects. Check them in Profile.'), 400) }
}

/* Android back button (called from MainActivity). Returns true if handled. */
window.onBack = function () {
  if (L) { if (Date.now() < backArm) { quit(); return true } backArm = Date.now() + 2000; toast('Press back again to leave this lesson'); return true }
  if (scr === 'notes') { scr = 'app'; draw(); return true }
  if (scr === 'res') { scr = 'app'; draw(); return true }
  if (scr === 'onb' && step > 0) { step--; draw(); return true }
  if (scr === 'app' && tab !== 'home') { tab = 'home'; draw(); return true }
  return false;
};

try { navigator.storage && navigator.storage.persist && navigator.storage.persist() } catch (e) { }
const cur = ld('al3:cur'); if (cur) login(cur); draw();
