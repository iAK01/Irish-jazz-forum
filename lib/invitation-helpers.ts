// /lib/invitation-helpers.ts

import crypto from "crypto";
import { InvitationModel } from "@/models/Invitation";

/**
 * Generate a secure random token for invitation
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Check if an invitation token is valid
 */
export async function validateInvitationToken(token: string): Promise<{
  valid: boolean;
  invitation?: any;
  error?: string;
}> {
  try {
    const invitation = await InvitationModel.findOne({ token })
      .populate("invitedBy", "name email")
      .lean() as any;

    if (!invitation) {
      return { valid: false, error: "Invalid invitation token" };
    }

    // Check if already used
    if (invitation.status === "accepted" || invitation.status === "completed") {
      return { valid: false, error: "This invitation has already been used" };
    }

    // Check if revoked
    if (invitation.status === "revoked") {
      return { valid: false, error: "This invitation has been revoked" };
    }

    // Check if expired
    if (new Date() > new Date(invitation.expiresAt)) {
      // Auto-update status to expired
      await InvitationModel.findByIdAndUpdate(invitation._id, {
        status: "expired",
      });
      return { valid: false, error: "This invitation has expired" };
    }

    return { valid: true, invitation };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Mark invitation as used (accepted)
 */
export async function markInvitationUsed(
  token: string,
  memberCreatedId: string
): Promise<boolean> {
  try {
    await InvitationModel.findOneAndUpdate(
      { token },
      {
        status: "accepted",
        usedAt: new Date(),
        memberCreated: memberCreatedId,
      }
    );
    return true;
  } catch (error) {
    console.error("Failed to mark invitation as used:", error);
    return false;
  }
}

/**
 * Check if invitation is expired
 */
export function checkInvitationExpiry(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Check if email already has a pending invitation
 */
export async function hasPendingInvitation(email: string): Promise<boolean> {
  try {
    const invitation = await InvitationModel.findOne({
      email: email.toLowerCase(),
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
    return !!invitation;
  } catch (error) {
    return false;
  }
}

/**
 * Calculate expiry date from days
 */
export function calculateExpiryDate(days: number = 30): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}