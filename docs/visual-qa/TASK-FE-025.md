# TASK-FE-025 — 보조 페이지·기록 없음 화면 시각 검증

> 아래의 기존 「기준과 범위」부터 「전체 캡처」까지는 커밋 `2018b08`에 기록한 **1차 보조 페이지 정리의 검증 증거**다. 당시의 본문 보존·회귀 화면 동일성·후속 범위 판단을 그대로 남긴다. 이후 사용자 승인으로 진행한 버튼·안내·사이드바 변경은 문서 뒤의 **2차 확장**에서 별도 기준과 결과로 설명한다.

## 기준과 범위

- 기준 코드: PR #17 병합 `36faaba`, 작업 브랜치 `codex/support-page-theme`.
- 레퍼런스: 현재 홈의 공통 브랜드/검색 메뉴·배경·푸터. 외부 사이트 이미지를 새로 도입하지 않았다.
- 구현 전후 Playwright Chromium, 1440×960 및390×844, DPR1, 브라우저 배율100%, 전체 페이지 캡처.
- 보조6경로와 회귀4경로를 두 화면 크기로 촬영했다. Before20/After20, 총40장.
- 구현자 Codex의 자동/시각 검증이다. 별도 Cursor 검토를 대신하지 않는다.

## 시각 대조 결과

| 항목 | Before | After / 판단 |
|---|---|---|
| 연결·정책 외곽 | 민트색 격자 배경, 예전 단일 메뉴·푸터 | 기존 홈과 같은 GP 브랜드·Search 메뉴·평면 배경·푸터. 중복 헤더/푸터 없음 |
| 제목·본문 | PC 제목 최대76px, 페이지별 본문 밀도 차이 | 제목28px·본문14px 공통 토큰. 문서 최대920px, 안내720px. 제목 과대 강조 해소 |
| 정책 문서 | 구형 페이지 스타일 | 본문 카드 안에서 섹션 구분선·24px 간격. 모바일 목록 줄바꿈·푸터 분리 정상 |
| 기록 없음 | 기존/합성 분기별 외곽·제목 불일치 | 공통 카드와 홈/데모 복귀 버튼. 모바일 버튼은 세로 배치, 텍스트 잘림 없음 |
| 기존 주요 화면 | 홈·두 데모·정상 합성 상세 | 두 화면 크기의8쌍 모두 DOM/계산 스타일/좌표 해시와 PNG 픽셀 완전 일치 |

PC 연결/개인정보/기록 없음 및 모바일 연결/개인정보/약관/기록 없음 캡처를 직접 열어 확인했다.
제목·목록·버튼 겹침, 카드 밖 넘침, 중복 메뉴가 발견되지 않았다.
짧은 안내 화면의 아래 빈 공간은 푸터를 화면 하단에 두기 위한 배치다.

## 자동 검증

- Before49체크, After181체크 PASS, JavaScript pageerror0.
- 보조6경로×2: HTTP200, main1, 구형 헤더 숨김, 공통 내비게이션1, 보이는 푸터1, 제목28px, 가로 넘침0.
- 연결·개인정보·약관의 제목/단락/목록 본문 및 연결 버튼의 disabled 상태를 Before와 정확 비교해 보존 확인.
- More 열기·Escape 닫기/초점 복귀, Privacy→Terms와 Search→홈 입력창을 실제 클릭으로 확인.
- Overview/데모 복귀 주소는 기본 기존 디자인 데모, 합성 경기 없음만 새 데이터 데모임을 확인.
- 회귀4경로×2의 DOM/계산 스타일/좌표 해시 및 PNG 픽셀 완전 일치.
- TypeScript, ESLint, 프로덕션 빌드 PASS. 정적 페이지11개 생성 후 개발 서버 복원.
- 실행 로그의 컨테이너 `git: not found` 안내는 기존 환경 메시지이며 Lint·빌드는 종료0으로 통과했다.

## 재현

```sh
PLAYWRIGHT_MODULES=<playwright-module-path> node docs/visual-qa/assets/TASK-FE-025/browser-qa.cjs before
PLAYWRIGHT_MODULES=<playwright-module-path> node docs/visual-qa/assets/TASK-FE-025/browser-qa.cjs after
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

이 1차 검사는 Before `36faaba`, After `2018b08`에서 실행한 기록이다. 현재 확장본은 아래 2차 명령으로 검증한다. 현재 구현으로 Before를 다시 실행하면 비교 기준이 덮어써진다.
기존 Playwright 설치를 사용했으며 운영 의존성은 추가하지 않았다.

- [Before 결과](assets/TASK-FE-025/before-results.json)
- [After 결과](assets/TASK-FE-025/after-results.json)
- [픽셀 비교 결과](assets/TASK-FE-025/regression-pixels.json)

## 유지한 범위와 후속 사항

- 라인업/관리자/백엔드/자산/공통 전역 CSS/실제 인증/데이터 계산은 변경하지 않았다.
- 약관·개인정보 초안의 의미와 연결 준비 중 상태를 유지했다. 법률 문구의 유효성을 검토한 작업이 아니다.
- 홈·프로필 계정 버튼 색 차이, 일반 안내 언어/서비스명, 짧은 탭 옆 긴 사이드바는 후속 범위다.
- 일반 URL 전체의404 화면은 이번 대상에 포함하지 않았다. 기존 플레이어/경기 조회 실패 분기만 통일했다.

## 전체 캡처

아래 Before/After는 동일 경로·화면 크기다. 홈의 Before 캡처가 공통 테마의 시각 기준이다.

| 화면 | 크기 | Before | After |
|---|---|---|---|
| 계정 연결 | 1440px | [Before](assets/TASK-FE-025/before-1440-connect.png) | [After](assets/TASK-FE-025/after-1440-connect.png) |
| 계정 연결 | 390px | [Before](assets/TASK-FE-025/before-390-connect.png) | [After](assets/TASK-FE-025/after-390-connect.png) |
| 개인정보처리방침 | 1440px | [Before](assets/TASK-FE-025/before-1440-privacy.png) | [After](assets/TASK-FE-025/after-1440-privacy.png) |
| 개인정보처리방침 | 390px | [Before](assets/TASK-FE-025/before-390-privacy.png) | [After](assets/TASK-FE-025/after-390-privacy.png) |
| 이용약관 | 1440px | [Before](assets/TASK-FE-025/before-1440-terms.png) | [After](assets/TASK-FE-025/after-1440-terms.png) |
| 이용약관 | 390px | [Before](assets/TASK-FE-025/before-390-terms.png) | [After](assets/TASK-FE-025/after-390-terms.png) |
| 기존 경기 없음 | 1440px | [Before](assets/TASK-FE-025/before-1440-missing-legacy-match.png) | [After](assets/TASK-FE-025/after-1440-missing-legacy-match.png) |
| 기존 경기 없음 | 390px | [Before](assets/TASK-FE-025/before-390-missing-legacy-match.png) | [After](assets/TASK-FE-025/after-390-missing-legacy-match.png) |
| 합성 경기 없음 | 1440px | [Before](assets/TASK-FE-025/before-1440-missing-synthetic-match.png) | [After](assets/TASK-FE-025/after-1440-missing-synthetic-match.png) |
| 합성 경기 없음 | 390px | [Before](assets/TASK-FE-025/before-390-missing-synthetic-match.png) | [After](assets/TASK-FE-025/after-390-missing-synthetic-match.png) |
| 플레이어 없음 | 1440px | [Before](assets/TASK-FE-025/before-1440-missing-player.png) | [After](assets/TASK-FE-025/after-1440-missing-player.png) |
| 플레이어 없음 | 390px | [Before](assets/TASK-FE-025/before-390-missing-player.png) | [After](assets/TASK-FE-025/after-390-missing-player.png) |
| 홈 (레퍼런스/회귀) | 1440px | [Before](assets/TASK-FE-025/before-1440-home.png) | [After](assets/TASK-FE-025/after-1440-home.png) |
| 홈 (레퍼런스/회귀) | 390px | [Before](assets/TASK-FE-025/before-390-home.png) | [After](assets/TASK-FE-025/after-390-home.png) |
| 기존 데모 (회귀) | 1440px | [Before](assets/TASK-FE-025/before-1440-legacy-profile.png) | [After](assets/TASK-FE-025/after-1440-legacy-profile.png) |
| 기존 데모 (회귀) | 390px | [Before](assets/TASK-FE-025/before-390-legacy-profile.png) | [After](assets/TASK-FE-025/after-390-legacy-profile.png) |
| 새 데모 (회귀) | 1440px | [Before](assets/TASK-FE-025/before-1440-new-profile.png) | [After](assets/TASK-FE-025/after-1440-new-profile.png) |
| 새 데모 (회귀) | 390px | [Before](assets/TASK-FE-025/before-390-new-profile.png) | [After](assets/TASK-FE-025/after-390-new-profile.png) |
| 정상 합성 상세 (회귀) | 1440px | [Before](assets/TASK-FE-025/before-1440-synthetic-detail.png) | [After](assets/TASK-FE-025/after-1440-synthetic-detail.png) |
| 정상 합성 상세 (회귀) | 390px | [Before](assets/TASK-FE-025/before-390-synthetic-detail.png) | [After](assets/TASK-FE-025/after-390-synthetic-detail.png) |

빌드 후 [서버 복원 확인](assets/TASK-FE-025/smoke-results.json)도 통과했다. 두 해상도 보조6경로의 HTTP200/main1 및 실제 Overview·기록 없음 복귀8동작을 확인했고, 기존20행/새4행과 브라우저 오류0을 확인했다.


## 2차 확장 — 버튼·한국어 안내·짧은 탭 사이드바

### 기준과 촬영 범위

- 변경 전 기준: 1차 작업을 커밋한 `2018b08`. 같은 `codex/support-page-theme` 브랜치에서 사용자 승인 범위를 확장했다.
- Playwright Chromium, DPR1·배율100%·reduced motion. 글꼴과 이미지 로딩 후 PC1440×960, 태블릿820×960, 모바일390×844에서 전체 페이지를 촬영했다.
- 각 크기에서 홈1·두 데모의 Overview/Agents/Maps/Weapons8·연결/개인정보/약관/합성 경기 없음4, 총13화면을 기록했다. **Before39장·After39장, 총78장**이다.
- Matches/Performance도 두 데모와 세 크기에서 동작·상태를 확인했다. 캡처39화면과 캡처하지 않은12상태를 합쳐 **51상태**를 검사했다.
- 초기40장과 기존 `browser-qa.cjs`/결과 JSON은 수정하지 않았다. 이번 근거는 모두 `consistency-*`로 분리했다.
- 외부 레퍼런스나 이미지 자산은 추가하지 않았다. 구현자 Codex의 직접 시각 검토이며 별도 Cursor 리뷰를 대신하지 않는다.

### 시각적 변화와 직접 검토

| 항목 | Before | After / 판단 |
|---|---|---|
| 주요 행동 버튼 | 프로필 계정/저장 버튼과 홈·보조 계정 버튼의 빨강이 다름 | 홈·두 프로필·보조 계정, 홈 데모, 미저장 버튼의 기본 `#c93648`·hover `#b52d3e`·흰 글자 동일. normal/hover의 추가 밝기 필터 없음 |
| 저장·비활성·키보드 초점 | 기능별 상태 표현 | 저장 완료의 별도 색, 비활성 계정 연결, 키보드 초점 테두리 유지. 필터·승패·홍보 영역의 다른 의미 색은 보존 |
| 화면 안내 | 데모·공유·저장·데이터 제한 안내에 영문 설명과 개발 작업 번호 혼재 | 안내와 피드백을 한국어로 정리. 실제 검색/인증 미제공과 예시 데이터의 한계를 유지하고 내비게이션·통계명은 영문 유지 |
| 법적/계정 안내 | TASK/Phase/이전 서비스명 노출 | 개발 작업 번호·Phase·이전 서비스명 제거. 연결 버튼 비활성, 정책 초안과 법률 검토·승인 조건 유지 |
| Agents/Maps/Weapons | 짧은 본문 옆/아래 전체 통계 카드가 페이지를 길게 만듦 | 랭크 카드와 `Overview에서 전체 통계 보기` 버튼만 표시. PC/태블릿은 두 열, 모바일은 본문 아래에 배치 |
| Overview/Matches/Performance | 전체 사이드바 | ACCURACY/ROLES/TOP WEAPONS/TOP MAPS 등 전체 구성 유지. 짧은 탭의 복귀 버튼으로 Overview 이동 시 전체 통계 복원 |

PC의 기존 Agents·새 Maps, 태블릿의 기존 Maps, 모바일의 새 Weapons·계정 연결·약관을 직접 열어 Before/After와 대조했다. 카드/표/복귀 버튼/푸터의 새 겹침·잘림·가로 넘침은 발견하지 못했다. 기존 표의 가로 스크롤과 작은 화면의 탭 스크롤은 유지한다.

### 자동 검증 결과

- `consistency-qa.cjs before`: **PASS,164검사·51상태·39캡처**, pageerror0·console error0.
- `consistency-qa.cjs after`: **PASS,593검사·51상태·39캡처**, pageerror0·console error0.
- 두 데모×6탭×3크기의 통계 표·경기 목록·선택 필터 값을 Before와 비교해 동일함을 확인했다. 51상태 모두 main1·문서 가로 넘침0.
- 짧은3탭×두 데모×3크기에서 랭크 유지, 추가 사이드바 카드 제거, Overview 복귀와 전체 카드 복원을 확인했다.
- 세 크기에서 계정4종·홈 데모·미저장2종, 총21개 버튼 표본의 normal/hover 색을 대조했다. 기본/hover 배경 및 글자 색이 같고 `filter: none`이다.
- 연결·개인정보·약관에서 TASK/Phase/이전 서비스명 제거와 정책 초안 표기를 검사했다. 이번 단계는 승인된 문구 수정이 있으므로 1차의 본문 완전 일치 판정을 그대로 적용하지 않는다.
- `consistency-actions.cjs`: **PASS,104검사**, pageerror0·console error0. PC/모바일의 두 데모에서 키보드 저장·선수별 저장 유지/해제·공유 URL·검색 안내·갱신·Load more·Jett 필터·초기화·상세 모달5탭/Escape·Agents→Matches 이동을 확인했다.
- 기존 데모 기본20행/추가23행/Jett9행, 새 데모4행/Jett2행을 확인했다. 저장 완료 색과 키보드 초점 테두리, 한국어 저장/해제/공유/검색 피드백이 유지된다. 갱신 전후 경기 목록도 같다.
- PC/모바일에서 partial3행·empty0행·error0행의 한국어 상태와 가로 넘침0을 확인했다. partial/error의 재시도는 선택한 scenario를 유지하고, 기본 데모 복귀는4행을 복원한다. Console은 지원 범위를 설명하는 한국어 안내와0행을 표시한다.
- 홈의 기본 데모 버튼은 기존 디자인 데모, 명시적 새 데이터 링크는 새 데모로 이동한다.

첫 동작 실행은75검사를 통과한 뒤 모바일 홈의 숨겨진 데모 **카드**를 선택하며 timeout이 발생했다. 기존 CSS가800px 이하에서 카드를 숨기므로, 실제 보이는 **데모 비교 링크**를 선택하도록 검증 하니스를 보정했다. 제품 코드를 바꾸거나 검사를 삭제하지 않고 최종104검사를 통과했다. 최초 실패 기록은 `/private/tmp/fe025-consistency-first-action-failure.json`에 보존했다.

### 짧은 탭 높이 비교

아래는 전체 페이지 높이(px)의 Before→After와 감소량이다. 사이드바 축약뿐 아니라 승인된 안내 문구의 줄바꿈 변화도 포함한다.

| 화면 폭 | 데모 | Agents | Maps | Weapons |
|---|---|---|---|---|
| 1440px | 기존 디자인 | 2537→1072 (−1465) | 2537→1123 (−1414) | 2537→1104 (−1433) |
| 1440px | 새 데이터 | 2676→1210 (−1466) | 2676→1262 (−1414) | 2676→1243 (−1433) |
| 820px | 기존 디자인 | 2586→1124 (−1462) | 2586→1386 (−1200) | 2586→1156 (−1430) |
| 820px | 새 데이터 | 2780→1290 (−1490) | 2780→1551 (−1229) | 2780→1322 (−1458) |
| 390px | 기존 디자인 | 2548→1394 (−1154) | 2758→1604 (−1154) | 2576→1399 (−1177) |
| 390px | 새 데이터 | 2849→1668 (−1181) | 3060→1879 (−1181) | 2894→1696 (−1198) |

사이드바 자체 높이는 세 짧은 탭에서 동일하게 PC 약1772→295px, 태블릿1769→290px, 모바일1417→263px로 줄었다. 원시 소수점 측정과18조건별 결과는 [높이 비교 JSON](assets/TASK-FE-025/consistency-height-results.json)에 남겼다.

### 2차 실행 명령과 근거

다음은 저장소 루트에서 실제 실행한 명령이다. macOS 브라우저 실행은 승인된 환경에서 진행했고 기존 Playwright 설치를 사용했다. 새로운 운영 의존성은 추가하지 않았다.

```sh
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/consistency-qa.cjs before
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/consistency-qa.cjs after
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/consistency-actions.cjs
```

Before는 `2018b08`에서 촬영한 기준이다. 현재 변경본으로 Before를 다시 실행해 기존 근거를 덮어쓰지 않는다. 색/문구/사이드바가 의도적으로 변경되었으므로 이번 단계의 화면 전체 픽셀 동일성을 주장하지 않는다. 보존 대상인 통계 값·필터·동작은 별도로 비교했다.

- [2차 Before 결과](assets/TASK-FE-025/consistency-before-results.json)
- [2차 After 결과](assets/TASK-FE-025/consistency-after-results.json)
- [동작 및 상태 결과](assets/TASK-FE-025/consistency-actions-results.json)
- [화면/버튼 검증 스크립트](assets/TASK-FE-025/consistency-qa.cjs)
- [동작 검증 스크립트](assets/TASK-FE-025/consistency-actions.cjs)

### 2차 PC·태블릿·모바일 13화면 비교

| 화면 | PC1440 Before | PC1440 After | 태블릿820 Before | 태블릿820 After | 모바일390 Before | 모바일390 After |
|---|---|---|---|---|---|---|
| 홈 | [Before](assets/TASK-FE-025/consistency-before-1440-home.png) | [After](assets/TASK-FE-025/consistency-after-1440-home.png) | [Before](assets/TASK-FE-025/consistency-before-820-home.png) | [After](assets/TASK-FE-025/consistency-after-820-home.png) | [Before](assets/TASK-FE-025/consistency-before-390-home.png) | [After](assets/TASK-FE-025/consistency-after-390-home.png) |
| 기존 데모 Overview | [Before](assets/TASK-FE-025/consistency-before-1440-legacy-overview.png) | [After](assets/TASK-FE-025/consistency-after-1440-legacy-overview.png) | [Before](assets/TASK-FE-025/consistency-before-820-legacy-overview.png) | [After](assets/TASK-FE-025/consistency-after-820-legacy-overview.png) | [Before](assets/TASK-FE-025/consistency-before-390-legacy-overview.png) | [After](assets/TASK-FE-025/consistency-after-390-legacy-overview.png) |
| 기존 데모 Agents | [Before](assets/TASK-FE-025/consistency-before-1440-legacy-agents.png) | [After](assets/TASK-FE-025/consistency-after-1440-legacy-agents.png) | [Before](assets/TASK-FE-025/consistency-before-820-legacy-agents.png) | [After](assets/TASK-FE-025/consistency-after-820-legacy-agents.png) | [Before](assets/TASK-FE-025/consistency-before-390-legacy-agents.png) | [After](assets/TASK-FE-025/consistency-after-390-legacy-agents.png) |
| 기존 데모 Maps | [Before](assets/TASK-FE-025/consistency-before-1440-legacy-maps.png) | [After](assets/TASK-FE-025/consistency-after-1440-legacy-maps.png) | [Before](assets/TASK-FE-025/consistency-before-820-legacy-maps.png) | [After](assets/TASK-FE-025/consistency-after-820-legacy-maps.png) | [Before](assets/TASK-FE-025/consistency-before-390-legacy-maps.png) | [After](assets/TASK-FE-025/consistency-after-390-legacy-maps.png) |
| 기존 데모 Weapons | [Before](assets/TASK-FE-025/consistency-before-1440-legacy-weapons.png) | [After](assets/TASK-FE-025/consistency-after-1440-legacy-weapons.png) | [Before](assets/TASK-FE-025/consistency-before-820-legacy-weapons.png) | [After](assets/TASK-FE-025/consistency-after-820-legacy-weapons.png) | [Before](assets/TASK-FE-025/consistency-before-390-legacy-weapons.png) | [After](assets/TASK-FE-025/consistency-after-390-legacy-weapons.png) |
| 새 데모 Overview | [Before](assets/TASK-FE-025/consistency-before-1440-new-overview.png) | [After](assets/TASK-FE-025/consistency-after-1440-new-overview.png) | [Before](assets/TASK-FE-025/consistency-before-820-new-overview.png) | [After](assets/TASK-FE-025/consistency-after-820-new-overview.png) | [Before](assets/TASK-FE-025/consistency-before-390-new-overview.png) | [After](assets/TASK-FE-025/consistency-after-390-new-overview.png) |
| 새 데모 Agents | [Before](assets/TASK-FE-025/consistency-before-1440-new-agents.png) | [After](assets/TASK-FE-025/consistency-after-1440-new-agents.png) | [Before](assets/TASK-FE-025/consistency-before-820-new-agents.png) | [After](assets/TASK-FE-025/consistency-after-820-new-agents.png) | [Before](assets/TASK-FE-025/consistency-before-390-new-agents.png) | [After](assets/TASK-FE-025/consistency-after-390-new-agents.png) |
| 새 데모 Maps | [Before](assets/TASK-FE-025/consistency-before-1440-new-maps.png) | [After](assets/TASK-FE-025/consistency-after-1440-new-maps.png) | [Before](assets/TASK-FE-025/consistency-before-820-new-maps.png) | [After](assets/TASK-FE-025/consistency-after-820-new-maps.png) | [Before](assets/TASK-FE-025/consistency-before-390-new-maps.png) | [After](assets/TASK-FE-025/consistency-after-390-new-maps.png) |
| 새 데모 Weapons | [Before](assets/TASK-FE-025/consistency-before-1440-new-weapons.png) | [After](assets/TASK-FE-025/consistency-after-1440-new-weapons.png) | [Before](assets/TASK-FE-025/consistency-before-820-new-weapons.png) | [After](assets/TASK-FE-025/consistency-after-820-new-weapons.png) | [Before](assets/TASK-FE-025/consistency-before-390-new-weapons.png) | [After](assets/TASK-FE-025/consistency-after-390-new-weapons.png) |
| 계정 연결 | [Before](assets/TASK-FE-025/consistency-before-1440-connect.png) | [After](assets/TASK-FE-025/consistency-after-1440-connect.png) | [Before](assets/TASK-FE-025/consistency-before-820-connect.png) | [After](assets/TASK-FE-025/consistency-after-820-connect.png) | [Before](assets/TASK-FE-025/consistency-before-390-connect.png) | [After](assets/TASK-FE-025/consistency-after-390-connect.png) |
| 개인정보처리방침 | [Before](assets/TASK-FE-025/consistency-before-1440-privacy.png) | [After](assets/TASK-FE-025/consistency-after-1440-privacy.png) | [Before](assets/TASK-FE-025/consistency-before-820-privacy.png) | [After](assets/TASK-FE-025/consistency-after-820-privacy.png) | [Before](assets/TASK-FE-025/consistency-before-390-privacy.png) | [After](assets/TASK-FE-025/consistency-after-390-privacy.png) |
| 이용약관 | [Before](assets/TASK-FE-025/consistency-before-1440-terms.png) | [After](assets/TASK-FE-025/consistency-after-1440-terms.png) | [Before](assets/TASK-FE-025/consistency-before-820-terms.png) | [After](assets/TASK-FE-025/consistency-after-820-terms.png) | [Before](assets/TASK-FE-025/consistency-before-390-terms.png) | [After](assets/TASK-FE-025/consistency-after-390-terms.png) |
| 합성 경기 없음 | [Before](assets/TASK-FE-025/consistency-before-1440-missing.png) | [After](assets/TASK-FE-025/consistency-after-1440-missing.png) | [Before](assets/TASK-FE-025/consistency-before-820-missing.png) | [After](assets/TASK-FE-025/consistency-after-820-missing.png) | [Before](assets/TASK-FE-025/consistency-before-390-missing.png) | [After](assets/TASK-FE-025/consistency-after-390-missing.png) |

### 최종 빌드와 서버 복원

- 구현 담당자가 실행한 Docker 프론트의 `npm run build`: PASS. 컴파일·타입/Lint와 정적11페이지 생성 완료 후 개발 서버를 복원했다.
- 이후 `node /private/tmp/fe025-consistency-smoke.cjs`: **PASS,28검사**, pageerror0·console error0.
- PC1440/모바일390에서 홈·기존/새 프로필·연결의 HTTP200, Agents의 축약 사이드바→Overview 전체 통계 복원, 기존20행/새4행, 계정 연결 disabled를 확인했다. 전체 QA와 캡처는 재실행하지 않았다.
- [최종 서버 복원 결과](assets/TASK-FE-025/consistency-smoke-results.json)

## 3차 추가 — 한국어·영어 전환

### 기준과 범위

- 변경 전 기준은 버튼·안내·사이드바 정리를 완료한 `0a2c08b`다. 동일 Task/브랜치에서 사용자 요청에 따라 언어 전환을 추가했다.
- 기존 1차·2차 검증 자료는 수정하지 않았다. 이번 화면과 결과는 `language-*` 파일로 별도 기록했다.
- PC1440×960/모바일390×844에서 홈·기존 프로필·새 프로필·연결·개인정보·약관6경로를 촬영했다. **Before 한국어12장, After 한국어12장+영어12장, 총36장**이다.
- 공통 헤더의 전환 버튼, `main`의 `lang`, `gameprobe:locale` 저장값, 화면 이동·새로고침·다른 탭 동기화·저장 제한 상황을 확인했다. 라인업·실제 인증·API를 새로 연결하지 않았다.
- 게임·통계·내비게이션의 기존 영문 이름과 경기 상세5탭은 유지한다. 전환 버튼의 `한국어` 표기는 영어 화면에서도 현재 선택할 언어를 알려 주므로 번역 잔여 검사에서 제외했다.

### 시각 검토와 화면 검증

- `language-qa.cjs before`: **PASS,38검사·12캡처**, pageerror0·console error0.
- `language-qa.cjs after`: **PASS,94검사·24캡처**, pageerror0·console error0. 한국어/영어 전환·선택 저장·번역 본문 변경·영문 연결 버튼 disabled를 확인했다.
- 별도 영어 본문 검사: **12화면 모두 미번역 한글0**. 전환 버튼만 제외하고 홈/프로필/보조 페이지의 실제 표시 본문을 검사했다.
- PC 영어 홈과 모바일 영어 홈·새 프로필·연결·개인정보 캡처를 직접 확인했다. 새 글자 겹침·카드 밖 넘침·버튼 잘림은 발견하지 못했다. 긴 영어 제목과 법적 문서도 카드 안에서 줄바꿈된다.
- 1440/820/390/320px에서 한국어/영어6경로와 새 프로필 Agents/Weapons를 합친 **64레이아웃**을 검사했다. main1·가로 넘침0, 언어/More 버튼의 화면 안 배치와 서로 겹치지 않음을 확인했다.

최초 Before 접속은 병렬 구현의 임시 import 변경과 겹쳐 없는 locale 모듈로HTTP500이 발생했고 캡처는0장이었다. 기준선 소스를 정확히 복원한 뒤 다시 시작해 최종12장을 모두 촬영했다. 실패한 접속을 Before 근거로 사용하지 않았으며 최초 기록은 `/private/tmp/fe025-language-first-before.json`에만 보존했다.

### 언어 상태·저장·동기화 검증

`language-state-qa.cjs`는 **최종215검사 PASS**, pageerror·console/hydration error0이다. 독립 검토에서 구독 재등록 처리를 보완한 뒤 같은 검사를 다시 실행했다. 이 저장 로직 보완으로 화면은 바뀌지 않아 캡처는 재촬영하지 않았다.

- 새 브라우저의 기본 한국어, 영어 선택의 저장키/값, 계정 페이지로 실제 이동과 새로고침 후 영어 유지를 확인했다.
- 같은 브라우저의 두 실제 탭에서 `storage` 이벤트로 한국어/영어가 양방향 동기화됐다. 잘못된 저장값은 한국어로 처리했다.
- 저장소 읽기/쓰기를 차단해도 전환과 현재 탭의 클라이언트 화면 이동, 다시 한국어로 전환이 동작했다. 저장 차단 상태의 새로고침 이후 영구 유지를 주장하지 않는다.
- 두 데모에서 Matches 선택·Jett 필터·저장 완료·경기 수를 유지한 채 언어를 바꿨다. 기존9행/새2행을 유지했다.
- 열린 경기 모달은 다른 실제 탭에서 언어를 바꿔 동기화했다. 선택 경기·Performance 상세 탭·프로필 필터·저장 상태가 유지됐고 Escape 닫기와 경기 버튼 초점 복귀도 정상이다. 모달의 배경 비활성화를 강제로 우회하지 않았다.

구현 담당자가 기존 동작 스크립트의 출력 파일만 `language-regression-results.json`으로 분리해 실행한 추가 회귀도 **104검사 PASS**, 브라우저 오류0이다. 저장·공유·검색·필터·갱신·부분/빈/오류 상태와 재시도를 확인했으며 이전 `consistency-*` 결과는 덮어쓰지 않았다.

구독자가 없는 화면에 머물다 복귀하는 경계는 실제 `locale.tsx`의 외부 저장소 함수로 별도 **22검사 PASS**를 확인했다. TypeScript 변환 후 React 훅 등록과 브라우저 저장소를 검증용 객체로 대체한 단위 검사이며 React 화면 렌더링 검사는 위 Playwright 결과가 담당한다.

- 마지막 구독 해제 시 storage listener를 제거하고 첫 재구독 시 저장값을 다시 읽는다. 구독자가 없는 동안 다른 탭에서 바꾼 한국어/영어가 복귀 시 반영된다.
- 저장 실패 후 현재 방문에만 유지한 선택은 재구독 시 오래된 저장값으로 덮지 않는다. 저장 성공 후에는 정상 저장 동기화로 돌아간다.
- 잘못된 값·storage clear·다른 키·다른 저장소 영역과 저장소 읽기 차단도 확인했다. 라인업의 실제 API나 별도 운영 의존성을 추가하지 않았다.

### 실제 실행 명령

```sh
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/language-qa.cjs before
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/language-qa.cjs after
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/language-state-qa.cjs
node docs/visual-qa/assets/TASK-FE-025/language-english-audit.cjs
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node /private/tmp/fe025-language-regression.cjs
docker compose -f docker/compose.frontend.yml exec -T frontend node < /private/tmp/fe025-language-store.cjs > docs/visual-qa/assets/TASK-FE-025/language-store-results.json
```

Before는 `0a2c08b` 기준으로 촬영했다. 현재 구현에서 Before를 다시 실행해 기준 자료를 덮어쓰지 않는다. 기존 Playwright/TypeScript 실행 환경을 사용했으며 운영 의존성을 추가하지 않았다.

- [언어 Before 결과](assets/TASK-FE-025/language-before-results.json)
- [한국어/영어 After 결과](assets/TASK-FE-025/language-after-results.json)
- [상태·동기화·반응형 결과](assets/TASK-FE-025/language-state-results.json)
- [영어 본문 잔여 한글 검사](assets/TASK-FE-025/language-english-audit.json)
- [구독 해제·재구독 저장소 단위 결과](assets/TASK-FE-025/language-store-results.json)
- [기존 저장·공유·검색·필터 동작 추가 회귀](assets/TASK-FE-025/language-regression-results.json)

### PC·모바일6화면 비교

| 화면 | PC Before | PC After 한국어 | PC After 영어 | 모바일 Before | 모바일 After 한국어 | 모바일 After 영어 |
|---|---|---|---|---|---|---|
| 홈 | [Before](assets/TASK-FE-025/language-before-1440-home-ko.png) | [한국어](assets/TASK-FE-025/language-after-1440-home-ko.png) | [English](assets/TASK-FE-025/language-after-1440-home-en.png) | [Before](assets/TASK-FE-025/language-before-390-home-ko.png) | [한국어](assets/TASK-FE-025/language-after-390-home-ko.png) | [English](assets/TASK-FE-025/language-after-390-home-en.png) |
| 기존 프로필 | [Before](assets/TASK-FE-025/language-before-1440-legacy-ko.png) | [한국어](assets/TASK-FE-025/language-after-1440-legacy-ko.png) | [English](assets/TASK-FE-025/language-after-1440-legacy-en.png) | [Before](assets/TASK-FE-025/language-before-390-legacy-ko.png) | [한국어](assets/TASK-FE-025/language-after-390-legacy-ko.png) | [English](assets/TASK-FE-025/language-after-390-legacy-en.png) |
| 새 프로필 | [Before](assets/TASK-FE-025/language-before-1440-new-ko.png) | [한국어](assets/TASK-FE-025/language-after-1440-new-ko.png) | [English](assets/TASK-FE-025/language-after-1440-new-en.png) | [Before](assets/TASK-FE-025/language-before-390-new-ko.png) | [한국어](assets/TASK-FE-025/language-after-390-new-ko.png) | [English](assets/TASK-FE-025/language-after-390-new-en.png) |
| 계정 연결 | [Before](assets/TASK-FE-025/language-before-1440-connect-ko.png) | [한국어](assets/TASK-FE-025/language-after-1440-connect-ko.png) | [English](assets/TASK-FE-025/language-after-1440-connect-en.png) | [Before](assets/TASK-FE-025/language-before-390-connect-ko.png) | [한국어](assets/TASK-FE-025/language-after-390-connect-ko.png) | [English](assets/TASK-FE-025/language-after-390-connect-en.png) |
| 개인정보처리방침 | [Before](assets/TASK-FE-025/language-before-1440-privacy-ko.png) | [한국어](assets/TASK-FE-025/language-after-1440-privacy-ko.png) | [English](assets/TASK-FE-025/language-after-1440-privacy-en.png) | [Before](assets/TASK-FE-025/language-before-390-privacy-ko.png) | [한국어](assets/TASK-FE-025/language-after-390-privacy-ko.png) | [English](assets/TASK-FE-025/language-after-390-privacy-en.png) |
| 이용약관 | [Before](assets/TASK-FE-025/language-before-1440-terms-ko.png) | [한국어](assets/TASK-FE-025/language-after-1440-terms-ko.png) | [English](assets/TASK-FE-025/language-after-1440-terms-en.png) | [Before](assets/TASK-FE-025/language-before-390-terms-ko.png) | [한국어](assets/TASK-FE-025/language-after-390-terms-ko.png) | [English](assets/TASK-FE-025/language-after-390-terms-en.png) |

언어 추가분 TypeScript/Lint와 최종 프로덕션 빌드도 PASS했다(컴파일·내부 타입/Lint·정적11페이지). 개발 서버 복원 후 `node /private/tmp/fe025-language-smoke.cjs`의 [8검사](assets/TASK-FE-025/language-smoke-results.json)도 PASS: 모바일 홈 한국어→영어 전환→기존 데모 이동→새로고침 영어 유지→한국어 복귀, 기존20행 및 브라우저 오류0. 기존 정책의 번역을 확인한 작업이며 법률 효력을 새로 검토한 결과는 아니다.


## 4차 추가 — Language 드롭다운 메뉴

### 기준과 촬영 범위

- 3차 한국어·영어 전환 구현의 기존 `EN`/`한국어` 토글을 이번 변경의 Before로 삼았다. 같은 Task/브랜치의 미커밋 언어 구현을 보존한 상태에서 메뉴를 추가했으며, 이전 캡처와 결과는 수정하지 않았다.
- 메뉴 구현 전 PC1440×960/모바일390×844의 홈·기존 프로필·계정 연결을 한국어로 촬영했다. **Before6장, After 한국어6장+영어6장, 총18장**이다. 메뉴가 열린 After 화면에 선택 체크 표시를 함께 기록했다.
- 이번 근거는 `language-menu-*`로 분리했다. Chromium·DPR1·reduced motion에서 글꼴/이미지 로딩 후 전체 페이지를 촬영했다. 현재 구현으로 Before를 재실행해 기준을 덮어쓰지 않는다.

### 시각 검토와 자동 검증

- `language-menu-qa.cjs before`: **PASS,20검사·6캡처**, pageerror0·console error0.
- `language-menu-qa.cjs after`: **PASS,32검사·12캡처**, pageerror0·console error0.
- `language-menu-state-qa.cjs`: **최종 PASS,205검사·24레이아웃**, pageerror0·console/hydration error0. 1440/820/390/320px × 홈/기존 프로필/연결 × 한국어/영어에서 열린 메뉴를 검사했다.
- 모든24상태에서 main1·문서 가로 넘침0, Language/More 버튼과 메뉴의 화면 안 배치, Language와 More 버튼의 비겹침, 현재 언어의 선택 표시를 확인했다.
- PC 영어 연결, 모바일 한국어 홈·영어 연결의 After를 직접 열어 검토했다. 메뉴 글자·선택 체크·상단 계정 버튼에 잘림이나 글자 겹침이 없고, 목록은 헤더 아래에서 본문 위에 정상적으로 겹쳐 열린다. 320px 경계는 자동 좌표 검사로 확인했다.

### 마우스·터치·키보드 및 저장 동작

- Language 버튼의 `aria-haspopup="menu"`, 펼침 상태, `Language` 이름을 가진 menu와 한국어/English 두 menuitemradio, `aria-checked` 선택 상태를 확인했다.
- 마우스 hover로 열고 버튼에서 항목까지 단계적으로 이동해도 유지된다. 내부 키보드 초점이 없는 hover 메뉴는 포인터가 떠나면 닫힌다. hover 후 첫 클릭은 메뉴를 고정하고 다음 클릭은 닫으며, 닫힌 버튼의 클릭으로 다시 열린다.
- 터치로 열기·다시 눌러 닫기·English 선택을 확인했다. 메뉴 밖 pointerdown/touch와 Tab으로 초점이 나가는 경우도 닫힌다.
- 버튼 ArrowDown/ArrowUp은 각각 첫/마지막 항목을 선택 초점으로 연다. 메뉴 내부 화살표 순환, Home/End, Enter 선택, Escape 닫기와 Language 버튼 초점 복귀가 정상이다. 내부 키보드 초점이 있으면 포인터가 떠나도 유지된다.
- 독립 검토에서 hover만으로 열린 메뉴의 외부 초점 Escape 처리를 보완했다. 검색 입력에 초점을 둔 채 hover로 메뉴를 열고 Escape를 누르면 메뉴만 닫히고 입력 초점은 유지되는2검사를 추가해 전체 상태 검사를 다시 통과했다. 화면 변경이 없어 After를 재촬영하지 않았다.
- 선택은 `gameprobe:locale`에 저장되며 실제 연결 페이지 이동·새로고침·새 탭에서 유지된다. 다른 탭에서 한국어를 선택하면 열린 기존 탭에도 반영된다.

초기 하니스는 hover 후 첫 클릭을 즉시 닫힘으로 가정했고, 캡처 반복 시 Escape 뒤 같은 위치에서 hover를 호출해 새 pointerenter가 발생하지 않는 두 경우에 timeout이 있었다. 실제 입력 흐름에 맞춰 **hover→클릭 고정→다음 클릭 닫기**를 검사하고, 반복 캡처는 포인터를 밖으로 옮긴 뒤 재진입하도록 보정했다. 제품 검사를 삭제하거나 실패를 통과로 처리하지 않았으며 최종 캡처/동작을 모두 다시 실행해 PASS했다. 최초 결과는 `/private/tmp/fe025-language-menu-state-first.json`, `/private/tmp/fe025-language-menu-after-first.json`에 보존했다.

### 실제 실행 명령과 결과

저장소 루트에서 기존 Playwright 설치로 실행했다. 운영 의존성을 추가하지 않았다.

```sh
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/language-menu-qa.cjs before
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/language-menu-qa.cjs after
PLAYWRIGHT_MODULES=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-025/language-menu-state-qa.cjs
```

- [메뉴 Before 결과](assets/TASK-FE-025/language-menu-before-results.json)
- [메뉴 After 결과](assets/TASK-FE-025/language-menu-after-results.json)
- [최종 메뉴 동작·저장·반응형 결과](assets/TASK-FE-025/language-menu-state-results.json)
- [화면 캡처 스크립트](assets/TASK-FE-025/language-menu-qa.cjs)
- [메뉴 상태 검증 스크립트](assets/TASK-FE-025/language-menu-state-qa.cjs)

구현 담당자가 언어 목록 중앙화 후 다시 실행한 [저장소 단위22검사](assets/TASK-FE-025/language-menu-store-results.json)도 PASS다. 이전 구독 해제·재등록, 저장 실패 시 현재 방문 선택 보존, 잘못된 값과 저장 이벤트 처리가 유지된다.

### PC·모바일 메뉴 비교

| 화면 | Before 한국어 토글 | After 한국어 선택 | After English 선택 |
|---|---|---|---|
| PC1440 홈 | [Before](assets/TASK-FE-025/language-menu-before-1440-home-ko.png) | [한국어](assets/TASK-FE-025/language-menu-after-1440-home-ko-open.png) | [English](assets/TASK-FE-025/language-menu-after-1440-home-en-open.png) |
| PC1440 기존 프로필 | [Before](assets/TASK-FE-025/language-menu-before-1440-profile-ko.png) | [한국어](assets/TASK-FE-025/language-menu-after-1440-profile-ko-open.png) | [English](assets/TASK-FE-025/language-menu-after-1440-profile-en-open.png) |
| PC1440 연결 | [Before](assets/TASK-FE-025/language-menu-before-1440-connect-ko.png) | [한국어](assets/TASK-FE-025/language-menu-after-1440-connect-ko-open.png) | [English](assets/TASK-FE-025/language-menu-after-1440-connect-en-open.png) |
| 모바일390 홈 | [Before](assets/TASK-FE-025/language-menu-before-390-home-ko.png) | [한국어](assets/TASK-FE-025/language-menu-after-390-home-ko-open.png) | [English](assets/TASK-FE-025/language-menu-after-390-home-en-open.png) |
| 모바일390 기존 프로필 | [Before](assets/TASK-FE-025/language-menu-before-390-profile-ko.png) | [한국어](assets/TASK-FE-025/language-menu-after-390-profile-ko-open.png) | [English](assets/TASK-FE-025/language-menu-after-390-profile-en-open.png) |
| 모바일390 연결 | [Before](assets/TASK-FE-025/language-menu-before-390-connect-ko.png) | [한국어](assets/TASK-FE-025/language-menu-after-390-connect-ko-open.png) | [English](assets/TASK-FE-025/language-menu-after-390-connect-en-open.png) |

### Language 메뉴 최종 빌드·서버 복원

TypeScript/Lint와 최종 프로덕션 빌드 PASS(컴파일·내부 타입/Lint·정적11페이지). 개발 서버 복원 후 `node /private/tmp/fe025-language-menu-smoke.cjs`의 [8검사](assets/TASK-FE-025/language-menu-smoke-results.json)도 PASS했다. 모바일 홈의 Language 선택→영어→기존 데모 이동→새로고침 유지→한국어 복귀, 기존20행과 브라우저 오류0을 확인했다. 소스 검토에서 보완한 외부 초점 Escape는 최종205검사에 포함된다.
