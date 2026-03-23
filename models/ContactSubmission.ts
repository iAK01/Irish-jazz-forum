import { Schema, model, models, Document, Types } from "mongoose";

export interface ContactAttachment {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

export interface ContactReply {
  body: string;
  from: string;
  createdAt: Date;
}

export interface ContactSubmission extends Document {
  name: string;
  email: string;
  organization?: string;
  inquiryType: string;
  message: string;
  attachment?: ContactAttachment;
  status: "new" | "in-progress" | "resolved";
  assignedTo?: Types.ObjectId;
  response?: string;
  respondedAt?: Date;
  respondedBy?: Types.ObjectId;
  replies: ContactReply[];
  archived: boolean;
  archivedAt?: Date;
  archivedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContactAttachmentSchema = new Schema<ContactAttachment>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const ContactReplySchema = new Schema<ContactReply>(
  {
    body: { type: String, required: true },
    from: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ContactSubmissionSchema = new Schema<ContactSubmission>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    organization: { type: String, trim: true },
    inquiryType: {
      type: String,
      required: true,
      enum: [
        "I want to join the Irish Jazz Forum",
        "Media inquiry",
        "Partnership opportunity",
        "Event/Festival collaboration",
        "General question",
        "Technical issue",
        "Other",
      ],
    },
    message: { type: String, required: true },
    attachment: ContactAttachmentSchema,
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    response: { type: String },
    respondedAt: { type: Date },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
    replies: { type: [ContactReplySchema], default: [] },
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date },
    archivedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ContactSubmissionSchema.index({ archived: 1, status: 1, createdAt: -1 });
ContactSubmissionSchema.index({ inquiryType: 1, createdAt: -1 });

export const ContactSubmissionModel =
  models.ContactSubmission ||
  model<ContactSubmission>("ContactSubmission", ContactSubmissionSchema);