CREATE TABLE "connected_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"account_type" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"account_name" text,
	"access_token_encrypted" text,
	"refresh_token_encrypted" text,
	"api_secret_encrypted" text,
	"last_synced_at" timestamp with time zone,
	"sync_status" text DEFAULT 'pending',
	"sync_error_message" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connected_accounts_user_id_provider_provider_account_id_unique" UNIQUE("user_id","provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "net_worth_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_eur" numeric(15, 2) NOT NULL,
	"breakdown_json" jsonb NOT NULL,
	"snapshot_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"merchant_name" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" text NOT NULL,
	"frequency" text NOT NULL,
	"next_expected_date" date,
	"last_confirmed_date" date,
	"status" text DEFAULT 'active',
	"confidence_score" numeric(3, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"provider" text NOT NULL,
	"action" text NOT NULL,
	"status" text,
	"error_message" text,
	"records_synced" integer,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" text NOT NULL,
	"transaction_type" text,
	"merchant_name" text,
	"category" text,
	"description" text,
	"transaction_date" date NOT NULL,
	"is_recurring" boolean DEFAULT false,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"salary_date" integer,
	"currency_preference" text DEFAULT 'EUR',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "net_worth_snapshots" ADD CONSTRAINT "net_worth_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_net_worth_user_date" ON "net_worth_snapshots" USING btree ("user_id","snapshot_at");--> statement-breakpoint
CREATE INDEX "idx_sync_logs_user_date" ON "sync_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_date" ON "transactions" USING btree ("user_id","transaction_date");--> statement-breakpoint
CREATE INDEX "idx_transactions_category" ON "transactions" USING btree ("user_id","category");