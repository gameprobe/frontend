# TASK-FE-015 Visual QA

## 기준과 결과

- 2026-09-20, 기준 `e4f78bf`(PR #7), 작업 브랜치 `codex/profile-header-components`.
- P02/P03 프로필 배너·탭, P04 프로모션, P05 시즌 필터를 분리하며 기존 화면·동작을 유지한다.
- **PASS**: 56조건의 전체 main DOM·좌표·23개 계산 스타일·접근성/이미지 속성 동일.
  페이지 가로 넘침0, main1개, pageerror0.
- 기본18개+시즌 경계11개+상단7개, 총36개 동작 PASS. Mock·타입·Lint·production build PASS.
- PNG24쌍 중23쌍 완전 동일. 전체 모바일 프로필1쌍만3픽셀·최대 RGB채널1 차이.
  차이는 아래에 그대로 기록하며 전체 동일이라고 간주하지 않는다.
- [기계 판독 결과](assets/TASK-FE-015/verification.json).

## 촬영 조건과 비교 범위

Playwright Chromium headless, 배율100%, DPR1. 데스크톱1920×960, 모바일390×844.
동일 브라우저에서 폰트·이미지 준비, 마우스·포커스·스크롤·애니메이션 상태를 정리했다.
저장/갱신 캡처에서는 일시적인 토스트를 닫은 뒤 비교했다. 사용자 브라우저는 변경하지 않았다.

- 21너비: 320/390/480/481/700/701/768/800/801/850/851/1000/1001/1100/1101/1250/1251/1440/1499/1500/1920px.
- 홈·프로필 기본21조건씩42조건, 저장+갱신/Performance/All Acts/Console/Deathmatch/빈 시즌/요원 필터 각 desktop·mobile14조건, 총56조건.
- 전체 main의 태그/텍스트/좌표/23개 계산 스타일과 이미지·접근성·SVG 속성을 비교했다. 영역 제외나 픽셀 마스크는 없다.
- CSS445단위를 독립 검토했다. Act와 부모 Select 연결 selector2종 및 원래 공통 모바일 padding에 덮이던 무효 padding-left12px 제거를 예외로 기록한다. 실제 모바일 값10px는 유지된다.

## Before / After

| 화면·상태 | Before | After | 변경 픽셀 |
|---|---|---|---|
| desktop-all-acts | [Before](assets/TASK-FE-015/before-desktop-all-acts.png) | [After](assets/TASK-FE-015/after-desktop-all-acts.png) | 0 |
| desktop-console | [Before](assets/TASK-FE-015/before-desktop-console.png) | [After](assets/TASK-FE-015/after-desktop-console.png) | 0 |
| desktop-deathmatch | [Before](assets/TASK-FE-015/before-desktop-deathmatch.png) | [After](assets/TASK-FE-015/after-desktop-deathmatch.png) | 0 |
| desktop-empty | [Before](assets/TASK-FE-015/before-desktop-empty.png) | [After](assets/TASK-FE-015/after-desktop-empty.png) | 0 |
| desktop-filtered-season | [Before](assets/TASK-FE-015/before-desktop-filtered-season.png) | [After](assets/TASK-FE-015/after-desktop-filtered-season.png) | 0 |
| desktop-performance-tab | [Before](assets/TASK-FE-015/before-desktop-performance-tab.png) | [After](assets/TASK-FE-015/after-desktop-performance-tab.png) | 0 |
| desktop-saved-refreshed | [Before](assets/TASK-FE-015/before-desktop-saved-refreshed.png) | [After](assets/TASK-FE-015/after-desktop-saved-refreshed.png) | 0 |
| home-desktop | [Before](assets/TASK-FE-015/before-home-desktop.png) | [After](assets/TASK-FE-015/after-home-desktop.png) | 0 |
| home-mobile | [Before](assets/TASK-FE-015/before-home-mobile.png) | [After](assets/TASK-FE-015/after-home-mobile.png) | 0 |
| mobile-all-acts | [Before](assets/TASK-FE-015/before-mobile-all-acts.png) | [After](assets/TASK-FE-015/after-mobile-all-acts.png) | 0 |
| mobile-console | [Before](assets/TASK-FE-015/before-mobile-console.png) | [After](assets/TASK-FE-015/after-mobile-console.png) | 0 |
| mobile-deathmatch | [Before](assets/TASK-FE-015/before-mobile-deathmatch.png) | [After](assets/TASK-FE-015/after-mobile-deathmatch.png) | 0 |
| mobile-empty | [Before](assets/TASK-FE-015/before-mobile-empty.png) | [After](assets/TASK-FE-015/after-mobile-empty.png) | 0 |
| mobile-filtered-season | [Before](assets/TASK-FE-015/before-mobile-filtered-season.png) | [After](assets/TASK-FE-015/after-mobile-filtered-season.png) | 0 |
| mobile-performance-tab | [Before](assets/TASK-FE-015/before-mobile-performance-tab.png) | [After](assets/TASK-FE-015/after-mobile-performance-tab.png) | 0 |
| mobile-saved-refreshed | [Before](assets/TASK-FE-015/before-mobile-saved-refreshed.png) | [After](assets/TASK-FE-015/after-mobile-saved-refreshed.png) | 0 |
| profile-desktop-filters | [Before](assets/TASK-FE-015/before-profile-desktop-filters.png) | [After](assets/TASK-FE-015/after-profile-desktop-filters.png) | 0 |
| profile-desktop-header | [Before](assets/TASK-FE-015/before-profile-desktop-header.png) | [After](assets/TASK-FE-015/after-profile-desktop-header.png) | 0 |
| profile-desktop-promo | [Before](assets/TASK-FE-015/before-profile-desktop-promo.png) | [After](assets/TASK-FE-015/after-profile-desktop-promo.png) | 0 |
| profile-desktop | [Before](assets/TASK-FE-015/before-profile-desktop.png) | [After](assets/TASK-FE-015/after-profile-desktop.png) | 0 |
| profile-mobile-filters | [Before](assets/TASK-FE-015/before-profile-mobile-filters.png) | [After](assets/TASK-FE-015/after-profile-mobile-filters.png) | 0 |
| profile-mobile-header | [Before](assets/TASK-FE-015/before-profile-mobile-header.png) | [After](assets/TASK-FE-015/after-profile-mobile-header.png) | 0 |
| profile-mobile-promo | [Before](assets/TASK-FE-015/before-profile-mobile-promo.png) | [After](assets/TASK-FE-015/after-profile-mobile-promo.png) | 0 |
| profile-mobile | [Before](assets/TASK-FE-015/before-profile-mobile.png) | [After](assets/TASK-FE-015/after-profile-mobile.png) | 3 |

추가 키보드 캡처: [홈](assets/TASK-FE-015/after-home-keyboard-focus.png),
[프로필](assets/TASK-FE-015/after-profile-keyboard-focus.png). 총50장.

## 픽셀 차이와 정성 평가

전체 모바일 프로필의 캡처 크기는 양쪽390×7388로 같다. 차이 bounding box는
`[15,464,18,465]`이며 프로모션 바깥 박스 왼쪽 위 둥근 모서리의3픽셀이다.
RGB는 `(21,28,35)→(20,27,35)`, `(17,24,31)→(17,23,30)`, `(12,18,25)→(12,18,24)`다.
채널 최대 차이는1이며 해당 프로모션 영역만 촬영한 이미지에는 차이가 없다.
독립 시각 검토 결과 글자·내용 색·여백 회귀가 아닌 모서리의 미세한 렌더링 차이로 판단했다.

독립 검토자는 배너·프로모션·필터 desktop/mobile6쌍을 직접 보며 비교했다.
배너 이미지·이름·저장/공유/갱신 버튼·탭, 프로모션 글자·버튼, 필터의 정렬·여백·색이 유지된다.
새 겹침·잘림은 발견하지 못했다. 모바일 탭과 모드의 화면 밖 항목은 기존 내부 가로 스크롤이다.
이 검토는 정식 Cursor 리뷰 및 사용자 검토를 대체하지 않는다.

## 동작 검증

- 기본18개: 검색 hover/키보드 포커스, 홈 More/Escape, 데모 이동, 프로필 검색 안내·토스트,
  프로필 More, 링크·Mock 안내 닫기, sticky 내비, 6탭, 요원·승패·Act, 경기 펼침·상세 초기화,
  20→23경기, 빈 상태 Reset, 즐겨찾기 재방문, 홈/프로필→라인업 공용 스타일 복원.
- 시즌 경계11개: 경기 필터와 시즌 집계 분리, 다른 조건 유지 요원 선택, Show More 지속,
  All Acts/플랫폼, Deathmatch 수치 명칭, 빈 시즌/요원/점수, Reset, Mock 갱신, 공유 성공/실패,
  모바일 표 스크롤, 저장소 차단 시 안내.
- 상단7개: 저장 버튼 키보드/재방문, 프로필 탭이 표시 개수를 보존하며 경기 펼침 닫기,
  프로모션 Performance 이동 시 경기 필터 유지, All Acts·5모드의 선택 상태,
  Act 포커스/옵션 변경·시즌 초기화, 다른 데모 이름·사용자별 저장 키, 모바일 탭/모드 키보드 스크롤.

Act 네이티브 메뉴의 End/Arrow 키 자동화는 이 headless 환경에서 값을 바꾸지 못했다.
이를 성공으로 기록하지 않고 포커스 및 Playwright selectOption으로 change 연결을 확인했다.
버튼의 Space/Enter 동작은 실제 키보드 이벤트로 확인했다.

## 검증 중 수정

첫 After 비교에서 모드 버튼의 aria-pressed 누락과 모바일 Act 왼쪽 여백12px를 발견했다.
선택 속성을 복원하고 원래 계산값10px를 유지하도록 CSS 연결을 수정했다.
최종56조건 비교·캡처는 이 수정 이후의 결과이며 화면 차이를 비교에서 제외하지 않았다.

## 명령과 결과

```sh
# 번들 Node로 실행한 임시 Playwright 검사
node /tmp/fe015-visual.cjs before
node /tmp/fe015-visual.cjs after
node /tmp/fe015-interactions.cjs
node /tmp/fe015-summary-interactions.cjs
node /tmp/fe015-header-interactions.cjs

docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
docker compose -f docker/compose.frontend.yml ps
git diff --check
```

Mock/타입 PASS, Lint0경고0오류, production build 정적11페이지 PASS. 개발 서버 재실행 완료.
컨테이너의 기존 git 부재 메시지는 빌드 정보 fallback이며 빌드 실패가 아니다.
Python/Pillow로24쌍을 대조했다. 임시 스크립트는 `/tmp`, 캡처와 결과 JSON은 저장소에 보관한다.

## 유지한 범위

공통 Search 헤더·홈·요약 컴포넌트·사이드바·경기 목록·이미지 파일과 선택·Mock 산식은 유지한다.
프로필 상태·저장/공유/알림·집계·Select helper는 부모에 남아 있다. 실제 API/Overwolf는 미연결이다.
