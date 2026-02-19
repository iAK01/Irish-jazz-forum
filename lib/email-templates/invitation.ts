// /lib/email-templates/invitation.ts

interface InvitationEmailParams {
  recipientName?: string;
  inviterName: string;
  invitationLink: string;
  expiryDate: string;
  personalMessage?: string;
}

export function generateInvitationEmail({
  recipientName,
  inviterName,
  invitationLink,
  expiryDate,
  personalMessage,
}: InvitationEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join the Irish Jazz Forum</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                You're Invited to Join
              </h1>
              <p style="margin: 10px 0 0 0; color: #cbd5e0; font-size: 18px;">
                Irish Jazz Forum
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${recipientName ? `<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">Hi ${recipientName},</p>` : ''}
              
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join the Irish Jazz Forum, Ireland's collaborative platform for the jazz community.
              </p>

              ${personalMessage ? `
              <div style="background-color: #f9fafb; border-left: 4px solid #d4af37; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; font-style: italic;">
                  "${personalMessage}"
                </p>
              </div>
              ` : ''}

              <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                As a member, you'll be able to:
              </p>

              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #1f2937; font-size: 16px; line-height: 1.8;">
                <li>Create and manage your professional profile</li>
                <li>Connect with other artists, venues, and organizations</li>
                <li>Participate in forum discussions and working groups</li>
                <li>Access resources and opportunities</li>
                <li>Contribute to shaping Ireland's jazz ecosystem</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${invitationLink}" style="display: inline-block; background-color: #d4af37; color: #1a1f2e; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This invitation expires on <strong>${expiryDate}</strong>
              </p>

              <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${invitationLink}" style="color: #d4af37; word-break: break-all;">${invitationLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Questions? Contact us at <a href="mailto:info@irishjazzforum.ie" style="color: #d4af37; text-decoration: none;">info@irishjazzforum.ie</a>
              </p>
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

export function generateInvitationSubject(inviterName: string): string {
  return `${inviterName} invited you to join the Irish Jazz Forum`;
}