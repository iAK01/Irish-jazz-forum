import { Schema, model, models, Document, Types } from "mongoose";

export interface DiscussionThread extends Document {
  // Organization - can belong to multiple working groups
  workingGroups: string[];
  
  // Content
  title: string;
  slug: string; // URL-friendly version of title
  
  // Metadata
  createdBy: Types.ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date; // For sorting by recent activity
  
  // Status - dynamic, not hardcoded (e.g., "active", "resolved", "archived", "stalled", "abandoned")
  status: string;
  
  // Flags
  pinned: boolean;
  
  // Stats
  replyCount: number;
  viewCount: number;
  
  // Tags (optional)
  tags: string[];
  
    // Soft delete
  deleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
}

const DiscussionThreadSchema = new Schema<DiscussionThread>(
  {
    workingGroups: {
      type: [String],
      required: true,
      index: true, // Index for querying threads by working group
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
      index: true, // Index for URL lookups
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastActivityAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true, // Index for sorting by recent activity
    },
    status: {
      type: String,
      required: true,
      default: "active",
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering pinned threads
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
  ref: 'User',
  default: null,
},
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index for querying threads within a working group, sorted by activity
DiscussionThreadSchema.index({ workingGroups: 1, lastActivityAt: -1 });

// Compound index for pinned threads within a working group
DiscussionThreadSchema.index({ workingGroups: 1, pinned: -1, lastActivityAt: -1 });

export const DiscussionThreadModel =
  models.DiscussionThread || model<DiscussionThread>("DiscussionThread", DiscussionThreadSchema);