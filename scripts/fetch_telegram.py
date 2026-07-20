#!/usr/bin/env python3
"""
Збирає контент з трьох джерел і оновлює сайт:
1. Telegram канал (@shevchyshyn_trends)
2. Google News RSS (згадки "шевчишин андрій")
3. YouTube канал (@ShevchishinAndrey)
"""

import urllib.request
import urllib.parse
import re
import json
import os
from datetime import datetime, timezone
from html import unescape
import xml.etree.ElementTree as ET

# ── Налаштування ──────────────────────────────────────────────────────────────
TELEGRAM_CHANNEL  = "shevchyshyn_trends"
YOUTUBE_HANDLE    = "ShevchishinAndrey"
GOOGLE_NEWS_QUERY = "шевчишин андрій"
MAX_FETCH         = 8   # скільки беремо за один запит
MAX_STORED        = 100  # скільки зберігаємо на джерело (ротація)

POSTS_JS = os.path.join(os.path.dirname(__file__), "..", "posts.js")

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; site-sync-bot/1.0)"}

# ── Утиліти ───────────────────────────────────────────────────────────────────
def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8")


def strip_tags(html):
    html = re.sub(r'<br\s*/?>', ' ', html)
    html = re.sub(r'<[^>]+>', '', html)
    return unescape(html).strip()


def estimate_read_time(text):
    mins = max(1, round(len(text.split()) / 200))
    return f"{mins} хв"


MONTHS_UK = ["", "січня","лютого","березня","квітня","травня","червня",
             "липня","серпня","вересня","жовтня","листопада","грудня"]

def fmt_date_uk(dt):
    return f"{dt.day} {MONTHS_UK[dt.month]} {dt.year}"


def parse_rfc2822(s):
    """Parse RSS pubDate like 'Mon, 02 Jun 2025 10:00:00 +0000'"""
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(s).replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def parse_iso(s):
    try:
        s = re.sub(r'\.\d+', '', s).replace('Z', '+00:00')
        return datetime.fromisoformat(s)
    except Exception:
        return datetime.now(timezone.utc)


# ── 1. TELEGRAM ───────────────────────────────────────────────────────────────
def fetch_telegram():
    print(f"\n[Telegram] Fetching t.me/s/{TELEGRAM_CHANNEL} ...")
    try:
        html = fetch(f"https://t.me/s/{TELEGRAM_CHANNEL}")
    except Exception as e:
        print(f"  ERROR: {e}")
        return []

    blocks = re.findall(
        r'<div class="tgme_widget_message_wrap[^"]*".*?(?=<div class="tgme_widget_message_wrap|$)',
        html, re.DOTALL
    )

    posts = []
    for block in blocks:
        id_m = re.search(r'data-post="[^/]+/(\d+)"', block)
        if not id_m:
            continue
        msg_id = int(id_m.group(1))

        text_m = re.search(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', block, re.DOTALL)
        if not text_m:
            continue

        text = strip_tags(text_m.group(1))
        if len(text) < 20:
            continue

        date_m = re.search(r'datetime="([^"]+)"', block)
        dt = parse_iso(date_m.group(1)) if date_m else datetime.now(timezone.utc)

        lines = [l.strip() for l in text.splitlines() if l.strip()]
        title = (lines[0][:97] + "...") if len(lines[0]) > 100 else lines[0]
        excerpt = " ".join(lines[1:])[:240] if len(lines) > 1 else ""

        posts.append({
            "source": "telegram",
            "tag": "telegram",
            "tagLabel": "Telegram",
            "title": title,
            "excerpt": excerpt,
            "date": fmt_date_uk(dt),
            "dateTS": dt.timestamp(),
            "readTime": estimate_read_time(text),
            "url": f"https://t.me/{TELEGRAM_CHANNEL}/{msg_id}",
            "external": True,
            "featured": False,
        })

    posts.sort(key=lambda p: p["dateTS"], reverse=True)
    posts = posts[:MAX_FETCH]
    print(f"  Found {len(posts)} posts")
    return posts


# ── 2. GOOGLE NEWS RSS ────────────────────────────────────────────────────────
def fetch_google_news():
    print(f"\n[Google News] Fetching '{GOOGLE_NEWS_QUERY}' ...")
    q = urllib.parse.quote(GOOGLE_NEWS_QUERY)
    url = f"https://news.google.com/rss/search?q={q}&hl=uk&gl=UA&ceid=UA:uk"
    try:
        xml = fetch(url)
    except Exception as e:
        print(f"  ERROR: {e}")
        return []

    try:
        root = ET.fromstring(xml)
    except ET.ParseError as e:
        print(f"  XML parse error: {e}")
        return []

    posts = []
    for item in root.findall(".//item"):
        title_el   = item.find("title")
        link_el    = item.find("link")
        pubdate_el = item.find("pubDate")
        source_el  = item.find("source")

        if title_el is None or link_el is None:
            continue

        title = strip_tags(title_el.text or "").strip()
        url   = (link_el.text or "").strip()
        dt    = parse_rfc2822(pubdate_el.text) if pubdate_el is not None else datetime.now(timezone.utc)
        source_name = source_el.text if source_el is not None else "Новини"

        if not title or not url:
            continue

        posts.append({
            "source": "news",
            "tag": "news",
            "tagLabel": source_name,
            "title": title,
            "excerpt": f"Згадка у виданні {source_name}",
            "date": fmt_date_uk(dt),
            "dateTS": dt.timestamp(),
            "readTime": "2 хв",
            "url": url,
            "external": True,
            "featured": False,
        })

    posts.sort(key=lambda p: p["dateTS"], reverse=True)
    posts = posts[:MAX_FETCH]
    print(f"  Found {len(posts)} articles")
    return posts


# ── 3. YOUTUBE ────────────────────────────────────────────────────────────────
def get_youtube_channel_id():
    """Отримуємо channel ID з публічної сторінки YouTube-каналу"""
    url = f"https://www.youtube.com/@{YOUTUBE_HANDLE}"
    try:
        html = fetch(url)
    except Exception as e:
        print(f"  ERROR fetching channel page: {e}")
        return None

    # Шукаємо channelId в JSON-даних сторінки
    for pattern in [
        r'"channelId":"(UC[^"]{22})"',
        r'"externalId":"(UC[^"]{22})"',
        r'channel_id=(UC[^"&]{22})',
    ]:
        m = re.search(pattern, html)
        if m:
            return m.group(1)
    return None


def fetch_youtube():
    print(f"\n[YouTube] Fetching @{YOUTUBE_HANDLE} ...")

    channel_id = get_youtube_channel_id()
    if not channel_id:
        print("  Could not resolve channel ID")
        return []

    print(f"  Channel ID: {channel_id}")
    rss_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"

    try:
        xml = fetch(rss_url)
    except Exception as e:
        print(f"  ERROR fetching RSS: {e}")
        return []

    try:
        root = ET.fromstring(xml)
    except ET.ParseError as e:
        print(f"  XML parse error: {e}")
        return []

    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "media": "http://search.yahoo.com/mrss/",
        "yt": "http://www.youtube.com/xml/schemas/2015",
    }

    posts = []
    for entry in root.findall("atom:entry", ns):
        title_el     = entry.find("atom:title", ns)
        link_el      = entry.find("atom:link", ns)
        published_el = entry.find("atom:published", ns)
        thumb_el     = entry.find(".//media:thumbnail", ns)
        desc_el      = entry.find(".//media:description", ns)

        title = (title_el.text or "").strip() if title_el is not None else ""
        url   = link_el.get("href", "") if link_el is not None else ""
        dt    = parse_iso(published_el.text) if published_el is not None else datetime.now(timezone.utc)
        desc  = (desc_el.text or "")[:200].strip() if desc_el is not None else ""

        if not title or not url:
            continue

        posts.append({
            "source": "youtube",
            "tag": "youtube",
            "tagLabel": "YouTube",
            "title": title,
            "excerpt": desc,
            "date": fmt_date_uk(dt),
            "dateTS": dt.timestamp(),
            "readTime": "відео",
            "url": url,
            "external": True,
            "featured": False,
        })

    posts.sort(key=lambda p: p["dateTS"], reverse=True)
    posts = posts[:MAX_FETCH]
    print(f"  Found {len(posts)} videos")
    return posts


# ── Злиття з архівом ─────────────────────────────────────────────────────────
def load_existing():
    """Читає поточний posts.js і повертає словник {source: [posts]}"""
    empty = {"telegram": [], "news": [], "youtube": []}
    try:
        with open(POSTS_JS, encoding="utf-8") as f:
            text = f.read()
        # Розбираємо лише перший JSON-об'єкт після "const CONTENT =": решта
        # файлу (функції рендера тощо) теж містить "};", тож жадібний regex
        # захоплював зайве і json.loads падав, обнуляючи історію щодня.
        i = text.find("const CONTENT =")
        if i == -1:
            return empty
        start = text.index("{", i)
        data, _ = json.JSONDecoder().raw_decode(text, start)
        return data
    except Exception:
        return empty


def merge(new_posts, old_posts):
    """Додає нові пости до старих, дедуплікує по URL, зберігає MAX_STORED"""
    seen = set()
    merged = []
    for p in new_posts + old_posts:
        url = p.get("url", "")
        if url and url not in seen:
            seen.add(url)
            merged.append(p)
    merged.sort(key=lambda p: p.get("dateTS", 0), reverse=True)
    return merged[:MAX_STORED]


# ── Генерація posts.js ────────────────────────────────────────────────────────
def build_posts_js(telegram, news, youtube):
    updated = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    # Перший пост кожного джерела — featured
    if telegram: telegram[0]["featured"] = True
    if news:     news[0]["featured"]     = True
    if youtube:  youtube[0]["featured"]  = True

    data = {
        "telegram": telegram,
        "news": news,
        "youtube": youtube,
    }

    data_json = json.dumps(data, ensure_ascii=False, indent=2)

    return f"""// Автоматично оновлено: {updated}
// НЕ редагуй вручну — файл перезаписується GitHub Actions щодня

const CONTENT = {data_json};

// Поточний активний фільтр
let currentSource = "telegram";
const PAGE_SIZE = 8;
const shownCount = {{}};

function postCard(post, hasFeatured) {{
  return `<a href="${{post.url}}" class="post-card${{post.featured && hasFeatured ? " featured" : ""}}"
     target="_blank" rel="noopener">
    <div class="post-tag">${{post.tagLabel}}</div>
    <div class="post-title">${{post.title}}</div>
    ${{post.excerpt ? `<p class="post-excerpt">${{post.excerpt}}</p>` : ""}}
    <div class="post-meta">${{post.date}} · ${{post.readTime}}</div>
  </a>`;
}}

function renderPosts(source, reset) {{
  currentSource = source;
  if (reset !== false) shownCount[source] = PAGE_SIZE;
  const posts = CONTENT[source] || [];
  const container = document.getElementById("posts-container");
  const moreBtn = document.getElementById("load-more-btn");
  if (!container) return;

  if (posts.length === 0) {{
    container.innerHTML = `<p class="no-posts">${{typeof t === "function" ? t("posts.empty") : "Публікацій поки немає"}}</p>`;
    container.className = "posts-grid";
    if (moreBtn) moreBtn.style.display = "none";
    return;
  }}

  const count = shownCount[source] || PAGE_SIZE;
  const visible = posts.slice(0, count);
  const hasFeatured = visible.some(p => p.featured);
  container.className = "posts-grid" + (hasFeatured ? " has-featured" : "");
  container.innerHTML = visible.map(p => postCard(p, hasFeatured)).join("");

  if (moreBtn) {{
    const remaining = posts.length - count;
    if (remaining > 0) {{
      moreBtn.style.display = "flex";
      const label = typeof t === "function" ? t("posts.more") : "Більше";
      moreBtn.textContent = `${{label}} (${{remaining}})`;
    }} else {{
      moreBtn.style.display = "none";
    }}
  }}
}}

document.addEventListener("DOMContentLoaded", () => {{
  renderPosts("telegram");

  document.querySelectorAll(".tab-btn").forEach(btn => {{
    btn.addEventListener("click", () => {{
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPosts(btn.dataset.source);
    }});
  }});

  const moreBtn = document.getElementById("load-more-btn");
  if (moreBtn) {{
    moreBtn.addEventListener("click", () => {{
      shownCount[currentSource] = (shownCount[currentSource] || PAGE_SIZE) + PAGE_SIZE;
      renderPosts(currentSource, false);
    }});
  }}
}});
"""


def main():
    new_tg   = fetch_telegram()
    new_news = fetch_google_news()
    new_yt   = fetch_youtube()

    total_new = len(new_tg) + len(new_news) + len(new_yt)
    if total_new == 0:
        print("\nNo new content — keeping existing posts.js")
        return

    existing = load_existing()

    telegram = merge(new_tg,   existing.get("telegram", []))
    news     = merge(new_news, existing.get("news",     []))
    youtube  = merge(new_yt,   existing.get("youtube",  []))

    js = build_posts_js(telegram, news, youtube)
    with open(POSTS_JS, "w", encoding="utf-8") as f:
        f.write(js)

    print(f"\n✓ posts.js updated: {len(telegram)} TG + {len(news)} news + {len(youtube)} YT (max {MAX_STORED} each)")


if __name__ == "__main__":
    main()
