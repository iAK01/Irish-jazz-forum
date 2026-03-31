// /models/Discussionpost.ts

import { Schema, model, models, Document, Types } from "mongoose";
import { ReactionType } from "@/lib/reactions";

export interface FileAttachment {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
  storage: "gcs" | "drive";
  gcsFilename?: string;
  driveFileId?: string;
}

export interface DiscussionPost extends Document {
  threadId: Types.ObjectId;
  content: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
  editedBy?: Types.ObjectId;
  attachments: FileAttachment[];
  mentions: Types.ObjectId[];
  reactions: {
    userId: Types.ObjectId;
    type: ReactionType;
    createdAt: Date;
  }[];
  deleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
}

const FileAttachmentSchema = new Schema<FileAttachment>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    storage: { type: String, enum: ["gcs", "drive"] },
    gcsFilename: { type: String },
    driveFileId: { type: String },
  },
  { _id: false }
);

const PostReactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "agree", "thanks"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const DiscussionPostSchema = new Schema<DiscussionPost>(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "DiscussionThread",
      required: true,
      index: true,
    },
    content: { type: String, required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    editedAt: { type: Date },
    editedBy: { type: Schema.Types.ObjectId, ref: "User" },
    attachments: { type: [FileAttachmentSchema], default: [] },
    mentions: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    reactions: {
      type: [PostReactionSchema],
      default: [],
    },
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

DiscussionPostSchema.index({ threadId: 1, createdAt: 1 });
DiscussionPostSchema.index({ threadId: 1, deleted: 1, createdAt: 1 });

export const DiscussionPostModel =
  models.DiscussionPost ||
  model<DiscussionPost>("DiscussionPost", DiscussionPostSchema);
