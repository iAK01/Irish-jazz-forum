// /lib/email-templates/member-approved.ts

interface MemberApprovedEmailParams {
  memberName: string;
  dashboardLink: string;
}

export function generateMemberApprovedEmail({
  memberName,
  dashboardLink,
}: MemberApprovedEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to the Irish Jazz Forum</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to the Irish Jazz Forum! 🎷</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">Hi ${memberName},</p>
              
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Great news! Your membership has been approved. You now have full access to the Irish Jazz Forum.
              </p>

              <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Here's what you can do now:
              </p>

              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #1f2937; font-size: 16px; line-height: 1.8;">
                <li>Complete and update your member profile</li>
                <li>Browse the member directory and connect with others</li>
                <li>Join working groups aligned with your interests</li>
                <li>Participate in forum discussions</li>
                <li>Access resources and opportunities</li>
              </ul>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${dashboardLink}" style="display: inline-block; background-color: #d4af37; color: #1a1f2e; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                If you have any questions or need assistance, don't hesitate to reach out.
              </p>
            </td>
          </tr>

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

export function generateMemberApprovedSubject(): string {
  return 'Welcome to the Irish Jazz Forum - Your membership is approved!';
}