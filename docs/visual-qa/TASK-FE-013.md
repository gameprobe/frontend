# TASK-FE-013 Visual QA — 공통 헤더·푸터와 Search

## 결과

PASS — 공통 컴포넌트 분리 후 Search의 지정된 외형만 변경됐다. 21개 너비 × 홈/프로필
42조건에서 Search 밖 요소의 태그·텍스트·위치·계산 스타일이 동일하고 가로 넘침과 실행 오류는 0이다.
전체 main은 하나로 유지된다. 정식 Cursor 검증을 대신하는 판정은 아니다.

데스크톱·모바일 After 캡처를 직접 열어 헤더, 열린 More 메뉴, 푸터를 정성 검토했다.
새로운 글자 겹침·가로 잘림·어색한 줄바꿈은 발견하지 못했다. 독립 코드·화면 검토에서도 같은 결과를 확인했다.

## 기준과 환경

- Before: `6cde828`, FE-013 소스 구현 전. After: `codex/frontend-shared-shell`의 FE-013 구현 소스.
- 로컬 Docker 개발 서버, Playwright Chromium headless, 브라우저 100%, DPR 1, reduced motion.
- 너비: 320/390/480/481/700/701/768/800/801/850/851/1000/1001/1100/1101/1250/1251/1440/1499/1500/1920px.
- 캡처: desktop1920×960, mobile390×844. 각 화면의 전체 페이지/More 열림/검색 focus/푸터,
  프로필 입력 상태를 포함한 Before/After 각 18장. 독립된 브라우저를 사용하며 사용자 배율은 변경하지 않았다.
- 별도 키보드 Tab/Shift+Tab 확인: 1440×960, 아래 추가 After 2장.

## 의도한 변경과 유지 사항

- 홈 Search 14→16px, 프로필 placeholder·돋보기 회색→`--text`(#e9edef).
  글자 굵기는 두 화면 모두700, placeholder opacity1. 입력 글자도 같은 색을 사용한다.
- 기본 배경과 박스는 유지하고 Search의 전체 밝기 hover 효과를 제거했다.
- 키보드 focus는 앵커/입력 폼 외곽에 동일한2px 금색 outline을 표시하며 배치를 밀지 않는다.
- 모바일 기존 너비는 유지한다: 홈 ≤700px132px / ≤480px44px(돋보기만),
  프로필 ≤700px148px / ≤480px112px(입력 유지). 서로 다른 기능을 같은 폼으로 바꾸지 않는다.
- 브랜드 바·메뉴 구성·계정 버튼 색·More의 페이지별 키보드 동작·푸터 안내는 보존했다.
- 홈은 더 이상 프로필 CSS를 import하지 않는다. ≥1500px 사이드바288px 변수는 프로필에만 남고,
  사용처가 없는 홈은 공통 기본272px가 된다. 실제 화면 배치에는 차이가 없다. 테마 파일 자체는 무변경이다.

## 캡처 및 픽셀 대조

Search 박스와 외곽 포커스 표시 범위만 의도된 차이로 구분했다. 아래 마지막 열은
Search 밖의 정확한 차이 픽셀 수 / 최대 RGB 채널 차이다. 전체 페이지·푸터·More 열림 캡처는
Search 밖 차이가0이다. 프로필 모바일 focus/입력 캡처2장에만 More 버튼 모서리16픽셀씩
최대 RGB1의 미세한 래스터 차이가 있다. 이 수치를 제외하거나 전체 픽셀 동일로 보고하지 않는다.

| 캡처 | Before | After | 전체 차이 픽셀 | Search 밖 픽셀 / 최대 차이 |
|---|---|---|---:|---:|
| home-desktop-footer | [Before](assets/TASK-FE-013/before-home-desktop-footer.png) | [After](assets/TASK-FE-013/after-home-desktop-footer.png) | 0 | 0 / 0 |
| home-desktop-menu | [Before](assets/TASK-FE-013/before-home-desktop-menu.png) | [After](assets/TASK-FE-013/after-home-desktop-menu.png) | 449 | 0 / 0 |
| home-desktop-search-focus | [Before](assets/TASK-FE-013/before-home-desktop-search-focus.png) | [After](assets/TASK-FE-013/after-home-desktop-search-focus.png) | 449 | 0 / 0 |
| home-desktop | [Before](assets/TASK-FE-013/before-home-desktop.png) | [After](assets/TASK-FE-013/after-home-desktop.png) | 449 | 0 / 0 |
| home-mobile-footer | [Before](assets/TASK-FE-013/before-home-mobile-footer.png) | [After](assets/TASK-FE-013/after-home-mobile-footer.png) | 0 | 0 / 0 |
| home-mobile-menu | [Before](assets/TASK-FE-013/before-home-mobile-menu.png) | [After](assets/TASK-FE-013/after-home-mobile-menu.png) | 0 | 0 / 0 |
| home-mobile-search-focus | [Before](assets/TASK-FE-013/before-home-mobile-search-focus.png) | [After](assets/TASK-FE-013/after-home-mobile-search-focus.png) | 1 | 0 / 0 |
| home-mobile | [Before](assets/TASK-FE-013/before-home-mobile.png) | [After](assets/TASK-FE-013/after-home-mobile.png) | 0 | 0 / 0 |
| profile-desktop-footer | [Before](assets/TASK-FE-013/before-profile-desktop-footer.png) | [After](assets/TASK-FE-013/after-profile-desktop-footer.png) | 0 | 0 / 0 |
| profile-desktop-menu | [Before](assets/TASK-FE-013/before-profile-desktop-menu.png) | [After](assets/TASK-FE-013/after-profile-desktop-menu.png) | 528 | 0 / 0 |
| profile-desktop-search-focus | [Before](assets/TASK-FE-013/before-profile-desktop-search-focus.png) | [After](assets/TASK-FE-013/after-profile-desktop-search-focus.png) | 1946 | 0 / 0 |
| profile-desktop-search-input | [Before](assets/TASK-FE-013/before-profile-desktop-search-input.png) | [After](assets/TASK-FE-013/after-profile-desktop-search-input.png) | 2271 | 0 / 0 |
| profile-desktop | [Before](assets/TASK-FE-013/before-profile-desktop.png) | [After](assets/TASK-FE-013/after-profile-desktop.png) | 528 | 0 / 0 |
| profile-mobile-footer | [Before](assets/TASK-FE-013/before-profile-mobile-footer.png) | [After](assets/TASK-FE-013/after-profile-mobile-footer.png) | 0 | 0 / 0 |
| profile-mobile-menu | [Before](assets/TASK-FE-013/before-profile-mobile-menu.png) | [After](assets/TASK-FE-013/after-profile-mobile-menu.png) | 528 | 0 / 0 |
| profile-mobile-search-focus | [Before](assets/TASK-FE-013/before-profile-mobile-search-focus.png) | [After](assets/TASK-FE-013/after-profile-mobile-search-focus.png) | 1576 | 16 / 1 |
| profile-mobile-search-input | [Before](assets/TASK-FE-013/before-profile-mobile-search-input.png) | [After](assets/TASK-FE-013/after-profile-mobile-search-input.png) | 1665 | 16 / 1 |
| profile-mobile | [Before](assets/TASK-FE-013/before-profile-mobile.png) | [After](assets/TASK-FE-013/after-profile-mobile.png) | 528 | 0 / 0 |

[홈 키보드 포커스](assets/TASK-FE-013/after-home-keyboard-focus.png) ·
[프로필 키보드 포커스](assets/TASK-FE-013/after-profile-keyboard-focus.png)

전체 수치와 동작 검사는 [검증 요약 JSON](assets/TASK-FE-013/verification.json)에 기록했다.

## 실행한 검증

| 검증 | 실행·결과 |
|---|---|
| Before / After | 번들 Node로 `/tmp/fe013-visual.cjs before`, `after`: 42조건, 각18장, 최종 PASS |
| 계산 스타일·배치 | Search 밖 모든 요소의18개 계산 스타일/텍스트/위치 동일, Search 박스 보존 PASS |
| 픽셀 대조 | 번들 Python/Pillow: 18쌍 비교. 위 표의 정확한 수치와 RGB1 미세 차이를 기록 |
| 상호작용 | 번들 Node `/tmp/fe013-interactions.cjs`: 18항목 PASS, 실행 오류0 |
| Mock·타입·Lint·빌드 | 아래 Docker 명령 PASS. Lint0경고0오류, production build 정적11페이지 생성 |
| 개발 서버 | 빌드 검증 후 `up -d frontend`로 복원, 컨테이너 실행 확인 |

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
```

동작 확인 항목:

- 홈/프로필 Search hover·키보드 포커스·배치 이동 없음.
- 홈 Search 앵커·본문 고정 데모 검색·Overview의 IED 경로.
- 프로필 검색 빈값/일치/다른 사용자 안내 및 기존 알림3.2초 후 닫힘.
- 홈 More Escape 닫기·포커스 복원, 프로필 More는 기존 단순 토글 유지.
- 계정·브랜드·푸터 링크 목적지, Mock 안내 닫기, sticky 내비게이션.
- 프로필6탭, 요원9경기 필터, 승패7경기, Reset,20→23 더 보기, Act3→20경기.
- 한 경기만 펼침 및 상세 탭 초기화, 빈 결과·시즌 Reset, 즐겨찾기 저장 유지.
- 홈/프로필→라인업 이동 시 기존 공용 헤더·푸터와 body 배경 복원.

## 구현 중 수정한 회귀

1. CSS 이동 스크립트가 `.search-row` 같은 홈 본문 클래스를 `.search`로 잘못 구분했다.
   비교에서 홈 본문 차이를 발견한 뒤 추출 규칙을 정확한 클래스 단위로 수정했다.
2. Search 기본 규칙의 specificity를 높이는 과정에서 프로필 모바일148px 폭이180px로 바뀌었다.
   기본 규칙을 낮은 우선순위로 되돌려 모바일 덮어쓰기를 복원했다.
3. 최종42조건 비교와 캡처는 위 수정 이후 결과다. 테스트에서 영향을 받은 영역을 제외하여 통과시키지 않았다.

## 한계

- 로컬 Chromium에서 확인했다. 모든 브라우저와 접근성 전체 감사를 완료한 의미는 아니다.
- 컨테이너의 git 부재 메시지는 기존 빌드 정보 fallback이다. Mock/타입/Lint/build는 모두 성공했다.
- 실제 API/Overwolf, 라인업 구현·게임 자산·통계 산식은 변경하거나 신규 검증하지 않았다.
