'use client';

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { User } from "./MainPage";

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700 shadow-2xl">
        <div className="relative">
          <div className="h-24 bg-gray-700 rounded-t-lg" />
          <div className="absolute top-12 left-6 w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center font-bold text-4xl border-4 border-gray-900">
            {user.avatar}
          </div>
        </div>
        <div className="pt-16 pb-4 px-6">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-sm text-gray-400">Status: Online</p>
          <hr className="my-4 border-gray-700"/>
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">About Me</h3>
            <p className="text-sm">A very cool user of this chat application.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
