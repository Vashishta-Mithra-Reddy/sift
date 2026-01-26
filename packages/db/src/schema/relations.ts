import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
import { sources } from "./sources";
import { sifts, questions, siftSessions, sessionAnswers, siftSections } from "./sifts";
import { echoes } from "./echoes";
import { pushTokens } from "./push-tokens";
import { learningPaths, learningPathSifts } from "./learning-paths";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  sources: many(sources),
  sifts: many(sifts),
  echoes: many(echoes),
  pushTokens: many(pushTokens),
  learningPaths: many(learningPaths),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  user: one(user, {
    fields: [sources.userId],
    references: [user.id],
  }),
  sifts: many(sifts),
  echoes: many(echoes),
}));

export const siftsRelations = relations(sifts, ({ one, many }) => ({
  user: one(user, {
    fields: [sifts.userId],
    references: [user.id],
  }),
  source: one(sources, {
    fields: [sifts.sourceId],
    references: [sources.id],
  }),
  questions: many(questions),
  sessions: many(siftSessions),
  sections: many(siftSections),
}));

export const siftSectionsRelations = relations(siftSections, ({ one, many }) => ({
  sift: one(sifts, {
    fields: [siftSections.siftId],
    references: [sifts.id],
  }),
  questions: many(questions),
}));

export const siftSessionsRelations = relations(siftSessions, ({ one, many }) => ({
  sift: one(sifts, {
    fields: [siftSessions.siftId],
    references: [sifts.id],
  }),
  user: one(user, {
    fields: [siftSessions.userId],
    references: [user.id],
  }),
  answers: many(sessionAnswers),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  sift: one(sifts, {
    fields: [questions.siftId],
    references: [sifts.id],
  }),
  section: one(siftSections, {
    fields: [questions.sectionId],
    references: [siftSections.id],
  }),
  sessionAnswers: many(sessionAnswers),
}));

export const sessionAnswersRelations = relations(sessionAnswers, ({ one }) => ({
  session: one(siftSessions, {
    fields: [sessionAnswers.sessionId],
    references: [siftSessions.id],
  }),
  question: one(questions, {
    fields: [sessionAnswers.questionId],
    references: [questions.id],
  }),
}));

export const echoesRelations = relations(echoes, ({ one }) => ({
  user: one(user, {
    fields: [echoes.userId],
    references: [user.id],
  }),
  source: one(sources, {
    fields: [echoes.sourceId],
    references: [sources.id],
  }),
}));

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(user, {
    fields: [pushTokens.userId],
    references: [user.id],
  }),
}));

export const learningPathsRelations = relations(learningPaths, ({ one, many }) => ({
  user: one(user, {
    fields: [learningPaths.userId],
    references: [user.id],
  }),
  sifts: many(learningPathSifts),
}));

export const learningPathSiftsRelations = relations(learningPathSifts, ({ one }) => ({
  path: one(learningPaths, {
    fields: [learningPathSifts.pathId],
    references: [learningPaths.id],
  }),
  sift: one(sifts, {
    fields: [learningPathSifts.siftId],
    references: [sifts.id],
  }),
}));
