# TASK-FE-041 — 상세 지도 겹친 마커 선택 보완

## Status
IMPLEMENTED

## Goal
라인업 상세의 스킬 마커가 같은 위치나 가까운 위치에서 겹쳐도 모든 스킬과 해당 자료를 선택할 수 있게 한다.

## Scope and authorization
- 사용자 요청: PR #48 병합 후 범위를 먼저 정하고 새 작업 브랜치에서 마커 선택을 보완한다.
- 기준 `codex/frontend-rework` 4e29dbd → `codex/lineup-marker-selection`.
- 상세에 스킬이 여러 개일 때 자료 가이드 바로 위에 번호·스킬명 버튼을 추가한다. 기존 선택 상태와 자료 표시를 공유하고 선택·키보드 포커스 마커를 앞으로 표시한다.
- 동일 스킬명은 번호로 구분한다. 마우스·터치·키보드 접근과 좁은 화면 줄바꿈을 지원한다.
- 원본 좌표·지도 방향·경로·미디어 처리, 0/1개 마커 화면을 유지한다. 공개 목록은 이미 텍스트 선택 기능이 있다.
- 백엔드/API/DB/인증/관리자/스모크/새 의존성 및 지도 확대·자동 핀 펼치기는 제외한다.
- DB 쓰기 없이 합성 브라우저 응답으로 검증한다. 커밋·푸시·PR은 별도 요청 후 진행한다.

## Allowed changes
- frontend/src/components/LineupDetail.tsx
- frontend/src/components/LineupDetail.module.css
- docs/tasks/TASK-FE-041.md
- docs/frontend/PLAN.md
- docs/PROGRESS.md
- docs/visual-qa/TASK-FE-041.md
- docs/visual-qa/assets/TASK-FE-041/**
- .agent-reports/HANDOFF.json, CURRENT.md, VERDICT.json (Git 제외)
- 나머지 HANDOFF 파일은 읽기 전용 참고다.

## Verification commands
- 프론트 Docker: `npx tsc --noEmit`, `npm run lint`.
- 프론트 Docker: `node src/features/lineup-explorer/model.test.cjs`, `node src/features/lineup-explorer/media.test.cjs`, `node src/lib/lineup-api.test.cjs`.
- 프론트 격리 임시 복사본: `npm run build` (개발 서버의 .next 및 비밀환경파일과 분리).
- Playwright `docs/visual-qa/assets/TASK-FE-041/marker-selection.cjs before|after`: 동일 좌표·근접 좌표·동일 스킬명, 전체 항목 선택, 영상별 원본 링크/자료 없음, 지도/목록 상태 동기화, 키보드·터치·마우스, 저장 좌표·경로 유지, 0/1개 마커, PC1440/모바일390 및320px 반응형. Before/After 핵심 영역 캡처·보고서 작성.
- 기존 FE040 `detail-errors.cjs after`: 오류·미디어 회귀 23개 (결과/캡처는 임시 폴더).
- `git diff --check`, 비밀환경파일 미추적 확인. API 쓰기·브라우저 실행 오류·깨진 이미지·가로 넘침0.

## Result
Status: IMPLEMENTED — 구현·검증 완료. 사용자 요청으로 커밋·푸시·codex/frontend-rework 대상 PR 제출 진행.
Human Decision Required: NO

### 구현 요약
- 상세에서 여러 스킬에 번호·이름 버튼을 제공한다. 기존 selectedSkill을 지도와 공유하고 자료 보기 대상을 명시했다.
- 선택 스킬은 다른 마커 위로, 키보드 포커스 마커는 최상단으로 표시한다. 0/1개 마커에는 보조 목록을 추가하지 않는다.
- 제품 변경은 상세 컴포넌트와 전용 CSS 두 파일이다. 기존 미디어 처리·좌표·경로·공개 목록·API는 유지했다.

### 실제 변경 파일 전체
- docs/PROGRESS.md
- docs/frontend/PLAN.md
- docs/tasks/TASK-FE-041.md
- docs/visual-qa/TASK-FE-041.md
- docs/visual-qa/assets/TASK-FE-041/after-1440-map.png
- docs/visual-qa/assets/TASK-FE-041/after-390-map.png
- docs/visual-qa/assets/TASK-FE-041/after-results.json
- docs/visual-qa/assets/TASK-FE-041/before-1440-map.png
- docs/visual-qa/assets/TASK-FE-041/before-390-map.png
- docs/visual-qa/assets/TASK-FE-041/before-results.json
- docs/visual-qa/assets/TASK-FE-041/marker-selection.cjs
- frontend/src/components/LineupDetail.module.css
- frontend/src/components/LineupDetail.tsx
- docs/visual-qa/assets/TASK-FE-041/usability-before-1366.png
- docs/visual-qa/assets/TASK-FE-041/usability-before-390.png
- docs/visual-qa/assets/TASK-FE-041/usability-after-1366.png
- docs/visual-qa/assets/TASK-FE-041/usability-after-390.png
- .agent-reports/HANDOFF.json, CURRENT.md, VERDICT.json (Git 제외)

### 실행 명령과 실제 결과
- 프론트 Docker `npx tsc --noEmit`, `npm run lint`: PASS, Lint 경고/오류0.
- `node src/features/lineup-explorer/model.test.cjs`: 18개 PASS; `media.test.cjs`: 12개 PASS; `src/lib/lineup-api.test.cjs`: 11개 PASS. 총41개.
- 비밀환경파일·node_modules·.next를 제외한 `/tmp/fe041-build.XXXXXX` 복사본에서 `npm run build`: PASS(정적15페이지). 공통 스타일 우선순위 수정 후 최종 빌드도 PASS. 임시 복사본 자동 삭제, 기존 개발 서버 유지. 컨테이너의 기존 git 미설치 버전 조회 안내만 남음.
- Playwright `marker-selection.cjs after`: 25개 검사 묶음 PASS. 1440/390/320px × 공격/수비, 동일 좌표/동일 스킬명/가까운 좌표/긴 이름/자료 없는 스킬, 마우스·터치·Tab·Shift+Tab·Enter·Space, 지도/목록 선택 동기화, 좌표·경로 유지, 0/1개 마커 확인.
- 기존 `detail-errors.cjs after`(OUTPUT_DIR=/tmp/fe041-errors): 23개 PASS. 이후 수정은 선택 버튼 CSS에 한정되어 이 회귀는 반복하지 않았다.
- 기능 검사 후 직접 시각 검토에서 공통 `.page button` 초기화가 새 버튼의 배경·테두리를 덮는 결함을 발견했다. 상세 `.root` 범위를 더한 선택자로 보완하고 25개 전부 재검증했다. 최종 검사에는 실제 버튼 배경·1px 테두리·선택 색상 확인을 포함한다.
- Before2/After2장 합계229,098bytes(약224KiB). 직접 및 독립 Codex 코드·이미지 검토 수행. 별도 Cursor 검토는 실행하지 않았다.
- API는 전부 합성 응답으로 대체했고 쓰기 시도0. 실제 DB/환경값 변경 없음. 실행 예외·깨진 이미지·가로 넘침0.
- `git diff --check` PASS. `git ls-files backend/.env frontend/.env.local` 출력 없음, `git check-ignore` 두 파일 확인. 커밋·푸시·PR 없음.

### 남은 제약
- 동일 좌표의 마커를 물리적으로 펼치거나 이동하지 않는다. 번호 선택과 선택/초점 마커의 표시 순서로 모든 자료에 접근한다.
- 현재 실제 Abyss 예시는 스킬1개여서 새 목록이 나타나지 않는다. 다중 스킬 자료에서만 보인다. 검증을 위해 DB에 새 자료를 만들지 않았다.
- 스모크 저장, 관리자/공유 도착점 기능, 실제 게임 공략 품질·외부 영상 재생은 이 Task의 범위가 아니다.

[시각 검증 보고서](../visual-qa/TASK-FE-041.md)에서 Before/After 및 실행 명령을 확인할 수 있다.


### PR 전 사용성 평가 (2026-10-05)

- 사용자 요청으로 평가만 수행했다. 제품 소스·DB·환경파일·커밋·PR 변경 없음. 이번 검토에서 수정한 파일은 Task와 Git 제외 CURRENT뿐이다.
- 독립 Codex 검토: 버튼 테두리/선택 금색/번호/모바일 줄바꿈은 양호. 자료 없는 항목의 사전 표시와 자료 패널의 선택 번호·이름 안내를 개선 후보로 제시했다.
- Root가 `/tmp/fe041-usability/review.cjs`를 Playwright로 실행해 전체 뷰포트 1440×900,1366×768,390×844에서 직접 선택하고 화면을 촬영·확인했다. 동일 좌표2개/근접1개, 같은 이름2개/자료 없는1개 합성 응답을 사용했고 실제 API 쓰기0·실행 예외0이다. 검사/이미지/결과 JSON은 `/tmp/fe041-usability/`에만 보관한다.
- PC 사용성 보완 권장: 선택 버튼은 문서 Y1107에 있고 영상/자료는 Y337에 있어, 버튼을 보러 내려오면 자료가 화면 위로 사라진다. 1366×768에서 선택 후 자료 패널은 viewport Y-392~-95였고, 1440×900에서도 Y-260~37로 고정 헤더 위에 가려졌다. 자료 URL 자체는 올바르게 바뀐다. 기존 지도 영역 캡처에서는 보이지 않은 전체 화면 동선 문제다.
- 모바일390×844에서는 선택 후 목록과 자료 패널을 같은 화면에 볼 수 있었다. 선택 버튼48px, 색+선택됨 글자로 상태 구분, 이름 줄바꿈은 양호하다.
- 권장안1: 선택 목록을 자료 가이드 바로 위에 두어 PC에서 오른쪽 선택→자료를 가깝게 배치한다. 자료 가이드 제목에도 선택 번호·스킬명을 표시한다. 모바일은 지도→선택→자료 순서를 유지한다.
- 권장안2: 영상 URL 없는 항목에 자료 없음 안내를 미리 표시한다. 좌표 확인을 위해 항목 선택 자체는 허용한다. 현재는 누른 뒤에만 자료 없음을 알 수 있다.
- 기능 검증 PASS와 별개로 위 사용성 보완을 PR 전에 권장한다. 이 요청은 평가이므로 구현하지 않았다. 지도 확대·자동 핀 펼치기·관리자 기능은 이번 권장 범위에 추가하지 않는다.


### 승인된 최소 사용성 보완 (2026-10-05)

- 사용자 승인: 선택 목록을 자료 가이드 바로 위로 이동, 자료 제목에 선택 번호·이름 표시, 자료 없는 항목 사전 표시만 반영한다. 제품 소스 두 파일 범위는 동일하다.
- 기존 지도/선택/자료 상태를 재사용하며 0/1개 마커는 선택 목록을 추가하지 않는다. 자료 없는 항목도 위치 확인을 위해 선택 가능하다.
- 직전 읽기 전용 평가의 제품 변경 전 전체 viewport 캡처2장을 Before로 보존한다. 기존 선택 회귀 및 이번 세 항목을 검증하고 필수 타입·Lint·단위·격리 빌드를 수행한다.
- 커밋·푸시·PR·DB 변경은 이번 요청에 포함하지 않는다.

### 승인한 사용성 보완 완료 (2026-10-05)
- 선택 목록을 사이드바의 자료 가이드 바로 위로 이동했다. 모바일 순서는 지도 → 선택 목록 → 자료다.
- 다중 스킬 자료 제목에 선택 번호·스킬명을 표시하고, 기존 미디어 판정에 따라 자료 없는 항목에 `자료 없음`을 미리 표시한다. 해당 항목도 선택할 수 있다.
- 제품 소스는 허용된 상세 TSX/CSS 두 파일만 변경했다. Before/After 전체 뷰포트 4장과 QA 스크립트·보고서를 갱신했다.
- 최종 재검증: `npx tsc --noEmit`, `npm run lint`, 모델18/미디어12/API11개(총41개), 격리 임시 복사본 `npm run build` 모두 PASS. 빌드 정적15페이지, 기존 git 미설치 버전 조회 안내는 비차단이다.
- `OUTPUT_DIR=/tmp/fe041-final`의 `marker-selection.cjs after` 27개 PASS, `OUTPUT_DIR=/tmp/fe041-final-errors`의 기존 `detail-errors.cjs after` 23개 PASS. 자동 검사와 PC1366×768/모바일390×844 이미지 직접·독립 검토 완료. 실행 예외·가로 넘침·깨진 이미지·API 쓰기0.
- `git diff --check` PASS. `git ls-files backend/.env frontend/.env.local` 출력 없음. DB·환경파일 변경, 커밋·푸시·PR 없음. 기존 단일 스킬 예시에는 다중 선택 목록이 표시되지 않는다.

### PR 제출 승인 (2026-10-05)
- 사용자 요청으로 검증 완료 변경을 Task 단위로 커밋·푸시하고 `codex/frontend-rework` 대상 PR을 제출한다. 병합은 사용자가 수행한다.
- 최신 원격 통합 브랜치는 작업 기준과 동일한 `4e29dbd`이며, 최종 diff·범위 재검토와 환경파일 제외 확인을 통과했다. 제품 소스의 추가 변경이나 테스트 재실행은 하지 않았다.
