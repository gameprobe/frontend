# TASK-FE-009 — 100% 배율 기준 홈·프로필 크기 조정

## Status

IMPLEMENTED — 구현·검증 완료, 사용자 시각 검토 대기 (2026-09-16).

## Goal

localhost의 Chrome 확대/축소가 80%였음을 확인했다. 사용자가 100%로 복원한 뒤
홈·프로필 전체가 너무 크다고 지정했으므로 상단 바, 제목, 배너, 카드 여백을
적당히 줄인다. 이전에 개선한 작은 글자 가독성과 반응형 동작은 유지한다.

## Allowed changes

- `frontend/src/features/home/HomeLanding.module.css`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `docs/tasks/TASK-FE-009.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 결과 요약)
- `docs/visual-qa/TASK-FE-009.md`
- `docs/visual-qa/assets/TASK-FE-009/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태)

읽기: 위 화면 JSX, 기존 계획·Task. HANDOFF.json 부재이며 사용자의 홈·프로필
전체 크기 조정 요청으로 범위를 한정한다.

## Forbidden changes

- 라인업·전역 스타일·백엔드·데이터/필터 로직 변경
- 새 폰트·자산·의존성, CSS zoom/scale을 이용한 전체 축소, 브라우저 배율 변경
- 기존 인체 SVG·가독성/반응형 개선 제거, 요청 없는 commit/push

## Acceptance criteria

- 100%에서 상단 바와 홈·프로필 본문의 큰 요소 및 여백이 이전보다 간결하다.
- 경기 시간·요원명·지표 라벨은 12px 이상, 모바일 입력은 16px를 유지한다.
- 홈·프로필 데스크톱/390px Before·After, 320/768/1000/1250/1440/1920px 넘침 검증.
- 검색 진입·More 메뉴, 경기 펼침·필터 동작 유지. 다른 페이지 소스 무변경.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저: 100% 상태, 반응형·computed style·핵심 동작, Before/After 시각 검토.

## Stop conditions

- 동일 원인 검증 실패 3회, 범위 밖 변경 필요, 새 사용자 변경과 충돌.

## Result

- 소스 변경: 홈·프로필 CSS 2개. 새 모듈·구조·의존성 추가 없음.
- 브랜드 바 48→44px, 내비게이션 68→60px(모바일 64→56px), 서비스명
  20→18px, 메뉴 16→15px. 검색·More 높이 44px 및 모바일 입력 16px 유지.
- 홈 제목 48→42px(모바일 35→32px), 배너·소개 카드·분석 카드 여백 축소.
- 프로필 배너 260→240px(모바일 220→200px), 아바타 94→84px, 이름
  32→30px, 탭 56→48px. 프로모션·섹션·경기 카드 여백도 축소했다.
- 경기 시간·요원명 13px, 지표 라벨 12px 및 FE-007 인체 SVG 유지.
  본문 폭과 경기 열 구성은 유지해 한 줄 배치 공간을 확보했다.
- 문서: 이 Task, frontend PLAN, PROGRESS, Visual QA, Before/After 10장,
  ignored CURRENT 보고서 갱신.
- Verification commands 모두 PASS: 타입 검사, Lint 경고·오류 0,
  production build(정적 페이지 11개), 서버 재시작, diff 공백 검사.
- 프로필 10개 너비(320/390/768/850/851/1000/1250/1251/1440/1920px),
  홈 7개 너비(320/390/768/1000/1250/1440/1920px)에서 가로 넘침 없음.
  경기 행 요소 겹침 없음. 데스크톱 행 약85px, 모바일141px.
- 320px More 메뉴 화면 내 표시, 검색 바로가기 포커스 및 데모 검색 이동,
  390px 경기 펼침·닫기, 패배 7개/전체 20개 필터 PASS. 콘솔 warn/error 0.
- 독립 코드·시각 리뷰 PASS. [Visual QA](../visual-qa/TASK-FE-009.md) 참조.
- 미해결 구현 문제 없음. 크기 적절성은 사용자가 실제 모니터 100% 배율에서
  확인한다. 모바일 경기 행은 가독성 유지를 위해 높이를 그대로 유지했다.
- 컨테이너 git 부재 메시지는 기존 metadata fallback이며 검증 실패가 아니다.
- 라인업·전역·데이터 로직 무변경. 이전 작업 중 이번 요청 대상 크기만 조정.
  커밋·푸시 없음. 다음 Task는 사용자 지정 이후 진행한다.
