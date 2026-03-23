import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ContactSubmissionModel } from "@/models/ContactSubmission";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authUser = await requireAuth(["admin", "super_admin"]);
    await dbConnect();

    const body = await request.json();
    const { ids, action, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "No IDs provided" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: "No action provided" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "archive":
        result = await ContactSubmissionModel.updateMany(
          { _id: { $in: ids } },
          {
            $set: {
              archived: true,
              archivedAt: new Date(),
              archivedBy: (authUser as any)._id,
            },
          }
        );
        break;

      case "unarchive":
        result = await ContactSubmissionModel.updateMany(
          { _id: { $in: ids } },
          {
            $set: { archived: false },
            $unset: { archivedAt: 1, archivedBy: 1 },
          }
        );
        break;

      case "delete":
        result = await ContactSubmissionModel.deleteMany({ _id: { $in: ids } });
        break;

      case "status":
        if (!status || !["new", "in-progress", "resolved"].includes(status)) {
          return NextResponse.json(
            { success: false, error: "Invalid status value" },
            { status: 400 }
          );
        }
        result = await ContactSubmissionModel.updateMany(
          { _id: { $in: ids } },
          { $set: { status } }
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        affected:
          (result as any).modifiedCount ?? (result as any).deletedCount ?? 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}