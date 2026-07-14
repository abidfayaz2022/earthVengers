import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fundraisersTable = pgTable("fundraisers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goalAmount: numeric("goal_amount", { precision: 12, scale: 2 }).notNull(),
  raisedAmount: numeric("raised_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  donorCount: integer("donor_count").notNull().default(0),
  imageUrl: text("image_url"),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFundraiserSchema = createInsertSchema(fundraisersTable).omit({ id: true, createdAt: true });
export type InsertFundraiser = z.infer<typeof insertFundraiserSchema>;
export type Fundraiser = typeof fundraisersTable.$inferSelect;
