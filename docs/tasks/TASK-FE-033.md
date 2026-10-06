# TASK-FE-033 — 공통 고지·약관·개인정보 안내 정리

## Status
IMPLEMENTED — 검증·사용자 확인 완료, PR 제출 진행

## Goal
신청 준비용 데모의 안내를 현재 동작과 맞추고 문의 이메일을 교체하기 쉬운 공통 설정으로 관리한다.

## Baseline / authorization
- 사용자: “이메일은 당장은 예시 이메일로 하자. example@example.com 이런식으로” 및 범위 선택 “안내 전체 정리 + 예시 이메일”.
- PR #27 병합 `87119c0`을 codex/frontend-rework에 pull 후 codex/service-notices에서 작업한다.
- 실제 운영 정보, 보관 기간, 법률 적합성, 승인 여부는 임의로 확정하지 않는다. 2026-09-27 사용자 확인 후 커밋·푸시 및 codex/frontend-rework 대상 PR 제출을 승인받았다. 병합은 사용자가 수행한다.

## Scope
- 공통 푸터에 Riot 비보증·권리 고지와 기존 예시 전적/Tracker Network 비제휴 안내를 정리한다.
- 한국어/영어 정책 링크 및 문의처를 일관되게 표시한다. example@example.com은 예시·문의 미접수임을 명시하고 mailto 링크를 만들지 않는다. 전화번호는 추가하지 않는다.
- 개인정보 안내는 전적 목업, 계정 동의 시연, 언어 선택 및 프로필 저장의 브라우저 저장 동작을 구분한다.
- 실제 RSO 연결·공개 철회·데이터 삭제와 현재 시연을 구분한다. 호스팅 로그·외부 서비스 운영 설정은 미확인 상태로 명시하고 확정된 수집 없음/보관 기간을 주장하지 않는다.
- 약관에 전적 데모와 라인업/스모크 탐색의 서비스 범위를 반영한다. 확정되지 않은 운영 주체·분쟁/보관 정책은 초안 상태를 유지한다.
- 문서에 제출 전 실제 문의 주소, 운영 정보, 배포 동작 확인이 남음을 기록한다. 별도 신청 가이드 제작·배포는 포함하지 않는다.

## Allowed changes
- frontend/src/app/privacy/page.tsx
- frontend/src/app/terms/page.tsx
- frontend/src/features/stats-shell/StatsFooter.tsx
- frontend/src/features/stats-shell/StatsShell.module.css (푸터 관련 선택자만)
- frontend/src/features/stats-shell/copy.ts (고지·초안 문구만)
- frontend/src/features/stats-shell/service-notices.ts
- docs/tasks/TASK-FE-033.md
- docs/visual-qa/TASK-FE-033.md, docs/visual-qa/assets/TASK-FE-033/**
- docs/frontend/PLAN.md, docs/PROGRESS.md
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md의 공통 상태/Codex Implementation
- /private/tmp/fe033-*

## Out of scope
실제 인증/동의 정책·API·DB·데이터/저장 로직·연락처 발급·관리자·이미지·패키지·배포·팀원 설정 변경. 최종 법률 검토·운영 정책 결정과 신청 제출은 수행하지 않는다.

## Acceptance criteria
- 문의 주소는 한 공통 설정에서 관리하고 모든 사용처에서 예시임을 표시한다. 실제 발송/접수 동작이 없다.
- 개인정보 문구가 코드에서 확인한 저장/초기화 범위와 일치한다. 동의 철회를 서버 삭제로 표현하지 않는다.
- Riot 공식 고지의 영문 문구와 한국어 대응 설명, 정책 링크가 공통 푸터에 표시된다.
- 데스크톱/모바일·한영에서 푸터/정책 본문이 겹치거나 잘리지 않고 링크 이동이 정상이다.
- 기존 전적/데모/메뉴·동의 체험 동작은 유지하며 실제 API 요청이나 동의 저장을 추가하지 않는다.
- Before/After Playwright 스크린샷·시각 보고서 및 아래 검증 완료.

## References
- https://developer.riotgames.com/policies/general — 표시하도록 제공된 법적 고지
- https://developer.riotgames.com/docs/valorant — opt-in/RSO 및 신청용 사용자 흐름
- https://support-developer.riotgames.com/hc/en-us/articles/22801383038867-Production-Key-Applications — 사이트/약관/개인정보 안내와 목업 시연
- 현재 화면의 Before 캡처를 디자인 유지 기준으로 사용한다.

## Verification commands
```bash
node docs/visual-qa/assets/TASK-FE-033/verify.cjs before
node docs/visual-qa/assets/TASK-FE-033/verify.cjs after
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

## Result
### 변경 파일
- Allowed changes의 제품 소스 6개. 실제 저장·계정 연결·데이터·메뉴 로직은 변경하지 않았다.
- docs/tasks/TASK-FE-033.md, docs/visual-qa/TASK-FE-033.md, docs/frontend/PLAN.md, docs/PROGRESS.md.
- docs/visual-qa/assets/TASK-FE-033/: PNG 44장, before/after/post-build.json, verify.cjs.
- .agent-reports/HANDOFF.json 및 CURRENT.md (ignored).

### 실행 명령 및 실제 결과
- git fetch origin → git switch codex/frontend-rework → git pull --ff-only origin codex/frontend-rework → git switch -c codex/service-notices: PASS, 기준 87119c0.
- Verification commands 전체 PASS. Playwright Before 22장/After 22장, 정책 12조건·공통 푸터 6조건 및 동의/철회 체험 2조건.
- TypeScript 오류 0, ESLint 경고/오류 0, production build 정적 12페이지 생성, git diff --check PASS.
- 홈·프로필 상단 4쌍은 가장자리 antialiasing을 제외한 시각 비교에서 변경 픽셀 0. 정책 링크·문의 앵커·예시 비링크·가로 넘침/브라우저 오류 0 확인.
- 개발 서버 복원 후 임시 Node/Playwright 검사: 1440/390px HTTP 200, 키보드 Enter 문의 이동, 예시 이메일 비링크 PASS (post-build.json).
- 독립 코드 사실성/범위 및 시각 리뷰 PASS. 별도 Cursor 리뷰는 수행하지 않았다.
- 초기 검증은 Chromium 권한, 지연 이미지 대기, PNG antialiasing 차이를 발견했다. 실행 권한·검증 대기/비교를 보완했으며 상세 근거는 Visual QA에 기록했다.

### 제한과 남은 준비
- example@example.com은 실제 문의 창구가 아니다. 제출용 공개 페이지에서는 실제 수신 가능한 주소와 운영 주체를 확정해 교체하는 것을 권장한다.
- 배포 환경의 호스팅/분석/외부 서비스 로그·보관 설정은 동료 확인이 필요하다. 확정 전 법적 적합성·무수집·임의 보관 기간을 주장하지 않았다.
- 운영용 RSO/동의 기록/접근 제한/실제 삭제는 후속 구현이다. 이번 변경은 기존 시연 동작을 정확히 설명한다.
- 배포된 데모 경로와 제출 설명의 최종 점검은 남아 있다. API 발급·심사 통과를 보장하지 않는다.
- 새 데이터 데모의 단독 경기 상세(`/matches/demo-match-001`)에는 공통 푸터가 연결되어 있지 않다. 사용자 확인에 따라 이번 범위는 현재 공통 푸터 사용처의 안내 정리로 마무리하고, 상세 화면 푸터 연결은 후속 검토로 남긴다.
- 사용자 요청으로 커밋·푸시 및 codex/frontend-rework 대상 PR을 제출한다. 병합·배포는 수행하지 않는다.
