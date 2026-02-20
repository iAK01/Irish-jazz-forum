import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  await dbConnect();
  const { email } = await request.json();
  if (!email) return NextResponse.json({ exists: false });
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
  return NextResponse.json({ exists: !!user });
}