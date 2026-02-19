// /models/ContactSubmission.ts

import { Schema, model, models, Document, Types } from "mongoose";

export interface ContactAttachment {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

export interface ContactSubmission extends Document {
  // Submitter info
  name: string;
  email: string;
  organization?: string;
  
  // Inquiry details
  inquiryType: string;
  message: string;
  attachment?: ContactAttachment;
  
  // Status tracking
  status: 'new' | 'in-progress' | 'resolved';
  assignedTo?: Types.ObjectId; // Reference to User (admin)
  
  // Response
  response?: string;
  respondedAt?: Date;
  respondedBy?: Types.ObjectId; // Reference to User
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ContactAttachmentSchema = new Schema<ContactAttachment>(
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
  },
  { _id: false }
);

const ContactSubmissionSchema = new Schema<ContactSubmission>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    inquiryType: {
      type: String,
      required: true,
      enum: [
        'I want to join the Irish Jazz Forum',
        'Media inquiry',
        'Partnership opportunity',
        'Event/Festival collaboration',
        'General question',
        'Technical issue',
        'Other',
      ],
    },
    message: {
      type: String,
      required: true,
    },
    attachment: {
      type: ContactAttachmentSchema,
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved'],
      default: 'new',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    response: {
      type: String,
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying by status and date
ContactSubmissionSchema.index({ status: 1, createdAt: -1 });

// Index for querying by inquiry type
ContactSubmissionSchema.index({ inquiryType: 1, createdAt: -1 });

export const ContactSubmissionModel =
  models.ContactSubmission || model<ContactSubmission>('ContactSubmission', ContactSubmissionSchema);