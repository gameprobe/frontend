# TASK-FE-011 — 홈·프로필 화면 정의서와 모듈 분리 계획

## Status

IMPLEMENTED — 문서 작성·검증 완료, 사용자 검토 대기 (2026-09-17).

## Goal

사용자가 이미지 추가·수정을 토의 이후로 보류하고 다른 작업을 먼저 진행하도록
지정했다. 앞서 합의한 모듈화의 준비로 현재 화면 영역·상태·동작과 관련 코드를
연결하는 화면 정의서를 작성한다. 현재 구현과 분리 제안을 구분하고, 실제 코드
분리는 사용자 검토 후 별도 Task에서 진행한다.

- 기준: `codex/frontend-rework`의 `b016a29` (PR #3 병합).
- 작업 브랜치: `codex/frontend-screen-map`.
- 기존 홈·프로필 디자인과 이미지 파일·선택·매핑·표시 방식은 유지한다.

## Allowed changes

- `docs/tasks/TASK-FE-011.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/frontend/REFACTORING.md`
- `docs/frontend/PLAN.md` (이번 Task 및 후속 방향)
- `docs/PROGRESS.md` (이번 결과 요약)
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태)

읽기 전용 범위:

- 프로젝트 지침, 기존 계획·Task·Visual QA 문서 및 기존 캡처.
- `frontend/src/app/page.tsx`
- `frontend/src/app/players/[puuid]/page.tsx`
- `frontend/src/features/home/HomeLanding.tsx`
- `frontend/src/features/home/HomeLanding.module.css`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/mock.ts`
- `frontend/src/features/tracker-profile/mock.test.cjs`
- `frontend/src/components/HomeSearch.tsx`
- `frontend/src/components/AnalysisExampleCards.tsx`
- `frontend/src/lib/mock-data.ts` (프로필 진입점에서 확인한 데모 조회 import)
- `frontend/src/types/index.ts` (조회/검색에서 사용하는 타입)
- `frontend/src/types/player.ts` (`Player` 타입 정의)

HANDOFF.json은 존재하지 않는다. 이번 사용자 지정 문서 작업의 조사 범위는
위 목록으로 한정하며 소스는 수정하지 않는다. 목록 밖 추가 조사가 필요하면
현재 호출 관계를 근거로 Task에 읽기 범위를 기록한다.

## Forbidden changes

- 프론트/백엔드 소스·스타일·Mock·설정·의존성 변경.
- 이미지 추가·교체·삭제, 자산 목록 및 경로/선택/매핑 변경.
- 라인업 구현 변경 및 실제 API/RSO/Overwolf 연결.
- 새 통계 의미·계산식 확정, 아직 합의하지 않은 API 응답 계약 확정.
- 실제 모듈 분리 착수 및 요청 없는 커밋·푸시·병합.

## Acceptance criteria

- 홈·프로필의 화면 배치에 영역 ID를 붙이고 실제 파일·함수·상태·데이터와 연결한다.
- 탭/필터/검색/상세/빈 결과 등 현재 동작과 Mock 한계를 구분한다.
- 브랜드·테마·컴포넌트·상태·데이터 공급/집계의 제안 경계를 기록한다.
- 첫 리팩터링 후보의 좁은 범위, 순서 및 유지할 검증 기준을 명시한다.
- 현재 이미지 유지와 라인업 제외를 명시한다. 미래 파일은 제안으로 표시한다.

## Verification commands

```sh
git diff --check
git diff --exit-code b016a29 -- frontend backend docker
git status --short
```

추가 확인: 새 문서의 상대 링크 대상과 코드 식별자가 존재하는지 확인하고,
화면 정의서와 실제 JSX/상태 처리의 일치 여부를 검토한다.
문서만 변경하므로 앱 빌드·UI Before/After 재촬영은 해당하지 않는다.
기존 FE-010 캡처를 기준 이미지로 연결하며 새 시각 검증 결과로 주장하지 않는다.

## Result

- 실제 변경 파일: 이 Task, `docs/frontend/SCREEN-MAP.md`,
  `docs/frontend/REFACTORING.md`, `docs/frontend/PLAN.md`, `docs/PROGRESS.md`,
  `.agent-reports/CURRENT.md` (ignored).
- `git switch -c codex/frontend-screen-map`: 기준 `b016a29`에서 작업 브랜치 생성.
- 홈 6영역, 프로필 공통/통계 10영역·사이드바 6영역·경기 5영역의 배치도와
  파일·상태·함수 연결표 작성. 6탭, 필터 영향 범위, 상태 수명과 Mock 한계 기록.
- 브랜드/테마 분리를 첫 후보로 두고 화면 영역, 상태·동작, 데이터 경계의
  후속 제안과 검증 기준을 작성했다. 실제 소스 분리는 미착수다.
- 독립 읽기 검토로 홈 검색의 고정 경로, 모바일 숨김 영역, 공유 스타일 의존을
  확인했다. 프로필 헤더에 속하지 않는 랭크·레벨 설명을 시즌 영역으로 정정했다.
- `git diff --check`: PASS.
- `git diff --exit-code b016a29 -- frontend backend docker`: PASS, 차이 없음.
- `git status --short`: 위 문서 5개만 tracked/untracked 변경. CURRENT는 ignored.
- Python 문서 검사: 새 문서 3개의 로컬 링크 18개 대상 존재, 코드 펜스 짝 일치 PASS.
  신규 파일을 포함한 공백/허용 경로 검사도 PASS.
- 앱 소스·CSS·이미지·Mock·의존성·실행 환경 무변경. 문서 전용이라 빌드와
  Before/After 재촬영은 실행하지 않았다. 기존 FE-010 캡처는 참고로만 연결했다.
- 남은 사항: 실제 리팩터링은 사용자 검토·Task 지정 후 하나씩 진행한다.
  이미지와 실제 통계/API 정의는 토의 전까지 보류. 새로운 구현 오류 없음.
- 문서 작성 후 사용자 커밋·푸시 요청을 받았다. PR 대상은
  `codex/frontend-screen-map` → `codex/frontend-rework`이며 PR 생성·병합은
  사용자가 직접 진행한다. 실제 커밋·푸시 결과는 로컬 Agent Report에 기록한다.
