# Refactor Summary: 2025-09-29

## 1. `AppContext` 리팩토링: 컨텍스트 분리

- `AppContext.tsx`의 거대한 컨텍스트를 기능별로 분리하여 다음과 같은 커스텀 훅을 생성했습니다.
  - `useServerManagement.ts`: 서버, 카테고리, 채널 관련 상태 및 로직 관리
  - `useMessageManagement.ts`: 메시지, 스레드, DM 관련 상태 및 로직 관리
  - `useSearchManagement.ts`: 검색 관련 상태 및 로직 관리
  - `useUIManagement.ts`: UI 상태 (컨텍스트 메뉴) 관리
- `AppContext.tsx`를 리팩토링하여 새로 만든 훅들을 사용하도록 구조를 변경했습니다.

## 2. 타입 안정성 강화: Branded Types 도입

- ID 값들의 타입 안정성을 높이기 위해 `brandedTypes.ts` 파일을 생성하고 `ServerId`, `ChannelId`, `UserId`, `MessageId`, `CategoryId` 타입을 정의했습니다.
- `types.ts`의 모든 ID 필드를 새로운 브랜디드 타입으로 교체했습니다.
- `mockData.ts`의 모든 ID 값을 새로운 타입으로 캐스팅했습니다.
- 전체 코드베이스 (훅, 컴포넌트)에 걸쳐 새로운 타입을 적용하고, 타입 에러를 수정했습니다.

## 3. 성능 최적화 및 버그 수정

- `FriendsList.tsx`에서 `handleDmChannelSelect` 함수가 누락된 버그를 수정했습니다.
  - `useMessageManagement.ts`에 `handleDmChannelSelect` 함수를 추가하고 관련 로직을 구현했습니다.
- `FriendsList.tsx` 컴포넌트를 `React.memo`로 래핑하여 불필요한 리렌더링을 방지했습니다.
- `ChannelList.tsx`에서 불필요한 `console.log`를 제거했습니다.

## 4. 이모지 피커(Emoji Picker) 기능 추가 및 개선

- **기능 추가**:
  - `emojis.ts`: 이모지 데이터와 카테고리를 정의하는 파일을 생성했습니다.
  - `EmojiPicker.tsx`: `emojis.ts` 데이터를 기반으로 이모지를 선택할 수 있는 UI 컴포넌트를 구현했습니다. 초기에는 긴 스크롤 방식이었으나, 사용자의 피드백을 반영하여 카테고리별 탭 UI로 개선했습니다.
  - `ChatArea.tsx`: 채팅 입력창에 이모지 피커를 통합하여 사용자가 이모지를 메시지에 추가할 수 있도록 했습니다.
- **버그 수정 및 안정화**:
  - `lucide-react` 라이브러리에서 잘못된 아이콘 이름을 (`Futbol`, `Utensils`) 올바른 이름(`SoccerBall`, `UtensilsCrossed`)으로 수정하여 렌더링 오류를 해결했습니다.
  - `EmojiPicker.tsx`에서 TypeScript 타입 오류를 해결하여 컴포넌트 안정성을 높였습니다.
- **UI/UX 개선**:
  - 사용자의 요청에 따라 이모지 피커의 레이아웃을 상단 탭에서 좌측 탭 방식으로 변경했습니다.
  - 아이콘 크기 및 그리드 수(9 -> 7)를 조정하여 레이아웃을 다듬었습니다.

## 5. 컨텍스트 메뉴(Context Menu) 동작 리팩토링

- **문제 해결**: `ChannelList.tsx`에서 카테고리 항목을 좌클릭 시 컨텍스트 메뉴가 열리면서 카테고리가 접히거나 펼쳐지지 않는 문제를 해결했습니다.
- **리팩토링**:
  - `useUIManagement.ts` 훅을 수정하여 컨텍스트 메뉴의 상태에 마우스 좌표(x, y)를 포함하도록 변경했습니다.
  - `ChannelList.tsx`, `MessageItem.tsx`, `ThreadMessageItem.tsx`의 모든 컨텍스트 메뉴 로직을 리팩토링했습니다.
  - 이제 좌클릭은 각 항목의 고유 기능(토글, 선택 등)을 수행하고, 우클릭 시에만 해당 위치에 컨텍스트 메뉴가 나타나도록 동작 방식을 통일하고 안정화했습니다.

## 6. 검색 기능 수정 및 개선

- **버그 수정**:
  - 검색창이 열리자마자 바로 닫히는 버그를 수정했습니다. (`useSearchManagement.ts`)
  - `searchLimit` 변수가 `useState`로 잘못 선언되어 발생하던 오류를 `const` 상수로 변경하여 해결했습니다.
- **UI/UX 개선**:
  - 사용자의 제안에 따라, 검색 UI를 2단계(검색 조건 입력 -> 검색 결과 표시)로 변경했습니다.
  - `hasSearched` 상태를 추가하여 조건부 렌더링을 구현하고, 결과창에서 필터창으로 돌아갈 수 있는 "뒤로가기" 버튼을 추가했습니다.

## 7. 서버 목록 애니메이션 개선

- **UI/UX 개선**: `ServerList.tsx`의 서버 아이콘 스타일을 개선했습니다.
  - 기본 모양을 원형에서 둥근 사각형으로 변경했습니다.
  - 마우스를 올리거나 선택했을 때, 위로 살짝 튀어 오르는 듯한 "pop" 애니메이션을 추가하여 시각적 피드백을 강화했습니다.

## TODO

- 없음.