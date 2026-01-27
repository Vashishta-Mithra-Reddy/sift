import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { sifts } from "./sifts";

export const flashcards = pgTable("flashcards", {
  id: text("id").primaryKey(),
  siftId: text("sift_id")
    .notNull()
    .references(() => sifts.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
