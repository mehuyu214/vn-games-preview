"use strict";
/* VN Arcade エンジン — UI / ロジック / シナリオ(data.js) を分離 */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

/* ---------- 開発者ログ ---------- */
const devErrors = [];
function renderDevLog() {
const el = $("#devLog");
if (el) el.textContent = devErrors.length? devErrors.slice(-30).join("\n"): "（エラーはありません）";
}
window.addEventListener("error", (e) => {
devErrors.push(new Date().toLocaleTimeString() + " " + (e.message || e.type));
renderDevLog();
});

/* ---------- 設定 ---------- */
const CFG_KEY = "vna_config_v1";
const defaultCfg = { speed: 25, autoDelay: 1600, fontSize: "2.35", font: "mincho", msgOpacity: 87, skipMode: "read",
readColorOn: true, readColor: "#a8c6fa", fx: true, boss: true, voiceVol: 80, voiceOn: true, bgmVol: 50, seVol: 70};
let cfg = (() => { try { return Object.assign({}, defaultCfg, JSON.parse(localStorage.getItem(CFG_KEY) || "{}"));} catch { return {...defaultCfg};}})();
function saveCfg() { try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg));} catch {}}
function applyCfg() {
const portrait = window.innerHeight > window.innerWidth;
const eff = (parseFloat(cfg.fontSize) * (portrait ? 1.35 : 1)).toFixed(2);
document.documentElement.style.setProperty("--font-size", eff + "cqw");
document.documentElement.style.setProperty("--read-color", cfg.readColorOn? cfg.readColor: "#fdfbff");
document.documentElement.dataset.font = cfg.font || "mincho";
document.documentElement.dataset.fx = cfg.fx? "on": "off";
document.documentElement.style.setProperty("--msg-alpha", ((cfg.msgOpacity ?? 87) / 100));
if (voiceAudio) voiceAudio.volume = (cfg.voiceVol ?? 80) / 100;
if (bgmAudio) bgmAudio.volume = (cfg.bgmVol ?? 50) / 100;
if (!cfg.voiceOn) stopVoice();
}

/* ---------- 永続データ ---------- */
const SAVES_KEY = "vna_saves_v1", PROG_KEY = "vna_progress_v1", READ_KEY = "vna_read_v1";
function loadJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "") || fallback;} catch { return fallback;}}
function storeJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true;} catch { return false;}}
let saveBook = loadJSON(SAVES_KEY, { quick: null, slots: {}}); // slot番号(0..119) -> rec
let progress = loadJSON(PROG_KEY, {}); // gameId -> { endings:{endId:ts}, seen:[assetKey], unlocked:bool}
let readBook = loadJSON(READ_KEY, {}); // gameId -> [sceneId]
function prog(gid) { if (!progress[gid]) progress[gid] = { endings: {}, seen: [], unlocked: false}; return progress[gid];}
function readSet(gid) { return new Set(readBook[gid] || []);}
function markRead(gid, id) {
const arr = readBook[gid] || (readBook[gid] = []);
if (!arr.includes(id)) { arr.push(id); storeJSON(READ_KEY, readBook);}
}
function markSeen(gid, key) {
const p = prog(gid);
if (!p.seen.includes(key)) { p.seen.push(key); storeJSON(PROG_KEY, progress);}
}

/* ---------- 作品テーマ ---------- */
const BG_LABELS = { station: "駅前", park: "公園", room: "部屋", store: "コンビニ店内", street: "夜の街角",
lab: "研究室", campus: "キャンパス", library: "図書室", stacks: "書庫", mansion: "館のホール", garden: "庭園"};
const LOGO_SUB = { sakura: "SAKURA SIGNAL", misaki: "MIDNIGHT CONVENIENCE", rin: "LAST TRAIN LAB",
yuna: "LIBRARY AFTER CLOSE", serena: "SERENA MANOR"};

const ASSET_OVERRIDES = {
sakura: { kv: "assets/sakura_kv.jpg", bg: { station: "assets/sakura_station.jpg", park: "assets/sakura_park.jpg", room: "assets/sakura_room.jpg" }, faces: { smile: "assets/sakura_face_smile.webp", laugh: "assets/sakura_face_laugh.webp", shy: "assets/sakura_face_shy.webp", surprise: "assets/sakura_face_surprise.webp", wink: "assets/sakura_face_wink.webp", sad: "assets/sakura_face_sad.webp", cry: "assets/sakura_face_cry.webp", angry: "assets/sakura_face_angry.webp", serious: "assets/sakura_face_serious.webp", confused: "assets/sakura_face_confused.webp", love: "assets/sakura_face_love.webp", sleepy: "assets/sakura_face_sleepy.webp", pleasure: "assets/sakura_face_pleasure.webp", ecstasy: "assets/sakura_face_ecstasy.webp" } },
misaki: { kv: "assets/misaki_kv.jpg", bg: { store: "assets/misaki_store.jpg", street: "assets/misaki_street.jpg", room: "assets/misaki_room.jpg" }, faces: { smile: "assets/misaki_face_smile.webp", laugh: "assets/misaki_face_laugh.webp", shy: "assets/misaki_face_shy.webp", surprise: "assets/misaki_face_surprise.webp", wink: "assets/misaki_face_wink.webp", sad: "assets/misaki_face_sad.webp", cry: "assets/misaki_face_cry.webp", angry: "assets/misaki_face_angry.webp", serious: "assets/misaki_face_serious.webp", confused: "assets/misaki_face_confused.webp", love: "assets/misaki_face_love.webp", sleepy: "assets/misaki_face_sleepy.webp", pleasure: "assets/misaki_face_pleasure.webp", ecstasy: "assets/misaki_face_ecstasy.webp" } },
rin: { kv: "assets/rin_kv.jpg", bg: { lab: "assets/rin_lab.jpg", campus: "assets/rin_campus.jpg", room: "assets/rin_room.jpg" }, faces: { smile: "assets/rin_face_smile.webp", laugh: "assets/rin_face_laugh.webp", shy: "assets/rin_face_shy.webp", surprise: "assets/rin_face_surprise.webp", wink: "assets/rin_face_wink.webp", sad: "assets/rin_face_sad.webp", cry: "assets/rin_face_cry.webp", angry: "assets/rin_face_angry.webp", serious: "assets/rin_face_serious.webp", confused: "assets/rin_face_confused.webp", love: "assets/rin_face_love.webp", sleepy: "assets/rin_face_sleepy.webp", pleasure: "assets/rin_face_pleasure.webp", ecstasy: "assets/rin_face_ecstasy.webp" } },
yuna: { kv: "assets/yuna_kv.jpg", bg: { library: "assets/yuna_library.jpg", stacks: "assets/yuna_stacks.jpg", room: "assets/yuna_room.jpg" }, faces: { smile: "assets/yuna_face_smile.webp", laugh: "assets/yuna_face_laugh.webp", shy: "assets/yuna_face_shy.webp", surprise: "assets/yuna_face_surprise.webp", wink: "assets/yuna_face_wink.webp", sad: "assets/yuna_face_sad.webp", cry: "assets/yuna_face_cry.webp", angry: "assets/yuna_face_angry.webp", serious: "assets/yuna_face_serious.webp", confused: "assets/yuna_face_confused.webp", love: "assets/yuna_face_love.webp", sleepy: "assets/yuna_face_sleepy.webp", pleasure: "assets/yuna_face_pleasure.webp", ecstasy: "assets/yuna_face_ecstasy.webp" } },
serena: { kv: "assets/serena_kv.jpg", bg: { mansion: "assets/serena_mansion.jpg", garden: "assets/serena_garden.jpg", room: "assets/serena_room.jpg" }, faces: { smile: "assets/serena_face_smile.webp", laugh: "assets/serena_face_laugh.webp", shy: "assets/serena_face_shy.webp", surprise: "assets/serena_face_surprise.webp", wink: "assets/serena_face_wink.webp", sad: "assets/serena_face_sad.webp", cry: "assets/serena_face_cry.webp", angry: "assets/serena_face_angry.webp", serious: "assets/serena_face_serious.webp", confused: "assets/serena_face_confused.webp", love: "assets/serena_face_love.webp", sleepy: "assets/serena_face_sleepy.webp", pleasure: "assets/serena_face_pleasure.webp", ecstasy: "assets/serena_face_ecstasy.webp" } }
};
function kvOf(g) { const o = ASSET_OVERRIDES[g.id]; return (o && o.kv) || g.kv || g.cover; }
function bgOf(g, key) { const o = ASSET_OVERRIDES[g.id]; return (o && o.bg && o.bg[key]) || g.images[key]; }
const FACE_CUES = [
{ face: "ecstasy", r18: true, words: ["イッく", "イッちゃ", "おかしくなる", "もうだめ", "ダメッ", "イキ"] },
{ face: "pleasure", r18: true, words: ["気持ちいい", "ああっ", "あっ", "んっ", "はぁ", "すごいっ"] },
{ face: "cry", words: ["涙", "泣い", "うぅ", "ぐす"] },
{ face: "sad", words: ["ごめん", "寂しい", "つらい", "悲し", "残念"] },
{ face: "angry", words: ["怒", "むかつく", "ふざけ", "バカ", "ばか", "許さない"] },
{ face: "surprise", words: ["えっ", "まさか", "びっくり", "なんで", "本当？"] },
{ face: "serious", words: ["真剣", "大事な話", "約束", "聞いて", "お願いがある"] },
{ face: "love", words: ["大好き", "愛して", "好きだよ", "ずっと一緒", "愛しい", "抱きしめ"] },
{ face: "laugh", words: ["あはは", "わはは", "うはは"] },
{ face: "shy", words: ["恥ずかし", "照れ", "赤くな", "ドキドキ", "顔が熱", "赤く"] },
{ face: "smile", words: ["ふふ", "笑", "嬉しい", "やった", "ありがとう", "うふふ", "えへへ"] },
{ face: "wink", words: ["任せて", "内緒", "秘密", "内緒だよ"] },
{ face: "confused", words: ["どうしよう", "困っ", "ええと", "わからない", "迷っ"] },
{ face: "sleepy", words: ["眠い", "おやすみ", "ふわぁ", "眠く", "眠"] }
];
let curFaceSrc = null;
function facesOf(g) { const o = ASSET_OVERRIDES[g.id]; return (o && o.faces) || null; }
function faceFor(g, n) {
const faces = facesOf(g); if (!faces) return g.images.char;
if (n.face && faces[n.face]) return faces[n.face];
const heroName = (g.heroine || "").split("（")[0];
if (n.name && n.name === heroName && n.text) {
for (const cue of FACE_CUES) { if (cue.r18 && !n.r18) continue; if (faces[cue.face] && cue.words.some((w) => n.text.includes(w))) return faces[cue.face]; }
}
return g.images.char;
}

/* ---------- 実行時状態 ---------- */
let G = null, sceneMap = {}, cur = null, flags = {}, backlog = [];
let typing = null, fullText = "", autoMode = false, autoTimer = null, skipTimer = null, ctrlSkip = false;
let ended = false, replay = false, curBgKey = null, bgFlip = false, overlayStack = [];
let pendingGame = null, saveMode = "save", savePage = 0, saveReturn = "game", extraTab = "flow";

const el = {};
["portal","portalBgA","portalBgB","cards","gate","titleScr","tsBg","tsChar","tsLogoSub","tsLogoMain","tsHeroine","tsMenu","tsFoot",
"game","stage","bgGrad","bgA","bgB","charImg","gameParticles","tsParticles","msgwin","namebox","text","nextInd","quickbar","choices",
"backlog","logLines","saveScr","slots","slotQuick","saveTitle","saveLegacy","pageInfo","configScr","extraScr","extraBody","extraTitle",
"confirmScr","confirmMsg","bossScr","toast","r18badge","replayBadge"].forEach((id) => { el[id] = document.getElementById(id);});

function toast(msg, ms) {
el.toast.textContent = msg; el.toast.hidden = false;
clearTimeout(toast._t); toast._t = setTimeout(() => { el.toast.hidden = true;}, ms || 1700);
}
function showLayer(node) { node.hidden = false; if (!overlayStack.includes(node)) overlayStack.push(node); if (node === el.configScr && typeof syncConfigUI === "function") syncConfigUI(); }
function hideLayer(node) { node.hidden = true; overlayStack = overlayStack.filter((n) => n!== node);}
function closeTopLayer() { const n = overlayStack[overlayStack.length - 1]; if (n) { hideLayer(n); return true;} return false;}

let confirmCb = null;
function askConfirm(msg, cb) { el.confirmMsg.textContent = msg; confirmCb = cb; showLayer(el.confirmScr);}
$("#confirmYes").addEventListener("click", () => { hideLayer(el.confirmScr); if (confirmCb) confirmCb(); confirmCb = null;});
$("#confirmNo").addEventListener("click", () => { hideLayer(el.confirmScr); confirmCb = null;});

/* ---------- パーティクル ---------- */
function buildParticles(container, gid) {
if (!container) return;
container.innerHTML = "";
if (!cfg.fx) return;
for (let i = 0; i < 14; i++) {
const p = document.createElement("i");
const s = 0.5 + Math.random() * 0.9;
p.style.left = (Math.random() * 100) + "%";
p.style.width = p.style.height = s.toFixed(2) + "cqw";
p.style.animationDuration = (7 + Math.random() * 8).toFixed(1) + "s";
p.style.animationDelay = (-Math.random() * 10).toFixed(1) + "s";
p.style.opacity = (0.35 + Math.random() * 0.45).toFixed(2);
container.appendChild(p);
}
}

/* ================================================================
ポータル
================================================================ */
let portalBgFlip = false;
function buildPortal() {
el.cards.innerHTML = "";
GAMES.forEach((g) => {
const p = prog(g.id), total = g.scenes.filter((n) => n.end).length;
const got = Object.keys(p.endings).length, rate = Math.round((readSet(g.id).size / g.scenes.length) * 100);
const card = document.createElement("button");
card.className = "card"; card.type = "button"; card.dataset.theme = g.id;
card.innerHTML =
`<img src="${g.cover}" alt="" loading="lazy">` +
`<div class="body"><h2>${g.title}</h2><div class="hero">${g.heroine}</div><p>${g.desc}</p>` +
`<div class="meta">${g.r18? '<span class="chip r18">R18</span>': ""}` +
(got? `<span class="chip done">END ${got}/${total} 達成</span>`: "") +
(rate? `<span class="chip rate">既読 ${rate}%</span>`: "") +
`<span class="chip">全${g.scenes.length}シーン</span></div></div>`;
card.addEventListener("mouseenter", () => setPortalBg(g));
card.addEventListener("click", () => tryOpenTitle(g));
el.cards.appendChild(card);
});
if (GAMES[0]) setPortalBg(GAMES[0]);
}
function setPortalBg(g) {
portalBgFlip =!portalBgFlip;
const show = portalBgFlip? el.portalBgA: el.portalBgB, hide = portalBgFlip? el.portalBgB: el.portalBgA;
show.src = kvOf(g); show.classList.add("on"); hide.classList.remove("on");
el.portal.dataset.theme = g.id;
document.body.dataset.theme = g.id;
}
$("#portalConfigBtn").addEventListener("click", () => { saveReturn = "portal"; showLayer(el.configScr);});

/* ================================================================
年齢確認 → 作品タイトル
================================================================ */
function tryOpenTitle(g) {
if (g.r18 &&!sessionStorage.getItem("vn_adult_ok")) { pendingGame = g; showLayer(el.gate); return;}
openTitle(g);
}
$("#gateYes").addEventListener("click", () => { sessionStorage.setItem("vn_adult_ok", "1"); hideLayer(el.gate); if (pendingGame) openTitle(pendingGame);});
$("#gateNo").addEventListener("click", () => { hideLayer(el.gate); pendingGame = null;});

function gameSaves(gid) {
const out = [];
if (saveBook.quick && saveBook.quick.game === gid) out.push({ key: "quick", rec: saveBook.quick});
Object.keys(saveBook.slots).forEach((k) => { const r = saveBook.slots[k]; if (r && r.game === gid) out.push({ key: k, rec: r});});
const legacy = loadJSON("vn_save_" + gid, null);
return { list: out, legacy};
}

function openTitle(g) {
G = g;
el.portal.hidden = true; el.game.hidden = true; el.titleScr.hidden = false;
startBgm(g.id, "main");
el.titleScr.dataset.theme = g.id;
document.body.dataset.theme = g.id;
el.tsBg.src = kvOf(g);
el.tsChar.src = g.images.char;
el.tsChar.style.display = (ASSET_OVERRIDES[g.id] && ASSET_OVERRIDES[g.id].kv) ? "none" : "";
el.tsLogoSub.textContent = LOGO_SUB[g.id] || "";
el.tsLogoMain.textContent = g.title;
el.tsHeroine.textContent = "― " + g.heroine + " ―";
buildParticles(el.tsParticles, g.id);
const p = prog(g.id), total = g.scenes.filter((n) => n.end).length;
const got = Object.keys(p.endings).length, rate = Math.round((readSet(g.id).size / g.scenes.length) * 100);
el.tsFoot.textContent = `エンディング ${got}/${total} ・ 既読 ${rate}% ・ 全${g.scenes.length}シーン`;
const { list} = gameSaves(g.id);
$$("#tsMenu button").forEach((b) => {
const act = b.dataset.act;
b.querySelector(".lock")?.remove();
if (act === "continue") b.disabled =!list.length;
if (act === "extra") {
b.disabled =!p.unlocked;
if (!p.unlocked) { const s = document.createElement("span"); s.className = "lock"; s.textContent = "（エンディング到達で解放）"; b.appendChild(s);}
}
});
markSeen(g.id, "cover");
}
el.tsMenu.addEventListener("click", (e) => {
const b = e.target.closest("button"); if (!b || b.disabled) return;
const act = b.dataset.act;
if (act === "start") startGame(G);
else if (act === "continue") {
const { list} = gameSaves(G.id);
list.sort((a, b2) => (b2.rec.date || "").localeCompare(a.rec.date || ""));
if (list.length) loadRec(list[0].rec);
}
else if (act === "load") { saveMode = "load"; saveReturn = "title"; savePage = 0; renderSaveScr(); showLayer(el.saveScr);}
else if (act === "config") { saveReturn = "title"; showLayer(el.configScr);}
else if (act === "extra") { openExtra(G);}
else if (act === "back") { stopBgm(); stopVoice(); el.titleScr.hidden = true; el.portal.hidden = false; buildPortal();}
});

/* ================================================================
本編エンジン
================================================================ */
function startGame(g, opts) {
opts = opts || {};
G = g; flags = opts.flags? {...opts.flags}: {}; backlog = []; ended = false;
replay =!!opts.replay;
sceneMap = {}; g.scenes.forEach((n, i) => { sceneMap[n.id] = { node: n, index: i};});
el.portal.hidden = true; el.titleScr.hidden = true; el.game.hidden = false;
el.game.dataset.theme = g.id;
document.body.dataset.theme = g.id;
el.replayBadge.hidden =!replay;
el.bgA.classList.remove("on"); el.bgB.classList.remove("on"); el.charImg.classList.remove("on");
curBgKey = null; curFaceSrc = null;
buildParticles(el.gameParticles, g.id);
stopAuto(); stopSkip();
goTo(opts.scene || g.scenes[0].id);
}
function resolve(id) {
let guard = 0;
while (id && guard++ < 60) {
const e = sceneMap[id]; if (!e) return null;
const n = e.node;
if (n.branch) { const v = flags[n.branch.flag] || 0; const ok = n.branch.min!== undefined? v >= n.branch.min: v === n.branch.eq; id = ok? n.branch.then: n.branch.else; continue;}
if (n.jump &&!n.text &&!n.choice) { id = n.jump; continue;}
return n;
}
return null;
}
function goTo(id) { const n = resolve(id); if (!n) return backToTitle(); cur = n; showNode(n);}
function nextId(n) {
if (n.jump) return n.jump;
const e = sceneMap[n.id]; if (!e) return null;
const nxt = G.scenes[e.index + 1]; return nxt? nxt.id: null;
}
function applySet(s) { Object.keys(s).forEach((k) => { flags[k] = (typeof flags[k] === "number" && typeof s[k] === "number" && k === "love")? Math.max(flags[k], s[k]): s[k];});}

function setBg(key) {
if (!key || key === curBgKey) return;
curBgKey = key; markSeen(G.id, "bg:" + key);
const src = bgOf(G, key); if (!src) return;
bgFlip =!bgFlip;
const show = bgFlip? el.bgA: el.bgB, hide = bgFlip? el.bgB: el.bgA;
const img = new Image();
img.onload = () => { show.src = src; if (cfg.fx) { show.classList.add("on"); hide.classList.remove("on");} else { show.classList.add("on"); hide.classList.remove("on");}};
img.onerror = () => {};
img.src = src;
}
function setChar(show, node) {
if (show) {
const srcWanted = node ? faceFor(G, node) : G.images.char;
if (curFaceSrc !== srcWanted) { el.charImg.src = srcWanted; curFaceSrc = srcWanted; }
const faces = facesOf(G);
if (faces) { for (const k of Object.keys(faces)) { if (faces[k] === srcWanted) markSeen(G.id, "face:" + k); } }
el.charImg.classList.add("on"); markSeen(G.id, "char");
}
else el.charImg.classList.remove("on");
}

let bgmAudio = null, bgmGameId = null, bgmMood = null;
function moodOf(n) {
if (!n) return "main";
if (n.r18) return "love";
if (["room", "library", "stacks", "lab"].includes(n.bg)) return "calm";
return "main";
}
function startBgm(id, mood) {
if (!id) return;
mood = mood || "main";
if (bgmGameId === id && bgmMood === mood && bgmAudio) { const p = bgmAudio.play(); if (p && p.catch) p.catch(() => {}); return; }
stopBgm();
bgmGameId = id; bgmMood = mood;
bgmAudio = new Audio("audio/bgm/" + id + "_" + mood + ".mp3");
bgmAudio.loop = true;
bgmAudio.volume = (cfg.bgmVol ?? 50) / 100;
bgmAudio.onerror = () => { if (bgmAudio && !bgmAudio.dataset.fb) { bgmAudio.dataset.fb = "1"; bgmAudio.src = "audio/bgm_" + id + ".mp3"; const q = bgmAudio.play(); if (q && q.catch) q.catch(() => {}); } };
const p = bgmAudio.play(); if (p && p.catch) p.catch(() => {});
}
function stopBgm() { if (bgmAudio) { try { bgmAudio.pause(); } catch (err) {} bgmAudio = null; } bgmGameId = null; bgmMood = null; }
function playSe(name) {
if ((cfg.seVol ?? 70) <= 0) return;
const a = new Audio("audio/se_" + name + ".mp3");
a.volume = (cfg.seVol ?? 70) / 100;
const p = a.play(); if (p && p.catch) p.catch(() => {});
}
let voiceAudio = null;
function stopVoice() { if (voiceAudio) { try { voiceAudio.pause(); } catch (err) {} voiceAudio = null; } }
function playVoiceFor(n) {
stopVoice();
if (!cfg.voiceOn || skipTimer || !window.VOICE_FILES || !G) return;
if (!VOICE_FILES[G.id + "/" + n.id]) return;
voiceAudio = new Audio("voice/" + G.id + "/" + n.id + ".mp3");
voiceAudio.volume = (cfg.voiceVol ?? 80) / 100;
const pr = voiceAudio.play();
if (pr && pr.catch) pr.catch(() => {});
}
function showNode(n) {
if (n.set) applySet(n.set);
stopAuto();
el.game.classList.toggle("r18mode",!!n.r18);
if (n.bg) setBg(n.bg);
else if (n.r18) setBg("room");
if (n.char) setChar(true, n);
else if (n.char === false) setChar(false);
else if (!n.name) setChar(false);
else if (n.r18) setChar(true, n);
el.namebox.textContent = n.name || "";
el.namebox.style.visibility = n.name? "visible": "hidden";
const wasRead = readSet(G.id).has(n.id);
markRead(G.id, n.id);
backlog.push({ scene: n.id, name: n.name || "", text: n.text || "", flags: {...flags}, read: wasRead});
n._wasRead = wasRead;
if (backlog.length > 600) backlog.shift();
ended =!!n.end;
el.text.classList.toggle("read", wasRead && cfg.readColorOn);
typeText(n.text || "");
playVoiceFor(n);
{ const m = n.bgm || moodOf(n); if (G) { if (m === "off") { if (bgmAudio) stopBgm(); } else if (m !== bgmMood) startBgm(G.id, m); } }
if (n.se && !skipTimer) playSe(n.se);
if (n.choice) showChoices(n.choice);
if (n.end) onEnding(n);
}
function onEnding(n) {
const kind = parseEndLabel(n.text || "").kind;
const p = prog(G.id);
const first =!p.endings[n.id];
p.endings[n.id] = Date.now(); p.unlocked = true;
storeJSON(PROG_KEY, progress);
toast(first? `${kind} END に到達しました（EXTRAが解放されました）`: `${kind} END に到達`, 2600);
}

function typeText(t) {
fullText = t; el.text.textContent = ""; el.nextInd.style.visibility = "hidden";
if (typing) clearInterval(typing);
if (!cfg.fx || cfg.speed <= 0) { el.text.textContent = t; typing = null; afterType(); return;}
const per = Math.max(1, Math.round(50 / Math.max(5, cfg.speed)));
let i = 0;
typing = setInterval(() => {
i += per; el.text.textContent = t.slice(0, i);
if (i >= t.length) { clearInterval(typing); typing = null; afterType();}
}, 20);
}
function afterType() {
el.nextInd.style.visibility = (cur &&!cur.choice &&!ended)? "visible": "hidden";
if (autoMode && cur &&!cur.choice &&!ended) { stopAuto(); autoTimer = setTimeout(() => advance(), cfg.autoDelay);}
if (skipTimer &&!cur?.choice &&!ended) { /* スキップ継続はadvance側で処理 */}
}
function completeType() { if (typing) { clearInterval(typing); typing = null; el.text.textContent = fullText; afterType();}}

function advance() {
if (overlayStack.length) return;
if (typing) { completeType(); return;}
if (!cur || cur.choice) return;
if (ended) { backToTitle(); return;}
const id = nextId(cur);
if (id) { playSe("click"); goTo(id); } else backToTitle();
}
$("#textbox").addEventListener("click", advance);
el.namebox.addEventListener("click", advance);

function showChoices(list) {
el.choices.innerHTML = "";
list.forEach((c) => {
const b = document.createElement("button");
b.type = "button"; b.textContent = c.text;
b.addEventListener("click", (ev) => {
ev.stopPropagation();
playSe("select");
el.choices.hidden = true; stopSkip(); stopAuto();
if (c.set) applySet(c.set);
goTo(c.jump);
});
el.choices.appendChild(b);
});
el.choices.hidden = false;
el.nextInd.style.visibility = "hidden";
}

function backToTitle() {
stopAuto(); stopSkip();
el.game.hidden = true; el.choices.hidden = true; el.backlog.hidden = true;
overlayStack = overlayStack.filter((n) => n === el.configScr || n === el.saveScr || n === el.extraScr);
openTitle(G);
}

/* ---------- AUTO / SKIP ---------- */
function stopAuto() { autoMode = false; if (autoTimer) clearTimeout(autoTimer); autoTimer = null; syncQuick();}
function stopSkip() { if (skipTimer) clearInterval(skipTimer); skipTimer = null; ctrlSkip = false; syncQuick();}
function startSkip() {
if (skipTimer) return;
skipTimer = setInterval(() => {
if (overlayStack.length ||!cur) return;
if (cur.choice || ended) { stopSkip(); return;}
if (cfg.skipMode === "read" && cur._wasRead === false) { stopSkip(); return;}
if (typing) completeType();
else advance();
}, 40);
syncQuick();
}
function syncQuick() {
$$("#quickbar button").forEach((b) => {
if (b.dataset.q === "auto") b.classList.toggle("on", autoMode);
if (b.dataset.q === "skip") b.classList.toggle("on",!!skipTimer);
});
}

/* ---------- クイックバー ---------- */
el.quickbar.addEventListener("click", (e) => {
const b = e.target.closest("button"); if (!b) return;
e.stopPropagation();
const q = b.dataset.q;
if (q === "qsave") quickSave();
else if (q === "save") { saveMode = "save"; saveReturn = "game"; savePage = 0; renderSaveScr(); showLayer(el.saveScr);}
else if (q === "load") { saveMode = "load"; saveReturn = "game"; savePage = 0; renderSaveScr(); showLayer(el.saveScr);}
else if (q === "auto") { autoMode =!autoMode; if (autoMode) { toast("AUTO オン"); if (!typing && cur &&!cur.choice &&!ended) { stopAuto(); autoMode = true; autoTimer = setTimeout(() => advance(), cfg.autoDelay);}} else stopAuto(); syncQuick();}
else if (q === "skip") { skipTimer? stopSkip(): (toast("SKIP オン"), startSkip());}
else if (q === "log") openLog();
else if (q === "config") { saveReturn = "game"; showLayer(el.configScr);}
else if (q === "hide") { el.msgwin.classList.add("hidden-ui"); toast("画面クリックで表示が戻ります", 1200);}
else if (q === "title") { askConfirm("タイトル画面に戻りますか？（進行状況はセーブされません）", backToTitle);}
});
el.stage.addEventListener("click", (e) => {
if (el.msgwin.classList.contains("hidden-ui") &&!overlayStack.length) { el.msgwin.classList.remove("hidden-ui"); e.stopPropagation();}
});
el.stage.addEventListener("wheel", (e) => { if (e.deltaY < 0 &&!overlayStack.length &&!el.game.hidden) openLog();}, { passive: true});

/* ---------- バックログ ---------- */
function openLog() {
el.logLines.innerHTML = "";
backlog.forEach((l, idx) => {
const d = document.createElement("div");
d.className = "log-line";
d.innerHTML = (l.name? `<b>${l.name}</b>`: "") + l.text.replace(/</g, "&lt;").replace(/\n/g, "<br>");
d.addEventListener("click", () => {
hideLayer(el.backlog);
flags = {...l.flags};
backlog = backlog.slice(0, idx);
stopAuto(); stopSkip();
goTo(l.scene);
toast("その場面に戻りました");
});
el.logLines.appendChild(d);
});
showLayer(el.backlog);
el.logLines.scrollTop = el.logLines.scrollHeight;
}
$("#logClose").addEventListener("click", () => hideLayer(el.backlog));

/* ================================================================
セーブ / ロード
================================================================ */
function captureThumb() {
try {
const c = document.createElement("canvas"); c.width = 320; c.height = 180;
const ctx = c.getContext("2d");
const grad = ctx.createLinearGradient(0, 0, 320, 180);
grad.addColorStop(0, "#2b2144"); grad.addColorStop(1, "#0a0918");
ctx.fillStyle = grad; ctx.fillRect(0, 0, 320, 180);
if (!el.game.classList.contains("r18mode")) {
const bg = el.bgA.classList.contains("on")? el.bgA: el.bgB;
if (bg && bg.src && bg.naturalWidth) {
const s = Math.max(320 / bg.naturalWidth, 180 / bg.naturalHeight);
ctx.drawImage(bg, (320 - bg.naturalWidth * s) / 2, (180 - bg.naturalHeight * s) / 2, bg.naturalWidth * s, bg.naturalHeight * s);
}
const ch = el.charImg;
if (ch && ch.classList.contains("on") && ch.naturalWidth) {
const h = 165, w = ch.naturalWidth * (h / ch.naturalHeight);
ctx.drawImage(ch, (320 - w) / 2, 180 - h, w, h);
}
} else {
ctx.fillStyle = "#ffd7e0"; ctx.font = "bold 20px sans-serif"; ctx.textAlign = "center";
ctx.fillText("R18 SCENE", 160, 96);
}
return c.toDataURL("image/jpeg", 0.62);
} catch { return null;}
}
function makeRec() {
return { game: G.id, scene: cur.id, flags: {...flags}, date: new Date().toISOString(),
text: (cur.text || "").slice(0, 120), love: flags.love || 0, thumb: captureThumb()};
}
function persistSaves() {
if (!storeJSON(SAVES_KEY, saveBook)) {
// 容量超過時はサムネイルを落として再試行
Object.values(saveBook.slots).forEach((r) => { if (r) r.thumb = null;});
if (saveBook.quick) saveBook.quick.thumb = null;
storeJSON(SAVES_KEY, saveBook);
toast("容量の都合でサムネイルなしで保存しました");
}
}
function quickSave() {
if (!G ||!cur) return;
saveBook.quick = makeRec(); persistSaves(); toast("クイックセーブしました");
}
function loadRec(rec) {
const g = GAMES.find((x) => x.id === rec.game); if (!g) return;
hideLayer(el.saveScr);
startGame(g, { scene: rec.scene, flags: rec.flags});
toast("ロードしました");
}
function slotCard(key, rec, label) {
const d = document.createElement("div");
const wrap = document.createElement("button");
wrap.type = "button"; wrap.className = "slot";
if (rec) {
const g = GAMES.find((x) => x.id === rec.game);
wrap.innerHTML =
`<span class="s-no">${label}</span>` +
(rec.thumb? `<img class="thumb" src="${rec.thumb}" alt="">`: `<span class="thumb empty">サムネイルなし</span>`) +
`<div class="s-meta"><span>${new Date(rec.date).toLocaleString("ja-JP")}</span><span>好感度 ${rec.love}</span></div>` +
`<div class="s-title">${g? g.title: rec.game} ／ ${rec.scene}</div>` +
`<div class="s-text">${(rec.text || "").replace(/</g, "&lt;")}</div>`;
const del = document.createElement("button");
del.type = "button"; del.className = "s-del"; del.textContent = "削除";
del.addEventListener("click", (ev) => {
ev.stopPropagation();
askConfirm(`${label} のセーブデータを削除しますか？`, () => {
if (key === "quick") saveBook.quick = null; else delete saveBook.slots[key];
persistSaves(); renderSaveScr(); toast("削除しました");
});
});
wrap.appendChild(del);
} else {
wrap.innerHTML = `<span class="s-no">${label}</span><span class="thumb empty">― 空き ―</span>` +
`<div class="s-title" style="margin-top:8px">データがありません</div>`;
}
wrap.addEventListener("click", () => {
if (saveMode === "save") {
if (!G ||!cur) return;
const doSave = () => {
const rec2 = makeRec();
if (key === "quick") saveBook.quick = rec2; else saveBook.slots[key] = rec2;
persistSaves(); renderSaveScr(); playSe("save"); toast("セーブしました");
};
if (rec) askConfirm(`${label} に上書きセーブしますか？`, doSave); else doSave();
} else if (rec) loadRec(rec);
});
d.appendChild(wrap);
return d;
}
function renderSaveScr() {
el.saveTitle.textContent = saveMode === "save"? "セーブ": "ロード";
el.slotQuick.innerHTML = "";
const qh = document.createElement("div"); qh.className = "legacy-note"; qh.textContent = "クイックセーブ枠";
el.slotQuick.appendChild(qh);
const qg = document.createElement("div"); qg.className = "slots";
qg.appendChild(slotCard("quick", saveBook.quick, "QUICK").firstChild);
el.slotQuick.appendChild(qg);
el.slots.innerHTML = "";
for (let i = 0; i < 12; i++) {
const idx = savePage * 12 + i;
el.slots.appendChild(slotCard(String(idx), saveBook.slots[String(idx)] || null, "No." + (idx + 1)).firstChild);
}
el.pageInfo.textContent = `ページ ${savePage + 1} / 10`;
// 旧形式セーブの互換表示（ロード時・対象作品のみ）
el.saveLegacy.innerHTML = "";
if (saveMode === "load" && G) {
const legacy = loadJSON("vn_save_" + G.id, null);
if (legacy && legacy.scene) {
const b = document.createElement("button");
b.className = "btn small"; b.type = "button"; b.textContent = `旧セーブを読む（${legacy.scene}）`;
b.addEventListener("click", () => loadRec({ game: G.id, scene: legacy.scene, flags: legacy.flags || {}}));
el.saveLegacy.appendChild(b);
}
}
}
$("#pagePrev").addEventListener("click", () => { savePage = (savePage + 9) % 10; renderSaveScr();});
$("#pageNext").addEventListener("click", () => { savePage = (savePage + 1) % 10; renderSaveScr();});
$("#saveClose").addEventListener("click", () => hideLayer(el.saveScr));

/* ================================================================
コンフィグ
================================================================ */
function speedLabel() { return cfg.speed <= 0? "瞬時": cfg.speed <= 15? "速い": cfg.speed <= 40? "普通": "遅い"; }
function paintSlider(elm, v, min, max) {
const r = Math.max(0, Math.min(1, (v - min) / (max - min)));
elm.querySelector(".ctl-fill").style.width = (r * 100) + "%";
elm.querySelector(".ctl-thumb").style.left = (r * 100) + "%";
}
function paintSeg(key) {
const val = { fontSize: cfg.fontSize, skipMode: cfg.skipMode,
readColorOn: cfg.readColorOn? "on": "off", fx: cfg.fx? "on": "off", boss: cfg.boss? "on": "off", font: cfg.font || "mincho", voiceOn: cfg.voiceOn? "on": "off" }[key];
$$(`.ctl-seg[data-seg="${key}"] button`).forEach((b) => b.classList.toggle("on", b.dataset.v === String(val)));
}
function syncConfigUI() {
$("#cfgGameTitle").textContent = G? G.title: "VN Arcade";
paintSlider(document.querySelector('[data-slider="speed"]'), 80 - cfg.speed, 0, 80);
$("#ctlSpeedVal").textContent = speedLabel();
paintSlider(document.querySelector('[data-slider="auto"]'), cfg.autoDelay, 400, 5000);
$("#ctlAutoVal").textContent = (cfg.autoDelay / 1000).toFixed(1) + " 秒";
paintSlider(document.querySelector('[data-slider="msgOpacity"]'), cfg.msgOpacity ?? 87, 30, 98);
$("#ctlOpacityVal").textContent = (cfg.msgOpacity ?? 87) + "%";
["fontSize", "skipMode", "readColorOn", "fx", "boss", "font", "voiceOn"].forEach(paintSeg);
paintSlider(document.querySelector('[data-slider="bgmVol"]'), cfg.bgmVol ?? 50, 0, 100);
$("#ctlBgmVolVal").textContent = (cfg.bgmVol ?? 50) + "%";
paintSlider(document.querySelector('[data-slider="seVol"]'), cfg.seVol ?? 70, 0, 100);
$("#ctlSeVolVal").textContent = (cfg.seVol ?? 70) + "%";
paintSlider(document.querySelector('[data-slider="voiceVol"]'), cfg.voiceVol ?? 80, 0, 100);
$("#ctlVoiceVolVal").textContent = (cfg.voiceVol ?? 80) + "%";
$("#readColorItem").classList.toggle("off", !cfg.readColorOn);
const art = $("#cfgArt"), panel = el.configScr.querySelector(".cfg-panel");
if (G) { art.src = G.images.char; art.parentElement.style.display = ""; panel.classList.add("has-art"); $("#cfgBg").style.backgroundImage = `url("${kvOf(G)}")`; }
else { art.removeAttribute("src"); art.parentElement.style.display = "none"; panel.classList.remove("has-art"); $("#cfgBg").style.backgroundImage = ""; }
$$("#ctlReadColor .sw").forEach((b) => b.classList.toggle("on", b.dataset.c === cfg.readColor));
}
const SLIDERS = {
speed: { min: 0, max: 80, step: 5, get: () => 80 - cfg.speed,
set: (v) => { cfg.speed = 80 - v; $("#ctlSpeedVal").textContent = speedLabel(); } },
auto: { min: 400, max: 5000, step: 200, get: () => cfg.autoDelay,
set: (v) => { cfg.autoDelay = v; $("#ctlAutoVal").textContent = (v / 1000).toFixed(1) + " 秒"; } },
bgmVol: { min: 0, max: 100, step: 5, get: () => cfg.bgmVol ?? 50,
set: (v) => { cfg.bgmVol = v; $("#ctlBgmVolVal").textContent = v + "%"; applyCfg(); } },
seVol: { min: 0, max: 100, step: 5, get: () => cfg.seVol ?? 70,
set: (v) => { cfg.seVol = v; $("#ctlSeVolVal").textContent = v + "%"; } },
voiceVol: { min: 0, max: 100, step: 5, get: () => cfg.voiceVol ?? 80,
set: (v) => { cfg.voiceVol = v; $("#ctlVoiceVolVal").textContent = v + "%"; applyCfg(); } },
msgOpacity: { min: 30, max: 98, step: 1, get: () => cfg.msgOpacity ?? 87,
set: (v) => { cfg.msgOpacity = v; $("#ctlOpacityVal").textContent = v + "%"; applyCfg(); } },
};
function bindSlider(elm) {
const def = SLIDERS[elm.dataset.slider];
const apply = (v) => {
v = Math.max(def.min, Math.min(def.max, Math.round(v / def.step) * def.step));
def.set(v); saveCfg(); paintSlider(elm, v, def.min, def.max);
};
const fromEvent = (e) => {
const rect = elm.querySelector(".ctl-track").getBoundingClientRect();
apply(def.min + ((e.clientX - rect.left) / rect.width) * (def.max - def.min));
};
elm.addEventListener("pointerdown", (e) => {
elm.setPointerCapture(e.pointerId); fromEvent(e);
const move = (ev) => fromEvent(ev);
elm.addEventListener("pointermove", move);
elm.addEventListener("pointerup", () => elm.removeEventListener("pointermove", move), { once: true });
});
elm.addEventListener("keydown", (e) => {
if (e.key === "ArrowRight" || e.key === "ArrowUp") { apply(def.get() + def.step); e.preventDefault(); }
if (e.key === "ArrowLeft" || e.key === "ArrowDown") { apply(def.get() - def.step); e.preventDefault(); }
});
}
function bindConfig() {
/* カテゴリタブ */
$$("#cfgTabs .cfg-tab").forEach((t) => t.addEventListener("click", () => {
$$("#cfgTabs .cfg-tab").forEach((x) => x.classList.toggle("on", x === t));
$$(".cfg-pane").forEach((p) => p.classList.toggle("on", p.dataset.pane === t.dataset.tab));
}));
/* 専用スライダー */
$$(".ctl-slider").forEach(bindSlider);
/* 専用セグメント */
$$(".ctl-seg").forEach((seg) => seg.addEventListener("click", (e) => {
const b = e.target.closest("button"); if (!b) return;
const key = seg.dataset.seg, v = b.dataset.v;
if (key === "fontSize") { cfg.fontSize = v; applyCfg(); }
else if (key === "skipMode") cfg.skipMode = v;
else if (key === "readColorOn") { cfg.readColorOn = v === "on"; applyCfg(); $("#readColorItem").classList.toggle("off", !cfg.readColorOn); }
else if (key === "font") { cfg.font = v; applyCfg(); }
else if (key === "voiceOn") { cfg.voiceOn = v === "on"; applyCfg(); }
else if (key === "fx") cfg.fx = v === "on";
else if (key === "boss") cfg.boss = v === "on";
saveCfg(); paintSeg(key);
}));
/* 既読色チップ */
$$("#ctlReadColor .sw").forEach((b) => b.addEventListener("click", () => {
cfg.readColor = b.dataset.c; saveCfg(); applyCfg();
$$("#ctlReadColor .sw").forEach((x) => x.classList.toggle("on", x === b));
}));
$("#cfgReset").addEventListener("click", () => {
askConfirm("設定を初期値に戻しますか？（セーブデータには影響しません）", () => {
cfg = Object.assign({}, defaultCfg); saveCfg(); applyCfg(); syncConfigUI(); toast("設定を初期化しました");
});
});
$("#cfgFullscreen").addEventListener("click", () => {
if (document.fullscreenElement) document.exitFullscreen();
else document.documentElement.requestFullscreen?.();
});
const SAVE_KEYS = ["vna_saves_v1", "vna_config_v1", "vna_progress_v1", "vna_read_v1"];
$("#cfgExport").addEventListener("click", () => {
const data = {};
SAVE_KEYS.forEach((k) => { const v = localStorage.getItem(k); if (v !== null) { try { data[k] = JSON.parse(v); } catch (err) { data[k] = v; } } });
const payload = JSON.stringify({ app: "vn-arcade", version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
const a = document.createElement("a");
a.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
a.download = "vn-arcade-save.json";
a.click();
setTimeout(() => URL.revokeObjectURL(a.href), 4000);
toast("セーブデータを書き出しました");
});
$("#cfgImport").addEventListener("click", () => {
let inp = document.getElementById("cfgImportFile");
if (!inp) {
inp = document.createElement("input");
inp.type = "file"; inp.id = "cfgImportFile"; inp.accept = "application/json,.json"; inp.hidden = true;
inp.addEventListener("change", onImportFile);
document.body.appendChild(inp);
}
inp.click();
});
function onImportFile(ev) {
const f = ev.target.files && ev.target.files[0];
ev.target.value = "";
if (!f) return;
const r = new FileReader();
r.onload = () => {
try {
const obj = JSON.parse(String(r.result));
if (!obj || obj.app !== "vn-arcade" || !obj.data) throw new Error("bad file");
askConfirm("セーブデータを読み込みますか？（現在のセーブ・進行度・設定は上書きされます）", () => {
SAVE_KEYS.forEach((k) => { if (obj.data[k] !== undefined) localStorage.setItem(k, JSON.stringify(obj.data[k])); });
toast("読み込みました。再読み込みします");
setTimeout(() => location.reload(), 600);
});
} catch (err) { toast("読み込めませんでした（ファイル形式が違います）"); }
};
r.readAsText(f);
}
syncConfigUI();
}
$("#configClose").addEventListener("click", () => hideLayer(el.configScr));

/* ================================================================
EXTRA（フローチャート / ギャラリー / エンディング）
================================================================ */
function openExtra(g) {
el.extraTitle.textContent = g.title + " — EXTRA";
extraTab = "flow";
$$(".extra-tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === "flow"));
renderExtra(g);
showLayer(el.extraScr);
}
$$(".extra-tabs button").forEach((b) => b.addEventListener("click", () => {
extraTab = b.dataset.tab;
$$(".extra-tabs button").forEach((x) => x.classList.toggle("on", x === b));
renderExtra(G);
}));
$("#extraClose").addEventListener("click", () => hideLayer(el.extraScr));

function renderExtra(g) {
if (extraTab === "flow") renderFlow(g);
else if (extraTab === "gallery") renderGallery(g);
else if (extraTab === "credits") renderCredits(g);
else renderEndings(g);
}
function parseEndLabel(text) {
const t = text || "";
const i = t.indexOf("【");
if (i < 0) return { kind: "END", sub: "" };
const j = t.indexOf("】", i);
const inner = t.slice(i + 1, j < 0 ? undefined : j);
const kind = inner.startsWith("GOOD") ? "GOOD" : inner.startsWith("NORMAL") ? "NORMAL" : "END";
const parts = inner.split("―");
return { kind, sub: (parts[1] || "").trim() };
}
const BGM_CREDITS = {
sakura: { main: "Porch Swing Days - slower", calm: "Meditation Impromptu 02", love: "In Your Arms" },
misaki: { main: "Bossa Antigua", calm: "Night on the Docks - Piano", love: "Night on the Docks - Sax" },
rin: { main: "Light Thought var 1", calm: "Serene", love: "Touching Moments Two - Higher" },
yuna: { main: "Gymnopedie No. 1", calm: "Meditation Impromptu 03", love: "Canon in D Major" },
serena: { main: "Devonshire Waltz Moderato", calm: "Dark Fog", love: "Grand Dark Waltz Moderato" }
};
function renderCredits(g) {
const c = BGM_CREDITS[g.id];
const rows = [["日常シーン", c.main], ["静かなシーン", c.calm], ["夜・R18シーン", c.love]].map(([m, t]) =>
`<div class="end-row"><div class="end-badge">BGM</div><div><div class="e-name">${t}</div><div class="e-sub">${m}</div></div></div>`).join("");
el.extraBody.innerHTML = `<div class="flow-legend">使用素材クレジット</div><div class="ends-list">${rows}` +
`<div class="end-row"><div class="end-badge">音楽</div><div><div class="e-name">Kevin MacLeod (incompetech.com)</div><div class="e-sub">Licensed under Creative Commons: By Attribution 4.0 License — http://creativecommons.org/licenses/by/4.0/</div></div></div>` +
`<div class="end-row"><div class="end-badge">効果音</div><div><div class="e-name">オリジナル合成音源</div><div class="e-sub">本サイト内で生成した効果音を使用しています</div></div></div>` +
`<div class="end-row"><div class="end-badge">ボイス</div><div><div class="e-name">Fish Audio（AI音声合成）</div><div class="e-sub">『桜色シグナル』のR18シーン台詞の一部に使用</div></div></div></div>`;
}
function renderEndings(g) {
const p = prog(g.id);
const ends = g.scenes.filter((n) => n.end);
let html = `<div class="flow-legend">到達したエンディング： ${Object.keys(p.endings).length} / ${ends.length}　` +
(p.unlocked? "（EXTRA解放済み）": "（未解放）") + `</div><div class="ends-list">`;
ends.forEach((n, i) => {
const lab = parseEndLabel(n.text), ts = p.endings[n.id];
html += `<div class="end-row ${ts? "": "unreached"}"><div class="end-badge">${ts? "到達": "未到達"}</div>` +
`<div><div class="e-name">${lab.kind} END ― ${lab.sub || ("エンディング" + (i + 1))}</div>` +
`<div class="e-sub">${ts? "到達：" + new Date(ts).toLocaleString("ja-JP"): "未到達（シーン " + n.id + "）"}</div></div></div>`;
});
el.extraBody.innerHTML = html + "</div>";
}
function renderGallery(g) {
const p = prog(g.id);
const items = [{ key: "cover", name: "タイトル画", src: g.cover}, { key: "char", name: "立ち絵：" + g.heroine, src: g.images.char}];
Object.keys(g.images).forEach((k) => { if (k!== "char") items.push({ key: "bg:" + k, name: "背景：" + (BG_LABELS[k] || k), src: bgOf(g, k)});});
const fmap = facesOf(g);
if (fmap) { const fl = { smile: "笑顔", laugh: "大笑い", shy: "照れ", surprise: "驚き", wink: "ウインク", sad: "悲しみ", cry: "泣き", angry: "怒り", serious: "真剣", confused: "困り", love: "恋", sleepy: "眠い", pleasure: "快感", ecstasy: "絶頂" }; Object.keys(fmap).forEach((k) => items.push({ key: "face:" + k, name: "立ち絵差分：" + (fl[k] || k), src: fmap[k] })); }
const wrap = document.createElement("div");
wrap.innerHTML = `<div class="flow-legend">作中で表示された素材だけが解放されます（${items.filter((i) => p.seen.includes(i.key)).length} / ${items.length}）</div>`;
const grid = document.createElement("div"); grid.className = "gallery-grid";
items.forEach((it) => {
const seen = p.seen.includes(it.key);
const d = document.createElement("div");
d.className = "g-item" + (seen? "": " locked");
d.innerHTML = `<img src="${it.src}" alt="" loading="lazy"><div class="g-name">${seen? it.name: "？？？"}</div>`;
if (seen) d.addEventListener("click", () => {
el.extraBody.innerHTML = "";
const back = document.createElement("button");
back.className = "btn small"; back.type = "button"; back.textContent = "◀ ギャラリーに戻る";
back.addEventListener("click", () => renderGallery(g));
const img = document.createElement("img");
img.src = it.src; img.style.cssText = "width:100%;border-radius:12px;margin-top:12px;";
el.extraBody.append(back, img);
});
grid.appendChild(d);
});
wrap.appendChild(grid);
el.extraBody.innerHTML = ""; el.extraBody.appendChild(wrap);
}
function renderFlow(g) {
const byId = {}; g.scenes.forEach((n, i) => { byId[n.id] = { node: n, index: i};});
const isKey = (n) =>!!(n.choice || n.branch || n.end);
const succ = (n) => { if (n.jump) return n.jump; const e = byId[n.id]; const nx = g.scenes[e.index + 1]; return nx? nx.id: null;};
function nextKeyIncl(id) {
let guard = 0; const seen = new Set();
while (id && guard++ < 500 &&!seen.has(id)) {
seen.add(id); const e = byId[id]; if (!e) return null;
if (isKey(e.node)) return id;
id = succ(e.node);
}
return null;
}
const nodes = [{ id: "__start", label: "START", sub: "物語の始まり", type: "start"}];
const nodeMap = { __start: nodes[0]};
g.scenes.forEach((n) => {
if (!isKey(n)) return;
let label, sub;
if (n.choice) { label = "選択肢"; sub = (n.choice[0]?.text || "").slice(0, 20) + "…";}
else if (n.branch) { label = "条件分岐"; sub = `好感度 ${n.branch.min?? n.branch.eq} で分岐`;}
else { const lab = parseEndLabel(n.text); label = lab.kind + " END"; sub = lab.sub;}
nodeMap[n.id] = { id: n.id, label, sub, type: n.end? "end": n.choice? "choice": "branch"};
nodes.push(nodeMap[n.id]);
});
const edges = [];
const addEdge = (from, to) => { if (to && nodeMap[to] && from!== to &&!edges.some((e) => e[0] === from && e[1] === to)) edges.push([from, to]);};
addEdge("__start", nextKeyIncl(g.scenes[0].id) || g.scenes[0].id);
g.scenes.forEach((n) => {
if (n.choice) n.choice.forEach((c) => addEdge(n.id, nextKeyIncl(c.jump)));
if (n.branch) { addEdge(n.id, nextKeyIncl(n.branch.then)); addEdge(n.id, nextKeyIncl(n.branch.else));}
});
// BFSで深さを決める
const depth = { __start: 0}; const queue = ["__start"];
while (queue.length) {
const curId = queue.shift();
edges.filter((e) => e[0] === curId).forEach((e) => {
if (depth[e[1]] === undefined) { depth[e[1]] = depth[curId] + 1; queue.push(e[1]);}
});
}
let maxD = 0; nodes.forEach((n) => { if (depth[n.id] === undefined) depth[n.id] = ++maxD; else maxD = Math.max(maxD, depth[n.id]);});
const cols = {};
nodes.forEach((n) => { (cols[depth[n.id]] = cols[depth[n.id]] || []).push(n);});
const NW = 172, NH = 86, GX = 64, GY = 30;
let maxRows = 0; Object.values(cols).forEach((c) => { maxRows = Math.max(maxRows, c.length);});
const W = (maxD + 1) * (NW + GX) + 10, H = maxRows * (NH + GY) + 10;
const pos = {};
Object.entries(cols).forEach(([d, c]) => c.forEach((n, i) => { pos[n.id] = { x: 6 + (+d) * (NW + GX), y: 6 + i * (NH + GY)};}));
const read = readSet(g.id), p = prog(g.id);
let svg = "";
edges.forEach(([a, b]) => {
const A = pos[a], B = pos[b]; if (!A ||!B) return;
const vis = read.has(b) || b === "__start";
svg += `<line x1="${A.x + NW}" y1="${A.y + NH / 2}" x2="${B.x}" y2="${B.y + NH / 2}" stroke="${vis? "var(--accent)": "rgba(150,140,190,.3)"}" stroke-width="2"/>`;
});
let html = `<div class="flow-legend">到達済みの場面からは「回想」で再生できます。線とノードの色が付いている部分が到達済みです。</div>` +
`<div class="flow-wrap"><div class="flow-canvas" style="width:${W}px;height:${H}px">` +
`<svg class="flow-svg" width="${W}" height="${H}">${svg}</svg>`;
nodes.forEach((n) => {
const P = pos[n.id]; if (!P) return;
const visited = n.id === "__start" || read.has(n.id);
const isEnd = n.type === "end";
html += `<div class="flow-node ${visited? "visited": ""} ${isEnd? "end": ""}" style="left:${P.x}px;top:${P.y}px">` +
`<b>${n.label}</b><small>${n.id === "__start"? "": "シーン " + n.id + "／"}${(n.sub || "").replace(/</g, "&lt;")}</small>` +
(visited &&!isEnd? `<br><button type="button" data-replay="${n.id}">ここから回想</button>`: "") +
(isEnd? `<br><small>${p.endings[n.id]? "到達済み": "未到達"}</small>`: "") + `</div>`;
});
el.extraBody.innerHTML = html + "</div></div>";
const fWrap = $(".flow-wrap", el.extraBody), fCanvas = $(".flow-canvas", el.extraBody);
if (fWrap && fCanvas) { const avail = fWrap.clientWidth - 4; if (W > avail && avail > 0) { const sc = avail / W; fCanvas.style.transform = "scale(" + sc + ")"; fWrap.style.height = Math.ceil(H * sc + 8) + "px"; } }
$$("[data-replay]", el.extraBody).forEach((b) => b.addEventListener("click", () => {
hideLayer(el.extraScr);
startGame(g, { scene: b.dataset.replay, replay: true});
toast("回想モードで再生中");
}));
}

/* ================================================================
キーボード / ボスキー
================================================================ */
document.addEventListener("keydown", (e) => {
const tag = (e.target.tagName || "").toLowerCase();
if (tag === "input" || tag === "select" || tag === "textarea") { if (e.key!== "Escape") return;}
if (!el.bossScr.hidden) {
if (e.key === "Backspace" || e.key === "Escape") { e.preventDefault(); el.bossScr.hidden = true; if (G && !el.game.hidden) startBgm(G.id, bgmMood || "main"); }
return;
}
if (cfg.boss && e.key === "Backspace") { e.preventDefault(); stopVoice(); if (bgmAudio) bgmAudio.pause(); el.bossScr.hidden = false; return;}
if (e.key === "Escape") { if (closeTopLayer()) return; if (!el.backlog.hidden) { hideLayer(el.backlog); return;}}
if (e.key === "Control" &&!el.game.hidden &&!skipTimer) { ctrlSkip = true; startSkip(); return;}
if (el.game.hidden || overlayStack.length) return;
if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance();}
else if (e.key === "ArrowUp") { e.preventDefault(); openLog();}
});
document.addEventListener("keyup", (e) => {
if (e.key === "Control" && ctrlSkip) { ctrlSkip = false; stopSkip();}
});

/* ================================================================
初期化
================================================================ */
applyCfg();
window.addEventListener("resize", () => applyCfg());
bindConfig();
buildPortal();
renderDevLog();
