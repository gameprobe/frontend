# TASK-FE-006 — 홈·프로필 최상단 브랜드 바 확대

## Status

IMPLEMENTED — 구현·검증 완료, 사용자 검토 대기 (2026-09-16).

## Goal

사용자가 지정한 최상단 브랜드 바의 로고·라벨·계정 버튼과 높이를 키워
확대된 내비게이션과 균형을 맞춘다. 홈/프로필만 수정하고 라인업은 제외한다.
기존 FE-004/005 미커밋 변경을 보존한다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.module.css` (브랜드 바 규칙만)
- `frontend/src/features/home/HomeLanding.module.css` (브랜드 바 override만)
- `docs/tasks/TASK-FE-006.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 결과 요약)
- `docs/visual-qa/TASK-FE-006.md`
- `docs/visual-qa/assets/TASK-FE-006/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태만)

읽기: 위 CSS의 사용처와 홈/프로필 JSX 브랜드 바, 관련 기존 Task.
HANDOFF.json은 없으며 사용자 피드백을 이 범위로 한정한다.

## Forbidden changes

- 라인업·공통 CSS/레이아웃·본문·내비게이션 재수정
- 데이터/API/의존성 변경, 링크 목적/브랜드 문구 변경
- 페이지 전체 강제 확대, 기존 미커밋 변경 되돌리기
- 요청 없는 commit/push/merge 및 다음 Task 자동 시작

## Acceptance criteria

- 데스크톱 바48px, 서비스명20px, 보조 라벨14px, 계정 버튼16px.
- 모바일 바44px, 서비스명18px, 계정 버튼14px. 320px에서도 겹침 없음.
- 홈/프로필에서 같은 크기로 표시하고 기존 로고·계정 링크 동작 유지.
- 1440/390px Before·After 캡처, 320/700/768/1000px 너비 검사.
- 아래 내비게이션과 본문, 라인업 및 전역 파일 무변경.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저 computed style, 배치·링크 동작 및 기존 내비게이션 높이 확인.

## Stop conditions

- 동일 원인 검증 실패3회
- 공통/라인업 파일 수정이나 새 의존성이 필요한 경우
- 새 사용자 변경과 충돌 시 보존하고 확인

## Result

- 변경 파일: Allowed changes의 두 CSS, 이 Task, 프론트 PLAN, PROGRESS,
  Visual QA 문서 및 Before/After 이미지 8장, ignored CURRENT 보고서.
- 새 컴포넌트/데이터 구조 없이 기존 브랜드 바의 크기와 반응형 규칙을 조정했다.
  데스크톱 바 38→48px, 서비스명 16→20px, 보조 라벨 14px, 계정 버튼 16px.
  모바일 바 44px, 서비스명 18px, 계정 버튼 14px로 맞췄다.
- 800px 이하에서는 VALORANT 라벨만, 480px 이하에서는 로고와 계정 버튼만
  표시한다. 줄바꿈·축소를 막고 좁은 화면 간격을 조정했다.
- 위 Docker 검증 명령 전체 성공: 타입 검사 PASS, Lint 경고·오류 0,
  production build PASS(정적 페이지 11개). 개발 서버 재시작 완료.
- `git diff --check` PASS. 검증용 viewport 복원 후 홈 reload에서 최종 크기와
  브라우저 경고·오류 0건을 확인했다. 개발 서버는 실행 유지한다.
- 홈/프로필 320/390/700/701/768/1000/1440px에서 가로 넘침과 브랜드 요소
  겹침 없음. 내비게이션 높이 68/64px 유지, 로고 홈 이동·계정 안내 이동 정상.
- Before/After 8장 및 독립 코드·시각 검토 PASS.
  상세는 [Visual QA](../visual-qa/TASK-FE-006.md)를 참조한다.
- 기존 FE-004/005 미커밋 변경 보존. 본문·내비게이션·라인업·전역 파일 및
  링크 목적/브랜드 문구는 이번 작업에서 수정하지 않았다.
- 미해결 구현 문제 없음. 컨테이너의 기존 git 부재 로그는 빌드 메타데이터
  fallback이며 빌드는 성공했다. 인증과 실제 API는 기존 범위 밖이다.
- 커밋·푸시 없음. 다음 Task 전 사람이 홈/프로필의 브랜드 바 크기를 확인한다.
