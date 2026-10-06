# TASK-FE-017 Visual QA

## 기준과 결과

- 2026-09-20, 기준 `eac0cbf`(PR #9), 작업 브랜치 `codex/profile-match-history-components`.
- M01~M05 경기 필터·최근 요약/스트립·날짜 그룹/경기 행·상세·빈 상태/더 보기를 표시 컴포넌트로 분리하고 기존 외형·동작을 유지한다.
- **PASS**: 기존56조건+경기30상태, 총86조건의 전체 main DOM·문서 기준 좌표·23개 계산 스타일·접근성·이미지/SVG가 동일하다.
  페이지 가로 넘침0, main1개, pageerror0. 경기30상태에서는 id와 aria-controls 연결도 비교했다.
- **PNG30쌍 전부 픽셀 차이0**. 키보드2장을 포함해 총62장이다.
- 기존 회귀46개+경기11시나리오×desktop/mobile22개, **총68개 동작 PASS**.
  사이드바와 연결된14상태 Before/After도 동일하다.
- Mock·타입·Lint(경고/오류0)·production build(정적11페이지) PASS. 개발 서버 복원 후 프로필 HTTP200.
- [기계 판독 결과](assets/TASK-FE-017/verification.json), [Task와 전체 검증 결과](../tasks/TASK-FE-017.md).

## 촬영과 비교 범위

Playwright Chromium headless, 배율100%, DPR1. 데스크톱1920×960, 모바일390×844.
Before 저장 전후 소스 diff가 없음을 확인했다. 폰트·이미지 준비와 포커스·스크롤·애니메이션 상태를 통일했다.
저장/갱신 상태의 일시적인 토스트는 닫은 뒤 비교했으며 사용자 브라우저는 변경하지 않았다.

- 기본21너비: 320/390/480/481/700/701/768/800/801/850/851/1000/1001/1100/1101/1250/1251/1440/1499/1500/1920px.
- 홈·프로필 기본42조건+저장/갱신·Performance·All Acts·Console·Deathmatch·빈 시즌·요원 필터 desktop/mobile14조건=56조건.
- 경기15상태×desktop/mobile=30조건: 기본 Overview, 상세 Overview, 상세 Performance,
  다른 경기 재펼침, 스트립 선택, All Matches, Load more, More/승패/날짜 필터,
  경기 조건 빈 결과, 해당 조건 Reset, Deathmatch 상세, 빈 시즌, 시즌 Reset,
  안내 배너 닫기, 다른 프로필 이름의 상세.
- 전체 main의 태그·말단 텍스트·좌표·계산 스타일 및 이미지/접근성/SVG를 비교했다.
  CSS 모듈 클래스 이름은 직접 비교하지 않으며 영역 제외나 픽셀 마스크는 없다.
- 홈/프로필 기본 전체 페이지4쌍과 경기 영역26쌍을 보관한다. 재펼침/시즌 Reset4조건은
  전체 DOM/스타일/좌표로 비교하고 별도 이미지를 중복 저장하지 않았다.
- 경기 영역 이미지는 전체 페이지 원본과 당시 측정한 좌표에서 잘랐다. 글자·색·내용은 수정하지 않았다.
  긴 영역의 locator 촬영 시 sticky 내비가 끼어드는 문제를 피했으며 원본은 `/tmp`에 보관했다.

## 스크롤 측정 보정과 CSS 검토

첫 After의 스트립 선택2상태는 화면 이동 애니메이션이 조금 남아 모든 보이는 요소가 같은1px만큼 이동해 있었다.
Before desktop/mobile의 main y는 각각 -7/-5px였고 첫 After는 -8/-4px였다.
원본 측정은 보존하고 Before는 각각7/5px, 최종 After는8/4px를 더해 양쪽을 문서 기준 좌표로 환산했다.
해당 상태에 fixed 요소가 없고 sticky 헤더도 고정 경계에 도달하지 않았음을 확인했으며,
0크기 숨김 요소를 제외한 모든 요소에 같은 좌표 변환을 적용했다. 비교에서 요소를 빼거나 오차 허용 폭을 두지 않았다.
After에 `scrollTo`의 instant 호출을 추가했지만 이 두 상태는 위 잔여 offset이 남아 양쪽에 같은 변환 규칙을 적용했다.
smooth/center 호출 자체는 원래 메서드에 전달된 인수를 기록해 별도로 검증했다.
해당 캡처도 당시 문서 좌표로 잘랐으며, 최종30쌍의 픽셀이 모두 동일하다. 앱 코드 수정은 필요하지 않았다.

독립 CSS 검토에서 원래259규칙을 부모91/경기168로 나눴으며 selector·선언·반응형 순서가 보존되었다.
교차 모듈 selector4개는 marker 클래스로 연결했다. 모바일 경기 그룹의 실제 border-radius는
Before/After 모두10px이며 다른 계산 스타일과 함께 비교했다.

## Before / After

| 화면·상태 | Before | After | 변경 픽셀 |
|---|---|---|---|
| home-desktop | [Before](assets/TASK-FE-017/before-home-desktop.png) | [After](assets/TASK-FE-017/after-home-desktop.png) | 0 |
| home-mobile | [Before](assets/TASK-FE-017/before-home-mobile.png) | [After](assets/TASK-FE-017/after-home-mobile.png) | 0 |
| matches-desktop-all-matches | [Before](assets/TASK-FE-017/before-matches-desktop-all-matches.png) | [After](assets/TASK-FE-017/after-matches-desktop-all-matches.png) | 0 |
| matches-desktop-alternate-identity | [Before](assets/TASK-FE-017/before-matches-desktop-alternate-identity.png) | [After](assets/TASK-FE-017/after-matches-desktop-alternate-identity.png) | 0 |
| matches-desktop-banner-dismissed | [Before](assets/TASK-FE-017/before-matches-desktop-banner-dismissed.png) | [After](assets/TASK-FE-017/after-matches-desktop-banner-dismissed.png) | 0 |
| matches-desktop-deathmatch-performance | [Before](assets/TASK-FE-017/before-matches-desktop-deathmatch-performance.png) | [After](assets/TASK-FE-017/after-matches-desktop-deathmatch-performance.png) | 0 |
| matches-desktop-detail-overview | [Before](assets/TASK-FE-017/before-matches-desktop-detail-overview.png) | [After](assets/TASK-FE-017/after-matches-desktop-detail-overview.png) | 0 |
| matches-desktop-detail-performance | [Before](assets/TASK-FE-017/before-matches-desktop-detail-performance.png) | [After](assets/TASK-FE-017/after-matches-desktop-detail-performance.png) | 0 |
| matches-desktop-empty-match-filters | [Before](assets/TASK-FE-017/before-matches-desktop-empty-match-filters.png) | [After](assets/TASK-FE-017/after-matches-desktop-empty-match-filters.png) | 0 |
| matches-desktop-empty-season | [Before](assets/TASK-FE-017/before-matches-desktop-empty-season.png) | [After](assets/TASK-FE-017/after-matches-desktop-empty-season.png) | 0 |
| matches-desktop-filters-date | [Before](assets/TASK-FE-017/before-matches-desktop-filters-date.png) | [After](assets/TASK-FE-017/after-matches-desktop-filters-date.png) | 0 |
| matches-desktop-load-more | [Before](assets/TASK-FE-017/before-matches-desktop-load-more.png) | [After](assets/TASK-FE-017/after-matches-desktop-load-more.png) | 0 |
| matches-desktop-overview | [Before](assets/TASK-FE-017/before-matches-desktop-overview.png) | [After](assets/TASK-FE-017/after-matches-desktop-overview.png) | 0 |
| matches-desktop-reset-match-filters | [Before](assets/TASK-FE-017/before-matches-desktop-reset-match-filters.png) | [After](assets/TASK-FE-017/after-matches-desktop-reset-match-filters.png) | 0 |
| matches-desktop-strip-selection | [Before](assets/TASK-FE-017/before-matches-desktop-strip-selection.png) | [After](assets/TASK-FE-017/after-matches-desktop-strip-selection.png) | 0 |
| matches-mobile-all-matches | [Before](assets/TASK-FE-017/before-matches-mobile-all-matches.png) | [After](assets/TASK-FE-017/after-matches-mobile-all-matches.png) | 0 |
| matches-mobile-alternate-identity | [Before](assets/TASK-FE-017/before-matches-mobile-alternate-identity.png) | [After](assets/TASK-FE-017/after-matches-mobile-alternate-identity.png) | 0 |
| matches-mobile-banner-dismissed | [Before](assets/TASK-FE-017/before-matches-mobile-banner-dismissed.png) | [After](assets/TASK-FE-017/after-matches-mobile-banner-dismissed.png) | 0 |
| matches-mobile-deathmatch-performance | [Before](assets/TASK-FE-017/before-matches-mobile-deathmatch-performance.png) | [After](assets/TASK-FE-017/after-matches-mobile-deathmatch-performance.png) | 0 |
| matches-mobile-detail-overview | [Before](assets/TASK-FE-017/before-matches-mobile-detail-overview.png) | [After](assets/TASK-FE-017/after-matches-mobile-detail-overview.png) | 0 |
| matches-mobile-detail-performance | [Before](assets/TASK-FE-017/before-matches-mobile-detail-performance.png) | [After](assets/TASK-FE-017/after-matches-mobile-detail-performance.png) | 0 |
| matches-mobile-empty-match-filters | [Before](assets/TASK-FE-017/before-matches-mobile-empty-match-filters.png) | [After](assets/TASK-FE-017/after-matches-mobile-empty-match-filters.png) | 0 |
| matches-mobile-empty-season | [Before](assets/TASK-FE-017/before-matches-mobile-empty-season.png) | [After](assets/TASK-FE-017/after-matches-mobile-empty-season.png) | 0 |
| matches-mobile-filters-date | [Before](assets/TASK-FE-017/before-matches-mobile-filters-date.png) | [After](assets/TASK-FE-017/after-matches-mobile-filters-date.png) | 0 |
| matches-mobile-load-more | [Before](assets/TASK-FE-017/before-matches-mobile-load-more.png) | [After](assets/TASK-FE-017/after-matches-mobile-load-more.png) | 0 |
| matches-mobile-overview | [Before](assets/TASK-FE-017/before-matches-mobile-overview.png) | [After](assets/TASK-FE-017/after-matches-mobile-overview.png) | 0 |
| matches-mobile-reset-match-filters | [Before](assets/TASK-FE-017/before-matches-mobile-reset-match-filters.png) | [After](assets/TASK-FE-017/after-matches-mobile-reset-match-filters.png) | 0 |
| matches-mobile-strip-selection | [Before](assets/TASK-FE-017/before-matches-mobile-strip-selection.png) | [After](assets/TASK-FE-017/after-matches-mobile-strip-selection.png) | 0 |
| profile-desktop | [Before](assets/TASK-FE-017/before-profile-desktop.png) | [After](assets/TASK-FE-017/after-profile-desktop.png) | 0 |
| profile-mobile | [Before](assets/TASK-FE-017/before-profile-mobile.png) | [After](assets/TASK-FE-017/after-profile-mobile.png) | 0 |

키보드 추가 캡처: [홈](assets/TASK-FE-017/after-home-keyboard-focus.png),
[프로필](assets/TASK-FE-017/after-profile-keyboard-focus.png).

## 정성 평가

desktop/mobile 경기 상단·필터·요약·스트립·첫 날짜 그룹과 펼친 Overview/Performance를 직접 비교했다.
승패 배경, 지표 정렬, 글자 크기/위계, 요원·랭크 이미지, 화살표, 상세 탭과 주석의 줄바꿈이 유지된다.
날짜 조건·빈 결과·Deathmatch에서도 새 겹침·잘림·정렬 붕괴를 발견하지 못했다.
모바일에서 줄바뀜으로 표시되는 경기 행과 숨기는 지표/최근 스트립 항목은 원래 동작대로다.
이 결과는 정식 Cursor 리뷰와 사용자 검토를 대체하지 않는다.

## 경기 동작11시나리오

각 시나리오를 desktop/mobile 양쪽에서 실행했다.

1. 경기 행 Enter 펼침과 상세 Performance Space 전환, ARIA 선택 상태.
2. 한 경기만 펼침, 다른 경기로 전환하거나 닫고 재펼칠 때 상세 Overview 초기화.
3. 최근 스트립 선택이 해당 행을 펼치고 상세를 초기화하며 smooth/center 스크롤을 요청.
   데스크톱8개·모바일4개 표시를 확인했고 모바일에서는 보이는4번째를 키보드로 선택했다.
4. All Matches가 Matches 탭으로 이동하고 상세를 닫으며23경기 모두 표시.
5. Load more가20→23개로 늘리고 기존 펼침은 유지.
6. More/ Less가 승패 조건을 보존하고, 날짜 안내가 나타나며 필터 변경 시 펼침 닫기.
7. 경기 조건만 빈 결과인 경우 Reset이 선택 Act를 유지하고 해당 Act의3경기를 복원.
8. Deathmatch 상세에서 Damage (Avg) 표시 및 KAST 숨김.
9. 시즌 자체가 빈 경우 Reset이 PC·Competitive·V26:A5·20경기로 복원.
10. 경기 안내 배너 닫힘이 프로필 탭 전환 후에도 유지.
11. 다른 데모 프로필의 이름·태그가 펼친 경기 상세에도 표시.

기존46개 회귀는 검색·공통 헤더18개, 시즌/데이터 경계11개, 프로필 상단7개,
사이드바10개다. 탭·저장·공유·필터·요약·무기/맵 선택·라인업 이동의 기존 연결을 확인했다.

## 명령과 실행 기록

```sh
node /tmp/fe017-visual.cjs before
node /tmp/fe017-sidebar-interactions.cjs before
node /tmp/fe017-match-interactions.cjs before
node /tmp/fe017-visual.cjs after
node /tmp/fe017-match-interactions.cjs after
node /tmp/fe017-sidebar-interactions.cjs after
node /tmp/fe017-interactions.cjs
node /tmp/fe017-summary-interactions.cjs
node /tmp/fe017-header-interactions.cjs
python3 /tmp/fe017-match-crop.py before
python3 /tmp/fe017-match-crop.py after
python3 /tmp/fe017-pixels.py

docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
```

번들 Node·Python/Pillow와 승인된 로컬 Playwright 실행 환경을 사용했다.
Before 모바일 스트립 검사에서 숨겨진8번째 대신 실제로 보이는4번째를 선택하도록 검사 가정을 수정했다.
이는 앱 수정 전 관찰에 따른 설정 보정이며 앱 기능 변경을 요구하지 않았다.

Act 네이티브 팝업의 방향키 선택을 검증했다고 주장하지 않는다. 포커스/selectOption의 change 연결을 확인했다.
버튼의 Enter/Space는 실제 키보드 이벤트다. Mock/API 수치의 타당성이나 실제 게임 기록을 검증하는 Task는 아니다.

Playwright 종료 후 주 구현자가 Mock·타입·Lint·build를 실행해 모두 통과했다. 개발 서버 복원 후
프로필 HTTP200도 확인했다. 컨테이너의 기존 `git: not found`는 빌드 정보 fallback이며 실패가 아니다.
주 구현자도 desktop Performance/mobile Overview After를 육안 검토해 새 겹침·잘림이 없음을 확인했다.
After 검증 이후 앱 소스 변경은 없다.

## 유지한 범위

필터·집계·상태/effect·표시 의미·이미지/아이콘 선택은 부모에 남아 있다.
경기 영역의 DOM·ARIA·문구·순서·반응형 배치를 유지했다. 데이터 의미/산식과 예시 수치,
홈·상단·시즌 요약·사이드바·라인업·실제 API/Overwolf 구현은 바꾸지 않았다.
