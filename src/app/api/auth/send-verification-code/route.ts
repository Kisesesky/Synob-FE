import { NextResponse } from 'next/server';

// In-memory store for verification codes (for demonstration purposes)
const verificationCodes: { [email: string]: string } = {};

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
  }

  // Generate a simple 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  console.log(`Verification code for ${email}: ${code}`); // Log the code for testing

  return NextResponse.json({ message: 'Verification code sent.' }, { status: 200 });
}
