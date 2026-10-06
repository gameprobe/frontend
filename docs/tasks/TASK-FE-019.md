# TASK-FE-019 — 경기 상세 모달 공통 스타일 정리

## Status

DONE — PR #12가 `codex/frontend-rework`에 병합됨 (`1863a99`).

## Goal

PR #11 병합 `d48aac4`의 `codex/frontend-rework`에서 `codex/match-detail-shared-styles`로 분기한다.
경기 상세 모달 다섯 탭이 반복 사용하는 색상·미제공 안내·표 가로 스크롤 규칙을 공통 CSS로 모은다.
기존 화면과 동작은 유지하고, 공통 규칙과 탭 전용 규칙의 사용처를 한국어 주석으로 설명한다.
프로필 카드·제목 등의 공통 스타일 정리는 다음 브랜치의 별도 Task로 남긴다.

## Allowed changes

- `frontend/src/features/tracker-profile/match-history/detail/MatchDetailShared.module.css` (신규 공통 규칙)
- 같은 detail 폴더의 `TrackerMatchPanel.module.css`, `TrackerScoreboard.module.css`, `TrackerPerformance.module.css`, `TrackerEconomy.module.css`, `TrackerRounds.module.css`, `TrackerDuels.module.css`
- `docs/tasks/TASK-FE-018.md` (PR #11 병합 상태만)
- `docs/tasks/TASK-FE-019.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/REFACTORING.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-019.md`
- `docs/visual-qa/assets/TASK-FE-019/*`
- `.agent-reports/CURRENT.md` (공통·Codex 섹션만)

HANDOFF.json은 없으며 현재 사용자가 승인한 작업 범위를 이 Task에 기록한다.
읽기 전용: 위 파일과 지침/계획/과거 Task·QA, `frontend/src/features/tracker-profile/match-history/detail/*`,
`frontend/src/features/tracker-profile/match-history/*.tsx`, `TrackerProfile.tsx` 및 상위 CSS,
`frontend/src/features/stats-shell/*`, `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.js`,
`docker/compose.frontend.yml`. 이전 `/tmp/fe018-*.cjs` 검증 스크립트는 재사용 가능하며 새 임시 스크립트는 `/tmp/fe019-*`로 작성한다.

## Forbidden changes

- 프로필 전체 카드·제목·필터 스타일, 홈·라인업·전역 CSS 변경
- TSX 구조·상태·동작·데이터·Mock·이미지·글꼴 변경
- 기존 인라인 상세 4탭과 모달 표시 설정 변경
- 외형이 같다는 이유만으로 역할이 다른 스타일의 강제 통일
- 새 의존성·API·인증·DB·백엔드·배포 변경
- 요청 없는 커밋·푸시·PR·병합, 후속 Task 자동 시작

## Acceptance criteria

- 모달 안에서만 사용하는 공통 색상과 반복 규칙을 한 파일에서 관리한다.
- 공통 색상은 기존 값과 의미를 보존한다. 탭별 열 너비·배치·반응형 차이는 각 CSS에 남긴다.
- 공통 CSS가 컴포넌트의 기존 CSS Module 클래스로 연결되어 원래 selector 우선순위를 보존한다.
- PC/모바일 다섯 탭 및 주요 상호작용의 Before/After 화면·계산 스타일이 동일하다.
- 홈·닫힌 프로필의 표시, 미제공/실제 0 구분, 모달 열기·닫기·포커스·스크롤 동작에 회귀가 없다.
- Visual QA·Task Result·진행 로그·Agent Report를 갱신한다.

## Verification commands

```sh
node /tmp/fe019-visual.cjs before
node /tmp/fe019-visual.cjs after
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs && node src/features/tracker-profile/match-history/detail/missingData.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

Node는 번들 런타임의 절대 경로를 사용한다. 상세 브라우저 동작·이미지 비교·재시작 후 확인은 Visual QA에 기록한다.

## Result

### 변경 파일

- `frontend/src/features/tracker-profile/match-history/detail/MatchDetailShared.module.css`: 공통 색상 15개·가로 스크롤·미제공 안내. 사용처를 한국어 주석으로 표시.
- 같은 폴더의 `TrackerMatchPanel.module.css`, `TrackerScoreboard.module.css`, `TrackerPerformance.module.css`, `TrackerEconomy.module.css`, `TrackerRounds.module.css`, `TrackerDuels.module.css`: 공통 변수와 CSS Module 합성 연결.
- `docs/tasks/TASK-FE-018.md`: PR #11 병합 상태 반영.
- `docs/tasks/TASK-FE-019.md`, `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/PROGRESS.md`: 범위·결과·수정 위치 기록.
- `docs/visual-qa/TASK-FE-019.md`, `docs/visual-qa/assets/TASK-FE-019/`: Before/After PNG 60장과 verification.json. 개별 파일은 Visual QA 표에 기재.
- `.agent-reports/CURRENT.md`: 현재 상태와 구현 보고(ignored).

### 실행과 검증 결과

- `node /tmp/fe019-visual.cjs before` / `after`: PASS. 캡처 30쌍, 76개 상태의 계산 스타일·DOM·좌표·스크롤 크기 동일.
- 번들 Python의 `/tmp/fe019-pixels.py`: PASS. 30쌍 픽셀 차이 0.
- `node /tmp/fe018-tracker-after.cjs preview`: PASS. 동작42그룹·추가 반응형20조건·홈/닫힌 프로필4조건 비교 통과, pageerror 0.
- `node /tmp/fe019-empty-fixture.cjs`: PASS. 실제 표본에서 직접 도달하지 않는 두 컴포넌트의 전체 미제공 안내 CSS를 임시 브라우저 요소로 대조. 원본/공유 CSS의 글자·여백 등 계산 스타일 동일. 임시 요소의 너비/높이는 모두 0이므로 실제 표시 크기 검증에는 포함하지 않는다.
- 위 Verification commands의 Docker Mock/상세 Mock/누락 SSR·타입·Lint·build: 모두 PASS, Lint 경고/오류 0, 정적 페이지 11개.
- 개발 서버 재실행 및 `node /tmp/fe019-smoke.cjs`: PASS. HTTP200·모달5탭·폭/글자/닫기 크기·Escape·잠금 해제 확인.
- `git diff --check`: PASS. 허용 파일·보고서 목록·문서 링크·최종 소스 해시 확인.
- 독립 보조 에이전트 CSS 검토와 PC Duels/모바일 Rounds Before/After 육안 비교에서 새 문제 없음. 별도 Cursor 리뷰는 미실행.

### 주의 사항과 다음 범위

- 공통 변수는 모달 루트에서 상속한다. 모달 밖에서 이 전용 탭을 재사용할 경우 해당 테마 적용 범위를 함께 검토해야 한다.
- 같은 색 코드여도 의미가 다른 정렬 강조 등은 로컬에 유지했다. Scoreboard/Rounds 스크롤 조건과 Economy/Rounds 안내 박스도 원래 차이를 보존했다.
- 상위에서 상속하던 `--gold`·`--font-section`은 이번에 바꾸지 않았다.
- TSX·동작·데이터·이미지·폰트·기존 인라인·홈·프로필 전체 스타일은 변경하지 않았다.
- 컨테이너의 기존 git 메타데이터 경고는 빌드 실패가 아니며 새 의존성이나 배포 변경은 없다.
- 다음 후보는 프로필 카드·제목 등의 공통 스타일 정리. 별도 승인 후 브랜치/Task로 진행한다.
- 사용자 요청에 따라 커밋·푸시 후 `codex/frontend-rework` 대상 PR로 전달한다. PR 검토와 병합은 사용자가 진행한다.
