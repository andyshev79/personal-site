// Щоб додати новий пост — додай об'єкт на початок масиву POSTS.
// tag: "analytics" | "trading" | "personal" | "tools" | "markets"

const POSTS = [
  {
    id: 1,
    tag: "analytics",
    tagLabel: "Аналітика",
    title: "EUR/USD: три сигнали розвороту, які я бачу прямо зараз",
    excerpt: "Розбираю поточну ситуацію на валютному ринку — чому чекаю корекцію і на які рівні дивлюся в найближчі два тижні.",
    date: "28 травня 2026",
    readTime: "5 хв",
    featured: true,
    url: "posts/eurusd-reversal.html"
  },
  {
    id: 2,
    tag: "trading",
    tagLabel: "Трейдинг",
    title: "Мій ризик-менеджмент: як я захищаю депозит у волатильний період",
    excerpt: "Практичні правила, яких дотримуюся незалежно від ринкової ситуації.",
    date: "20 травня 2026",
    readTime: "3 хв",
    featured: false,
    url: "posts/risk-management.html"
  },
  {
    id: 3,
    tag: "personal",
    tagLabel: "Особисте",
    title: "5 книг, які змінили мій погляд на інвестиції",
    excerpt: "Список із коротким поясненням, що саме я взяв із кожної книги.",
    date: "15 травня 2026",
    readTime: "4 хв",
    featured: false,
    url: "posts/5-books.html"
  },
  {
    id: 4,
    tag: "tools",
    tagLabel: "Інструменти",
    title: "MT5 агенти: як автоматизувати рутину трейдера",
    excerpt: "Розповідаю про те, як використовую AI-агентів для автоматизації частини аналітики.",
    date: "10 травня 2026",
    readTime: "6 хв",
    featured: false,
    url: "posts/mt5-agents.html"
  },
  {
    id: 5,
    tag: "markets",
    tagLabel: "Ринки",
    title: "Золото у 2026: тримаю позицію чи фіксую прибуток?",
    excerpt: "Мої думки щодо золота — фундаментальна картина і техніка.",
    date: "5 травня 2026",
    readTime: "4 хв",
    featured: false,
    url: "posts/gold-2026.html"
  }
];

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

