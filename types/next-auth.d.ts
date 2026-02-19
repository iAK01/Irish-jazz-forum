import { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: UserRole;
      memberProfile?: string;
    };
  }

  interface User {
    role: UserRole;
    memberProfile?: string;
  }
}