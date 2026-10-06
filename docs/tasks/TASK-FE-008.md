# TASK-FE-008 — 경기 목록 보조 글자 가독성

## Status

IMPLEMENTED — 구현·검증 완료, 사용자 시각 검토 대기 (2026-09-16).

## Goal

작고 가늘게 보이는 경기 시간·요원명·지표 이름을 12~13px 기준으로 키우고
굵기·행 배치를 보완한다. 현재 글꼴을 유지해 크기·굵기 개선 효과부터 확인한다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.module.css` (경기 목록·요약·날짜·행 관련 규칙과 반응형)
- `docs/tasks/TASK-FE-008.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 결과 요약)
- `docs/visual-qa/TASK-FE-008.md`
- `docs/visual-qa/assets/TASK-FE-008/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태)

읽기: 경기 목록 JSX·기존 Task·계획. HANDOFF.json은 없으며 사용자가 승인한
경기 목록의 글자 크기·굵기·배치 보완으로 범위를 한정한다.

## Forbidden changes

- 라인업·홈·전역 파일·다른 프로필 구성 및 데이터/필터 로직 변경
- 새 글꼴·자산·의존성 추가, 전체 확대, 리팩터링
- 기존 FE-004~007 미커밋 변경 되돌리기, 요청 없는 commit/push

## Acceptance criteria

- 경기 시간·요원명 13px, 경기/날짜 지표 라벨·날짜 스트립·요약 보조 글자 12px 이상.
- 모바일에서도 위 글자를 축소하지 않고 행을 재배치해 가독성 유지.
- 승패·수치·필터·경기 펼침 기능 유지.
- 1440/390px Before/After, 320/768/1000/1250/1280/1920px 가로 넘침·행 요소 겹침 확인.
- 현재 Arial 글꼴과 전체 테마 및 기존 미커밋 작업 보존.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저: 글자 computed style, 반응형, 경기 펼침·닫기, 승패 필터 및 시각 검토.

## Stop conditions

- 동일 원인 검증 실패 3회
- 범위 밖 변경이나 새 의존성이 필수인 경우
- 새 사용자 변경과 충돌한 경우

## Result

- 변경 파일: 프로필 CSS의 경기 목록 규칙, 이 Task, frontend PLAN, PROGRESS,
  Visual QA 및 Before/After 4장, ignored CURRENT 보고서.
- 시간·요원명 13px, 지표/날짜 라벨 12px/700, 요약·날짜 스트립 보조 글자
  최소 12px. 숫자 위계에 맞춰 K/D/A 및 개별 지표 수치는 16px로 조정했다.
- 현재 Arial 글꼴과 색상 유지. 새 모듈/구조/의존성 없이 CSS만 보완했다.
- 열 최소 너비를 확보하고 850px 이하에서 경기 정보를 두 줄로 배치했다.
  최근 경기 요약은 필요한 경우 줄바꿈한다.
- Verification commands 모두 PASS: 타입 검사, Lint 경고·오류 0,
  production build(정적 페이지 11개), 서버 재시작, diff 공백 검사.
- 320~1920px 및 각 breakpoint 경계 총 14개 너비에서 가로 넘침·행 요소
  겹침 없음. 시간 13px/라벨 12px computed style 확인.
- 경기 펼침·닫기, 패배 7개와 요약 0W/7L, All Results 복원 20개 확인.
- 별도 코드·시각 검토 PASS. [Visual QA](../visual-qa/TASK-FE-008.md) 참조.
- 모바일 행 높이가 약 141px로 늘어 한 화면에 보이는 경기 수가 줄었다.
  미해결 구현 문제 없음. 컨테이너 git 부재는 기존 metadata fallback 로그다.
- 기존 FE-004~007 변경 보존. 홈·라인업·전역 파일·통계/필터 로직 무변경.
- 커밋·푸시 없음. 다음 Task 전에 사용자가 실제 모니터에서 가독성을 확인한다.
