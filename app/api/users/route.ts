import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { MemberModel } from '@/models/Member';
import { DiscussionPostModel } from '@/models/Discussionpost';
import { requireAuth } from '@/lib/auth';
import { Types } from 'mongoose';

interface LeanUser {
  _id: { toString(): string } | string;
  name: string;
  email: string;
  memberProfile?: string;
  workingGroups?: string[];
  role: string;
  [key: string]: unknown;
}

interface LeanMemberUser {
  userId?: { toString(): string } | string;
  role?: "primary" | "staff";
}

interface LeanMember {
  name: string;
  slug: string;
  region?: string | null;
  users?: LeanMemberUser[];
}

interface PostStat {
  _id: string;
  postCount: number;
  lastPostAt: Date;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET() {
  try {
    await requireAuth(["super_admin", "admin"]);
    await dbConnect();

    const [users, members, postStats] = await Promise.all([
      UserModel.find({}).sort({ createdAt: -1 }).lean() as Promise<unknown> as Promise<LeanUser[]>,
      MemberModel.find({}, { name: 1, slug: 1, users: 1, region: 1 }).lean() as Promise<unknown> as Promise<LeanMember[]>,
      DiscussionPostModel.aggregate<PostStat>([
        {
          $group: {
            _id: "$createdBy",
            postCount: { $sum: 1 },
            lastPostAt: { $max: "$createdAt" },
          },
        },
      ]),
    ]);

    // Build a quick lookup map for post stats
    const postStatMap = new Map<string, PostStat>();
    for (const stat of postStats) {
      postStatMap.set(stat._id.toString(), stat);
    }

    // Attach memberOrgs + forum stats to each user
    const usersWithOrgs = users.map((u) => {
      const memberOrgs = members
        .filter((m) => m.users?.some((mu) => mu.userId?.toString() === u._id.toString()))
        .map((m) => {
          const membership = m.users?.find((mu) => mu.userId?.toString() === u._id.toString());
          return {
            slug: m.slug,
            name: m.name,
            region: m.region || null,
            isPrimary: membership?.role === "primary",
          };
        });
      const primaryOrg = memberOrgs.find((org) => org.isPrimary) || memberOrgs[0] || null;

      const stat = postStatMap.get(u._id.toString());

      return {
        ...u,
        memberOrgs,
        primaryRegion: primaryOrg?.region || null,
        primaryOrgName: primaryOrg?.name || null,
        postCount: stat?.postCount ?? 0,
        lastPostAt: stat?.lastPostAt ?? null,
      };
    });

    return NextResponse.json({ success: true, data: usersWithOrgs });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 403 });
  }
}
