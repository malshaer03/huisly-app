import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ============================================================
// USERS
// ============================================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  salaryDate: integer("salary_date"), // day of month (1-31)
  currencyPreference: text("currency_preference").default("EUR"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================
// CONNECTED ACCOUNTS (banks, wallets, CEX)
// ============================================================
export const connectedAccounts = pgTable(
  "connected_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Account type
    provider: text("provider").notNull(), // 'truelayer' | 'zerion' | 'binance'
    accountType: text("account_type").notNull(), // 'bank' | 'crypto_wallet' | 'cex'

    // Provider-specific identifiers
    providerAccountId: text("provider_account_id").notNull(),
    accountName: text("account_name"),

    // Credentials (encrypted)
    accessTokenEncrypted: text("access_token_encrypted"),
    refreshTokenEncrypted: text("refresh_token_encrypted"),
    apiSecretEncrypted: text("api_secret_encrypted"),

    // Sync metadata
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    syncStatus: text("sync_status").default("pending"), // 'pending' | 'syncing' | 'success' | 'error'
    syncErrorMessage: text("sync_error_message"),

    // Account metadata (varies by provider)
    metadata: jsonb("metadata"), // { bank: {country, institution}, wallet: {chains}, cex: {exchange} }

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique().on(t.userId, t.provider, t.providerAccountId)],
);

// ============================================================
// TRANSACTIONS
// ============================================================
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => connectedAccounts.id, { onDelete: "cascade" }),

    // Transaction details
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").notNull(), // 'EUR', 'USD', etc
    transactionType: text("transaction_type"), // 'debit' | 'credit' | 'transfer'

    // Categorisation
    merchantName: text("merchant_name"),
    category: text("category"), // 'food' | 'transport' | 'salary' | 'subscription' | etc
    description: text("description"),

    // Timing
    transactionDate: date("transaction_date").notNull(),
    isRecurring: boolean("is_recurring").default(false),

    // Raw data (for debugging / re-processing)
    rawData: jsonb("raw_data"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("idx_transactions_user_date").on(t.userId, t.transactionDate),
    index("idx_transactions_category").on(t.userId, t.category),
  ],
);

// ============================================================
// SUBSCRIPTIONS (auto-detected recurring payments)
// ============================================================
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id")
    .notNull()
    .references(() => connectedAccounts.id, { onDelete: "cascade" }),

  merchantName: text("merchant_name").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  frequency: text("frequency").notNull(), // 'monthly' | 'weekly' | 'yearly'

  nextExpectedDate: date("next_expected_date"),
  lastConfirmedDate: date("last_confirmed_date"),

  status: text("status").default("active"), // 'active' | 'paused' | 'cancelled'
  confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }), // 0.00–1.00

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================
// NET WORTH SNAPSHOTS (historical tracking)
// ============================================================
export const netWorthSnapshots = pgTable(
  "net_worth_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    totalEur: numeric("total_eur", { precision: 15, scale: 2 }).notNull(),

    // { banks: 5000, crypto: 3500, cex: 1200, by_currency: { EUR: 8000, USDC: 700 } }
    breakdownJson: jsonb("breakdown_json").notNull(),

    snapshotAt: timestamp("snapshot_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("idx_net_worth_user_date").on(t.userId, t.snapshotAt)],
);

// ============================================================
// SYNC LOG (audit trail for integrations)
// ============================================================
export const syncLogs = pgTable(
  "sync_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").references(() => connectedAccounts.id, {
      onDelete: "set null",
    }),

    provider: text("provider").notNull(),
    action: text("action").notNull(), // 'sync_started' | 'sync_completed' | 'sync_failed'
    status: text("status"),
    errorMessage: text("error_message"),

    recordsSynced: integer("records_synced"),
    durationMs: integer("duration_ms"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("idx_sync_logs_user_date").on(t.userId, t.createdAt)],
);

// ============================================================
// TYPE EXPORTS
// ============================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ConnectedAccount = typeof connectedAccounts.$inferSelect;
export type NewConnectedAccount = typeof connectedAccounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NetWorthSnapshot = typeof netWorthSnapshots.$inferSelect;
export type SyncLog = typeof syncLogs.$inferSelect;
