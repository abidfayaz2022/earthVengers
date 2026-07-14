import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  pointsReward: integer("points_reward").notNull().default(10),
  frequency: text("frequency").notNull(), // daily, weekly, monthly, awareness
  imageUrl: text("image_url"),
  enrolledCount: integer("enrolled_count").notNull().default(0),
  // How completion is proven. 'photo' = one proof photo required. 'multi_photo' =
  // several proof photos required, spaced photoIntervalHours apart, for missions
  // a single photo can't confirm (e.g. an ongoing habit). 'none' = self-reported,
  // because a photo genuinely can't confirm it (e.g. an online share) — these
  // missions carry reduced pointsReward to offset the lack of verification.
  verificationType: text("verification_type").notNull().default("photo"),
  requiredPhotoCount: integer("required_photo_count").notNull().default(1),
  photoIntervalHours: integer("photo_interval_hours"), // min gap required between photos, for verificationType = 'multi_photo'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true, createdAt: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
