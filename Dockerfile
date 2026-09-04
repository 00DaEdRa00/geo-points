# syntax=docker/dockerfile:1

# --- Frontend: Webpack → frontend/dist/bundle.js ---
FROM node:22-bookworm-slim AS frontend

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# --- Backend: Django serves API + static bundle ---
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

# Layout must match settings.STATICFILES_DIRS:
#   BASE_DIR.parent / "frontend" / "dist"
COPY backend/pyproject.toml backend/uv.lock ./backend/

WORKDIR /app/backend
RUN uv sync --frozen --no-dev --no-install-project

COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist

RUN uv sync --frozen --no-dev \
    && uv run manage.py migrate --noinput \
    && uv run manage.py generate_points

EXPOSE 8000

CMD ["uv", "run", "manage.py", "runserver", "0.0.0.0:8000"]
