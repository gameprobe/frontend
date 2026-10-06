# TASK-FE-030 — 상세·관리자·오류 화면 공통 테마 보완

## Status
IMPLEMENTED — 검증 완료, 사용자 요청에 따라 PR 제출 진행·병합 검토 대기

## Goal
디자인 감사에서 확인된 라인업 상세, 구 데모 경기 상세, 관리자, 기본 404의 이전 테마와 안내 페이지 메뉴 누락을 홈·프로필의 공통 디자인에 맞춘다.

## Baseline / authorization
- 사용자: “지금 확인된 것들을 수정하도록 하자.” 감사에서 보고한 모든 화면을 명시적으로 승인했다.
- PR #23 병합 확인, `codex/frontend-rework`에 76adc9e pull 후 `codex/remaining-page-theme` 생성. 시작 clean.
- 기능·데이터·인증을 유지하는 표시 변경이다. 후속 사용자 요청 “그럼 지금까지 한걸 pr 올려줘”에 따라 커밋·푸시 및 `codex/frontend-rework` 대상 PR 제출을 진행한다. 병합은 사용자가 수행한다.

## Scope
1. 공통 ContentPageShell로 메뉴/푸터/본문 폭을 연결한다. SupportPage도 같은 메뉴 생성 함수를 사용한다.
2. 라인업 상세의 성공/로딩/실패, 지도·영상·설명 카드, 난이도 배치, 반응형/초점 스타일을 수정한다. fetch/fallback/좌표/영상선택은 보존한다.
3. 구 데모 경기 상세를 공통 테마의 읽기 쉬운 선수 표·라운드 목록으로 맞춘다. 원본 데이터·정렬·값·새 합성 경기 경로는 보존한다.
4. 관리자 로그인·인증 안내·목록·신규·수정·로딩·오류에 같은 테마를 적용한다. 기존 관리자 인증, 저장, 검수, 지도 편집 계산은 변경하지 않는다.
5. 기본 404에 공통 테마와 홈/라인업 복귀 링크를 제공한다.

## Allowed changes
- frontend/src/features/stats-shell/ContentPageShell.tsx
- frontend/src/features/stats-shell/ContentPageShell.module.css
- frontend/src/features/stats-shell/navigation.ts
- frontend/src/features/stats-shell/SupportPage.tsx
- frontend/src/app/not-found.tsx
- frontend/src/components/LineupDetail.tsx
- frontend/src/components/LineupDetail.module.css
- frontend/src/components/AdminLogin.tsx
- frontend/src/components/AdminLineupList.tsx
- frontend/src/components/LineupEditor.tsx
- frontend/src/app/admin/lineups/[id]/edit/page.tsx
- frontend/src/features/admin/AdminPageShell.tsx
- frontend/src/features/admin/AdminPageShell.module.css
- frontend/src/app/matches/[matchId]/page.tsx
- frontend/src/components/MatchDetailView.tsx
- frontend/src/components/MatchDetailView.module.css
- frontend/src/components/MatchScoreboard.tsx
- frontend/src/components/MatchRoundTimeline.tsx

- docs/tasks/TASK-FE-030.md, docs/visual-qa/TASK-FE-030.md, docs/visual-qa/assets/TASK-FE-030/**, docs/frontend/PLAN.md, docs/PROGRESS.md.
- .agent-reports/HANDOFF.json 및 CURRENT.md의 공통 상태/Codex Implementation, /private/tmp/fe030-*.

## Out of scope
전역 CSS 변경, 홈/프로필/라인업·스모크 탐색 본문 변경, 실제 API·DB·인증 정책, 데이터·자산·운영 의존성 변경, 번역 확대, 새로운 경기 기능·운영 배포. 관리자 API 테스트는 브라우저 가로채기로만 수행하며 실제 기록을 생성·수정하지 않는다.

## Acceptance criteria
- 대상 모든 화면에서 공통 헤더·푸터·테마가 표시되고 main 중첩이 없다. SupportPage에 Smokes 포함.
- 라인업 난이도가 메타데이터 안에 배치되고 지도 핀/경로/영상선택이 유지된다.
- 관리자 폼/필터/상태 버튼/지도 편집/기존 인증 분기가 보존된다.
- 기존 경기의 참가자·라운드 및 수치가 사라지지 않는다.
- 1440/820/390px에서 가로 문서 넘침/겹침 없고 키보드 조작/초점이 보인다.
- 홈/프로필/라인업·스모크 회귀 및 Before/After 시각 QA, TypeScript/Lint/build 통과.

## Verification commands
```bash
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
node docs/visual-qa/assets/TASK-FE-030/capture.cjs before
node docs/visual-qa/assets/TASK-FE-030/capture.cjs after
node docs/visual-qa/assets/TASK-FE-030/interaction-qa.cjs
git diff --check
```

## Result
### 변경 요약
- ContentPageShell을 새로 만들고 상세·관리자 화면이 기존 StatsShell/Header/Footer 및 공통 메뉴를 사용하게 했다. 사용 위치와 상태 소유 경계를 주석으로 기록했다.
- 라인업 로딩/실패/성공 카드·메타데이터·난이도 배치/모바일 스킬 라벨·초점을 수정했다. 요청/fallback/좌표/경로/영상 계산은 보존했다.
- 구 경기 상세에 선수 표와 간결한 라운드 격자를 적용했다. 새 합성 경기 경로는 그대로다.
- 관리자 로그인/목록/신규/수정/상태 화면을 전용 범위 CSS로 맞췄다. 인증 정책은 유지하고 서버와 브라우저의 첫 화면이 같도록 수정 화면의 토큰 확인 결과를 effect 이후 표시한다.
- SupportPage 공통 메뉴와 404 복귀 화면을 보완했다. 고정 한국어 본문은 메뉴 언어와 별개로 lang=ko로 선언한다.

### 실제 변경 소스 전체
- `frontend/src/app/admin/lineups/[id]/edit/page.tsx`
- `frontend/src/app/matches/[matchId]/page.tsx`
- `frontend/src/app/not-found.tsx`
- `frontend/src/components/AdminLineupList.tsx`
- `frontend/src/components/AdminLogin.tsx`
- `frontend/src/components/LineupDetail.module.css`
- `frontend/src/components/LineupDetail.tsx`
- `frontend/src/components/LineupEditor.tsx`
- `frontend/src/components/MatchDetailView.module.css`
- `frontend/src/components/MatchDetailView.tsx`
- `frontend/src/components/MatchRoundTimeline.tsx`
- `frontend/src/components/MatchScoreboard.tsx`
- `frontend/src/features/admin/AdminPageShell.module.css`
- `frontend/src/features/admin/AdminPageShell.tsx`
- `frontend/src/features/stats-shell/ContentPageShell.module.css`
- `frontend/src/features/stats-shell/ContentPageShell.tsx`
- `frontend/src/features/stats-shell/SupportPage.tsx`
- `frontend/src/features/stats-shell/navigation.ts`

### 문서·QA 변경
- docs/tasks/TASK-FE-030.md, docs/frontend/PLAN.md, docs/PROGRESS.md.
- docs/visual-qa/TASK-FE-030.md 및 assets/TASK-FE-030의 스크립트/결과/89스크린샷. 전체 경로는 manifest.json.
- .agent-reports/HANDOFF.json, CURRENT.md (로컬 ignored).

### 실행 명령 및 결과
- git fetch origin → switch codex/frontend-rework → pull --ff-only origin codex/frontend-rework → switch -c codex/remaining-page-theme: 성공. PR #23 merged 확인.
- Verification commands의 TypeScript/Lint/build/서버복원/diff 모두 PASS. 정적12페이지 생성, Lint 오류·경고0.
- capture.cjs before/after: 38쌍. lineup-qa.cjs 230검사, admin-qa.cjs 215검사, match-qa.cjs 414필드 대조 PASS.
- interaction-qa.cjs 28조건, compare.py 38조건·17원본파일·홈/프로필PNG동일, post-build.cjs 8경로+언어 확인 PASS.
- 모든 스크립트는 docs/visual-qa/assets/TASK-FE-030/ 아래에 있다. 관리자 API41요청은 모두 브라우저에서 가로챘고 실제 서버 자료 변경 없음.
- 직접 시각 검토 및 독립 읽기전용 코드/화면 검토 PASS. 자세한 범위·초기 테스트 보완 이력은 Visual QA 문서 참조.

### 남은 제한
- 실제 관리자 서버/권한·영상 재생·게임자료 정확성은 검증 범위 밖이다. 기존 데이터/지원 요원·클릭 방식 지도 편집을 유지한다.
- 본문 전체 번역, 새 기능, 운영 배포를 하지 않았다. 프로필 배너 하단 메뉴와 새 데이터 경기 단독 페이지의 공통 메뉴 구성은 후속 브랜치에서 결정한다.
