---
name: earthVENGERS leaderboard categories
description: How the 4 leaderboard tabs (daily/weekly/monthly/awareness) relate to mission frequency, and how per-category points are tracked.
---

The 4 leaderboard sections map directly to a mission's `frequency` field (daily/weekly/monthly/awareness), not to rolling time windows (e.g. "points earned this week"). A user's "weekly leaderboard" score is the sum of points from all weekly-frequency missions they've ever completed, lifetime.

**Why:** the user described missions and leaderboard sections as sharing the same 4 buckets, so this was the simplest model consistent with their mental model — no need for date-range aggregation or reset logic.

**How to apply:** category points are summed from a `completion_logs` table (one row per mission completion, snapshotting category + points at completion time), not from the lifetime `users.points` column, which stays as the overall/all-time ranking. Top 5 per category get a Marvel-themed title (rank-based, computed at read time, not stored). A user ranked #1 in all 4 categories simultaneously earns a bonus "Stone Collector" title (Infinity Stones easter egg).
