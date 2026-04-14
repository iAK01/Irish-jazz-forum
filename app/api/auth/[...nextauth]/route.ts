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
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const res = await fetch("https://api.eu.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from || "Irish Jazz Forum <onboarding@contact.irishjazzforum.com>",
            to: email,
            subject: "Sign in to Irish Jazz Forum",
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
              <h2 style="font-size:20px;font-weight:700;color:#111827;margin-bottom:8px">Sign in to Irish Jazz Forum</h2>
              <p style="color:#6b7280;margin-bottom:24px">Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display:inline-block;background:#4CBB5A;color:#fff;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px">Sign in</a>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
            </div>`,
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Resend EU API error ${res.status}: ${body}`);
        }
      },
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