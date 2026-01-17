import { updateProfile as dbUpdateProfile, type UpdateProfileInput } from "@sift/db/queries/users";
import { auth } from "../index"; 

export async function updateUserDetails(
  data: UpdateProfileInput, 
  headers: Headers 
) {
  
  const session = await auth.api.getSession({
    headers: headers
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await dbUpdateProfile(session.user.id, data);
}