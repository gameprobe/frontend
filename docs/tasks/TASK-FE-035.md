# TASK-FE-035 — 경기 후 스타일 비교·습관 분석 시연

## Status
IMPLEMENTED

## Goal
사용자가 요청한 상위권 플레이 스타일 비교, 교전 위치·타이밍·습관 분석 목표를 Riot 신청 문안과 별도 페이지에 반영한다.

## Allowed changes
- frontend/src/app/insights/page.tsx
- frontend/src/app/insights/Insights.module.css
- frontend/src/features/stats-shell/navigation.ts
- frontend/src/features/stats-shell/StatsHeader.tsx — 모바일 More의 Insights 진입
- frontend/src/features/stats-shell/SupportPage.tsx — Insights 현재 메뉴 표시
- docs/riot-submission/APPLICATION.md
- docs/tasks/TASK-FE-035.md
- docs/visual-qa/TASK-FE-035.md, docs/visual-qa/assets/TASK-FE-035/**
- docs/PLAN.md, docs/PROGRESS.md
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md

## Scope
- 기본안: 한영 합성 분석 리포트, 위치/타이밍/습관 선택, 설명 가능한 관측·비교·연습 제안.
- 실제 모델·학습 완료·상위권 데이터 확보·정확도·Riot 승인 주장 금지. 가상 비교 집단 명시.
- 실제 경기 API/학습/외부 AI/개인정보 동의/DB/패키지 변경 없음.
- 실제 모델 학습은 데이터 출처·권리·동의·Riot 허용 범위·보관/삭제 설계 확정 후 별도 Task.
- 상위권과의 차이를 나쁜 판단의 확정 근거나 숨은 MMR/랭크 예측으로 사용하지 않음.
- 이 신규 작업의 커밋·배포는 아직 요청되지 않음.

## Evidence
- Riot 공식 VAL-MATCH-V1 GetMatch: KillDto timeSinceRoundStartMillis, victimLocation, playerLocations; PlayerLocationsDto location/viewRadians; EconomyDto loadoutValue. 이는 이벤트 시점 관측으로 연속 리플레이를 의미하지 않음.
- https://developer.riotgames.com/apis#val-match-v1/GET_getMatch
- https://developer.riotgames.com/docs/valorant : 경기 후 학습 use case와 opt-in, 실시간 지시/경기 전 상대 분석/숨은MMR 금지 구분.

## Verification commands
- cd frontend && npx tsc --noEmit
- cd frontend && npm run lint
- cd frontend && npm run build
- Playwright Before/After 1440/390, ko/en, 새 페이지/탭/공통 탐색 링크/가로넘침/오류 확인
- git diff --check

## Result
- Status: IMPLEMENTED
- Human Decision Required: YES — UI 검토 및 이 신규 기능의 공개 배포 여부. 실제 학습을 위한 데이터 출처·허용 범위·동의/삭제 설계는 별도 후속 작업.
- 사용자가 예시 분석 리포트 선택. /insights에 한영 스타일·위치/타이밍/습관 탭, 가상 비교 수치, 관측/해석 한계/연습 목표, 실제 학습 전제조건 구현.
- 모든 수치는 별도 가상 예시. 실제 최상위권 데이터/학습 모델/정확도 주장 없음. 기존 DemoPlayer01과 혼동되지 않게 고지.
- 공통 Insights 메뉴 및 모바일 More 링크 추가. 현재 메뉴 표시/키보드 방향키·Home·End/aria 관계 구현.
- 영문 신청서에 목표·비교 조건·데이터 확보/이용허용·학습 미실행·증거 한계와 미배포 경로 구분 추가.
- 검증: cd frontend && npx tsc --noEmit; npm run lint; npm run build 모두 PASS(14정적 경로). PLAYWRIGHT_MODULE 지정 verify.cjs before/after PASS: Before4/After16, 1440/390·ko/en, 분석3탭/키보드/모바일More 진입/가로넘침0/console·page오류0. git diff --check PASS.
- 직접 시각검토: 모바일한국어/PC영어의 글자·차트·긴문구 줄바꿈 확인. 초기 섹션간격 및 모바일 접근성 개선 후 재촬영.
- 신규 페이지이므로 Before는 기존 프로필 진입점4장, After는 프로필4장+새페이지3탭12장. 기존 화면의 메뉴 추가와 신규 화면 모두 검증.
- 커밋/배포 없음. 공개 /insights를 심사 URL로 제출하지 않음. 로컬 http://127.0.0.1:3100/insights 검토 가능.
- 이전 FE034 배포 후 문서 변경과 사용자 current-screen.png는 보존.

### 실제 변경 파일 전체
- `frontend/src/app/insights/page.tsx`
- `frontend/src/app/insights/Insights.module.css`
- `frontend/src/features/stats-shell/StatsHeader.tsx`
- `frontend/src/features/stats-shell/SupportPage.tsx`
- `frontend/src/features/stats-shell/navigation.ts`
- `docs/riot-submission/APPLICATION.md`
- `docs/tasks/TASK-FE-035.md`
- `docs/visual-qa/TASK-FE-035.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `.agent-reports/HANDOFF.json`
- `.agent-reports/CURRENT.md`
- `docs/visual-qa/assets/TASK-FE-035/after-1440-en-habits.png`
- `docs/visual-qa/assets/TASK-FE-035/after-1440-en-position.png`
- `docs/visual-qa/assets/TASK-FE-035/after-1440-en-profile.png`
- `docs/visual-qa/assets/TASK-FE-035/after-1440-en-timing.png`
- `docs/visual-qa/assets/TASK-FE-035/after-1440-ko-habits.png`
- `docs/visual-qa/assets/TASK-FE-035/after-1440-ko-position.png`
- `docs/visual-qa/assets/TASK-FE-035/after-1440-ko-profile.png`
- `docs/visual-qa/assets/TASK-FE-035/after-1440-ko-timing.png`
- `docs/visual-qa/assets/TASK-FE-035/after-390-en-habits.png`
- `docs/visual-qa/assets/TASK-FE-035/after-390-en-position.png`
- `docs/visual-qa/assets/TASK-FE-035/after-390-en-profile.png`
- `docs/visual-qa/assets/TASK-FE-035/after-390-en-timing.png`
- `docs/visual-qa/assets/TASK-FE-035/after-390-ko-habits.png`
- `docs/visual-qa/assets/TASK-FE-035/after-390-ko-position.png`
- `docs/visual-qa/assets/TASK-FE-035/after-390-ko-profile.png`
- `docs/visual-qa/assets/TASK-FE-035/after-390-ko-timing.png`
- `docs/visual-qa/assets/TASK-FE-035/after.json`
- `docs/visual-qa/assets/TASK-FE-035/before-1440-en-profile.png`
- `docs/visual-qa/assets/TASK-FE-035/before-1440-ko-profile.png`
- `docs/visual-qa/assets/TASK-FE-035/before-390-en-profile.png`
- `docs/visual-qa/assets/TASK-FE-035/before-390-ko-profile.png`
- `docs/visual-qa/assets/TASK-FE-035/before.json`
- `docs/visual-qa/assets/TASK-FE-035/verify.cjs`

## 공개 진행 승인 — 2026-09-29
사용자 “이정도면 될듯 일단은 신청하고 조금씩 다듬는걸로”에 따라 검토한 데모의 커밋·업로드·dev→main 공개 반영 진행. 실제 데이터 학습/조회는 미구현으로 명시. 로컬 구현 검증 통과 후 제품 코드는 변경되지 않았다. 포털 로그인은 요청했으며 약관 수락은 최종 단계에서 사용자 확인 필요.
