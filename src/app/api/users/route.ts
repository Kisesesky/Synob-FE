import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from Users API!' });
}

export async function POST() {
  return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });
}
