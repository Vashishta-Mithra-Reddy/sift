import { db } from "@sift/db";
import { user as userTable } from "@sift/db/schema/auth";
import { eq } from "drizzle-orm";

export type UpdateProfileInput = {
    name?: string;
};

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  await db.update(userTable)
      .set({ 
          name: data.name,
          updatedAt: new Date() 
      })
      .where(eq(userTable.id, userId));
}
