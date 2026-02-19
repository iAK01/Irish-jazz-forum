// /app/api/auth/[...nextauth]/route.ts
// CORRECTED NextAuth v5 export

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";


const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: process.env.SMTP_FROM!,
    }),
  ],
  callbacks: {
    // REMOVE the signIn callback completely - let the adapter handle user creation
    async session({ session, user }) {
      await dbConnect();
      
      const dbUser = await UserModel.findOne({ email: session.user?.email });
      
      if (dbUser) {
        session.user.role = dbUser.role;
        session.user.id = dbUser._id.toString();
        session.user.memberProfile = dbUser.memberProfile;
      }
      
      return session;
    },
  },
});

export const { GET, POST } = handlers;
export { auth, signIn, signOut };

