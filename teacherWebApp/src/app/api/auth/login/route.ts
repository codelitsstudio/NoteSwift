import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json({ success: false, error: "Server configuration error." }, { status: 500 });
    }

    if (username === adminUsername && password === adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid username or password." }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
}
