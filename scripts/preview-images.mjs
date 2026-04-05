#!/usr/bin/env node
/**
 * X投稿プレビュー
 * Usage: node scripts/preview-images.mjs                ← 未投稿ドラフト全部
 *        node scripts/preview-images.mjs week           ← 今週分（月〜日）
 *        node scripts/preview-images.mjs 2026-04-02     ← 指定日
 *        node scripts/preview-images.mjs 4 27 60        ← 施設ID指定（画像のみ）
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC = resolve(ROOT, "public/facilities");
const DRAFTS = resolve(ROOT, "docs/x-drafts.md");
const OUT = resolve(ROOT, "image-preview.html");

function calcWeight(text) {
  let w = 0;
  for (const ch of text) {
    if (ch === "\n") w += 1;
    else if (ch.codePointAt(0) > 0x1f000) w += 2;
    else if (ch.charCodeAt(0) > 127) w += 2;
    else w += 1;
  }
  return w;
}

function parseDrafts() {
  const content = readFileSync(DRAFTS, "utf-8");
  const sections = content.split(/^---$/m);
  const posts = [];
  for (const section of sections) {
    const hm = section.match(/^## (\d{4}-\d{2}-\d{2}) (午前|午後) — (.+)$/m);
    if (!hm) continue;
    const [, date, slot, title] = hm;
    const done = section.includes("✅投稿済み");
    const idMatch = title.match(/\(id=(\d+)\)/);
    const bodyMatch = section.match(/### 本文[^\n]*\n```\n([\s\S]*?)```/);
    const replyMatch = section.match(/### リプライ[^\n]*\n```\n([\s\S]*?)```/);
    const imageMatches = [...section.matchAll(/^- (.+\.webp)(?:（(.+?)）)?$/gm)];
    posts.push({
      date, slot, title, done,
      id: idMatch ? idMatch[1] : null,
      body: bodyMatch ? bodyMatch[1].trim() : "",
      reply: replyMatch ? replyMatch[1].trim() : "",
      images: imageMatches.map((m) => ({
        path: m[1].replace(/（.+?）$/, "").trim(),
        label: m[2] || "",
      })),
    });
  }
  return posts;
}

// --- フィルタリング ---
const args = process.argv.slice(2);
const facilities = JSON.parse(readFileSync(resolve(ROOT, "data/facilities.json"), "utf-8"));
let posts = [];
let filterLabel = "";

const isIdMode = args.length > 0 && /^\d+$/.test(args[0]) && args[0].length < 5;
const isDateMode = args.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(args[0]);
const isWeekMode = args[0] === "week";

if (isIdMode) {
  for (const id of args) {
    const f = facilities.find((x) => x.id === Number(id));
    posts.push({
      date: "", slot: "", title: f ? `${f.name} (id=${id})` : `id=${id}`,
      done: false, id, body: "", reply: "",
      images: Array.from({ length: 10 }, (_, i) => ({
        path: `public/facilities/${id}-${i}.webp`, label: "",
      })).filter((img) => existsSync(resolve(ROOT, img.path))),
    });
  }
  filterLabel = `施設ID: ${args.join(", ")}`;
} else {
  const all = parseDrafts().filter((p) => !p.done);
  if (isWeekMode) {
    const now = new Date();
    const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    const day = jst.getDay() || 7;
    const mon = new Date(jst); mon.setDate(jst.getDate() - day + 1);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const monStr = mon.toISOString().slice(0, 10);
    const sunStr = sun.toISOString().slice(0, 10);
    posts = all.filter((p) => p.date >= monStr && p.date <= sunStr);
    filterLabel = `今週 (${monStr} 〜 ${sunStr})`;
  } else if (isDateMode) {
    posts = all.filter((p) => p.date === args[0]);
    filterLabel = args[0];
  } else {
    posts = all;
    filterLabel = `未投稿すべて`;
  }
  if (posts.length === 0) {
    console.log("該当するドラフトが見つかりません");
    process.exit(0);
  }
  // 新しい投稿が上（日曜→月曜、午後→午前）
  posts.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.slot === "午後" ? -1 : 1;
  });
  console.log(`${posts.length} 件を検出（${filterLabel}）`);
}

// --- HTML生成ヘルパー ---
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtBody = (text) =>
  esc(text).replace(/(#\S+)/g, '<span class="ht">$1</span>').replace(/\n/g, "<br>");
const fmtTime = (date, slot) => {
  if (!date) return "";
  const d = new Date(date + "T00:00:00+09:00");
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  const time = slot === "午前" ? "9:00 AM" : "6:00 PM";
  return `${time} · ${mon} ${d.getDate()}, ${d.getFullYear()}`;
};

const AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23ff6b35'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3Eサ%3C/text%3E%3C/svg%3E";

let cards = "";
for (const post of posts) {
  const w = post.body ? calcWeight(post.body) : 0;
  const wCls = w > 280 ? "over" : w > 270 ? "warn" : "ok";
  const imgs = post.images.slice(0, 4);
  const gc = ["", "g1", "g2", "g3", "g4"][imgs.length] || "g4";

  const imgHtml = imgs.map((img, i) => {
    const abs = resolve(ROOT, img.path);
    return `<div class="gi" draggable="true" data-path="${abs}" data-rel="${img.path}">
      <img src="${img.path}" alt="" loading="lazy">
      <b class="on">${i + 1}</b>
      <span class="fn">${img.path.split("/").pop()}</span>
    </div>`;
  }).join("");

  const replyHtml = post.reply ? `
    <div class="thread">
      <div class="tl"></div>
      <div class="tw reply-tw">
        <div class="th">
          <img class="av" src="${AVATAR}" alt="">
          <div class="nm"><b>サウナ子</b><span>@saunako_jp</span></div>
        </div>
        <div class="tb">${fmtBody(post.reply)}</div>
      </div>
    </div>` : "";

  cards += `
<div class="card">
  <div class="tw">
    <div class="th">
      <img class="av" src="${AVATAR}" alt="">
      <div class="nm"><b>サウナ子</b><span>@saunako_jp</span></div>
      <svg class="x-logo" viewBox="0 0 24 24" width="18"><path fill="#71767b" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </div>
    <div class="tb">${post.body ? fmtBody(post.body) : ""}</div>
    ${imgs.length ? `<div class="ig ${gc}" data-pid="${post.date}-${post.slot}">${imgHtml}</div>` : ""}
    <div class="tm">${fmtTime(post.date, post.slot)}${w ? ` · <span class="wt ${wCls}">${w}/280</span>` : ""}</div>
    <div class="acts">
      <div class="act"><svg viewBox="0 0 24 24" width="18"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.893 4.306-2.394 5.82l-5.72 5.45a2.56 2.56 0 01-3.522-.06l-5.458-5.39A8.16 8.16 0 011.75 10z" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>0</span></div>
      <div class="act"><svg viewBox="0 0 24 24" width="18"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" fill="currentColor"/></svg><span>0</span></div>
      <div class="act"><svg viewBox="0 0 24 24" width="18"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.56-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.85-.516-6.74.938-1.89 2.686-3 4.693-3.11 1.628-.09 3.357.57 4.907 2.2 1.55-1.63 3.28-2.29 4.91-2.2 2.006.11 3.754 1.22 4.692 3.11.933 1.89.843 4.24-.518 6.74z" fill="currentColor"/></svg><span>0</span></div>
      <div class="act"><svg viewBox="0 0 24 24" width="18"><path d="M8.75 21V3h2v18h-2zM18.25 21V8.5h2V21h-2zM3.25 21v-6h2v6h-2zM13.25 21V13h2v8h-2z" fill="currentColor"/></svg><span>0</span></div>
      <div class="act"><svg viewBox="0 0 24 24" width="18"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" fill="currentColor"/></svg></div>
      <div class="act"><svg viewBox="0 0 24 24" width="18"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" fill="currentColor"/></svg></div>
    </div>
  </div>
  ${replyHtml}
</div>`;
}

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>X投稿プレビュー</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#000;color:#e7e9ea;display:flex;flex-direction:column;align-items:center}
.hdr{width:600px;max-width:100%;padding:16px 16px 0;position:sticky;top:0;background:#000;z-index:10;border-bottom:1px solid #2f3336}
.hdr h1{font-size:20px;font-weight:800}
.hdr p{color:#71767b;font-size:13px;padding:4px 0 12px}

.card{width:600px;max-width:100%;border-bottom:1px solid #2f3336;padding:0}
.tw{padding:12px 16px}
.th{display:flex;align-items:center;gap:10px;margin-bottom:4px}
.av{width:40px;height:40px;border-radius:50%;flex-shrink:0}
.nm b{font-size:15px;display:block;line-height:1.2}
.nm span{color:#71767b;font-size:15px}
.x-logo{margin-left:auto}
.tb{font-size:15px;line-height:1.5;margin:4px 0 12px 0;white-space:pre-wrap;word-break:break-word}
.ht{color:#1d9bf0}

.tm{color:#71767b;font-size:13px;padding-bottom:12px;border-bottom:1px solid #2f3336}
.wt{font-weight:700;padding:1px 6px;border-radius:10px;font-size:12px}
.wt.ok{background:#003320;color:#00ba7c}
.wt.warn{background:#332800;color:#ffd700}
.wt.over{background:#330d0d;color:#f4212e}

.ig{border-radius:16px;overflow:hidden;margin-bottom:12px;display:grid;gap:2px}
.g1{grid-template-columns:1fr;max-height:300px}
.g2{grid-template-columns:1fr 1fr;max-height:290px}
.g3{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;max-height:290px}
.g3 .gi:first-child{grid-row:1/3}
.g4{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;max-height:290px}
.gi{position:relative;overflow:hidden;min-height:130px;cursor:grab;transition:opacity .15s}
.gi img{width:100%;height:100%;object-fit:cover;display:block}
.gi:hover img{opacity:.85}
.gi.dragging{opacity:.3}
.gi.drag-over{outline:3px solid #1d9bf0;outline-offset:-3px}
.gi.copied img{opacity:.7}
.gi.copied::after{content:'✓ Copied';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#00ba7c;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700}
.on{position:absolute;top:6px;left:6px;background:rgba(0,0,0,.75);color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;display:flex;align-items:center;justify-content:center;font-style:normal}
.fn{position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,.75);color:#aaa;padding:1px 6px;border-radius:4px;font-size:10px;font-family:monospace}

.acts{display:flex;justify-content:space-between;padding:8px 0;max-width:420px}
.act{display:flex;align-items:center;gap:4px;color:#71767b;cursor:pointer;transition:color .15s}
.act span{font-size:13px}
.act:hover{color:#1d9bf0}
.act:first-child:hover{color:#1d9bf0}
.act:nth-child(2):hover{color:#00ba7c}
.act:nth-child(3):hover{color:#f91880}

.thread{position:relative;border-top:1px solid #2f3336}
.tl{position:absolute;left:36px;top:0;height:20px;width:2px;background:#333}
.reply-tw{padding:12px 16px}

.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1d9bf0;color:#fff;padding:10px 20px;border-radius:24px;font-size:14px;font-weight:600;z-index:999;opacity:0;transition:opacity .2s;pointer-events:none;white-space:nowrap}
.toast.show{opacity:1}

.order-out{display:none;margin:0 16px 12px;padding:8px 12px;background:#16181c;border:1px solid #2f3336;border-radius:8px;font-family:monospace;font-size:11px;color:#00ba7c;cursor:pointer;white-space:pre-wrap;word-break:break-all}
.order-out.vis{display:block}
</style>
</head>
<body>
<div class="hdr">
  <h1>Home</h1>
  <p>${filterLabel} · ${posts.length} posts · ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>
</div>
${cards}
<div class="toast" id="toast"></div>
<script>
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}

document.querySelectorAll('.gi').forEach(el=>{
  el.addEventListener('click',()=>{
    if(el.classList.contains('dragging'))return;
    navigator.clipboard.writeText(el.dataset.path).then(()=>{
      el.classList.add('copied');
      showToast(el.dataset.path.split('/').pop()+' copied');
      setTimeout(()=>el.classList.remove('copied'),1200);
    });
  });
});

let dI=null,dG=null;
document.querySelectorAll('.gi').forEach(el=>{
  el.addEventListener('dragstart',e=>{dI=el;dG=el.closest('.ig');requestAnimationFrame(()=>el.classList.add('dragging'));e.dataTransfer.effectAllowed='move'});
  el.addEventListener('dragend',()=>{el.classList.remove('dragging');dG.querySelectorAll('.gi').forEach(x=>x.classList.remove('drag-over'));dI=dG=null});
  el.addEventListener('dragover',e=>{e.preventDefault();if(!dI||el===dI||el.closest('.ig')!==dG)return;el.classList.add('drag-over')});
  el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));
  el.addEventListener('drop',e=>{
    e.preventDefault();el.classList.remove('drag-over');
    if(!dI||el===dI||el.closest('.ig')!==dG)return;
    const g=dG,its=[...g.querySelectorAll('.gi')],fi=its.indexOf(dI),ti=its.indexOf(el);
    fi<ti?g.insertBefore(dI,el.nextSibling):g.insertBefore(dI,el);
    g.querySelectorAll('.gi').forEach((x,i)=>x.querySelector('.on').textContent=i+1);
    let o=g.parentElement.querySelector('.order-out');
    if(!o){o=document.createElement('div');o.className='order-out';o.addEventListener('click',()=>{navigator.clipboard.writeText(o.textContent).then(()=>showToast('Order copied'))});g.insertAdjacentElement('afterend',o)}
    o.textContent=[...g.querySelectorAll('.gi')].map(x=>x.dataset.path).join('\\n');
    o.classList.add('vis');
    showToast('Reordered (click list to copy)');
  });
});
</script>
</body>
</html>`;

writeFileSync(OUT, html);
console.log(`✅ ${OUT} (${posts.length} posts)`);
try { execFileSync("open", [OUT]); } catch {}
