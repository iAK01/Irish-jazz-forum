interface MentionNotificationParams {
  mentionedName: string;
  mentionerName: string;
  threadTitle: string;
  threadUrl: string;
}

export function generateMentionNotificationEmail(
  params: MentionNotificationParams
): string {
  const { mentionedName, mentionerName, threadTitle, threadUrl } = params;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #1a2236; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #e4b95b; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">Irish Jazz Forum</h1>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">Hi ${mentionedName},</p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
          <strong>${mentionerName}</strong> mentioned you in a discussion on the Irish Jazz Forum platform.
        </p>
        <div style="background: #f9fafb; border-left: 4px solid #e4b95b; padding: 16px 20px; border-radius: 0 4px 4px 0; margin-bottom: 28px;">
          <p style="margin: 0; font-weight: 600; color: #1a2236; font-size: 15px;">${threadTitle}</p>
        </div>
        <a
          href="${threadUrl}"
          style="display: inline-block; background: #1a2236; color: #e4b95b; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;"
        >
          View Discussion →
        </a>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
          You are receiving this because you were mentioned in a post on the Irish Jazz Forum members platform.
          Please do not reply to this email.
        </p>
      </div>
    </div>
  `;
}

export function generateMentionNotificationSubject(
  mentionerName: string,
  threadTitle: string
): string {
  return `${mentionerName} mentioned you in "${threadTitle}"`;
}