import { Schema, model, models, Document, Types } from "mongoose";

export interface DiscussionThread extends Document {
  workingGroups: string[];

  // NEW: allow thread visibility outside the group
  publicToMembers: boolean;

  title: string;
  slug: string;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  lastReplyBy: Types.ObjectId | null;

  status: string;

  pinned: boolean;

  replyCount: number;
  viewCount: number;

  tags: string[];

  deleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
}

const DiscussionThreadSchema = new Schema<DiscussionThread>(
  {
    workingGroups: {
      type: [String],
      required: true,
      index: true,
    },

    // NEW FIELD
    publicToMembers: {
      type: Boolean,
      default: false,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

     lastReplyBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastActivityAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    status: {
      type: String,
      required: true,
      default: "active",
    },

    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    replyCount: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    tags: {
      type: [String],
      default: [],
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

DiscussionThreadSchema.index({ workingGroups: 1, lastActivityAt: -1 });
DiscussionThreadSchema.index({ workingGroups: 1, pinned: -1, lastActivityAt: -1 });

export const DiscussionThreadModel =
  models.DiscussionThread ||
  model<DiscussionThread>("DiscussionThread", DiscussionThreadSchema);