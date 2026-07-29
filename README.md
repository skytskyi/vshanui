# Вшануй

Локальна верстка головної сторінки (Про нас) за макетом у Figma.
Підготовлено під подальшу конвертацію в WordPress-тему.

## Запуск

Відкрий `index.html` у браузері або підніми локальний сервер:

```bash
cd ~/Projects/vshanui
python3 -m http.server 5173
```

Потім: http://localhost:5173

## Структура

```
index.html          # front-page (майбутній front-page.php)
css/style.css       # стилі + design tokens
js/main.js          # sticky header, mobile nav, reveal
assets/
  fonts/            # Intro Bold, Fixel Display
  logo/             # SVG логотипи
  images/           # фото з макета
  icons/
```

## Design tokens

| Token | Value |
| --- | --- |
| sand-100 | `#f7f5ed` |
| sand-200 | `#e1dcce` |
| yellow-500 | `#ffe500` |
| gray-900 | `#181818` |

## Шрифти

У проєкті лежать локальні копії **Intro Bold** і **Fixel Display**.
Переконайся, що ліцензії дозволяють використання у фінальному WP-проєкті.

## WordPress (наступний крок)

Орієнтовне мапування:

- `index.html` → `front-page.php` + `header.php` / `footer.php`
- `css/style.css` → theme stylesheet (+ `functions.php` enqueue)
- секції команди / діяльності → CPT або ACF blocks
