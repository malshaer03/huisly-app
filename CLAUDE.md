# Huisly — Full Project Context for Claude Code

> Feed this file to Claude Code at the start of every session.
> It contains all architectural decisions, product logic, and technical choices made during planning.

---

## 1. What Is Huisly?

Huisly is a **conversational AI housing agent** for the Netherlands (expanding to Europe).
Instead of browsing listing sites manually, users chat with an AI that finds homes, drafts application emails, and sends them on the user's behalf.

**Core promise:** "Just tell us where you want to live."

**Target users:** Expats and international workers relocating to the Netherlands. English-first. Visa-aware (kennismigrant, Blue Card).

**Tagline:** *"Just tell us where you want to live."*

---

## 2. The UI Philosophy — Chat Is The App

There is **no navigation, no settings pages, no forms.** The entire app is a single chat interface. Every action happens through conversation:

- "I'm looking for a 2-bed in Utrecht under €1,400" → searches + saves preferences
- "Actually make it €1,600" → silently updates preferences table
- "I'm leaving my room in Amsterdam in April, €950" → creates departing tenant listing
- "Upload my payslip" → triggers file upload UI
- "Send my application to the first listing" → managed email send

The AI routes all intents internally. Users never touch a form.

### Onboarding Is Also Chat
```
AI:   "Hi! I'm your housing agent. Where in the Netherlands
       are you looking, and what's your budget?"
User: "Amsterdam or Utrecht, around €1,200"
AI:   "Perfect. Any preferences on size, furnished, move date?"
User: "Furnished, from April, at least 25m²"
AI:   [silently creates preferences row]
      "Great — I've got 14 matches right now. Want to see them?"
```

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | **Next.js 14+ (App Router)** | SSR for listing page SEO, Turbopack for dev speed |
| Styling | **Tailwind CSS + shadcn/ui** | Utility-first, prebuilt accessible components |
| Backend | **Next.js API Routes** | No separate Express server needed |
| Database | **Supabase (PostgreSQL)** | Auth + DB + Storage + Realtime all in one |
| AI — User chat | **Claude Haiku 3.5** | Fast, cheap, GDPR compliant |
| AI — Email drafting | **Claude Sonnet** | Higher quality, called only when drafting emails |
| AI — FB post parsing | **Llama 3 via Ollama** | Runs on local Mac Mini, zero cost |
| Scraping | **Apify** | Managed scraper platform — FB Groups + Pararius + Funda actors |
| Email sending | **SendGrid or Postmark** | Managed send + inbound reply webhooks |
| File storage | **Supabase Storage** | Encrypted document vault (AES-256) |
| Payments | **Stripe** | iDEAL (primary for NL) + credit card fallback |
| Push notifications | **Web Push API + Service Workers** | No native app needed |
| Hosting | **Vercel** | One-click Next.js deployment |
| Background workers | **Railway** | Cron jobs + matching worker |
| Local hardware | **Mac Mini M2 16GB** | Ollama LLM + cron orchestration |
| Streaming UI | **Vercel AI SDK** | `useChat` hook + streaming component rendering |

---

## 4. Database Schema

```sql
-- Users
users
  id                    UUID PRIMARY KEY
  email                 TEXT UNIQUE
  name                  TEXT
  created_at            TIMESTAMP
  -- Trial
  trial_started_at      TIMESTAMP
  trial_ends_at         TIMESTAMP        -- trial_started_at + 7 days
  trial_used            BOOLEAN DEFAULT false
  -- Subscription
  subscription_tier     TEXT             -- 'free' | 'pro' | 'plus'
  subscription_status   TEXT             -- 'trialing' | 'active' | 'cancelled' | 'expired'
  stripe_customer_id    TEXT
  subscription_ends_at  TIMESTAMP
  -- Push notifications
  push_subscription     JSONB            -- browser push token
  push_enabled          BOOLEAN DEFAULT false

-- Preferences (upserted on every relevant chat message)
preferences
  user_id               UUID FK → users.id
  budget_max            INTEGER
  location_pref         TEXT[]           -- ["Utrecht", "Amsterdam"]
  room_type             TEXT             -- 'studio' | 'apartment' | 'room'
  move_date             DATE
  min_size_m2           INTEGER
  furnished             BOOLEAN
  pets                  BOOLEAN
  visa_type             TEXT
  country               TEXT DEFAULT 'NL'
  updated_at            TIMESTAMP        -- refreshed on every chat update

-- Listings (populated by cron pipeline)
listings
  id                    UUID PRIMARY KEY
  source                TEXT             -- 'facebook' | 'pararius' | 'kamernet' | 'funda' | 'huisly'
  city                  TEXT
  price                 INTEGER
  size_m2               INTEGER
  available_from        DATE
  furnished             BOOLEAN
  description           TEXT
  images                TEXT[]
  -- Contact — varies by source
  contact_method        TEXT             -- 'facebook_dm' | 'email' | 'platform_form'
  contact_value         TEXT             -- email address OR facebook profile URL
  post_url              TEXT             -- always stored — direct link to original post
  poster_name           TEXT             -- FB poster name or agent name
  -- Meta
  source_id             TEXT             -- original ID from source platform
  scraped_at            TIMESTAMP
  is_active             BOOLEAN DEFAULT true
  country               TEXT DEFAULT 'NL'

-- Departing Tenant Listings (user-submitted)
departing_listings
  id                    UUID PRIMARY KEY
  user_id               UUID FK → users.id
  address               TEXT
  city                  TEXT
  price                 INTEGER
  available_from        DATE
  description           TEXT
  images                TEXT[]
  posted_at             TIMESTAMP
  is_active             BOOLEAN DEFAULT true

-- Document Vault
documents
  id                    UUID PRIMARY KEY
  user_id               UUID FK → users.id
  type                  TEXT             -- 'payslip' | 'contract' | 'motivation' | 'id' | 'bank_statement'
  file_url              TEXT             -- encrypted, stored in Supabase Storage
  uploaded_at           TIMESTAMP

-- Applications
applications
  id                    UUID PRIMARY KEY
  user_id               UUID FK → users.id
  listing_id            UUID FK → listings.id (nullable for departing_listings)
  email_thread_id       TEXT             -- applications+{userId}+{listingId}@huisly.nl
  status                TEXT             -- 'sent' | 'replied' | 'no_response' | 'viewing_scheduled'
  sent_at               TIMESTAMP
  replied_at            TIMESTAMP

-- Notifications log
notifications
  id                    UUID PRIMARY KEY
  user_id               UUID FK → users.id
  type                  TEXT             -- 'new_listings' | 'reply' | 'trial_ending'
  listing_ids           TEXT[]
  sent_at               TIMESTAMP
  clicked_at            TIMESTAMP
```

### Supabase RLS Policy (Pro feature gate)
```sql
CREATE POLICY "pro_access" ON applications
  FOR ALL USING (
    auth.uid() = user_id AND (
      (subscription_status = 'trialing' AND trial_ends_at > NOW())
      OR subscription_status = 'active'
    )
  );
```

---

## 5. Data Collection Pipeline

Runs every **30 minutes** via cron job on Mac Mini / Railway worker.

```
CRON JOB (every 30 mins)
    ├── Pararius Apify actor      → structured JSON → dedup check → DB
    ├── Funda Apify actor         → structured JSON → dedup check → DB
    ├── Facebook Groups Apify     → raw post text + images
    │       └── Local LLM (Llama 3 / Ollama on Mac Mini)
    │               └── Parse unstructured text → structured fields
    │               └── Dedup check → DB
    └── After insert → trigger matching worker
            └── Find users whose preferences match new listings
            └── Send Web Push notification to matched users
            └── Store notification record in DB
```

### Deduplication Logic
Same price + same address within 24h window → skip insert.

### Apify Actors Used
- `pararius-scraper` — Pararius.nl rental listings
- `funda-scraper` — Funda.nl listings
- `facebook-groups-scraper` — FB housing groups (configurable group IDs list)

### FB Group IDs to Configure
Start with: Expats Housing Amsterdam, Rotterdam Rooms for Rent, Den Haag International Housing, Utrecht Housing Expats. Add more as product grows.

---

## 6. AI Architecture

### Three Context Layers (injected per API call)
```javascript
// Every Claude API call includes:
{
  system: buildSystemPrompt(user, preferences, countryConfig),
  messages: [
    ...chatHistory.slice(-10),   // Last 10 messages only — never full history
    { role: 'user', content: currentMessage }
  ]
}

function buildSystemPrompt(user, prefs, config) {
  return `
    You are Huisly, a housing assistant operating in ${config.country}.
    
    USER PROFILE:
    Name: ${user.name}
    Budget: €${prefs.budget_max}/month
    Looking in: ${prefs.locations.join(', ')}
    Move date: ${prefs.move_date}
    Visa type: ${prefs.visa_type}
    Documents uploaded: ${prefs.docs_available.join(', ')}
    Subscription: ${user.subscription_status}
    
    LOCAL CONTEXT:
    ${config.rentalNorms}
    ${config.legalContext}
    
    YOUR BOUNDARIES:
    - Only discuss housing, rentals, relocation, and directly related topics
    - If asked about anything unrelated, redirect warmly
    - Never give legal advice beyond general rental norms
    - Before sending any email, always confirm once with the user
    - When updating preferences, confirm briefly: "Got it — updated your budget to €1,600"
    
    RESPONSE FORMAT:
    Always respond with a JSON object:
    {
      "message": "your natural language response here",
      "action": {
        "type": "UPDATE_PREFS | SEARCH | POST_LISTING | DRAFT_EMAIL | SHOW_UPGRADE | null",
        "data": {}
      },
      "ui": [
        { "type": "listing_card | buttons | email_preview | upload_prompt | upgrade_prompt", "data": {} }
      ]
    }
  `
}
```

### Intent Types
| Intent | Triggered by | DB Action |
|--------|-------------|-----------|
| `SEARCH` | Looking for housing | Query listings |
| `UPDATE_PREFS` | Budget/location/date changes | Upsert preferences |
| `POST_LISTING` | "I'm leaving my place" | Insert departing_listing |
| `DRAFT_EMAIL` | "Apply to this one" | Call Sonnet, return email_preview |
| `UPLOAD_DOC` | "Upload my payslip" | Trigger file upload UI |
| `SHOW_UPGRADE` | Hits Pro feature on free tier | Show upgrade_prompt component |
| `CHITCHAT` | General conversation | Just respond |

### Model Split
- **Claude Haiku 3.5** — all chat messages, intent classification, preference updates (95% of calls)
- **Claude Sonnet** — email drafting only (called once per application attempt, ~5% of calls)
- **Llama 3 8B (Ollama, local)** — FB post parsing in cron pipeline (zero API cost)

---

## 7. Streaming UI — Generative Components

The AI returns structured action blocks alongside text. The frontend parses these in real time and renders React components mid-stream.

### Component Library
| Component | When rendered |
|-----------|--------------|
| `<ListingCard />` | AI shows a matching listing |
| `<ActionButtons />` | AI offers user choices |
| `<EmailPreview />` | AI has drafted an application email |
| `<DocumentUpload />` | User needs to upload documents |
| `<UpgradePrompt />` | User hits a Pro feature on free tier |
| `<ConfirmSend />` | Before sending managed email — always shown |
| `<ListingGrid />` | Multiple listings (2–3) shown together |
| `<FacebookLink />` | FB listing — direct link only, no email |
| `<TrialBanner />` | Day 5–7 of trial |

### Stream Parser
```javascript
async function handleStream(stream) {
  let buffer = ''
  let inActionBlock = false
  
  for await (const chunk of stream) {
    buffer += chunk
    if (buffer.includes('<action')) inActionBlock = true
    if (inActionBlock && buffer.includes('</action>')) {
      const action = parseActionBlock(buffer)
      renderComponent(action)
      buffer = ''
      inActionBlock = false
    } else if (!inActionBlock) {
      appendToChat(chunk)
    }
  }
}
```

Use **Vercel AI SDK** (`useChat` hook + `streamUI`) for this — it handles streaming, parsing, and re-rendering natively with Next.js.

---

## 8. Contact Logic Per Listing Source

**Critical rule: never force a contact method that doesn't match the source.**

| Source | Contact Method | What AI Offers |
|--------|---------------|----------------|
| `facebook` | Facebook DM | Link to original FB post + poster name. No email. No managed send. |
| `pararius` | Email + listing link | Draft email + managed send if email available |
| `kamernet` | Email + listing link | Draft email + managed send if email available |
| `huisly` (own DB) | Email (submitted by leaver) | Full managed send + auto-attach documents |

### Facebook Listing — AI Message Example
```
🏠 Room in Amsterdam — €950/mo — 22m²
📍 Oud-Zuid · Available April 1
Posted by Sarah K. on Facebook

⚠️ Contact this person directly via Facebook DM.
[Open original post →]
```
Never offer email drafting for Facebook listings.

---

## 9. Managed Email Layer

Huisly sends emails **from its own company email** — never accessing user's personal inbox.

### Email Threading
Each application gets a unique address:
```
applications+{userId}+{listingId}@huisly.nl
```

### Flow
1. User uploads documents once → stored encrypted in Supabase Storage
2. AI drafts personalized email + selects relevant attachments
3. User reviews in `<EmailPreview />` component → clicks Send
4. Email sent from `applications@huisly.nl` via SendGrid/Postmark
5. Landlord replies → webhook fires → app parses userId + listingId → notifies user
6. Local LLM classifies reply: positive / needs more info / rejection

### Email Format
```
From: Ahmed (via Huisly) <applications+u123+l456@huisly.nl>
Subject: Application for Prinsengracht 123 — €1,200/mo

[AI-personalized body]

---
Sent via Huisly on behalf of Ahmed.
Reply directly to this email — Ahmed will be notified instantly.
```

---

## 10. Push Notifications Architecture

### When User Is Away
```javascript
// After cron job inserts new listings:
async function afterListingsInserted(newListings) {
  const matchedUsers = await findMatchingUsers(newListings)
  for (const user of matchedUsers) {
    if (user.push_enabled) {
      await sendWebPush(user.push_subscription, {
        title: `${matched.length} new matches 🏠`,
        body: `From €${minPrice} in ${city}`,
        data: {
          type: 'NEW_LISTINGS',
          listing_ids: matched.map(l => l.id)
        }
      })
    }
  }
}
```

### Deep Link — Resuming Chat
Notification click opens:
```
huisly.nl/chat?trigger=new_listings&ids=abc123,def456
```

On page load:
```javascript
const params = new URLSearchParams(window.location.search)
if (params.get('trigger') === 'new_listings') {
  const listings = await fetchListings(params.get('ids').split(','))
  injectAIMessage({
    content: `Welcome back! While you were away I found new matches:`,
    listings
  })
}
```

### When User Is Active (Supabase Realtime)
```javascript
supabase.channel('new_listings')
  .on('postgres_changes', { event: 'INSERT', table: 'listings' }, (payload) => {
    if (matchesUserPreferences(payload.new, userPrefs)) {
      injectAIMessage(`New match just came in! ${payload.new.title}`)
    }
  })
  .subscribe()
```

Active user → Realtime injection. Away user → Web Push → deep link.

---

## 11. Pricing & Trial

### Tiers
| Tier | Price | Key Features |
|------|-------|-------------|
| **Free** | €0 | AI search, view listings, basic daily alerts, 1 departing post |
| **Pro** | €12.99/mo | Email drafting, managed send (30/mo), document vault, real-time alerts, multi-city (3) |
| **Plus** | €22.99/mo | Unlimited send, priority listing, multi-country, reply analytics |
| **Boost** | €2.99 one-time | Single application send for free users |

### 7-Day Free Trial
- Full Pro access, **no credit card required**
- `trial_used` flag prevents second trials
- Conversion nudge at Day 5 (in chat), Day 6 (email), Day 7 (in chat + blurred email CTA)
- Day 8: re-engagement email with 20% discount

### Trial DB Logic
```javascript
function getUserAccess(user) {
  if (user.subscription_status === 'trialing') {
    return now() < user.trial_ends_at ? 'pro' : 'free'
  }
  if (user.subscription_status === 'active') return user.subscription_tier
  return 'free'
}
```

### Freemium Conversion Moment
Show blurred email draft to free users:
```
"✉️ Your application is ready —
 upgrade to Pro to send it instantly"
[Upgrade — €12.99/mo]
```

---

## 12. Payments

**Stripe** — single integration covers all methods.

```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1299,       // €12.99 in cents
  currency: 'eur',
  payment_method_types: [
    'ideal',          // Primary — 70%+ of NL transactions
    'card',           // Fallback for fresh expats
    'paypal',         // International fallback
  ],
})
```

iDEAL shown first and most prominently in checkout UI. Card secondary.

---

## 13. Context Management

- **No full history replay** — only last 10 messages sent per API call
- **Preferences always injected fresh** from DB — not from chat history
- **Long-term memory** — key decisions extracted and stored as preference fields
- **Session breaks** — new session greets user: "Welcome back! Still looking in Utrecht under €1,400?"
- **User-initiated reset** — AI understands "start fresh" / "new search" — resets chat, keeps profile

---

## 14. Country Config (Multi-country Expansion) => but we're gonna start with NL

```javascript
const countryConfig = {
  NL: {
    sources: ['pararius', 'kamernet', 'funda', 'facebook_nl'],
    language: ['nl', 'en'],
    currency: 'EUR',
    rentalNorms: 'Max deposit is 2 months rent. Rental contract via huurcommissie.',
    legalContext: 'Rent allowance (huurtoeslag) available for lower incomes.',
    apifyActors: ['pararius-scraper', 'funda-scraper', 'facebook-nl-housing']
  },
  DE: {
    sources: ['immobilienscout24', 'wg_gesucht', 'facebook_de'],
    language: ['de', 'en'],
    currency: 'EUR',
    rentalNorms: 'German Mietrecht applies. Schufa credit check commonly required.',
    legalContext: 'Kaltmiete vs Warmmiete distinction important.',
    apifyActors: ['immoscout-scraper', 'wg-gesucht-scraper', 'facebook-de-wohnungssuche']
  },
  IE: {
    sources: ['daft_ie', 'rent_ie', 'facebook_ie'],
    language: ['en'],
    currency: 'EUR',
    rentalNorms: 'Irish Residential Tenancies Act. HAP scheme available.',
    legalContext: 'Rent pressure zones limit annual rent increases.',
    apifyActors: ['daft-scraper', 'facebook-ie-housing']
  }
}
```

Expansion roadmap: NL (Y1) → Germany (Y2) → Ireland + UK (Y2-3) → Belgium, Denmark, Switzerland (Y3+).

---

## 15. Project Structure (Next.js App Router)

```
huisly/
├── app/
│   ├── page.tsx                    # Landing page (public, SEO)
│   ├── chat/
│   │   └── page.tsx                # Main chat interface (auth required)
│   ├── listing/
│   │   └── [id]/page.tsx           # Individual listing page (SSR, SEO indexed)
│   ├── api/
│   │   ├── chat/route.ts           # Claude streaming endpoint
│   │   ├── webhook/
│   │   │   ├── postmark/route.ts   # Inbound email reply handler
│   │   │   └── stripe/route.ts     # Payment webhook
│   │   ├── push/route.ts           # Send web push notification
│   │   └── listings/route.ts       # Listings query API
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx          # Main chat container
│   │   ├── MessageBubble.tsx       # User + AI message bubbles
│   │   └── InputBar.tsx            # Text input + attach + send
│   └── ui/                         # Streaming UI components
│       ├── ListingCard.tsx
│       ├── ActionButtons.tsx
│       ├── EmailPreview.tsx
│       ├── DocumentUpload.tsx
│       ├── UpgradePrompt.tsx
│       ├── ConfirmSend.tsx
│       ├── ListingGrid.tsx
│       ├── FacebookLink.tsx
│       └── TrialBanner.tsx
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── claude.ts                   # Claude API helpers
│   ├── email.ts                    # SendGrid/Postmark helpers
│   ├── push.ts                     # Web Push helpers
│   ├── countryConfig.ts            # Per-country data sources + norms
│   └── accessControl.ts            # Trial + subscription gate logic
├── workers/
│   ├── cron.ts                     # Main 30-min cron orchestrator
│   ├── apify.ts                    # Apify actor runner
│   ├── parser.ts                   # Ollama LLM post parser
│   ├── dedup.ts                    # Deduplication logic
│   └── matcher.ts                  # User preference matching + push trigger
└── supabase/
    └── migrations/                 # All DB schema migrations
```

---

## 16. Brand

- **Name:** Huisly (huis = Dutch for house, -ly = modern product suffix)
- **Tagline:** "Just tell us where you want to live."
- **Primary color:** `#1A3A5C` (deep Dutch blue)
- **Accent color:** `#F97316` (warm orange)
- **Background:** `#FAFAF9` (off-white)
- **Font:** Inter or Plus Jakarta Sans
- **Logo concept:** lowercase "huisly" with small roof above the "i" dot
- **Tone:** Warm, practical, like a smart friend who knows the NL housing market

---

## 17. Key Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js 14 App Router | SSR for listing SEO + built-in API routes + Vercel AI SDK native support |
| DB | Supabase | Auth + DB + Storage + Realtime in one, free tier, RLS for access control |
| AI model (chat) | Claude Haiku 3.5 | Fast, cheap, GDPR compliant, reliable JSON output |
| AI model (email) | Claude Sonnet | Quality matters when emailing landlords |
| AI model (parsing) | Llama 3 local | Zero cost, FB post parsing is low-stakes |
| Scraping | Apify | Managed platform — handles FB login, proxies, anti-ban |
| Email | SendGrid/Postmark | Inbound webhook support for reply tracking |
| Payments | Stripe | iDEAL native support — 70%+ NL market share |
| No Gmail OAuth | Managed company email | GDPR safety, user trust, simpler architecture |
| Chat-only UI | No navigation/forms | Core product promise — everything via conversation |
| Context trimming | Silent (last 10 msgs) | User never manages infrastructure |
| Trial | 7 days, no card required | Maximise user traction for startup permit evidence |
| Notifications | Web Push + Supabase Realtime | No native app needed, works in browser |
| Local hardware | Mac Mini M2 16GB | Ollama LLM + cron jobs, ~€700 one-time, break-even in 2-4 months vs API cost |

---

## 18. What NOT To Build (MVP)

- ❌ Mobile app (web-first, mobile-responsive)
- ❌ Viewing scheduler (landlords use WhatsApp anyway)
- ❌ Flatmate finder (separate product)
- ❌ Landlord portal (Phase 3, needs user traction first)
- ❌ Application tracker dashboard (privacy concerns, adds complexity)
- ❌ Gmail OAuth (GDPR risk, replaced by managed email layer)
- ❌ Automated send without user approval (always confirm first)
- ❌ Payment in MVP (free trial first, validate traction)

---

## 19. MCPs For Claude Code

```bash
claude mcp add supabase      # Read/write your actual schema
claude mcp add figma         # Design → React code
claude mcp add playwright    # Browser testing
claude mcp add context7      # Live docs for all libraries
```

Priority order: Supabase → Context7 → Figma → Playwright.

---

## 20. Startup Permit Context

This product is being built as part of a **Netherlands Startup Permit (Startupvisum)** application. The founder is currently on a Kennismigrant visa.

Key facts for any business-related content:
- Startup permit valid until June 1 2026 (extended pilot)
- Requires recognized facilitator + business plan + €14k+ savings
- After 1 year: convert to self-employment permit (requires working product + traction)
- Target: 500 users by end of Year 1 as traction evidence
- Trial-to-paid conversion rate is a key KPI to track and report