import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Otp from "@/models/Otp";
import { Resend } from "resend";
import { OtpEmail } from "@/emails/otp-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    await dbConnect();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const email = process.env.OTP_EMAIL_TO as string;
    if (!email) return NextResponse.json({ success: false, error: "OTP_EMAIL_TO not set" }, { status: 500 });

    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp, expires });

    await resend.emails.send({
      from: "NoteSwift Teacher <noteswift@codelitsstudio.com>",
      to: email,
      subject: "Your NoteSwift Teacher Login Code",
      react: OtpEmail({ otp }),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Could not send code" }, { status: 500 });
  }
}
