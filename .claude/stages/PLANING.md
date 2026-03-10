# Huisly — Planning Document

> Status: Planning phase. Scaffold only exists (Next.js 16 + Tailwind 4 + Biome).
> Date started: 2026-03-10
> AI gateway: OpenRouter (key = AI_API_KEY). Use `@ai-sdk/openai` with baseURL `https://openrouter.ai/api/v1`. No `@anthropic-ai/sdk` needed.

---

## What We're Building

Conversational AI housing agent for expats in the Netherlands.
Single chat interface — no navigation, no forms. Everything via conversation.
AI finds homes, drafts applications, sends emails on behalf of users.

---

## Current State of the Repo

- Next.js 16.1.6 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + postcss
- Biome (formatter/linter, replaces ESLint/Prettier)
- pnpm workspace
- Only `src/app/page.tsx` exists — default Next.js homepage
- NO Supabase, NO AI SDK, NO shadcn yet
- AI key: OpenRouter `AI_API_KEY` already in `.env`

---

## MVP Basics — The Absolute Minimum to Have a Working App

> Goal: a real chat window that talks to Claude via OpenRouter. No auth, no DB, no payments yet.
> This is the "does the thing work" milestone.

### Step 1 — Install deps
```bash
pnpm add ai @ai-sdk/openai
pnpm add @supabase/supabase-js
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input scroll-area avatar
```

### Step 2 — Environment
Add to `.env.local` (create if missing, `.env` already has AI_API_KEY):
```
AI_API_KEY=sk-or-v1-...       # already exists
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
AI provider setup in code:
```ts
import { createOpenAI } from '@ai-sdk/openai'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.AI_API_KEY,
})

// Chat model
export const chatModel = openrouter('anthropic/claude-haiku-3-5')
// Email drafting model (used only when drafting application emails)
export const emailModel = openrouter('anthropic/claude-sonnet-4-6')
```

### Step 3 — API route: `src/app/api/chat/route.ts`
- Accept `{ messages }` POST body
- Inject system prompt (basic version: just the housing agent persona)
- Stream back response using Vercel AI SDK `streamText`
- Return `result.toDataStreamResponse()`

### Step 4 — Chat page: `src/app/chat/page.tsx`
- `'use client'`
- Use `useChat({ api: '/api/chat' })` from `ai/react`
- Render message list + input bar
- No auth for now — anyone can access

### Step 5 — Components (minimal)
- `src/components/chat/ChatWindow.tsx` — scrollable message list
- `src/components/chat/MessageBubble.tsx` — user (right, orange) / AI (left, blue)
- `src/components/chat/InputBar.tsx` — textarea + send button

### Step 6 — Landing page: `src/app/page.tsx`
- Replace default Next.js page
- Simple hero: tagline + "Start chatting" → `/chat`
- Brand colors: `#1A3A5C` bg, `#F97316` CTA, `#FAFAF9` text bg

---

## Build Phases (full roadmap, after basics work)

### Phase 1 — Core Chat UI
- [ ] `src/app/chat/page.tsx` — protected route (auth required)
- [ ] `src/app/page.tsx` — landing page (SEO, public)
- [ ] `components/chat/ChatWindow.tsx` — main chat container
- [ ] `components/chat/MessageBubble.tsx` — user + AI bubbles
- [ ] `components/chat/InputBar.tsx` — text input + send
- [ ] `app/api/chat/route.ts` — Claude streaming endpoint (Haiku 3.5)
- [ ] Wire up Vercel AI SDK `useChat` hook

### Phase 2 — AI Brain
- [ ] `lib/claude.ts` — system prompt builder with user context injection
- [ ] Intent routing: SEARCH, UPDATE_PREFS, POST_LISTING, DRAFT_EMAIL, UPLOAD_DOC, SHOW_UPGRADE, CHITCHAT
- [ ] Structured JSON response format from Claude
- [ ] Preference extraction → silent upsert to DB
- [ ] Stream parser for `<action>` blocks → render React components mid-stream

### Phase 3 — Generative UI Components
- [ ] `components/ui/ListingCard.tsx`
- [ ] `components/ui/ListingGrid.tsx`
- [ ] `components/ui/ActionButtons.tsx`
- [ ] `components/ui/EmailPreview.tsx`
- [ ] `components/ui/DocumentUpload.tsx`
- [ ] `components/ui/UpgradePrompt.tsx`
- [ ] `components/ui/ConfirmSend.tsx`
- [ ] `components/ui/FacebookLink.tsx` (no email, link only)
- [ ] `components/ui/TrialBanner.tsx`

### Phase 4 — Data Pipeline
- [ ] `workers/apify.ts` — Apify actor runner (Pararius, Funda, FB Groups)
- [ ] `workers/parser.ts` — Ollama/Llama 3 FB post parser
- [ ] `workers/dedup.ts` — deduplication (same price + address within 24h)
- [ ] `workers/matcher.ts` — user preference matching + push trigger
- [ ] `workers/cron.ts` — 30-min orchestrator
- [ ] Deploy workers to Railway

### Phase 5 — Email Layer _(deferred — not needed for MVP)_
- [ ] SendGrid/Postmark setup
- [ ] Unique thread addresses: `applications+{userId}+{listingId}@huisly.nl`
- [ ] `app/api/webhook/postmark/route.ts` — inbound reply handler
- [ ] Reply classification via local LLM
- [ ] `lib/email.ts` — send helpers

### Phase 6 — Document Vault
- [ ] Supabase Storage bucket (encrypted)
- [ ] Upload flow wired to DocumentUpload component
- [ ] Attach relevant docs to email drafts

### Phase 7 — Notifications
- [ ] Service Worker registration
- [ ] `lib/push.ts` — Web Push helpers
- [ ] `app/api/push/route.ts`
- [ ] Supabase Realtime subscription for active users
- [ ] Deep link: `huisly.nl/chat?trigger=new_listings&ids=...`

### Phase 8 — Payments & Trial
- [ ] Stripe integration (iDEAL primary, card fallback)
- [ ] Trial gate: 7 days, no card required, `trial_used` flag
- [ ] `lib/accessControl.ts` — getUserAccess() logic
- [ ] Supabase RLS policy for `applications` table
- [ ] Blurred email draft CTA for free users
- [ ] `app/api/webhook/stripe/route.ts`

### Phase 9 — Listing SEO Pages
- [ ] `app/listing/[id]/page.tsx` — SSR listing page (SEO indexed)
- [ ] `app/api/listings/route.ts` — listings query API
- [ ] Sitemap

---

## Key Technical Constraints to Remember

1. **FB listings → NEVER offer email drafting.** Show link + poster name only. Use `<FacebookLink />`.
2. **Always confirm before sending email.** Never auto-send. Always show `<ConfirmSend />` first.
3. **Chat history trimmed to last 10 messages** per API call. Preferences always injected fresh from DB.
4. **Model split:** Haiku 3.5 for all chat (95%), Sonnet for email drafting only (5%).
5. **No Gmail OAuth.** Managed company email only (`applications@huisly.nl`).
6. **No navigation/forms.** Everything through chat. Onboarding is chat.
7. **iDEAL first** in checkout — 70%+ NL market share.

---

## DB Schema Summary

Tables: `users`, `preferences`, `listings`, `departing_listings`, `documents`, `applications`, `notifications`

Critical fields:
- `users.trial_ends_at` = trial_started_at + 7 days
- `users.subscription_status` = 'trialing' | 'active' | 'cancelled' | 'expired'
- `listings.contact_method` = 'facebook_dm' | 'email' | 'platform_form'
- `listings.source` = 'facebook' | 'pararius' | 'kamernet' | 'funda' | 'huisly'

---

## Immediate Next Steps (start here)

Follow the "MVP Basics" section above in order:
1. `pnpm add ai @ai-sdk/openai` + `pnpm dlx shadcn@latest init`
2. Create `src/lib/ai.ts` with OpenRouter provider config
3. Create `src/app/api/chat/route.ts` — streaming endpoint
4. Build `ChatWindow`, `MessageBubble`, `InputBar` components
5. Build `src/app/chat/page.tsx` wired to useChat
6. Replace `src/app/page.tsx` with branded landing page
7. Test end-to-end: type a message, get a streaming response
