import { Schema, model, models, Document, Types } from "mongoose";

export interface FileAttachment {
  filename: string;
  url: string; // Google Cloud Storage URL
  mimetype: string;
  size: number; // in bytes
  uploadedAt: Date;
  storage: 'gcs' | 'drive';  // ADD THIS
  gcsFilename?: string;      // ADD THIS
  driveFileId?: string;      // ADD THIS
}

export interface DiscussionPost extends Document {
  // Thread reference
  threadId: Types.ObjectId; // Reference to DiscussionThread
  
  // Content
  content: string; // Rich text HTML from react-quill
  
  // Author
  createdBy: Types.ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
  
  // Edit tracking
  editedAt?: Date;
  editedBy?: Types.ObjectId; // Reference to User who edited
  
  // File attachments (stored in Google Cloud Storage)
  attachments: FileAttachment[];
  
  // Soft deletion
  deleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
}

const FileAttachmentSchema = new Schema<FileAttachment>(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    storage: {
  type: String,
  enum: ['gcs', 'drive'],
},
gcsFilename: {
  type: String,
},
driveFileId: {
  type: String,
},
  },
  { _id: false } // Don't create _id for subdocuments
);

const DiscussionPostSchema = new Schema<DiscussionPost>(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "DiscussionThread",
      required: true,
      index: true, // Index for querying posts by thread
    },
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for querying posts by author
    },
    editedAt: {
      type: Date,
    },
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    attachments: {
      type: [FileAttachmentSchema],
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

// Compound index for querying posts within a thread, chronologically
DiscussionPostSchema.index({ threadId: 1, createdAt: 1 });

// Compound index for filtering out deleted posts efficiently
DiscussionPostSchema.index({ threadId: 1, deleted: 1, createdAt: 1 });

export const DiscussionPostModel =
  models.DiscussionPost || model<DiscussionPost>("DiscussionPost", DiscussionPostSchema);