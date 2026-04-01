import { ForumDigestPayload } from "@/lib/forumDigest";

function formatDigestDate(date: Date) {
  return new Date(date).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLastActivity(date: Date) {
  return new Date(date).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateForumDigestSubject(payload: ForumDigestPayload) {
  return `Your ${payload.cadence} IJF forum digest: ${payload.threadCount} active thread${
    payload.threadCount === 1 ? "" : "s"
  }`;
}

export function generateForumDigestEmail(payload: ForumDigestPayload) {
  const periodLabel = `${formatDigestDate(payload.periodStart)} to ${formatDigestDate(
    payload.periodEnd
  )}`;
  const logoUrl = `${payload.forumUrl.replace(/\/dashboard\/forum$/, "")}/images/IJF_Logo.png`;
  const cadenceLabel = payload.cadence === "daily" ? "Daily" : "Weekly";

  const sectionsHtml = payload.sections
    .map((section) => {
      const threadsHtml = section.threads
        .map(
          (thread) => `
            <tr>
              <td style="padding: 0 0 18px;">
                <a href="${thread.url}" style="color: #1a2236; font-size: 16px; font-weight: 700; text-decoration: none;">
                  ${thread.title}
                </a>
                <div style="margin-top: 6px; font-size: 13px; color: #6b7280; line-height: 1.6;">
                  Latest post${thread.latestPosterName ? ` by ${thread.latestPosterName}` : ""}: ${formatLastActivity(thread.lastActivityAt)} · ${thread.replyCount} repl${
                    thread.replyCount === 1 ? "y" : "ies"
                  }${thread.publicToMembers ? " · Shared with all members" : ""}
                </div>
                ${
                  thread.newResponsesSinceUserPosted > 0
                    ? `<div style="margin-top: 6px; font-size: 13px; color: #1a2236; font-weight: 600;">
                        ${thread.newResponsesSinceUserPosted} new repl${
                          thread.newResponsesSinceUserPosted === 1 ? "y" : "ies"
                        } since you last posted
                      </div>`
                    : ""
                }
              </td>
            </tr>
          `
        )
        .join("");

      return `
        <div style="margin: 0 0 28px;">
          <h2 style="margin: 0 0 14px; font-size: 18px; color: #1a2236;">
            ${section.name}
          </h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${threadsHtml}
          </table>
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #1a2236; padding: 24px 32px; border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 16px;">
        <img
          src="${logoUrl}"
          alt="Irish Jazz Forum"
          style="width: 52px; height: 52px; object-fit: contain; background: white; border-radius: 10px; padding: 6px;"
        />
        <div>
          <h1 style="color: #e4b95b; margin: 0; font-size: 22px; font-weight: 700;">
            Irish Jazz Forum
          </h1>
          <p style="margin: 4px 0 0; color: #d1d5db; font-size: 13px;">
            ${cadenceLabel} discussion digest
          </p>
        </div>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6;">Hi ${payload.userName},</p>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
          Here is your ${payload.cadence} forum digest for <strong>${periodLabel}</strong>.
        </p>
        <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.6; color: #374151;">
          These are the conversations that moved ${
            payload.cadence === "daily" ? "today" : "this week"
          } and are most worth jumping back into.
        </p>
        <div style="background: #f9fafb; border-left: 4px solid #e4b95b; padding: 16px 20px; border-radius: 0 4px 4px 0; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 15px; color: #1a2236;">
            ${payload.threadCount} thread${payload.threadCount === 1 ? "" : "s"} with new activity
          </p>
        </div>

        ${sectionsHtml}

        <div style="margin: 32px 0 24px;">
          <a
            href="${payload.forumUrl}"
            style="display: inline-block; background: #1a2236; color: #e4b95b; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 12px;"
          >
            Open Forum
          </a>
          <a
            href="${payload.manageSettingsUrl}"
            style="display: inline-block; background: #ffffff; color: #1a2236; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: 600; font-size: 14px; border: 1px solid #d1d5db;"
          >
            Manage Digest Settings
          </a>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
          You are receiving this email because ${payload.cadence} forum digests are enabled on your IJF account.
        </p>
      </div>
    </div>
  `;
}
