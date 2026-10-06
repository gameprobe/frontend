# TASK-FE-022 — 화면 데이터 대응표와 API 기반 Mock 설계

## Status

DONE — PR #15가 `codex/frontend-rework`에 병합됨(`a7019f8`).
후속 원본 Mock·변환/집계 구현은 [TASK-FE-023](TASK-FE-023.md)에서 진행한다. 화면 연결은 그 이후 별도 Task다.

## Goal

현재 화면의 정보와 Riot 공식 VALORANT API 응답을 연결하는 대응표를 작성한다.
공식 응답 형태의 합성 표본, 변환·집계 계층, 누락·오류 처리와 검증 기준을 설계해
실제 API 승인 후 교체할 위치를 명확히 한다. 디자인 및 기존 Mock의 값은 유지한다.

## Baseline

- 사용자 승인: 2026-09-20, “화면 데이터 대응표와 API 기반 Mock 설계” 진행.
- 먼저 원격 정보를 갱신하고 `codex/frontend-rework`를 PR #14 병합본 `660c6cd`로 fast-forward했다.
- `origin/dev`는 `06076ca`이며 위 통합본에 이미 포함되어 있다. `git merge origin/dev`는 Already up to date.
- 이후 사용자 설명에 따라 안정본을 먼저 dev에 올리는 순서로 이해해 `git push origin codex/frontend-rework:dev`를 수행했다. 강제 push 없이 `06076ca → 660c6cd`로 반영됐다.
- 사용자가 별도 dev 업데이트를 언급하여 다시 fetch 및 GitHub compare API로 확인했다. 확인 시점의 두 원격 브랜치는 `660c6cd`로 동일(ahead/behind 0). 이후 사용자는 동료의 라인업 작업 설명을 전달하고 이와 별개로 Mock 설계를 계속 진행하도록 승인했다. 추가 원격 변경은 이번 설계의 선행 조건으로 두지 않는다.
- 작업 브랜치: `codex/api-mock-design`.
- HANDOFF.json 없음. 이번에는 문서 설계만 수행하며 제품 소스는 열거나 수정하지 않는다.
  기존 SCREEN-MAP·Task·직전 코드 감사 결과와 Riot 공식 문서를 근거로 한다.

## Allowed changes

- `docs/tasks/TASK-FE-022.md`
- `docs/tasks/TASK-FE-021.md` — 병합 상태만
- `docs/frontend/API-DATA-MAP.md` — 신규 화면/필드 대응표
- `docs/frontend/API-MOCK-DESIGN.md` — 신규 Mock 및 데이터 경계 설계
- `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/frontend/SCREEN-MAP.md` — 상태·연결 문서
- `docs/PROGRESS.md`
- `.agent-reports/CURRENT.md` — 공통·Codex 섹션만

읽기 전용: 프로젝트 지침, 기존 docs 문서와 Agent Report, Git 메타데이터,
Riot 공식 개발자 문서. 임시 문서 검증 스크립트는 `/tmp/fe022-*`에 작성할 수 있다.

## Forbidden changes

- 제품 소스·기존 Mock·통계 산식·UI/CSS·이미지·라인업 변경
- 공개 API·인증/RSO·DB·키·Spring·배포·의존성 구현 또는 설정 변경
- 실사용자 전적 수집, Tracker 데이터 복제, 새 자산 다운로드
- 요청 없는 커밋·푸시·PR·후속 구현 시작

## Acceptance criteria

- 홈·프로필 P01~P10/S01~S06/M01~M05와 경기 상세 5탭의 주요 데이터 출처를 분류한다.
- 직접 제공 / 계산 가능 / 별도 콘텐츠 / 앱 자체 / 확보 미확인 항목을 구별한다.
- 현재 RR·최고 랭크·총기별 HS·KAST·Probe Score 등 불확실한 항목을 실제 API 값처럼 보장하지 않는다.
- 공식 응답 Mock → 변환·집계 → 화면 구조와 서버 전용 Riot 연결 경계를 정의한다.
- 표본 시나리오, 동일 경기/플레이어 간 일관성 규칙, 누락과 0의 구별, 오류·동의 상태를 정의한다.
- Production Key/RSO 준비와 현재 가능한 데모의 차이 및 후속 구현 순서를 명시한다.
- 공식 출처·확인 날짜·미검증 사항, Task Result와 Agent Report를 기록한다.

## Verification commands

```sh
git diff --check
python3 /tmp/fe022-verify-docs.py
git status --short --branch
```

문서 검사는 허용 파일만 변경했는지, 상대 링크 대상이 존재하는지,
화면 ID 및 상세 5탭·주요 미확정 항목·표본 시나리오가 빠지지 않았는지 확인한다.
제품 소스/UI 변경이 없으므로 빌드·화면 캡처는 이번 설계의 검증 대상이 아니다.

## Result

### 변경 파일

- `docs/frontend/API-DATA-MAP.md`: 홈·프로필·사이드바·경기 목록27영역, 상세5탭, 지표 원본/계산/제약 대응표.
- `docs/frontend/API-MOCK-DESIGN.md`: 데이터 경계·표본4경기·기대 합계·12시나리오·일관성·누락/오류·동의·후속 구현 순서.
- `docs/tasks/TASK-FE-022.md`: 범위·승인·검증·결과.
- `docs/tasks/TASK-FE-021.md`: PR #14 병합 상태만 갱신.
- `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/frontend/SCREEN-MAP.md`: 후속 설계 연결과 현재 구현/계획 구분.
- `docs/PROGRESS.md`: 진행 기록.
- `.agent-reports/CURRENT.md`: 공통·Codex 보고(ignored).

### 실행·검증 결과

- `git fetch origin`, `git switch codex/frontend-rework`, `git merge --ff-only origin/codex/frontend-rework`: PASS, 기준 `660c6cd`.
- `git merge origin/dev`: Already up to date. 이후 승인된 안정본 업데이트 `git push origin codex/frontend-rework:dev`: PASS, non-force.
- `git ls-remote --heads origin dev codex/frontend-rework`, GitHub compare API: 확인 시 두 원격 모두 `660c6cd`, ahead/behind 0.
- `git switch -c codex/api-mock-design`: PASS.
- Riot 공식 문서의 Match·Matchlist·Content·Leaderboard 응답 및 신청/RSO 안내 확인. 실제 API 호출·키 입력 없음.
- `python3 /tmp/fe022-verify-docs.py`: PASS. 허용 파일 범위·제품 소스 변경0·상대 링크·화면27영역·상세5탭·시나리오12개·JSON 예시 검증.
  표본4경기 K/D/A 합계65/56/23, Jett42/32/11, 승률75% 확인.
- 최초 문서 검사는 기존 PROGRESS의 file URL을 상대 경로로 분류한 검사기 오류로 실패했다.
  URL scheme을 분리하도록 수정 후 PASS. 기존 링크/테스트를 지우거나 비활성화하지 않았다.
- `git diff --check`: PASS. `git status --short --branch`: 문서만 변경, 새 원본3개는 미추적 상태.
- 독립 문서 리뷰의 네 항목(서버 배치 확정 여부·분모0·F04 캐시 시나리오·중복/내용 충돌)을 반영했다.

### 남은 범위

- 새 DTO·fixture·공급자·집계 함수는 아직 구현하지 않았다. 현재 화면·수치·이미지·라인업은 그대로다.
- 공식 문서 기반 합성 설계이며 실제 응답의 완전성·권한·보존 기간·값의 의미는 키 승인 후 검증해야 한다.
- KAST·현재/최고 RR·무기별 HS·운영 Probe Score 등 보류 항목은 대응표를 따른다. 없는 값에 대한 임의 산식을 만들지 않았다.
- 다음 구현 Task에서 HANDOFF와 소스 읽기/쓰기 범위를 확정하고 작은 표본부터 진행한다.
- 제품 소스/UI 변경이 없어 빌드·Playwright 시각 검증은 실행하지 않았다. 사용자 요청에 따라 검증된 문서를 커밋·푸시·PR로 전달한다. 병합·다음 구현은 자동 수행하지 않는다.
