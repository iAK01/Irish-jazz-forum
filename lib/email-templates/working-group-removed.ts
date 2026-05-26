// /lib/email-templates/working-group-removed.ts

import { escapeHtml } from "@/lib/html";

interface WorkingGroupRemovedEmailParams {
  recipientName: string;
  groupName: string;
  senderName: string;
  forumUrl: string;
}

export function generateWorkingGroupRemovedEmail({
  recipientName,
  groupName,
  senderName,
  forumUrl,
}: WorkingGroupRemovedEmailParams): string {
  const safeName = escapeHtml(recipientName);
  const safeGroup = escapeHtml(groupName);
  const safeSender = escapeHtml(senderName);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Working group update</title>
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
                Working group update
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 30px;">
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.7;">
                Hi ${safeName},
              </p>
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.7;">
                We wanted to let you know that you've been removed from the <strong>${safeGroup}</strong> working group on the Irish Jazz Forum.
              </p>
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.7;">
                Any notes or contributions you've made will remain in the group — we're just taking you off the active roster.
              </p>
              <p style="margin: 0 0 32px; color: #1f2937; font-size: 16px; line-height: 1.7;">
                Thank you for everything you've contributed to this working group.
              </p>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px 24px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.7;">
                  If you think this was sent in error, please reach out to someone from the forum via the
                  <a href="${forumUrl}" style="color: #d4af37; text-decoration: none; font-weight: 600;">Irish Jazz Forum</a>.
                </p>
              </div>

              <p style="margin: 32px 0 0; color: #374151; font-size: 15px; line-height: 1.6;">
                — ${safeSender}
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

export function generateWorkingGroupRemovedSubject(groupName: string): string {
  return `You've been removed from the ${groupName} working group`;
}
