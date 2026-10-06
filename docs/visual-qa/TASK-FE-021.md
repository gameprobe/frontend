# TASK-FE-021 — 프로필 상태·동작 분리 시각 검증

## 판정

PASS — 외형/표시값/동작 유지. 구현·검증 완료, 사용자 검토 대기.
기준 `45bbd06`(PR #13 병합), 브랜치 `codex/profile-view-state`.
참고 디자인은 이번 변경 직전의 현재 화면이다. 새로운 디자인 변경을 요청받지 않았다.

## 변경 경계

제품 소스는 부모 `TrackerProfile.tsx`와 `hooks/useProfileViewState.ts`,
`hooks/useProfileBrowserActions.ts` 세 파일이다.
1차는 탭·시즌/경기 조건·선택 경기·표시량·인라인 상세 탭·Show More와 초기화,
2차는 저장·공유·검색 안내·Mock 갱신·알림·메뉴/배너 상태를 옮겼다.
표시 JSX 구조·CSS·Mock·이미지·통계·홈·라인업·모달 내부 상태는 변경하지 않았다.

## 1차 검증 환경과 실제 결과 (`32aefcd`)

- 기존 프론트 Docker 개발 서버 `http://localhost:3000` 및 Playwright Chromium.
- PC 1728×941, 모바일 390×844, deviceScaleFactor 1 / 100% 배율 / reduced motion.
- 이미지 decode·폰트 준비 후 촬영, 동일한 화면/조작 순서를 Before/After에 적용했다.
- DOM·계산 스타일·좌표·스크롤·ARIA **58상태 동일**, 브라우저 오류0.
- Before/After **30쌍 모두 픽셀 차이0**. PNG60장과 [검증 JSON](assets/TASK-FE-021/verification.json)을 보존한다.
- 6탭·Show More·20→23 목록·복합 필터·빈 결과/Reset·Act/모드·모달5탭·Escape/포커스 검증 PASS.
- 320/700/701/1000/1001/1250/1251/1440/1500/1920px의 Overview/Weapons 20조건에 문서 가로 넘침 없음.
- React/ReactDOM 18.3.1 실제 렌더와 `act`로 일반/StrictMode **30 검사그룹 PASS**, 오류·React 경고0.
  8필터 실제 변경/같은 값 선택, 탭/통계 선택, 행 토글/스트립/닫기, 인라인 상세 탭,
  전체/추가 표시량, 두 Reset 범위와 기본값 재설정, Show More/필터 펼침 수명을 검증했다.
- 기존 Mock·상세Mock·누락SSR, 타입·Lint(경고/오류0)·build(정적11페이지) PASS.
- 개발 서버 복원 후 HTTP200, 모달 폭1400/5탭/닫기44px/최소글자12px/Escape/배경잠금 해제 PASS.
- 독립 코드 감사에서 훅과 부모의 연결·초기화 의미 유지 확인. 별도 Cursor 검증은 실행하지 않았다.

## 시각 검토

PC Overview와 모달, 모바일 Overview와 모달·빈 Maps 화면을 직접 대조했다.
카드/표·제목·글자·행 간격·모달 배치에 새 겹침이나 여백 변화가 없으며 작은 화면의 기존 가로 표 스크롤을 유지한다.

| 화면 | Before | After | 변경 픽셀 |
|---|---|---|---|
| desktop-act | [Before](assets/TASK-FE-021/before-desktop-act.png) | [After](assets/TASK-FE-021/after-desktop-act.png) | 0 |
| desktop-agents | [Before](assets/TASK-FE-021/before-desktop-agents.png) | [After](assets/TASK-FE-021/after-desktop-agents.png) | 0 |
| desktop-deathmatch | [Before](assets/TASK-FE-021/before-desktop-deathmatch.png) | [After](assets/TASK-FE-021/after-desktop-deathmatch.png) | 0 |
| desktop-empty-maps | [Before](assets/TASK-FE-021/before-desktop-empty-maps.png) | [After](assets/TASK-FE-021/after-desktop-empty-maps.png) | 0 |
| desktop-empty-matches | [Before](assets/TASK-FE-021/before-desktop-empty-matches.png) | [After](assets/TASK-FE-021/after-desktop-empty-matches.png) | 0 |
| desktop-filters | [Before](assets/TASK-FE-021/before-desktop-filters.png) | [After](assets/TASK-FE-021/after-desktop-filters.png) | 0 |
| desktop-home | [Before](assets/TASK-FE-021/before-desktop-home.png) | [After](assets/TASK-FE-021/after-desktop-home.png) | 0 |
| desktop-maps | [Before](assets/TASK-FE-021/before-desktop-maps.png) | [After](assets/TASK-FE-021/after-desktop-maps.png) | 0 |
| desktop-matches | [Before](assets/TASK-FE-021/before-desktop-matches.png) | [After](assets/TASK-FE-021/after-desktop-matches.png) | 0 |
| desktop-modal-scoreboard | [Before](assets/TASK-FE-021/before-desktop-modal-scoreboard.png) | [After](assets/TASK-FE-021/after-desktop-modal-scoreboard.png) | 0 |
| desktop-overview | [Before](assets/TASK-FE-021/before-desktop-overview.png) | [After](assets/TASK-FE-021/after-desktop-overview.png) | 0 |
| desktop-performance | [Before](assets/TASK-FE-021/before-desktop-performance.png) | [After](assets/TASK-FE-021/after-desktop-performance.png) | 0 |
| desktop-show-more | [Before](assets/TASK-FE-021/before-desktop-show-more.png) | [After](assets/TASK-FE-021/after-desktop-show-more.png) | 0 |
| desktop-weapon-scroll | [Before](assets/TASK-FE-021/before-desktop-weapon-scroll.png) | [After](assets/TASK-FE-021/after-desktop-weapon-scroll.png) | 0 |
| desktop-weapons | [Before](assets/TASK-FE-021/before-desktop-weapons.png) | [After](assets/TASK-FE-021/after-desktop-weapons.png) | 0 |
| mobile-act | [Before](assets/TASK-FE-021/before-mobile-act.png) | [After](assets/TASK-FE-021/after-mobile-act.png) | 0 |
| mobile-agents | [Before](assets/TASK-FE-021/before-mobile-agents.png) | [After](assets/TASK-FE-021/after-mobile-agents.png) | 0 |
| mobile-deathmatch | [Before](assets/TASK-FE-021/before-mobile-deathmatch.png) | [After](assets/TASK-FE-021/after-mobile-deathmatch.png) | 0 |
| mobile-empty-maps | [Before](assets/TASK-FE-021/before-mobile-empty-maps.png) | [After](assets/TASK-FE-021/after-mobile-empty-maps.png) | 0 |
| mobile-empty-matches | [Before](assets/TASK-FE-021/before-mobile-empty-matches.png) | [After](assets/TASK-FE-021/after-mobile-empty-matches.png) | 0 |
| mobile-filters | [Before](assets/TASK-FE-021/before-mobile-filters.png) | [After](assets/TASK-FE-021/after-mobile-filters.png) | 0 |
| mobile-home | [Before](assets/TASK-FE-021/before-mobile-home.png) | [After](assets/TASK-FE-021/after-mobile-home.png) | 0 |
| mobile-maps | [Before](assets/TASK-FE-021/before-mobile-maps.png) | [After](assets/TASK-FE-021/after-mobile-maps.png) | 0 |
| mobile-matches | [Before](assets/TASK-FE-021/before-mobile-matches.png) | [After](assets/TASK-FE-021/after-mobile-matches.png) | 0 |
| mobile-modal-scoreboard | [Before](assets/TASK-FE-021/before-mobile-modal-scoreboard.png) | [After](assets/TASK-FE-021/after-mobile-modal-scoreboard.png) | 0 |
| mobile-overview | [Before](assets/TASK-FE-021/before-mobile-overview.png) | [After](assets/TASK-FE-021/after-mobile-overview.png) | 0 |
| mobile-performance | [Before](assets/TASK-FE-021/before-mobile-performance.png) | [After](assets/TASK-FE-021/after-mobile-performance.png) | 0 |
| mobile-show-more | [Before](assets/TASK-FE-021/before-mobile-show-more.png) | [After](assets/TASK-FE-021/after-mobile-show-more.png) | 0 |
| mobile-weapon-scroll | [Before](assets/TASK-FE-021/before-mobile-weapon-scroll.png) | [After](assets/TASK-FE-021/after-mobile-weapon-scroll.png) | 0 |
| mobile-weapons | [Before](assets/TASK-FE-021/before-mobile-weapons.png) | [After](assets/TASK-FE-021/after-mobile-weapons.png) | 0 |

## 실행 명령

```sh
node /tmp/fe021-visual.cjs before
node /tmp/fe021-visual.cjs after
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /tmp/fe021-pixels.py
node /tmp/fe021-state.cjs
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs && node src/features/tracker-profile/match-history/detail/missingData.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-all-errors --retry-delay 1 --max-time 20 --output /dev/null http://localhost:3000/players/ied-agent-allen
node /tmp/fe021-smoke.cjs
git diff --check
```

임시 하네스는 기존 번들 Playwright 및 컨테이너 React/TypeScript를 사용했다. 프로젝트 의존성 추가 없음.
Chromium/Docker의 sandbox 제한은 실행 권한 적용으로 해소했고, 기본 Python의 PIL 부재는 번들 Python으로 해소했다.
첫 재시작 smoke는 HTTP 준비 전에 실행되어 ERR_EMPTY_RESPONSE가 발생했으나 준비 확인 뒤 동일 검사를 통과했다.
기존 컨테이너의 git 메타데이터 경고는 그대로다. 검증 이후 제품 소스를 변경하지 않았다.

## 후속 범위

브라우저 동작까지 이번 Task에서 두 훅으로 분리했다. Mock·통계·데이터 공급 경계 정리는 후속 Task다.
실제 Riot API/키 발급 조건·RSO·Spring·배포 검증은 이번에 수행하지 않았다.


## 2차 최종 검증 — 브라우저 동작까지 포함

- `useProfileBrowserActions`의 저장/해제/재진입/실패, 공유 성공/실패, 검색, Mock 갱신,
  알림 수동 닫기·3200ms 만료, 메뉴/배너·탭 전환 수명: **PC/모바일 18그룹 PASS**.
- 브라우저 동작 **12상태 DOM·스타일·좌표 동일**, **4쌍 픽셀 차이0**, pageerror0.
  저장소/클립보드 허용·거부는 API 스텁을 주입하고 실제 UI·훅을 실행했다.
- 실제 React 일반/StrictMode: 기존 화면 상태 **30그룹**, 브라우저 동작 **10그룹 PASS**.
  선수 ID 변경 시 저장 상태만 다시 읽기, 읽기 실패 시 현재 상태 보존, 최신 이름으로 검색,
  동일 문구의 타이머 유지·문구 교체·만료·직접 닫기·unmount 정리를 확인했다. 오류/경고0.
- 최종 전체 화면 **58상태 동일**, 반응형20조건·모달5탭·키보드/포커스·필터 동작 유지.
- 최종 픽셀 비교는 **기존 기준 28쌍 + 같은 환경에서 다시 촬영한 기준 2쌍 모두 차이0**.
- Mock/상세Mock/누락SSR·TypeScript·Lint·build 재실행 PASS. 정적11페이지.
  서버 복원 후 HTTP200·모달 smoke PASS. 소스 원복 후 검증한 파일과 SHA-256 일치를 확인했다.
- 독립 브라우저 QA가 8장을 직접 검토했고, 부모도 최종 홈/모바일 요원 화면·저장 실패 안내를 확인했다.
  새 겹침/여백/글자 잘림은 없으며 기존 표 가로 스크롤을 유지한다. 별도 Cursor 리뷰는 미실행.

### 픽셀 차이 진단

최초 최종 비교에서 홈 카드 모서리19픽셀·모바일 요원 화면15픽셀에 최대 채널값2의 차이가 있었다.
DOM·스타일·좌표는 동일했고 재촬영에서도 모서리 래스터 값만 달라졌다.
첫 커밋 `32aefcd`와 최종 코드를 각각 동일한 `--disable-gpu` Chromium 환경으로 촬영하자
두 쌍 모두 정확히 일치했다. 비교 허용치를 완화하지 않았으며 최초 캡처·진단도 보존했다.
기준 촬영을 위해 부모 파일을 임시 복원한 뒤 `finally`로 최종 소스를 바이트 단위 그대로 복구했다.

초기 브라우저 하네스의 메뉴 클릭 순서(열린 메뉴가 버튼을 가림)와 `undefined` JSON 직렬화 비교를
보정했다. 제품 코드는 이 과정에서 변경하지 않았다. 서버 준비 확인의 초기 Empty reply는
재시도 후 성공했고 이어 실행한 모달 smoke도 통과했다.

### 최종 실행 명령

```sh
node /tmp/fe021-browser.cjs before
node /tmp/fe021-browser.cjs after
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /tmp/fe021-browser-pixels.py
node /tmp/fe021-browser-state.cjs
node /tmp/fe021-state.cjs
node /tmp/fe021-final-visual.cjs after
node /tmp/fe021-control.cjs before
node /tmp/fe021-control.cjs after
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /tmp/fe021-final-check.py
```

위 기본 검증의 Docker 전체 검사·서버 복원·준비 확인·smoke·diff check도 최종 코드에서 재실행했다.
초기 `/tmp/fe021-final-pixels.py` 비교 실패는 위 모서리 진단에 해당하며 최종 비교기는
28개 기존 기준과 2개 통제 기준을 각각 사용한다. 상세 결과·소스 해시는
[최종 검증 JSON](assets/TASK-FE-021/final-verification.json)에 기록했다.

### 브라우저 동작 캡처

| 화면 | Before | After | 변경 픽셀 |
|---|---|---|---|
| desktop-retained-menu | [Before](assets/TASK-FE-021/browser-before-desktop-retained-menu.png) | [After](assets/TASK-FE-021/browser-after-desktop-retained-menu.png) | 0 |
| desktop-storage-unavailable | [Before](assets/TASK-FE-021/browser-before-desktop-storage-unavailable.png) | [After](assets/TASK-FE-021/browser-after-desktop-storage-unavailable.png) | 0 |
| mobile-retained-menu | [Before](assets/TASK-FE-021/browser-before-mobile-retained-menu.png) | [After](assets/TASK-FE-021/browser-after-mobile-retained-menu.png) | 0 |
| mobile-storage-unavailable | [Before](assets/TASK-FE-021/browser-before-mobile-storage-unavailable.png) | [After](assets/TASK-FE-021/browser-after-mobile-storage-unavailable.png) | 0 |

### 최종 전체 화면 비교

| 화면 | 비교 기준 | 최종 | 변경 픽셀 |
|---|---|---|---|
| desktop-act | [Before](assets/TASK-FE-021/before-desktop-act.png) | [After](assets/TASK-FE-021/final-desktop-act.png) | 0 |
| desktop-agents | [Before](assets/TASK-FE-021/before-desktop-agents.png) | [After](assets/TASK-FE-021/final-desktop-agents.png) | 0 |
| desktop-deathmatch | [Before](assets/TASK-FE-021/before-desktop-deathmatch.png) | [After](assets/TASK-FE-021/final-desktop-deathmatch.png) | 0 |
| desktop-empty-maps | [Before](assets/TASK-FE-021/before-desktop-empty-maps.png) | [After](assets/TASK-FE-021/final-desktop-empty-maps.png) | 0 |
| desktop-empty-matches | [Before](assets/TASK-FE-021/before-desktop-empty-matches.png) | [After](assets/TASK-FE-021/final-desktop-empty-matches.png) | 0 |
| desktop-filters | [Before](assets/TASK-FE-021/before-desktop-filters.png) | [After](assets/TASK-FE-021/final-desktop-filters.png) | 0 |
| desktop-home | [Before](assets/TASK-FE-021/control-before-desktop-home.png) | [After](assets/TASK-FE-021/control-after-desktop-home.png) | 0 |
| desktop-maps | [Before](assets/TASK-FE-021/before-desktop-maps.png) | [After](assets/TASK-FE-021/final-desktop-maps.png) | 0 |
| desktop-matches | [Before](assets/TASK-FE-021/before-desktop-matches.png) | [After](assets/TASK-FE-021/final-desktop-matches.png) | 0 |
| desktop-modal-scoreboard | [Before](assets/TASK-FE-021/before-desktop-modal-scoreboard.png) | [After](assets/TASK-FE-021/final-desktop-modal-scoreboard.png) | 0 |
| desktop-overview | [Before](assets/TASK-FE-021/before-desktop-overview.png) | [After](assets/TASK-FE-021/final-desktop-overview.png) | 0 |
| desktop-performance | [Before](assets/TASK-FE-021/before-desktop-performance.png) | [After](assets/TASK-FE-021/final-desktop-performance.png) | 0 |
| desktop-show-more | [Before](assets/TASK-FE-021/before-desktop-show-more.png) | [After](assets/TASK-FE-021/final-desktop-show-more.png) | 0 |
| desktop-weapon-scroll | [Before](assets/TASK-FE-021/before-desktop-weapon-scroll.png) | [After](assets/TASK-FE-021/final-desktop-weapon-scroll.png) | 0 |
| desktop-weapons | [Before](assets/TASK-FE-021/before-desktop-weapons.png) | [After](assets/TASK-FE-021/final-desktop-weapons.png) | 0 |
| mobile-act | [Before](assets/TASK-FE-021/before-mobile-act.png) | [After](assets/TASK-FE-021/final-mobile-act.png) | 0 |
| mobile-agents | [Before](assets/TASK-FE-021/control-before-mobile-agents.png) | [After](assets/TASK-FE-021/control-after-mobile-agents.png) | 0 |
| mobile-deathmatch | [Before](assets/TASK-FE-021/before-mobile-deathmatch.png) | [After](assets/TASK-FE-021/final-mobile-deathmatch.png) | 0 |
| mobile-empty-maps | [Before](assets/TASK-FE-021/before-mobile-empty-maps.png) | [After](assets/TASK-FE-021/final-mobile-empty-maps.png) | 0 |
| mobile-empty-matches | [Before](assets/TASK-FE-021/before-mobile-empty-matches.png) | [After](assets/TASK-FE-021/final-mobile-empty-matches.png) | 0 |
| mobile-filters | [Before](assets/TASK-FE-021/before-mobile-filters.png) | [After](assets/TASK-FE-021/final-mobile-filters.png) | 0 |
| mobile-home | [Before](assets/TASK-FE-021/before-mobile-home.png) | [After](assets/TASK-FE-021/final-mobile-home.png) | 0 |
| mobile-maps | [Before](assets/TASK-FE-021/before-mobile-maps.png) | [After](assets/TASK-FE-021/final-mobile-maps.png) | 0 |
| mobile-matches | [Before](assets/TASK-FE-021/before-mobile-matches.png) | [After](assets/TASK-FE-021/final-mobile-matches.png) | 0 |
| mobile-modal-scoreboard | [Before](assets/TASK-FE-021/before-mobile-modal-scoreboard.png) | [After](assets/TASK-FE-021/final-mobile-modal-scoreboard.png) | 0 |
| mobile-overview | [Before](assets/TASK-FE-021/before-mobile-overview.png) | [After](assets/TASK-FE-021/final-mobile-overview.png) | 0 |
| mobile-performance | [Before](assets/TASK-FE-021/before-mobile-performance.png) | [After](assets/TASK-FE-021/final-mobile-performance.png) | 0 |
| mobile-show-more | [Before](assets/TASK-FE-021/before-mobile-show-more.png) | [After](assets/TASK-FE-021/final-mobile-show-more.png) | 0 |
| mobile-weapon-scroll | [Before](assets/TASK-FE-021/before-mobile-weapon-scroll.png) | [After](assets/TASK-FE-021/final-mobile-weapon-scroll.png) | 0 |
| mobile-weapons | [Before](assets/TASK-FE-021/before-mobile-weapons.png) | [After](assets/TASK-FE-021/final-mobile-weapons.png) | 0 |
