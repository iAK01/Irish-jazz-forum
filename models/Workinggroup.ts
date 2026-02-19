import { Schema, model, models, Document, Types } from "mongoose";

export interface WorkingGroup extends Document {
  // Identity
  name: string;
  slug: string; // URL-friendly, unique
  description: string;
  
  // Leadership & Members
  coordinator: Types.ObjectId; // Reference to User
  members: Types.ObjectId[]; // References to Users
  
  // Visibility
  isPrivate: boolean; // Only members + steering/admin can see
  
  // Google Drive Integration
  googleDriveFolderId?: string; // The group's Google Drive folder ID
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId; // Reference to User (admin who created it)
  isActive: boolean; // Can be disabled without deleting

    // Soft deletion
  deleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
}

const WorkingGroupSchema = new Schema<WorkingGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Index for URL lookups
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    coordinator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for querying groups by coordinator
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
      index: true, // Index for querying users' groups
    },
    isPrivate: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering private/public groups
    },
    googleDriveFolderId: {
      type: String,
      sparse: true, // Allow null, but index non-null values
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for filtering active groups
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

// Compound index for active public groups
WorkingGroupSchema.index({ isActive: 1, isPrivate: 1 });

export const WorkingGroupModel =
  models.WorkingGroup || model<WorkingGroup>("WorkingGroup", WorkingGroupSchema);