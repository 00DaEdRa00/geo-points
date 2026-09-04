# Geo Points

Веб-приложение: карта точек (Москвы и области) и таблица с поиском, сортировкой и пагинацией. Клик по строке или маркеру показывает карточку под картой и подсвечивает точку.

Сервер — **Django**. React собирается Webpack в `frontend/dist/bundle.js`, Django отдаёт HTML, JS и API с `http://127.0.0.1:8000/`.

Для контейнера достаточно **одного Dockerfile**: фронт — JS файл, БД — SQLite, отдельных сервисов нет.

---

## Docker

Multi-stage образ в корне репозитория: Node собирает `frontend/dist/bundle.js`, затем Python/uv ставит Django и забирает только готовый бандл.

```powershell
docker build -t geo-points .
docker run --name geo-points --rm -p 8000:8000 geo-points
```

Сайт тот же: **http://127.0.0.1:8000/**

Что происходит когда:

| Момент | Что делается |
|---|---|
| `docker build` | `npm run build`, `uv sync`, `migrate`, `generate_points` (500 точек в SQLite **внутри образа**) |
| `docker run` | только `runserver 0.0.0.0:8000` |

Первый набор точек — при сборке образа. Как создать новые — в разделе [Создать новые точки](#создать-новые-точки).

`--name geo-points` нужен, чтобы потом зайти в контейнер через `docker exec`. Если имя уже занято — сначала `docker rm -f geo-points`.

`.dockerignore` не кладёт в контекст `.git`, `node_modules`, `.venv`, локальный `db.sqlite3`.

---

## Стек

### Backend

| Технология | Использование |
|---|---|
| Django 6 | сервер, шаблоны, статика, SQLite |
| Django REST Framework | JSON для таблицы (`/api/features/`) |
| SQLite | база точек (`backend/db.sqlite3`) |

Приложение `points`: модель `PointFeature`, сериализатор, список с пагинацией, GeoJSON для карты, команда генерации.

### Frontend

| Технология | Использование |
|---|---|
| React 19 | интерфейс |
| OpenLayers (`ol`) | карта OSM, маркеры, перелёт к точке |
| TanStack Table | таблица, серверные пагинация / фильтр / сортировка |
| Bootstrap 5 | сетка, таблица, кнопки, поле поиска |


Сборка: Webpack 5, Babel

---

### Данные точки

Поля модели: `name`, `area`, `status`, `date_create`, `type`, `lon`, `lat`.

Имена генератора: `Точка №1`, `Точка №2`, Координаты случайные в диапазоне квардрата Москвы.

### Таблица

Хук `usePoints` запрашивает `/api/features/?page=&page_size=&q=&ordering=`.

- Поиск по названию (`q`), дебаунсе 300 мс.
- Сортировка на сервере. Для `name` — отдельная, для остальных — SQL.
- Пагинация по 20 строк.
- Пока идёт запрос, полупрозрачный оверлей «Загрузка» поверх таблицы.

### Карта

Один раз грузит `/api/geojson/`. Клик по маркеру или строке таблицы:

1. В `App` пишется `selectedPoint`.
2. Карта `animate` к `lon`/`lat`, выбранный маркер красный и крупнее.
3. Под картой карточка с полями точки.

Закрытие карточки сбрасывает выбор.

### Backend: список точек

`FeatureListView`: фильтр `name__icontains`, сортировка, `Paginator`. Ответ:

```json
{
  "items": [...],
  "count_total": 500,
  "count_filtered": 500,
  "page": 1,
  "pages": 25
}
```

`geojson_view` отдаёт FeatureCollection всех точек (координаты в `geometry`).

---

## Запуск

Нужны два терминала: сборка фронта и Django.

### 1. Фронт

```
npm install
npm run build
```

Билд React:

```
npm run watch
```

### 2. Бэк
используется менеджер UV

```
uv sync
uv run manage.py migrate
uv run manage.py generate_points
uv run manage.py runserver
```

Сайт: **http://127.0.0.1:8000/**

`DEBUG = False`, в `ALLOWED_HOSTS` только `127.0.0.1` и `localhost`

---


## Создать новые точки

Команда **удаляет все старые** точки и пишет случайные новые. По умолчанию 500 штук. После этого обновить страницу.

Код: `backend/points/management/commands/generate_points.py`  
Случайные поля и координаты: `backend/points/services.py`

### Локально

Нужны: зависимости (`uv sync`), миграции, папка `backend`.

```powershell
uv run manage.py generate_points
```

Другое число:

```powershell
uv run manage.py generate_points -n 200
```

### Docker

Нужен уже запущенный контейнер с именем `geo-points` (как в разделе Docker). Образ пересобирать не нужно.

```powershell
docker exec geo-points uv run manage.py generate_points
```

Другое число:

```powershell
docker exec geo-points uv run manage.py generate_points -n 200
```

Если контейнер не запущен или имя другое, `docker exec` не сработает. Смотреть имя: `docker ps`.

---

## Структура репозитория

```
geo-points/
  README.md
  Dockerfile
  .dockerignore
  backend/
    config/          settings, urls
    points/          модель, API, команда generate_points
    templates/       index.html
    manage.py
  frontend/
    src/
      main.tsx
      App.tsx
      styles.css
      hooks/usePoints.ts
      components/
        MapComponent.tsx      карта
        TableComponent.tsx    таблица
        DetailsModal.tsx      карточка под картой
    webpack.config.js
    dist/bundle.js
```

---

## API

| Метод | URL | Назначение |
|---|---|---|
| GET | `/api/features/` | таблица |
| GET | `/api/geojson/` | карта |

Параметры `/api/features/`:

| Параметр | Пример | Смысл |
|---|---|---|
| `page` | `1` | страница |
| `page_size` | `20` | строк на странице, максимум 100 |
| `q` | `Точка №1` | поиск по названию |
| `ordering` | `name`, `-area`, `date_create` | сортировка; минус — по убыванию |

Допустимые поля сортировки: `name`, `area`, `status`, `date_create`, `type`.

---
