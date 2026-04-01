import dbConnect from "@/lib/mongodb";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { ForumDigestPreference, User } from "@/models/User";

export type ForumDigestCadence = "daily" | "weekly";

const WEEKLY_DIGEST_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
const DAILY_DIGEST_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const PRIVILEGED_ROLES = new Set(["super_admin", "admin", "steering"]);

export interface ForumDigestUser {
  _id: string;
  name: string;
  email: string;
  role: User["role"];
  workingGroups?: string[];
  forumDigest?: ForumDigestPreference;
}

export interface ForumDigestWindow {
  digestKey: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface ForumDigestThreadItem {
  _id: string;
  title: string;
  slug: string;
  status: string;
  replyCount: number;
  lastActivityAt: Date;
  publicToMembers: boolean;
  groupName: string;
  groupSlug: string | null;
  latestPosterName: string | null;
  newResponsesSinceUserPosted: number;
  url: string;
}

export interface ForumDigestSection {
  key: string;
  name: string;
  slug: string | null;
  threads: ForumDigestThreadItem[];
}

export interface ForumDigestPayload {
  userName: string;
  cadence: ForumDigestCadence;
  periodStart: Date;
  periodEnd: Date;
  threadCount: number;
  sections: ForumDigestSection[];
  forumUrl: string;
  manageSettingsUrl: string;
}

interface DigestThreadDocument {
  _id: { toString(): string } | string;
  title: string;
  slug: string;
  status: string;
  replyCount: number;
  lastActivityAt: Date;
  publicToMembers?: boolean;
  workingGroups?: string[];
}

interface DigestGroupDocument {
  _id: { toString(): string } | string;
  name: string;
  slug: string;
}

interface DigestPostDocument {
  threadId: { toString(): string } | string;
  createdBy:
    | string
    | {
        _id?: { toString(): string } | string;
        name?: string;
      };
  createdAt: Date;
}

function normalizeGroupIds(workingGroups?: string[]) {
  return (workingGroups || []).map((groupId) => groupId.toString());
}

function buildAccessibleThreadQuery(user: ForumDigestUser) {
  if (PRIVILEGED_ROLES.has(user.role)) {
    return {};
  }

  const groupIds = normalizeGroupIds(user.workingGroups);
  const visibilityQuery: Record<string, unknown>[] = [
    { workingGroups: { $size: 0 } },
    { publicToMembers: true },
  ];

  if (groupIds.length > 0) {
    visibilityQuery.push({ workingGroups: { $in: groupIds } });
  }

  return { $or: visibilityQuery };
}

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
}

export function getEffectiveForumDigestPreference(
  forumDigest?: ForumDigestPreference
) {
  return forumDigest || "weekly";
}

export function buildDigestWindow(
  cadence: ForumDigestCadence,
  referenceDate = new Date()
): ForumDigestWindow {
  const periodEnd = new Date(referenceDate);
  const lookbackMs =
    cadence === "daily" ? DAILY_DIGEST_LOOKBACK_MS : WEEKLY_DIGEST_LOOKBACK_MS;
  const periodStart = new Date(referenceDate.getTime() - lookbackMs);

  return {
    digestKey:
      cadence === "daily"
        ? periodStart.toISOString().slice(0, 10)
        : periodStart.toISOString().slice(0, 10),
    periodStart,
    periodEnd,
  };
}

export function buildWeeklyDigestWindow(referenceDate = new Date()): ForumDigestWindow {
  return buildDigestWindow("weekly", referenceDate);
}

export function buildDailyDigestWindow(referenceDate = new Date()): ForumDigestWindow {
  return buildDigestWindow("daily", referenceDate);
}

export async function buildForumDigestForUser(
  user: ForumDigestUser,
  window: ForumDigestWindow,
  cadence: ForumDigestCadence = "weekly"
): Promise<ForumDigestPayload> {
  await dbConnect();

  const baseUrl = getBaseUrl();
  const accessQuery = buildAccessibleThreadQuery(user);
  const threadQuery = {
    deleted: { $ne: true },
    lastActivityAt: {
      $gte: window.periodStart,
      $lt: window.periodEnd,
    },
    ...accessQuery,
  };

  const threads = (await DiscussionThreadModel.find(threadQuery)
    .select(
      "title slug status replyCount lastActivityAt publicToMembers workingGroups"
    )
    .sort({ lastActivityAt: -1 })
    .lean()) as unknown as DigestThreadDocument[];

  const groupIds = [
    ...new Set(
      threads.flatMap((thread) =>
        (thread.workingGroups || []).map((groupId) => groupId.toString())
      )
    ),
  ];

  const groups = groupIds.length
    ? ((await WorkingGroupModel.find({ _id: { $in: groupIds } })
        .select("name slug")
        .lean()) as unknown as DigestGroupDocument[])
    : [];

  const threadIds = threads.map((thread) => thread._id.toString());
  const posts = threadIds.length
    ? ((await DiscussionPostModel.find({
        threadId: { $in: threadIds },
        deleted: { $ne: true },
      })
        .select("threadId createdBy createdAt")
        .populate("createdBy", "name")
        .sort({ createdAt: 1 })
        .lean()) as unknown as DigestPostDocument[])
    : [];

  const groupMap = new Map(
    groups.map((group) => [
      group._id.toString(),
      { name: group.name, slug: group.slug },
    ])
  );

  const postsByThread = new Map<string, DigestPostDocument[]>();

  for (const post of posts) {
    const threadId = post.threadId.toString();
    const existing = postsByThread.get(threadId) || [];
    existing.push(post);
    postsByThread.set(threadId, existing);
  }

  const sections = new Map<string, ForumDigestSection>();

  for (const thread of threads) {
    const threadId = thread._id.toString();
    const threadPosts = postsByThread.get(threadId) || [];
    const latestPost = threadPosts[threadPosts.length - 1];
    const latestPosterName =
      latestPost && typeof latestPost.createdBy === "object"
        ? latestPost.createdBy.name || null
        : null;
    const latestUserPost = [...threadPosts]
      .reverse()
      .find((post) =>
        typeof post.createdBy === "object"
          ? post.createdBy._id?.toString() === user._id
          : post.createdBy?.toString() === user._id
      );
    const newResponsesSinceUserPosted = latestUserPost
      ? threadPosts.filter(
          (post) =>
            new Date(post.createdAt).getTime() >
              new Date(latestUserPost.createdAt).getTime() &&
            (typeof post.createdBy === "object"
              ? post.createdBy._id?.toString() !== user._id
              : post.createdBy?.toString() !== user._id)
        ).length
      : 0;
    const primaryGroupId = (thread.workingGroups || [])[0]?.toString() || null;
    const group = primaryGroupId ? groupMap.get(primaryGroupId) : null;
    const groupName = group?.name || "General Discussion";
    const groupSlug = group?.slug || null;
    const sectionKey = groupSlug || "general";
    const threadUrl = groupSlug
      ? `${baseUrl}/dashboard/forum/${groupSlug}/${thread.slug}`
      : `${baseUrl}/dashboard/forum/general/${thread.slug}`;

    if (!sections.has(sectionKey)) {
      sections.set(sectionKey, {
        key: sectionKey,
        name: groupName,
        slug: groupSlug,
        threads: [],
      });
    }

    sections.get(sectionKey)?.threads.push({
      _id: threadId,
      title: thread.title,
      slug: thread.slug,
      status: thread.status,
      replyCount: thread.replyCount,
      lastActivityAt: new Date(thread.lastActivityAt),
      publicToMembers: thread.publicToMembers === true,
      groupName,
      groupSlug,
      latestPosterName,
      newResponsesSinceUserPosted,
      url: threadUrl,
    });
  }

  const forumUrl = `${baseUrl}/dashboard/forum`;
  const manageSettingsUrl = `${baseUrl}/dashboard/profile/notifications`;

  return {
    userName: user.name,
    cadence,
    periodStart: window.periodStart,
    periodEnd: window.periodEnd,
    threadCount: threads.length,
    sections: [...sections.values()],
    forumUrl,
    manageSettingsUrl,
  };
}
