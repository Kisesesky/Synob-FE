'use client';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/AppContext';
import Image from 'next/image'; // Import Image component

export function UserProfileModal() {
  const { viewingUser: user, setViewingUser } = useAppContext();

  if (!user) {
    return null;
  }

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      setViewingUser(null);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={handleOnOpenChange}>
      <DialogContent className='sm:max-w-[425px] bg-white dark:bg-gray-900 text-black dark:text-white border-gray-200 dark:border-gray-700 shadow-2xl'>
        <div className='relative'>
          {user.backgroundImage && (
            <Image src={user.backgroundImage} alt="Background" layout="fill" objectFit="cover" className="h-30 rounded-t-lg" />
          )}
          <div className='h-24 bg-gray-200 dark:bg-gray-700 rounded-t-lg' />
          <div className='absolute top-12 left-6 w-24 h-24 rounded-full overflow-hidden bg-gray-400 dark:bg-gray-800 flex items-center justify-center font-bold text-4xl border-4 border-gray-200 dark:border-gray-900'>
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="User Avatar" layout="fill" objectFit="cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-white">
                {user.fullName[0]}
              </div>
            )}
          </div>
        </div>
        <div className='pt-16 pb-4 px-6'>
          <h2 className='text-2xl font-bold'>{user.fullName} {user.nickname ? `(${user.nickname})` : ''}</h2>
          <p className='text-sm text-gray-700 dark:text-gray-400'>Status: {user.status || 'Offline'}</p>
          <hr className='my-4 border-gray-300 dark:border-gray-700'/>
          <div>
            <h3 className='xs font-bold uppercase text-gray-700 dark:text-gray-400 mb-2'>About Me</h3>
            <p className='text-sm'>{user.aboutMe || 'No information provided.'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
