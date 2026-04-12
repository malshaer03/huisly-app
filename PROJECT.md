# Miru — Unified Fintech Dashboard with AI

> **One-liner:** A unified personal finance dashboard for EU users with crypto portfolios, powered by AI chat  
> **Status:** MVP in development  
> **Launch Target:** Q2 2026  
> **Current Phase:** Foundation setup + API integration planning

---

## 1. Product Overview

### The Problem
EU expats and crypto holders juggle **multiple disconnected apps:**
- Banking apps (ING, Revolut, ABN AMRO) for fiat accounts
- MetaMask, Ledger Live for crypto wallets
- Binance, Kraken for CEX trading
- No single source of truth for net worth
- Manual tracking = prone to error and time-consuming

### The Solution
**Miru** gives EU users:
- ✅ Single unified net worth dashboard (fiat + crypto + DeFi)
- ✅ All transactions in one place (banks + wallets + CEX)
- ✅ AI chat that understands your full financial picture
- ✅ Automatic subscription detection + pay-cycle budgeting
- ✅ Read-only integrations (no signing transactions, no withdrawals)

### Core Promise
*"See all your money in one place. Ask anything."*

### Target User
- **Age:** 25–45
- **Location:** EU (UK, NL, DE, FR, ES, IT, etc.)
- **Profile:** Tech-savvy, multi-currency, holds crypto
- **Pain Point:** "I own €50k spread across 8 accounts and I don't know my real net worth"
- **Usage:** 2–3 times/week, 5–10 min sessions

---

## 2. Core Features (MVP)

### Must Have (Week 1–4)
| Feature | Why | Status |
|---------|-----|--------|
| **Bank sync (TrueLayer)** | Connect EU banks via PSD2 — no secrets needed | In Progress |
| **Crypto wallet sync (Zerion)** | View all wallets + DeFi + NFTs across chains | In Progress |
| **CEX account view (Binance)** | Display CEX holdings + recent trades | Planned |
| **Unified net worth** | Single dashboard number: Total EUR across all sources | Planned |
| **Transaction history** | All tx from all sources, searchable, categorized | Planned |
| **AI chat (floating FAB)** | Ask Claude anything about your finances | Planned |
| **Pay-cycle budgeting** | Budget resets on your salary date, not Jan 1 | Planned |
| **Subscription detection** | Auto-find recurring payments from transaction patterns | Planned |

### Nice to Have (Post-MVP)
- Bill reminders ("Your €45 Spotify renews in 3 days")
- Spending trends ("You spent 15% more on dining this cycle")
- Crypto price alerts
- Budget insights ("You could save €200/mo on subscriptions")

### Out of Scope (v2+)
- US bank support (Plaid integration)
- Payment initiation (sending money)
- Mobile app (iOS/Android)
- Tax reporting (for now)
- Stock/ETF tracking
- Trading on CEX via app

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 App Router, TypeScript | Reuse from Huisly — proven, fast, SSR for SEO |
| **Styling** | Tailwind CSS + shadcn/ui | Reuse from Huisly — consistent, accessible |
| **Backend** | Next.js API Routes | Reuse from Huisly — no separate server needed |
| **Database** | Supabase (PostgreSQL) | Reuse from Huisly — auth, DB, RLS, Edge Functions in one |
| **Auth** | Supabase Auth (Email + OAuth) | Reuse from Huisly — proven, secure, GDPR-ready |
| **Bank Data** | TrueLayer API (PSD2) | EU standard, AISP-licensed, handles 5000+ institutions |
| **Crypto Data** | Zerion API | Multi-chain (Ethereum, Polygon, Arbitrum, etc), DeFi positions, NFTs |
| **CEX Data** | Binance REST API | Largest CEX in EU, read-only API keys, no withdrawal risk |
| **AI Chat** | Claude Sonnet 4 (Anthropic) | Reuse from Huisly — fast, reliable, tool calling for function invocation |
| **Cron Jobs** | Supabase Edge Functions + pg_cron | Scheduled syncs every 6–12 hours, serverless |
| **Hosting** | Vercel | Reuse from Huisly — fast, auto-scaling, preview deployments |
| **Encryption** | Supabase vault (built-in) | All API keys stored encrypted at rest |

---

## 4. Database Schema

```sql
-- ============================================================
-- USERS
-- ============================================================
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  salary_date integer,                    -- day of month (e.g., 25)
  currency_preference text default 'EUR', -- user's home currency
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- CONNECTED ACCOUNTS (banks, wallets, CEX)
-- ============================================================
create table connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  
  -- Account type
  provider text not null,                 -- 'truelayer' | 'zerion' | 'binance'
  account_type text not null,             -- 'bank' | 'crypto_wallet' | 'cex'
  
  -- Provider-specific identifiers
  provider_account_id text not null,      -- Bank account ID, wallet address, etc
  account_name text,                      -- "My Checking", "MetaMask", "Binance"
  
  -- Credentials (encrypted)
  access_token_encrypted text,            -- For TrueLayer (OAuth) or Binance API key
  refresh_token_encrypted text,           -- For TrueLayer token refresh
  api_secret_encrypted text,              -- For Binance HMAC signing
  
  -- Sync metadata
  last_synced_at timestamp with time zone,
  sync_status text default 'pending',     -- 'pending' | 'syncing' | 'success' | 'error'
  sync_error_message text,
  
  -- Account metadata (varies by provider)
  metadata jsonb,                         -- {
                                          --   "bank": {"country": "NL", "institution": "ING"},
                                          --   "wallet": {"chains": ["ethereum", "polygon"]},
                                          --   "cex": {"exchange": "binance"}
                                          -- }
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, provider, provider_account_id)
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid not null references connected_accounts(id) on delete cascade,
  
  -- Transaction details
  amount numeric(15, 2) not null,         -- Always positive, use debit/credit
  currency text not null,                 -- 'EUR', 'USD', etc
  transaction_type text,                  -- 'debit' | 'credit' | 'transfer'
  
  -- Categorization
  merchant_name text,
  category text,                          -- 'food' | 'transport' | 'salary' | 'subscription' | etc
  description text,
  
  -- Timing
  transaction_date date not null,
  is_recurring boolean default false,     -- Auto-detected
  
  -- Raw data (for debugging / re-processing)
  raw_data jsonb,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- For deduplication
  unique(user_id, provider_account_id, amount, transaction_date, merchant_name)
);

create index idx_transactions_user_date on transactions(user_id, transaction_date desc);
create index idx_transactions_category on transactions(user_id, category);

-- ============================================================
-- SUBSCRIPTIONS (auto-detected recurring)
-- ============================================================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid not null references connected_accounts(id) on delete cascade,
  
  merchant_name text not null,
  amount numeric(15, 2) not null,
  currency text not null,
  frequency text not null,                -- 'monthly' | 'weekly' | 'yearly'
  
  next_expected_date date,                -- When we expect next charge
  last_confirmed_date date,               -- When we last saw this
  
  status text default 'active',           -- 'active' | 'paused' | 'cancelled'
  confidence_score numeric(3, 2),         -- 0.00–1.00, how sure AI is
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- NET WORTH SNAPSHOTS (historical tracking)
-- ============================================================
create table net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  
  total_eur numeric(15, 2) not null,      -- Grand total in EUR
  
  breakdown_json jsonb not null,          -- {
                                          --   "banks": 5000.00,
                                          --   "crypto": 3500.00,
                                          --   "cex": 1200.00,
                                          --   "by_currency": {
                                          --     "EUR": 8000,
                                          --     "USDC": 700
                                          --   }
                                          -- }
  
  snapshot_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create index idx_net_worth_user_date on net_worth_snapshots(user_id, snapshot_at desc);

-- ============================================================
-- SYNC LOG (audit trail for integrations)
-- ============================================================
create table sync_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid references connected_accounts(id) on delete set null,
  
  provider text not null,
  action text not null,                   -- 'sync_started' | 'sync_completed' | 'sync_failed'
  status text,
  error_message text,
  
  records_synced integer,
  duration_ms integer,                    -- How long the sync took
  
  created_at timestamp with time zone default now()
);

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table connected_accounts enable row level security;
alter table transactions enable row level security;
alter table subscriptions enable row level security;
alter table net_worth_snapshots enable row level security;
alter table sync_logs enable row level security;

-- Users can only see their own data
create policy "Users can view own data" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

-- Transactions: users see only their own
create policy "Users can view own transactions" on transactions
  for select using (user_id = auth.uid());

-- Same for other tables...
create policy "Users can view own accounts" on connected_accounts
  for select using (user_id = auth.uid());

create policy "Users can view own subscriptions" on subscriptions
  for select using (user_id = auth.uid());

create policy "Users can view own snapshots" on net_worth_snapshots
  for select using (user_id = auth.uid());

create policy "Users can view own sync logs" on sync_logs
  for select using (user_id = auth.uid());

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
create index idx_connected_accounts_user on connected_accounts(user_id);
create index idx_sync_logs_user_date on sync_logs(user_id, created_at desc);
```

---

## 5. Architecture Decisions

### Decision 1: Store Transactions (Don't Fetch On-Demand)
**Choice:** Pull transactions from APIs every 6–12 hours, store in Supabase.

**Why:**
- Speed: AI chat queries stored data instantly (sub-100ms)
- Resilience: Works if APIs are down
- Compliance: Full audit trail of what user saw
- Cost: Fewer API calls (scheduled batch vs. per-request)

**Trade-off:** Data is slightly stale (max 12h), acceptable for personal finance.

### Decision 2: Encryption at Rest for API Keys
**Choice:** Supabase vault (built-in encryption) + column-level encryption.

**Why:**
- Keys never exist in plaintext in database
- Keys decrypted only in-memory for sync job
- GDPR-compliant, reduces breach impact
- Easier than external key management (HSM, AWS KMS) for MVP

### Decision 3: TrueLayer for Bank Data (Not Enable Banking Yet)
**Choice:** TrueLayer OAuth flow for bank account access via PSD2.

**Why:**
- Largest EU coverage (5000+ institutions)
- AISP-licensed — we hold no banking license
- OAuth flow = no storing credentials
- Automatic token refresh
- Mature API

**Constraint:** New signups temporarily paused (Feb 2025); alternatives: Enable Banking, Tink.

### Decision 4: Zerion for Crypto (Not Direct Chain Queries)
**Choice:** Query Zerion API for wallet balances + DeFi + NFTs.

**Why:**
- Multi-chain aggregation (Ethereum, Polygon, Arbitrum, Optimism, Base, etc.)
- Handles DeFi positions (Aave, Curve, Uniswap)
- Includes NFT metadata
- No need to run own blockchain nodes
- Simpler than querying Infura + Alchemy + Etherscan separately

### Decision 5: AI Chat with Function Calling
**Choice:** Claude Sonnet receives user query + transaction context, uses function calling to query database.

**Why:**
- Claude can reason over structured data
- Function calling = safe, controlled queries (no free-form SQL)
- Easy to add new queries (e.g., "spending by category")
- Works well with tool use (defined in system prompt)

### Decision 6: Pay-Cycle Logic (Not Calendar Months)
**Choice:** User sets `salary_date` (e.g., 25th), app calculates current cycle dynamically.

**Why:**
- Aligns budget with paychecks (when money actually arrives)
- More intuitive for salaried employees
- Handles month-end edge cases automatically
- Users don't need to reset manually

**Logic:**
```
current_cycle_start = last(salary_date <= today)
current_cycle_end = next(salary_date) - 1 day
```

---

## 6. Key API Integrations

### 6.1 TrueLayer (Bank Data via PSD2)

**Auth Flow:**
1. User clicks "Connect Bank"
2. Redirect to TrueLayer consent screen
3. User authenticates with their bank
4. TrueLayer redirects back with `code`
5. Exchange `code` for `access_token` + `refresh_token`
6. Store encrypted tokens in `connected_accounts.access_token_encrypted`

**Endpoints:**
- `GET /data/v1/accounts` — List connected bank accounts
- `GET /data/v1/accounts/{account_id}/transactions` — Fetch transactions (paginated)
- `POST /data/v1/auth/refresh` — Refresh access token (valid 90 days, refresh token expires in 2 years)

**Sync Job:**
```
for each user with TrueLayer account:
  1. Fetch accounts list
  2. For each account: fetch transactions since last_synced_at
  3. Upsert into transactions table
  4. Update last_synced_at
  5. Log success/failure in sync_logs
```

**Rate Limits:** 120 req/min per user

---

### 6.2 Zerion (Crypto Wallet Data)

**Auth:** API key (user provides, we store encrypted)

**Key endpoints:**
- `GET /wallets/{address}/portfolio` — Total balance in USD + breakdown by token
- `GET /wallets/{address}/positions` — DeFi positions (lending, liquidity pools, etc.)
- `GET /wallets/{address}/nfts` — NFT holdings + floor prices

**Data returned:**
```json
{
  "portfolio": {
    "total_usd": 5234.56,
    "positions": [
      {
        "token": "ETH",
        "balance": 1.5,
        "price_usd": 2345.67,
        "value_usd": 3518.50
      }
    ]
  }
}
```

**Sync Job:**
- Fetch portfolio for each connected wallet
- Calculate total + breakdown by chain
- Store in net_worth_snapshots (aggregated with banks + CEX)

**Rate Limits:** 100 req/min

---

### 6.3 Binance (CEX Account Data)

**Auth:** HMAC-SHA256 signature (user provides API key, we sign requests)

```
GET /api/v3/account
Authorization: Bearer <api_key>
X-MBX-TIMESTAMP: <timestamp>
X-MBX-SIGNATURE: <hmac_signature>
```

**Endpoint:**
- `GET /api/v3/account` — User balances + trading status
- `GET /api/v3/myTrades` — Recent trades (if user wants transaction history)

**Key restrictions:**
- Read-only API keys only (no withdrawal/trading)
- IP whitelisting required (set to Vercel edge IPs)

**Sync Job:**
- Fetch account balances
- Upsert into connected_accounts metadata
- Include in net worth snapshot

---

### 6.4 Anthropic Claude (AI Chat)

**Model:** `claude-sonnet-4-20250514`

**System Prompt Template:**
```
You are Miru, a unified fintech AI assistant.

User Profile:
- Name: {user.name}
- Home Currency: {user.currency_preference}
- Salary Date: {user.salary_date}
- Connected Accounts: {banks}, {wallets}, {cex}

Current Financial Context:
- Net Worth: {net_worth_eur}
- Current Pay Cycle: {cycle_start} to {cycle_end}
- This Month Spending: {month_total}
- Top Categories: {top_categories}
- Active Subscriptions: {subscriptions_count}

You can query the user's transaction database with these functions:
- get_transactions(filters: {date_range, merchant, category})
- get_subscriptions()
- get_net_worth()
- get_budget_status()

Always be helpful, honest, and concise. Do not provide tax or investment advice.
```

**Request:**
```json
{
  "model": "claude-sonnet-4-20250514",
  "messages": [
    {
      "role": "user",
      "content": "How much did I spend on food last month?"
    }
  ],
  "tools": [
    {
      "name": "get_transactions",
      "description": "Query user's transactions",
      "input_schema": {
        "type": "object",
        "properties": {
          "category": {"type": "string"},
          "date_from": {"type": "string", "format": "date"},
          "date_to": {"type": "string", "format": "date"}
        }
      }
    }
  ]
}
```

**Response Flow:**
1. Claude may call `get_transactions` with category="food"
2. Backend executes query, returns data
3. Claude processes result, responds to user

---

## 7. AI Chat Design

### Conversation Examples

**Query 1: Spending Analysis**
```
User: "How much did I spend on food last month?"
Claude: Calls get_transactions(category="food", date_from="2026-03-01", date_to="2026-03-31")
Result: €342.50 across 23 transactions
Claude: "Last month you spent €342.50 on food across 23 transactions. 
That's about €11/day. Your top merchants were Tesco (€89), Lidl (€76), and delivery apps (€64)."
```

**Query 2: Net Worth**
```
User: "What's my net worth right now?"
Claude: Calls get_net_worth()
Result: {
  "total_eur": 28450,
  "breakdown": {
    "banks": 12500,
    "crypto": 14250,
    "cex": 1700
  }
}
Claude: "Your current net worth is €28,450. That breaks down to:
- Banks: €12,500 (44%)
- Crypto: €14,250 (50%) — ETH at €1.5, USDC at €3k
- Binance: €1,700 (6%)"
```

**Query 3: Budget Status**
```
User: "Am I on track this pay cycle?"
Claude: Calls get_budget_status() which returns:
Result: {
  "cycle_start": "2026-03-25",
  "cycle_end": "2026-04-24",
  "spent_so_far": 1850,
  "budgeted": 2500,
  "remaining": 650
}
Claude: "You're on track! Your pay cycle runs Mar 25 – Apr 24.
You've spent €1,850 of your €2,500 budget, leaving €650 for the next 11 days.
That's about €59/day if you keep the same pace."
```

**Query 4: Subscriptions**
```
User: "What are my recurring subscriptions?"
Claude: Calls get_subscriptions()
Result: [
  {"merchant": "Spotify", "amount": 11.99, "frequency": "monthly"},
  {"merchant": "Gym", "amount": 45, "frequency": "monthly"},
  ...
]
Claude: "You have 7 active subscriptions costing €148/month:
- Spotify: €11.99
- Gym: €45
- Disney+: €12.99
- ...
You're paying €1,776 annually. I found 2 services you haven't used in 30+ days."
```

### Implementation

**Frontend (floating FAB):**
```tsx
<FloatingActionButton onClick={openChat} icon={<ChatIcon />} />
<ChatWidget
  isOpen={chatOpen}
  onClose={closeCHat}
  onMessage={handleUserMessage}
  messages={chatHistory}
/>
```

**Backend (`/api/chat/route.ts`):**
1. Receive user message
2. Fetch transaction context (last 90 days, all categories)
3. Fetch current balances, subscriptions, budget status
4. Call Claude with system prompt + context + tools
5. Stream response back (uses Vercel AI SDK)
6. If Claude calls tools, execute queries, return results
7. Continue conversation loop

---

## 8. Project Structure

```
miru/
├── README.md                         # Project overview
├── PROJECT.md                        # This file
├── CLAUDE.md                         # Claude Code instructions
├── COMMIT_CONVENTION.md              # Commit guidelines
├── .env.local.example                # Template env vars
│
├── app/                              # Next.js 14 App Router
│   ├── page.tsx                      # Landing page (public)
│   ├── login/
│   │   └── page.tsx                  # Login / signup
│   ├── dashboard/
│   │   ├── page.tsx                  # Main dashboard (auth required)
│   │   ├── transactions/page.tsx     # Transaction history + filters
│   │   ├── subscriptions/page.tsx    # Subscription list + management
│   │   └── accounts/page.tsx         # Connected account management
│   │
│   ├── api/
│   │   ├── chat/route.ts             # AI chat endpoint (POST)
│   │   ├── auth/
│   │   │   ├── callback/route.ts     # TrueLayer OAuth callback
│   │   │   └── logout/route.ts       # Logout endpoint
│   │   ├── accounts/
│   │   │   ├── route.ts              # GET/POST connected accounts
│   │   │   └── [id]/route.ts         # DELETE account
│   │   ├── transactions/
│   │   │   └── route.ts              # GET transactions (filtered)
│   │   ├── subscriptions/
│   │   │   └── route.ts              # GET subscriptions
│   │   ├── sync/
│   │   │   └── route.ts              # Manual sync trigger (POST)
│   │   └── webhook/
│   │       └── sync-complete.ts      # Edge Function webhook for cron
│   │
│   └── layout.tsx                    # Root layout
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── chat/
│   │   ├── ChatWidget.tsx            # Floating chat interface
│   │   ├── ChatMessage.tsx           # Individual message bubble
│   │   └── ChatInput.tsx             # Input + send button
│   ├── dashboard/
│   │   ├── NetWorthCard.tsx          # Big number + trend
│   │   ├── NetWorthBreakdown.tsx     # Pie chart: banks/crypto/cex
│   │   ├── AccountsList.tsx          # Connected accounts summary
│   │   ├── RecentTransactions.tsx    # Last 10 tx
│   │   └── SubscriptionsSummary.tsx  # Active subscriptions count
│   ├── accounts/
│   │   ├── ConnectAccountButton.tsx  # "Add Bank" / "Add Wallet" / "Add CEX"
│   │   ├── AccountCard.tsx           # Individual account (bank/wallet/cex)
│   │   └── DisconnectModal.tsx       # Confirm disconnect
│   └── ui/                           # Reusable UI (from Huisly)
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Spinner.tsx
│       └── Chart.tsx                 # For net worth breakdowns
│
├── lib/
│   ├── supabase.ts                   # Supabase client + server
│   ├── auth.ts                       # Auth utilities
│   ├── api/
│   │   ├── truelayer.ts              # TrueLayer API client
│   │   ├── zerion.ts                 # Zerion API client
│   │   ├── binance.ts                # Binance API client
│   │   └── anthropic.ts              # Claude API client + tool definitions
│   ├── sync/
│   │   ├── accounts.ts               # Sync transaction logic
│   │   ├── cron.ts                   # Cron schedule definitions
│   │   └── dedup.ts                  # Transaction deduplication
│   ├── finance/
│   │   ├── calculations.ts           # Net worth, budget calculations
│   │   ├── categorize.ts             # Transaction categorization logic
│   │   ├── subscriptions.ts          # Subscription detection algorithm
│   │   └── currency.ts               # Currency conversion utilities
│   ├── encryption.ts                 # Encrypt/decrypt API keys
│   ├── utils.ts                      # General utilities
│   └── types.ts                      # TypeScript types (below)
│
├── supabase/
│   ├── migrations/
│   │   └── 001_init_schema.sql       # Initial schema (from above)
│   ├── edge-functions/
│   │   └── sync-accounts/            # Cron job for scheduled sync
│   │       ├── index.ts
│   │       └── deno.json
│   └── seed.ts                       # Local development seed data
│
├── types/
│   ├── database.ts                   # Auto-generated from Supabase schema
│   ├── api.ts                        # Request/response types
│   └── index.ts                      # Exported types
│
├── styles/
│   ├── globals.css                   # Tailwind + global styles
│   └── variables.css                 # CSS custom properties
│
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   └── ...
│
├── .github/
│   └── workflows/
│       ├── lint.yml                  # Biome + TypeScript
│       └── deploy.yml                # Deploy to Vercel on push main
│
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

---

## 9. TypeScript Types

```typescript
// lib/types.ts

export interface User {
  id: string;
  email: string;
  name: string | null;
  salaryDate: number; // 1-31
  currencyPreference: 'EUR' | 'GBP' | 'USD';
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  provider: 'truelayer' | 'zerion' | 'binance';
  accountType: 'bank' | 'crypto_wallet' | 'cex';
  providerAccountId: string;
  accountName: string;
  lastSyncedAt: Date | null;
  syncStatus: 'pending' | 'syncing' | 'success' | 'error';
  syncErrorMessage: string | null;
  metadata: {
    bank?: { country: string; institution: string };
    wallet?: { chains: string[] };
    cex?: { exchange: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  currency: string;
  transactionType: 'debit' | 'credit' | 'transfer';
  merchantName: string | null;
  category: string | null;
  description: string;
  transactionDate: Date;
  isRecurring: boolean;
  rawData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  accountId: string;
  merchantName: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextExpectedDate: Date;
  lastConfirmedDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  confidenceScore: number; // 0-1
  createdAt: Date;
  updatedAt: Date;
}

export interface NetWorthSnapshot {
  id: string;
  userId: string;
  totalEur: number;
  breakdownJson: {
    banks: number;
    crypto: number;
    cex: number;
    byCurrency: Record<string, number>;
  };
  snapshotAt: Date;
  createdAt: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

export interface ToolCall {
  name: 'get_transactions' | 'get_subscriptions' | 'get_net_worth' | 'get_budget_status';
  arguments: Record<string, unknown>;
  result?: unknown;
}
```

---

## 10. Environment Variables

```bash
# .env.local

# ===== Supabase =====
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # public key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # private key for server
SUPABASE_DB_PASSWORD=... # For edge functions (rarely used)

# ===== TrueLayer =====
TRUELAYER_CLIENT_ID=your_client_id
TRUELAYER_CLIENT_SECRET=your_client_secret
TRUELAYER_REDIRECT_URI=http://localhost:3000/api/auth/callback
TRUELAYER_ENVIRONMENT=sandbox # or 'live'

# ===== Zerion =====
ZERION_API_KEY=your_api_key

# ===== Binance =====
# (Users provide their own API keys; not stored in env)

# ===== Anthropic =====
ANTHROPIC_API_KEY=sk-ant-... # Claude API key

# ===== Encryption (for storing API keys in DB) =====
ENCRYPTION_KEY=... # 32-byte hex string (crypto.getRandomValues(new Uint8Array(32)))

# ===== App Config =====
NEXT_PUBLIC_APP_NAME=Miru
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ===== Cron Job Secret (for triggering syncs) =====
CRON_SECRET=secret_key_for_cron_validation
```

---

## 11. Development Roadmap

### Week 1: Bank Integration + Storage
- [ ] Set up Supabase schema (migrations)
- [ ] Implement TrueLayer OAuth flow (`/api/auth/callback`)
- [ ] Build "Connect Bank" UI (`components/accounts/ConnectAccountButton.tsx`)
- [ ] Implement transaction sync job (store in Supabase)
- [ ] Create transaction history page (`/dashboard/transactions`)

**Deliverable:** Users can connect their EU bank, see transactions.

---

### Week 2: Crypto + CEX + Dashboard
- [ ] Implement Zerion wallet connection (API key input)
- [ ] Implement Binance account connection (API key input)
- [ ] Build net worth snapshot calculation (aggregate all sources)
- [ ] Create unified dashboard (`/dashboard`)
- [ ] Build net worth cards + breakdown chart

**Deliverable:** Users see unified net worth dashboard (fiat + crypto + CEX).

---

### Week 3: AI Chat
- [ ] Define tool schemas for Claude (function calling)
- [ ] Implement `/api/chat` streaming endpoint
- [ ] Build floating chat widget (`components/chat/ChatWidget.tsx`)
- [ ] Wire up tool execution (get_transactions, get_net_worth, etc.)
- [ ] Test chat with sample queries

**Deliverable:** Users can chat with Miru about their finances.

---

### Week 4: Pay-Cycle Budgeting + Subscriptions + Polish
- [ ] Implement pay-cycle calculation logic
- [ ] Build budget dashboard
- [ ] Implement subscription detection algorithm
- [ ] Create subscriptions page (`/dashboard/subscriptions`)
- [ ] Add push notifications for alerts
- [ ] Landing page + SEO
- [ ] QA + bug fixes

**Deliverable:** MVP ready for beta launch.

---

## 12. Known Constraints & Workarounds

### 12.1 TrueLayer Signup Freeze (Feb 2025)
**Problem:** TrueLayer new signups temporarily disabled.

**Workaround for MVP:**
- Use **Enable Banking** instead (similar EU coverage, same PSD2 standard)
- Or use **Tink** (Swedish fintech, EU-wide)
- Code should be abstraction layer so easy to swap

**Long-term:** Monitor TrueLayer status; revert when signups open.

---

### 12.2 GoCardless Bank Account Data EOL
**Problem:** GoCardless no longer accepts new signups (July 2025).

**Workaround:** Use TrueLayer or Enable Banking (both have broader EU coverage).

---

### 12.3 Binance API Key Restrictions
**Problem:** User must generate read-only API key themselves; no trading/withdrawal.

**Solution:** Document clearly in "Connect Binance" UI:
```
✓ We only read your balances
✗ We cannot trade or withdraw
✗ We cannot access futures/margin
```

**Security:** Require IP whitelist (set to Vercel edge IPs).

---

### 12.4 GDPR Data Deletion
**Requirement:** Users must be able to delete all personal data.

**Implementation:**
- Add "Delete Account" button in settings
- Triggers cascade delete: users → all their data (accounts, transactions, subscriptions)
- Before delete: disconnect all APIs, revoke tokens
- Log deletion in audit table (for legal compliance)

---

### 12.5 No Banking License Required
**Why:** TrueLayer/Enable Banking hold AISP licenses. We aggregate data, not hold deposits.

**Documentation:** Add GDPR/privacy policy mentioning "We do not store your credentials" and "Your bank data is encrypted."

---

## 13. Out of Scope (v2+)

| Feature | Why Not Now | When |
|---------|------------|------|
| US bank support (Plaid) | Non-EU focus | v2 |
| Payment initiation (send money) | Complex compliance | v2 |
| Mobile app (iOS/Android) | Web-first MVP | v2 |
| Tax reporting / 1099 | Regulatory complexity | v3 |
| Stock/ETF tracking | Different asset class | v2 |
| Crypto trading (on-app) | License/compliance | v2 |
| Bill reminders | Nice-to-have | v1.1 |
| Spending trends | Analytics | v1.1 |
| Multi-user (family) | Authentication complexity | v2 |

---

## 14. Success Metrics

| Metric | Target (6 months) | How |
|--------|------------------|-----|
| Signups | 500+ | Product Hunt, Twitter |
| Trial → Paid | 12%+ | Freemium model with paid features |
| Avg. session time | 5+ min | Chat engagement |
| DAU | 40%+ | Push notifications for alerts |
| Connected accounts/user | 2.5+ | Banks + wallets + CEX |
| Churn | <5%/month | Strong onboarding |

---

## 15. Frequently Asked Questions

**Q: Why not support US banks (Plaid)?**  
A: MVP focuses on EU expats/crypto holders. US is v2.

**Q: What if a user's bank isn't in TrueLayer?**  
A: Fallback to CSV import + manual transaction entry.

**Q: How often do you sync?**  
A: Every 6–12 hours (configurable). Real-time is v2.

**Q: What if Zerion API goes down?**  
A: Cached last-known balances shown, with warning. Not critical for MVP.

**Q: Is crypto data in real-time?**  
A: No, cached on sync (6–12h). Real-time prices shown via separate price API (CoinGecko).

**Q: Can users trade through Miru?**  
A: No, v2. API keys are read-only intentionally.

**Q: Do you take custody of assets?**  
A: No. Miru aggregates data only. Funds stay in user's wallets/exchanges.

**Q: How do you handle token refresh (TrueLayer)?**  
A: Automatic refresh 7 days before expiry. Users never see this.

---

## 16. Deployment & Infrastructure

**Hosting:** Vercel (auto-scaling, preview deployments, Edge Functions)

**Database:** Supabase (managed PostgreSQL, RLS, automatic backups)

**Cron jobs:** Supabase Edge Functions (serverless, cost-effective)

**Secrets:** Supabase vault (encrypted at rest)

**Monitoring:** Vercel Analytics + Supabase logs

**Backup:** Supabase automatic daily backups (7-day retention in free tier)

---

## 17. Compliance Checklist

- [ ] GDPR: Privacy policy + data deletion
- [ ] PSD2: TrueLayer/Enable Banking handle licensing
- [ ] API Key Security: Encrypted storage + IP whitelisting
- [ ] Terms of Service: Liability disclaimers (not financial advice)
- [ ] Data Residency: Supabase EU region (eu-west-1)
- [ ] Audit Trail: sync_logs table for regulatory compliance
- [ ] Password Policy: Min 8 chars, enforced by Supabase Auth

---

## 18. Engineering Rules

### Commit Messages
- **Short and specific.** One line, lowercase, no period — e.g. `fix(chat): correct bubble alignment`.
- **One logical change per commit.** Never bundle unrelated changes in a single commit.
- **Minimal diff.** If a commit touches more than one concern (schema + UI, style + logic), split it.
- Follow [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for type/scope format.

### Styling
- **Tailwind CSS v4 first.** All UI styles must be written as Tailwind utility classes.
- **No inline `style` props** unless the value is truly dynamic at runtime (e.g. a per-item percentage width from data). Static colours, spacing, and layout must use Tailwind.
- Design tokens (`--color-accent`, `--color-surface`, etc.) are registered in `@theme` in `globals.css` and used via `text-accent`, `bg-surface`, etc. — not hardcoded hex values in JSX.

---

## 19. Next Steps

1. **Product:** Validate MVP with 10 EU expat users (interviews)
2. **Engineering:** Set up Supabase schema, TrueLayer OAuth flow
3. **Design:** Create dashboard + chat UI mockups
4. **Timeline:** Week 1 starts today; launch beta Week 5

---

**Project Owner:** Product Team  
**Last Updated:** 2026-04-11  
**Next Review:** 2026-04-18  
**Repository:** https://github.com/yourusername/miru
