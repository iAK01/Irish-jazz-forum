import { Schema, model, models, Document } from "mongoose";

export type UserRole = 
  | "public" 
  | "member" 
  | "working_group"
  | "steering" 
  | "admin" 
  | "team"
  | "super_admin";

export interface User extends Document {
  email: string;
  name: string;
  image?: string;
  googleId: string;
  role: UserRole;
  memberProfile?: string;
  workingGroups?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: String,
    googleId: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["public", "member", "working_group", "steering", "admin", "super_admin", "team"],
      default: "public",
    },
    memberProfile: String,
    workingGroups: [String],
  },
  {
    timestamps: true,
  }
);

export const UserModel = models.User || model<User>("User", UserSchema);