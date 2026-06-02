# Персональный сайт — Андрей Шевчишин

## Структура

```
personal-site/
├── index.html        # Главная страница
├── style.css         # Все стили
├── main.js           # Анимации, navbar, бургер-меню
├── posts.js          # База постов + рендер
├── photo.jpg         # Твоё фото (добавить вручную)
└── posts/            # Папка со статьями (создать по необходимости)
```

## Как добавить фото

Положи файл `photo.jpg` в корень папки `personal-site/`.

## Как добавить пост

Открой `posts.js` и добавь объект в начало массива `POSTS`:

```js
{
  id: 6,
  tag: "analytics",       // analytics | trading | personal | tools | markets
  tagLabel: "Аналитика",
  title: "Заголовок поста",
  excerpt: "Короткое описание",
  date: "1 июня 2026",
  readTime: "4 мин",
  featured: false,
  url: "posts/my-post.html"
}
```

## Как обновить ссылки соцсетей

В `index.html` найди секцию `social-links` и замени `href="#"` на реальные URL.

## Хостинг (GitHub Pages)

1. Пуш в репозиторий `andyshev79/personal-site`
2. Settings → Pages → Source: `main` branch → `/` root
3. Сайт будет доступен на `https://andyshev79.github.io/personal-site/`
