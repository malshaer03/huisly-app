CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"listing_id" uuid,
	"email_thread_id" text,
	"status" text DEFAULT 'sent',
	"sent_at" timestamp,
	"replied_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "departing_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"address" text,
	"city" text,
	"price" integer,
	"available_from" date,
	"description" text,
	"images" text[],
	"posted_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"city" text,
	"price" integer,
	"size_m2" integer,
	"available_from" date,
	"furnished" boolean,
	"description" text,
	"images" text[],
	"contact_method" text,
	"contact_value" text,
	"post_url" text,
	"poster_name" text,
	"source_id" text,
	"scraped_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"country" text DEFAULT 'NL'
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"listing_ids" text[],
	"sent_at" timestamp DEFAULT now(),
	"clicked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"budget_max" integer,
	"location_pref" text[],
	"room_type" text,
	"move_date" date,
	"min_size_m2" integer,
	"furnished" boolean,
	"pets" boolean,
	"visa_type" text,
	"country" text DEFAULT 'NL',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"trial_started_at" timestamp,
	"trial_ends_at" timestamp,
	"trial_used" boolean DEFAULT false,
	"subscription_tier" text,
	"subscription_status" text,
	"stripe_customer_id" text,
	"subscription_ends_at" timestamp,
	"push_subscription" jsonb,
	"push_enabled" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departing_listings" ADD CONSTRAINT "departing_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;