# Learning System & Continuity Plan

## Objective
Create a personalized, continuous learning experience that tracks user knowledge, suggests the next logical steps in a curriculum, and enforces retention through spaced repetition.

## Core Components

### 1. The "Transcript" (User Knowledge Graph)
**Goal:** A consolidated view of what a user knows, independent of the specific source material.
*   **Current State:** `echoes` table tracks mastery per `sourceId`.
*   **Enhancement:**
    *   Aggregate `echoes` by `topic` across all sources to form a global "Skill Tree".
    *   Use this aggregate view to determine if a user *already knows* a concept to avoid redundant teaching.

### 2. Learning Paths (Course Continuity)
**Goal:** Enable long-term learning goals (e.g., "Learn React") that span multiple generated sessions (Sifts).
*   **New Entity:** `learning_paths`
    *   `userId`: Owner.
    *   `goal`: "Learn React from scratch".
    *   `status`: active, completed.
    *   `context`: JSON blob of what has been covered so far (summary of previous Sifts in this path).
*   **Flow:**
    1.  User starts a path: "I want to learn [Topic]".
    2.  AI generates the *first* Sift (Lesson + Quiz).
    3.  User completes Sift.
    4.  System updates `learning_path` context with new knowledge.
    5.  User clicks "Continue Path".
    6.  AI generates the *next* Sift based on:
        *   The Goal.
        *   What was just learned (Context).
        *   What is missing (Gap Analysis).

### 3. The "Refresher" (Spaced Repetition)
**Goal:** Prevent knowledge decay by re-testing previously mastered topics.
*   **Mechanism:**
    *   Query `echoes` where `masteryLevel > 0` AND `lastReviewedAt` is older than [Interval] (e.g., 3 days, 1 week).
    *   Inject these "Review Questions" into new Sifts or create dedicated "Daily Review" sessions.
    *   **Logic:** "You learnt 'useEffect' 2 weeks ago. Here is a quick question to check if you still remember it."

## Implementation Steps

### Phase 1: Database Schema Updates
1.  Create `learning_paths` table.
    *   Tracks the high-level goal and continuity context.
2.  Create `learning_path_items` table (Optional).
    *   Links `sifts` to a `learning_path` to show history.

### Phase 2: AI Logic (The "Curriculum Engine")
1.  **Next Step Generation:**
    *   Prompt: "User wants to learn X. They have already covered Y and Z. Generate the syllabus for the *next* immediate module."
2.  **Knowledge Filtering:**
    *   Before generating content, check User's Global Echoes.
    *   If `echo(topic="React Hooks")` is High Mastery -> Skip explanation, move to advanced usage or testing.

### Phase 3: UI/UX
1.  **Path Dashboard:** View active Learning Paths.
2.  **Path View:** Timeline of completed Sifts in the path + "Continue" button.
3.  **Knowledge Profile:** Visualization of top mastered topics (derived from Echoes).

## Proposed Schema

```typescript
// packages/db/src/schema/learning-paths.ts

export const learningPaths = pgTable("learning_paths", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  title: text("title").notNull(), // e.g. "Mastering React"
  goal: text("goal").notNull(), // User's original prompt
  summary: text("summary"), // AI summary of progress so far
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Link Sifts to Paths
export const learningPathSifts = pgTable("learning_path_sifts", {
    id: text("id").primaryKey(),
    pathId: text("path_id").references(() => learningPaths.id),
    siftId: text("sift_id").references(() => sifts.id),
    order: integer("order").notNull(), // 1, 2, 3...
});
```

## Immediate Next Steps
1.  Define the `learning_paths` schema.
2.  Create the `createLearningPath` action.
3.  Update the AI generation prompt to accept `previousContext` for continuity.
