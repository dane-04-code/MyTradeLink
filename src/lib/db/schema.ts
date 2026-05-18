import {
  pgTable,
  text,
  varchar,
  serial,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  json,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const planEnum = pgEnum("plan", ["free", "paid"]);
export const availabilityEnum = pgEnum("availability_status", [
  "taking_on_work",
  "fully_booked",
]);
export const photoTypeEnum = pgEnum("photo_type", [
  "profile",
  "gallery",
  "before",
  "after",
]);
export const quoteStatusEnum = pgEnum("quote_status", [
  "new",
  "contacted",
  "closed",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 191 }).notNull(),
    email: varchar("email", { length: 255 }),
    name: varchar("name", { length: 120 }),
    trade: varchar("trade", { length: 80 }),
    phone: varchar("phone", { length: 40 }),
    location: varchar("location", { length: 120 }),
    areasCovered: text("areas_covered"),
    about: text("about"),
    yearsExperience: integer("years_experience"),
    responseTime: varchar("response_time", { length: 60 }),
    paymentMethods: text("payment_methods"),
    availabilityStatus: availabilityEnum("availability_status")
      .notNull()
      .default("taking_on_work"),
    googleReviewUrl: text("google_review_url"),
    facebookUrl: text("facebook_url"),
    instagramUrl: text("instagram_url"),
    tiktokUrl: text("tiktok_url"),
    whatsappNumber: varchar("whatsapp_number", { length: 40 }),
    introVideoUrl: text("intro_video_url"),
    emergencyNumber: varchar("emergency_number", { length: 40 }),
    profilePhotoUrl: text("profile_photo_url"),
    bannerImageUrl: text("banner_image_url"),
    accentColor: varchar("accent_color", { length: 16 }).default("#F97316"),
    plan: planEnum("plan").notNull().default("free"),
    slug: varchar("slug", { length: 80 }).notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 191 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 191 }),
    onboardingComplete: boolean("onboarding_complete").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    clerkIdx: uniqueIndex("users_clerk_id_idx").on(t.clerkId),
    slugIdx: uniqueIndex("users_slug_idx").on(t.slug),
  })
);

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceName: varchar("service_name", { length: 120 }).notNull(),
    description: text("description"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("services_user_idx").on(t.userId),
  })
);

export const photos = pgTable(
  "photos",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    photoUrl: text("photo_url").notNull(),
    caption: text("caption"),
    type: photoTypeEnum("type").notNull().default("gallery"),
    pairId: integer("pair_id"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("photos_user_idx").on(t.userId),
    typeIdx: index("photos_type_idx").on(t.userId, t.type),
  })
);

export const certifications = pgTable(
  "certifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    badgeUrl: text("badge_url"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("certifications_user_idx").on(t.userId),
  })
);

export const sections = pgTable(
  "sections",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sectionKey: varchar("section_key", { length: 64 }).notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (t) => ({
    userIdx: index("sections_user_idx").on(t.userId),
    uniqueSection: uniqueIndex("sections_user_key_idx").on(t.userId, t.sectionKey),
  })
);

export const quoteRequests = pgTable(
  "quote_requests",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 40 }).notNull(),
    jobDescription: text("job_description").notNull(),
    postcode: varchar("postcode", { length: 16 }),
    photoUrls: json("photo_urls").$type<string[]>().default(sql`'[]'::json`),
    status: quoteStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("quote_requests_user_idx").on(t.userId),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  photos: many(photos),
  certifications: many(certifications),
  sections: many(sections),
  quoteRequests: many(quoteRequests),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  user: one(users, { fields: [services.userId], references: [users.id] }),
}));
export const photosRelations = relations(photos, ({ one }) => ({
  user: one(users, { fields: [photos.userId], references: [users.id] }),
}));
export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, { fields: [certifications.userId], references: [users.id] }),
}));
export const sectionsRelations = relations(sections, ({ one }) => ({
  user: one(users, { fields: [sections.userId], references: [users.id] }),
}));
export const quoteRequestsRelations = relations(quoteRequests, ({ one }) => ({
  user: one(users, { fields: [quoteRequests.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Service = typeof services.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Certification = typeof certifications.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
