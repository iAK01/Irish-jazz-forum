import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { InvitationModel } from "@/models/Invitation";

const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  pages: {
    signIn: "/signin",
  },
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
    async signIn({ user }) {
      await dbConnect();

      // Allow existing users always
      const existingUser = await UserModel.findOne({ email: user.email });
      if (existingUser) return true;

      // Allow first-time sign-in only if a valid unused invitation exists for this email
      const validInvitation = await InvitationModel.findOne({
        email: user.email,
        status: "pending",
        expiresAt: { $gt: new Date() },
      });
      if (validInvitation) return true;

      // Everyone else is blocked — no user record created, no session granted
      return false;
    },

    async session({ session, user }) {
      await dbConnect();

      const dbUser = await UserModel.findOne({ email: session.user?.email });

      if (dbUser) {
        session.user.role = dbUser.role;
        session.user.id = dbUser._id.toString();
        session.user.memberProfile = dbUser.memberProfile;
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