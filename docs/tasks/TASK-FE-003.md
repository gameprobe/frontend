# TASK-FE-003 — 홈 테마를 새 프로필과 통일

## Status

IMPLEMENTED — 구현·검증 완료, 사람 검토 대기 (2026-09-16).

## Goal

기존 브랜치 `codex/tracker-profile-clone`의 `ef4e69f`에서 홈을 새 프로필의
색상·글꼴·상단 내비게이션·카드·버튼 스타일에 맞춘다. 홈 검색과 데모 프로필
이동을 유지하고 라인업 작업과 겹치는 전역 파일은 변경하지 않는다.

## Allowed changes

- `frontend/src/app/page.tsx`
- `frontend/src/features/home/HomeLanding.tsx`
- `frontend/src/features/home/HomeLanding.module.css`
- `docs/tasks/TASK-FE-003.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 작업 요약만)
- `docs/visual-qa/TASK-FE-003.md`
- `docs/visual-qa/assets/TASK-FE-003/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태만)

읽기/재사용: 기존 HomeSearch/AnalysisExampleCards, Player 타입/Mock 조회,
프로필 CSS Module/branding, 기존 로컬 자산. HANDOFF.json은 없으며 사용자의
홈 수정 지정을 이 Task에 반영해 범위를 한정했다.

## Forbidden changes

- 라인업·백엔드·API·인증·패키지·전역 CSS/레이아웃 변경
- 프로필 동작 수정, 구조 전체 리팩터링, 새 원격 자산/폰트 추가
- 실제 검색/분석/API가 제공되는 것처럼 표시
- 사용자 요청 없는 커밋·푸시·병합, 다음 Task 자동 시작

## Acceptance criteria

- 홈과 새 프로필의 헤더/배경/색상/서체/카드 스타일이 일관된다.
- 기존 검색 제출은 데모 프로필로 이동하며 Mock 동작을 명시한다.
- 홈에서 새 프로필과 기존 라인업에 진입할 수 있다.
- 기존 분석 예시를 재사용하며 예시임을 명확히 표시한다.
- 1440px/390px Before·After 캡처 및 시각 검토를 완료한다.
- 홈→프로필 및 홈→라인업 이동에서 중복 헤더/스타일 누출/가로 넘침이 없다.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

Playwright로 홈 검색, 프로필/라인업 진입, 헤더 메뉴, 데스크톱·모바일 표시를 검증한다.

## Stop conditions

- 동일 원인 검증 실패 3회
- 라인업/백엔드/운영 의존성 변경이 필요한 경우
- 같은 경로의 사용자 변경 발견 시 보존하고 확인

## Result

### 변경 파일과 구조

- `frontend/src/app/page.tsx`: 기존 데모 데이터 조회 후 HomeLanding 렌더링.
- `frontend/src/features/home/HomeLanding.tsx`: 프로필의 branding·CSS Module을
  재사용한 홈 헤더, 검색, 데모 링크, 프로필/라인업 진입 카드, 분석 예시, 푸터.
- `frontend/src/features/home/HomeLanding.module.css`: 홈 전용 레이아웃 및
  기존 검색/분석 컴포넌트의 scoped 스타일, 모바일 대응.
- `docs/tasks/TASK-FE-003.md`, `docs/frontend/PLAN.md`, `docs/PROGRESS.md`:
  작업 범위와 구현 결과 기록.
- `docs/visual-qa/TASK-FE-003.md`: Before/After 및 동작 검증 기록.
- `docs/visual-qa/assets/TASK-FE-003/before-desktop.jpg`
- `docs/visual-qa/assets/TASK-FE-003/before-mobile.jpg`
- `docs/visual-qa/assets/TASK-FE-003/after-desktop.jpg`
- `docs/visual-qa/assets/TASK-FE-003/after-mobile.jpg`
- `docs/visual-qa/assets/TASK-FE-003/after-mobile-bottom.jpg`
- `.agent-reports/CURRENT.md` (ignored): Codex 결과와 현재 상태 갱신.

### 실행 명령과 검증 결과

- `docker compose -f docker/compose.frontend.yml stop frontend`: 정상 중지.
- `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'`:
  PASS — 타입 검사, Lint 경고/오류 0, Next.js 빌드 및 정적 페이지 11개 생성.
- `docker compose -f docker/compose.frontend.yml up -d frontend`: 정상 시작,
  사용자 확인을 위해 실행 유지.
- `git diff --check`: PASS.
- 브라우저: 1440px/390px 가로 넘침 없음. 검색 제출, 두 데모 프로필,
  프로필 Home 복귀, 라인업 진입 및 기존 헤더 복원 PASS.
- 메뉴 열기/닫기와 Escape 시 버튼 포커스 복원 PASS.
- 기존 분석 예시 점수 87/74/68/91 유지. Mock/Sample 안내 확인.
- Before/After 5개 이미지 및 독립 시각 리뷰 PASS.
- 개발 서버 재시작 후 홈/검색/프로필 복귀에서 브라우저 error/warn 0.

### 남은 주의 사항과 검토 항목

- 검색은 기존과 같이 입력값에 관계없이 SeoulDuelist 데모 프로필로 이동한다.
  실제 검색/API 연결은 구현하지 않았으며 홈에 Mock 동작을 명시했다.
- 홈이 프로필 CSS Module을 직접 참조한다. 향후 공용 테마/헤더 추출 시
  두 화면의 참조를 함께 옮겨야 한다.
- 기존 컨테이너의 `git: not found`는 빌드 메타데이터 fallback 로그이며
  빌드 성공에 영향이 없었다.
- 전역 CSS/레이아웃, 기존 검색·분석 컴포넌트, 프로필·라인업·백엔드 무변경.
- 사용자 요청으로 같은 `codex/tracker-profile-clone` 브랜치에 홈 테마 변경을
  커밋한다. 푸시·병합은 수행하지 않는다. 이후 글자 가독성 피드백은 별도 변경으로 구분한다.
