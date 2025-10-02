# GEMINI – Next.js 현업용 가이드

> 이 문서는 Next.js 프로젝트에서 코드 작성, 구조, 스타일, 테스트 현업 기준으로 통합된 가이드입니다.

---

## 1. 프로젝트 구조
```
src/
├─ app/
│  ├─ (auth)/              # 인증 관련 페이지 그룹
│  │   ├─ login/page.tsx
│  │   ├─ register/page.tsx
│  │   └─ layout.tsx
│  ├─ (main)/              # 메인 서비스 그룹
│  │   ├─ dashboard/page.tsx
│  │   └─ layout.tsx
│  ├─ api/                 # API Route Handlers
│  │   ├─ users/route.ts
│  │   └─ auth/route.ts
│  ├─ layout.tsx           # 전역 레이아웃
│  └─ page.tsx             # 루트 페이지
│
├─ components/             # 재사용 UI 컴포넌트
├─ features/               # 도메인 단위 기능 모듈 (auth, chat, profile 등)
├─ hooks/                  # 커스텀 훅
├─ lib/                    # 외부 API 호출, 설정, 라이브러리 래퍼
├─ utils/                  # 순수 함수, 유틸리티
├─ styles/                 # 글로벌 스타일
├─ types/                  # 타입 정의
tests/                     # 단위/통합 테스트
public/                    # 정적 리소스
docs/                      # 프로젝트 문서
```

---

## 2. 네이밍 규칙

- **컴포넌트**: PascalCase (`UserCard.tsx`)  
- **페이지/라우트**: kebab-case (`profile-settings/page.tsx`)  
- **함수/변수**: camelCase (`fetchUserData`)  
- **상수**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)  
- **훅**: use 접두사 (`useUserData.ts`)  
- **그룹 폴더**: 괄호 사용 → (auth), (main)

---

## 3. 코드 스타일

- 들여쓰기: 1칸  
- 문자열: single quote `'`  
- 줄 길이: 120자  
- JSX props: 한 줄 최대 3개, 길면 줄바꿈  
- 조건문: 항상 `{}` 사용  
- 주석:
  - 기능 설명: `// 설명`  
  - TODO/FIXME: `// TODO: ...`, `// FIXME: ...`  

---

## 4. 컴포넌트 작성

- 함수형 컴포넌트만 사용  
- props 타입 명시 (interface or type) 
- UI와 로직 분리 (UI → 컴포넌트 / 로직 → 훅 or features)
- Server Component 기본, 필요 시 Client Component

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```
---

## 5. 페이지 & 라우트

- App Router 기준 app/page.tsx 또는 app/(feature)/page.tsx
- 그룹화: (auth), (main) 등 도메인 단위
- API는 app/api/*/route.ts 사용
- not-found.tsx / error.tsx 작성 필수

---

## 6. API & 데이터 통신

-API 호출: lib/api.ts 또는 hooks/useApi.ts

-SWR / React Query 권장

-에러 처리 필수 (try/catch)

```tsx
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}

// lib/api.ts
export async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}
```

---

## 7. 스타일 & UI

- Tailwind CSS + shadcn/ui 조합 권장
- 전역 스타일: styles/globals.css
- 컴포넌트 단위: Tailwind 클래스 사용
- 필요 시 Component.module.css 보조 사용

---

## 8. 체크리스트 (Next.js 프로젝트 시작용)

- App Router 구조 확인 (app/)
- 도메인 그룹화 폴더 구성 ((auth), (main))
- 공통 레이아웃 구현 (layout.tsx)
- 컴포넌트/훅 분리 완료 (components/, hooks/)
- API 라우트 정의 (app/api/*/route.ts)
- 스타일링 규칙 적용 (Tailwind + shadcn/ui)
- 타입 정의 완료 (types/)
- 단위/통합 테스트 작성 (tests/)
- E2E 테스트 환경 준비 (Playwright/Cypress)
- ESLint + Prettier 설정 (eslint-config-next)
- 문서화 (docs/)

---

## 9. 추가 팁
- 읽기 쉬운 코드 > 짧은 코드
- 도메인별 features 분리 → 재사용성 ↑ 유지보수성 ↑
- API/비즈니스 로직은 반드시 docs/에 문서화

---

## 10. 워크플로우 규칙

- **작업 시작 전** 반드시 `./docs/` 폴더 내 최신 리팩토링 기록(`refactor_summary_YYYY-MM-DD.md`) 확인
  - 최근 변경 사항, 코드 스타일, 구조 개선 내용을 먼저 리뷰한 후 개발 시작
  - 예: `docs/refactor_summary_2025-09-26.md`
- 새로운 작업/리팩토링을 마무리할 때는 반드시 같은 규칙으로 **refactor_summary 파일 생성**
  - 파일명 규칙: `refactor_summary_YYYY-MM-DD.md`
  - 주요 변경 사항, 의도, 후속 TODO 기록
- `npm run dev` 실행 시 predev 훅을 통해 최신 refactor_summary를 출력하도록 설정 권장
- CI/CD, 코드리뷰 전 반드시 최신 refactor_summary 반영 여부 확인

---