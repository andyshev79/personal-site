// ─── POSTS DATABASE ───────────────────────────────────────────────
// Чтобы добавить новый пост — добавь объект в начало массива POSTS.
// tag: "analytics" | "trading" | "personal" | "tools" | "markets"

const POSTS = [
  {
    id: 1,
    tag: "analytics",
    tagLabel: "Аналитика",
    title: "EUR/USD: три сигнала разворота, которые я вижу прямо сейчас",
    excerpt: "Разбираю текущую ситуацию на валютном рынке — почему жду коррекцию и на какие уровни смотрю в ближайшие две недели.",
    date: "28 мая 2026",
    readTime: "5 мин",
    featured: true,
    url: "posts/eurusd-reversal.html"
  },
  {
    id: 2,
    tag: "trading",
    tagLabel: "Трейдинг",
    title: "Мой риск-менеджмент: как я защищаю депозит в волатильный период",
    excerpt: "Практические правила, которым следую независимо от рыночной ситуации.",
    date: "20 мая 2026",
    readTime: "3 мин",
    featured: false,
    url: "posts/risk-management.html"
  },
  {
    id: 3,
    tag: "personal",
    tagLabel: "Личное",
    title: "5 книг, которые изменили мой взгляд на инвестиции",
    excerpt: "Список с коротким объяснением, что именно я взял из каждой книги.",
    date: "15 мая 2026",
    readTime: "4 мин",
    featured: false,
    url: "posts/5-books.html"
  },
  {
    id: 4,
    tag: "tools",
    tagLabel: "Инструменты",
    title: "MT5 агенты: как автоматизировать рутину трейдера",
    excerpt: "Рассказываю о том, как использую AI-агентов для автоматизации части аналитики.",
    date: "10 мая 2026",
    readTime: "6 мин",
    featured: false,
    url: "posts/mt5-agents.html"
  },
  {
    id: 5,
    tag: "markets",
    tagLabel: "Рынки",
    title: "Золото в 2026: держу позицию или фиксирую прибыль?",
    excerpt: "Мои мысли по золоту — фундаментальная картина и техника.",
    date: "5 мая 2026",
    readTime: "4 мин",
    featured: false,
    url: "posts/gold-2026.html"
  }
];

// ─── TAG MAP ───────────────────────────────────────────────────────
const TAG_MAP = {
  all: "all",
  analytics: "analytics",
  trading: "trading",
  personal: "personal"
};

// ─── RENDER ───────────────────────────────────────────────────────
function renderPosts(filterTag = "all") {
  const container = document.getElementById("posts-container");
  if (!container) return;

  const filtered = filterTag === "all"
    ? POSTS
    : POSTS.filter(p => p.tag === filterTag);

  const hasFeatured = filterTag === "all" && filtered.some(p => p.featured);
  container.className = "posts-grid" + (hasFeatured ? " has-featured" : "");

  container.innerHTML = filtered.map(post => `
    <a href="${post.url}" class="post-card${post.featured && hasFeatured ? " featured" : ""}">
      <div class="post-tag">${post.tagLabel}</div>
      <div class="post-title">${post.title}</div>
      ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ""}
      <div class="post-meta">${post.date} · ${post.readTime}</div>
    </a>
  `).join("");
}

// Init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  renderPosts("all");

  document.querySelectorAll(".tag-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tag-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPosts(btn.dataset.tag);
    });
  });
});
