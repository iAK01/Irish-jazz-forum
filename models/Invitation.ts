// /models/Invitation.ts

import { Schema, model, models, Document, Types } from "mongoose";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked" | "completed";

export interface Invitation extends Document {
  // Token & Email
  token: string; // Unique secure token
  email: string; // Email address invited
  
  // Tracking
  invitedBy: Types.ObjectId; // Reference to User (admin who sent invitation)
  status: InvitationStatus;
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date; // When member clicked link and completed signup
  
  // Relationship
  memberCreated?: Types.ObjectId; // Reference to Member created from this invitation
  
  // Optional
  message?: string; // Personal message from inviter
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
  },
  {
    timestamps: true,
  }
);

// Compound index for checking active invitations
InvitationSchema.index({ email: 1, status: 1 });

// Index for finding expired invitations
InvitationSchema.index({ expiresAt: 1, status: 1 });

export const InvitationModel =
  models.Invitation || model<Invitation>("Invitation", InvitationSchema);