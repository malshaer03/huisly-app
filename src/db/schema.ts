import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Trial
  trialStartedAt: timestamp("trial_started_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  trialUsed: boolean("trial_used").default(false),
  // Subscription
  subscriptionTier: text("subscription_tier"), // 'free' | 'pro' | 'plus'
  subscriptionStatus: text("subscription_status"), // 'trialing' | 'active' | 'cancelled' | 'expired'
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  // Push notifications
  pushSubscription: jsonb("push_subscription"),
  pushEnabled: boolean("push_enabled").default(false),
});

export const preferences = pgTable("preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  budgetMax: integer("budget_max"),
  locationPref: text("location_pref").array(),
  roomType: text("room_type"), // 'studio' | 'apartment' | 'room'
  moveDate: date("move_date"),
  minSizeM2: integer("min_size_m2"),
  furnished: boolean("furnished"),
  pets: boolean("pets"),
  visaType: text("visa_type"),
  country: text("country").default("NL"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(), // 'facebook' | 'pararius' | 'kamernet' | 'funda' | 'huisly'
  city: text("city"),
  price: integer("price"),
  sizeM2: integer("size_m2"),
  availableFrom: date("available_from"),
  furnished: boolean("furnished"),
  description: text("description"),
  images: text("images").array(),
  // Contact
  contactMethod: text("contact_method"), // 'facebook_dm' | 'email' | 'platform_form'
  contactValue: text("contact_value"),
  postUrl: text("post_url"),
  posterName: text("poster_name"),
  // Meta
  sourceId: text("source_id"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  country: text("country").default("NL"),
});

export const departingListings = pgTable("departing_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  address: text("address"),
  city: text("city"),
  price: integer("price"),
  availableFrom: date("available_from"),
  description: text("description"),
  images: text("images").array(),
  postedAt: timestamp("posted_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(), // 'payslip' | 'contract' | 'motivation' | 'id' | 'bank_statement'
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  listingId: uuid("listing_id").references(() => listings.id, {
    onDelete: "set null",
  }),
  emailThreadId: text("email_thread_id"),
  status: text("status").default("sent"), // 'sent' | 'replied' | 'no_response' | 'viewing_scheduled'
  sentAt: timestamp("sent_at"),
  repliedAt: timestamp("replied_at"),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(), // 'new_listings' | 'reply' | 'trial_ending'
  listingIds: text("listing_ids").array(),
  sentAt: timestamp("sent_at").defaultNow(),
  clickedAt: timestamp("clicked_at"),
});

// Type exports for use across the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Preferences = typeof preferences.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type DepartingListing = typeof departingListings.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
