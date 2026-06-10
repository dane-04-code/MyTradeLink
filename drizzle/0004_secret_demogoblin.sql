CREATE TYPE "public"."account_goal" AS ENUM('business', 'looking_for_work');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"institution" varchar(160) NOT NULL,
	"qualification" varchar(160),
	"start_year" integer,
	"end_year" integer,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_requests" ADD COLUMN "customer_email" varchar(254);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_goal" "account_goal" DEFAULT 'business' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "public_email" varchar(254);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "education" ADD CONSTRAINT "education_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "education_user_idx" ON "education" USING btree ("user_id");