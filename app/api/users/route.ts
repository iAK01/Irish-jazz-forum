import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { MemberModel } from '@/models/Member';
import { requireAuth } from '@/lib/auth';

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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET() {
  try {
    await requireAuth(["super_admin", "admin"]);
    await dbConnect();
    
    const users = await UserModel.find({}).sort({ createdAt: -1 }).lean() as unknown as LeanUser[];
    const members = await MemberModel.find({}, { name: 1, slug: 1, users: 1, region: 1 }).lean() as unknown as LeanMember[];

    // Attach memberOrgs to each user
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
      return {
        ...u,
        memberOrgs,
        primaryRegion: primaryOrg?.region || null,
        primaryOrgName: primaryOrg?.name || null,
      };
    });

    return NextResponse.json({ success: true, data: usersWithOrgs });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 403 });
  }
}
