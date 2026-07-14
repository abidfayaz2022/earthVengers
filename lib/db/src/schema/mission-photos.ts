import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { campaignsTable } from "./campaigns";
import { enrollmentsTable } from "./enrollments";

// Photo proof submitted by a user for a mission completion. Missions that
// can't be trusted from a single photo (verificationType = 'multi_photo')
// require several of these, spaced apart in time (see campaigns.photoIntervalHours).
//
// status lifecycle:
//   pending_review  -> uploaded, passed the basic automated quality check, waiting on a human reviewer
//   auto_rejected   -> failed the automated quality check (e.g. corrupt/blank file) before any human looks at it
//   approved        -> a reviewer (or a future automated vision check) confirmed it matches the mission
//   rejected        -> a reviewer rejected it
export const missionPhotosTable = pgTable("mission_photos", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => enrollmentsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id, { onDelete: "cascade" }),
  objectPath: text("object_path").notNull(),
  sequenceIndex: integer("sequence_index").notNull().default(1),
  takenAt: timestamp("taken_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("pending_review"),
  autoCheckNotes: text("auto_check_notes"),
  reviewedBy: integer("reviewed_by").references(() => usersTable.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMissionPhotoSchema = createInsertSchema(missionPhotosTable).omit({
  id: true,
  createdAt: true,
  status: true,
  autoCheckNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  reviewNotes: true,
});
export type InsertMissionPhoto = z.infer<typeof insertMissionPhotoSchema>;
export type MissionPhoto = typeof missionPhotosTable.$inferSelect;
