// /app/api/auth/heartbeat/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { requireAuth } from "@/lib/auth";

export async function POST() {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    await UserModel.findByIdAndUpdate(currentUser._id, {
      lastSeenAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}