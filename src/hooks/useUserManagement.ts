import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { UserId } from '@/lib/brandedTypes'; // Corrected import for UserId

export function useUserManagement() {
  const { currentUser, setCurrentUser } = useAppContext(); // Corrected usage of useAppContext
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setEditingUser(currentUser);
    }
  }, [currentUser]);

  // Function to simulate an API call
  const simulateApiCall = <T,>(action: () => T, delay = 1000): Promise<T> => {
    setIsLoading(true);
    setError(null);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = action();
          resolve(result);
        } catch (e: unknown) { // Changed 'any' to 'unknown'
          setError(e instanceof Error ? e.message : 'An unknown error occurred'); // Added type guard
          reject(e);
        } finally {
          setIsLoading(false);
        }
      }, delay);
    });
  };

  // Function to update user details
  const updateUserDetails = async (updatedFields: Partial<User>) => {
    if (!editingUser) {
      setError('No user to update.');
      return;
    }
    try {
      const newUser = await simulateApiCall(() => {
        const updated = { ...editingUser, ...updatedFields };
        // Simulate successful update
        return updated;
      });
      setEditingUser(newUser);
      setCurrentUser(newUser); // Update global state
      console.log('User details updated:', newUser);
      return newUser;
    } catch (e) {
      console.error('Failed to update user details:', e);
      throw e;
    }
  };

  // Placeholder for account deactivation
  const deactivateAccount = async () => {
    try {
      await simulateApiCall(() => {
        console.log('Simulating account deactivation...');
        // Simulate successful deactivation
        return true;
      });
      console.log('Account deactivated successfully.');
      // Optionally, log out the user or redirect
    } catch (e) {
      console.error('Failed to deactivate account:', e);
      throw e;
    }
  };

  // Placeholder for account deletion
  const deleteAccount = async () => {
    try {
      await simulateApiCall(() => {
        console.log('Simulating account deletion...');
        // Simulate successful deletion
        return true;
      });
      console.log('Account deleted successfully.');
      // Optionally, log out the user or redirect
    } catch (e) {
      console.error('Failed to delete account:', e);
      throw e;
    }
  };

  // Placeholder for changing lock screen password
  const changeLockScreenPassword = async (newPassword: string) => {
    try {
      await simulateApiCall(() => {
        console.log('Simulating lock screen password change...');
        // In a real app, you'd send the new password (hashed) to the backend
        if (editingUser) {
          return { ...editingUser, lockScreenPassword: newPassword };
        } else {
          throw new Error('No user to update password for.');
        }
      });
      console.log('Lock screen password changed successfully.');
    } catch (e) {
      console.error('Failed to change lock screen password:', e);
      throw e;
    }
  };

  // Simulate image upload
  const uploadImage = async (file: File, type: 'avatar' | 'background'): Promise<string> => {
    if (!editingUser) {
      setError('No user to upload image for.');
      throw new Error('No user to upload image for.');
    }
    try {
      const imageUrl = await simulateApiCall(() => {
        // In a real app, you'd upload the file to a storage service (e.g., S3, Cloudinary)
        // and get a URL back. For simulation, we'll create a mock URL.
        const mockUrl = `https://picsum.photos/seed/${Date.now()}/200/300?type=${type}`;
        console.log(`Simulating ${type} upload for file: ${file.name}. Mock URL: ${mockUrl}`);
        return mockUrl;
      });

      // Update the editingUser state with the new image URL
      if (type === 'avatar') {
        setEditingUser(prev => prev ? { ...prev, avatarUrl: imageUrl } : null);
      } else {
        setEditingUser(prev => prev ? { ...prev, backgroundImage: imageUrl } : null);
      }
      setCurrentUser(prev => prev ? { ...prev, ...(type === 'avatar' ? { avatarUrl: imageUrl } : { backgroundImage: imageUrl }) } : null); // Update global state
      return imageUrl;
    } catch (e) {
      console.error(`Failed to upload ${type} image:`, e);
      throw e;
    }
  };

  return {
    currentUser: editingUser,
    updateUserDetails,
    deactivateAccount,
    deleteAccount,
    changeLockScreenPassword,
    uploadImage, // Expose the new upload function
    isLoading,
    error,
    setEditingUser,
  };
}
