import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "config/constant";
import { sessionDisplayName, verifyAppJwt } from "lib/auth-session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = verifyAppJwt(token);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      email: user.email,
      username: user.username ?? null,
      displayName: sessionDisplayName(user),
      role: user.role,
    },
  });
}
