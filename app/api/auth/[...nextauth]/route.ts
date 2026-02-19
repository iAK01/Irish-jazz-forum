// /app/api/auth/[...nextauth]/route.ts

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
    async session({ session, user }) {
      await dbConnect();

      const dbUser = await UserModel.findOne({ email: session.user?.email });

      if (dbUser) {
        session.user.role = dbUser.role;
        session.user.id = dbUser._id.toString();
        session.user.memberProfile = dbUser.memberProfile;
        // Ensure name from our UserModel is always used (magic link users
        // may have updated their name during onboarding)
        if (dbUser.name) {
          session.user.name = dbUser.name;
        }
      }

      return session;
    },
  },
});

export const { GET, POST } = handlers;
export { auth, signIn, signOut };