# Huisly — Shared Context (Persistent Across Sessions)

> This file is loaded every session. Keep it accurate and concise.
> Last updated: 2026-03-10

---

## Project Identity

- **Name:** Huisly — conversational AI housing agent, Netherlands-first
- **Tagline:** "Just tell us where you want to live."
- **Users:** Expats / international workers relocating to NL. English-first.
- **Startup context:** Netherlands Startup Permit (valid until June 1 2026). Target 500 users Y1.

---

## Stack (decided, do not change without reason)

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16 App Router (src/ directory) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Linter/Formatter | **Biome** (not ESLint/Prettier) |
| Package manager | **pnpm** |
| DB + Auth + Storage | Supabase (PostgreSQL + RLS) |
| AI gateway | **OpenRouter** — key `AI_API_KEY`, base URL `https://openrouter.ai/api/v1` |
| AI SDK | `ai` + `@ai-sdk/openai` (createOpenAI with custom baseURL) — no `@anthropic-ai/sdk` |
| AI chat | Claude Haiku 3.5 → `anthropic/claude-haiku-3-5` on OpenRouter |
| AI email drafting | Claude Sonnet → `anthropic/claude-sonnet-4-6` on OpenRouter |
| AI FB parsing | Llama 3 8B via Ollama on Mac Mini |
| Streaming | Vercel AI SDK (`useChat` + `streamUI`) |
| Scraping | Apify (Pararius, Funda, FB Groups actors) |
| Email send/receive | SendGrid or Postmark |
| Payments | Stripe — iDEAL primary, card fallback |
| Push notifications | Web Push API + Service Workers |
| Hosting | Vercel (frontend) + Railway (workers/cron) |
| Local hardware | Mac Mini M2 16GB (Ollama + cron) |

---

## Hard Rules (never violate these)

1. **Facebook listings → never offer email drafting.** Use `<FacebookLink />` with link + poster name only.
2. **Always show `<ConfirmSend />` before sending any email.** Never auto-send.
3. **No Gmail OAuth / no user inbox access.** All email from `applications@huisly.nl`.
4. **No navigation or forms in the app.** Everything is chat. The UI is the chat window.
5. **Claude receives only last 10 messages** + fresh preferences from DB (never full history).
6. **iDEAL must be the primary/first payment option** in all checkout UIs.
7. **No second free trial.** `trial_used` flag is permanent.
8. **Never auto-send email** without explicit user confirmation via `<ConfirmSend />`.

---

## AI Response Format

Every Claude API call must return structured JSON:
```json
{
  "message": "natural language response",
  "action": {
    "type": "UPDATE_PREFS | SEARCH | POST_LISTING | DRAFT_EMAIL | UPLOAD_DOC | SHOW_UPGRADE | CHITCHAT | null",
    "data": {}
  },
  "ui": [
    { "type": "listing_card | buttons | email_preview | upload_prompt | upgrade_prompt | confirm_send | facebook_link | trial_banner", "data": {} }
  ]
}
```

System prompt always injects: user profile, preferences, subscription status, country config.

---

## UI Components to Build

| Component | Trigger |
|-----------|---------|
| `<ListingCard />` | AI shows a match |
| `<ListingGrid />` | 2-3 matches shown together |
| `<ActionButtons />` | AI offers choices |
| `<EmailPreview />` | Email drafted by Sonnet |
| `<DocumentUpload />` | User needs to upload docs |
| `<UpgradePrompt />` | Free user hits Pro feature |
| `<ConfirmSend />` | Before EVERY email send |
| `<FacebookLink />` | FB source listing — link only |
| `<TrialBanner />` | Days 5-7 of trial |

---

## Trial & Access Logic

```
trialing + trial_ends_at > now()  → treat as 'pro'
active                            → use subscription_tier
anything else                     → 'free'
```

Trial = 7 days, no credit card. `trial_used` flag prevents second trials.
Conversion nudge: Day 5 (in chat), Day 6 (email), Day 7 (in chat + blurred CTA).

---

## Email Threading

Each application = unique reply-to address:
```
applications+{userId}+{listingId}@huisly.nl
```
Inbound webhook on Postmark/SendGrid → parse userId + listingId → notify user.

---

## Data Pipeline (cron, every 30 mins)

1. Apify actors: Pararius + Funda → structured JSON → dedup → DB
2. Apify FB Groups actor → raw text → Llama 3 (Ollama, local) → structured → dedup → DB
3. Dedup rule: same price + same address within 24h = skip
4. After insert: matcher worker → find users whose prefs match → Web Push

---

## Brand

- Primary: `#1A3A5C` (deep Dutch blue)
- Accent: `#F97316` (warm orange)
- Background: `#FAFAF9` (off-white)
- Font: Inter or Plus Jakarta Sans
- Logo: lowercase "huisly" with small roof above the "i" dot
- Tone: warm, practical, like a smart friend who knows NL housing

---

## What NOT to Build (MVP)

- Mobile app (web-first, responsive)
- Viewing scheduler
- Flatmate finder
- Landlord portal
- Application tracker dashboard
- Gmail OAuth
- Automated send without approval
- Payment integration in MVP (free trial first)

---

## File Structure (target)

```
src/
├── app/
│   ├── page.tsx                   # Landing (public, SEO)
│   ├── chat/page.tsx              # Chat interface (auth required)
│   ├── listing/[id]/page.tsx      # SSR listing page (SEO)
│   └── api/
│       ├── chat/route.ts          # Claude streaming
│       ├── webhook/postmark/      # Inbound email replies
│       ├── webhook/stripe/        # Payment events
│       ├── push/route.ts          # Web Push
│       └── listings/route.ts     # Listings query
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── InputBar.tsx
│   └── ui/                        # Generative UI components (listed above)
├── lib/
│   ├── supabase.ts
│   ├── claude.ts                  # System prompt builder
│   ├── email.ts
│   ├── push.ts
│   ├── countryConfig.ts
│   └── accessControl.ts
└── workers/
    ├── cron.ts
    ├── apify.ts
    ├── parser.ts
    ├── dedup.ts
    └── matcher.ts
```

---

## MCPs to Use

Priority order: `supabase` → `context7` → `figma` → `playwright`
