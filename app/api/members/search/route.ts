// /app/api/members/search/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (q.trim().length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    const users = await UserModel.find({
      name: { $regex: q.trim(), $options: "i" },
      _id: { $ne: currentUser._id },
      role: { $ne: "public" },
    })
      .select("_id name image")
      .limit(8)
      .lean();

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}