# Refactor Summary (2025-10-01)

## 1. 개요

- `docs/TODO.md`의 6번과 7번 항목을 기반으로 **전용 설정 모달**을 추가하고 **테마 시스템(다크/라이트 모드)** 을 도입했습니다.
- 사용자는 이제 설정 모달을 통해 애플리케이션의 테마를 라이트, 다크, 또는 시스템 기본값으로 변경할 수 있습니다.

## 2. 주요 변경 사항

### 아키텍처 및 상태 관리

- **`ThemeContext` 추가 (`src/contexts/ThemeContext.tsx`):**
  - 테마 상태(`theme`)와 상태 변경 함수(`setTheme`)를 전역적으로 관리하기 위한 새로운 컨텍스트를 생성했습니다.
  - `localStorage`와 연동하여 사용자의 테마 설정을 브라우저에 저장하고, 앱 재실행 시에도 유지되도록 구현했습니다.
  - 시스템의 다크 모드 설정을 감지하여 `system` 옵션을 지원합니다.

- **`AppContext` 확장 (`src/contexts/AppContext.tsx`):**
  - 설정 모달의 `open/close` 상태를 관리하기 위해 `isSettingsModalOpen`과 `setIsSettingsModalOpen` 상태를 추가했습니다.

- **`RootLayout` 업데이트 (`src/app/layout.tsx`):**
  - 기존에 하드코딩되어 있던 `dark` 클래스를 `<html>` 태그에서 제거했습니다.
  - 최상위 레이아웃을 `ThemeProvider`로 감싸, 애플리케이션 전체에 테마 컨텍스트를 제공하도록 수정했습니다.

### 컴포넌트

- **`SettingsModal` 생성 (`src/components/SettingsModal.tsx`):**
  - `shadcn/ui`의 `Dialog` 컴포넌트를 기반으로 새로운 설정 모달을 구현했습니다.
  - 모달 내부에 라이트/다크/시스템 테마를 선택할 수 있는 버튼을 추가했습니다.
  - **색상 변경** 및 **배경화면 변경** 기능에 대한 UI를 구현했습니다.

- **`ChannelList` 수정 (`src/components/ChannelList.tsx`):**
  - 하단의 사용자 프로필 팝업 메뉴에서 **'Settings'** 항목을 제거했습니다.

- **`WindowFrame` 수정 (`src/components/WindowFrame.tsx`):**
  - 상단 메뉴 바에 **'Settings'** 아이콘 버튼을 추가하여 설정 모달을 직접 열 수 있도록 했습니다.

- **`MainPage` 수정 (`src/components/MainPage.tsx`):**
  - `SettingsModal` 컴포넌트를 렌더링하고, `AppContext`의 `isSettingsModalOpen` 상태와 연동하여 모달의 표시 여부를 제어합니다.

### 스타일

- **`tailwind.config.ts`:**
  - `darkMode: ['class']` 설정이 이미 존재하여 별도의 수정 없이 클래스 기반의 다크 모드를 활용했습니다.

- **`globals.css`:**
  - `:root`와 `.dark` 선택자에 정의된 CSS 변수를 통해 테마가 동적으로 적용되도록 했습니다.
  - `primary` 색상 커스터마이징을 위한 CSS 변수(`--blue-500`, `--red-500` 등)를 추가하고, `--primary-color` 변수가 이를 참조하도록 설정했습니다.

## 3. 의도 및 기대 효과

- **사용자 경험 개선:** 사용자가 자신의 선호에 맞게 앱의 외형을 직접 제어할 수 있게 되어 개인화된 경험을 제공합니다.
- **확장성 확보:** 향후 폰트 등 다양한 커스터마이징 기능을 추가할 수 있는 기반(테마 컨텍스트 및 설정 모달)을 마련했습니다.
- **유지보수성 향상:** 테마 관련 로직을 `ThemeContext`로 중앙화하여 코드의 분산을 막고 유지보수를 용이하게 만들었습니다.

## 4. 디버깅 및 개선

- **`ThemeContext.tsx` Export 오류 수정:** `useTheme` 훅과 `PrimaryColor` 타입이 모듈에서 제대로 내보내지지 않아 발생한 TypeScript 오류를 수정했습니다.
- **`WindowFrame`으로 설정 버튼 이동:** `ChannelList`의 드롭다운 메뉴에 숨겨져 있던 설정 버튼을 `WindowFrame`의 상단 메뉴 바로 이동하여 접근성을 높였습니다.
- **디버깅용 `console.log` 추가 및 제거:** `SettingsModal`이 올바르게 열리는지 확인하기 위해 `MainPage.tsx`에 `isSettingsModalOpen` 상태를 추적하는 `console.log`를 임시로 추가했다가, 기능 확인 후 제거했습니다.

## 5. 후속 TODO

- `[완료]` **색상 커스터마이징 기능 구현:** `SettingsModal`에 추가된 색상 팔레트 UI와 실제 CSS 변수를 연동하여 사용자가 앱의 주 색상을 변경할 수 있도록 구현했습니다.
- `[완료]` **배경화면 변경 기능 구현:** 사용자가 로컬 파일을 업로드하거나 제공된 이미지 중에서 선택하여 앱의 배경화면을 변경할 수 있는 기능을 구현했습니다.
- `[완료]` **테마 아이콘 적용:** 현재 `SettingsModal`의 테마 변경 버튼을 아이콘(예: 해, 달, 컴퓨터)으로 변경하여 시각적 직관성을 높였습니다.