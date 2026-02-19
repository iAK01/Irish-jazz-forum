import { auth } from "@/app/api/auth/[...nextauth]/route";
import { UserRole } from "@/models/User";
import { UserModel } from "@/models/User";
import dbConnect from "@/lib/mongodb";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const sessionUser = await getCurrentUser();
  
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }
  
  if (allowedRoles && !allowedRoles.includes(sessionUser.role)) {
    throw new Error("Forbidden");
  }
  
  // Fetch full user from database to get workingGroups and _id
  await dbConnect();
  const fullUser = await UserModel.findOne({ email: sessionUser.email }).lean() as any;
  
  if (!fullUser) {
    throw new Error("User not found in database");
  }
  
  return {
    ...sessionUser,
    _id: fullUser._id.toString(),
    workingGroups: fullUser.workingGroups || [],
  };
}