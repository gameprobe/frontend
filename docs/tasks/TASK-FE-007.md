# TASK-FE-007 — 명중 부위 인체 실루엣 개선

## Status

IMPLEMENTED — 구현·검증 완료, 사용자 검토 대기 (2026-09-16).

## Goal

사용자가 지정한 프로필 ACCURACY의 단순 인체 그림을 자연스러운 비율의
전술 훈련용 마네킹 SVG로 교체한다. 화면의 기본 틀에 대한 평가도 전달한다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.tsx` (명중 부위 SVG만)
- `frontend/src/features/tracker-profile/TrackerProfile.module.css` (명중 부위 그림과 바로 옆 배치만)
- `docs/tasks/TASK-FE-007.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 결과)
- `docs/visual-qa/TASK-FE-007.md`
- `docs/visual-qa/assets/TASK-FE-007/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태)

HANDOFF.json은 없으며 사용자가 지정한 그림 변경으로 범위를 한정한다.
외부 자산 없이 자체 SVG를 사용한다.

## Forbidden changes

- 라인업·홈·전역 파일·다른 프로필 구성·Mock/통계 계산 변경
- 새 의존성·외부 이미지·3D 런타임·API 추가
- 전체 리팩터링, 기존 미커밋 변경 되돌리기, 요청 없는 commit/push

## Acceptance criteria

- 머리·목·어깨·허리·팔·무릎·발을 구별할 수 있는 인체 비율.
- 머리/다리 회색, 몸통/팔 민트의 기존 부위 구분 유지.
- Head/Body/Legs 수치·필터·그래프 의미와 동작 유지.
- 1440/390px Before/After 및 320/768px 겹침·가로 넘침 확인.
- SVG는 장식으로 처리하며 옆의 텍스트 수치를 접근성 정보로 유지.
- 기존 FE-004/005/006 미커밋 변경과 라인업 보존.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저 화면·반응형·시즌 필터에 따른 수치 유지 및 시각 검토.

## Stop conditions

- 같은 원인 검증 실패 3회
- 외부 자산/의존성 또는 범위 밖 변경이 필수인 경우
- 새 사용자 변경과 충돌하는 경우

## Result

- 변경 파일: 위 TSX/CSS의 명중 부위 SVG·스타일, 이 Task, frontend PLAN,
  PROGRESS, Visual QA 문서와 Before/After 4장, ignored CURRENT 보고서.
- 원·막대 인체를 어깨·허리·팔·관절·손발이 구별되는 자체 SVG로 교체했다.
  기존 파일 안에 유지했고 새 모듈·외부 자산·패키지를 추가하지 않았다.
- 데스크톱 64×132px, 모바일 48×100px로 표시하며 부위별 색상과 숫자를 유지했다.
- 위 Verification commands 전체 PASS: 타입 검사, Lint 경고·오류 0,
  production build 성공(정적 페이지 11개), 서버 재시작, diff 공백 검사.
- 320/390/768/1440px 가로 넘침·텍스트 겹침 없음. A4/A5 필터에 따른
  Head/Body/Legs 수치 변경·복원 정상. [Visual QA](../visual-qa/TASK-FE-007.md) 참조.
- 별도 시각·변경 범위 검토 PASS. FE-004/005/006 변경과 라인업 보존.
- 남은 구현 문제 없음. 기존 컨테이너 git 부재 로그는 빌드 메타데이터 fallback이다.
  프로필의 작은 회색 글자, 실제 검색/API 및 경기 상세 확장은 이번 범위 밖이다.
- 커밋·푸시 없음. 다음 Task 전 사람이 새 인체 실루엣의 표현을 확인한다.
