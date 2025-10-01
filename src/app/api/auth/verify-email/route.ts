import { NextResponse } from 'next/server';

// In-memory store for verification codes (must be the same as in send-verification-code/route.ts)
const verificationCodes: { [email: string]: string } = {};

export async function POST(request: Request) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json({ message: 'Email and verification code are required.' }, { status: 400 });
  }

  if (verificationCodes[email] === code) {
    delete verificationCodes[email]; // Code used, remove it
    return NextResponse.json({ message: 'Email verified successfully!' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Invalid verification code.' }, { status: 400 });
  }
}
