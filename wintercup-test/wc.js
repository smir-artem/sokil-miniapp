/* Sokil Winter Cup — таблиці, матчі, бомбардири й склади на сайті клубу.
 * Дані: data.json поруч із цим файлом (публікує бот турніру).
 * Вставка на сторінку (блок «Власний HTML» / вкладка «Текст»):
 *   <div class="sokil-wc"></div>
 *   <script src="https://smir-artem.github.io/sokil-miniapp/wintercup/wc.js"></script>
 * Необов'язково: data-category="2015-2016" — лише одна категорія; data-view="table|matches|scorers|teams" — вкладка за замовчуванням.
 */
(function () {
  "use strict";
  var me = document.currentScript;
  var BASE = (me && me.src ? me.src : "").replace(/[^\/]*(\?.*)?$/, "");
  var DATA = null, LOADING = null;
  var VIEWS = [["table", "Таблиця"], ["matches", "Матчі"], ["scorers", "Бомбардири"], ["teams", "Команди"]];
  var MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var DAYS = ["неділя", "понеділок", "вівторок", "середа", "четвер", "пʼятниця", "субота"];

  var CSS = [
    ".swc{--y:#FDE100;--k:#111;--g:#f4f4f4;--m:#6b6b6b;font:15px/1.4 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--k);max-width:980px;margin:0 auto;text-align:left}",
    ".swc *{box-sizing:border-box}.swc button{font:inherit;cursor:pointer}",
    ".swc-head{background:var(--k);color:#fff;padding:14px 16px;border-radius:10px 10px 0 0;border-bottom:4px solid var(--y)}",
    ".swc-head b{color:var(--y);font-size:20px;display:block}.swc-head small{color:#bbb}",
    ".swc-cats,.swc-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:10px 0}",
    ".swc-cats button{border:1px solid var(--k);background:#fff;color:var(--k);border-radius:18px;padding:5px 12px}",
    ".swc-cats button.on{background:var(--k);color:var(--y)}",
    ".swc-tabs{border-bottom:2px solid var(--k);padding-bottom:0;flex-wrap:nowrap;overflow-x:auto;gap:4px}",
    ".swc-tabs button{border:0;background:var(--g);color:var(--k);padding:8px 14px;border-radius:8px 8px 0 0;white-space:nowrap}",
    ".swc-tabs button.on{background:var(--k);color:var(--y);font-weight:600}",
    ".swc h3{font-size:16px;margin:16px 0 6px;padding-left:8px;border-left:4px solid var(--y)}",
    ".swc table{border-collapse:collapse;width:100%;margin:0 0 8px}",
    ".swc th{background:var(--k);color:#fff;font-weight:500;font-size:13px;padding:6px 4px}",
    ".swc td{padding:6px 4px;border-bottom:1px solid #e5e5e5;text-align:center}",
    ".swc td.l,.swc th.l{text-align:left}.swc tr:nth-child(even) td{background:#fafafa}",
    ".swc td.pts{font-weight:700;background:#fff8c4!important}",
    ".swc .lg{width:22px;height:22px;object-fit:contain;vertical-align:middle;margin-right:6px}",
    ".swc .lnk{color:var(--k);text-decoration:none;border-bottom:1px dotted #999;cursor:pointer}",
    ".swc-day{margin:14px 0 4px;font-weight:600}.swc-day::first-letter{text-transform:uppercase}",
    ".swc-m{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:8px;border:1px solid #e5e5e5;border-radius:8px;margin:4px 0;cursor:pointer;background:#fff}",
    ".swc-m .h{text-align:right}.swc-m .s{min-width:70px;text-align:center;font-weight:700;font-size:17px;background:var(--k);color:var(--y);border-radius:6px;padding:3px 8px}",
    ".swc-m .s.t{background:var(--g);color:var(--k);font-weight:500;font-size:14px}.swc-m .s.live{background:#c00;color:#fff;font-size:13px}",
    ".swc-meta{grid-column:1/4;font-size:12px;color:var(--m);text-align:center}",
    ".swc-ev{grid-column:1/4;display:none;font-size:13px;border-top:1px dashed #ddd;padding-top:6px}.swc-m.open .swc-ev{display:block}",
    ".swc-ev div{display:grid;grid-template-columns:1fr 40px 1fr;gap:6px}.swc-ev .h{text-align:right}",
    ".swc-badge{display:inline-block;background:#fff3cd;color:#7a5b00;border-radius:4px;padding:0 5px;font-size:11px}",
    ".swc-teams{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:10px}",
    ".swc-team{border:1px solid #e5e5e5;border-radius:8px;padding:10px;background:#fff;cursor:pointer;display:flex;align-items:center;gap:8px}",
    ".swc-team img{width:36px;height:36px;object-fit:contain}",
    ".swc-pl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:10px}",
    ".swc-p{border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;background:#fff;cursor:pointer;text-align:center}",
    ".swc-ph{width:100%;aspect-ratio:3/4;object-fit:cover;background:var(--g);display:flex;align-items:center;justify-content:center;font-size:40px;color:#ccc}",
    ".swc-p .n{padding:6px 6px 0;font-weight:600;font-size:14px}.swc-p .d{padding:0 6px 8px;font-size:12px;color:var(--m)}",
    ".swc-num{display:inline-block;min-width:24px;background:var(--y);color:var(--k);border-radius:4px;font-weight:700;margin-right:4px}",
    ".swc-back{border:0;background:none;color:var(--k);padding:10px 0;font-weight:600}",
    ".swc-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px}",
    ".swc-card{background:#fff;border-radius:12px;max-width:340px;width:100%;overflow:hidden;position:relative}",
    ".swc-card .swc-ph{aspect-ratio:1/1}.swc-card .b{padding:12px 14px;border-top:4px solid var(--y)}",
    ".swc-card .x{position:absolute;top:6px;right:8px;border:0;background:rgba(0,0,0,.6);color:#fff;border-radius:50%;width:30px;height:30px}",
    ".swc-empty{color:var(--m);padding:16px 0}.swc-foot{font-size:12px;color:var(--m);padding:10px 0}",
    "@media(max-width:560px){.swc{font-size:14px}.swc .hide-s{display:none}.swc-m .s{min-width:56px;font-size:15px}.swc-tabs button{padding:8px 10px}}"
  ].join("\n");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function url(p) { return p ? BASE + p : ""; }
  function team(id) { return (DATA.teams && DATA.teams[id]) || { id: id, name: id || "—", logo: "", players: [] }; }
  function logo(t) { return t.logo ? '<img class="lg" src="' + esc(url(t.logo)) + '" alt="">' : ""; }
  function tname(id, link) {
    var t = team(id);
    return logo(t) + (link && DATA.teams[id] ? '<a class="lnk" data-team="' + esc(id) + '">' + esc(t.name) + "</a>" : esc(t.name));
  }
  function dayTitle(iso) {
    if (!iso) return "Дата уточнюється";
    var d = new Date(iso + "T12:00:00");
    return DAYS[d.getDay()] + ", " + d.getDate() + " " + MONTHS[d.getMonth()];
  }
  function findPlayer(pid) {
    for (var k in DATA.teams) {
      var ps = DATA.teams[k].players || [];
      for (var i = 0; i < ps.length; i++) if (ps[i].id === pid) return { p: ps[i], t: DATA.teams[k] };
    }
    return null;
  }

  function load(force) {
    if (DATA && !force) return Promise.resolve(DATA);
    if (LOADING) return LOADING;
    LOADING = fetch(BASE + "data.json?t=" + Math.floor(Date.now() / 60000), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { DATA = d; LOADING = null; return d; })
      .catch(function (e) { LOADING = null; throw e; });
    return LOADING;
  }

  // ───────────── розділи ─────────────
  function viewTable(c) {
    var st = (c.stages || []).filter(function (s) { return s.kind === "table"; });
    if (!st.length) return '<div class="swc-empty">Таблиця з’явиться після перших матчів.</div>';
    return st.map(function (s) {
      var rows = s.table.map(function (r) {
        return "<tr><td>" + r.pos + '</td><td class="l">' + tname(r.team, true) + "</td><td>" + r.p + '</td><td class="hide-s">' + r.w +
          '</td><td class="hide-s">' + r.d + '</td><td class="hide-s">' + r.l + "</td><td>" + r.gf + "–" + r.ga + '</td><td class="hide-s">' +
          (r.gd > 0 ? "+" : "") + r.gd + '</td><td class="pts">' + r.pts + "</td></tr>";
      }).join("");
      return (s.name || st.length > 1 ? "<h3>" + esc(s.name || "Таблиця") + "</h3>" : "") +
        '<table><tr><th>#</th><th class="l">Команда</th><th title="Ігри">І</th><th class="hide-s" title="Виграші">В</th><th class="hide-s" title="Нічиї">Н</th>' +
        '<th class="hide-s" title="Поразки">П</th><th title="Голи">М</th><th class="hide-s" title="Різниця">±</th><th title="Очки">О</th></tr>' + rows + "</table>";
    }).join("");
  }

  function matchRow(m) {
    var s, cls = "s";
    if (m.status === "played") s = esc(m.score) + (m.pens ? '<div style="font-size:11px;font-weight:400">пен. ' + esc(m.pens) + "</div>" : "");
    else if (m.status === "live") { s = "триває"; cls += " live"; }
    else { s = esc(m.time || "—"); cls += " t"; }
    var meta = [];
    if (m.stage) meta.push(esc(m.stage));
    if (m.status === "played" && m.time) meta.push(esc(m.time));
    if (m.status === "played" && !m.approved) meta.push('<span class="swc-badge">протокол на погодженні</span>');
    if (m.tech) meta.push(esc(m.tech));
    var ev = "";
    if (m.events && m.events.length) {
      ev = '<div class="swc-ev">' + m.events.map(function (e) {
        var ic = { goal: "⚽", own: "⚽ (авт.)", yellow: "🟨", red: "🟥" }[e.type] || "";
        var who = (e.pid ? '<a class="lnk" data-player="' + esc(e.pid) + '">' + esc(e.player) + "</a>" : esc(e.player)) + " " + ic + (e.pen ? " (пен.)" : "");
        var mn = e.min != null ? e.min + "’" : "";
        return e.side === "h" ? '<div><span class="h">' + who + "</span><span>" + mn + "</span><span></span></div>"
          : '<div><span></span><span>' + mn + "</span><span>" + who + "</span></div>";
      }).join("") + "</div>";
    }
    return '<div class="swc-m"><div class="h">' + esc(team(m.home).name) + " " + logo(team(m.home)) + '</div><div class="' + cls + '">' + s +
      "</div><div>" + logo(team(m.away)) + esc(team(m.away).name) + "</div>" + (meta.length ? '<div class="swc-meta">' + meta.join(" · ") + "</div>" : "") + ev + "</div>";
  }

  function viewMatches(c) {
    if (!c.matches.length) return '<div class="swc-empty">Розклад матчів ще не опубліковано.</div>';
    var out = "", last = null;
    c.matches.forEach(function (m) {
      if (m.date !== last) { out += '<div class="swc-day">' + dayTitle(m.date) + "</div>"; last = m.date; }
      out += matchRow(m);
    });
    return out;
  }

  function viewScorers(c) {
    if (!c.scorers.length) return '<div class="swc-empty">Голів ще немає.</div>';
    return '<table><tr><th>#</th><th class="l">Гравець</th><th class="l hide-s">Команда</th><th title="Голи">⚽</th><th class="hide-s" title="Ігри">І</th></tr>' +
      c.scorers.map(function (r) {
        return "<tr><td>" + r.rank + '</td><td class="l"><a class="lnk" data-player="' + esc(r.pid) + '">' + esc(r.name) + '</a></td><td class="l hide-s">' +
          tname(r.team, true) + "</td><td><b>" + r.goals + "</b>" + (r.pen ? ' <small title="з пенальті">(' + r.pen + " пен.)</small>" : "") +
          '</td><td class="hide-s">' + r.games + "</td></tr>";
      }).join("") + "</table>";
  }

  function viewTeams(c) {
    if (!c.teams.length) return '<div class="swc-empty">Команди ще не заявлені.</div>';
    return '<div class="swc-teams">' + c.teams.map(function (id) {
      var t = team(id);
      return '<div class="swc-team" data-team="' + esc(id) + '">' + (t.logo ? '<img src="' + esc(url(t.logo)) + '" alt="">' : "") +
        "<div><b>" + esc(t.name) + '</b><div style="font-size:12px;color:#6b6b6b">' + esc(t.club || "") + " · гравців: " + (t.players || []).length + "</div></div></div>";
    }).join("") + "</div>";
  }

  function photo(p, cls) {
    return p.photo ? '<img class="swc-ph ' + (cls || "") + '" src="' + esc(url(p.photo)) + '" alt="" loading="lazy">' : '<div class="swc-ph">⚽</div>';
  }

  function viewTeam(id) {
    var t = team(id);
    var ps = t.players || [];
    return '<button class="swc-back" data-back="1">← Назад</button><h3>' + logo(t) + esc(t.name) + (t.club && t.club !== t.name ? " · " + esc(t.club) : "") + "</h3>" +
      (ps.length ? '<div class="swc-pl">' + ps.map(function (p) {
        return '<div class="swc-p" data-player="' + esc(p.id) + '">' + photo(p) + '<div class="n">' + (p.num !== "" ? '<span class="swc-num">' + esc(p.num) + "</span>" : "") +
          esc(p.name) + '</div><div class="d">' + esc(p.dob) + (p.games ? " · ігор " + p.games : "") + (p.goals ? " · ⚽ " + p.goals : "") + "</div></div>";
      }).join("") + "</div>" : '<div class="swc-empty">Склад ще не подано.</div>');
  }

  function showPlayer(pid) {
    var f = findPlayer(pid);
    if (!f) return;
    var p = f.p, box = document.createElement("div");
    box.className = "swc swc-modal";
    box.innerHTML = '<div class="swc-card"><button class="x" aria-label="Закрити">✕</button>' + photo(p) + '<div class="b"><b style="font-size:17px">' +
      (p.num !== "" ? '<span class="swc-num">' + esc(p.num) + "</span>" : "") + esc(p.name) + "</b><div>" + logo(f.t) + esc(f.t.name) + "</div>" +
      (p.dob ? "<div>Дата народження: " + esc(p.dob) + "</div>" : "") + "<div>Ігор: " + (p.games || 0) + " · Голів: " + (p.goals || 0) + "</div></div></div>";
    box.addEventListener("click", function (e) { if (e.target === box || e.target.className === "x") box.remove(); });
    document.body.appendChild(box);
  }

  // ───────────── віджет ─────────────
  function Widget(el) {
    this.el = el;
    this.cat = el.getAttribute("data-category") || "";
    this.fixedCat = !!this.cat;
    this.view = el.getAttribute("data-view") || "table";
    this.team = "";
    var self = this;
    el.addEventListener("click", function (e) { self.click(e); });
  }
  Widget.prototype.render = function () {
    var d = DATA, self = this;
    var cats = d.categories.filter(function (c) { return c.matches.length || c.teams.length; });
    if (!cats.length) { this.el.innerHTML = '<div class="swc"><div class="swc-empty">Дані турніру з’являться незабаром.</div></div>'; return; }
    var c = cats.filter(function (x) { return x.name === self.cat; })[0] || cats[0];
    this.cat = c.name;
    var h = '<div class="swc"><div class="swc-head"><b>' + esc(d.name) + "</b><small>" + esc([d.season, this.fixedCat ? c.name : ""].filter(Boolean).join(" · ")) + "</small></div>";
    if (!this.fixedCat && cats.length > 1)
      h += '<div class="swc-cats">' + cats.map(function (x) { return '<button data-cat="' + esc(x.name) + '"' + (x.name === c.name ? ' class="on"' : "") + ">" + esc(x.name) + "</button>"; }).join("") + "</div>";
    h += '<div class="swc-tabs">' + VIEWS.map(function (v) { return '<button data-view="' + v[0] + '"' + (v[0] === self.view && !self.team ? ' class="on"' : "") + ">" + v[1] + "</button>"; }).join("") + "</div>";
    if (this.team) h += viewTeam(this.team);
    else h += { table: viewTable, matches: viewMatches, scorers: viewScorers, teams: viewTeams }[this.view](c);
    h += '<div class="swc-foot">' + (d.updated ? "Оновлено: " + esc(d.updated) + ". " : "") + "Дані — система турніру Sokil Winter Cup.</div></div>";
    this.el.innerHTML = h;
  };
  Widget.prototype.click = function (e) {
    var t = e.target.closest ? e.target.closest("[data-cat],[data-view],[data-team],[data-player],[data-back],.swc-m") : null;
    if (!t || !this.el.contains(t)) return;
    if (t.hasAttribute("data-player")) { showPlayer(t.getAttribute("data-player")); e.stopPropagation(); return; }
    if (t.hasAttribute("data-cat")) { this.cat = t.getAttribute("data-cat"); this.team = ""; }
    else if (t.hasAttribute("data-view")) { this.view = t.getAttribute("data-view"); this.team = ""; }
    else if (t.hasAttribute("data-team")) { this.team = t.getAttribute("data-team"); }
    else if (t.hasAttribute("data-back")) { this.team = ""; }
    else if (t.classList.contains("swc-m")) { t.classList.toggle("open"); return; }
    this.render();
  };

  function start() {
    if (!document.getElementById("swc-css")) {
      var st = document.createElement("style");
      st.id = "swc-css";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var els = [].slice.call(document.querySelectorAll(".sokil-wc"));
    if (!els.length) return;
    var ws = els.map(function (el) { el.innerHTML = '<div class="swc"><div class="swc-empty">Завантаження…</div></div>'; return new Widget(el); });
    function draw() { ws.forEach(function (w) { w.render(); }); }
    load().then(draw).catch(function () {
      els.forEach(function (el) { el.innerHTML = '<div class="swc"><div class="swc-empty">Не вдалося завантажити дані турніру. Спробуйте оновити сторінку.</div></div>'; });
    });
    setInterval(function () {  // оновлення раз на 2 хвилини, якщо відкрито не картку гравця
      if (document.querySelector(".swc-modal")) return;
      load(true).then(function () { ws.forEach(function (w) { if (!w.el.querySelector(".swc-m.open")) w.render(); }); }).catch(function () {});
    }, 120000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
