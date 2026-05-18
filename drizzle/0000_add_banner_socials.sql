CREATE TYPE "public"."availability_status" AS ENUM('taking_on_work', 'fully_booked');--> statement-breakpoint
CREATE TYPE "public"."photo_type" AS ENUM('profile', 'gallery', 'before', 'after');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'paid');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(160) NOT NULL,
	"badge_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"photo_url" text NOT NULL,
	"caption" text,
	"type" "photo_type" DEFAULT 'gallery' NOT NULL,
	"pair_id" integer,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quote_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"customer_name" varchar(120) NOT NULL,
	"customer_phone" varchar(40) NOT NULL,
	"job_description" text NOT NULL,
	"postcode" varchar(16),
	"photo_urls" json DEFAULT '[]'::json,
	"status" "quote_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"section_key" varchar(64) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_name" varchar(120) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(191) NOT NULL,
	"email" varchar(255),
	"name" varchar(120),
	"trade" varchar(80),
	"phone" varchar(40),
	"location" varchar(120),
	"areas_covered" text,
	"about" text,
	"years_experience" integer,
	"response_time" varchar(60),
	"payment_methods" text,
	"availability_status" "availability_status" DEFAULT 'taking_on_work' NOT NULL,
	"google_review_url" text,
	"facebook_url" text,
	"instagram_url" text,
	"tiktok_url" text,
	"whatsapp_number" varchar(40),
	"intro_video_url" text,
	"emergency_number" varchar(40),
	"profile_photo_url" text,
	"banner_image_url" text,
	"accent_color" varchar(16) DEFAULT '#F97316',
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"slug" varchar(80) NOT NULL,
	"stripe_customer_id" varchar(191),
	"stripe_subscription_id" varchar(191),
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certifications" ADD CONSTRAINT "certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "photos" ADD CONSTRAINT "photos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sections" ADD CONSTRAINT "sections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certifications_user_idx" ON "certifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "photos_user_idx" ON "photos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "photos_type_idx" ON "photos" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quote_requests_user_idx" ON "quote_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sections_user_idx" ON "sections" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sections_user_key_idx" ON "sections" USING btree ("user_id","section_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "services_user_idx" ON "services" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_slug_idx" ON "users" USING btree ("slug");