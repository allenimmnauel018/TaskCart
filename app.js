const tabs = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll("section.panel");
function activateTab(name) {
  tabs.forEach((b) => {
    const is = b.dataset.tab === name;
    b.classList.toggle("active", is);
    b.setAttribute("aria-selected", String(is));
  });
  panels.forEach((p) => p.classList.toggle("active", p.id === name));
  // focus management for accessibility
  const firstInteractive = document.querySelector(
    `#${name} input, #${name} button, #${name} a, #${name} textarea, #${name} select`
  );
  if (firstInteractive) firstInteractive.focus({ preventScroll: true });
}
tabs.forEach((b) =>
  b.addEventListener("click", () => activateTab(b.dataset.tab))
);
document.querySelectorAll("[data-tab-jump]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    activateTab(a.dataset.tabJump);
  });
});

const heroTitle = document.querySelector(".hero .title");
const heroSubtitle = document.querySelector(".hero .subtitle");
const heroChips = document.querySelector(".hero .chips");

const heroData = {
  portfolio: {
    title: "Professional Portfolio",
    subtitle:
      "Explore a collection of polished, responsive web projects built with semantic HTML, modern CSS, and framework-free JavaScript — highlighting accessibility, performance, and elegant user experience.",
    chips: ["Responsive", "Semantic HTML", "Modern CSS", "Accessible JS"],
  },
  todo: {
    title: "To‑Do & Notes Manager",
    subtitle:
      "Organize your tasks and notes effortlessly with a fully interactive manager. Set priorities, due dates, categories, and search dynamically, while keeping all data persistent locally in your browser.",
    chips: [
      "LocalStorage",
      "Priority Tags",
      "Search & Filter",
      "Task Management",
    ],
  },
  products: {
    title: "Interactive Product Catalog",
    subtitle:
      "Browse, filter, and sort products seamlessly in a modern, dynamic grid. Features include category filters, price sliders, ratings, and featured highlights — all implemented in pure JavaScript.",
    chips: ["Filter & Sort", "Price Slider", "Ratings", "Featured Items"],
  },
};

function updateHero(tab) {
  const data = heroData[tab];
  if (!data) return;
  heroTitle.textContent = data.title;
  heroSubtitle.textContent = data.subtitle;

  heroChips.innerHTML = "";
  data.chips.forEach((c) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = c;
    heroChips.appendChild(span);
  });
}

// Call inside tab activation
function activateTab(name) {
  tabs.forEach((b) => {
    const is = b.dataset.tab === name;
    b.classList.toggle("active", is);
    b.setAttribute("aria-selected", String(is));
  });
  panels.forEach((p) => p.classList.toggle("active", p.id === name));

  // focus management for accessibility
  const firstInteractive = document.querySelector(
    `#${name} input, #${name} button, #${name} a, #${name} textarea, #${name} select`
  );
  if (firstInteractive) firstInteractive.focus({ preventScroll: true });

  updateHero(name); // <-- Update hero content
}

// Initialize
updateHero("portfolio");

/* ================= CONTACT FORM (demo only) ================= */
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm).entries());
  contactStatus.textContent = `Thanks, ${data.name}! Your message is saved locally for this demo.`;
  localStorage.setItem("contactDraft", JSON.stringify(data));
});

/* ================= TO‑DO / NOTES (localStorage) ================= */
const $ = (sel) => document.querySelector(sel);
const listEl = $("#todoList");
const emptyEl = $("#todoEmpty");
const form = $("#todoForm");
const saveBtn = $("#saveTaskBtn");
const editingId = $("#editingId");
const searchEl = $("#todoSearch");
const statusEl = $("#filterStatus");

const LS_KEY = "apx_tasks_v1";
let tasks = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  render();
}

function taskBadge(prio) {
  const map = { 1: "High", 2: "Medium", 3: "Low" };
  const cls = `prio-${prio} badge`;
  return `<span class="${cls}" title="Priority">${map[prio] ?? "—"}</span>`;
}
function fmtDate(d) {
  if (!d) return "—";
  const x = new Date(d + "T00:00:00");
  return x.toLocaleDateString();
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const filter = statusEl.value;
  const list = tasks
    .filter((t) =>
      q
        ? t.title.toLowerCase().includes(q) ||
          (t.cat || "").toLowerCase().includes(q)
        : true
    )
    .filter((t) =>
      filter === "open" ? !t.done : filter === "done" ? t.done : true
    )
    .sort(
      (a, b) =>
        Number(a.done) - Number(b.done) ||
        (a.due || "").localeCompare(b.due || "")
    );
  listEl.innerHTML = "";
  if (list.length === 0) {
    emptyEl.hidden = false;
  } else {
    emptyEl.hidden = true;
    list.forEach((t) => {
      const div = document.createElement("div");
      div.className = "todo" + (t.done ? " done" : "");
      div.setAttribute("role", "listitem");
      div.innerHTML = `
        <input type="checkbox" ${
          t.done ? "checked" : ""
        } aria-label="Mark complete" />
        <div>
          <h3 class="title">${t.title}</h3>
          <div class="meta">
            Due: <b>${fmtDate(t.due)}</b> • ${taskBadge(
        t.prio
      )} • <span class="badge">${t.cat || "General"}</span>
          </div>
        </div>
        <div class="todo-actions">
          <button class="icon-btn" title="Edit">✏️</button>
          <button class="icon-btn" title="Delete">🗑️</button>
        </div>`;
      const [chk, , actions] = div.children;
      const [editBtn, delBtn] = actions.querySelectorAll("button");
      chk.addEventListener("change", () => {
        t.done = chk.checked;
        save();
      });
      editBtn.addEventListener("click", () => {
        $("#todoTitle").value = t.title;
        $("#todoDue").value = t.due || "";
        $("#todoPrio").value = t.prio;
        $("#todoCat").value = t.cat || "";
        editingId.value = t.id;
        saveBtn.textContent = "Update Task";
        window.scrollTo({
          top: form.getBoundingClientRect().top + window.scrollY - 80,
          behavior: "smooth",
        });
      });
      delBtn.addEventListener("click", () => {
        if (confirm("Delete this task?")) {
          tasks = tasks.filter((x) => x.id !== t.id);
          save();
        }
      });
      listEl.appendChild(div);
    });
  }
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#todoTitle").value.trim();
  if (!title) return;
  const task = {
    id: editingId.value || uid(),
    title,
    due: $("#todoDue").value || null,
    prio: Number($("#todoPrio").value || 2),
    cat: $("#todoCat").value.trim(),
    done: false,
  };
  const idx = tasks.findIndex((t) => t.id === task.id);
  if (idx > -1) {
    tasks[idx] = { ...tasks[idx], ...task };
  } else {
    tasks.unshift(task);
  }
  // reset form
  form.reset();
  editingId.value = "";
  saveBtn.textContent = "Add Task";
  save();
});
$("#clearAllBtn").addEventListener("click", () => {
  if (confirm("Clear ALL tasks?")) {
    tasks = [];
    save();
  }
});
searchEl.addEventListener("input", render);
statusEl.addEventListener("change", render);
render();

/* ================= PRODUCT CATALOG ================= */
const catalog = [
  {
    id: "p1",
    title: "Aurora Wireless Headphones",
    price: 149,
    rating: 4.6,
    cat: "Audio",
    featured: true,
    img: "https://picsum.photos/id/1010/300/180",
  },
  {
    id: "p2",
    title: "Nimbus Mechanical Keyboard",
    price: 109,
    rating: 4.8,
    cat: "Peripherals",
    featured: true,
    img: "https://picsum.photos/id/1011/300/180",
  },
  {
    id: "p3",
    title: "Terra Smart Water Bottle",
    price: 59,
    rating: 4.1,
    cat: "Lifestyle",
    img: "https://picsum.photos/id/1012/300/180",
  },
  {
    id: "p4",
    title: "Volt USB‑C GaN Charger 65W",
    price: 39,
    rating: 4.7,
    cat: "Power",
    img: "https://picsum.photos/id/1013/300/180",
  },
  {
    id: "p5",
    title: "Lumen Portable Projector",
    price: 329,
    rating: 4.3,
    cat: "Entertainment",
    img: "https://picsum.photos/id/1015/300/180",
  },
  {
    id: "p6",
    title: "Zephyr Compact Fan",
    price: 29,
    rating: 4.2,
    cat: "Home",
    img: "https://picsum.photos/id/1016/300/180",
  },
  {
    id: "p7",
    title: "Glide Wireless Mouse",
    price: 35,
    rating: 4.5,
    cat: "Peripherals",
    img: "https://picsum.photos/id/1018/300/180",
  },
  {
    id: "p8",
    title: "Echo ANC Earbuds",
    price: 89,
    rating: 4.0,
    cat: "Audio",
    img: "https://picsum.photos/id/1019/300/180",
  },
  {
    id: "p9",
    title: "Peak Hiking Backpack 28L",
    price: 120,
    rating: 4.4,
    cat: "Outdoor",
    img: "https://picsum.photos/id/1020/300/180",
  },
  {
    id: "p10",
    title: "Halo LED Desk Lamp",
    price: 48,
    rating: 4.7,
    cat: "Home",
    featured: true,
    img: "https://picsum.photos/id/1021/300/180",
  },
  {
    id: "p11",
    title: "Aero Fitness Tracker",
    price: 79,
    rating: 3.9,
    cat: "Wearables",
    img: "https://picsum.photos/id/1024/300/180",
  },
  {
    id: "p12",
    title: "Quartz Coffee Grinder",
    price: 95,
    rating: 4.6,
    cat: "Kitchen",
    img: "https://picsum.photos/id/1025/300/180",
  },
];

const cards = document.getElementById("cards");
const qEl = document.getElementById("q");
const catEl = document.getElementById("cat");
const sortEl = document.getElementById("sort");
const priceEl = document.getElementById("priceMax");
const priceLabel = document.getElementById("priceLabel");
const emptyCat = document.getElementById("catalogEmpty");

function initCatalog() {
  // Populate categories
  const cats = Array.from(new Set(catalog.map((p) => p.cat))).sort();
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    catEl.appendChild(opt);
  });
  // Price slider default
  const max = Math.max(...catalog.map((p) => p.price));
  priceEl.max = Math.max(100, Math.ceil(max / 10) * 10);
  priceEl.value = priceEl.max;
  priceLabel.textContent = `₹ ${Number(priceEl.value).toLocaleString()}`;
  renderCatalog();
}
function renderCatalog() {
  const q = qEl.value.trim().toLowerCase();
  const activeCat = catEl.value;
  const maxPrice = Number(priceEl.value);

  let list = catalog
    .filter((p) => (activeCat === "all" ? true : p.cat === activeCat))
    .filter((p) => p.price <= maxPrice)
    .filter((p) => (q ? p.title.toLowerCase().includes(q) : true));

  switch (sortEl.value) {
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "priceAsc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      list.sort((a, b) => b.price - a.price);
      break;
    default:
      list.sort(
        (a, b) =>
          Number(b.featured || 0) - Number(a.featured || 0) ||
          b.rating - a.rating
      );
  }

  cards.innerHTML = "";
  if (list.length === 0) {
    emptyCat.hidden = false;
    return;
  }
  emptyCat.hidden = true;

  list.forEach((p) => {
    const el = document.createElement("article");
    el.className = "product";
    el.innerHTML = `
      <div class="cover" role="img" aria-label="${p.title} abstract cover"
          style="background-image: url('${
            p.img
          }'); background-size: cover; background-position: center;">
        ${p.featured ? '<span class="pill featured-chip">Featured</span>' : ""}
      </div>
      <div class="info">
        <div class="cat">${p.cat}</div>
        <h3 style="margin:2px 0 2px;font-size:16px">${p.title}</h3>
        <div class="inline-actions" style="justify-content:space-between">
          <span class="price">₹ ${p.price.toLocaleString()}</span>
          <span class="rating">★ ${p.rating.toFixed(1)}</span>
        </div>
        <button class="btn" style="margin-top:6px">Add to cart</button>
      </div>`;
    el.querySelector("button").addEventListener("click", () =>
      alert(`Added “${p.title}” to cart (demo)`)
    );
    cards.appendChild(el);
  });
}
[qEl, catEl, sortEl].forEach((el) =>
  el.addEventListener("input", renderCatalog)
);
priceEl.addEventListener("input", () => {
  priceLabel.textContent = `₹ ${Number(priceEl.value).toLocaleString()}`;
  renderCatalog();
});
initCatalog();

/* ================= Keyboard enhancements ================= */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "1") activateTab("portfolio");
  if (e.ctrlKey && e.key.toLowerCase() === "2") activateTab("todo");
  if (e.ctrlKey && e.key.toLowerCase() === "3") activateTab("products");
});

/* ================= Nice defaults for first‑time demo ================= */
if (tasks.length === 0) {
  tasks = [
    {
      id: uid(),
      title: "Explore product filters",
      prio: 2,
      due: null,
      cat: "Demo",
      done: false,
    },
    {
      id: uid(),
      title: "Add your first real task",
      prio: 1,
      due: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      cat: "Personal",
      done: false,
    },
    {
      id: uid(),
      title: "Mark tasks as complete",
      prio: 3,
      due: null,
      cat: "Tips",
      done: false,
    },
  ];
  save();
}
