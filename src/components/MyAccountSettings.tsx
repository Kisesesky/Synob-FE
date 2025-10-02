import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react'; // Added imports
import { useUserManagement } from '@/hooks/useUserManagement';
import { useToast } from '@/components/ui/use-toast';

export function MyAccountSettings() {
  const {
    currentUser,
    updateUserDetails,
    deactivateAccount,
    deleteAccount,
    changeLockScreenPassword,
    setEditingUser,
    isLoading,
    error,
  } = useUserManagement();
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Added state for password visibility
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast.error('오류', { description: error });
    }
  }, [error, toast]);

  if (!currentUser) {
    return <div className="p-4">사용자 정보를 불러오는 중...</div>;
  }

  const handleSave = async () => {
    try {
      await updateUserDetails({
        fullName: currentUser.fullName,
        nickname: currentUser.nickname,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
      });
      toast.success('성공', { description: '계정 정보가 업데이트되었습니다.' });
    } catch (e) {
      // Error is already handled by useEffect and toast.error
    }
  };

  const handleChangePassword = async () => {
    if (!passwordInput) {
      toast.error('오류', { description: '새 비밀번호를 입력해주세요.' });
      return;
    }
    try {
      await changeLockScreenPassword(passwordInput);
      toast.success('성공', { description: '잠금화면 비밀번호가 변경되었습니다.' });
      setPasswordInput('');
    } catch (e) {
      // Error is already handled by useEffect and toast.error
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm('정말로 계정을 비활성화하시겠습니까?')) {
      try {
        await deactivateAccount();
        toast.success('성공', { description: '계정이 비활성화되었습니다.' });
        // Redirect or log out user
      } catch (e) {
        // Error is already handled by useEffect and toast.error
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await deleteAccount();
        toast.success('성공', { description: '계정이 삭제되었습니다.' });
        // Redirect or log out user
      } catch (e) {
        // Error is already handled by useEffect and toast.error
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">내 계정 설정</h2>
      <div>
        <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">이름</Label>
            <Input
              id="fullName"
              value={currentUser.fullName || ''}
              onChange={(e) => setEditingUser(prev => prev ? { ...prev, fullName: e.target.value } : null)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="nickname">별명</Label>
            <Input
              id="nickname"
              value={currentUser.nickname || ''}
              onChange={(e) => setEditingUser(prev => prev ? { ...prev, nickname: e.target.value } : null)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={currentUser.email || ''}
              onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">전화번호</Label>
            <Input
              id="phoneNumber"
              value={currentUser.phoneNumber || ''}
              onChange={(e) => setEditingUser(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      <div>
        <h3 className="text-lg font-semibold mb-4">보안</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="lockScreenPassword">잠금화면 비밀번호 설정</Label>
            <div className="relative">
              <Input
                id="lockScreenPassword"
                type={showPassword ? "text" : "password"}
                placeholder="새 비밀번호 입력"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={isLoading}
                className="pr-10" // Add padding for the icon
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Button variant="outline" onClick={handleChangePassword} disabled={isLoading}>비밀번호 변경</Button>
        </div>
      </div>

      <hr className="my-6 border-gray-200 dark:border-gray-700" />

      <div>
        <h3 className="text-lg font-semibold mb-4">계정 관리</h3>
        <div className="flex flex-col space-y-2">
          <Button variant="destructive" onClick={handleDeactivateAccount} disabled={isLoading} className="w-fit">계정 비활성화</Button>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading} className="w-fit">계정 삭제</Button>
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
