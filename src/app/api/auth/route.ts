import { NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/mockAuth';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
  }

  const user = findUserByUsername(username);

  // Simulate password check
  if (user && user.passwordHash === `hashed-${password}`) {
    return NextResponse.json({ message: 'Authentication successful!', user: { id: user.id, username: user.username, email: user.email } });
  } else {
    return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
  }
}
