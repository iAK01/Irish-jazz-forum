// /types/invitation.ts

import { InvitationStatus } from "@/models/Invitation";

export interface InvitationCreateRequest {
  email: string;
  message?: string;
  expiryDays?: number; // 7, 14, or 30 days
}

export interface InvitationCreateResponse {
  success: boolean;
  data?: {
    id: string;
    token: string;
    email: string;
    expiresAt: string;
  };
  error?: string;
}

export interface InvitationValidateRequest {
  token: string;
}

export interface InvitationValidateResponse {
  success: boolean;
  data?: {
    email: string;
    message?: string;
    invitedBy: {
      name: string;
    };
  };
  error?: string;
}

export interface InvitationListItem {
  _id: string;
  email: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  invitedBy: {
    name: string;
    email: string;
  };
  memberCreated?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface InvitationListResponse {
  success: boolean;
  data?: InvitationListItem[];
  error?: string;
}