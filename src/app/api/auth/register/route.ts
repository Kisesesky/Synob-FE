import { NextResponse } from 'next/server';
import { addUser, findUserByEmail, findUserByUsername } from '@/lib/mockAuth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const profileImage = formData.get('profileImage') as File | null;

  // Basic validation
  if (!username || !email || !password) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
  }

  // Check if user already exists
  if (findUserByUsername(username)) {
    return NextResponse.json({ message: 'Username already taken.' }, { status: 409 });
  }
  if (findUserByEmail(email)) {
    return NextResponse.json({ message: 'Email already registered.' }, { status: 409 });
  }

  let profileImageUrl: string | undefined;
  if (profileImage) {
    // Simulate storing the image and getting a URL
    // In a real app, you would upload this to a cloud storage like S3
    profileImageUrl = `https://example.com/profile-images/${username}-${Date.now()}.png`;
    console.log(`Simulating profile image upload for ${username}. URL: ${profileImageUrl}`);
  }

  // Simulate password hashing (for demonstration purposes)
  const passwordHash = `hashed-${password}`;

  const newUser = addUser(username, email, passwordHash, profileImageUrl);

  console.log('Registered new user:', newUser);

  return NextResponse.json({ message: 'Registration successful!', user: { id: newUser.id, username: newUser.username, email: newUser.email, profileImageUrl: newUser.profileImageUrl } }, { status: 201 });
}
