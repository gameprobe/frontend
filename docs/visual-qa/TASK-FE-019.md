# TASK-FE-019 — 경기 상세 모달 공통 스타일 Visual QA

Status: PASS — 2026-09-20 구현자 검증 및 독립 보조 에이전트 검토 완료. 별도 Cursor 리뷰는 미실행.

## 기준과 결과

기준은 PR #11 병합 `d48aac4`의 실제 화면이다. 이번 작업은 모달 내부 CSS만 정리하므로 화면·동작 유지가 목표다.
Before를 촬영한 후 CSS를 수정하고 같은 브라우저 조건으로 After를 촬영했다.

- PC 1728×941, 모바일 390×844의 **30쌍/60장 전체 픽셀 차이 0**.
- 다섯 탭·정렬·포커스·다른 선수의 미제공 안내·경제 선택·라운드 선택·Deathmatch와 홈/닫힌 프로필을 확인했다.
- 화면 폭 320·650·700·768·1000·1100·1150·1440의 40개 탭 조합을 포함한 **76개 상태**에서 DOM 표시·계산 스타일·좌표·스크롤 크기가 동일하다.
- 기존 상세 동작 **42그룹**, 추가 반응형 **20조건** 통과. 정렬·선수 선택·닫기/Escape/배경·키보드·포커스 복귀·배경 잠금·내부 스크롤·필터·Load more·다른 프로필·Deathmatch를 포함한다.
- 위 동작 검사의 홈/닫힌 프로필 4조건 비교도 동일, 브라우저 pageerror 0.
- 직접 도달하지 않는 Performance/Duels 컴포넌트 전체 미제공 안내는 임시 브라우저 요소 2개로 원본 CSS와 공유 CSS의 계산 스타일이 동일함을 확인했다. 임시 요소의 너비/높이는 모두 0이므로 실제 표시 크기 검증으로 취급하지 않는다. 제품 데이터·소스는 바꾸지 않았다.
- 원본 Mock·상세 Mock·누락 SSR·타입·Lint·production build 통과. Lint 경고/오류 0, 정적 페이지 11개.
- 개발 서버 복원 후 HTTP200, 모달 폭1400·다섯 탭·최소 글자12px·닫기44px·Escape/배경 잠금 해제 통과.

[검증 항목·비교 해시·소스 SHA-256](assets/TASK-FE-019/verification.json)

## 시각 대조

구현자는 PC Scoreboard와 모바일 Performance 미제공 화면을 확인했다. 독립 보조 에이전트는 PC Duels와 모바일 Rounds의 Before/After 네 장을 직접 대조했다.
헤더·탭·표·요약 카드의 색상/정렬/여백이 유지되며 새로운 겹침이나 의도하지 않은 잘림은 없다.
모바일 탭·라운드·표는 기존처럼 해당 영역 안에서 스크롤하며, 긴 본문만 모달 내부에서 세로 스크롤한다.
이번 비교는 디자인 개선 평가가 아니라 기존 화면의 보존 검증이다. 미제공 데이터·자산·기존 글꼴 차이는 유지한다.

## Before / After 전체

| 상태 | Before | After | 차이 픽셀 |
| --- | --- | --- | --- |
| desktop-deathmatch-duels | [Before](assets/TASK-FE-019/before-desktop-deathmatch-duels.png) | [After](assets/TASK-FE-019/after-desktop-deathmatch-duels.png) | 0 |
| desktop-deathmatch-performance | [Before](assets/TASK-FE-019/before-desktop-deathmatch-performance.png) | [After](assets/TASK-FE-019/after-desktop-deathmatch-performance.png) | 0 |
| desktop-duels-focus | [Before](assets/TASK-FE-019/before-desktop-duels-focus.png) | [After](assets/TASK-FE-019/after-desktop-duels-focus.png) | 0 |
| desktop-duels | [Before](assets/TASK-FE-019/before-desktop-duels.png) | [After](assets/TASK-FE-019/after-desktop-duels.png) | 0 |
| desktop-economy-bank | [Before](assets/TASK-FE-019/before-desktop-economy-bank.png) | [After](assets/TASK-FE-019/after-desktop-economy-bank.png) | 0 |
| desktop-economy | [Before](assets/TASK-FE-019/before-desktop-economy.png) | [After](assets/TASK-FE-019/after-desktop-economy.png) | 0 |
| desktop-home | [Before](assets/TASK-FE-019/before-desktop-home.png) | [After](assets/TASK-FE-019/after-desktop-home.png) | 0 |
| desktop-performance-missing | [Before](assets/TASK-FE-019/before-desktop-performance-missing.png) | [After](assets/TASK-FE-019/after-desktop-performance-missing.png) | 0 |
| desktop-performance | [Before](assets/TASK-FE-019/before-desktop-performance.png) | [After](assets/TASK-FE-019/after-desktop-performance.png) | 0 |
| desktop-profile | [Before](assets/TASK-FE-019/before-desktop-profile.png) | [After](assets/TASK-FE-019/after-desktop-profile.png) | 0 |
| desktop-rounds-selected | [Before](assets/TASK-FE-019/before-desktop-rounds-selected.png) | [After](assets/TASK-FE-019/after-desktop-rounds-selected.png) | 0 |
| desktop-rounds | [Before](assets/TASK-FE-019/before-desktop-rounds.png) | [After](assets/TASK-FE-019/after-desktop-rounds.png) | 0 |
| desktop-scoreboard-focus | [Before](assets/TASK-FE-019/before-desktop-scoreboard-focus.png) | [After](assets/TASK-FE-019/after-desktop-scoreboard-focus.png) | 0 |
| desktop-scoreboard-sorted | [Before](assets/TASK-FE-019/before-desktop-scoreboard-sorted.png) | [After](assets/TASK-FE-019/after-desktop-scoreboard-sorted.png) | 0 |
| desktop-scoreboard | [Before](assets/TASK-FE-019/before-desktop-scoreboard.png) | [After](assets/TASK-FE-019/after-desktop-scoreboard.png) | 0 |
| mobile-deathmatch-duels | [Before](assets/TASK-FE-019/before-mobile-deathmatch-duels.png) | [After](assets/TASK-FE-019/after-mobile-deathmatch-duels.png) | 0 |
| mobile-deathmatch-performance | [Before](assets/TASK-FE-019/before-mobile-deathmatch-performance.png) | [After](assets/TASK-FE-019/after-mobile-deathmatch-performance.png) | 0 |
| mobile-duels-focus | [Before](assets/TASK-FE-019/before-mobile-duels-focus.png) | [After](assets/TASK-FE-019/after-mobile-duels-focus.png) | 0 |
| mobile-duels | [Before](assets/TASK-FE-019/before-mobile-duels.png) | [After](assets/TASK-FE-019/after-mobile-duels.png) | 0 |
| mobile-economy-bank | [Before](assets/TASK-FE-019/before-mobile-economy-bank.png) | [After](assets/TASK-FE-019/after-mobile-economy-bank.png) | 0 |
| mobile-economy | [Before](assets/TASK-FE-019/before-mobile-economy.png) | [After](assets/TASK-FE-019/after-mobile-economy.png) | 0 |
| mobile-home | [Before](assets/TASK-FE-019/before-mobile-home.png) | [After](assets/TASK-FE-019/after-mobile-home.png) | 0 |
| mobile-performance-missing | [Before](assets/TASK-FE-019/before-mobile-performance-missing.png) | [After](assets/TASK-FE-019/after-mobile-performance-missing.png) | 0 |
| mobile-performance | [Before](assets/TASK-FE-019/before-mobile-performance.png) | [After](assets/TASK-FE-019/after-mobile-performance.png) | 0 |
| mobile-profile | [Before](assets/TASK-FE-019/before-mobile-profile.png) | [After](assets/TASK-FE-019/after-mobile-profile.png) | 0 |
| mobile-rounds-selected | [Before](assets/TASK-FE-019/before-mobile-rounds-selected.png) | [After](assets/TASK-FE-019/after-mobile-rounds-selected.png) | 0 |
| mobile-rounds | [Before](assets/TASK-FE-019/before-mobile-rounds.png) | [After](assets/TASK-FE-019/after-mobile-rounds.png) | 0 |
| mobile-scoreboard-focus | [Before](assets/TASK-FE-019/before-mobile-scoreboard-focus.png) | [After](assets/TASK-FE-019/after-mobile-scoreboard-focus.png) | 0 |
| mobile-scoreboard-sorted | [Before](assets/TASK-FE-019/before-mobile-scoreboard-sorted.png) | [After](assets/TASK-FE-019/after-mobile-scoreboard-sorted.png) | 0 |
| mobile-scoreboard | [Before](assets/TASK-FE-019/before-mobile-scoreboard.png) | [After](assets/TASK-FE-019/after-mobile-scoreboard.png) | 0 |

## 실제 실행 명령

Node: `/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`

```sh
node /tmp/fe019-visual.cjs before
node /tmp/fe019-visual.cjs after
node /tmp/fe018-tracker-after.cjs preview
node /tmp/fe019-empty-fixture.cjs
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /tmp/fe019-pixels.py
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs && node src/features/tracker-profile/match-history/detail/missingData.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
node /tmp/fe019-smoke.cjs
git diff --check
```

모든 명령 종료 코드 0. 컨테이너의 기존 `git: not found` 메타데이터 경고는 있었으며 빌드 실패는 아니다.
임시 비교 스크립트와 상세 DOM 스냅샷은 `/tmp/fe019-*`에, 캡처와 검증 요약은 본 디렉터리에 보존한다.
