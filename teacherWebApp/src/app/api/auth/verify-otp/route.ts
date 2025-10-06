import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  try {
    const { otp } = await req.json();
    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json({ success: false, error: "Invalid OTP format" }, { status: 400 });
    }

    await dbConnect();
    const email = process.env.OTP_EMAIL_TO as string;
    if (!email) return NextResponse.json({ success: false, error: "OTP_EMAIL_TO not set" }, { status: 500 });

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return NextResponse.json({ success: false, error: "Incorrect code" }, { status: 401 });
    }

    if (new Date() > record.expires) {
      await Otp.deleteOne({ _id: record._id });
      return NextResponse.json({ success: false, error: "Code expired" }, { status: 401 });
    }

    await Otp.deleteOne({ _id: record._id });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
