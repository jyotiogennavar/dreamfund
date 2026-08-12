# Dreamfund Project Structure

Dreamfund uses a feature-driven layout at the **repo root** (no `src/`). Routing stays thin in `app/`; domain code lives in `features/`.

## Top-Level Layout

- `app/` — Next.js App Router pages, layouts, and shell navigation
- `features/` — Domain UI, server actions, queries, and feature helpers
- `components/` — Shared reusable UI (`ui/`, `theme/`, cross-route pieces)
- `lib/` — Technical utilities (Prisma client, demo user, `cn`)
- `utils/` — App utilities (money formatting, currency options)
- `hooks/` — Shared React hooks
- `prisma/` — Schema and seed
- `docs/` — Architecture notes
- `paths.ts` — Central route path builders
- Root config (`package.json`, `tsconfig.json`, `components.json`, `prisma.config.ts`, etc.)

## Placement Checklist

| Kind of code | Put it here |
|--------------|-------------|
| Route page, layout, loading | `app/...` |
| App shell (header, sidebar) | `app/_navigation/...` |
| Shared reusable component | `components/...` |
| Feature UI, action, query, constant | `features/<feature>/...` |
| Prisma / demo-user / `cn` | `lib/...` |
| Money / currency helpers | `utils/...` |
| Shared hook | `hooks/...` |
| Route path builders | `paths.ts` |
| Database models | `prisma/schema.prisma` |

## Features

```txt
features/
  goal/
    components/
    actions/
    queries/
    constants.ts
    goal-math.ts
  analytics/
    components/
    queries/
    analytics.ts
  settings/
    components/
    actions/
```

Transactions (deposits) stay under the **goal** feature. There is no separate auth feature yet; identity uses `lib/demo-user.ts`.

## Suggested Pattern for New Features

```txt
features/<feature-name>/
  components/
  actions/
  queries/
  constants.ts   # optional
  types.ts       # optional
```

Only create the folders a feature needs. Keep routing composition in `app/` and shared primitives in `components/ui`.
