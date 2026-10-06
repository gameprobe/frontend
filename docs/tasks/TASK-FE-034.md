# TASK-FE-034 — Riot 신청 준비 마감

## Status
IMPLEMENTED — 로컬 검증 완료, dev→main 공개 배포 승인·진행 중

## Goal
최신 dev의 신청용 프로토타입을 검증하고, 사람이 결정할 정보만 남긴 검토 가능한 제출·배포 자료를 완성한다.

## Authorization / baseline
- 2026-09-28 사용자: 앞서 제안한 세 가지(운영 정보/정책 마감, 공개 데모 점검, 신청 설명)를 사람이 도울 영역 외 모두 완료한 뒤 의사 결정을 요청.
- origin/dev `6249e14`, 작업 브랜치 `codex/riot-submission-readiness`.
- 기존 HANDOFF FE-026은 오래된 구현 범위이므로 이번 사용자 요청에 한정해 이 Task/HANDOFF로 교체한다.
- Task 하나로 처리하며 실제 운영 정보 확정·외부 계정/배포 승인·신청 제출은 결과에서 구분한다.

## Allowed changes
- frontend/src/features/tracker-profile/SyntheticMatchPage.tsx — 누락된 공통 고지 푸터 연결
- frontend/src/features/stats-shell/service-notices.ts — 확인된 문의/고지 설정에 한정, 미확정 정보 발명 금지
- docs/riot-submission/{README,APPLICATION,DECISIONS,DEPLOYMENT}.md
- docs/tasks/TASK-FE-034.md
- docs/visual-qa/TASK-FE-034.md, docs/visual-qa/assets/TASK-FE-034/**
- docs/PLAN.md, docs/frontend/PLAN.md, docs/PROGRESS.md
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md (Codex 및 공통 상태만)
- 추가 조사 가능한 소스는 HANDOFF allowed_files에 명시. 조사 파일은 수정 허용을 의미하지 않는다.

### 조사 중 확인된 제출 장애의 보완 범위
- 2026-09-28 공개 www.game-probe.com/lineups가 http://localhost:8080/api/lineups를 요청함을 확인했다.
- frontend/src/lib/lineup-api.ts: 공개 조회 두 함수에 한해 BACKEND_URL 미설정 시 네트워크 요청 없이 기존 오류/예시 안내로 전달한다. 관리자/API 계약·인증 변경 없음.
- frontend/src/app/icon.svg: 브라우저 favicon.ico 404를 기존 GP 브랜드의 자체 SVG 아이콘으로 해소(외부 자산 없음).
- frontend/.env.example 및 README.md: 실제 사용 변수명과 백엔드 없는 신청 데모 동작을 맞춘다.
- docs/visual-qa/assets/TASK-FE-034/lineup-config.test.cjs: 공개 조회의 설정 없음/설정 있음/오류 경계를 검사한다.

## Out of scope
실제 Riot API/RSO, 공개 API·DB·인증 정책 변경, 새 의존성, 임의 운영/법적 사실 확정, 계정 생성/비밀정보 입력, 커밋/푸시, 최종 배포 및 신청 제출.

## Acceptance criteria
1. 신청 심사 경로·동의/철회·정책 링크를 데스크톱/모바일에서 확인한다.
2. 단독 합성 경기 상세에도 공통 푸터를 제공하고 Before/After 시각 보고서를 작성한다.
3. 실제 동작과 승인 후 계획을 구분한 영어 신청 초안·심사자 동선·URL 목록을 작성한다.
4. 기존 배포 설정을 확인한 실행 절차·배포 후 검사 기준을 제공한다.
5. 문의처/운영 주체/보관·외부 서비스·공개 URL·배포 승인 등 미확정 사항을 구체적 결정표로 모은다.
6. 아래 검증 결과와 미수행/사람 입력 필요 사항을 정직하게 구분한다.

## Verification commands
- cd frontend && npx tsc --noEmit
- cd frontend && npm run lint
- cd frontend && npm run build
- cd frontend && node src/features/account-connection/consentDemo.test.cjs
- node docs/visual-qa/assets/TASK-FE-034/verify.cjs before
- node docs/visual-qa/assets/TASK-FE-034/verify.cjs after
- git diff --check

## Result

### Status
- Status: IMPLEMENTED (신청 준비 범위)
- Human Decision Required: YES
- Public release / Riot submission: NOT SUBMITTED — 소유자 정보 및 공개 배포 승인 대기.

### 구현 및 자료
- 합성 단독 경기 상세에 공통 푸터를 연결하고 본문과 같은 좌우 여백을 유지했다.
- 공개 라인업 목록/상세는 NEXT_PUBLIC_BACKEND_URL 미설정·빈값 시 네트워크 요청 없이 기존 예시/오류 흐름으로 전환한다. 설정된 endpoint 경로·응답 정규화·관리자 동작은 유지했다.
- 사용하지 않는 환경변수 예시를 정리하고 로컬/공개 배포 동작을 README에 명시했다. 자체 GP SVG로 아이콘 404를 해소했다.
- docs/riot-submission에 영문 신청 문안, 심사 동선/URL, 배포 실행안, 구체적 소유자 결정표를 작성했다.
- 실제 도메인 www.game-probe.com을 확인했지만 이전 main이고, 최신 dev는 Vercel BLOCKED 및 Preview 로그인 보호 상태다. 실제 배포 준비 완료로 주장하지 않았다.

### 실행 명령과 실제 결과
- git fetch origin dev / git switch -c codex/riot-submission-readiness origin/dev: PASS, 기준6249e14. 원래 untracked current-screen.png 보존.
- cd frontend && npx tsc --noEmit: PASS.
- cd frontend && npm run lint: PASS, 경고/오류0.
- cd frontend && npm run build: PASS, 정적13개(icon.svg 포함).
- cd frontend && node src/features/account-connection/consentDemo.test.cjs: PASS, 5/5.
- node docs/visual-qa/assets/TASK-FE-034/lineup-config.test.cjs: PASS, 미설정/빈값/공백 네트워크0, 설정된 목록·상세/ID인코딩/HTTP오류.
- PLAYWRIGHT_MODULE 지정 후 verify.cjs before / after: 최종 PASS. Before52/After60+푸터4장, 1440/390px·한영, 44검사그룹. production build 대상으로 최종 After.
- PLAYWRIGHT_MODULE 지정 후 verify-lineup-detail.cjs: PASS, 기존 예시 상세/없는 항목 복구, API 요청0.
- PLAYWRIGHT_MODULE 지정 후 check-live.cjs: 조사 성공, 기존 운영7경로200·구버전 연결화면·dev 로그인 보호 확인. 최신 공개 배포 완료 판정 아님.
- QA_NODE_MODULES 지정 후 summarize.cjs: PASS, 시각 보고 자동 생성. 비교52쌍 중48쌍 동일, 나머지4쌍은 원래 높이 영역 픽셀차이0·푸터만 확장.
- git diff --check: PASS.
- Vercel list/get deployment: 성공. get_project는 입력 스키마 불일치, build logs는 도구 없음으로 세부 설정/정확한 차단 사유는 미확인.
- 초기 검증 도구 Chromium 미설치/선택자2건은 설치된 Chrome과 실제 DOM 선택자로 보정해 최종 통과. 테스트 삭제·비활성화 없음.

### 검증 한계 / 남은 결정
- 실제 수신 문의처·운영 주체·대상 지역/수익화 계획, 호스팅/분석/문의 로그와 보관 설정, 정책 최종 승인은 소유자 입력 필요. 미확인 값을 만들지 않았다.
- Vercel 최신 dev BLOCKED의 team configuration을 계정 소유자가 확인해야 한다. 현재 공개 URL은 최신 신청 빌드가 아니며 로그아웃 공개 최종 검증은 배포 후 수행한다.
- 실제 Riot API/RSO, 서버 동의/공개 권한/삭제·비동의 참가자 보호는 미구현이며 신청 설명에 승인 후 계획으로 명시.
- Playwright 최종 실행 예외/콘솔 오류/API요청0. 페이지 이동으로 취소된 RSC prefetch49건은 raw 기록에 보존, 기능 오류와 구분했다.
- Next production 서버는 optional sharp 미설치 안내를 출력한다. 빌드/이미지 표시 검증은 통과했고 새 의존성은 추가하지 않았다.
- 별도 Cursor 리뷰는 수행하지 않았다. 구현자 이미지 검토에서 본문 유지·정책 링크·줄바꿈·여백 정상 확인.
- 커밋/푸시/배포/포털 제출은 미실행. 로컬 미리보기는 http://127.0.0.1:3100 (이번 빌드)에서 확인 가능.

### 실제 변경 파일 전체

- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`
- `README.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/frontend/PLAN.md`
- `docs/riot-submission/APPLICATION.md`
- `docs/riot-submission/DECISIONS.md`
- `docs/riot-submission/DEPLOYMENT.md`
- `docs/riot-submission/README.md`
- `docs/tasks/TASK-FE-034.md`
- `docs/visual-qa/TASK-FE-034.md`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-consent-granted.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-consent-withdrawn.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-home.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-lineups.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-match-duels.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-match-economy.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-match-footer.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-match-performance.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-match-rounds.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-match-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-match.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-profile.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-smokes.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-en-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-consent-granted.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-consent-withdrawn.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-home.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-lineups.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-match-duels.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-match-economy.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-match-footer.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-match-performance.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-match-rounds.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-match-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-match.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-profile.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-smokes.png`
- `docs/visual-qa/assets/TASK-FE-034/after-1440-ko-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-consent-granted.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-consent-withdrawn.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-home.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-lineups.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-match-duels.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-match-economy.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-match-footer.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-match-performance.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-match-rounds.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-match-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-match.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-profile.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-smokes.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-en-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-consent-granted.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-consent-withdrawn.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-home.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-lineups.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-match-duels.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-match-economy.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-match-footer.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-match-performance.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-match-rounds.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-match-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-match.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-profile.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-smokes.png`
- `docs/visual-qa/assets/TASK-FE-034/after-390-ko-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/after.json`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-home.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-lineups.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-match-duels.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-match-economy.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-match-performance.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-match-rounds.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-match-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-match.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-profile.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-smokes.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-en-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-home.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-lineups.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-match-duels.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-match-economy.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-match-performance.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-match-rounds.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-match-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-match.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-profile.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-smokes.png`
- `docs/visual-qa/assets/TASK-FE-034/before-1440-ko-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-home.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-lineups.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-match-duels.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-match-economy.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-match-performance.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-match-rounds.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-match-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-match.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-profile.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-smokes.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-en-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-home.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-lineups.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-match-duels.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-match-economy.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-match-performance.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-match-rounds.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-match-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-match.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-profile.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-smokes.png`
- `docs/visual-qa/assets/TASK-FE-034/before-390-ko-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/before.json`
- `docs/visual-qa/assets/TASK-FE-034/changed-files.txt`
- `docs/visual-qa/assets/TASK-FE-034/check-live.cjs`
- `docs/visual-qa/assets/TASK-FE-034/comparison.json`
- `docs/visual-qa/assets/TASK-FE-034/deployment-status.json`
- `docs/visual-qa/assets/TASK-FE-034/lineup-config.test.cjs`
- `docs/visual-qa/assets/TASK-FE-034/lineup-detail.json`
- `docs/visual-qa/assets/TASK-FE-034/live-production-connect.png`
- `docs/visual-qa/assets/TASK-FE-034/live.json`
- `docs/visual-qa/assets/TASK-FE-034/summarize.cjs`
- `docs/visual-qa/assets/TASK-FE-034/verify-lineup-detail.cjs`
- `docs/visual-qa/assets/TASK-FE-034/verify.cjs`
- `frontend/.env.example`
- `frontend/src/app/icon.svg`
- `frontend/src/features/tracker-profile/SyntheticMatchPage.tsx`
- `frontend/src/lib/lineup-api.ts`

### 2026-09-28 후속 설명 및 결정 반영
- 사용자는 무료 예시 데모 신청과 본인 개인정보 업무 담당을 확인했다. 이메일은 추후 제공으로 보류.
- 공개 이름/지역/팀의 법적 책임 주체는 설명 단계이며 임의 확정하지 않음.
- GitHub private 및 main98jh-shin 성공/devseochanjin 차단 작성자 차이를 확인했다. Railway 문제가 아니라 Vercel 팀/작성자 연결이 유력. 정확한 플랜/권한 설정은 미확인.
- DECISIONS/APPLICATION/DEPLOYMENT/CURRENT 문서만 갱신. diff check PASS, 제품 테스트 재실행 없음. 커밋·푸시·PR·병합·배포 미실행.

## 2026-09-29 사용자 요청: 전적 페이지 ACS 표시 변경
- Allowed changes 추가: TrackerProfile.tsx, summary/SeasonOverview.tsx, summary/ProbeScoreCard.tsx, summary/AgentStatsTable.tsx의 ACS 표시 문구만. 수치와 계산식은 유지.
- 후속 검증: TypeScript, lint, build, Playwright PC/모바일 Before/After, git diff --check.
- Allowed changes 추가: match-history/MatchRow.tsx, MatchDayGroup.tsx — 목록 행·날짜 요약의 동일 한국어 표시. 영어 ACS 유지.

### ACS 표시 후속 Result (2026-09-29)
- Status: IMPLEMENTED
- Human Decision Required: NO (문구 변경 범위; 공개 배포 대기는 유지)
- 한국어 요약 2곳·요원 표·경기 행·날짜 요약 ACS → 성과점수. 수치/산식과 영어 유지. React 검토: 기존 locale hook의 무조건 호출과 표시 변경만, 신규 의존성/데이터 처리 없음.
- 검증: npm run lint, npx tsc --noEmit, npm run build PASS. node /tmp/fe034-label.cjs before/after PASS(기존 Playwright/Chrome); git diff --check PASS. 1440/390px에서 각각 11/3 표시 교체, 잔여 ACS0, 가로 넘침0, 실행오류0.
- 초기 sandbox Chrome 실행 불가를 권한 승인 후 해결. 최초 편집 스크립트 작업경로 오류는 수정 전 발생, 수정 후 빌드 재검증 PASS.
- 로컬3100 미리보기 갱신. 커밋/푸시/배포 없음.
- 이번 변경 파일 전체:
  - frontend/src/features/tracker-profile/TrackerProfile.tsx
  - frontend/src/features/tracker-profile/summary/AgentStatsTable.tsx
  - frontend/src/features/tracker-profile/match-history/MatchRow.tsx
  - frontend/src/features/tracker-profile/match-history/MatchDayGroup.tsx
  - .agent-reports/HANDOFF.json
  - .agent-reports/CURRENT.md
  - docs/tasks/TASK-FE-034.md
  - docs/visual-qa/TASK-FE-034.md
  - docs/visual-qa/assets/TASK-FE-034/verify-label.cjs
  - docs/visual-qa/assets/TASK-FE-034/label-before.json
  - docs/visual-qa/assets/TASK-FE-034/label-after.json
  - docs/visual-qa/assets/TASK-FE-034/label-before-1440.png
  - docs/visual-qa/assets/TASK-FE-034/label-before-390.png
  - docs/visual-qa/assets/TASK-FE-034/label-after-1440.png
  - docs/visual-qa/assets/TASK-FE-034/label-after-390.png

## 2026-09-29 운영 정보 확정 반영
- Allowed changes: service-notices.ts, StatsFooter.tsx, copy.ts, privacy/page.tsx, terms/page.tsx 및 기존 신청/진행/검증 문서.
- 사용자 확정: 개인 운영/담당 ShinJungho, game.probe217@gmail.com 정상 수신, 한국 운영·한국 사용자 중심·한영·해외 접속 가능한 무료 예시 데모. 추가 수정 없음.
- 로그 보관·문의 보관기간은 미확정 사실을 작성하지 않고 별도 결정안으로 정리. 공개/커밋/푸시는 최종 검토 이후.

### 운영 정보 반영 결과 (2026-09-29)
- Status: IMPLEMENTED (확정 정보 반영·검증)
- Human Decision Required: YES (문의 보관·정책·Vercel 계정 로그인·최종 공개)
- 구현: ShinJungho, game.probe217@gmail.com 정상 수신, 한국 중심 한영 무료 데모 해외 접근 범위 반영. 공통 푸터 mailto, 이메일 처리 항목 안내, 영문 신청서·결정표 갱신. 운영자/문의처 미확정 문구 제거.
- 문의 해결 후30일 이내 메일·첨부 삭제 및 휴지통 영구삭제는 검토안이며 시행/자동화 아님. 미확정 보관 기간을 공개 정책에 확정하지 않음.
- 검증 명령: npm --prefix frontend run lint; cd frontend && npx tsc --noEmit && npm run build && node src/features/account-connection/consentDemo.test.cjs PASS(동의5/5). PLAYWRIGHT_MODULE 및 QA_OUTPUT_DIR=contact 지정 verify.cjs before/after PASS(52/60장,44그룹); verify-contact.cjs PASS(16개); git diff --check PASS. React locale 호출·표시 변경 검토 PASS.
- Vercel list_projects 성공, get_project 스키마 오류, 설정 UI 로그인 화면 확인. 실제 플랜/분석/로그 보관 미확인. 공식 일반값을 계정 사실로 대체하지 않음.
- 남은 일: Vercel 로그인 후 운영 설정, 문의 보관·정책 최종 검토, 완성본 검토 후 공개 승인. 커밋/푸시/병합/배포/Riot 제출 없음.
- 과거 기록의 운영자·이메일·지역 미확정 상태는 이번 사용자 확정으로 대체됨.
- 실제 변경 파일 전체(이번 후속):
  - `frontend/src/features/stats-shell/service-notices.ts`
  - `frontend/src/features/stats-shell/StatsFooter.tsx`
  - `frontend/src/features/stats-shell/copy.ts`
  - `frontend/src/app/privacy/page.tsx`
  - `frontend/src/app/terms/page.tsx`
  - `docs/riot-submission/APPLICATION.md`
  - `docs/riot-submission/DECISIONS.md`
  - `docs/riot-submission/README.md`
  - `docs/PLAN.md`
  - `docs/PROGRESS.md`
  - `docs/tasks/TASK-FE-034.md`
  - `docs/visual-qa/TASK-FE-034.md`
  - `.agent-reports/HANDOFF.json`
  - `.agent-reports/CURRENT.md`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-connect.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-consent-granted.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-consent-withdrawn.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-home.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-lineups.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-match-duels.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-match-economy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-match-footer.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-match-performance.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-match-rounds.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-match-scoreboard.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-match.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-privacy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-profile.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-smokes.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-en-terms.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-connect.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-consent-granted.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-consent-withdrawn.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-home.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-lineups.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-match-duels.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-match-economy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-match-footer.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-match-performance.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-match-rounds.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-match-scoreboard.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-match.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-privacy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-profile.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-smokes.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-1440-ko-terms.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-connect.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-consent-granted.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-consent-withdrawn.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-home.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-lineups.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-match-duels.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-match-economy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-match-footer.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-match-performance.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-match-rounds.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-match-scoreboard.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-match.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-privacy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-profile.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-smokes.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-en-terms.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-connect.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-consent-granted.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-consent-withdrawn.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-home.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-lineups.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-match-duels.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-match-economy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-match-footer.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-match-performance.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-match-rounds.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-match-scoreboard.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-match.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-privacy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-profile.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-smokes.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after-390-ko-terms.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/after.json`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-connect.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-home.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-lineups.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-match-duels.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-match-economy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-match-performance.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-match-rounds.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-match-scoreboard.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-match.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-privacy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-profile.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-smokes.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-en-terms.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-connect.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-home.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-lineups.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-match-duels.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-match-economy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-match-performance.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-match-rounds.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-match-scoreboard.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-match.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-privacy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-profile.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-smokes.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-1440-ko-terms.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-connect.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-home.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-lineups.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-match-duels.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-match-economy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-match-performance.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-match-rounds.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-match-scoreboard.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-match.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-privacy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-profile.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-smokes.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-en-terms.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-connect.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-home.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-lineups.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-match-duels.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-match-economy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-match-performance.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-match-rounds.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-match-scoreboard.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-match.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-privacy.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-profile.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-smokes.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before-390-ko-terms.png`
  - `docs/visual-qa/assets/TASK-FE-034/contact/before.json`
  - `docs/visual-qa/assets/TASK-FE-034/contact/contact-checks.json`
  - `docs/visual-qa/assets/TASK-FE-034/contact/verify-contact.cjs`

## 2026-09-29 공개 배포 승인 및 진행
- 사용자: “dev를 main에 올리고 지금 내 도메인에 연결이 정상적으로 됐는지 확인하자.”
- 현재 검증된 로컬 FE-034 변경을 커밋·업로드하고 dev→main 통합 및 기존 도메인 배포 검증을 승인한 것으로 반영. 추가 승인 재요청 없음.
- 기준: 원격dev6249e14, main189c1eb. 다른 작업의 current-screen.png는 제외.
- 운영 정보·문의처·성과점수 변경 포함. 미확정 보관/정책 항목은 초안으로 유지하며 Riot 신청 제출은 별개.
- Railway 백엔드는 9/29 읽기 전용 확인에서 FAILED, /health는404 Application not found. 프론트 데모 공개는 백엔드 복구와 독립.

## 2026-09-29 실제 공개 배포 결과
- Status: DEPLOYED_AND_VERIFIED
- Human Decision Required: NO (요청한 통합·도메인 검증); Riot 제출/정책 최종화는 별도.
- 구현 commit6522293 → PR#30 dev통합78a97a8 → PR#31 main통합b08f9a1. 두 PR의 Frontend/Backend/Deployment config 및 Vercel 검사 PASS, 충돌/강제푸시/검사우회 없음.
- PR: https://github.com/98jh-shin/valorant-platform/pull/30 및 https://github.com/98jh-shin/valorant-platform/pull/31 (모두 MERGED).
- Production deployment dpl_2gb9NB26ZcwyE7ZpNJ24XPuPwLH5, READY, commit b08f9a1d98cccb2ff02a93474986fe1b40cd5364, aliasError=null.
- www.game-probe.com HTTPS200, game-probe.com HTTPS308 → www.game-probe.com. 두 도메인 모두 이번 배포 alias에 연결.
- 운영 URL 대상 Playwright verify.cjs after: 1440/390px·한영8경로·경기5탭·동의/취소/철회/초기화44검사그룹 PASS.60스크린샷. errors0, consoleErrors0, apiRequests0. RSC 이동취소는 raw failedRequests에 구분.
- 운영 문의 검사16개 PASS: 실제 이메일/mailto/담당자/지역, 예시 이메일 없음. 운영 화면에서 성과점수 변경 확인. 이미지 검토: PC프로필·모바일동의 정상.
- 실행: git fetch; git add(허용변경만); git diff --cached --check; git commit; git push; gh pr create/checks/merge30·31; Vercel list/get; curl -I 도메인2개; QA_BASE_URL=https://www.game-probe.com verify.cjs after; /tmp/gameprobe-public-qa/verify-contact.cjs; git diff --quiet HEAD origin/main. 전부 PASS.
- 결과 원본·스크린샷: /tmp/gameprobe-public-qa. 이 배포 후 결과 문서는 로컬 후속 기록이며 배포된 코드와 별개.
- Railway는 main push로 자동 재배포 e9e2f4e2-c15d-4152-96a5-b49c30a821a5 진행 중 상태를 관측. 복구/DB 정상은 판정하지 않음. 이번 공개 데모 API요청0.
- 개인정보 문의 보관 및 Vercel 상세 운영 설정은 여전히 미확정. 정책 초안 표시 유지, Riot 신청 미제출.
- 기존 사용자 current-screen.png 보존.

## 개인정보 안내 후속 보완 범위
- 사용자 요청: 신청 경로와 최종 정책 항목을 설명하고 수정 가능한 부분 처리.
- Allowed changes: privacy/page.tsx, stats-shell/copy.ts, docs/riot-submission/POLICY-OPERATIONS.md 및 기존 신청/작업/시각검증/보고 문서. 기존 배포 후 기록 보존.
- 검증: tsc/lint/build/동의테스트, policy/verify.cjs before/after(정책2경로·한영·1440/390), diff check.

### 정책 보완 후속 Result (2026-09-29)
- Status: IMPLEMENTED (검증된 사실·설명 보완); 정책 최종화는 남은 사실 확인 대기.
- Human Decision Required: YES — 문의 해결후30일 이내 수동 영구삭제 시행 여부 및 Vercel 로그인/계정 설정 확인.
- 변경: Vercel 호스팅과 운영기록 가능성, 로그 조회기간/전체파기 구분, Gmail/브라우저 삭제 경계, 개인정보 요청 방법, 이미 공개된 상태에 맞춘 초안 문구. POLlCY-OPERATIONS 문서에 바로 반영할 한영30일 제안 및 운영절차 작성.
- 실행/결과: npm --prefix frontend run lint; cd frontend && npx tsc --noEmit && npm run build && node src/features/account-connection/consentDemo.test.cjs PASS(5/5). policy/verify.cjs before/after PASS(8쌍,실행오류0,넘침0). git diff --check PASS.
- 근거: Riot 공식 VALORANT 정책(개인키 불가/Production후RSO), 개인정보보호법30조, Vercel Runtime Logs/Privacy Notice, Gmail 삭제 안내 확인.
- 한계: 문구로 실제 메일 삭제·Vercel 설정 적용을 대체하지 않음. 계정 상세 접근 오류/로그인 필요는 기존 확인에서 미해소. 실제 플랜·보관/국외처리 등 확정값을 발명하지 않음. 법률검토 완료로 주장하지 않음.
- 이번 수정은 로컬 검토본. 기존 공개 b08f9a1 유지, 추가 commit/push/배포·신청 제출 없음.
- 이번 변경 파일 전체:
  - frontend/src/app/privacy/page.tsx
  - frontend/src/features/stats-shell/copy.ts
  - docs/riot-submission/POLICY-OPERATIONS.md
  - docs/riot-submission/DECISIONS.md
  - docs/riot-submission/README.md
  - docs/tasks/TASK-FE-034.md
  - docs/visual-qa/TASK-FE-034.md
  - .agent-reports/HANDOFF.json
  - .agent-reports/CURRENT.md
  - docs/visual-qa/assets/TASK-FE-034/policy/after-1440-en-privacy.png
  - docs/visual-qa/assets/TASK-FE-034/policy/after-1440-en-terms.png
  - docs/visual-qa/assets/TASK-FE-034/policy/after-1440-ko-privacy.png
  - docs/visual-qa/assets/TASK-FE-034/policy/after-1440-ko-terms.png
  - docs/visual-qa/assets/TASK-FE-034/policy/after-390-en-privacy.png
  - docs/visual-qa/assets/TASK-FE-034/policy/after-390-en-terms.png
  - docs/visual-qa/assets/TASK-FE-034/policy/after-390-ko-privacy.png
  - docs/visual-qa/assets/TASK-FE-034/policy/after-390-ko-terms.png
  - docs/visual-qa/assets/TASK-FE-034/policy/after.json
  - docs/visual-qa/assets/TASK-FE-034/policy/before-1440-en-privacy.png
  - docs/visual-qa/assets/TASK-FE-034/policy/before-1440-en-terms.png
  - docs/visual-qa/assets/TASK-FE-034/policy/before-1440-ko-privacy.png
  - docs/visual-qa/assets/TASK-FE-034/policy/before-1440-ko-terms.png
  - docs/visual-qa/assets/TASK-FE-034/policy/before-390-en-privacy.png
  - docs/visual-qa/assets/TASK-FE-034/policy/before-390-en-terms.png
  - docs/visual-qa/assets/TASK-FE-034/policy/before-390-ko-privacy.png
  - docs/visual-qa/assets/TASK-FE-034/policy/before-390-ko-terms.png
  - docs/visual-qa/assets/TASK-FE-034/policy/before.json
  - docs/visual-qa/assets/TASK-FE-034/policy/verify.cjs

## 2026-09-29 — 로그인 후 운영 사실 및 문의 방침 반영
- Status: IMPLEMENTED (이번 보완 범위)
- Human Decision Required: YES — 정책 최종 검토·재배포 결정. 로그인과 문의30일 방침은 확인 완료이므로 재요청하지 않음.
- 대화 내 브라우저에서 Vercel Hobby, Web Analytics 비활성, Drains 미등록, Speed Insights 설치안내/이벤트 없음, 실제 요청 로그 확인. 설정 변경 없음. Chrome은 향후 Jhshin.dev 프로필만 사용.
- 한영 개인정보 페이지: 문의 해결 후30일 이내 수동 삭제·Gmail 휴지통 영구삭제·다운로드 사본 삭제 반영. Hobby 런타임 로그1시간과 플랫폼 전체 파기의 차이 설명.
- 남은 문제: 외부 서비스 국외 처리 상세 고지·적용 조건 최종 검토. 최신 정책은 로컬 수정본, 재배포·Riot 제출 미실행.
- 실행 검증: `npx tsc --noEmit`, `npm run lint`, `npm run build` PASS; `node src/features/account-connection/consentDemo.test.cjs` 5/5 PASS (frontend에서 실행).
- `PLAYWRIGHT_MODULE=…/node_modules/playwright node docs/visual-qa/assets/TASK-FE-034/policy/verify.cjs before` 및 `after`: 각각8화면, 한영·1440/390·privacy/terms PASS; 페이지오류0, 가로넘침0, 요청 origin은 localhost만 확인.
- `git diff --check` PASS. 로컬 서버3100 최신 빌드로 재시작. 최초 일반 권한 종료는 거부되어 권한을 갖춰 해당 미리보기 PID만 종료 후 성공.

### 현재 로컬 변경 파일 전체 (이전 배포 결과 문서 포함)
- `.agent-reports/CURRENT.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/riot-submission/DECISIONS.md`
- `docs/riot-submission/DEPLOYMENT.md`
- `docs/riot-submission/POLICY-OPERATIONS.md`
- `docs/riot-submission/README.md`
- `docs/tasks/TASK-FE-034.md`
- `docs/visual-qa/TASK-FE-034.md`
- `docs/visual-qa/assets/TASK-FE-034/policy/after-1440-en-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/after-1440-en-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/after-1440-ko-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/after-1440-ko-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/after-390-en-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/after-390-en-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/after-390-ko-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/after-390-ko-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/after.json`
- `docs/visual-qa/assets/TASK-FE-034/policy/before-1440-en-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/before-1440-en-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/before-1440-ko-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/before-1440-ko-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/before-390-en-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/before-390-en-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/before-390-ko-privacy.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/before-390-ko-terms.png`
- `docs/visual-qa/assets/TASK-FE-034/policy/before.json`
- `docs/visual-qa/assets/TASK-FE-034/policy/verify.cjs`
- `frontend/src/app/privacy/page.tsx`
- `frontend/src/features/stats-shell/copy.ts`

## 국외 처리 안내 공개 보완 — 2026-09-29
- 사용자 “시작해보자”: 검토·구현·검증 후 기존 dev→main 배포 승인.
- 변경: privacy/page.tsx의 한영 외부 처리 항목과 제공자 링크, copy.ts의 검토 범위. Google의 서버/백업 삭제와 운영자30일 기한 구분. Vercel Hobby DPA 적용 주장 없음.
- 검증: 타입/lint/build/동의5테스트 PASS. 정책 Before8 캡처 완료. After 및 전체 흐름 검증 결과는 아래 최종 결과에 기록.
- 범위 한계: 국외 이전 법적 요건을 완결 인증할 수 없어 초안 유지. 외부 계약 체결·유료 변경·Riot 제출 없음.

### 최종 검증 결과
- tsc/lint/build PASS; 동의테스트5/5 PASS; policy before/after 각8화면 PASS; 전체 흐름44검사/60화면 PASS.
- 콘솔/실행오류0,API요청0, 이동 취소 RSC prefetch46건 별도 기록. diff check PASS.
- 정책 안내 보완은 IMPLEMENTED. 법적 요건 검토는 별개로 남아 초안 유지. 공개 배포 결과는 배포 완료 후 기록.
