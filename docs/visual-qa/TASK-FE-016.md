# TASK-FE-016 Visual QA

## 기준과 결과

- 2026-09-20, 기준 `9e84346`(PR #8), 작업 브랜치 `codex/profile-sidebar-components`.
- S01~S06 사이드바를 `ProfileSidebar`와 카드5개·전용 CSS로 분리하며 기존 화면·동작을 유지한다.
- **PASS**: 56조건의 전체 main DOM·좌표·23개 계산 스타일·접근성/이미지/SVG 속성이 동일하다.
  페이지 가로 넘침0, main1개, pageerror0.
- **PNG26쌍 전부 픽셀 차이0**. 키보드2장 포함 총54장.
- 기존 동작36개와 사이드바10개, **총46개 동작 PASS**. 사이드바14상태의 Before/After도 동일하다.
- Mock·타입 검사·Lint·production build PASS(정적11페이지). 개발 서버 복원 후 프로필 HTTP200 확인.
- [기계 판독 결과](assets/TASK-FE-016/verification.json), [Task와 전체 검증 결과](../tasks/TASK-FE-016.md).

## 촬영 조건과 비교 범위

Playwright Chromium headless, 배율100%, DPR1. 데스크톱1920×960, 모바일390×844.
Before는 소스 변경 전에 기록했고, 폰트·이미지 준비와 포커스·스크롤·애니메이션 상태를 통일했다.
저장/갱신 상태에서는 일시적인 토스트를 닫은 뒤 비교했다. 사용자 브라우저는 변경하지 않았다.

- 21너비: 320/390/480/481/700/701/768/800/801/850/851/1000/1001/1100/1101/1250/1251/1440/1499/1500/1920px.
- 홈·프로필 기본21조건씩42조건, 저장+갱신/Performance/All Acts/Console/Deathmatch/빈 시즌/요원 필터 각 desktop·mobile14조건, 총56조건.
- 전체 main의 태그·말단 텍스트·좌표·23개 계산 스타일, 이미지·접근성·SVG 경로/점 속성을 비교했다.
  CSS 모듈 클래스 이름 자체는 비교하지 않으며 영역 제외·픽셀 마스크는 없다.
- 기본 사이드바·명중 부위·무기·맵의8개 영역은 각 단계의 전체 페이지 원본과 당시 측정한 영역 좌표에서 잘랐다.
  긴 영역을 별도 캡처할 때 sticky 내비게이션이 겹쳐 들어오는 촬영 현상을 피하기 위한 방법이며 이미지 내용을 수정하지 않았다.
- 상태별 긴 사이드바14쌍 중 일부는 locator 스크롤 과정에서 sticky 내비게이션이 포함된다.
  Before/After에 동일하게 포함되며, 기본 전체 페이지/영역 이미지와 전체 DOM·스타일 비교로 보완했다.
  이를 새 겹침 현상이나 해당 부분이 가려지지 않았다는 근거로 해석하지 않는다.

## Before / After

| 화면·상태 | Before | After | 변경 픽셀 |
|---|---|---|---|
| desktop-all-acts | [Before](assets/TASK-FE-016/before-desktop-all-acts.png) | [After](assets/TASK-FE-016/after-desktop-all-acts.png) | 0 |
| desktop-console | [Before](assets/TASK-FE-016/before-desktop-console.png) | [After](assets/TASK-FE-016/after-desktop-console.png) | 0 |
| desktop-deathmatch | [Before](assets/TASK-FE-016/before-desktop-deathmatch.png) | [After](assets/TASK-FE-016/after-desktop-deathmatch.png) | 0 |
| desktop-empty | [Before](assets/TASK-FE-016/before-desktop-empty.png) | [After](assets/TASK-FE-016/after-desktop-empty.png) | 0 |
| desktop-filtered-season | [Before](assets/TASK-FE-016/before-desktop-filtered-season.png) | [After](assets/TASK-FE-016/after-desktop-filtered-season.png) | 0 |
| desktop-performance-tab | [Before](assets/TASK-FE-016/before-desktop-performance-tab.png) | [After](assets/TASK-FE-016/after-desktop-performance-tab.png) | 0 |
| desktop-saved-refreshed | [Before](assets/TASK-FE-016/before-desktop-saved-refreshed.png) | [After](assets/TASK-FE-016/after-desktop-saved-refreshed.png) | 0 |
| home-desktop | [Before](assets/TASK-FE-016/before-home-desktop.png) | [After](assets/TASK-FE-016/after-home-desktop.png) | 0 |
| home-mobile | [Before](assets/TASK-FE-016/before-home-mobile.png) | [After](assets/TASK-FE-016/after-home-mobile.png) | 0 |
| mobile-all-acts | [Before](assets/TASK-FE-016/before-mobile-all-acts.png) | [After](assets/TASK-FE-016/after-mobile-all-acts.png) | 0 |
| mobile-console | [Before](assets/TASK-FE-016/before-mobile-console.png) | [After](assets/TASK-FE-016/after-mobile-console.png) | 0 |
| mobile-deathmatch | [Before](assets/TASK-FE-016/before-mobile-deathmatch.png) | [After](assets/TASK-FE-016/after-mobile-deathmatch.png) | 0 |
| mobile-empty | [Before](assets/TASK-FE-016/before-mobile-empty.png) | [After](assets/TASK-FE-016/after-mobile-empty.png) | 0 |
| mobile-filtered-season | [Before](assets/TASK-FE-016/before-mobile-filtered-season.png) | [After](assets/TASK-FE-016/after-mobile-filtered-season.png) | 0 |
| mobile-performance-tab | [Before](assets/TASK-FE-016/before-mobile-performance-tab.png) | [After](assets/TASK-FE-016/after-mobile-performance-tab.png) | 0 |
| mobile-saved-refreshed | [Before](assets/TASK-FE-016/before-mobile-saved-refreshed.png) | [After](assets/TASK-FE-016/after-mobile-saved-refreshed.png) | 0 |
| profile-desktop-accuracy | [Before](assets/TASK-FE-016/before-profile-desktop-accuracy.png) | [After](assets/TASK-FE-016/after-profile-desktop-accuracy.png) | 0 |
| profile-desktop-maps | [Before](assets/TASK-FE-016/before-profile-desktop-maps.png) | [After](assets/TASK-FE-016/after-profile-desktop-maps.png) | 0 |
| profile-desktop-sidebar | [Before](assets/TASK-FE-016/before-profile-desktop-sidebar.png) | [After](assets/TASK-FE-016/after-profile-desktop-sidebar.png) | 0 |
| profile-desktop-weapons | [Before](assets/TASK-FE-016/before-profile-desktop-weapons.png) | [After](assets/TASK-FE-016/after-profile-desktop-weapons.png) | 0 |
| profile-desktop | [Before](assets/TASK-FE-016/before-profile-desktop.png) | [After](assets/TASK-FE-016/after-profile-desktop.png) | 0 |
| profile-mobile-accuracy | [Before](assets/TASK-FE-016/before-profile-mobile-accuracy.png) | [After](assets/TASK-FE-016/after-profile-mobile-accuracy.png) | 0 |
| profile-mobile-maps | [Before](assets/TASK-FE-016/before-profile-mobile-maps.png) | [After](assets/TASK-FE-016/after-profile-mobile-maps.png) | 0 |
| profile-mobile-sidebar | [Before](assets/TASK-FE-016/before-profile-mobile-sidebar.png) | [After](assets/TASK-FE-016/after-profile-mobile-sidebar.png) | 0 |
| profile-mobile-weapons | [Before](assets/TASK-FE-016/before-profile-mobile-weapons.png) | [After](assets/TASK-FE-016/after-profile-mobile-weapons.png) | 0 |
| profile-mobile | [Before](assets/TASK-FE-016/before-profile-mobile.png) | [After](assets/TASK-FE-016/after-profile-mobile.png) | 0 |

추가 키보드 캡처: [홈](assets/TASK-FE-016/after-home-keyboard-focus.png),
[프로필](assets/TASK-FE-016/after-profile-keyboard-focus.png).

## 정성 평가

기본 desktop/mobile 사이드바를 Before/After로 직접 비교했다. 랭크 이미지와 텍스트 위계,
카드 사이 여백, 인체 SVG 형상·부위 색, 명중 그래프, 역할 통계 정렬, 무기·맵 이미지와 버튼이 유지된다.
모바일에서 S02 프로모션이 숨겨지는 기존 동작도 같다. 새 글자 겹침·잘림·정렬 붕괴는 발견하지 못했다.
빈 시즌과 Deathmatch After도 확인했으며, 해당 상태 수치와 화면 크기는 Before 결과와 동일하다.

이 결과는 작업자가 수행한 자동·시각 검증이다. 정식 Cursor 리뷰 및 사용자 검토를 대체하지 않는다.

## 동작 검증

사이드바10개:

1. S01~S06 순서와 기존 명중 그래프 접근성 이름 유지.
2. S02 `View performance` Enter로 이동하고 펼친 경기를 닫음. 복귀 시23개 표시 수는 유지.
3. S05 무기 버튼 Space로 경기 목록 이동. 요원·승패 조건 유지, 펼침 초기화, 시즌 통계는 유지.
4. S06 맵 버튼 Enter로 선택. 무기·요원·승패 조건과 사이드바 시즌 통계 유지.
5. `View All Weapons` 탭 이동 후 복귀해도 경기 필터 유지.
6. `View All Maps` Space 동작과 경기 필터 유지.
7. 사이드바 필터 변경 후 표시 수20개로 초기화.
8. Act/All Acts/Console/Deathmatch/빈 시즌이 사이드바 통계를 변경하고 예시 랭크는 유지.
9. 빈 시즌의 Head/Body/Legs·역할·무기 수치0, 맵 행 없음. Reset으로 기본값 복원.
10. 모바일 `View All Weapons` Enter 동작·포커스 유지·페이지 가로 넘침 없음.

위 순서 중 기록한14상태는 사이드바 전체 텍스트·select 값·선택된 탭·경기/펼침 개수를
Before/After로 비교해 모두 동일함을 확인했다.

기존 회귀36개:

- 기본18개: 검색 hover/포커스, 홈 More/Escape, 데모 이동, 프로필 검색 안내·토스트,
  프로필 More, 링크·Mock 안내 닫기, sticky 내비, 6탭, 요원·승패·Act, 경기 펼침·상세 초기화,
  20→23경기, 빈 상태 Reset, 즐겨찾기 재방문, 홈/프로필→라인업 공용 스타일 복원.
- 시즌 경계11개: 경기 필터와 시즌 집계 분리, 다른 조건 유지 요원 선택, Show More 지속,
  All Acts/플랫폼, Deathmatch 명칭, 빈 시즌·요원·점수, Reset, Mock 갱신, 공유 성공/실패,
  모바일 표 스크롤, 저장소 차단 시 안내.
- 상단7개: 저장 버튼 키보드/재방문, 프로필 탭의 표시 수 보존과 펼침 닫기,
  프로모션 Performance 이동 시 필터 유지, All Acts·5모드 선택 상태,
  Act 포커스/옵션 change·시즌 초기화, 다른 데모 이름·사용자별 저장 키, 모바일 탭/모드 키보드 스크롤.

Act 네이티브 팝업에서 방향키로 값을 선택하는 동작은 검증했다고 주장하지 않는다.
기존 스크립트의 포커스와 Playwright selectOption change 연결을 확인했다.
버튼의 Space/Enter 동작은 실제 키보드 이벤트로 확인했다.

## 명령과 실행 기록

```sh
node /tmp/fe016-visual.cjs before
node /tmp/fe016-sidebar-interactions.cjs before
node /tmp/fe016-visual.cjs after
node /tmp/fe016-sidebar-interactions.cjs after
node /tmp/fe016-interactions.cjs
node /tmp/fe016-summary-interactions.cjs
node /tmp/fe016-header-interactions.cjs
python3 /tmp/fe016-crop.py before
python3 /tmp/fe016-crop.py after
python3 /tmp/fe016-pixels.py

docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
```

번들 Node·Python/Pillow로 실행했다. 첫 기본 샌드박스의 Chromium 시작은 macOS 포트 권한 때문에 실패해
승인된 실행 환경에서 진행했다. Before 동작 스크립트의 `Date` 이름은 관찰한 실제 `Date range`로 고쳐 완료했다.
앱 수정 전의 검사 설정 수정이며 After에서는46개 모두 첫 실행에 통과했다.
After DOM·이미지 비교에서 회귀는 없었고 앱 소스에 추가 수정을 요구하지 않았다.

Playwright 종료 후 주 구현자가 Mock·타입·Lint·build를 실행했다. 모두 통과했으며 Lint 경고/오류0,
정적11페이지 빌드 완료와 개발 서버 복원 후 프로필 HTTP200을 확인했다. 컨테이너의 기존
`git: not found` 메시지는 빌드 정보 fallback이며 빌드 실패가 아니다. After 검사 이후 소스 변경은 없다.

## 유지한 범위

예시 랭크, Body/Legs 임시 계산, 역할별 첫 표본 사용, 대표 무기 통계의 의미는 그대로다.
기존 이미지 경로와 인체 SVG를 유지하며 상태·필터·탭 전환·집계·공유 그래프는 부모에 남겨 두었다.
경기 목록·상단/요약·홈·공통 헤더·라인업·API/Overwolf 구현은 이번 변경 범위에 포함하지 않는다.
