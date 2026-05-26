// /lib/email-templates/complete-profile.ts

interface CompleteProfileEmailParams {
  memberName: string;
  profileLink: string;
  missingItems?: string[];
}

export function generateCompleteProfileEmail({
  memberName,
  profileLink,
  missingItems = [],
}: CompleteProfileEmailParams): string {
  const hasMissing = missingItems.length > 0;

  const missingListHtml = hasMissing
    ? `
    <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
      To make the most of your listing, here's what's still needed:
    </p>
    <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.9;">
      ${missingItems.map((item) => `<li>${item}</li>`).join("")}
    </ul>`
    : `
    <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
      A complete profile helps the wider Irish jazz community discover your work and connect with you.
    </p>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete your Irish Jazz Forum profile</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 40px 30px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #d4af37; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">Irish Jazz Forum</p>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; line-height: 1.3;">
                Your profile needs a little attention
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Hi there,
              </p>

              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                This is an automated reminder that the profile for <strong>${memberName}</strong> on the Irish Jazz Forum is incomplete.
              </p>

              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                The member directory is publicly accessible at <a href="https://www.irishjazzforum.com/members" style="color: #d4af37; text-decoration: none;">irishjazzforum.com/members</a> — anyone can browse and discover members, so a strong profile makes a real difference to how your organisation is presented to the public.
              </p>

              ${missingListHtml}

              <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                A complete profile with a logo and cover image makes a much stronger impression in the directory.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${profileLink}" style="display: inline-block; background-color: #d4af37; color: #1a1f2e; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      Complete Your Profile →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${profileLink}" style="color: #d4af37; word-break: break-all;">${profileLink}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 28px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                Questions? <a href="mailto:hello@irishjazzforum.com" style="color: #d4af37; text-decoration: none;">hello@irishjazzforum.com</a>
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

export function generateCompleteProfileSubject(memberName: string): string {
  return `Action needed: complete your Irish Jazz Forum profile — ${memberName}`;
}
