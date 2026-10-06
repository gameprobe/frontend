# TASK-FE-032 — 계정 연결·공개 동의 데모

## Status
IMPLEMENTED — 검증·사용자 화면 확인 완료, PR 제출 승인

## Goal
Riot API 신청 전에 /connect에서 계정 연결의 앞뒤 사용자 흐름을 실제 조작 가능한 합성 데이터 시연으로 보여준다.

## Baseline / authorization
- 사용자: “그래 그럼 그걸 진행하도록 하자. codex/frontend-rework에서 브랜치 복사한다음에 하면 되것지?”
- 최신 원격 통합 브랜치 pull 결과 adfbc3e, 시작 tracked tree clean. 작업 브랜치 codex/account-consent-demo.
- 실제 RSO 인증·운영 권한 정책은 이번에 구현하지 않는다. 사용자가 승인한 첫 번째 데모 작업만 진행한다. 2026-09-26 사용자가 화면 확인 후 커밋·푸시·PR 제출을 승인했다. 병합은 사용자가 진행한다.

## Scope
- /connect의 비활성 안내를 설명 → 공개 범위/동의 선택 → 합성 프로필 요약 → 철회 후 비공개 상태 시연으로 바꾼다.
- 공개 범위는 Riot ID·선택한 합성 계정의 경기/요원/맵 통계라고 설명하고, 미동의 다른 참가자의 정보까지 공개하는 것으로 표현하지 않는다.
- 동의 checkbox는 기본 미선택. 동의/취소/철회/처음부터 다시 보기 제공. 철회·취소 후 새 동의 없이 요약 노출 금지.
- 합성 계정 DemoPlayer01과 기존 Mock 공급자의 동일 집계(4경기, 3승1패, K/D/A65/56/23)를 재사용한다. 이름을 입력받거나 Riot 자격증명을 수집하지 않는다.
- 신청 시연 상태는 현재 컴포넌트 메모리에만 보관한다. 새로고침/페이지 이탈 시 초기화. 실제 로그인 성공, 실제 공개/삭제 처리로 표현하지 않는다.
- 기존 홈/기본 Overview/두 데모/경기 공유·직접 URL은 유지한다. 별도 경로의 기존 합성 통계에 인증 제한을 추가하지 않는다.
- 한국어/영어, 모바일, 키보드 조작/단계 변경 초점 안내를 지원한다. 어디에 쓰이는지 주석을 추가한다.

## Allowed changes
- frontend/src/components/RiotConnectNotice.tsx
- frontend/src/features/account-connection/AccountConsentDemo.tsx
- frontend/src/features/account-connection/AccountConsentDemo.module.css
- frontend/src/features/account-connection/ConsentProfilePreview.tsx
- frontend/src/features/account-connection/consentDemo.ts
- frontend/src/features/account-connection/consentDemo.test.cjs
- docs/tasks/TASK-FE-032.md
- docs/visual-qa/TASK-FE-032.md, docs/visual-qa/assets/TASK-FE-032/**
- docs/frontend/PLAN.md, docs/frontend/API-MOCK-DESIGN.md, docs/PROGRESS.md
- .agent-reports/HANDOFF.json 및 CURRENT.md의 공통 상태/Codex Implementation
- /private/tmp/fe032-*

## Out of scope
실제 RSO·인증/인가·토큰/세션 저장·서버 API·DB·관리자·배포·이미지 수급·통계 산식·다른 프로필/경기 화면, 약관/개인정보/공통 고지의 최종화 및 별도 신청 안내문(후속 Task).

## Acceptance criteria
- 실인증 없는 합성 시연임을 모든 단계에서 인지할 수 있고, 연결이 데이터를 공개한다는 의미를 동의 전에 설명한다.
- 동의 체크 전 프로필 요약 없음. 취소/철회 후 즉시 숨김, 다시 볼 때 새 동의 필요. 리로드/재진입 초기화.
- 초기/동의/취소/프로필/철회 상태가 실제 버튼으로 도달 가능하며 언어 변경은 시연 상태를 보존한다.
- 비동기 표본 조회의 오류/재시도·취소 시 늦은 결과 노출 방지. 실제 API/auth 요청 없음.
- 기존 Mock 집계와 같은 값, 개인 정보·미동의 참가자·랭크/MMR 추정 없음.
- 기존 데모 진입/메뉴 목적지와 회귀 화면 보존. 1440/820/390/320px 문서 넘침/겹침 없음.
- Before/After Playwright 캡처, 시각 검토 보고서, 아래 명령 통과.

## Verification commands
```bash
node docs/visual-qa/assets/TASK-FE-032/verify.cjs before
node docs/visual-qa/assets/TASK-FE-032/verify.cjs after
docker compose -f docker/compose.frontend.yml exec -T frontend node src/features/account-connection/consentDemo.test.cjs
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

## Result
### 변경 파일
- frontend/src/components/RiotConnectNotice.tsx
- frontend/src/features/account-connection/AccountConsentDemo.tsx
- frontend/src/features/account-connection/AccountConsentDemo.module.css
- frontend/src/features/account-connection/ConsentProfilePreview.tsx
- frontend/src/features/account-connection/consentDemo.ts
- frontend/src/features/account-connection/consentDemo.test.cjs
- docs/tasks/TASK-FE-032.md
- docs/frontend/PLAN.md
- docs/frontend/API-MOCK-DESIGN.md
- docs/PROGRESS.md
- docs/visual-qa/TASK-FE-032.md
- docs/visual-qa/assets/TASK-FE-032/: verify.cjs, before/after/post-build.json, PNG42장. 전체 파일은 아래 QA 보고서와 로컬 Agent Report에 기록.
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md (ignored).

### 실행 명령·검증 결과
- git fetch origin, git switch codex/frontend-rework, git pull --ff-only origin codex/frontend-rework, git switch -c codex/account-consent-demo: PASS, 기준 adfbc3e.
- Verification commands 전체 PASS: 상태 전환 node:test 5/5, TypeScript 오류0, ESLint 경고/오류0, production build 정적12페이지 생성.
- Playwright Before9장/After33장. 1440/820/390/320px와 한국어/영어 6조건에서 동의 체크/해제/취소/철회/재동의/처음부터/리로드/이탈·복귀/언어 보존 PASS.
- 키보드 Enter·Space 및 단계 제목 초점(고정 메뉴 아래), 개인정보 새 탭 이동·선택 유지 PASS.
- Mock 집계4경기·3승1패·65/56/23 및 개인 참가자만 출력 확인. API 요청/브라우저 오류0, 저장소/쿠키 동의 기록 없음.
- 기존 홈·디자인 프로필·새 데이터 프로필 Before/After PNG 3쌍 byte 동일. 모든 캡처 문서 넘침0/main1개.
- 독립 에이전트 코드·시각 검토 PASS(필수 수정 없음). 별도 Cursor 리뷰 아님.
- 빌드 후 up -d로 프론트 개발 서버 복원. 로컬 Playwright 1440/390px HTTP200·동의/철회·집계 재확인 PASS(post-build.json).
- git diff --check PASS. 2026-09-26 사용자 화면 확인 및 PR 제출 승인. 제출 대상은 codex/frontend-rework다.

### 수정 중 발견 및 보완
- SupportPage의 목록 항목 여백 상속으로 단계 정렬이 어긋나 시연 CSS에서만 margin을 초기화했다. disabled 버튼도 기존 공통 규칙의 여백을 명시적으로 덮어썼다.
- 첫 QA는 기존 Connect account 접근성 이름을 한국어로 잘못 가정했고, 다음 시도는 홈 이동 완료 전에 계정 메뉴를 눌렀다. 실제 메뉴 이름·경로 도착 대기로 검증 절차를 수정한 후 전체 통과.
- 고정 메뉴가 스크롤된 fullPage 캡처 중간에 나타나는 촬영 문제를 상단 이동 후 캡처로 보완했다. 사용자 조작 시 단계 제목 가림은 별도로 검사해 통과했다.
- 컨테이너 기존 git 미설치 메시지는 빌드/린트 통과에 영향 없음.

### 제한 / 남은 작업
- 실제 RSO·로그인·서버 권한/동의 저장·실제 데이터 공개/삭제 기능이 아니다. 현재 /connect의 합성 시연만 작동한다.
- 합성 프로필 요약은 이 페이지 안에서만 표시한다. 기존 공개 두 데모·경기 공유/직접 URL에는 접근 제한을 추가하지 않았다.
- API 장애/인증 만료를 실제로 재현하지 않았다. 오류/재시도와 늦은 결과 무시는 방어 코드 검토로 확인했다.
- 320px 공통 메뉴의 일부 항목 가로 스크롤은 기존 동작이며 이번 소스와 무관하다.
- 고지/약관/개인정보 최종화와 별도 신청 안내, 실제 승인 후 RSO/서버 권한 연동은 다음 Task다. 운영 정보를 임의 확정하지 않았다.
