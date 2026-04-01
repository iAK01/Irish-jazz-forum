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

function getGreetingName(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "there";
  }

  return trimmed.split(/\s+/)[0] || trimmed;
}

export function generateForumDigestSubject(payload: ForumDigestPayload) {
  const cadenceWindowLabel = payload.cadence === "daily" ? "day" : "week";

  if (payload.threadCount === 0) {
    return payload.emptyState === "coordinator"
      ? `Your groups were quiet this ${cadenceWindowLabel}`
      : `Your ${payload.cadence} IJF forum digest: a quiet ${cadenceWindowLabel}`;
  }

  return `Your ${payload.cadence} IJF forum digest: ${payload.threadCount} active thread${
    payload.threadCount === 1 ? "" : "s"
  }`;
}

function renderButton(href: string, label: string, variant: "primary" | "secondary" = "primary") {
  const styles =
    variant === "primary"
      ? "display: inline-block; background: #1a2236; color: #e4b95b; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 12px;"
      : "display: inline-block; background: #ffffff; color: #1a2236; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: 600; font-size: 14px; border: 1px solid #d1d5db;";

  return `<a href="${href}" style="${styles}">${label}</a>`;
}

function renderList(items: string[]) {
  return `
    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
      ${items.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join("")}
    </ul>
  `;
}

function renderMemberEmptyState(payload: ForumDigestPayload, periodLabel: string) {
  const cadenceWindowLabel = payload.cadence === "daily" ? "day" : "week";
  const assignedGroupsLabel = payload.assignedGroups.length
    ? payload.assignedGroups.map((group) => group.name).join(", ")
    : null;
  const namedCoordinatorPrompt = payload.assignedGroups.length
    ? payload.assignedGroups
        .filter((group) => group.coordinatorName)
        .slice(0, 3)
        .map(
          (group) =>
            `${group.coordinatorName} for ${group.name}`
        )
        .join(", ")
    : "";

  return `
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
      It has been a quiet ${cadenceWindowLabel} on the forum for <strong>${periodLabel}</strong>.
    </p>
    <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.6; color: #374151;">
      There has not been any new activity in the general forum or in the working groups you can access, but this can be a good moment to get a conversation moving.
    </p>
    <div style="background: #f9fafb; border-left: 4px solid #e4b95b; padding: 16px 20px; border-radius: 0 4px 4px 0; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; font-size: 15px; color: #1a2236; font-weight: 700;">
        Ways to get things started
      </p>
      ${renderList([
        "Post a short question in one of your working groups.",
        "Share a small update, idea, or challenge from your area of work.",
        "Mention someone who may have a useful perspective to bring in.",
      ])}
    </div>
    ${
      assignedGroupsLabel
        ? `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
            You currently have access to: <strong>${assignedGroupsLabel}</strong>.
          </p>`
        : ""
    }
    ${
      namedCoordinatorPrompt
        ? `<p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #374151;">
            If you are not sure where to begin, you can contact the coordinators of your groups directly: <strong>${namedCoordinatorPrompt}</strong>.
          </p>`
        : ""
    }
    <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #374151;">
      A single well-placed question is often enough to bring people back in.
    </p>
    <div style="margin: 32px 0 24px;">
      ${renderButton(payload.forumUrl, "Start a Discussion")}
      ${renderButton(payload.manageSettingsUrl, "Manage Digest Settings", "secondary")}
    </div>
  `;
}

function renderCoordinatorEmptyState(payload: ForumDigestPayload, periodLabel: string) {
  const cadenceWindowLabel = payload.cadence === "daily" ? "day" : "week";
  const coordinatorGroupNames = payload.coordinatorGroups.map((group) => group.name);

  return `
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
      There has been no new forum activity in the groups you coordinate during <strong>${periodLabel}</strong>.
    </p>
    <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.6; color: #374151;">
      As coordinator, you are the person best placed to restart momentum. A short question, update, or invitation to respond can often be enough to reopen discussion.
    </p>
    <div style="background: #f9fafb; border-left: 4px solid #e4b95b; padding: 16px 20px; border-radius: 0 4px 4px 0; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; font-size: 15px; color: #1a2236; font-weight: 700;">
        You coordinate
      </p>
      ${renderList(coordinatorGroupNames)}
    </div>
    <div style="background: #fffaf0; border: 1px solid #f3e3b3; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; font-size: 15px; color: #1a2236; font-weight: 700;">
        Good ways to restart discussion
      </p>
      ${renderList([
        "Post one focused question your group can answer quickly.",
        "Share a short update on a current issue, opportunity, or decision.",
        "Mention one or two members who are close to the topic and invite their view.",
        "Ask what the next practical step should be.",
      ])}
    </div>
    <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #374151;">
      If a group has gone quiet, a simple post from the coordinator is often the thing that gets it moving again this ${cadenceWindowLabel}.
    </p>
    <div style="margin: 32px 0 24px;">
      ${renderButton(payload.forumUrl, "Start a Thread in Your Group")}
      ${renderButton(payload.manageSettingsUrl, "Manage Digest Settings", "secondary")}
    </div>
  `;
}

export function generateForumDigestEmail(payload: ForumDigestPayload) {
  const periodLabel = `${formatDigestDate(payload.periodStart)} to ${formatDigestDate(
    payload.periodEnd
  )}`;
  const logoUrl = `${payload.forumUrl.replace(/\/dashboard\/forum$/, "")}/images/IJF_Logo.png`;
  const cadenceLabel = payload.cadence === "daily" ? "Daily" : "Weekly";
  const greetingName = getGreetingName(payload.userName);

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

  const bodyHtml =
    payload.threadCount > 0
      ? `
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
          ${renderButton(payload.forumUrl, "Open Forum")}
          ${renderButton(payload.manageSettingsUrl, "Manage Digest Settings", "secondary")}
        </div>
      `
      : payload.emptyState === "coordinator"
        ? renderCoordinatorEmptyState(payload, periodLabel)
        : renderMemberEmptyState(payload, periodLabel);

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
        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6;">Hi ${greetingName},</p>
        ${bodyHtml}

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
          You are receiving this email because ${payload.cadence} forum digests are enabled on your IJF account.
        </p>
      </div>
    </div>
  `;
}
