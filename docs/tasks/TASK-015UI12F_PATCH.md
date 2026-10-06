# TASK-015UI12F_PATCH: UI12F 후속 긴급 패치 — 데스크톱 레이아웃 붕괴·검색 UX·Mock 고지 정리·중첩 main·빌드 버전 표시

## Status

READY

> TASK-015UI12F(DONE, 커밋 `7a3e727`)가 완료된 Git 상태 위에서 진행한다.
> UI12F 커밋 후 실제 브라우저 검증에서 5대 결함/요구사항이 식별되어 긴급 패치로 처리한다.
> 신규 기능·신규 Mock 데이터·신규 타입 필드·신규 패키지 추가 없이, 레이아웃 마감·검색 동작 조정·잔여 Mock 고지 정리·마크업 시맨틱 수정·빌드 버전 표시만 수행한다.

## Goal

UI12F 커밋 이후 브라우저 검증에서 식별된 다음 5개 항목을 해결한다.

1. **(BLOCKER) 데스크톱 경기 목록 레이아웃 붕괴** — 1440px에서 `.profile-dashboard-grid`의 stretch로 날짜별 경기 그룹 사이에 거대한 빈 영역이 벌어지는 현상 해결.
2. **(MAJOR) 홈페이지 검색 UX** — Riot ID 형식 검증을 우회하고, 입력값/빈 칸 유무와 관계없이 무조건 고정 데모 프로필(`/players/demo-puuid-seoul-duelist-001`)로 즉시 진입.
3. **(MAJOR) Mock 고지 단일화 누락 정리** — 헤더 `meta-badges`의 `Demo Profile`·`Mock Data` 등 렌더링 제거, 최근 20판 안내·DDΔ/R 툴팁 등에 남은 `Mock` 명칭을 정적/순화된 텍스트로 보완.
4. **(MINOR) 중첩 `<main>` 구조 수정** — `PlayerProfile.tsx`의 `<main className="profile-main">`을 `<div className="profile-main">`으로 수정.
5. **(NEW) Git 커밋 버전 동적 표시** — `next.config.js`에서 빌드 시점 Git 커밋 해시(`git rev-parse --short HEAD`)를 환경 변수로 추출해 `AppVersionBadge.tsx` 배지에 동적 노출하고, UI Build 라벨을 `UI12F_PATCH`로 갱신.

## Background

- UI12F는 전역 Mock 고지 단일화와 390px/1440px 반응형 마감을 목표로 DONE 처리되었으나, 실제 화면 검증에서 아래 잔여 결함이 확인되었다.
- `.profile-dashboard-grid`는 `display: grid`이며 `grid-template-columns: clamp(292px, 23vw, 318px) minmax(0, 1fr)`로 정의되어 있다(`globals.css:469-474`). grid 항목의 기본 `align-items: stretch`로 인해 `.profile-main`/내부 날짜 그룹이 세로로 늘어나면서 경기 그룹 사이 빈 영역이 발생할 수 있다.
- 현재 `HomeSearch.tsx`는 `RIOT_ID_PATTERN`으로 형식을 검증하고 실패 시 에러를 노출하며, 통과 시 `SeoulDuelist#KR1` 데모를 찾아 이동한다(`HomeSearch.tsx:34-50`). 데모 단계에서는 어떤 입력이든 고정 데모 프로필로 진입시키는 편이 시연 흐름에 부합한다.
- UI12F에서 컴포넌트 내부 Mock 배지는 정리되었으나, 데이터 소스(`profile-overview.ts`)와 일부 컴포넌트에 잔여 Mock 명칭이 남아 있다:
  - `profile-overview.ts:38` `badges: ["Demo Profile", "Mock Data", "Preview Score"]` → `PlayerHeaderCard.tsx:88-91`의 `meta-badge`로 렌더링됨.
  - `profile-overview.ts:89` `sampleLabel: "최근 20판 Mock 집계"`.
  - `RecentTwentySummaryCard.tsx:35` `{summary.sampleLabel} 기준 통계 데이터입니다.`
  - `MatchSummaryList.tsx:293` DDΔ/R 툴팁 `"... Mock 가공 집계 값입니다."`
- `PlayerProfile.tsx:54`에 페이지 루트 `<main>`(`src/app` layout) 하위로 또 다른 `<main className="profile-main">`이 중첩되어 있어 시맨틱상 단일 `main` 규칙을 위반한다.
- `AppVersionBadge.tsx`는 `UI_BUILD_LABEL = "UI10A"` 고정값과 `package.json` version만 표시해, 화면이 최신 빌드본인지 식별할 수 없다.

## Reference Direction

- OP.GG/Tracker.gg처럼 날짜별 경기 그룹이 위에서 아래로 자연스러운 높이로 흐르고, 데모임을 헤더 1곳(`Mock Preview` 배지)에서만 기품 있게 알린다.
- 빌드 식별 배지는 우하단에 작게 유지하되, 현재 커밋을 식별할 수 있도록 짧은 해시를 노출한다.

## Allowed Changes

- `frontend/src/app/globals.css`
  - `.profile-dashboard-grid` 및 관련 셀(`.profile-rail`, `.profile-main`, 날짜 그룹)의 정렬(`align-items`/`align-content`/`align-self`) 또는 높이 거동을 조정해 1440px stretch 빈 영역 제거.
  - (필요 시) `Mock Preview` 배지 호버 툴팁 등 기존 스타일 유지 범위 내 미세 조정.
- `frontend/src/components/HomeSearch.tsx`
  - Riot ID 형식 검증 우회, 입력값/공백 여부 무관하게 항상 `/players/demo-puuid-seoul-duelist-001`로 라우팅.
- `frontend/src/components/PlayerHeaderCard.tsx`
  - 헤더 `meta-badges`(`header.badges`)의 `Demo Profile`·`Mock Data` 등 렌더링 제거.
- `frontend/src/data/profile-overview.ts`
  - 기존 문자열 값만 수정: `badges` 배열에서 Mock/Demo 항목 정리, `sampleLabel`의 `Mock` 명칭을 순화(예: "최근 20판 집계"). **신규 필드/타입 추가 금지.**
- `frontend/src/components/RecentTwentySummaryCard.tsx`
  - 최근 20판 안내 문구의 `Mock` 명칭을 정적/순화된 텍스트로 보완.
- `frontend/src/components/MatchSummaryList.tsx`
  - DDΔ/R 툴팁 등에 남은 `Mock` 명칭을 정적/순화된 텍스트로 보완.
- `frontend/src/components/PlayerProfile.tsx`
  - `<main className="profile-main">` → `<div className="profile-main">`.
- `frontend/next.config.js`
  - 빌드 시점 `git rev-parse --short HEAD` 결과를 환경 변수(예: `NEXT_PUBLIC_GIT_COMMIT`)로 주입. git 명령 실패 시 안전한 fallback 문자열 사용.
- `frontend/src/components/AppVersionBadge.tsx`
  - `UI_BUILD_LABEL`을 `UI12F_PATCH`로 갱신하고, 주입된 커밋 해시 환경 변수를 배지에 동적 노출.

## Forbidden Changes

- **신규 기능/데이터 금지**: 신규 Mock 데이터, 신규 타입 필드, 새로운 API 연동, 외부 이미지/패키지 추가 금지.
- **범위 외 코드 수정 금지**: 위 Allowed에 없는 컴포넌트/CSS/데이터 파일, `backend/`, `docker/`, `scripts/`, `package.json`/lockfile 수정 금지.
- **빌드 환경 의존성 추가 금지**: `next.config.js`에서 Node 내장(`child_process`)만 사용하고 신규 npm 패키지를 추가하지 않는다.
- **Git 작업 금지**: `git add`/`commit`/`push` 실행 금지.

## Required Changes (항목별)

1. **데스크톱 레이아웃 붕괴 (BLOCKER)**:
   - 1440px에서 `.profile-dashboard-grid`의 두 컬럼(rail/main)과 `.profile-main` 내부 날짜 그룹이 콘텐츠 높이만큼만 차지하고 위에서부터 정렬되도록 한다(예: 그리드/플렉스 `align-items: start` 또는 그룹 컨테이너의 stretch 제거).
   - 사이드바(rail)와 메인 컬럼 높이가 서로를 강제로 늘리지 않도록 정렬을 보정한다.
2. **홈페이지 검색 UX (MAJOR)**:
   - `handleSubmit`에서 `RIOT_ID_PATTERN` 검증과 에러 분기를 제거하고, 입력 내용/빈 칸 여부와 무관하게 `router.push("/players/demo-puuid-seoul-duelist-001")`로 즉시 이동한다.
   - 사용하지 않게 되는 검증/에러 상태 관련 코드는 lint 통과를 위해 함께 정리한다(입력 필드 자체는 유지 가능).
3. **Mock 고지 정리 (MAJOR)**:
   - `PlayerHeaderCard.tsx`에서 `header.badges` 기반 `meta-badge` 렌더링을 제거한다(전역 `Mock Preview` 배지는 그대로 유지).
   - `profile-overview.ts`의 `badges`에서 `Demo Profile`/`Mock Data`를 제거하고, `sampleLabel`의 `Mock`을 순화한다.
   - `RecentTwentySummaryCard.tsx`, `MatchSummaryList.tsx`의 사용자 노출 문구에서 `Mock` 표현을 정적/순화 텍스트로 바꾼다.
4. **중첩 main (MINOR)**:
   - `PlayerProfile.tsx`의 `<main className="profile-main">`을 `<div className="profile-main">`으로 변경한다(닫는 태그 포함).
5. **빌드 버전 표시 (NEW)**:
   - `next.config.js`에서 `execSync("git rev-parse --short HEAD")`로 해시를 구해 `env.NEXT_PUBLIC_GIT_COMMIT`로 주입하고, 실패 시 `"unknown"` 등 fallback을 사용한다.
   - `AppVersionBadge.tsx`에서 `UI_BUILD_LABEL = "UI12F_PATCH"`로 갱신하고, `process.env.NEXT_PUBLIC_GIT_COMMIT`을 배지에 함께 표시한다(예: `commit {hash}`).

## Acceptance Criteria

1. 1440px 데스크톱 뷰포트에서 날짜별 경기 그룹이 위에서부터 자연스럽게 흐르고, 그룹 사이에 stretch로 인한 거대한 빈 영역이 발생하지 않는가.
2. 홈 화면에서 빈 입력 또는 임의 텍스트로 검색해도 형식 에러 없이 즉시 `/players/demo-puuid-seoul-duelist-001`로 이동하는가.
3. 헤더에 `Demo Profile`/`Mock Data` `meta-badge`가 더 이상 렌더링되지 않고, 최근 20판 안내·DDΔ/R 툴팁 등에서 노출되던 `Mock` 명칭이 순화/정적 텍스트로 바뀌었는가(전역 `Mock Preview` 배지 1개는 유지).
4. `PlayerProfile.tsx`에 `<main className="profile-main">`이 더 이상 존재하지 않고 `<div className="profile-main">`으로 교체되었는가(페이지 내 `main`은 layout 1개만 유지).
5. 우하단 빌드 배지의 UI Build 라벨이 `UI12F_PATCH`로 표시되고, 빌드 시점 Git 커밋 short hash가 동적으로 노출되는가.
6. `tsc`, `lint`, `build`가 에러 없이 통과하고, 수정 파일이 Allowed 범위를 벗어나지 않는가.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
grep -n "main className=\"profile-main\"" frontend/src/components/PlayerProfile.tsx || echo "OK: no nested main"
grep -n "UI12F_PATCH" frontend/src/components/AppVersionBadge.tsx
grep -rn "Demo Profile\|Mock Data" frontend/src/components frontend/src/data || echo "OK: header mock badges removed"
```

## Stop Conditions

- 빌드 버전 주입 또는 레이아웃 수정에 신규 컴포넌트/신규 타입/신규 npm 패키지가 요구될 때.
- 동일한 검증 에러가 3회 이상 반복되면 `BLOCKED`로 처리하고 중단한다.

## Result

(구현 후 Codex가 작성)
