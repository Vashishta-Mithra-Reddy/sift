import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import * as auth from "../schema/auth";
import * as src from "../schema/sources";
import * as sft from "../schema/sifts";
import * as ech from "../schema/echoes";

export type User = InferSelectModel<typeof auth.user>;
export type NewUser = InferInsertModel<typeof auth.user>;

export type Session = InferSelectModel<typeof auth.session>;
export type NewSession = InferInsertModel<typeof auth.session>;

export type Account = InferSelectModel<typeof auth.account>;
export type NewAccount = InferInsertModel<typeof auth.account>;

export type Verification = InferSelectModel<typeof auth.verification>;
export type NewVerification = InferInsertModel<typeof auth.verification>;

export type Source = InferSelectModel<typeof src.sources>;
export type NewSource = InferInsertModel<typeof src.sources>;
export type SourceType = typeof src.sourceTypeEnum.enumValues[number];

export type Sift = InferSelectModel<typeof sft.sifts>;
export type NewSift = InferInsertModel<typeof sft.sifts>;
export type SiftStatus = typeof sft.siftStatusEnum.enumValues[number];

export type Question = InferSelectModel<typeof sft.questions>;
export type NewQuestion = InferInsertModel<typeof sft.questions>;

export type Echo = InferSelectModel<typeof ech.echoes>;
export type NewEcho = InferInsertModel<typeof ech.echoes>;

export type SiftWithSource = Sift & { source: Source };
export type SiftWithQuestions = Sift & { questions: Question[]; source: Source | null };
export type SourceWithSifts = Source & { sifts: Sift[] };


