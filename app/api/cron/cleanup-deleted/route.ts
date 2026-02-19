// /app/api/cron/cleanup-deleted/route.ts
// Cron job to permanently delete items after 7 days
// Schedule this to run daily (e.g., 2 AM)
// Vercel cron config in vercel.json: { "crons": [{ "path": "/api/cron/cleanup-deleted", "schedule": "0 2 * * *" }] }

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { deleteFolder } from "@/lib/googledrive";

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    
    // Allow if CRON_SECRET matches or if running locally
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      // Check for Vercel cron header
      const vercelCron = request.headers.get("x-vercel-cron");
      if (!vercelCron) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    await dbConnect();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const results = {
      workingGroups: 0,
      threads: 0,
      posts: 0,
      driveFoldersDeleted: 0,
      errors: [] as string[],
    };

    // 1. Find working groups deleted more than 7 days ago
    const expiredWorkingGroups = await WorkingGroupModel.find({
      deleted: true,
      deletedAt: { $lt: sevenDaysAgo },
    }).lean() as any[];

    for (const group of expiredWorkingGroups) {
      try {
        // Delete Drive folder if exists
        if (group.googleDriveFolderId) {
          try {
            await deleteFolder(group.googleDriveFolderId);
            results.driveFoldersDeleted++;
          } catch (error) {
            results.errors.push(`Failed to delete Drive folder for ${group.name}: ${error}`);
          }
        }

        // Permanently delete all threads in this group
        const groupThreads = await DiscussionThreadModel.find({
          workingGroups: group.slug,
        });

        for (const thread of groupThreads) {
          // Permanently delete all posts in thread
          await DiscussionPostModel.deleteMany({ threadId: thread._id });
        }

        // Delete threads
        const threadDeleteResult = await DiscussionThreadModel.deleteMany({
          workingGroups: group.slug,
        });
        results.threads += threadDeleteResult.deletedCount;

        // Delete the working group
        await WorkingGroupModel.findByIdAndDelete(group._id);
        results.workingGroups++;
      } catch (error) {
        results.errors.push(`Failed to delete working group ${group.name}: ${error}`);
      }
    }

    // 2. Find threads deleted more than 7 days ago (that weren't part of deleted working groups)
    const expiredThreads = await DiscussionThreadModel.find({
      deleted: true,
      deletedAt: { $lt: sevenDaysAgo },
    }).lean() as any[];

    for (const thread of expiredThreads) {
      try {
        // Permanently delete all posts in thread
        const postDeleteResult = await DiscussionPostModel.deleteMany({
          threadId: thread._id,
        });
        results.posts += postDeleteResult.deletedCount;

        // Delete the thread
        await DiscussionThreadModel.findByIdAndDelete(thread._id);
        results.threads++;
      } catch (error) {
        results.errors.push(`Failed to delete thread ${thread.title}: ${error}`);
      }
    }

    // 3. Find posts deleted more than 7 days ago (that weren't part of deleted threads)
    const expiredPosts = await DiscussionPostModel.find({
      deleted: true,
      deletedAt: { $lt: sevenDaysAgo },
    }).lean() as any[];

    for (const post of expiredPosts) {
      try {
        await DiscussionPostModel.findByIdAndDelete(post._id);
        results.posts++;
      } catch (error) {
        results.errors.push(`Failed to delete post ${post._id}: ${error}`);
      }
    }

    console.log("Cleanup completed:", results);

    return NextResponse.json({
      success: true,
      message: "Cleanup completed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cleanup cron error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}