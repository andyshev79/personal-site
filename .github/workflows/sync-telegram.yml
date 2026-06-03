#!/usr/bin/env python3
"""
Fetches latest posts from public Telegram channel and updates posts.js
Channel: https://t.me/s/shevchyshyn_trends
"""

import urllib.request
import re
import json
import os
from datetime import datetime
from html import unescape

CHANNEL = "shevchyshyn_trends"
CHANNEL_URL = f"https://t.me/s/{CHANNEL}"
POSTS_JS = os.path.join(os.path.dirname(__file__), "..", "posts.js")
MAX_POSTS = 10  # кількість постів на сайті


def fetch_html(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; site-sync-bot/1.0)"
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode("utf-8")


def parse_posts(html):
    posts = []

    # Знаходимо всі блоки повідомлень
    message_blocks = re.findall(
        r'<div class="tgme_widget_message_wrap[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</div>',
        html, re.DOTALL
    )

    for block in message_blocks:
        # ID повідомлення
        id_match = re.search(r'data-post="[^/]+/(\d+)"', block)
        if not id_match:
            continue
        msg_id = int(id_match.group(1))

        # Текст повідомлення
        text_match = re.search(
            r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>',
            block, re.DOTALL
        )
        if not text_match:
            continue

        raw_text = text_match.group(1)
        # Прибираємо HTML теги, залишаємо текст
        clean_text = re.sub(r'<br\s*/?>', ' ', raw_text)
        clean_text = re.sub(r'<[^>]+>', '', clean_text)
        clean_text = unescape(clean_text).strip()

        if len(clean_text) < 20:
            continue

        # Дата
        date_match = re.search(r'datetime="([^"]+)"', block)
        date_str = ""
        date_iso = ""
        if date_match:
            try:
                dt = datetime.fromisoformat(date_match.group(1).replace("Z", "+00:00"))
                date_str = format_date_uk(dt)
                date_iso = dt.strftime("%Y-%m-%d")
            except Exception:
                date_str = date_match.group(1)[:10]
                date_iso = date_str

        # Перший рядок = заголовок, решта = excerpt
        lines = [l.strip() for l in clean_text.split("\n") if l.strip()]
        title = lines[0][:120] if lines else clean_text[:120]
        excerpt = " ".join(lines[1:])[:240] if len(lines) > 1 else ""

        # Обрізаємо заголовок якщо занадто довгий
        if len(title) > 100:
            title = title[:97] + "..."

        posts.append({
            "id": msg_id,
            "tag": "telegram",
            "tagLabel": "Telegram",
            "title": title,
            "excerpt": excerpt,
            "date": date_str,
            "dateISO": date_iso,
            "readTime": estimate_read_time(clean_text),
            "featured": False,
            "url": f"https://t.me/{CHANNEL}/{msg_id}",
            "external": True
        })

    # Сортуємо за ID (новіші першими), беремо MAX_POSTS
    posts.sort(key=lambda p: p["id"], reverse=True)
    posts = posts[:MAX_POSTS]

    # Перший пост — featured
    if posts:
        posts[0]["featured"] = True

    return posts


def format_date_uk(dt):
    months = [
        "", "січня", "лютого", "березня", "квітня", "травня", "червня",
        "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
    ]
    return f"{dt.day} {months[dt.month]} {dt.year}"


def estimate_read_time(text):
    words = len(text.split())
    minutes = max(1, round(words / 200))
    return f"{minutes} хв"


def build_posts_js(posts):
    posts_json = json.dumps(posts, ensure_ascii=False, indent=2)
    updated = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    return f"""// Автоматично оновлено: {updated}
// Джерело: https://t.me/{CHANNEL}
// НЕ редагуй вручну — файл перезаписується GitHub Actions щодня

const POSTS = {posts_json};

function renderPosts(filterTag = "all") {{
  const container = document.getElementById("posts-container");
  if (!container) return;

  const filtered = filterTag === "all"
    ? POSTS
    : POSTS.filter(p => p.tag === filterTag);

  const hasFeatured = filterTag === "all" && filtered.some(p => p.featured);
  container.className = "posts-grid" + (hasFeatured ? " has-featured" : "");

  container.innerHTML = filtered.map(post => `
    <a href="${{post.url}}" class="post-card${{post.featured && hasFeatured ? " featured" : ""}}"${{post.external ? ' target="_blank" rel="noopener"' : ''}}>
      <div class="post-tag">${{post.tagLabel}}</div>
      <div class="post-title">${{post.title}}</div>
      ${{post.excerpt ? `<p class="post-excerpt">${{post.excerpt}}</p>` : ""}}
      <div class="post-meta">${{post.date}} · ${{post.readTime}}</div>
    </a>
  `).join("");
}}

document.addEventListener("DOMContentLoaded", () => {{
  renderPosts("all");
  document.querySelectorAll(".tag-filter").forEach(btn => {{
    btn.addEventListener("click", () => {{
      document.querySelectorAll(".tag-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPosts(btn.dataset.tag);
    }});
  }});
}});
"""


def main():
    print(f"Fetching posts from https://t.me/s/{CHANNEL} ...")
    try:
        html = fetch_html(CHANNEL_URL)
    except Exception as e:
        print(f"ERROR fetching channel: {e}")
        exit(1)

    posts = parse_posts(html)
    print(f"Found {len(posts)} posts")

    if not posts:
        print("No posts found — keeping existing posts.js")
        exit(0)

    js_content = build_posts_js(posts)

    with open(POSTS_JS, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"Updated {POSTS_JS} with {len(posts)} posts")
    for p in posts:
        print(f"  [{p['date']}] {p['title'][:60]}...")


if __name__ == "__main__":
    main()
