import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MemberProfileForm from "@/app/components/members/MemberProfileForm";
import dbConnect from "@/lib/mongodb";
import { MemberModel } from "@/models/Member";

export default async function ProfilePage() {
  try {
    const user = await requireAuth();
    await dbConnect();

    // Check if user has a member profile
    let memberData = null;
    let mode: "create" | "edit" = "create";

    if (user.memberProfile) {
      const member = await MemberModel.findOne({ slug: user.memberProfile }).lean();
      if (member) {
        memberData = JSON.parse(JSON.stringify(member));
        mode = "edit";
      }
    }

    return (
      <MemberProfileForm
        initialData={memberData}
        mode={mode}
      />
    );
  } catch (error) {
    redirect("/api/auth/signin");
  }
}