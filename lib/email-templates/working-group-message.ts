import { escapeHtml } from "@/lib/html";

interface WorkingGroupMessageEmailParams {
  senderName: string;
  groupName: string;
  message: string;
  forumUrl?: string;
  driveUrl?: string;
}

export function generateWorkingGroupMessageEmail({
  senderName,
  groupName,
  message,
  forumUrl,
  driveUrl,
}: WorkingGroupMessageEmailParams) {
  const safeSenderName = escapeHtml(senderName);
  const safeGroupName = escapeHtml(groupName);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  return `
    <div style="margin:0;padding:24px;background:#f7f5ef;font-family:Georgia,'Times New Roman',serif;color:#18181b;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;overflow:hidden;">
        <div style="padding:32px 32px 20px;background:linear-gradient(135deg,#faf7ef 0%,#ffffff 100%);border-bottom:1px solid #f0ebe0;">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#a16207;font-weight:700;">
            Working Group Message
          </p>
          <h1 style="margin:0;font-size:30px;line-height:1.1;color:#18181b;">
            ${safeGroupName}
          </h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#52525b;">
            ${safeSenderName} has sent a message to this working group through the Irish Jazz Forum.
          </p>
        </div>

        <div style="padding:28px 32px;">
          <div style="padding:20px 22px;border:1px solid #e7e5e4;border-radius:16px;background:#fafaf9;font-size:16px;line-height:1.75;color:#27272a;">
            ${safeMessage}
          </div>

          ${(forumUrl || driveUrl)
            ? `
              <div style="margin-top:24px;padding-top:24px;border-top:1px solid #f1f5f9;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                  Useful links
                </p>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                  ${forumUrl
                    ? `<a href="${forumUrl}" style="display:inline-block;padding:12px 16px;border-radius:12px;background:#18181b;color:#ffffff;text-decoration:none;font-weight:700;">Open working group forum</a>`
                    : ""}
                  ${driveUrl
                    ? `<a href="${driveUrl}" style="display:inline-block;padding:12px 16px;border-radius:12px;background:#faf7ef;color:#92400e;text-decoration:none;font-weight:700;border:1px solid #f3d28b;">Open shared Drive folder</a>`
                    : ""}
                </div>
              </div>
            `
            : ""}
        </div>

        <div style="padding:18px 32px 28px;color:#71717a;font-size:13px;line-height:1.6;">
          You are receiving this because you are part of the <strong>${safeGroupName}</strong> working group on the Irish Jazz Forum.
        </div>
      </div>
    </div>
  `;
}
