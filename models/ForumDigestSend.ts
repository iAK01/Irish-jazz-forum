import { Schema, model, models, Document, Types } from "mongoose";

export interface ForumDigestSend extends Document {
  userId: Types.ObjectId;
  digestType: "daily" | "weekly";
  digestKey: string;
  periodStart: Date;
  periodEnd: Date;
  threadCount: number;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ForumDigestSendSchema = new Schema<ForumDigestSend>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    digestType: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
      default: "weekly",
    },
    digestKey: {
      type: String,
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    threadCount: {
      type: Number,
      required: true,
      default: 0,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ForumDigestSendSchema.index(
  { userId: 1, digestType: 1, digestKey: 1 },
  { unique: true }
);

export const ForumDigestSendModel =
  models.ForumDigestSend ||
  model<ForumDigestSend>("ForumDigestSend", ForumDigestSendSchema);
