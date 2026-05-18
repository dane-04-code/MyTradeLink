CREATE TYPE "public"."event_type" AS ENUM('view', 'call_click', 'whatsapp_click', 'quote_open', 'quote_submit', 'social_click');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" "event_type" NOT NULL,
	"ip_hash" varchar(64),
	"referrer" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_events" ADD CONSTRAINT "page_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_events_user_time_idx" ON "page_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_events_user_type_idx" ON "page_events" USING btree ("user_id","event_type");