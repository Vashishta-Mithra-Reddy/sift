import { pgTable, text, timestamp, jsonb, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { sources } from "./sources";

export const siftStatusEnum = pgEnum("sift_status", ["in_progress", "completed", "abandoned"]);

export const sifts = pgTable("sifts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  status: siftStatusEnum("status").default("in_progress").notNull(), 
  summary: text("summary"), // Optional summary of the sift content
  isPublic: boolean("is_public").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  config: jsonb("config"), // { depth: 'deep', format: 'flashcard' }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const siftSessions = pgTable("sift_sessions", {
  id: text("id").primaryKey(),
  siftId: text("sift_id")
    .notNull()
    .references(() => sifts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: siftStatusEnum("status").default("in_progress").notNull(),
  score: integer("score"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const siftSections = pgTable("sift_sections", {
  id: text("id").primaryKey(),
  siftId: text("sift_id")
    .notNull()
    .references(() => sifts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(), // The learning material
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  siftId: text("sift_id")
    .notNull()
    .references(() => sifts.id, { onDelete: "cascade" }),
  sectionId: text("section_id")
    .references(() => siftSections.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(), // The correct answer text
  correctOption: text("correct_option"), // "A", "B", "C", "D"
  options: jsonb("options"), // Array of strings for MCQs
  explanation: text("explanation"), // Source context
  tags: jsonb("tags").$type<string[]>().default([]), // Array of strings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Deprecated columns, moving to session_answers
  // userAnswer: text("user_answer"),
  // isCorrect: boolean("is_correct"),
});

export const sessionAnswers = pgTable("session_answers", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => siftSessions.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  userAnswer: text("user_answer"), // The option text or letter selected
  isCorrect: boolean("is_correct"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
