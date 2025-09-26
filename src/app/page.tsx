import { redirect } from 'next/navigation';

export default function RootPage() {
  // In a real application, you would check authentication status here (e.g., from cookies or a server session).
  // For now, we'll simulate by always redirecting to /login.
  // Later, you can add logic like:
  // const isLoggedIn = checkAuthStatus(); // Implement this function
  // if (!isLoggedIn) {
  //   redirect('/login');
  // }
  // redirect('/dashboard');

  redirect('/login');
}