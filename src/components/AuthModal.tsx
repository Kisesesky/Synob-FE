import SocialLoginButtons from '@/components/buttons/SocialLoginButtons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Eye, EyeOff, Loader2, UserRoundPlus } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AuthModalProps {
  onLoginSuccess: () => void;
}

const commonEmailDomains = ['gmail.com', 'naver.com', 'hanmail.net', 'daum.net', 'nate.com', 'kakao.com',
'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];

export function AuthModal({ onLoginSuccess }: AuthModalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [hasPersonalInfoConsent, setHasPersonalInfoConsent] = useState(false);
  const [hasTermsConsent, setHasTermsConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailHints, setShowEmailHints] = useState(false);
  const [emailHintIndex, setEmailHintIndex] = useState(-1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form fields when switching modes
  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setProfileImage(null);
    setProfileImageUrl(null);
    setHasPersonalInfoConsent(false);
    setHasTermsConsent(false);
    setIsLoading(false);
    setIsSendingCode(false);
    setIsVerifyingEmail(false);
    setIsVerificationCodeSent(false);
    setIsEmailVerified(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowEmailHints(false);
    setEmailHintIndex(-1);
  };

  const handleModeSwitch = (mode: boolean) => {
    setIsRegisterMode(mode);
    resetForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSendVerificationCode = async () => {
    if (!email || !isEmailValid) {
      toast.error('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    setIsSendingCode(true);
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || '인증 코드가 이메일로 전송되었습니다.');
        setIsVerificationCodeSent(true);
      } else {
        toast.error(data.message || '인증 코드 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Send verification code API error:', error);
      toast.error('인증 코드 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!email || !verificationCode) {
      toast.error('이메일과 인증 코드를 입력해주세요.');
      return;
    }
    setIsVerifyingEmail(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || '이메일이 성공적으로 인증되었습니다!');
        setIsEmailVerified(true);
      } else {
        toast.error(data.message || '이메일 인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('Verify email API error:', error);
      toast.error('이메일 인증 중 오류가 발생했습니다.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, [password]);

  const getPasswordStrengthText = useMemo(() => {
    if (password.length === 0) return { text: '비밀번호를 입력해주세요.', color: 'text-gray-400' };
    switch (passwordStrength) {
      case 0: return { text: '매우 약함', color: 'text-red-500' };
      case 1: return { text: '약함', color: 'text-red-500' };
      case 2: return { text: '보통', color: 'text-orange-500' };
      case 3: return { text: '좋음', color: 'text-yellow-500' };
      case 4: return { text: '강력함', color: 'text-green-500' };
      case 5: return { text: '매우 강력함', color: 'text-green-600' };
      default: return { text: '', color: 'text-gray-400' };
    }
  }, [password, passwordStrength]);

  const isPasswordStrongEnough = passwordStrength >= 4; // 4개 이상의 기준 충족

  const isEmailValid = useMemo(() => {
    // Basic email regex for format validation
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }, [email]);

  const isKoreanConsonantsOnly = useCallback((text: string) => {
    if (!text) return false;
    // Regular expression to check for Korean consonants only
    // This regex matches any string that contains only characters from ㄱ-ㅎ (Korean consonants)
    const koreanConsonantsRegex = /^[ㄱ-ㅎ]*$/;
    return koreanConsonantsRegex.test(text);
  }, []);

  const filteredEmailHints = useMemo(() => {
    if (!email.includes('@')) return [];
    const [localPart, domainPart] = email.split('@');
    if (!domainPart) return commonEmailDomains;
    return commonEmailDomains.filter(domain => domain.startsWith(domainPart));
  }, [email, commonEmailDomains]);

  const isRegisterFormValid = useMemo(() => {
    return (
      username.trim() !== '' &&
      !isKoreanConsonantsOnly(username) && // 사용자 이름 유효성 검사 추가
      email.trim() !== '' &&
      isEmailValid && // 이메일 형식 유효성 검사 추가
      isEmailVerified &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword &&
      isPasswordStrongEnough &&
      hasPersonalInfoConsent &&
      hasTermsConsent
    );
  }, [username, isKoreanConsonantsOnly, email, isEmailValid, isEmailVerified, password, confirmPassword,
isPasswordStrongEnough, hasPersonalInfoConsent, hasTermsConsent]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || '회원가입이 성공적으로 완료되었습니다!');
        handleModeSwitch(false); // Switch to login mode after successful registration
      } else {
        toast.error(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Registration API error:', error);
      toast.error('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(); // Call the success handler from LockScreen
        toast.success(data.message || '로그인 성공!');
      } else {
        toast.error(data.message || '인증 실패.');
      }
    } catch (error) {
      console.error('Login API error:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isLoginFormValid = useMemo(() => {
    return username.trim() !== '' && password.length > 0;
  }, [username, password]);

  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver' | 'github') => {
    toast.info(`${provider} 로그인 준비 중...`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='w-full backdrop-blur-lg'>Login / Unlock</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-sm p-0 border-none bg-transparent max-h-[90vh]">
        <Card className="w-full bg-white dark:bg-gray-900 text-black dark:text-white border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              {isRegisterMode ? '회원가입' : '로그인'}
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-400">
              {isRegisterMode ? '새로운 계정을 생성하여 서비스를 이용해보세요.' : '계정에 로그인하여계속하세요.'}
            </CardDescription>
          </CardHeader>
          <ScrollArea className="h-[calc(90vh-180px)] px-6">
            <CardContent className="p-0">
              {isRegisterMode ? (
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="space-y-2">
                    <Label>프로필 사진</Label>
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className="relative w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {profileImageUrl ? (
                          <Image src={profileImageUrl} alt="Profile" layout="fill" objectFit="cover" />
                        ) : (
                          <UserRoundPlus className="w-14 h-14 text-gray-700 dark:text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm">
                            {profileImage ? '변경' : '업로드'}
                          </span>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4 mt-6">
                    <h3 className="text-xl font-semibold">계정 정보</h3>
                    {/* Username */}
                    <div>
                      <Label htmlFor="username">사용자 이름</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="사용자 이름을 입력해주세요."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white"
                      />
                      {username.trim() !== '' && isKoreanConsonantsOnly(username) && (
                        <p className="text-red-500 text-sm mt-1">잘못된 이름입니다.</p>
                      )}
                    </div>

                    {/* Email Verification */}
                    <div>
                      <Label htmlFor="email">이메일</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="email"
                          type="email"
                          placeholder="이메일 주소를 입력해주세요."
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setShowEmailHints(true);
                            setEmailHintIndex(-1);
                          }}
                          onFocus={() => setShowEmailHints(true)}
                          onBlur={() => setTimeout(() => setShowEmailHints(false), 100)}
                          onKeyDown={(e) => {
                            if (filteredEmailHints.length > 0) {
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setEmailHintIndex(prev => (prev + 1) % filteredEmailHints.length);
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setEmailHintIndex(prev => (prev - 1 + filteredEmailHints.length) % filteredEmailHints.length);
                              } else if (e.key === 'Enter' && emailHintIndex !== -1) {
                                e.preventDefault();
                                const [localPart] = email.split('@');
                                setEmail(`${localPart}@${filteredEmailHints[emailHintIndex]}`);
                                setShowEmailHints(false);
                              }
                            }
                          }}
                          required
                          disabled={isEmailVerified || isSendingCode || isVerifyingEmail}
                          className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white"
                        />
                        <Button
                          type="button"
                          onClick={handleSendVerificationCode}
                          disabled={!email || !isEmailValid || isSendingCode || isEmailVerified}
                          className="shrink-0"
                        >
                          {isSendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : isEmailVerified ? <CheckCircle2 className="h-4 w-4" /> : '인증하기'}
                        </Button>
                      </div>
                      {!isEmailValid && email.trim() !== '' && (
                        <p className="text-red-500 text-sm mt-1">유효한 이메일 형식이 아닙니다.</p>
                      )}
                      {showEmailHints && filteredEmailHints.length > 0 && (
                        <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto">
                          {filteredEmailHints.map((domain, index) => (
                            <div
                              key={domain}
                              className={`px-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 ${emailHintIndex === index ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                                const [localPart] = email.split('@');
                                setEmail(`${localPart}@${domain}`);
                                setShowEmailHints(false);
                              }}
                            >
                              {email.split('@')[0]}@{domain}
                            </div>
                          ))}
                        </div>
                      )}
                      {isVerificationCodeSent && !isEmailVerified && (
                        <div className="flex space-x-2 mt-2">
                          <Input
                            id="verificationCode"
                            type="text"
                            placeholder="인증 코드를 입력해주세요."
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            disabled={isVerifyingEmail}
                            className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white"
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyEmail}
                            disabled={!verificationCode || isVerifyingEmail}
                            className="shrink-0"
                        >
                          {isVerifyingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : '확인'}
                          </Button>
                        </div>
                      )}
                      {isEmailVerified && (
                        <p className="text-green-500 text-sm mt-1 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> 이메일이 성공적으로 인증되었습니다.</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <Label htmlFor="password">비밀번호</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="비밀번호를 입력해주세요."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pr-10 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white" // Space for the icon
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 dark:text-gray-400"
                          onClick={() => setShowPassword(prev => !prev)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="h-1 w-full rounded-full bg-gray-300 dark:bg-gray-600">
                          <div
                            className={`h-full rounded-full transition-all duration-300
                              ${passwordStrength === 0 ? 'w-0' : passwordStrength === 1 ? 'w-1/5 bg-red-500' : passwordStrength === 2 ? 'w-2/5 bg-orange-500' : passwordStrength === 3 ? 'w-3/5 bg-yellow-500' : passwordStrength === 4 ? 'w-4/5 bg-green-500' : 'w-full bg-green-600'}
                            `}
                          />
                        </div>
                        <p className={`text-sm mt-1 ${getPasswordStrengthText.color}`}>
                          {getPasswordStrengthText.text}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="비밀번호를 다시 입력해주세요."
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="pr-10 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white" // Space for the icon
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 dark:text-gray-400"
                          onClick={() => setShowConfirmPassword(prev => !prev)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password && confirmPassword && password !== confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다.</p>
                      )}
                    </div>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-3 mt-6">
                    <h3 className="text-xl font-semibold">약관 동의</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="personalInfoConsent"
                        checked={hasPersonalInfoConsent}
                        onCheckedChange={(checked) => setHasPersonalInfoConsent(!!checked)}
                      />
                      <Label htmlFor="personalInfoConsent">개인정보 처리방침에 동의합니다.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="termsConsent"
                        checked={hasTermsConsent}
                        onCheckedChange={(checked) => setHasTermsConsent(!!checked)}
                      />
                      <Label htmlFor="termsConsent">이용약관에 동의합니다.</Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || !isRegisterFormValid}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : '회원가입'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLoginAttempt} className="space-y-4">
                  <div>
                    <Label htmlFor="username">사용자 이름</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="사용자 이름을 입력해주세요."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="비밀번호를 입력해주세요."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white"
                    />
                  </div>
                  <Button type="submit" className='w-full' disabled={isLoading || !isLoginFormValid}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : '로그인'}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-800 px-2 text-gray-700 dark:text-gray-500">또는</span>
                    </div>
                  </div>

                  <SocialLoginButtons onSocialLogin={handleSocialLogin} />
                </form>
              )}
            </CardContent>
          </ScrollArea>
          <div className="text-center text-sm text-gray-700 dark:text-gray-400 mt-4 pb-4">
            {isRegisterMode ? (
              <>이미 계정이 있으신가요?{' '}
                <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:underline" onClick={() => handleModeSwitch(false)}>
                  로그인
                </Button>
              </>
            ) : (
              <>계정이 없으신가요?{' '}
                <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:underline" onClick={() => handleModeSwitch(true)}>
                  회원가입
                </Button>
              </>
            )}
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}