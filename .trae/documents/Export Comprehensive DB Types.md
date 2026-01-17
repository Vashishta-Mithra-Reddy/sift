## Goals
- Export complete, first-class TypeScript types for all DB tables and enums
- Provide ergonomic composite result types for common relational queries
- Ensure consumers can import types from @sift/db without deep paths

## Current State
- Only auth types are exported from [index.ts](file:///c:/Vashishta/freelancing/sift/packages/db/src/types/index.ts)
- New tables present: [sources.ts](file:///c:/Vashishta/freelancing/sift/packages/db/src/schema/sources.ts), [sifts.ts](file:///c:/Vashishta/freelancing/sift/packages/db/src/schema/sifts.ts), [echoes.ts](file:///c:/Vashishta/freelancing/sift/packages/db/src/schema/echoes.ts)
- Package exports map "./*" to "./src/*.ts", which does not expose nested "types/index.ts" cleanly

## Changes
- Extend types/index.ts to export tables and enums:
  - Source, NewSource, SourceType
  - Sift, NewSift, SiftStatus
  - Question, NewQuestion
  - Echo, NewEcho
- Add composite types used by queries:
  - SiftWithSource, SiftWithQuestions, SourceWithStats (placeholder structure)
- Update package.json exports to expose types via @sift/db/types

## Implementation Steps
1. Update [types/index.ts](file:///c:/Vashishta/freelancing/sift/packages/db/src/types/index.ts):

```ts
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import * as auth from "../schema/auth";
import * as src from "../schema/sources";
import * as sft from "../schema/sifts";
import * as ech from "../schema/echoes";

// Auth
export type User = InferSelectModel<typeof auth.user>;
export type NewUser = InferInsertModel<typeof auth.user>;
export type Session = InferSelectModel<typeof auth.session>;
export type NewSession = InferInsertModel<typeof auth.session>;
export type Account = InferSelectModel<typeof auth.account>;
export type NewAccount = InferInsertModel<typeof auth.account>;
export type Verification = InferSelectModel<typeof auth.verification>;
export type NewVerification = InferInsertModel<typeof auth.verification>;

// Sources
export type Source = InferSelectModel<typeof src.sources>;
export type NewSource = InferInsertModel<typeof src.sources>;
export type SourceType = typeof src.sourceTypeEnum.enumValues[number];

// Sifts & Questions
export type Sift = InferSelectModel<typeof sft.sifts>;
export type NewSift = InferInsertModel<typeof sft.sifts>;
export type SiftStatus = typeof sft.siftStatusEnum.enumValues[number];
export type Question = InferSelectModel<typeof sft.questions>;
export type NewQuestion = InferInsertModel<typeof sft.questions>;

// Echoes
export type Echo = InferSelectModel<typeof ech.echoes>;
export type NewEcho = InferInsertModel<typeof ech.echoes>;

// Composite results for common queries
export type SiftWithSource = Sift & { source: Source };
export type SiftWithQuestions = Sift & { questions: Question[]; source?: Source };
```

2. Update [package.json](file:///c:/Vashishta/freelancing/sift/packages/db/package.json) exports:

```json
{
  "exports": {
    ".": { "default": "./src/index.ts" },
    "./types": { "default": "./src/types/index.ts" },
    "./*": { "default": "./src/*.ts" }
  }
}
```

3. Ensure barrel [schema/index.ts](file:///c:/Vashishta/freelancing/sift/packages/db/src/schema/index.ts) remains unchanged and continues to re-export all schemas for drizzle config stability.

## Verification
- Build the repo and import types from the web app:
  - `import { Source, Sift, Question, Echo, SourceType, SiftStatus } from "@sift/db/types";`
- Validate queries type inference for `db.query.sifts.findFirst({ with: { questions: true, source: true } })` aligns with `SiftWithQuestions`.
- Run TypeScript in apps/web to ensure no red squiggles and proper intellisense.

Shall I proceed to implement these changes?