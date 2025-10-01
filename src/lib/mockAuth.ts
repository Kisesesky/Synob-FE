// src/lib/mockAuth.ts

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string; // In a real app, store hashed passwords
  profileImageUrl?: string; // Optional profile image URL
  isEmailVerified: boolean; // Track if email is verified
}

export const mockUsers: User[] = [];
let nextUserId = 1;

export const addUser = (username: string, email: string, passwordHash: string, profileImageUrl?: string): User => {
  const newUser: User = {
    id: nextUserId++,
    username,
    email,
    passwordHash,
    profileImageUrl,
    isEmailVerified: true, // Assuming email is verified at this point for mock
  };
  mockUsers.push(newUser);
  return newUser;
};

export const findUserByUsername = (username: string): User | undefined => {
  return mockUsers.find(user => user.username === username);
};

export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};
