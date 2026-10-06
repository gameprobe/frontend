# TASK-FE-013 — 홈·프로필 공통 헤더·푸터 분리 및 Search 외형 통일

## Status

IMPLEMENTED — 사용자 지정 구현·검증 완료, 사용자 검토 대기 (2026-09-18).
문서 준비 후 사용자 지시에 따라 공통 헤더·푸터와 Search 외형을 구현했다.
사용자 요청으로 커밋·푸시를 진행하며, `codex/frontend-rework` 대상 PR 생성·병합은 사용자가 진행한다.

## Goal

[모듈 분리 계획](../frontend/REFACTORING.md)의 B1을 진행한다. 홈·프로필에서
따로 작성한 상단 브랜드 바, 검색·내비게이션, 푸터를 공통 컴포넌트로 옮겨
한곳에서 수정할 수 있게 한다. 홈이 프로필 전용 CSS를 직접 가져오는 연결도 제거한다.
Search 외형 통일만 의도적인 시각 변경으로 구분하고, 다른 화면과 동작은 보존한다.

- 기준: `codex/frontend-rework`, `6cde828` (PR #5, FE-012 병합).
- 작업 브랜치: `codex/frontend-shared-shell`.
- 기존 공통 설정: `stats-shell/branding.ts`, `stats-shell/theme.module.css` 재사용.
- 화면 연결: [화면 정의서](../frontend/SCREEN-MAP.md)의 H01~02/H06, P01의 브랜드·내비게이션, P09.
- P01의 Mock 안내와 P10의 토스트는 프로필에 둔다. 프로필 본문·통계·경기 컴포넌트 분리는 후속 Task다.

## 현재 차이와 변경 의도

FE-012 후 1440×960, 브라우저 100% 조건에서 확인한 Search 기준이다.
구현 시작 전에는 현재 브랜치에서 다시 Before를 확보한다.

| 항목 | 홈 | 프로필 Overview |
|---|---|---|
| 구성·동작 | `#riot-id`로 이동하는 링크 | 입력 후 기존 Mock 안내 토스트를 표시하는 폼 |
| 박스·기본 배경 | 180×44px, `#2a3c4f` | 동일 |
| 글자 | 14px / 700, `#e9edef` | placeholder 16px / 700, `#b4c2cf` |
| 돋보기 | `#e9edef` | `#b4c2cf` |
| hover | 전체 `brightness(1.14)` | 밝기 변화 없음 |

### Search 외형 통일 기준안

- 기존 데스크톱 박스 180×44px와 배경 `#2a3c4f`를 유지한다.
- 홈 Search 문구와 프로필 placeholder는 공통 `--font-value`(기본 16px), 굵기 700을 사용한다.
- 두 화면의 Search 문구·placeholder·돋보기는 공통 `--text`(기본 `#e9edef`)를 사용한다.
  placeholder opacity를 명시해 브라우저 기본 흐림이 끼어들지 않게 한다.
- Search 영역 전체를 밝게 하는 hover 필터는 두 화면 모두 사용하지 않는다.
  키보드 포커스는 공통 `--gold` 테두리로 명확히 표시하고 공간을 밀지 않게 한다.
- 작은 화면의 검색창 폭·메뉴 스크롤·숨김 규칙은 기존 반응형 기준을 유지한다.
  같은 화면 너비에서 문구·아이콘의 크기와 색은 두 화면이 같은 기준을 사용한다.
- 위 기준안은 사용자의 Task 기반 구현 지시에 따라 이번 구현에 적용한다.

## 구현 경계

아래 네 파일을 구현했다. 헤더 내부 역할은 같은 파일의 함수로 구분했다.

| 구현 파일 | 책임 | 부모 화면에 남기는 것 |
|---|---|---|
| `stats-shell/StatsShell.tsx` | 공통 main 범위·기본 스타일을 적용하는 얇은 외곽 구조 | 홈/프로필 본문과 데이터 |
| `stats-shell/StatsHeader.tsx` | 브랜드 바·내비게이션·Search·More 표시 | 프로필 탭 선택·검색 결과 안내와 페이지별 동작 정책 |
| `stats-shell/StatsFooter.tsx` | 브랜드·안내 문구·하단 링크 | 화면별 기존 문구 차이 |
| `stats-shell/StatsShell.module.css` | 해당 영역 CSS, 홈도 사용하는 초기화·공통 표시 규칙 | 프로필 통계·경기 전용 CSS와 홈 본문 전용 CSS |

- 헤더 내부의 브랜드/내비게이션/Search는 역할별 함수와 타입으로 구분할 수 있다.
  홈은 링크, 프로필은 입력 폼이라는 의미를 유지한다. 모든 동작을 받는 거대한 범용 설정을 만들지 않는다.
- 부모가 메뉴 항목, 선택 상태, 검색 입력값과 이벤트를 전달한다. 프로필 데이터·집계·저장·토스트를 공통 헤더로 옮기지 않는다.
- More의 상태·이벤트는 현재 소유 위치에 유지하는 것을 우선한다.
  홈의 Escape 닫기·포커스 복원과 프로필의 현재 토글 차이를 임의 통일하지 않는다.
- Connect account의 페이지별 색·hover 차이는 유지한다. Search 외 다른 디자인 변경은 포함하지 않는다.
- 공통화에 필요한 기존 UI 아이콘 코드는 모양을 유지해 이동·재사용할 수 있다.
  게임 이미지, 인체 SVG, 이미지 매핑 helper 전체를 함께 분리하지 않는다.
- 각 컴포넌트와 주요 props/CSS에 사용하는 화면·영역 및 유지하는 차이를 한국어 주석으로 적는다.
- `.page` 범위 표식에 연결된 초기화·사이트 공용 헤더/푸터 숨김을 공통 영역으로 옮길 때
  두 화면에 동일하게 적용하고, 라인업 등 다른 페이지로 이동하면 해제되도록 한다.
  main은 페이지당 하나를 유지한다.

## Allowed changes

### 문서 준비 단계 (구현 전 완료)

- `docs/tasks/TASK-FE-013.md`
- `docs/frontend/PLAN.md` (현재 Task 및 직전 Task 병합 상태)
- `docs/frontend/REFACTORING.md` (B1 계획 연결·Search 예외 명시)
- `docs/PROGRESS.md` (문서 준비 결과)
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태)

### 사용자가 구현 시작을 지정한 뒤의 소스·검증 범위

- `frontend/src/features/stats-shell/StatsShell.tsx` (신규)
- `frontend/src/features/stats-shell/StatsHeader.tsx` (신규)
- `frontend/src/features/stats-shell/StatsFooter.tsx` (신규)
- `frontend/src/features/stats-shell/StatsShell.module.css` (신규)
- `frontend/src/features/home/HomeLanding.tsx`
- `frontend/src/features/home/HomeLanding.module.css`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- 위 문서 준비 단계의 파일
- `docs/frontend/SCREEN-MAP.md` (구현 후 실제 경로·소유 함수 연결 갱신)
- `docs/visual-qa/TASK-FE-013.md` (구현 시 신규)
- `docs/visual-qa/assets/TASK-FE-013/*` (구현 시 Before/After 및 검증 근거)

읽기 전용: 프로젝트 지침, 기존 계획·Task·QA·캡처, 위 소스 경로,
`frontend/src/features/stats-shell/branding.ts`, `frontend/src/features/stats-shell/theme.module.css`,
`frontend/src/features/tracker-profile/mock.ts`, `frontend/src/features/tracker-profile/mock.test.cjs`,
`frontend/src/components/HomeSearch.tsx`, `frontend/src/components/AnalysisExampleCards.tsx`,
`frontend/src/app/page.tsx`, `frontend/src/app/players/[puuid]/page.tsx`,
`frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.ts`, `docker/compose.frontend.yml`.

HANDOFF.json은 현재 없다. 사용자 지정 Task의 문서 준비와 후속 구현 범위를 위와 같이
구분하며 Claude의 인계 문서가 작성된 것으로 간주하지 않는다. 검증용 임시 스크립트는 `/tmp`에 둔다.

## Forbidden changes

- Search 기준 외의 색·크기·배치·텍스트·버튼 동작 변경. 계정 버튼과 More 차이의 임의 통일.
- 게임 이미지·인체 SVG·이미지 경로·선택·매핑·오버레이 변경 또는 자산 추가.
- 라인업 소스·공용 App 레이아웃·전역 CSS·백엔드·의존성·실행 환경 변경.
- 공통 테마 26개 변수 기본값, 브랜드 설정, Mock 값·통계식·검색 경로·저장 키 변경.
- 실제 검색/API/RSO/Overwolf 연결, 프로필 본문·상태 훅·데이터 공급 분리.
- 요청 없는 커밋·푸시·PR 생성·병합·기존 브랜치 삭제.

## Acceptance criteria

### 문서 준비 완료 기준

- 기준 커밋에서 작업 브랜치를 만들고 목표·수정 파일·보존 조건·완료 기준·검증을 명시한다.
- 현재 문서 준비와 향후 구현을 구분하며 구현 전용 새 파일을 존재하는 것으로 표시하지 않는다.
- 계획 문서의 B1에 이 Task를 연결한다. 현재 화면 정의서의 코드 위치는 바꾸지 않는다.
- 추적된 변경은 문서에 한정하고 앱 구현·검증을 완료했다고 기록하지 않는다.

### 후속 구현 완료 기준

1. 홈과 프로필이 같은 헤더·푸터 컴포넌트와 공통 스타일을 사용한다.
   `HomeLanding`에서 `TrackerProfile.module.css` 직접 import가 제거된다.
2. 브랜드·공통 테마는 FE-012의 파일을 계속 사용하고, 사용처 주석 및 화면 정의서가 실제 구조와 일치한다.
3. Search 기본/hover/키보드 focus와 입력 중 상태를 확인한다. 박스 배치·반응형을 보존하고 앞서 명시한 글자·아이콘·hover·focus 기준을 적용한다.
4. 홈 상단 Search는 `#riot-id`, 본문 검색은 기존 고정 데모, Overview는 IED 프로필로 이동한다.
   프로필 검색은 기존 조건의 토스트만 표시하며 실제 조회나 다른 경로 이동을 추가하지 않는다.
5. 홈/프로필의 메뉴 구성·활성 표시·링크 목적지와 More 동작, 프로필 Mock 안내 닫기·알림 수명이 유지된다.
6. Search 외 영역의 배치·문구·색·이미지가 유지된다. 홈 본문 검색/분석 예시의 CSS 덮어쓰기와
   프로필 탭·필터·경기 펼침·저장 동작에 회귀가 없다.
7. 공용 헤더·푸터가 중복되지 않고, 홈↔프로필 및 양쪽에서 라인업으로 이동한 뒤 배경·공용 스타일이 복원된다.
8. 아래 구현 검증이 통과하고 Before/After 보고서에 Search의 의도된 차이와 다른 영역의 비교 결과를 구분한다.

## Verification commands

### 문서 준비 단계 (구현 전 완료)

```sh
git diff --check
git diff --exit-code 6cde828 -- frontend backend docker
git status --short --branch
```

신규 문서 포함 공백·코드 펜스·상대 링크 및 변경 허용 경로를 확인한다.
문서만 작성하는 단계에서는 앱 빌드·Playwright 촬영을 실행하지 않는다.

### 구현 단계

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
git status --short
```

- Playwright Before/After: 홈·프로필 각각 desktop1920×960 / mobile390×844, 브라우저 100%.
  헤더 기본/More 열림/검색 포커스/프로필 입력 상태와 푸터를 포함한다.
- 320/390/700/701/768/1000/1100/1101/1250/1440/1499/1500/1920px 및
  이동한 CSS의 추가 분기점에서 요소 겹침·잘림·페이지 가로 넘침·sticky 내비게이션을 확인한다.
- 홈 Search 앵커와 본문 데모 검색, 프로필 검색의 빈값·일치·불일치 안내,
  양쪽 More 열기/닫기와 기존 키보드 동작, 브랜드/계정/하단 링크를 확인한다.
- 프로필 6탭·요원/승패/Act 필터·빈 결과/초기화·20→23경기·한 경기 펼침/상세 탭·저장 유지 검사.
- 홈→프로필→라인업과 홈→라인업 이동의 공용 스타일 복원, 브라우저 실행 오류를 확인한다.
- Search만 명시적 시각 변경이므로 전체 PNG 차이 0을 완료 조건으로 삼지 않는다.
  나머지 영역 비교와 승인된 변경 범위를 QA 보고서에 기록한다. 사용자 브라우저 배율은 변경하지 않는다.

## Result

### 문서 준비

- 기준 `6cde828`에서 `codex/frontend-shared-shell` 브랜치를 생성했다.
- 실제 변경 파일: 이 Task, `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`,
  `docs/PROGRESS.md`, `.agent-reports/CURRENT.md` (ignored).
- `git switch -c codex/frontend-shared-shell`: PASS, 기준 `6cde828`.
- `git diff --check`: PASS. `git diff --exit-code 6cde828 -- frontend backend docker`: PASS, 차이 없음.
- Python 문서 검사: 변경 허용 문서 4개, 추가 로컬 링크 7개, 공백·코드 펜스·브랜치/기준 검사 PASS.
  기존 PROGRESS 이력의 다른 개발자 PC용 `file:` 링크는 신규 링크 검사 대상에서 제외했다.
- 독립 문서 검토: 준비/구현 구분, Search 변경 기준 및 동작 보존 범위 확인.
- 소스 구현·앱 빌드·새 UI 촬영은 실행하지 않았다. 커밋·푸시 없음.
- 남은 사항: 사용자가 Task의 범위와 Search 기준안을 검토한 뒤 구현 시작을 지정한다.

### 구현

- 소스 변경 8개:
  - `frontend/src/features/stats-shell/StatsShell.tsx`
  - `frontend/src/features/stats-shell/StatsHeader.tsx`
  - `frontend/src/features/stats-shell/StatsFooter.tsx`
  - `frontend/src/features/stats-shell/StatsShell.module.css`
  - `frontend/src/features/home/HomeLanding.tsx`
  - `frontend/src/features/home/HomeLanding.module.css`
  - `frontend/src/features/tracker-profile/TrackerProfile.tsx`
  - `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- 문서: 이 Task, frontend PLAN/REFACTORING/SCREEN-MAP, PROGRESS,
  `docs/visual-qa/TASK-FE-013.md`, 해당 assets의 PNG38장과 verification.json, ignored CURRENT.
- 공통 외곽 main·초기화, 브랜드 바/내비게이션/Search/More, 푸터를 분리했다.
  HomeLanding에서 프로필 CSS import를 제거했다. 부모의 상태·검색 안내·탭 함수는 유지했다.
- Search16px/700·밝은 글자/돋보기·hover 필터 제거·공통 키보드 포커스를 적용했다.
  데스크톱180×44 및 기존 모바일 폭/숨김을 유지했고, 다른 영역의 외형은 보존했다.
- 브랜드/테마26개 기본값 파일은 무변경이다. ≥1500px sidebar288px는 프로필에만 남고
  해당 변수를 사용하지 않는 홈은 공통 기본272px를 받는다. 홈 시각 배치는 동일하다.
- Docker Verification commands: Mock PASS, TypeScript PASS, Lint0경고0오류,
  production build PASS(정적11페이지), 개발 서버 복원 PASS.
- `/tmp/fe013-visual.cjs before/after`: 21너비×2화면42조건, 각18장.
  Search 밖 요소 태그/텍스트/위치/18개 계산 스타일 동일, Search 박스 보존·색/16px 확인,
  main1개·가로 넘침0·실행 오류0 PASS.
- `/tmp/fe013-interactions.cjs`: 검색·키보드 포커스·More·안내 알림 수명·계정/푸터 링크·sticky·
  6탭·필터·빈 상태·펼침·저장·라인업 복원 등18항목 PASS. 추가 키보드 캡처2장.
- Python/Pillow18쌍 대조: 전체 페이지·푸터·More 열림은 Search 밖 픽셀 차이0.
  프로필 모바일 focus/입력2장에는 More 버튼 모서리16픽셀씩 최대 RGB1 차이가 남는다.
  계산 스타일과 실제 배치는 동일하며 정확한 수치는 [Visual QA](../visual-qa/TASK-FE-013.md)에 기록했다.
- 독립 코드·시각 검토에서 새 레이아웃 결함을 찾지 못했다. 정식 Cursor 리뷰는 별도다.
- 구현 중 발견한 홈 본문 CSS 이동 범위 오류와 Search 모바일 specificity 회귀를 수정한 뒤
  최종 캡처/비교를 다시 통과했다. 관련 영역을 검사에서 빼거나 테스트를 비활성화하지 않았다.
- 남은 범위: 계정 버튼/More의 기존 페이지별 차이, 본문 컴포넌트·상태·데이터 분리,
  기존 LAST20 제목 한계. 이미지·라인업·Mock·실제 API/Overwolf·의존성 무변경.
- 최종 `git diff --check` 및 문서 검사 PASS: 허용 파일53개(소스8·문서6·PNG38·JSON1), 추가 로컬 링크55개, 코드 펜스·신규 파일 공백 확인. 동결한 브랜드/테마/Mock/백엔드/실행 환경 무변경 확인.
- 사용자 요청으로 검증된 변경을 커밋·푸시한다. `codex/frontend-rework` 대상 PR 검토·병합을 기다리며 후속 Task는 자동 시작하지 않는다.
