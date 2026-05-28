import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { UserModel } from "@/models/User";

export async function POST() {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    await UserModel.findByIdAndUpdate(currentUser._id, [
      {
        $set: {
          previousForumVisitAt: "$lastForumVisitAt",
          lastForumVisitAt: new Date(),
        },
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
