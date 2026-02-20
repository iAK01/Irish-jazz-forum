// models/Publication.ts

import { Schema, model, models, Document, Types } from "mongoose";

export type PublicationCategory = "news" | "resource";
export type PublicationStatus = "draft" | "members_only" | "public";
export type ResourceType = "policy" | "data" | "guidance" | "statement" | "other";

export interface Publication extends Document {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: PublicationCategory;
  resourceType?: ResourceType;
  status: PublicationStatus;
  author: Types.ObjectId;
  tags: string[];
  images: string[]; // GCS public URLs
  attachments: {
    label: string;
    url: string;
  }[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PublicationSchema = new Schema<Publication>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ["news", "resource"],
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: ["policy", "data", "guidance", "statement", "other"],
    },
    status: {
      type: String,
      enum: ["draft", "members_only", "public"],
      default: "draft",
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String }],
    images: [{ type: String }],
    attachments: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

PublicationSchema.index({ category: 1, status: 1 });
PublicationSchema.index({ publishedAt: -1 });

export const PublicationModel =
  models.Publication || model<Publication>("Publication", PublicationSchema);