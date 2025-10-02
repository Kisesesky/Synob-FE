# 리팩토링 요약 - 2025-10-02

## 1. 개요

이번 리팩토링은 다양한 UI 컴포넌트에 걸쳐 포괄적인 라이트/다크 모드 테마를 구현하고, 이 과정에서 발생한 구조적 JSX 문제를 해결하는 데 중점을 두었습니다. 목표는 라이트 및 다크 테마 모두에서 일관되고 읽기 쉬운 사용자 경험을 보장하고, 설정에서 "색상" 옵션의 기능을 명확히 하는 것이었습니다.

## 2. 주요 변경 사항 및 적용된 테마

### A. SettingsModal.tsx 개선
- **라이트 모드 가독성 수정:** 라이트 모드에서 텍스트 및 요소의 적절한 가시성을 보장하기 위해 `DialogContent`에 `bg-white dark:bg-gray-800 text-black dark:text-white`를 적용했습니다.
- **색상 사용자 정의 명확화:** "색상" 섹션에 "애플리케이션의 기본 색상을 사용자 정의합니다. 이 설정은 테마 설정과 독립적으로 작동합니다."라는 설명 문구를 추가하여 기능을 명확히 했습니다.

### B. 핵심 UI 컴포넌트 테마 (ChannelList, ChatArea, MessageItem, ThreadMessageItem, EmojiPicker)

**일반적인 접근 방식:** 하드코딩된 `bg-gray-X`, `text-gray-Y`, `border-gray-Z`, `hover:bg-gray-A` 클래스를 테마 인식 등가물(예: `bg-white dark:bg-gray-X`, `text-black dark:text-white`, `border-gray-200 dark:border-gray-Z`, `hover:bg-gray-100 dark:hover:bg-gray-A`)로 대체했습니다. 라이트 모드에서 특정 `text-gray-X` 값을 `text-gray-700` 또는 `text-gray-800`으로 조정하여 대비 및 가독성을 향상시켰습니다.

- **MainPage.tsx:**
  - 메인 컨테이너: `bg-white dark:bg-gray-800 text-black dark:text-white`

- **ChannelList.tsx:**
  - **구조적 수정:** `Dialog` 및 `DialogContent` 요소의 깨진 JSX 구조를 수정하여 적절한 중첩을 보장하고 각 다이얼로그 블록에 테마를 다시 적용했습니다.
  - 메인 컨테이너: `bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`.
  - 서버 이름 헤더: `border-b border-gray-200 dark:border-gray-900`, `hover:bg-gray-200 dark:hover:bg-gray-700`, `text-black dark:text-white`, `Settings` 아이콘 `text-gray-500 dark:text-gray-400`.
  - 드롭다운 메뉴 (`DropdownMenuContent`, `DropdownMenuSubContent`): `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white`.
  - 카테고리 헤더: `text-gray-700 dark:text-gray-400`, `hover:text-black dark:hover:text-gray-200`.
  - 채널 항목: 선택/읽지 않음 상태에 대한 `text`, `bg`, `hover:bg`, `hover:text` 조건부 클래스 업데이트. 아이콘 및 읽지 않음 표시기도 테마 적용.
  - 사용자 프로필 섹션: `border-t border-gray-200 dark:border-gray-900`, `bg-gray-200 dark:bg-gray-850`, `hover:bg-gray-300 dark:hover:bg-gray-800`. 아바타 `bg-gray-400 dark:bg-gray-600`, 온라인 표시기 `border-gray-200 dark:border-gray-850`.
  - 다이얼로그 (`DialogContent`, `Input`): 콘텐츠는 `bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700`; 입력은 `bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white`.

- **ChatArea.tsx:**
  - 메인 컨테이너: `bg-white dark:bg-gray-700 border-l border-gray-200 dark:border-gray-800`.
  - 플레이스홀더 텍스트: `text-gray-700 dark:text-gray-400`.
  - 헤더 아이콘: `text-gray-700 dark:text-gray-400`, `hover:text-gray-900 dark:hover:text-white`.
  - 날짜 구분선: `border-t border-gray-200 dark:border-gray-700`, `text-gray-700 dark:text-gray-400`.
  - 답장 컨텍스트: `bg-gray-100 dark:bg-gray-700`, `border-b border-gray-200 dark:border-gray-600`. 라이트 모드 가시성을 위해 텍스트 색상 및 아이콘 색상 조정.
  - 보류 중인 파일 미리보기: `bg-gray-200 dark:bg-gray-800`, `border-b border-gray-300 dark:border-gray-600`. 파일 아이콘, 텍스트 및 닫기 버튼 색상 조정.
  - 메시지 입력: `bg-gray-100 dark:bg-gray-600`. 플러스 아이콘 및 입력 텍스트 색상 조정.

- **MessageItem.tsx:**
  - 메인 메시지 컨테이너: `hover:bg-gray-100 dark:hover:bg-gray-800/50`.
  - 작성자 아바타: `bg-gray-400 dark:bg-gray-600`.
  - 답장 메시지 미리보기: 텍스트 및 아바타 색상 조정.
  - 작성자 이름 및 타임스탬프: 텍스트 색상 조정.
  - 메시지 편집 입력: 입력 필드, 힌트 텍스트 및 "교체" 버튼 색상 조정.
  - 메시지 텍스트: `text-gray-800 dark:text-gray-200`.
  - 파일 첨부 링크: 배경, 테두리 및 호버 색상 조정.
  - 반응: 버블 배경/호버, 스마일 아이콘, DropdownMenuContent/Item 색상 조정.
  - 스레드 답장 수: `text-xs text-blue-600 dark:text-blue-400`.
  - 호버 액션 메뉴: 배경 및 버튼 호버 색상 조정.
  - 메시지 컨텍스트 메뉴 (`DropdownMenuContent`, `DropdownMenuSubContent`): 배경, 테두리 및 텍스트 색상 조정.

- **ThreadMessageItem.tsx:**
  - 메인 메시지 컨테이너: `hover:bg-gray-100 dark:hover:bg-gray-800/50`.
  - 작성자 아바타: `bg-gray-400 dark:bg-gray-600`.
  - 작성자 이름 및 타임스탬프: 텍스트 색상 조정.
  - 답장 메시지 미리보기: 텍스트 및 아바타 색상 조정.
  - 메시지 편집 입력: 입력 필드, 힌트 텍스트 및 "교체" 버튼 색상 조정.
  - 메시지 텍스트: `text-gray-800 dark:text-gray-200`.
  - 파일 첨부 링크: 배경, 테두리 및 호버 색상 조정.
  - 반응: 버블 배경/호버, 스마일 아이콘, DropdownMenuContent/Item 색상 조정.
  - 호버 액션 메뉴: 배경 및 버튼 호버 색상 조정.
  - 메시지 컨텍스트 메뉴 (`DropdownMenuContent`, `DropdownMenuSubContent`): 배경, 테두리 및 텍스트 색상 조정.

- **EmojiPicker.tsx:**
  - 메인 컨테이너: `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white`.
  - 카테고리 사이드바: 테두리 및 버튼 색상 조정.
  - 카테고리 제목: `text-gray-700 dark:text-gray-400`.
  - 이모지 그리드 항목: `hover:bg-gray-200 dark:hover:bg-gray-700`.
  - 트리거 버튼: `text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white`.

### C. 기타 모달, 뷰 및 패널 테마

- **AddFriendDialog.tsx:**
  - `DialogContent`: `bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700`.
  - `Input` 필드: `bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white`.
  - 검색 결과 사용자 항목: 컨테이너 `bg-gray-100 dark:bg-gray-700`, 아바타 `bg-gray-400 dark:bg-gray-600`.

- **AuthModal.tsx:**
  - **구조적 수정:** JSX 구조 오류를 수정하고 올바른 테마를 보장하기 위해 전체 `return` 문을 교체했습니다.
  - `Card`: `bg-white dark:bg-gray-900 text-black dark:text-white border-gray-200 dark:border-gray-700`.
  - `CardDescription`: `text-gray-700 dark:text-gray-400`.
  - 프로필 사진 섹션: 컨테이너 `bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600`, `UserRoundPlus` 아이콘 `text-gray-700 dark:text-gray-400`.
  - 계정 정보 `Input` 필드: `bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-500 text-black dark:text-white`.
  - 이메일 힌트 컨테이너/항목: `bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600`, 항목 `hover:bg-gray-200 dark:hover:bg-gray-600`, `bg-gray-200 dark:bg-gray-600`.
  - 비밀번호 토글 버튼: `text-gray-700 dark:text-gray-400`.
  - 비밀번호 강도 바: `bg-gray-300 dark:bg-gray-600`.
  - 로그인 모드 구분선: `border-t border-gray-300 dark:border-gray-700`, 텍스트 `bg-white dark:bg-gray-800 px-2 text-gray-700 dark:text-gray-500`.
  - 푸터 텍스트: `text-gray-700 dark:text-gray-400`, 링크 버튼 `text-blue-600 dark:text-blue-400`.

- **UserProfileModal.tsx:**
  - `DialogContent`: `bg-white dark:bg-gray-900 text-black dark:text-white border-gray-200 dark:border-gray-700`.
  - 헤더 배경: `bg-gray-200 dark:bg-gray-700`.
  - 아바타: `bg-gray-400 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-900`.
  - 상태 텍스트: `text-gray-700 dark:text-gray-400`.
  - 구분선: `border-gray-300 dark:border-gray-700`.
  - "About Me" 제목: `text-gray-700 dark:text-gray-400`.

- **AnnouncementsPanel.tsx:**
  - 메인 컨테이너: `bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700`.
  - 헤더: `border-b border-gray-200 dark:border-gray-700`, `h3` 텍스트 `text-black dark:text-white`, `X` 아이콘 `text-black dark:text-white`.
  - 콘텐츠 텍스트: `text-gray-700 dark:text-gray-400`.

- **FriendsList.tsx:**
  - 메인 컨테이너: `bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`.
  - 헤더: `border-b border-gray-200 dark:border-gray-900`, `h2` 텍스트 `text-black dark:text-white`.
  - 보류 중인 요청 섹션: `h3` 제목 `text-gray-700 dark:text-gray-400`, 사용자 항목 컨테이너 `hover:bg-gray-200 dark:hover:bg-gray-700`, 아바타 `bg-gray-400 dark:bg-gray-600`, 이름 `text-black dark:text-white`, 요청 텍스트 `text-gray-700 dark:text-gray-400`, 버튼 `hover:bg-gray-200 dark:hover:bg-gray-600`.
  - 모든 친구 섹션: `h3` 제목 `text-gray-700 dark:text-gray-400`, 친구 항목 컨테이너 `hover:bg-gray-200 dark:hover:bg-gray-700`, 아바타 `bg-gray-400 dark:bg-gray-600`, 이름 `text-black dark:text-white`, 상태 텍스트 `text-gray-700 dark:text-gray-400`, `DropdownMenuContent` `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-black dark:text-white`.

- **LockScreen.tsx:**
  - 로딩 상태: `bg-white dark:bg-gray-900 text-black dark:text-white`.

- **NotificationsPanel.tsx:**
  - 메인 컨테이너: `bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700`.
  - 헤더: `border-b border-gray-200 dark:border-gray-700`, `h3` 텍스트 `text-black dark:text-white`, `X` 아이콘 `text-black dark:text-white`.
  - 콘텐츠 텍스트: `text-gray-700 dark:text-gray-400`.

- **PinnedMessagesPanel.tsx:**
  - 메인 컨테이너: `bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700`.
  - 헤더: `border-b border-gray-200 dark:border-gray-700`, `h3` 텍스트 `text-black dark:text-white`, `X` 아이콘 `text-black dark:text-white`.
  - 콘텐츠 텍스트: `text-gray-700 dark:text-gray-400`.

- **ServerList.tsx:**
  - **구조적 수정:** 홈 아이콘 및 구분선의 깨진 JSX 구조를 수정했습니다.
  - 홈 아이콘: `bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:-translate-y-2 text-black dark:text-white`.
  - 구분선: `border-l border-gray-300 dark:border-gray-700`.
  - 서버 아이콘: `bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:-translate-y-1 text-black dark:text-white`.
  - 서버 추가 버튼: `bg-gray-200 dark:bg-gray-700 hover:bg-green-500 text-black dark:text-white`.
  - 서버 추가 다이얼로그: `DialogContent` `bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700`, `Input` `bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white`.

- **SearchView.tsx:**
  - 메인 컨테이너: `bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700`.
  - 헤더: `border-b border-gray-200 dark:border-gray-700`, 아이콘 `text-black dark:text-white`, `h3` 텍스트 `text-black dark:text-white`.
  - 상단 검색 입력: `bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white`.
  - 필터 섹션: 컨테이너 `border-b border-gray-200 dark:border-gray-800`, `Label` `text-gray-700 dark:text-gray-400`, `select` 필드 `bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white`, `Input` 타입 `date` `bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white`, `span` "to" `text-gray-700 dark:text-gray-400`, `Checkbox` `border-gray-300 dark:border-gray-600`, `Label` for checkbox `text-gray-700 dark:text-gray-300`.
  - "결과 없음" 텍스트: `text-gray-700 dark:text-gray-400`.
  - "더 보기" 버튼: `bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white`.

## TODO (2025-10-02 추가)

### 1. SettingsModal 기능 확장: 계정 및 프로필 설정 추가
- **목표:** `SettingsModal`에 사용자 계정 및 프로필 관리 기능을 통합하여 사용자 경험 개선.
- **세부 계획:**
    - `SettingsModal.tsx` 내부에 `shadcn/ui`의 `Tabs` 컴포넌트를 활용하여 "테마", "내 계정", "프로필" 탭 추가.
    - **"내 계정" 탭 (`MyAccountSettings.tsx` 컴포넌트):**
        - 이름, 이메일, 전화번호 변경 기능 구현.
        - 계정 비활성화 및 계정 삭제 기능 구현 (확인 다이얼로그 포함).
        - 잠금화면 비밀번호 설정 기능 구현.
    - **"프로필" 탭 (`ProfileSettings.tsx` 컴포넌트):**
        - 별명, 상태 메시지, 소개글 변경 기능 구현.
        - 아바타 사진 및 배경 사진 변경 기능 구현 (업로드/선택).
    - `src/lib/types.ts`의 사용자 데이터 모델 업데이트.
    - 사용자 정보 업데이트를 위한 API 연동 준비 (필요 시 `app/api/users/route.ts` 수정).
    - 관련 상태 관리 로직 (`useUIManagement.ts` 또는 `useUserManagement.ts`) 확장。

### D. SettingsModal UI/UX 개선

이번 작업에서는 `SettingsModal` 내의 `MyAccountSettings.tsx` 및 `ProfileSettings.tsx` 컴포넌트의 사용자 인터페이스를 개선하여 사용자 경험을 향상시켰습니다.

- **MyAccountSettings.tsx:**
  - **페이지 제목 추가:** 컴포넌트 상단에 명확한 "내 계정 설정" 제목을 추가하여 페이지의 목적을 명확히 했습니다.
  - **비밀번호 가시성 토글 구현:** 잠금 화면 비밀번호 입력 필드에 비밀번호를 표시/숨길 수 있는 토글 버튼(Eye/EyeOff 아이콘)을 추가하여 사용 편의성을 높였습니다.
  - **섹션 시각적 분리:** "기본 정보", "보안", "계정 관리" 섹션 사이에 가로선(`hr`)을 추가하여 시각적 구분을 명확히 했습니다.
  - **계정 관리 버튼 레이아웃 개선:** "계정 비활성화" 및 "계정 삭제" 버튼을 수직으로 정렬하고 내용에 맞게 너비를 조절하여 가독성과 사용성을 향상시켰습니다.

- **ProfileSettings.tsx:**
  - **페이지 제목 추가:** 컴포넌트 상단에 명확한 "프로필 설정" 제목을 추가하여 페이지의 목적을 명확히 했습니다.
  - **섹션 시각적 분리:** "기본 프로필 정보" 및 "프로필 이미지" 섹션 사이에 가로선(`hr`)을 추가하여 시각적 구분을 명확히 했습니다.
  - **아바타 업로드 UI 개선:**
    - 아바타 미리보기 영역 자체를 클릭 가능하게 만들고, 호버 시 "아바타 변경" 텍스트 오버레이를 표시하도록 하여 상호작용성을 높였습니다.
    - 중복되는 "아바타 업로드" 버튼을 제거하여 UI를 간소화했습니다.
  - **Next.js Image 컴포넌트 사용 일관성 확보:** `next/image`의 `Image` 컴포넌트가 `NextImage`로 일관되게 임포트 및 사용되도록 수정하여 잠재적인 충돌을 방지하고 이미지 렌더링을 최적화했습니다.

## 3. 기타 수정 사항

- **next.config.ts 업데이트:** `next/image` 컴포넌트가 모든 `http` 또는 `https` 소스의 이미지를 로드할 수 있도록 `images.domains` 설정을 `images.remotePatterns`로 변경했습니다.
- **useMessageManagement.ts 업데이트:** `currentUser` prop이 변경될 때 내부 `users` 상태를 업데이트하는 `useEffect` 훅을 추가하여 사용자 프로필 업데이트가 `ChatArea` 및 `ChannelList`에 올바르게 반영되도록 했습니다.
- **ChatArea.tsx 및 MessageItem.tsx TypeScript 오류 수정:** `User` 타입에 `avatar` 또는 `name` 속성이 없다는 오류를 `avatarUrl` 및 `fullName` 또는 `nickname`을 사용하도록 수정했습니다. 또한 `msg.file` 속성에 대한 `Object is possibly 'null'` 오류를 optional chaining 및 fallback 값으로 처리했습니다.
- **ChatArea.tsx 및 MessageItem.tsx 아바타 표시 수정:** 채팅 섹션에서 아바타가 이미지 URL 문자열 대신 `NextImage` 컴포넌트 또는 대체 `div`로 올바르게 표시되도록 수정했습니다.
- **MessageItem.tsx `currentUser` nullability 수정:** `currentUser`가 `null`일 수 있는 경우 `currentUser.id`에 접근할 때 발생하는 TypeScript 오류를 해결하기 위해, 호버 액션 블록과 컨텍스트 메뉴 액션 블록 모두에서 `currentUser`에 대한 null 검사 후 non-null assertion operator (`!`)를 사용하여 `currentUser.id`에 접근하도록 수정했습니다.