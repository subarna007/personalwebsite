/* All in One Hotel: a small single-page site with hash routes.
   Bookings and food orders are stored in localStorage only. */

const $ = (sel, root = document) => root.querySelector(sel);
const app = $("#app");
const rs = (n) => "NPR " + Math.round(n).toLocaleString("en-IN");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- storage ---------- */
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: keep going */ }
  },
};
let bookings = store.get("aioh-bookings", []);
let order = store.get("aioh-order", {});
const saveBookings = () => { store.set("aioh-bookings", bookings); updateTripCount(); };
const saveOrder = () => store.set("aioh-order", order);

/* ---------- dates ---------- */
const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const today = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
const addDays = (d, n) => new Date(d.getTime() + n * DAY);
const nights = (a, b) => Math.round((new Date(b + "T12:00") - new Date(a + "T12:00")) / DAY);
const fmtDate = (s) => new Date(s + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// search state shared between pages
const search = { checkin: iso(addDays(today(), 7)), checkout: iso(addDays(today(), 9)), guests: 2 };

/* ---------- availability ---------- */
function unitsBooked(roomId, checkin, checkout) {
  return bookings.filter((b) => b.kind === "room" && b.itemId === roomId && b.checkin < checkout && checkin < b.checkout)
    .reduce((n, b) => n + (b.rooms || 1), 0);
}
function unitsLeft(room, checkin, checkout) {
  return Math.max(0, room.units - unitsBooked(room.id, checkin, checkout));
}

/* ---------- small UI helpers ---------- */
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 3200);
}
function updateTripCount() {
  const c = $("#trip-count");
  c.textContent = bookings.length;
  c.hidden = bookings.length === 0;
}
function setActiveNav(route) {
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#/" + route));
}
function amenityChips(list) {
  return `<div class="chips">${list.map((a) => `<span class="chip">${esc(a)}</span>`).join("")}</div>`;
}

/* ---------- pages ---------- */
function home() {
  const featured = ROOMS.filter((r) => ["balcony", "queen", "king"].includes(r.id));
  return `
  <section class="hero">
    <img class="hero-img" src="img/adventures/abctrek.jpg" alt="Annapurna Base Camp with snow-covered peaks">
    <div class="wrap hero-inner">
      <h1>Stay, eat and explore from one front desk</h1>
      <p>Rooms by the lake in Pokhara, Nepali food from our kitchen, and paragliding, rafting or a trek to Annapurna booked in the same place.</p>
      ${searchCard("stay")}
    </div>
  </section>

  <section class="section">
    <div class="wrap strip">
      <a href="#/stay"><b>8 room types</b><span>From NPR 1,000 a night, for one to four guests.</span></a>
      <a href="#/adventures"><b>8 adventures</b><span>Paragliding, rafting, safari and the Annapurna trek.</span></a>
      <a href="#/dining"><b>Our kitchen</b><span>Momo, khana sets, pizza and coffee, ordered to your room.</span></a>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="section-head"><div><h2>Rooms guests book most</h2><p>Prices per night, taxes included.</p></div><a class="link" href="#/stay">See all rooms</a></div>
      <div class="grid">${featured.map(roomCard).join("")}</div>
    </div>
  </section>

  <section class="section" style="background:#fff">
    <div class="wrap">
      <div class="section-head"><div><h2>Adventures from the hotel</h2><p>Pick-up and drop-off from reception.</p></div><a class="link" href="#/adventures">All adventures</a></div>
      <div class="grid four">${ADVENTURES.slice(0, 4).map(advCard).join("")}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head"><div><h2>Packages</h2><p>Room, meals and adventures together, for less.</p></div><a class="link" href="#/packages">Compare packages</a></div>
      <div class="grid">${PACKAGES.map(pkgCard).join("")}</div>
    </div>
  </section>`;
}

function searchCard(active) {
  const tab = (id, label) => `<button type="button" class="tab" role="tab" aria-selected="${active === id}" data-tab="${id}">${label}</button>`;
  return `
  <form class="search" id="search-form" role="search">
    <div class="tabs" role="tablist">${tab("stay", "Rooms")}${tab("adventures", "Adventures")}${tab("dining", "Dining")}</div>
    <div class="search-row" data-panel="stay" ${active === "stay" ? "" : "hidden"}>
      <div class="field"><label for="s-in">Check-in</label><input id="s-in" type="date" value="${search.checkin}" min="${iso(today())}" required></div>
      <div class="field"><label for="s-out">Check-out</label><input id="s-out" type="date" value="${search.checkout}" min="${iso(addDays(today(), 1))}" required></div>
      <div class="field"><label for="s-guests">Guests</label><select id="s-guests">${[1, 2, 3, 4].map((n) => `<option ${n == search.guests ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      <div class="field"><label for="s-type">Room type</label><select id="s-type"><option value="">Any</option>${ROOMS.map((r) => `<option value="${r.id}">${r.name}</option>`).join("")}</select></div>
      <button class="btn" type="submit">Search rooms</button>
    </div>
    <div class="search-row" data-panel="adventures" ${active === "adventures" ? "" : "hidden"}>
      <div class="field" style="grid-column: span 2"><label for="s-adv">What do you want to do?</label><input id="s-adv" placeholder="e.g. rafting, trek, Chitwan"></div>
      <div class="field"><label for="s-level">Difficulty</label><select id="s-level"><option value="">Any</option><option>Easy</option><option>Moderate</option><option>Hard</option></select></div>
      <div class="field"><label for="s-budget">Budget per person</label><select id="s-budget"><option value="">Any</option><option value="3000">Up to NPR 3,000</option><option value="5000">Up to NPR 5,000</option></select></div>
      <button class="btn" type="submit">Find adventures</button>
    </div>
    <div class="search-row" data-panel="dining" ${active === "dining" ? "" : "hidden"}>
      <div class="field" style="grid-column: span 4"><label for="s-food">Search the menu</label><input id="s-food" placeholder="e.g. momo, latte, khana set"></div>
      <button class="btn" type="submit">Search menu</button>
    </div>
  </form>`;
}

function bindSearchCard() {
  const form = $("#search-form");
  if (!form) return;
  let active = form.querySelector('[aria-selected="true"]').dataset.tab;
  form.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    active = t.dataset.tab;
    form.querySelectorAll(".tab").forEach((x) => x.setAttribute("aria-selected", x === t));
    form.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== active));
  }));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (active === "stay") {
      const ci = $("#s-in").value, co = $("#s-out").value;
      if (!ci || !co || nights(ci, co) < 1) { toast("Check-out must be after check-in."); return; }
      Object.assign(search, { checkin: ci, checkout: co, guests: +$("#s-guests").value });
      const type = $("#s-type").value;
      location.hash = type ? `#/room/${type}` : "#/stay";
    } else if (active === "adventures") {
      const q = new URLSearchParams({ q: $("#s-adv").value.trim(), level: $("#s-level").value, max: $("#s-budget").value });
      location.hash = "#/adventures?" + q;
    } else {
      location.hash = "#/dining?" + new URLSearchParams({ q: $("#s-food").value.trim() });
    }
  });
}

function roomCard(r) {
  const left = unitsLeft(r, search.checkin, search.checkout);
  const avail = left === 0 ? `<span class="chip warn">Sold out for your dates</span>` : left <= 2 ? `<span class="chip warn">Only ${left} left</span>` : `<span class="chip ok">Available</span>`;
  return `
  <article class="card">
    <a href="#/room/${r.id}"><img class="card-img" src="${r.img}" alt="${esc(r.name)}" loading="lazy"></a>
    <div class="card-body">
      <h3><a href="#/room/${r.id}" style="text-decoration:none">${esc(r.name)}</a></h3>
      <div class="meta">${r.beds} · up to ${r.guests} ${r.guests > 1 ? "guests" : "guest"} · ${r.size} m²</div>
      ${avail}
      <div class="card-foot"><div class="price">${rs(r.price)} <small>/ night</small></div><a class="btn small" href="#/room/${r.id}">View</a></div>
    </div>
  </article>`;
}

function advCard(a) {
  const dur = a.days ? `${a.days} days` : `${a.hours} hours`;
  return `
  <article class="card">
    <img class="card-img" src="${a.img}" alt="${esc(a.name)}" loading="lazy">
    <div class="card-body">
      <h3>${esc(a.name)}</h3>
      <div class="meta">${esc(a.place)} · ${dur} · ${a.level}</div>
      <div class="card-foot"><div class="price">${rs(a.price)} <small>/ person</small></div><button class="btn small" data-book-adv="${a.id}">Book</button></div>
    </div>
  </article>`;
}

function pkgCard(p) {
  return `
  <article class="card pkg ${p.popular ? "popular" : ""}">
    ${p.popular ? '<span class="ribbon">Most chosen</span>' : ""}
    <img class="card-img" src="${p.img}" alt="${esc(p.name)} package room" loading="lazy">
    <div class="card-body">
      <h3>${esc(p.name)}</h3>
      <div class="meta">${p.nights} nights for two people</div>
      <ul>${p.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <div class="card-foot"><div class="price">${rs(p.price)} <small>total</small></div><button class="btn small" data-book-pkg="${p.id}">Book</button></div>
    </div>
  </article>`;
}

/* rooms listing with filters */
function stay() {
  return `
  <div class="wrap page-head">
    <h1>Rooms</h1>
    <p>${fmtDate(search.checkin)} to ${fmtDate(search.checkout)} · ${nights(search.checkin, search.checkout)} nights · ${search.guests} ${search.guests > 1 ? "guests" : "guest"}. <a class="link" href="#/" >Change dates</a></p>
  </div>
  <div class="wrap listing">
    <form class="filters" id="filters" aria-label="Filter rooms">
      <h2>Filter</h2>
      <fieldset><legend>Price per night</legend>
        <label class="check"><input type="radio" name="price" value="0" checked> Any</label>
        <label class="check"><input type="radio" name="price" value="1250"> Up to NPR 1,250</label>
        <label class="check"><input type="radio" name="price" value="1500"> Up to NPR 1,500</label>
      </fieldset>
      <fieldset><legend>Amenities</legend>
        ${["Air conditioning", "Private balcony", "Bathtub", "Lake view", "Smart TV"].map((a) => `<label class="check"><input type="checkbox" name="am" value="${a}"> ${a}</label>`).join("")}
      </fieldset>
      <label class="check"><input type="checkbox" name="avail" checked> Only show available rooms</label>
    </form>
    <div>
      <div class="results-bar"><div id="count" class="meta"></div>
        <label class="meta">Sort by <select id="sort"><option value="price">Price: low to high</option><option value="-price">Price: high to low</option><option value="size">Size</option></select></label>
      </div>
      <div class="grid" id="room-results"></div>
    </div>
  </div>`;
}
function bindStay() {
  const run = () => {
    const f = $("#filters");
    const max = +f.price.value;
    const ams = [...f.querySelectorAll('[name="am"]:checked')].map((x) => x.value);
    const onlyAvail = f.avail.checked;
    const sort = $("#sort").value;
    let list = ROOMS.filter((r) => r.guests >= search.guests && (!max || r.price <= max) && ams.every((a) => r.amenities.includes(a)));
    if (onlyAvail) list = list.filter((r) => unitsLeft(r, search.checkin, search.checkout) > 0);
    list.sort((a, b) => sort === "price" ? a.price - b.price : sort === "-price" ? b.price - a.price : b.size - a.size);
    $("#count").textContent = `${list.length} ${list.length === 1 ? "room" : "rooms"} for ${search.guests} ${search.guests > 1 ? "guests" : "guest"}`;
    $("#room-results").innerHTML = list.length ? list.map(roomCard).join("") :
      `<div class="empty" style="grid-column:1/-1">No room matches these filters. Try fewer amenities or fewer guests.</div>`;
  };
  $("#filters").addEventListener("change", run);
  $("#sort").addEventListener("change", run);
  run();
}

/* room detail */
function room(id) {
  const r = ROOMS.find((x) => x.id === id);
  if (!r) return notFound();
  return `
  <div class="wrap crumbs"><a href="#/">Home</a> / <a href="#/stay">Rooms</a> / ${esc(r.name)}</div>
  <div class="wrap detail">
    <div>
      <img class="detail-img" src="${r.img}" alt="${esc(r.name)}">
      <h1>${esc(r.name)}</h1>
      <p>${esc(r.text)}</p>
      <div class="facts">
        <div class="fact"><b>${r.guests}</b><span>guests</span></div>
        <div class="fact"><b>${r.size} m²</b><span>room size</span></div>
        <div class="fact"><b>${r.beds}</b><span>beds</span></div>
      </div>
      <h3 style="font-size:20px;margin-bottom:8px">In the room</h3>
      ${amenityChips(r.amenities)}
      <h3 style="font-size:20px;margin:24px 0 8px">Good to know</h3>
      <p class="meta">Check-in from 1 pm, check-out by 11 am. Free cancellation up to 48 hours before arrival. Children under 6 stay free.</p>
    </div>
    <div class="book-box">
      <div class="price">${rs(r.price)} <small>/ night</small></div>
      <div class="two">
        <div class="field"><label for="d-in">Check-in</label><input id="d-in" type="date" value="${search.checkin}" min="${iso(today())}"></div>
        <div class="field"><label for="d-out">Check-out</label><input id="d-out" type="date" value="${search.checkout}"></div>
      </div>
      <div class="field"><label for="d-guests">Guests</label><select id="d-guests">${Array.from({ length: r.guests }, (_, i) => i + 1).map((n) => `<option ${n == Math.min(search.guests, r.guests) ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      <div id="d-avail" class="meta"></div>
      <button class="btn" id="d-book">Reserve</button>
      <p class="meta" style="margin:0">You won't be charged: this is a demo.</p>
    </div>
  </div>`;
}
function bindRoom(id) {
  const r = ROOMS.find((x) => x.id === id);
  if (!r) return;
  const check = () => {
    const ci = $("#d-in").value, co = $("#d-out").value, n = nights(ci, co);
    const btn = $("#d-book");
    if (!ci || !co || n < 1) { $("#d-avail").textContent = "Choose a check-out date after check-in."; btn.disabled = true; return; }
    const left = unitsLeft(r, ci, co);
    $("#d-avail").innerHTML = left ? `<b>${left}</b> of ${r.units} rooms free for these dates · ${n} ${n > 1 ? "nights" : "night"}: <b>${rs(n * r.price)}</b>` : "Sold out for these dates. Try other dates.";
    btn.disabled = !left;
  };
  ["d-in", "d-out"].forEach((i) => $("#" + i).addEventListener("change", check));
  $("#d-book").addEventListener("click", () => {
    Object.assign(search, { checkin: $("#d-in").value, checkout: $("#d-out").value, guests: +$("#d-guests").value });
    openRoomSheet(r);
  });
  check();
}

/* adventures */
function adventures(params) {
  return `
  <div class="wrap page-head"><h1>Adventures</h1><p>Booked through reception, with pick-up from the hotel. Prices per person.</p></div>
  <div class="wrap listing">
    <form class="filters" id="adv-filters" aria-label="Filter adventures">
      <div class="field"><label for="a-q">Search</label><input id="a-q" value="${esc(params.get("q") || "")}" placeholder="rafting, trek, Chitwan"></div>
      <fieldset><legend>Difficulty</legend>
        ${["", "Easy", "Moderate", "Hard"].map((l) => `<label class="check"><input type="radio" name="level" value="${l}" ${l === (params.get("level") || "") ? "checked" : ""}> ${l || "Any"}</label>`).join("")}
      </fieldset>
      <fieldset><legend>Budget per person</legend>
        ${[["", "Any"], ["3000", "Up to NPR 3,000"], ["5000", "Up to NPR 5,000"]].map(([v, t]) => `<label class="check"><input type="radio" name="max" value="${v}" ${v === (params.get("max") || "") ? "checked" : ""}> ${t}</label>`).join("")}
      </fieldset>
    </form>
    <div><div class="results-bar"><div id="adv-count" class="meta"></div></div><div class="grid" id="adv-results"></div></div>
  </div>`;
}
function bindAdventures() {
  const f = $("#adv-filters");
  const run = () => {
    const q = $("#a-q").value.trim().toLowerCase(), level = f.level.value, max = +f.max.value;
    const list = ADVENTURES.filter((a) => (!q || (a.name + " " + a.place + " " + a.text).toLowerCase().includes(q)) && (!level || a.level === level) && (!max || a.price <= max));
    $("#adv-count").textContent = `${list.length} ${list.length === 1 ? "adventure" : "adventures"}`;
    $("#adv-results").innerHTML = list.length ? list.map(advCard).join("") : `<div class="empty" style="grid-column:1/-1">Nothing matches. Clear the search to see all adventures.</div>`;
  };
  f.addEventListener("input", run);
  f.addEventListener("submit", (e) => e.preventDefault());
  run();
}

/* packages */
function packages() {
  return `
  <div class="wrap page-head"><h1>Packages</h1><p>Room, meals and adventures in one booking. All prices are for two people.</p></div>
  <div class="wrap section" style="padding-top:24px"><div class="grid">${PACKAGES.map(pkgCard).join("")}</div></div>`;
}

/* dining */
function dining(params) {
  const cats = ["All", ...new Set(FOOD.map((f) => f.cat))];
  return `
  <div class="wrap page-head"><h1>Dining</h1><p>Order from our kitchen to your room or the garden. Served 7 am to 10 pm.</p></div>
  <div class="wrap">
    <div class="field" style="max-width:420px;margin-top:18px"><label for="f-q">Search the menu</label><input id="f-q" value="${esc(params.get("q") || "")}" placeholder="momo, latte, khana set"></div>
    <div class="cat-tabs" id="cats">${cats.map((c, i) => `<button type="button" aria-pressed="${i === 0}" data-cat="${c}">${c}</button>`).join("")}</div>
    <div class="dining">
      <div class="grid" id="food-results"></div>
      <aside class="order" aria-label="Your order"><h2>Your order</h2><div id="order-lines"></div></aside>
    </div>
  </div>`;
}
function bindDining() {
  let cat = "All";
  const run = () => {
    const q = $("#f-q").value.trim().toLowerCase();
    const list = FOOD.filter((f) => (cat === "All" || f.cat === cat) && (!q || (f.name + " " + f.cat + " " + f.tags.join(" ")).toLowerCase().includes(q)));
    $("#food-results").innerHTML = list.length ? list.map((f) => `
      <article class="card food-card">
        <img class="card-img" src="${f.img}" alt="${esc(f.name)}" loading="lazy">
        <div class="card-body">
          <h3 style="font-size:18px">${esc(f.name)}</h3>
          <div class="chips">${[f.cat, ...f.tags].map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
          <div class="card-foot"><div class="price">${rs(f.price)}</div><button class="btn small" data-add="${f.id}">Add</button></div>
        </div>
      </article>`).join("") : `<div class="empty" style="grid-column:1/-1">No dish matches "${esc(q)}".</div>`;
  };
  $("#cats").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-cat]");
    if (!b) return;
    cat = b.dataset.cat;
    document.querySelectorAll("#cats button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    run();
  });
  $("#f-q").addEventListener("input", run);
  $("#food-results").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    order[b.dataset.add] = (order[b.dataset.add] || 0) + 1;
    saveOrder(); renderOrder();
    toast(`${FOOD.find((f) => f.id === b.dataset.add).name} added to your order`);
  });
  $("#order-lines").addEventListener("click", (e) => {
    const b = e.target.closest("[data-qty]");
    if (b) {
      const [id, d] = b.dataset.qty.split(":");
      order[id] = Math.max(0, (order[id] || 0) + +d);
      if (!order[id]) delete order[id];
      saveOrder(); renderOrder();
    }
    if (e.target.closest("#place-order")) placeOrder();
  });
  run(); renderOrder();
}
function renderOrder() {
  const el = $("#order-lines");
  if (!el) return;
  const ids = Object.keys(order);
  if (!ids.length) { el.innerHTML = `<p class="meta">Nothing yet. Add dishes from the menu.</p>`; return; }
  const total = ids.reduce((s, id) => s + FOOD.find((f) => f.id === id).price * order[id], 0);
  el.innerHTML = ids.map((id) => {
    const f = FOOD.find((x) => x.id === id);
    return `<div class="order-line"><span>${esc(f.name)}</span><span class="qty"><button aria-label="One less ${esc(f.name)}" data-qty="${id}:-1">−</button>${order[id]}<button aria-label="One more ${esc(f.name)}" data-qty="${id}:1">+</button></span></div>`;
  }).join("") + `<div class="total"><span>Total</span><span>${rs(total)}</span></div>
    <div class="field"><label for="o-room">Deliver to</label><select id="o-room"><option>My room</option><option>Garden table</option><option>Pick up at the restaurant</option></select></div>
    <button class="btn" id="place-order" style="width:100%;margin-top:12px">Place order</button>`;
}
function placeOrder() {
  const ids = Object.keys(order);
  const total = ids.reduce((s, id) => s + FOOD.find((f) => f.id === id).price * order[id], 0);
  bookings.unshift({
    code: code(), kind: "food", itemId: "order", title: "Food order", img: FOOD.find((f) => f.id === ids[0]).img,
    detail: ids.map((id) => `${order[id]} × ${FOOD.find((f) => f.id === id).name}`).join(", ") + ` · ${$("#o-room").value}`,
    total, created: new Date().toISOString(),
  });
  order = {}; saveOrder(); saveBookings(); renderOrder();
  toast("Order placed. You can see it under My bookings.");
}

/* my bookings */
function trips() {
  return `
  <div class="wrap page-head"><h1>My bookings</h1><p>Saved in this browser only. Clearing your browser data removes them.</p></div>
  <div class="wrap section" style="padding-top:24px">
    ${bookings.length ? bookings.map((b) => `
      <article class="trip">
        <img src="${b.img}" alt="">
        <div>
          <h3 style="font-size:20px">${esc(b.title)}</h3>
          <div class="meta">${esc(b.detail)}</div>
          <div class="meta" style="margin-top:4px">Booking code <span class="code">${b.code}</span> · ${rs(b.total)}</div>
        </div>
        <button class="btn ghost small" data-cancel="${b.code}">Cancel</button>
      </article>`).join("") :
      `<div class="empty">No bookings yet. <a class="link" href="#/stay">Find a room</a>, <a class="link" href="#/adventures">an adventure</a> or <a class="link" href="#/dining">something to eat</a>.</div>`}
  </div>`;
}
function bindTrips() {
  app.addEventListener("click", tripsClick);
}
function tripsClick(e) {
  const b = e.target.closest("[data-cancel]");
  if (!b) return;
  bookings = bookings.filter((x) => x.code !== b.dataset.cancel);
  saveBookings();
  toast("Booking cancelled.");
  render();
}

function notFound() {
  return `<div class="wrap section"><div class="empty">That page doesn't exist. <a class="link" href="#/">Go to the home page</a>.</div></div>`;
}

/* ---------- booking sheet ---------- */
const code = () => "AIO-" + Math.random().toString(36).slice(2, 7).toUpperCase();
let lastFocus = null;
let refreshAfterClose = false;  // re-draw the page once a booking is confirmed (availability changed)

function openSheet(html) {
  lastFocus = document.activeElement;
  const s = $("#sheet");
  s.innerHTML = `<button class="close" type="button" data-close>Close</button>` + html;
  s.hidden = false;
  $("#sheet-backdrop").hidden = false;
  document.body.style.overflow = "hidden";
  (s.querySelector("input, select, button:not([data-close])") || s).focus();
}
function closeSheet() {
  $("#sheet").hidden = true;
  $("#sheet-backdrop").hidden = true;
  document.body.style.overflow = "";
  if (refreshAfterClose) { refreshAfterClose = false; render(); return; }
  if (lastFocus) lastFocus.focus();
}
$("#sheet-backdrop").addEventListener("click", closeSheet);
$("#sheet").addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#sheet").hidden) closeSheet(); });

function guestFields() {
  return `
    <div class="field"><label for="g-name">Full name</label><input id="g-name" required autocomplete="name"></div>
    <div class="two">
      <div class="field"><label for="g-email">Email</label><input id="g-email" type="email" required autocomplete="email"></div>
      <div class="field"><label for="g-phone">Phone</label><input id="g-phone" type="tel" autocomplete="tel"></div>
    </div>`;
}

function openRoomSheet(r) {
  const n = nights(search.checkin, search.checkout);
  openSheet(`
    <h2 id="sheet-title">${esc(r.name)}</h2>
    <div class="meta">${fmtDate(search.checkin)} to ${fmtDate(search.checkout)} · ${n} ${n > 1 ? "nights" : "night"} · ${search.guests} ${search.guests > 1 ? "guests" : "guest"}</div>
    <form id="room-form" novalidate>
      ${guestFields()}
      <fieldset style="border:0;padding:0;margin:0;display:grid;gap:6px"><legend style="font-weight:600;margin-bottom:4px">Add to your stay</legend>
        ${EXTRAS.map((x) => `<label class="check"><input type="checkbox" name="extra" value="${x.id}"> ${x.name} (${rs(x.price)} / ${x.per})</label>`).join("")}
      </fieldset>
      <div class="summary" id="room-sum"></div>
      <div class="error" id="room-err" role="alert"></div>
      <button class="btn" type="submit">Confirm booking</button>
    </form>`);
  const form = $("#room-form");
  const total = () => {
    let t = r.price * n;
    const lines = [[`${rs(r.price)} × ${n} ${n > 1 ? "nights" : "night"}`, r.price * n]];
    form.querySelectorAll('[name="extra"]:checked').forEach((c) => {
      const x = EXTRAS.find((e) => e.id === c.value);
      const cost = x.id === "breakfast" ? x.price * search.guests * n : x.price;
      lines.push([x.name, cost]); t += cost;
    });
    $("#room-sum").innerHTML = lines.map(([a, b]) => `<div><span>${a}</span><span>${rs(b)}</span></div>`).join("") + `<div class="grand"><span>Total</span><span>${rs(t)}</span></div>`;
    return t;
  };
  form.addEventListener("change", total);
  total();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#g-name").value.trim(), email = $("#g-email").value.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) { $("#room-err").textContent = "Please enter your name and a valid email."; return; }
    if (!unitsLeft(r, search.checkin, search.checkout)) { $("#room-err").textContent = "Sorry, this room was just booked out for these dates."; return; }
    const b = { code: code(), kind: "room", itemId: r.id, rooms: 1, title: r.name, img: r.img, checkin: search.checkin, checkout: search.checkout,
      detail: `${fmtDate(search.checkin)} to ${fmtDate(search.checkout)} · ${search.guests} ${search.guests > 1 ? "guests" : "guest"} · ${name}`, total: total(), created: new Date().toISOString() };
    bookings.unshift(b); saveBookings(); confirmSheet(b);
  });
}

function openSimpleSheet(item, kind) {
  const isPkg = kind === "package";
  openSheet(`
    <h2 id="sheet-title">${esc(item.name)}${isPkg ? " package" : ""}</h2>
    <div class="meta">${isPkg ? `${item.nights} nights for two` : `${esc(item.place)} · ${rs(item.price)} per person`}</div>
    <form id="simple-form" novalidate>
      <div class="two">
        <div class="field"><label for="x-date">${isPkg ? "Arrival" : "Date"}</label><input id="x-date" type="date" min="${iso(addDays(today(), 1))}" value="${iso(addDays(today(), 7))}" required></div>
        ${isPkg ? `<div class="field"><label>People</label><input value="2" disabled></div>` :
          `<div class="field"><label for="x-people">People</label><select id="x-people">${[1, 2, 3, 4, 5, 6].map((n) => `<option ${n === 2 ? "selected" : ""}>${n}</option>`).join("")}</select></div>`}
      </div>
      ${guestFields()}
      <div class="summary" id="x-sum"></div>
      <div class="error" id="x-err" role="alert"></div>
      <button class="btn" type="submit">Confirm booking</button>
    </form>`);
  const form = $("#simple-form");
  const total = () => {
    const people = isPkg ? 2 : +$("#x-people").value;
    const t = isPkg ? item.price : item.price * people;
    $("#x-sum").innerHTML = `<div><span>${isPkg ? item.name + " package" : `${rs(item.price)} × ${people}`}</span><span>${rs(t)}</span></div><div class="grand"><span>Total</span><span>${rs(t)}</span></div>`;
    return [t, people];
  };
  form.addEventListener("change", total);
  total();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#g-name").value.trim(), email = $("#g-email").value.trim(), date = $("#x-date").value;
    if (!date || !name || !/^\S+@\S+\.\S+$/.test(email)) { $("#x-err").textContent = "Please choose a date and enter your name and a valid email."; return; }
    const [t, people] = total();
    const b = { code: code(), kind, itemId: item.id, title: isPkg ? `${item.name} package` : item.name, img: item.img,
      detail: `${fmtDate(date)} · ${people} ${people > 1 ? "people" : "person"} · ${name}`, total: t, created: new Date().toISOString() };
    bookings.unshift(b); saveBookings(); confirmSheet(b);
  });
}

function confirmSheet(b) {
  refreshAfterClose = true;
  $("#sheet").innerHTML = `
    <button class="close" type="button" data-close>Close</button>
    <h2 id="sheet-title">You're booked</h2>
    <p>${esc(b.title)}<br><span class="meta">${esc(b.detail)}</span></p>
    <div class="summary"><div><span>Booking code</span><span class="code">${b.code}</span></div><div class="grand"><span>Total</span><span>${rs(b.total)}</span></div></div>
    <p class="meta">This is a demo, so no email is sent and nothing is charged.</p>
    <a class="btn" href="#/trips" data-close>See my bookings</a>`;
  $("#sheet .btn").focus();
}

// booking buttons on cards (adventures and packages appear on several pages)
app.addEventListener("click", (e) => {
  const a = e.target.closest("[data-book-adv]");
  if (a) openSimpleSheet(ADVENTURES.find((x) => x.id === a.dataset.bookAdv), "adventure");
  const p = e.target.closest("[data-book-pkg]");
  if (p) openSimpleSheet(PACKAGES.find((x) => x.id === p.dataset.bookPkg), "package");
});

/* ---------- router ---------- */
function render() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query || "");
  const [route, id] = path.split("/");
  app.removeEventListener("click", tripsClick);
  closeSheetIfOpen();
  const pages = {
    "": [home, bindSearchCard], stay: [stay, bindStay], room: [() => room(id), () => bindRoom(id)],
    adventures: [() => adventures(params), bindAdventures], dining: [() => dining(params), bindDining],
    packages: [packages, () => {}], trips: [trips, bindTrips],
  };
  const [view, bind] = pages[route] || [notFound, () => {}];
  app.innerHTML = view();
  bind();
  setActiveNav(route === "room" ? "stay" : route);
  $("#nav").classList.remove("open");
  $(".menu-btn").setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
  const titles = { stay: "Rooms", room: "Room", adventures: "Adventures", dining: "Dining", packages: "Packages", trips: "My bookings" };
  document.title = (titles[route] ? titles[route] + " · " : "") + "All in One Hotel, Pokhara";
}
function closeSheetIfOpen() { if (!$("#sheet").hidden) closeSheet(); }

$(".menu-btn").addEventListener("click", () => {
  const open = $("#nav").classList.toggle("open");
  $(".menu-btn").setAttribute("aria-expanded", open);
});
window.addEventListener("hashchange", render);
updateTripCount();
render();
