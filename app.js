// neo tester — app logic.
// CLOUD mode if config.js has Supabase keys; otherwise LOCAL (localStorage).

const cfg = window.NEO_CONFIG ?? {};
const hasCloud = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

const els = {
  form: document.getElementById("form"),
  input: document.getElementById("input"),
  list: document.getElementById("list"),
  empty: document.getElementById("empty"),
  mode: document.getElementById("mode"),
  status: document.getElementById("status"),
};

const LOCAL_KEY = "neo-tester:messages";

// --- storage backends -------------------------------------------------------
let store;

if (hasCloud) {
  const { createClient } = await import(
    "https://esm.sh/@supabase/supabase-js@2"
  );
  const sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  store = {
    async list() {
      const { data, error } = await sb
        .from("messages")
        .select("body, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    async add(body) {
      const { error } = await sb.from("messages").insert({ body });
      if (error) throw error;
    },
  };
} else {
  store = {
    async list() {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
    },
    async add(body) {
      const rows = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
      rows.unshift({ body, created_at: new Date().toISOString() });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(rows.slice(0, 100)));
    },
  };
}

// --- view -------------------------------------------------------------------
els.mode.textContent = hasCloud ? "cloud" : "local";
els.mode.title = hasCloud
  ? "Backed by Supabase"
  : "Saved in your browser — add Supabase keys in config.js for cloud sync";

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function render(rows) {
  els.list.innerHTML = "";
  els.empty.style.display = rows.length ? "none" : "block";
  for (const row of rows) {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = row.body;
    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = fmt(row.created_at);
    li.append(text, meta);
    els.list.append(li);
  }
}

async function refresh() {
  try {
    render(await store.list());
  } catch (err) {
    els.status.textContent = "load failed: " + err.message;
  }
}

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = els.input.value.trim();
  if (!body) return;
  els.input.value = "";
  els.status.textContent = "saving…";
  try {
    await store.add(body);
    els.status.textContent = hasCloud ? "saved to supabase" : "saved locally";
    await refresh();
  } catch (err) {
    els.status.textContent = "save failed: " + err.message;
  }
});

refresh();
