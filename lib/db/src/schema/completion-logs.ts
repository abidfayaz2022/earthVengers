import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { campaignsTable } from "./campaigns";

// One row per mission completion. Captures a snapshot of the mission's
// frequency category (daily/weekly/monthly/awareness) and points at the
// time of completion so category leaderboards can be computed by summing
// this log, independent of later campaign edits.
export const completionLogsTable = pgTable("completion_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // snapshot of campaign.frequency: daily, weekly, monthly, awareness
  pointsEarned: integer("points_earned").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCompletionLogSchema = createInsertSchema(completionLogsTable).omit({ id: true, completedAt: true });
export type InsertCompletionLog = z.infer<typeof insertCompletionLogSchema>;
export type CompletionLog = typeof completionLogsTable.$inferSelect;
