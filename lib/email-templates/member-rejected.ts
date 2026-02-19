// /lib/email-templates/member-rejected.ts

interface MemberRejectedEmailParams {
  memberName: string;
  reason?: string;
}

export function generateMemberRejectedEmail({
  memberName,
  reason,
}: MemberRejectedEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Irish Jazz Forum Membership Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Irish Jazz Forum Membership Update</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">Hi ${memberName},</p>
              
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in joining the Irish Jazz Forum.
              </p>

              <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                After reviewing your application, we're unable to approve your membership at this time.
              </p>

              ${reason ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                  <strong>Reason:</strong> ${reason}
                </p>
              </div>
              ` : ''}

              <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                If you believe this decision was made in error or would like more information, please don't hesitate to contact us. We're happy to discuss this further.
              </p>

              <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>The Irish Jazz Forum Team</strong>
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

export function generateMemberRejectedSubject(): string {
  return 'Irish Jazz Forum Membership Update';
}