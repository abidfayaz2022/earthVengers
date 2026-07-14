import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { fundraisersTable } from "./fundraisers";
import { usersTable } from "./users";

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  fundraiserId: integer("fundraiser_id").notNull().references(() => fundraisersTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  donorName: text("donor_name").notNull(),
  message: text("message"),
  // Set when the donor was logged in at the time of donating. Anonymous/guest
  // donations (userId null) count toward fundraiser totals but not the donor leaderboard.
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({ id: true, createdAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;
