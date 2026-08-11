
[86 lines collapsed]

Assume **~2.5 hrs/session**. Start **Tue Aug 11**; target usable MVP by **Sun Aug 16** (~15 hrs total).

### Day 1 — Foundation (Tue) · ~2.5h — START HERE
- Migrate schema + update seed (demo user profile fields, priorities, richer deposits)
- Prisma client singleton
- App shell: Sidebar + content inset; wire nav to routes; slim top bar (theme + avatar)
- Path helpers + metadata title “Dreamfund”
**Outcome:** DB matches wireframe fields; every page sits inside a working sidebar shell; routes navigate correctly. Pages stay empty placeholders.
1. **Schema update** ([`prisma/schema.prisma`](prisma/schema.prisma))
   - `User`: add `name String?`, `currency String @default("INR")`, `avatarUrl String?`, `notifyGoalAchieved Boolean @default(true)`, `notifyMonthlySummary Boolean @default(true)`, `notifyDepositReminder Boolean @default(false)`
   - `Goal`: add `description String?`, `priority GoalPriority @default(MEDIUM)`
   - Add enum `GoalPriority { HIGH MEDIUM LOW }`
   - Expand `GoalCategory` to: `TRAVEL`, `EMERGENCY`, `GADGET`, `VEHICLE`, `EDUCATION`, `HOME`, `WEDDING`, `INVESTMENT`, `OTHER` (map old `CAR`→`VEHICLE`, `HOUSE`→`HOME`, `CUSTOM`→`OTHER`; drop unused old values)
   - Keep `Transaction` unchanged
2. **Migrate + regenerate client**
   - Run Prisma migrate (or `db push` if no migrations history yet)
   - Confirm generated client under `lib/generated/prisma`
3. **Seed refresh** ([`prisma/seed.ts`](prisma/seed.ts))
   - Demo user: name, currency INR, notification defaults
   - 3 goals with description, priority, new categories; varied `currentAmount`
   - A few extra deposits so Analytics/Detail aren’t empty later
4. **Prisma singleton + demo user** — `lib/db.ts`, `lib/demo-user.ts`
   - `prisma` client with `@prisma/adapter-pg`
   - `getDemoUser()` upserts/fetches `demo@dreamfund.app`
5. **Path helpers** ([`path.ts`](path.ts))
   - `homePath`, `goalsPath`, `goalPath(id)`, `analyticsPath`, `settingsPath`
6. **App shell**
   - `components/app-sidebar.tsx`: Dreamfund brand + nav items (Dashboard, Goals, Analytics, Settings) with active state
   - `components/app-header.tsx`: slim top bar — theme switcher + avatar (replace/retire current header role)
   - Wrap root layout with `SidebarProvider` + sidebar + inset; keep `ThemeProvider` / `TooltipProvider`
   - Page content area: `pt`/padding so content clears the top bar
7. **Metadata** — title/description → “Dreamfund”
8. **Sanity check** — `npm run dev`; click all 4 nav links; confirm empty pages render inside shell
**Done when:** Schema seeded, sidebar navigates to all 4 sections, header shows theme + avatar.
---
### Day 2 — Shared UI + Dashboard (Wed) · ~2.5h
- `GoalCard`, `OverviewStats`, money/progress helpers
- Dashboard (`app/page.tsx`): Your Goals row + Overview
- Empty states; “+ Add Goal” wires to Create Goal dialog (form can land Day 3 if time is tight)
**Outcome:** Dashboard matches wireframe “Your Goals” + “Overview” using real DB data.
1. **Helpers** — `lib/money.ts`, `lib/goal-math.ts`
   - `formatMoney(amount, currency)`
   - `goalProgressPercent`, `amountNeeded`, `suggestedMonthlySavings`, `avgMonthlySavings` from transactions
2. **Queries** — `lib/queries/goals.ts` (or inline server fetches)
   - List goals for demo user; aggregate overview stats
3. **Components**
   - `components/goals/goal-card.tsx` — name, description snippet, progress bar, %; links to detail
   - `components/overview-stats.tsx` — Total Saved, Total Goals, Amount Needed, Avg. Monthly Savings
4. **Dashboard** ([`app/page.tsx`](app/page.tsx))
   - “Your Goals” header + “+ Add Goal” button (dialog stub/disabled or opens empty shell until Day 3)
   - Horizontal/grid of `GoalCard`s
   - Overview section with `OverviewStats`
   - Empty state when no goals
5. **Sanity check** — seeded goals + stats render; cards link to `/goals/[id]` (detail still empty)
---
### Day 3 — Goals list + Create dialog (Thu) · ~2.5h
- `/goals`: search, sort (deadline / progress / priority), category filter, grid of cards
- Shared `CreateGoalDialog`: name, description, target/starting amount, priority, deadline, category chips, live monthly-savings preview, create server action
- Mount dialog from Dashboard and Goals “+ Add Goal”
**Outcome:** Full Goals page + working Create Goal modal from Dashboard and Goals.
1. **Server action** — `app/actions/goals.ts` → `createGoal`
   - Validate fields; create goal; if starting amount &gt; 0, create initial `DEPOSIT` and set `currentAmount`
2. **`CreateGoalDialog`** — `components/goals/create-goal-dialog.tsx`
   - Fields: name, description, target, starting amount, priority select, deadline picker, category chips
   - Live “suggested monthly savings” preview under the form
   - Submit → action → close → `router.refresh()`
3. **Goals page** ([`app/goals/page.tsx`](app/goals/page.tsx))
   - Search input; sort (deadline / progress / priority); category filter
   - Card grid; “+ Add Goal” opens dialog
4. **Wire Dashboard** “+ Add Goal” to same dialog
5. **Install dialog** shadcn component if missing
6. **Sanity check** — create a goal; it appears on Dashboard + Goals
---
### Day 4 — Goal detail + Deposit (Fri) · ~2.5h
- `/goals/[goalId]`: progress, deadline/category, suggested monthly card, contributions table
- Edit via same `CreateGoalDialog` (edit mode) + Delete with confirm
- Add Deposit dialog (goal select when needed, amount, date default today, note)
**Outcome:** Goal deep-dive + deposit logging end-to-end.
1. **Server actions** — `updateGoal`, `deleteGoal`, `createDeposit` (deposit updates `currentAmount` in same transaction)
2. **Goal detail** ([`app/goals/[goalId]/page.tsx`](app/goals/[goalId]/page.tsx))
   - Name, description, deadline, category
   - Large progress + Saved / Remaining / Target
   - Suggested monthly savings card
   - Recent contributions table
   - Actions: Add Deposit, Edit, Delete (confirm)
3. **Edit** — open `CreateGoalDialog` in edit mode (prefilled; no “starting amount” on edit, or treat as N/A)
4. **`AddDepositDialog`**
   - Goal dropdown (preselect current), amount, date (default today), optional note
5. **Sanity check** — deposit increases progress; history row appears; delete removes goal
---
### Day 5 — Analytics (Sat) · ~2.5h
- Reuse OverviewStats
- Goal Completion donut + Goal by Priority pie
- Recent Transactions table (date, note, goal, category, amount)
**Outcome:** Analytics page with stats, two charts, transactions table.
1. Add `recharts` dependency
2. Chart data helpers from goals/transactions
3. **Analytics page** ([`app/analytics/page.tsx`](app/analytics/page.tsx))
   - Reuse `OverviewStats`
   - Goal Completion donut (Completed / In Progress / Not Started)
   - Goal by Priority pie (High / Medium / Low)
   - Recent Transactions table: Date, Description/note, Goal, Category, Amount
4. **Sanity check** — charts reflect seed + any Day 3–4 data
---
### Day 6 — Settings + polish (Sun) · ~2–3h
- Settings form: profile, currency, notification toggles, Export CSV, Clear all data
- Mobile sidebar (sheet), loading/empty states, seed realism check
- Smoke pass all 7 wireframe flows
**Outcome:** Settings usable; app feels complete on mobile; full smoke pass.
1. **Server actions** — `updateSettings`, `exportGoalsCsv`, `clearAllData`
2. **Settings page** ([`app/settings/page.tsx`](app/settings/page.tsx))
   - Profile: name, email (read-only), avatar placeholder
   - Currency select
   - Notification toggles
   - Export CSV + Clear all data (confirm)
   - Save Settings
3. **Polish**
   - Mobile sidebar collapse/sheet behavior
   - Empty/loading states on all pages
   - Seed pass for demo screenshots
4. **Smoke checklist** — all 7 wireframe flows: nav, dashboard, create goal modal, goals list, deposit, detail edit/delete, analytics, settings export/clear
5. Retire unused [`data.ts`](data.ts) if still present
---
## Out of scope (keeps the 6-day finish)

[17 lines collapsed]
