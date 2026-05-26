// /lib/email-templates/working-group-added.ts

import { escapeHtml } from "@/lib/html";

interface WorkingGroupAddedEmailParams {
  recipientName: string;
  groupName: string;
  groupDescription?: string;
  forumUrl: string;
  addedByName: string;
}

export function generateWorkingGroupAddedEmail({
  recipientName,
  groupName,
  groupDescription,
  forumUrl,
  addedByName,
}: WorkingGroupAddedEmailParams): string {
  const safeName = escapeHtml(recipientName);
  const safeGroup = escapeHtml(groupName);
  const safeDescription = groupDescription ? escapeHtml(groupDescription) : "";
  const safeAddedBy = escapeHtml(addedByName);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been added to a working group</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 36px 30px; text-align: center;">
              <p style="margin: 0 0 8px; color: #d4af37; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">Irish Jazz Forum</p>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.3;">
                You've been added to a working group
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 30px;">
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.7;">
                Hi ${safeName},
              </p>
              <p style="margin: 0 0 24px; color: #1f2937; font-size: 16px; line-height: 1.7;">
                ${safeAddedBy} has added you to the <strong>${safeGroup}</strong> working group on the Irish Jazz Forum.
              </p>

              ${safeDescription ? `
              <div style="background-color: #f9fafb; border-left: 4px solid #d4af37; padding: 16px 20px; margin: 0 0 28px; border-radius: 4px;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">${safeDescription}</p>
              </div>
              ` : ""}

              <p style="margin: 0 0 28px; color: #1f2937; font-size: 16px; line-height: 1.7;">
                You now have access to the group's private forum threads, shared resources, and working documents.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${forumUrl}" style="display: inline-block; background-color: #d4af37; color: #1a1f2e; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                      Go to ${safeGroup} →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Questions? Reply to this email or contact <a href="mailto:hello@irishjazzforum.com" style="color: #d4af37; text-decoration: none;">hello@irishjazzforum.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Irish Jazz Forum. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateWorkingGroupAddedSubject(groupName: string): string {
  return `You've been added to the ${groupName} working group`;
}
