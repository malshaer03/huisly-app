# Huisly PM Progress Report

**Last updated:** 2026-03-10
**Assessed by:** Claude Sonnet 4.6 (PM agent)
**Branch:** main

---

## Executive Summary

The project is in early scaffolding stage. The chat UI shell is visually complete and well-crafted, but the product has zero backend wiring. There is no Claude API integration, no Supabase schema, no data pipeline, and no streaming UI components beyond a basic ListingCard. The core loop (chat → search → apply → send) does not function end to end. Estimated MVP completion: **~12%**.

The startup permit deadline (June 1, 2026) gives approximately 12 weeks. The 500-user traction goal is unreachable without the core loop working. Urgency is high.

---

## What Has Been Built

### Frontend Shell — Done
- `src/app/chat/page.tsx` — Chat page with layout, sidebar toggle, new chat handler. Hardcoded stub response via setTimeout (no real API call).
- `src/app/page.tsx` — Root page redirects to /chat. No public landing page exists yet.
- `src/app/layout.tsx` — Root layout with Inter font, correct metadata title and description, mobile viewport tag.
- `src/app/globals.css` — Full design token system defined via Tailwind v4 @theme and :root CSS vars. Dark theme with Huisly blue accent (#4d6bfe), correct background and text hierarchy.
- `src/components/chat/ChatWindow.tsx` — Chat message list with auto-scroll, typing indicator (bounce dots), glass top bar with sidebar toggle, match count pill, and new chat button. Floating input layout. Well-structured.
- `src/components/chat/MessageBubble.tsx` — User/assistant bubble differentiation. Handles inline listing cards via `message.listings[]`. Correct types exported.
- `src/components/chat/InputBar.tsx` — Textarea with auto-send on Enter, Plus/attach button (no-op), Mic button (no-op), send button with active/inactive states. Glass gradient background. Solid implementation.
- `src/components/chat/Sidebar.tsx` — Chat history list, new chat button, logo mark, user row with trial days remaining indicator. Mobile-overlay interaction wired.
- `src/components/ui/ListingCard.tsx` — Basic card with price, title, meta text, source badge, Apply button. Image area is a placeholder div. No real listing data shape (uses simplified props, not the DB schema).
- `src/lib/store.ts` — Zustand store managing messages, loading state, sidebar open/close, chat history, active chat, title, and match count. All hardcoded with mock data (no persistence).
- `src/lib/supabase.ts` — Supabase client initialized. Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (non-standard env var name — note: CLAUDE.md uses `SUPABASE_ANON_KEY` convention; this differs and needs alignment).

### Tooling & Config — Done
- pnpm as package manager (confirmed via pnpm-lock.yaml)
- Biome 2.2.0 for lint/format
- Husky + lint-staged pre-commit hook running `biome check --write` on ts/tsx
- Next.js 16.1.6 with React Compiler enabled
- Tailwind CSS v4
- Vercel project linked (`prj_nOpujBUtJMwLp7fvyks4N21OwWXa`)
- GitHub Actions CI/CD workflow for Vercel deploy on push to main + PR preview deploys with URL comment
- Supabase MCP configured in `.mcp.json` pointing to project `arrgngjkprzoiorypyyc`
- `.env` file present with Supabase URL and key, plus `AI_API_KEY` (appears to be an OpenRouter key based on prefix `sk-or-v1-`, not a native Anthropic key — needs verification)

### Dependencies Installed
- `@supabase/supabase-js` ^2.99.0
- `lucide-react` ^0.577.0
- `zustand` ^5.0.11
- Next.js, React 19, TypeScript

**Missing from dependencies (all still need to be added):**
- `ai` (Vercel AI SDK) — needed for streaming
- `@anthropic-ai/sdk` — needed for Claude API
- `stripe` — payments
- `web-push` — push notifications
- shadcn/ui components

---

## What Is NOT Built

### API Layer — Not Started
- `/api/chat/route.ts` — Claude streaming endpoint. This is the single most critical missing piece.
- `/api/webhook/postmark/route.ts` — Inbound email reply handler
- `/api/webhook/stripe/route.ts` — Payment webhook
- `/api/push/route.ts` — Web push sender
- `/api/listings/route.ts` — Listings query

### Supabase Schema — Not Started
- No `supabase/migrations/` directory exists
- No tables created: users, preferences, listings, departing_listings, documents, applications, notifications
- No RLS policies
- Supabase project is provisioned (URL exists) but empty

### AI Integration — Not Started
- No `src/lib/claude.ts`
- No system prompt builder (`buildSystemPrompt`)
- No intent routing logic
- No streaming parser for action blocks
- Claude API key in `.env` is `AI_API_KEY` using an OpenRouter prefix — needs to be clarified whether this is OpenRouter or native Anthropic

### Streaming UI Components — Mostly Not Started
- `ListingCard.tsx` — exists, but uses simplified props not aligned to DB schema
- `ActionButtons.tsx` — not started
- `EmailPreview.tsx` — not started
- `DocumentUpload.tsx` — not started
- `UpgradePrompt.tsx` — not started
- `ConfirmSend.tsx` — not started
- `ListingGrid.tsx` — not started
- `FacebookLink.tsx` — not started
- `TrialBanner.tsx` — not started

### Data Pipeline — Not Started
- No `workers/` directory
- No Apify integration (`workers/apify.ts`)
- No Ollama/Llama 3 FB parser (`workers/parser.ts`)
- No deduplication logic (`workers/dedup.ts`)
- No matching worker (`workers/matcher.ts`)
- No cron orchestrator (`workers/cron.ts`)

### Other Missing Pieces
- No `src/lib/email.ts` (SendGrid/Postmark helpers)
- No `src/lib/push.ts` (Web Push helpers)
- No `src/lib/countryConfig.ts`
- No `src/lib/accessControl.ts` (trial/subscription gate)
- No `/listing/[id]/page.tsx` (SSR listing pages for SEO)
- No public landing page (`app/page.tsx` just redirects to /chat — no marketing page)
- No Supabase Auth wiring (no login/signup flow)
- No `src/hooks/` content (directory exists but is empty)
- Brand uses `#4d6bfe` (blue-purple) in code vs `#1A3A5C` (deep Dutch blue) in CLAUDE.md — accent color has diverged from brand spec

---

## MVP Completion Estimate

| Area | Status | Completion |
|------|--------|-----------|
| Chat UI shell | Done | 80% |
| Design system / tokens | Done | 90% |
| Zustand store | Done | 60% (mock data only) |
| Supabase client init | Done | 20% (no schema) |
| Tooling / CI | Done | 95% |
| Claude API / streaming | Not started | 0% |
| Supabase schema + RLS | Not started | 0% |
| Streaming UI components | Partial | 10% |
| Auth (Supabase Auth) | Not started | 0% |
| Data pipeline / cron | Not started | 0% |
| Managed email layer | Not started | 0% |
| Push notifications | Not started | 0% |
| Document vault | Not started | 0% |
| Trial/subscription logic | Not started | 0% |
| Stripe payments | Not started | 0% (out of MVP scope) |
| Landing page | Not started | 0% |
| Listing SSR pages | Not started | 0% |

**Overall MVP completion: ~12%**

---

## Priority Order for Next Work

### Tier 1 — Unblocks Everything (Do This Week)
**1. Supabase schema + migrations**
All backend work is blocked until tables exist. Create migrations for: users, preferences, listings, applications, documents, notifications. Add RLS policies. This takes 1-2 days and is a hard dependency for every other backend feature.

**2. Supabase Auth wiring**
Users need to exist before any personalization works. Wire up Supabase Auth (magic link or email+password). Create the auth redirect logic. The app currently has no login gate at all — anyone can access /chat.

**3. Claude API route (`/api/chat/route.ts`)**
This is the product's engine. Without it, nothing works. Requires: streaming response, system prompt builder injecting user prefs, intent routing, JSON response format. Use Vercel AI SDK `streamText`. This is the highest-value single task remaining.

### Tier 2 — Core Loop Completion (Next 2 Weeks)
**4. Intent handling + preferences upsert**
Wire SEARCH and UPDATE_PREFS intents so the AI can query listings and silently save user preferences to Supabase.

**5. Listings table + seed data**
Until the scraping pipeline runs, seed 50-100 real NL listings manually. The product is empty without data. Seeding lets you demo and test the search→display loop.

**6. Streaming UI component rendering**
Wire the AI action block parser so ListingCard/ListingGrid render from real API responses. Update ListingCard props to match the DB schema. Build ListingGrid.

**7. EmailPreview + ConfirmSend + DRAFT_EMAIL intent**
The core monetization action. A user clicking Apply, seeing their email, and confirming send is the moment of highest value and the conversion trigger.

### Tier 3 — Trust & Growth (Week 3-4)
**8. Managed email send (SendGrid/Postmark)**
Wire `lib/email.ts`, the send flow, and the inbound webhook for reply detection.

**9. Document vault (DocumentUpload component + Supabase Storage)**
Required for users to attach payslips to applications.

**10. Trial logic + UpgradePrompt + TrialBanner**
7-day trial gate, access control, conversion nudges. Critical for the paid conversion funnel.

**11. Push notifications (Web Push + Supabase Realtime)**
Drives re-engagement and DAU. The real-time match notification is a key differentiator.

### Tier 4 — Traction Amplifiers (Week 5-6)
**12. Public landing page**
Currently `/` redirects to `/chat`. This is a missed SEO and conversion opportunity. The landing page is needed before any growth campaigns.

**13. Individual listing pages (`/listing/[id]`)**
SSR for SEO. Needed for organic traffic and to make listings shareable.

**14. Data pipeline (Apify + Ollama parser + matcher worker)**
The automated scraping that makes the product self-sustaining. Without this, listings require manual seeding indefinitely.

---

## Risks and Issues to Address

**Critical**
- `AI_API_KEY` uses OpenRouter (`sk-or-v1-` prefix) — **confirmed**. Use OpenRouter base URL and model IDs: `anthropic/claude-haiku-3-5` for chat, `anthropic/claude-sonnet-4-5` for email drafting.
- Supabase env var is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` in code but convention is `NEXT_PUBLIC_SUPABASE_ANON_KEY`. This non-standard name must be consistent across all files.
- No auth gate on `/chat` — anyone can access the app without logging in.

**Medium**
- Brand color divergence: code uses `#4d6bfe` (blue-purple) as accent but CLAUDE.md specifies `#1A3A5C` (deep Dutch blue) with `#F97316` (warm orange) accent. This needs a deliberate decision — the current dark theme with blue accent is visually strong but departs from brand spec.
- `src/hooks/` is empty — likely intended for custom hooks like `useChat`, `useListings`, `useAuth`.
- shadcn/ui is listed in CLAUDE.md stack but not installed. The project uses raw Tailwind. Decide whether to add shadcn/ui or stay with custom components.
- Landing page missing entirely — no public face for SEO or marketing.

**Low**
- Sidebar `onNewChat` hardcodes an emoji in the welcome message string. Consistent with product tone but may need internationalization later.
- INITIAL_HISTORY in store.ts contains hardcoded mock chats. These need to be replaced with real Supabase-backed history before beta.

---

## Key Technical Decisions Observed (Deviating From CLAUDE.md)

| Topic | CLAUDE.md Spec | Actual Implementation | Notes |
|-------|---------------|----------------------|-------|
| Accent color | #F97316 (orange) | #4d6bfe (blue-purple) | Visually good; needs alignment |
| AI API | Direct Anthropic | OpenRouter (sk-or-v1- key) — confirmed | Use OpenRouter model IDs |
| Supabase env var | SUPABASE_ANON_KEY | SUPABASE_PUBLISHABLE_DEFAULT_KEY | Non-standard naming |
| shadcn/ui | Included in stack | Not installed | May be intentional for now |

---

## Startup Permit Timeline Check

- **Current date:** 2026-03-10
- **Permit deadline:** 2026-06-01 (12 weeks away)
- **500-user goal:** Requires working product + growth surface (landing page, real listings)
- **Assessment:** To show traction by June 1, the core loop must be fully functional by mid-April at the latest. That leaves 5 weeks to build the Claude API, auth, schema, listings, email, and trial logic — achievable with focused execution. The data pipeline and public landing page are the critical path items after the core loop.
