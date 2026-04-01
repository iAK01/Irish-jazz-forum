import { Schema, model, models, Document } from "mongoose";

export type UserRole = 
  | "public" 
  | "member" 
  | "working_group"
  | "steering" 
  | "admin" 
  | "team"
  | "super_admin";

export type ForumDigestPreference = "off" | "daily" | "weekly";

export interface User extends Document {
  email: string;
  name: string;
  image?: string;
  googleId?: string; // Optional — magic link users don't have one
  emailVerified?: Date;
  role: UserRole;
  memberProfile?: string; // slug of their Member document
  workingGroups?: string[];
  forumDigest?: ForumDigestPreference;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: String,
    googleId: { type: String, sparse: true, unique: true }, // sparse = allows multiple nulls
    emailVerified: { type: Date },
    lastSeenAt: { type: Date, default: null },
    role: {
      type: String,
      enum: ["public", "member", "working_group", "steering", "admin", "super_admin", "team"],
      default: "public",
    },
    memberProfile: String, // slug of the linked Member document
    workingGroups: [String],
    forumDigest: {
      type: String,
      enum: ["off", "daily", "weekly"],
      default: "weekly",
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = models.User || model<User>("User", UserSchema);
