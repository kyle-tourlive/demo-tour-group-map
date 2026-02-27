# 프로젝트 컨텍스트 (Project Context)

이 문서는 TourLive 관리자 도구(Tour Group & Map) 프로젝트의 진행 상황, 주요 기술적 결정 사항, 그리고 개발된 기능들의 히스토리를 요약하여 기록합니다.

## 기술 스택 (Tech Stack)
- **프레임워크**: Next.js 15 (App Router), React 19
- **언어**: TypeScript
- **스타일링**: Tailwind CSS, `clsx`, `tailwind-merge`
- **아이콘**: `lucide-react`
- **API 클라이언트**: `axios` (Base URL: `https://stage-api.tourlive.co.kr`, Bearer Auth 적용)

## 주요 구현 사항 및 히스토리

### 1. 프로젝트 초기화 (2026-02-27)
- `create-next-app`을 사용하여 TypeScript, Tailwind CSS 기반의 Next.js 프로젝트 생성 완료.
- 스테이지 서버와의 통신을 위한 API 인터페이스 모델(`TourTrack`, `TourGroupV2`, `TourMap` 등) 및 전역 Axios 인스턴스 구축 (`src/lib/api.ts`).
- 상단 네비게이션과 우측 패널을 통합하는 레이아웃 및 검색 가능한 Tour ID 진입 화면(Home) 구현.

### 2. Tour Group 관리 (2026-02-27)
- `src/components/TourGroupManager.tsx`에 구현 완료.
- 좌측에 해당 투어의 전체 트랙 리스트 렌더링.
- 우측에 생성된 그룹(TourGroupV2) 목록 조회 및 신규 생성/삭제 반영.
- **Drag & Drop 로직 적용**: 좌측 트랙 목록에서 항목을 넘겨 우측 그룹 박스에 드롭하면, 해당 그룹의 `TourGroupV2Tracks`에 새 인덱스와 함께 추가되도록 구현. (제거 기능 포함)

### 3. Tour Map 관리 (2026-02-27)
- `src/components/TourMapManager.tsx`에 구현 완료.
- API 키 관리 및 과금 방지를 위하여 Google Map 기능의 정책을 일부 수정함.
- **Google Map**: 실제 웹 지도를 띄우지 않고, `latitude` / `longitude`를 텍스트로 입력할 수 있는 **스프레드시트(데이터 통계형 그리드)** UI 적용. 포인트별로 Track/SubMap 핀 타입을 구분해 배정 가능.
- **SVG Map**: Base64 혹은 URL 기반 SVG 맵 이미지를 지원하며, 이미지 영역 내부 클릭 이벤트의 `clientX / clientY`와 `getBoundingClientRect()` 속성을 활용해, 좌측 상단(0,0) 우측 하단(1,1) 기준 비율 좌표기반인 `anchor_x`, `anchor_y` 값을 자동 캡처하여 포인트로 등록.

### 4. 트러블슈팅 및 기능 고도화 (2026-02-27)
- **API 응답 구조 대응**: 기존 `data.results` 매핑 방식에서 실제 Stage 서버 응답 포맷인 `{ "success": true, "data": [...] }` 구조에 맞추어 `data.data`로 반환되도록 Axios 호출부를 전면 수정.
- **Group Tracks 응답 필드 수정**: 트랙 하위 정보 매핑 시 `{ track_id }` 대신 API가 실제로 반환하는 `{ tour_track }` 필드를 사용하도록 모델(`TourGroupV2Tracks.tour_track`) 수정.
- **Nested Groups (서브 그룹) 렌더링 지원**: Tour 그룹 API에서 `parent` 필드를 활용, `GroupCard` 컴포넌트를 분리 및 재귀 함수로 구현하여 하위 그룹이 있을 경우 들여쓰기(Indentation) 및 좌측 테두리 색상으로 시각적 Depth 표현을 추가.
- **환경 변수 분리**: 하드코딩되어 있던 인증 토큰(`kyle_...`)을 `.env.local`의 `NEXT_PUBLIC_TOURLIVE_API_TOKEN` 으로 안전하게 격리하고, 문서(`project_req.md`, `implementation_plan.md`) 내의 민감한 내용을 마스킹 처리하여 보안을 강화함.

## 향후 과제 및 개선 포인트
- Drag and Drop으로 배정된 트랙들의 순서(Index)를 시각적으로 변경하는(Sortable) UX 개선.
- API 호출 시 발생하는 에러(403 Forbidden 등)에 대해 토스트알림(Toast) 등으로 에러 핸들링 고도화 적용 필요.
