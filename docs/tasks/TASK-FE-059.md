# TASK-FE-059 — 라인업·스모크 영상 상세 페이지

## Status
DONE — 사용자 승인 2026-10-14, 커밋 (브랜치 `feat/guide-video-page`, 미푸시)

## Goal
라인업·스모크에서 영상을 누르면 공략 하나를 크게 보는 상세 페이지(Figma `222:6350`)로 이동한다.

## Context
- 사용자 요청 2026-10-14. 이 저장소 CLAUDE.md는 구현을 Codex에 맡기지만, 사용자가 이 Task의 소스 직접 수정(Claude 구현)을 명시적으로 승인했다(2026-10-14).
- Figma `222:6350`(라인업 상세): 태그·제목·수치 줄과 '← 라인업 목록', 왼쪽 큰 영상 + 단계 카드 3개, 오른쪽 미니맵(이 공략의 경로) 카드와 설명 카드(설명·정보 표·도움돼요·저장).
- 사용자 결정 2026-10-14:
  1. 지도에서 출발지(요원 초상)를 누르면 바로 상세 페이지로 간다.
  2. 스모크 상세 페이지도 라인업과 같은 구성으로 만든다(정보 표만 스모크 항목).
  3. 영상은 유튜브 기본 컨트롤을 쓴다(Figma의 자체 진행 바는 만들지 않는다).
- 지금 보드(오른쪽 상세 패널·스모크 목록 펼침)에서 바로 재생하던 영상 자리는 상세 페이지로 가는 썸네일 버튼으로 바꾼다.

## Allowed changes
- `src/app/router.tsx` (`/lineups/:mapId/:agentId/:lineupId`, `/smokes/:mapId/:smokeId`)
- `src/features/lineups/**`, `src/features/smokes/**` (새 상세 페이지, 보드의 이동 처리)
- `src/components/guide-map/**` (상세용 경로 지도, 공용 상세 구성 요소)
- `src/mocks/lineups.ts`, `src/mocks/smokes.ts` (공략 찾기 함수, 선택 필드 `description`)
- `src/features/admin/public-guides.ts` (관리자 게시 공략도 상세 페이지에서 찾기)
- `docs/visual-qa/assets/TASK-FE-059/**`, `docs/tasks/TASK-FE-059.md`, `docs/PLAN.md`, `docs/PROGRESS.md`

## Forbidden changes
- 관리자 화면 동작, 백엔드·배포·Docker·환경 설정, 새 npm 패키지

## Acceptance criteria
1. `/lineups/:mapId/:agentId/:lineupId`: Figma `222:6350` 구성(태그·제목·수치, '← 라인업 목록', 유튜브 영상, 단계 카드, 경로 미니맵, 설명·정보 표·도움돼요·라인업 저장). 영상은 자동 재생.
2. `/smokes/:mapId/:smokeId`: 같은 구성. 정보 표는 요원·연막 유형·진영·사이트, 목록 링크는 '← 스모크 목록'.
3. 보드 지도에서 출발지를 누르면 그 공략의 상세 페이지로 이동한다(라인업·스모크).
4. 보드의 오른쪽 상세 패널(라인업)·목록 펼침(스모크)의 영상 자리를 누르면 상세 페이지로 이동한다.
5. '← 목록'은 보드로 돌아가며 그 공략이 골라진 상태다(진영 등 쿼리 유지).
6. 없는 공략 ID는 404. 영상 주소가 없는 생성 예시는 영상 자리 표시를 보여준다.
7. 1440·390에서 가로 넘침·실행 오류가 없다.

## Verification commands
- `npx tsc -b && npm run lint && npm run build`
- `vite preview` 상태에서 `docs/visual-qa/assets/TASK-FE-059/flows-detail.mjs`

## Stop conditions
- 같은 검증 실패 3회 → BLOCKED 보고

## Result
- 새 파일
  - `src/features/lineups/LineupDetailPage.tsx` (`/lineups/:mapId/:agentId/:lineupId`), `src/features/smokes/SmokeDetailPage.tsx` (`/smokes/:mapId/:smokeId`)
  - `src/components/guide-map/GuideDetail.tsx`(상세 공용 틀 + 보드용 `VideoLink`), `GuideRouteMap.tsx`(공략 하나의 경로를 320×260 창으로 자른 지도, 공 애니메이션), `paths.ts`(상세·복귀 주소)
  - `docs/visual-qa/assets/TASK-FE-059/flows-detail.mjs`
- 수정
  - `router.tsx`: 상세 경로 2개
  - `LineupBoardPage.tsx`·`SmokeGuidePage.tsx`: 출발지 클릭 → 상세 페이지(보드 쿼리를 state로 넘김), 패널·목록 펼침의 영상 자리 → 상세 링크(`VideoLink`). 보드에서 바로 재생하던 동작 제거.
  - `mocks/lineups.ts`·`mocks/smokes.ts`: 선택 필드 `description`, `findLineup`·`findSmoke`. 첫 라인업에 시안 설명 글.
  - `features/admin/public-guides.ts`: 게시 공략의 설명을 `description`으로, 맵 단위 게시 연막 조회(`usePublishedSmokesOnMap`).
- 시안과 다른 점: 영상은 유튜브 기본 컨트롤(사용자 결정). 설명이 없는 예시는 제목으로 만든 기본 문장.
- 검증
  - `npm ci`(로컬, node_modules는 Git 제외), `npx tsc -b`, `npm run lint`, `npm run build` PASS
  - `vite preview` + Playwright(chromium headless shell 1248): `flows-detail.mjs` 38/38 PASS(1440 호버·390 탭), 실행 오류 0, 가로 넘침 0. 출발지 → 상세, 자동 재생 embed, 단계 카드 3, 정보 표, 경로 지도·공, 목록 복귀 시 쿼리 유지·선택, 패널·목록 영상 링크 → 상세, 수비 라인업 복귀 주소, 404(라인업·스모크).
  - 외부 유튜브 요청은 막고 iframe 주소만 확인했다. 실제 재생 화면은 확인하지 못했다.
  - 이 저장소에는 이전 Task의 Playwright 회귀 스크립트(049·051·056 등)가 없어 회귀는 돌리지 못했다. 보드의 출발지 클릭 동작은 의도적으로 바뀌었다(제자리 재생 → 상세 이동).
- 남은 위험: 관리자 미리보기는 지금처럼 그 자리에서 재생한다(관리자 동작은 이번 범위 밖).
- 후속(사용자 결정 2026-10-14): 보드의 영상 자리에 유튜브 썸네일(`i.ytimg.com/vi/{id}/hqdefault.jpg`) 넣기는 나중에 한다.
