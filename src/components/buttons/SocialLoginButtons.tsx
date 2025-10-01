import React from 'react';

interface Props {
  onSocialLogin: (provider: 'google' | 'kakao' | 'naver' | 'github') => void;
}

export default function SocialLoginButtons({ onSocialLogin }: Props) {
  return (
    <div className="mt-6 flex flex-col gap-3 w-full max-w-sm mx-auto">
      {/* Google Button */}
      <button
        type="button"
        onClick={() => onSocialLogin('google')}
        className="
          gsi-material-button w-full flex items-center gap-4 py-2 px-4
          rounded-lg shadow-sm border border-gray-200 bg-white
          hover:bg-gray-50 transition
          focus:outline-none focus:ring-2 focus:ring-primary-300"
        style={{ height: 40, minHeight: 40, maxHeight: 40 }}
      >
        <span className="gsi-material-button-icon shrink-0">
          {/* 공식 Google SVG, 유지해야함 */}
          <svg viewBox="0 0 48 48" width={20} height={20}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </span>
        <span className="flex-1 text-center font-bold text-gray-700 text-base tracking-tight">Google로 로그인</span>
      </button>

      {/* Kakao Button */}
      <button
        type="button"
        onClick={() => onSocialLogin('kakao')}
        className="
          w-full flex items-center gap-4 py-3 px-4 rounded-lg
          border-none
          text-[15px] font-semibold
          shadow-sm
          transition
        "
        style={{
          backgroundColor: "#FEE500",
          color: "#191600",
          height: 40, minHeight: 40, maxHeight: 40
        }}
      >
        <img
          src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
          alt="Kakao"
          className="w-6 h-6 shrink-0"
          style={{background: 'none'}}
        />
        <span className="flex-1 text-center">카카오로 로그인</span>
      </button>

      {/* Naver Button */}
      <button
        type="button"
        onClick={() => onSocialLogin('naver')}
        className="
          w-full flex items-center gap-4 py-3 px-4 rounded-lg
          border-none
          text-[15px] font-bold
          shadow-sm
          transition
        "
        style={{
          backgroundColor: '#03C75A',
          color: '#fff',
          height: 40, minHeight: 40, maxHeight: 40
        }}
      >
        <img
          src="/icons/oauth/naver.svg"
          alt="Naver"
          className="w-6 h-6 shrink-0"
          style={{background: 'none'}}
        />
        <span className="flex-1 text-center">네이버로 로그인</span>
      </button>

      {/* GitHub Button */}
      <button
        type="button"
        onClick={() => onSocialLogin('github')}
        className="
          w-full flex items-center gap-4 py-3 px-4 rounded-lg
          border-none
          text-[15px] font-bold
          shadow-sm
          transition
        "
        style={{
          backgroundColor: '#24292F',
          color: '#fff',
          height: 40, minHeight: 40, maxHeight: 40
        }}
      >
        <span className="shrink-0">
          {/* GitHub 공식 마크 (SVG) */}
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
              -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.67.07-.52.28-.87.51-1.07
              -1.6-.18-3.29-.8-3.29-3.55 0-.78.28-1.42.74-1.92-.07-.18-.32-.91.07-1.89
              0 0 .6-.19 1.98.73a6.8 6.8 0 013.6 0c1.38-.92 1.98-.73 1.98-.73.39.98.14 1.71.07 1.89.46.5.74
              1.14.74 1.92 0 2.76-1.69 3.37-3.3 3.55.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01
              2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z">
            </path>
          </svg>
        </span>
        <span className="flex-1 text-center">GitHub로 로그인</span>
      </button>
    </div>
  );
}