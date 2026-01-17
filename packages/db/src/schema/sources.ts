  import { pgTable, text, timestamp, jsonb, pgEnum, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const sourceTypeEnum = pgEnum("source_type", ["pdf", "text", "url", "audio", "markdown", "json"]);

export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  fileName: text("file_name"),
  type: sourceTypeEnum("type").notNull(),
  content: text("content"), // Extracted text content
  originalUrl: text("original_url"),
  isPasted: boolean("is_pasted").default(false), // Flag to identify pasted content
  metadata: jsonb("metadata"), // For things like page count, duration, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
