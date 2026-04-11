# Miru — Full Project Context for Claude Code

> Feed this file to Claude Code at the start of every session.
> It contains all architectural decisions, product logic, and technical choices made during planning.

## Commit Message Rule

**Every commit MUST follow Conventional Commits.** Full spec: [`COMMIT_CONVENTION.md`](./COMMIT_CONVENTION.md).

### Format
```
<type>[optional scope]: <description>

[optional body — explain WHY, not what]
```

### Types
| Type | Use when |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that's neither a fix nor a feature |
| `chore` | Maintenance, deps, config |
| `docs` | Documentation only |
| `style` | Formatting/whitespace — no logic change |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |
| `build` | Build system / tooling |
| `revert` | Reverts a previous commit |

### Rules
- Description is **lowercase**, no period at the end
- Scope is optional — use it to narrow the area: `feat(chat):`, `fix(auth):`
- Breaking changes: add `!` before colon — `feat!:` — or use a `BREAKING CHANGE:` footer
- **One commit = one logical change.** Split schema + UI into separate commits. Prefer many small commits over one large one.

### Scopes used in this project
`chat` · `auth` · `db` · `api` · `ui` · `sync` · `accounts` · `payments` · `deps` · `config`

### Examples
```
feat(chat): add get_net_worth tool to financial assistant
fix(auth): redirect to /dashboard when session expires
chore(deps): upgrade drizzle-orm to 0.45.1
refactor(db): extract query helpers into lib/db
feat(sync): add truelayer oauth callback handler
feat!: replace huisly schema with miru financial tables
```

---

## 1. What Is Miru?

Miru is a **unified personal finance dashboard** for EU users with crypto portfolios, powered by AI chat.

**Core promise:** *"See all your money in one place. Ask anything."*

**Target users:** EU expats and tech-savvy professionals (25–45) who hold money across multiple banks, wallets, and CEX accounts and want a single source of truth for their net worth.

**The problem:** Users juggle ING/Revolut for banking, MetaMask/Ledger for crypto, Binance/Kraken for trading — no single view of their real net worth.

---

## 2. Core Features (MVP)

| Feature | Status |
|---------|--------|
| Bank sync (TrueLayer PSD2) | Planned |
| Crypto wallet sync (Zerion) | Planned |
| CEX view (Binance) | Planned |
| Unified net worth dashboard | Planned |
| Transaction history (searchable, categorised) | Planned |
| AI chat (floating FAB — Claude) | In Progress |
| Pay-cycle budgeting | Planned |
| Subscription auto-detection | Planned |

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | **Next.js 14+ (App Router)** | SSR, Turbopack |
| Styling | **Tailwind CSS** (custom components — no shadcn/ui installed) | Utility-first |
| Backend | **Next.js API Routes** | No separate server |
| Database | **Supabase (PostgreSQL)** | Auth + DB + RLS |
| ORM | **Drizzle ORM** | Schema in `src/db/schema.ts` |
| AI | **Claude Haiku 3.5 via OpenRouter** | Tool calling for financial queries |
| AI SDK | **Vercel AI SDK** (`useChat`, `streamText`) | Streaming + tool use |
| Hosting | **Vercel** | Auto-deploy on push to main |
| Payments | **Stripe** (Phase 2) | iDEAL primary for EU |

---

## 4. Key Env Vars

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — Supabase anon key (non-standard name)
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side only, used in API routes
- `AI_API_KEY` — OpenRouter key (`sk-or-v1-` prefix)
- `DATABASE_URL` — Postgres connection string for Drizzle

AI calls use **OpenRouter** (not direct Anthropic API). Use OpenRouter model IDs:
- Chat: `anthropic/claude-haiku-3-5`
- Higher quality: `anthropic/claude-sonnet-4-5`

---

## 5. Database Schema

Managed via Drizzle ORM — schema at `src/db/schema.ts`. Supabase project ref: `arrgngjkprzoiorypyyc`.

```
users                  — id, email, name, salary_date, currency_preference
connected_accounts     — id, user_id, provider, account_type, provider_account_id,
                         access_token_encrypted, refresh_token_encrypted, api_secret_encrypted,
                         sync_status, metadata
transactions           — id, user_id, account_id, amount, currency, transaction_type,
                         merchant_name, category, transaction_date, is_recurring, raw_data
subscriptions          — id, user_id, account_id, merchant_name, amount, frequency,
                         next_expected_date, status, confidence_score
net_worth_snapshots    — id, user_id, total_eur, breakdown_json, snapshot_at
sync_logs              — id, user_id, account_id, provider, action, status, records_synced
```

RLS enabled on all tables — users see only their own data.

---

## 6. AI Architecture

### Floating Chat Widget
AI chat is a **floating FAB overlay** on the dashboard, not a full-page experience.

- `ChatWidget.tsx` — FAB button + overlay shell, manages open/close state
- `ChatWindow.tsx` — Inner chat UI (messages + input), rendered inside the overlay
- Requires auth — unauthenticated FAB click opens LoginModal

### Tool Calling Pattern
The AI receives user queries and calls tools to fetch real data. All tools live in `src/app/api/chat/route.ts`.

```typescript
// Tools available to the AI:
get_transactions({ category, merchant_name, date_from, date_to, transaction_type })
get_net_worth()
get_budget_status()
get_subscriptions()
```

**Rule:** The AI never invents numbers. If a tool returns no data, it says so and suggests connecting an account.

### System Prompt
```
You are Miru, a personal finance AI assistant.
You have access to the user's financial data: bank accounts, crypto wallets, CEX holdings, transactions, and subscriptions.
Answer questions about their money clearly and concisely. Use plain text only (no markdown).
When you need data, call the appropriate tool. Never invent numbers — only report what the tools return.
If data is unavailable, say so honestly and suggest connecting an account.
```

### Streaming
Uses Vercel AI SDK `streamText` + `toUIMessageStreamResponse()` on the server, `useChat` + `DefaultChatTransport` on the client. `stepCountIs(5)` allows up to 5 tool call rounds per message.

---

## 7. Project Structure

```
src/
├── app/
│   ├── page.tsx                         # Redirects → /dashboard
│   ├── layout.tsx                       # Root layout (Geist font, dark mode)
│   ├── dashboard/
│   │   ├── layout.tsx                   # Dashboard layout — includes ChatWidget + LoginModal
│   │   ├── page.tsx                     # Main dashboard (net worth, summary)
│   │   ├── transactions/page.tsx        # Transaction history
│   │   ├── subscriptions/page.tsx       # Subscription list
│   │   └── accounts/page.tsx            # Connected accounts management
│   └── api/
│       └── chat/route.ts                # AI streaming endpoint (POST) — financial tools
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx               # OAuth + magic link modal
│   │   └── LoginModalController.tsx     # Store-driven modal wrapper (client)
│   ├── chat/
│   │   ├── ChatWidget.tsx               # FAB + overlay shell
│   │   ├── ChatWindow.tsx               # Inner chat UI (messages + input)
│   │   ├── MessageBubble.tsx            # User + AI message bubbles
│   │   ├── MessageRenderer.tsx          # Renders AI text (paragraph split)
│   │   ├── InputBar.tsx                 # Textarea + send + attach buttons
│   │   └── Sidebar.tsx                  # (legacy — not used in dashboard)
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       └── dialog.tsx
├── db/
│   ├── index.ts                         # Drizzle client (postgres-js)
│   └── schema.ts                        # All table definitions + type exports
├── lib/
│   ├── supabase.ts                      # Supabase browser client
│   ├── db.ts                            # Supabase server client (getSupabase())
│   ├── store.ts                         # Zustand store (auth, chat open/close, login modal)
│   ├── parseMessage.ts                  # Message text parser
│   └── utils.ts                        # cn() utility
└── hooks/
    └── useAuth.ts                       # Supabase auth listener → Zustand store
```

---

## 8. State Management

Zustand store (`src/lib/store.ts`):
- `user` / `setUser` — Supabase auth user
- `loginModalOpen` / `setLoginModalOpen` — drives LoginModalController
- `chatOpen` / `toggleChat` / `setChatOpen` — drives ChatWidget overlay

Auth is initialised in `useAuth` hook, called from `ChatWidget` (which is always mounted in dashboard layout).

---

## 9. API Integrations (Planned)

| Provider | Purpose | Auth method |
|----------|---------|-------------|
| TrueLayer | EU bank sync (PSD2) | OAuth — redirect flow |
| Zerion | Crypto wallet + DeFi + NFTs | API key (user-provided, encrypted) |
| Binance | CEX balances + trades | HMAC-signed API key (read-only) |

Encrypted credentials stored in `connected_accounts.access_token_encrypted` / `api_secret_encrypted` using Supabase vault.

Sync runs every 6–12 hours via Supabase Edge Functions + pg_cron.

---

## 10. Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| ORM | Drizzle | Type-safe, schema as code, works with Supabase Postgres |
| AI SDK | Vercel AI SDK | Native Next.js streaming, tool calling, `useChat` hook |
| AI provider | OpenRouter | Single key for multiple models, easy model switching |
| Chat placement | Floating FAB overlay | Dashboard-first product; chat is secondary to data |
| No shadcn/ui | Custom Tailwind components | Already in codebase, avoids migration cost |
| Package manager | pnpm | Lockfile: `pnpm-lock.yaml` |
| Linter/formatter | Biome | Pre-commit via husky + lint-staged |

---

## 11. What NOT to Build (MVP)

- ❌ Mobile app (web-first, mobile-responsive)
- ❌ Payment initiation (read-only integrations only)
- ❌ Tax reporting
- ❌ Stock/ETF tracking (banks + crypto + CEX only)
- ❌ Trading on CEX via app
- ❌ US bank support (Plaid)
- ❌ Landlord/flatmate features (wrong product)

---

## 12. Brand

- **Name:** Miru (Japanese: "to see")
- **Tagline:** *"See all your money in one place. Ask anything."*
- **Primary accent:** `#4d6bfe` (blue-purple)
- **Background:** `#0f0f10` (near-black)
- **Font:** Geist (body) + Inter (UI)
- **Tone:** Clear, trustworthy, calm — like a smart CFO friend
