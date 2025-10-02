import React, { useEffect, useRef, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserManagement } from '@/hooks/useUserManagement';
import { useToast } from '@/components/ui/use-toast';
import NextImage from 'next/image'; // Renamed Image component to NextImage

export function ProfileSettings() {
  const {
    currentUser,
    updateUserDetails,
    setEditingUser,
    isLoading,
    error,
    uploadImage, // New uploadImage function
  } = useUserManagement();
  const { toast } = useToast();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error('오류', { description: error });
    }
  }, [error, toast]);

  // Update previews when currentUser changes
  useEffect(() => {
    setAvatarPreview(currentUser?.avatarUrl || null);
    setBackgroundPreview(currentUser?.backgroundImage || null);
  }, [currentUser]);

  if (!currentUser) {
    return <div className="p-4">사용자 정보를 불러오는 중...</div>;
  }

  const handleSave = async () => {
    try {
      await updateUserDetails({
        nickname: currentUser.nickname,
        status: currentUser.status,
        aboutMe: currentUser.aboutMe,
        avatarUrl: currentUser.avatarUrl,
        backgroundImage: currentUser.backgroundImage,
      });
      toast.success('성공', { description: '프로필 정보가 업데이트되었습니다.' });
    } catch (e) {
      // Error is already handled by useEffect and toast.error
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('오류', { description: '이미지 파일만 업로드할 수 있습니다.' });
      return;
    }

    // Display local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        setAvatarPreview(reader.result as string);
      } else {
        setBackgroundPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      const imageUrl = await uploadImage(file, type);
      toast.success('성공', { description: `${type === 'avatar' ? '아바타' : '배경'} 이미지가 업로드되었습니다.` });
      // The setEditingUser and setCurrentUser are handled within useUserManagement
    } catch (e) {
      // Error is already handled by useEffect and toast.error
      if (type === 'avatar') {
        setAvatarPreview(currentUser.avatarUrl || null); // Revert preview on error
      } else {
        setBackgroundPreview(currentUser.backgroundImage || null); // Revert preview on error
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">프로필 설정</h2>
      <div>
        <h3 className="text-lg font-semibold mb-4">기본 프로필 정보</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="profileNickname">별명</Label>
            <Input
              id="profileNickname"
              value={currentUser.nickname || ''}
              onChange={(e) => setEditingUser(prev => prev ? { ...prev, nickname: e.target.value } : null)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="statusMessage">상태 메시지</Label>
            <Input
              id="statusMessage"
              value={currentUser.status || ''}
              onChange={(e) => setEditingUser(prev => prev ? { ...prev, status: e.target.value } : null)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="aboutMe">소개글</Label>
            <Textarea
              id="aboutMe"
              value={currentUser.aboutMe || ''}
              onChange={(e) => setEditingUser(prev => prev ? { ...prev, aboutMe: e.target.value } : null)}
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      <div>
        <h3 className="text-lg font-semibold mb-4">프로필 이미지</h3>
        <div className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <Label htmlFor="avatarUpload">아바타 사진</Label>
            <div className="flex items-center space-x-4 mt-2">
              <div 
                className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700 group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <NextImage src={avatarPreview} alt="Avatar Preview" layout="fill" objectFit="cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-sm">아바타 변경</span>
                </div>
              </div>
              <Input
                id="avatarUpload"
                type="file"
                accept="image/*"
                ref={avatarInputRef}
                onChange={(e) => handleImageUpload(e, 'avatar')}
                className="hidden"
                disabled={isLoading}
              />
              {/* The button is now redundant as the image itself is clickable */}
            </div>
          </div>

          {/* Background Upload */}
          <div>
            <Label htmlFor="backgroundUpload">배경 사진</Label>
            <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 mt-2">
              {backgroundPreview ? (
                <NextImage src={backgroundPreview} alt="Background Preview" layout="fill" objectFit="cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <Input
              id="backgroundUpload"
              type="file"
              accept="image/*"
              ref={backgroundInputRef}
              onChange={(e) => handleImageUpload(e, 'background')}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => backgroundInputRef.current?.click()}
              disabled={isLoading}
            >
              배경 업로드
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? '저장 중...' : '변경 사항 저장'}
        </Button>
      </div>
    </div>
  );
}
