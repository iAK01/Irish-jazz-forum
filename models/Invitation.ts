// /models/Invitation.ts

import { Schema, model, models, Document, Types } from "mongoose";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked" | "completed";
export type InvitationType = "new_member" | "join_member";
export type InvitationActivityType = "resend" | "followup";

export interface InvitationActivity {
  type: InvitationActivityType;
  sentAt: Date;
  sentByName: string;
  subject?: string; // only for followup
}

export interface Invitation extends Document {
  token: string;
  email: string;
  invitedBy: Types.ObjectId;
  status: InvitationStatus;
  invitationType: InvitationType; // new_member = create org profile, join_member = attach to existing org
  memberSlug?: string;            // only set for join_member invitations
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  memberCreated?: Types.ObjectId;
  message?: string;
  activity: InvitationActivity[];
}

const InvitationSchema = new Schema<Invitation>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked", "completed"],
      default: "pending",
      index: true,
    },
    invitationType: {
      type: String,
      enum: ["new_member", "join_member"],
      default: "new_member",
    },
    memberSlug: {
      type: String, // slug of existing Member — only used for join_member
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
    },
    memberCreated: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    message: {
      type: String,
    },
    activity: [
      {
        type: { type: String, enum: ["resend", "followup"], required: true },
        sentAt: { type: Date, required: true, default: Date.now },
        sentByName: { type: String, required: true },
        subject: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

InvitationSchema.index({ email: 1, status: 1 });
InvitationSchema.index({ expiresAt: 1, status: 1 });

export const InvitationModel =
  models.Invitation || model<Invitation>("Invitation", InvitationSchema);