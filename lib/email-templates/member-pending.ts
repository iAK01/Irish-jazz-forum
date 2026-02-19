// /lib/email-templates/member-pending.ts

interface MemberPendingEmailParams {
  adminName: string;
  memberName: string;
  memberEmail: string;
  memberType: string;
  reviewLink: string;
}

export function generateMemberPendingEmail({
  adminName,
  memberName,
  memberEmail,
  memberType,
  reviewLink,
}: MemberPendingEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Member Awaiting Approval</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">New Member Pending Approval</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px;">Hi ${adminName},</p>
              
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px;">
                A new member has completed their profile and is awaiting approval:
              </p>

              <div style="background-color: #f9fafb; padding: 20px; margin: 0 0 30px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px;">
                  <strong>Name:</strong> ${memberName}
                </p>
                <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px;">
                  <strong>Email:</strong> ${memberEmail}
                </p>
                <p style="margin: 0; color: #374151; font-size: 15px;">
                  <strong>Type:</strong> ${memberType}
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${reviewLink}" style="display: inline-block; background-color: #d4af37; color: #1a1f2e; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Review Profile
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                This is an automated notification from the Irish Jazz Forum admin system.
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

export function generateMemberPendingSubject(memberName: string): string {
  return `New member pending approval: ${memberName}`;
}