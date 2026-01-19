import { pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const pushTokens = pgTable(
  "push_token",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    platform: text("platform"), // 'web', 'android', 'ios'
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("push_token_userId_idx").on(table.userId)]
);
