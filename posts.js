// Автоматично оновлено: 2026-06-03 14:55 UTC
// Джерело: https://t.me/shevchyshyn_trends
// НЕ редагуй вручну — файл перезаписується GitHub Actions щодня

const POSTS = [
  {
    "id": 78,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "ІНФЛЯЦІЯ В ЄС ПРИСКОРИЛАСЬ. ЧОМУ ЦЕ ВПЛИНЕ НА УКРАЇНУ  Інфляція в ЄС у травні 2026 досягла максим...",
    "excerpt": "",
    "date": "2 червня 2026",
    "dateISO": "2026-06-02",
    "readTime": "1 хв",
    "featured": true,
    "url": "https://t.me/shevchyshyn_trends/78",
    "external": true
  },
  {
    "id": 77,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "Міжбанк долар 44.35  - 44.38 Новий історичний максимум",
    "excerpt": "",
    "date": "2 червня 2026",
    "dateISO": "2026-06-02",
    "readTime": "1 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/77",
    "external": true
  },
  {
    "id": 76,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "ПОКАЙТИСЯ... ТОМУ ЩО КІНЕЦЬ РАЛІ ФОНДИ ПРИЙДЕ... НАКРИЄ ВСІХ ))) ---  🚀🇺🇸 Разработчик ИИ Anthropi...",
    "excerpt": "",
    "date": "1 червня 2026",
    "dateISO": "2026-06-01",
    "readTime": "1 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/76",
    "external": true
  },
  {
    "id": 75,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "Якось Мінфін по запозиченням зовсім на розслабоні. Залучають через ОВДП грн (чорна замальована зо...",
    "excerpt": "",
    "date": "1 червня 2026",
    "dateISO": "2026-06-01",
    "readTime": "1 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/75",
    "external": true
  },
  {
    "id": 74,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "В травні 2026 українці наростили портфель ОВДП на історично рекордні 10,34 млрд грн до 148,04 млр...",
    "excerpt": "",
    "date": "1 червня 2026",
    "dateISO": "2026-06-01",
    "readTime": "1 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/74",
    "external": true
  },
  {
    "id": 73,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "Вкладення українських банків в депозитні сертифікати залишається на високому рівні.  Середньоміся...",
    "excerpt": "",
    "date": "1 червня 2026",
    "dateISO": "2026-06-01",
    "readTime": "1 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/73",
    "external": true
  },
  {
    "id": 72,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "А от ще рейтинг валют й спотових інструментів з початку війни в Ірані по кінець травня 2026. Найб...",
    "excerpt": "",
    "date": "1 червня 2026",
    "dateISO": "2026-06-01",
    "readTime": "1 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/72",
    "external": true
  },
  {
    "id": 71,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "Рейтинг світових валюти за 5 міс 2025: - Українська гривня в антирейтингу на 11 місці (-4,68%) - ...",
    "excerpt": "",
    "date": "1 червня 2026",
    "dateISO": "2026-06-01",
    "readTime": "1 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/71",
    "external": true
  },
  {
    "id": 70,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "Рейтинг світових валют у травні 2026 📈 №1рубль рф (+5,8% до долару) №2 ізраїльскій шекель (+4,62%...",
    "excerpt": "",
    "date": "1 червня 2026",
    "dateISO": "2026-06-01",
    "readTime": "1 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/70",
    "external": true
  },
  {
    "id": 67,
    "tag": "telegram",
    "tagLabel": "Telegram",
    "title": "Стосовно розрахунків по витратам України на ШІ, трохи пояснень.  1. Використання українцями ШІ на...",
    "excerpt": "",
    "date": "1 червня 2026",
    "dateISO": "2026-06-01",
    "readTime": "2 хв",
    "featured": false,
    "url": "https://t.me/shevchyshyn_trends/67",
    "external": true
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
    <a href="${post.url}" class="post-card${post.featured && hasFeatured ? " featured" : ""}"${post.external ? ' target="_blank" rel="noopener"' : ''}>
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
