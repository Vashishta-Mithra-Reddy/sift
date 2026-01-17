import { pgTable, text, timestamp, integer, index, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { sources } from "./sources";

export const echoes = pgTable("echoes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(), // The concept/keyword
  masteryLevel: integer("mastery_level").default(0).notNull(), // 0-100
  lastReviewedAt: timestamp("last_reviewed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("echoes_user_source_idx").on(table.userId, table.sourceId),
  unique("echoes_user_source_topic_unique").on(table.userId, table.sourceId, table.topic),
]);
