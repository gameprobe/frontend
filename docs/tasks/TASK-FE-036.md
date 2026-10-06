# TASK-FE-036 — dev 신규 화면의 공통 디자인 정합성

## Status
IMPLEMENTED

## Goal
사용자가 요청한 동료의 dev 변경 범위를 확인하고, 신규 Insights 화면을 기존 홈·프로필·보조 화면의 공통 테마에 맞춘다.

## Scope
- 기준: 최신 dev `e1a3288`, 브랜치 `codex/dev-design-alignment`.
- 동료 변경 비교: `53a0542..9ac428c`. 프론트·문서·프론트 환경변수 예시만 변경했으며 백엔드 소스 변경은 없다.
- Insights의 색상·글자 크기·탭·안내·버튼을 기존 테마 변수에 연결한다. 분석 문구·가상 수치·탭 동작·개인정보/약관 내용은 보존한다.
- 최종 사용자 요청: 공통 메뉴 끝을 Lineups → Smokes → Insights로 맞추고, More에서는 Insights 중복 링크를 제거한다. 개인정보/약관/계정 연결은 유지한다.
- 이번 Task에서 관리자·DB·공개 API·인증은 변경하지 않는다. 기존 관리자와 스모크 저장 구조를 읽기 전용으로 점검하여 후속 등록 기능 범위를 기록한다.
- 자료 주소와 맵 시작/도착 위치를 함께 등록하려는 사용자 의도를 후속 작업에 반영한다. 신규 기능 구현을 이번 디자인 수정에 혼합하지 않는다.
- 사용자 승인에 따라 검증 후 커밋·푸시하고 현재 기준 브랜치 dev로 PR을 생성한다. 병합·배포는 수행하지 않는다.

## Allowed changes
- `frontend/src/app/insights/Insights.module.css`
- `frontend/src/app/insights/page.tsx` — 기존 내용·동작을 보존하는 최소 마크업만
- `frontend/src/features/stats-shell/navigation.ts`
- `frontend/src/features/stats-shell/StatsHeader.tsx` — More의 중복 Insights 링크만 제거
- `frontend/src/features/stats-shell/SupportPage.tsx`, `SupportPage.module.css` — 사용자 폭 피드백: Insights 전용 넓은 본문 옵션, 다른 안내 화면 기본 폭 보존
- `docs/tasks/TASK-FE-036.md`, `docs/frontend/PLAN.md`, `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-036.md`, `docs/visual-qa/assets/TASK-FE-036/**`
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`
- 동료가 변경한 다른 프론트 소스·공통 테마·기존 관리자/백엔드/스모크 파일은 HANDOFF 목록 내 읽기 전용 참조.

## Verification commands
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- Playwright: Before/After 1440/390px·ko/en, Insights 3탭·키보드·안내·링크·공통 메뉴 및 홈/프로필/라인업/스모크 회귀 확인. 가로 넘침·실행 오류 검사.
- Before/After 이미지 직접 대조 및 독립 검토, `docs/visual-qa/TASK-FE-036.md` 기록.
- `git diff --check`, 분석 콘텐츠와 관련 없는 코드 미변경 확인.

## Result
- Status: IMPLEMENTED
- Human Decision Required: NO (디자인 보완 범위)
- 소스 변경은 Insights CSS/page, 공통 메뉴 순서, SupportPage TSX/CSS, StatsHeader의 여섯 파일이다. 별도 청록 팔레트·글자 크기를 테마 변수에 연결하고, 주요/보조 버튼·키보드 초점·모바일 배치를 정리했다. 폭 피드백에 따라 Insights만 홈·프로필과 동일한 외곽 컨테이너를 사용한다.
- 동료의 분석 수치·한영 문구·개인정보/약관·통계 번역·공개 API 설정을 유지했다.

### 실제 변경 파일
- `frontend/src/features/stats-shell/StatsHeader.tsx`
- `frontend/src/app/insights/Insights.module.css`, `frontend/src/app/insights/page.tsx`
- `frontend/src/features/stats-shell/SupportPage.tsx`, `frontend/src/features/stats-shell/SupportPage.module.css`
- `frontend/src/features/stats-shell/navigation.ts`
- `docs/tasks/TASK-FE-036.md`
- `docs/frontend/PLAN.md`, `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-036.md`
- `docs/visual-qa/assets/TASK-FE-036/verify.cjs`, `before.json`, `after.json`, `comparison.json`, Before/After PNG42개 (각 파일 목록은 두 JSON의 screens)
- 폭 보완: `docs/visual-qa/assets/TASK-FE-036/width.cjs`, `width-before.json`, `width-after.json`, `width-comparison.json`, `width-` 접두사 Before/After PNG20개 (각 파일 목록은 결과 JSON의 screens)
- 최종 메뉴: `docs/visual-qa/assets/TASK-FE-036/menu.cjs`, `menu-before.json`, `menu-after.json`, `menu-` PNG24개, `final-after.json`, `final-after-` PNG21개
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md` (무시 파일)

### 실행 명령과 결과
- `docker exec valorant-frontend-dev-frontend-1 npx tsc --noEmit`: PASS.
- `docker exec valorant-frontend-dev-frontend-1 npm run lint`: PASS, lint 경고/오류0.
- 동일 컨테이너의 임시 `/tmp/fe036-build-*`에 src/public/공개 빌드 설정을 복사하고 기존 node_modules 연결 후 `npm run build`: PASS, 정적14경로. 실제 .env는 읽거나 복사하지 않았다. 기존 개발 서버의 .next는 보존했다.
- `PLAYWRIGHT_MODULE=<bundled playwright> QA_STAGE=theme node docs/visual-qa/assets/TASK-FE-036/verify.cjs before` / `after`: PASS, 각21장, 실행오류0·가로넘침0.
- 분석 본문 텍스트12조건 전후 동일, 관련 없는 소스 diff 없음, 홈/프로필/라인업/스모크8쌍의 헤더 아래 픽셀 동일 PASS.
- `git diff --check`: PASS. 독립 코드·시각 검토 PASS. [Visual QA](../visual-qa/TASK-FE-036.md) 참조.

### 남은 사항 및 관리자 후속 범위
- 빌드 컨테이너의 Git 미설치에 따른 기존 버전 조회 경고가 있으나 빌드·Lint 모두 성공했다. 환경/의존성은 변경하지 않는다.
- 관리자 구현은 별도 Task로 진행한다. 사용자는 자료 주소 + 지도 시작/도착 위치 등록을 요청했다.
- 라인업에는 기존 편집기·토큰 인증·Mongo 저장/공개 API가 있다. 초안 저장 후 공개 상세로 보내는 이동 흐름, 지원 맵/요원 선택지, 맵/요원 변경 시 이전 마커 처리와 실제 이미지 영역 좌표를 보완해야 한다.
- 스모크에는 관리자·저장 API가 없고 예시만 있다. 기존 유형(원형/Harbor벽), 시작·도착/벽 끝·경로·자료 URL·상태를 저장하는 계약과 Mongo 구현을 먼저 마련한 뒤 관리자 화면과 공개 탐색을 연결해야 한다.
- 시작/도착은 원본 맵의0~1 좌표로 저장하고 공격/수비 회전은 표시에서만 처리한다. 실제 게임 탄도 계산은 포함하지 않는다.
- 기존 지도·총기/요원 자산은 변경하지 않았다. 새 백엔드 API/DB 계약은 현재 Task에서 구현하지 않았다.
- 사용자 확인을 받아 최종 메뉴 보완까지 검증했다. 이번 브랜치를 dev 대상 PR로 제출하며 병합은 사람이 수행한다. 관리자 구현은 후속 Task다.

## 사용자 폭 피드백 보완

- Insights는 기존 SupportPage의 920px 본문 제한을 상속한다. 홈/프로필의 공통1440px 컨테이너와 좌우 여백에 맞추는 선택 옵션을 추가하고 Insights에서만 사용한다.
- 기존 승인된 색상·글자·내용·동작은 보존한다. 약관/개인정보/연결/조회 실패 화면의 기본/compact 폭을 유지하고 별도 회귀 검증한다.
- 1920/1440/650/390px에서 폭·가로넘침·Before/After를 확인한다.

### 폭 보완 실행 결과

- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-036/width.cjs before` 및 `after`: PASS, 각각10장, 1920/1440/650/390px에서 홈과 Insights의 좌우 위치·폭 일치, 내용 동일, 오류/넘침0.
- 데스크톱 본문920→1400px(공통 외곽1440px 안쪽), 650px 화면의 여백20→10px, 390px 본문370px 유지.
- 개인정보/연결/기록 없음의6조건은 기존 폭/위치 유지. 이미지5쌍은 완전 동일, 1440px 개인정보1쌍은 목록 점의34픽셀 차이만 관측되어 직접 확인했다. 글자/배치 변화 없음.
- `docker exec valorant-frontend-dev-frontend-1 npx tsc --noEmit`, `npm run lint`: 재검증 PASS. 동일 컨테이너의 별도 `/tmp/fe036-width-build-*`에서 `npm run build`: PASS(정적14경로).
- 독립 코드/시각 검토 PASS. 최신 폭 화면은 Visual QA의 후속 기록을 기준으로 한다.
- 사용자 후속 메뉴 질문: Insights 중복 More 링크와 순서 변경은 의견만 안내했으며, 이번 폭 보완에서 메뉴를 추가 수정하지 않았다.

## 최종 메뉴 확정 및 PR 준비

- 사용자 승인: 상단 끝은 `Lineups → Smokes → Insights`, More는 개인정보/약관/계정 연결만 유지한다. dev 기준의 상단 순서는 유지하며 More의 중복 Insights만 제거한다.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-036/menu.cjs before` 및 `after`: 각12장, 각각20조건 PASS. 1440/390px·ko/en·홈/프로필/라인업/스모크/인사이트 메뉴 순서, More 링크, Escape와 초점 복귀, 모바일 키보드 Insights 이동, 선택 표시, 개인정보 링크 이동 검증.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-036/verify.cjs after`: 최종21장·기존3탭/키보드/내용/주요 화면 PASS. 스크립트 기본은 최종 단계이며 `QA_STAGE=theme`은 이전 테마 단계의 재현용이다. 기존 캡처를 덮어쓰지 않는다.
- 최종 Docker `npx tsc --noEmit`, `npm run lint`, 별도 `/tmp/fe036-menu-build-*`의 `npm run build`: PASS. 실행 오류0/가로 넘침0.
- 메뉴 PC/모바일 After 직접 검토 및 독립 코드·시각 검토 PASS. `git diff --check`: PASS.
- 원격 갱신 후 dev 기준 e1a3288과 HEAD 동일, 기존 작업 PR 없음 확인. 구현 커밋을 현재 작업 브랜치에 푸시하고 dev PR로 제출한다.
