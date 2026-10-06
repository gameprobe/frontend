# TASK-FE-012 — 공통 설정 분리 Visual QA

## 비교 조건

- 기준 `6298fdb`에서 소스 변경 전 Before, 설정 분리 후 After를 Playwright로 촬영했다.
- 동일 Chromium headless, `http://127.0.0.1:3000`, 배율 100%, DPR 1, reduced motion.
- 데스크톱 viewport 1920×960, 모바일 390×844. 전체 페이지 캡처는 실제 콘텐츠 높이를 사용한다.
- 사용자의 기존 브라우저 탭·배율·저장 상태는 건드리지 않고 독립된 임시 브라우저를 사용했다.
- Mock·이미지·문구·동작은 그대로 유지한다. 비교 목적은 외형을 바꾸지 않은 설정 분리다.

## Before / After

| 화면 | Before | After | 비교 |
|---|---|---|---|
| 홈 데스크톱 | [Before](assets/TASK-FE-012/before-home-desktop.png) | [After](assets/TASK-FE-012/after-home-desktop.png) | 픽셀 차이 0 |
| 홈 모바일 | [Before](assets/TASK-FE-012/before-home-mobile.png) | [After](assets/TASK-FE-012/after-home-mobile.png) | 픽셀 차이 0 |
| 프로필 데스크톱 전체 | [Before](assets/TASK-FE-012/before-profile-desktop.png) | [After](assets/TASK-FE-012/after-profile-desktop.png) | 픽셀 차이 0 |
| 프로필 모바일 전체 | [Before](assets/TASK-FE-012/before-profile-mobile.png) | [After](assets/TASK-FE-012/after-profile-mobile.png) | 픽셀 차이 0 |
| 프로필 경기 목록 | [Before](assets/TASK-FE-012/before-profile-matches.png) | [After](assets/TASK-FE-012/after-profile-matches.png) | 픽셀 차이 0 |

두 PNG를 같은 RGB 형식으로 읽어 크기와 모든 픽셀을 비교했다. 5쌍 모두 동일하다.
홈 크기 1920×1076/390×1486, 프로필 전체 1920×4408/390×7388,
경기 목록 1920×960. 원본 파일은 위 링크에서 확인한다.

## 반응형과 스타일

- 홈·프로필 각각 320/390/700/701/768/1000/1100/1101/1250/1440/1499/1500/1920px:
  총 26조건에서 페이지 가로 넘침 0.
- main과 자손의 문구, 위치·크기 및 글꼴/크기/굵기/줄 간격/색/배경/폭/높이/
  여백/간격/테두리 곡률/그리드/정렬 등 계산된 스타일이 Before/After에서 동일하다.
- 공통 변수 26개를 비교했다. 홈 제목 38→36→30px, 사이드바 272→288px,
  플레이 시간용 13px 등 기존 분기 값도 유지된다.
- 독립 코드 검토: 변수 이름·값과 기본 글꼴 선언 동일, 브랜드 사용처 주석 정확,
  이미지·JSX 동작·저장 키·Mock 계산식 변경 없음.
- 독립 시각 검토: 홈 데스크톱/모바일, 프로필 전체·경기 목록에서 새 겹침·잘림·
  정렬/글자 표현 회귀 없음. 전체 프로필 축소 보기의 세부 글자 판단 한계는
  경기 목록 캡처와 픽셀 비교로 보완했다. 정식 Cursor 리뷰 결과를 대신하지 않는다.

## 동작 확인

- Home More / Escape / focus
- Home search existing demo route
- Overview existing IED route
- Six profile tabs
- Agent card filters nine matches
- One expanded match and detail tabs reset
- Loss filter / reset / 20 to 23 matches
- Act switch updates data
- Empty state and season reset
- Favorite persists with existing storage key
- profile to lineups restores global shell
- home to lineups restores global shell

위 동작 확인은 1440×960에서 수행했다. 브라우저 실행 오류(pageerror) 0.
홈·프로필에서 라인업으로 클라이언트 이동한 뒤 공용 헤더·푸터가 보이고,
공통 테마 변수가 라인업 main에 남지 않는 것도 확인했다.

## 실행과 결과

- `/tmp/fe012-visual.cjs before`, `after`: Playwright 촬영·26조건 비교 PASS.
- `/tmp/fe012-interactions.cjs`: 위 동작 PASS.
- Python/Pillow PNG 비교: 5쌍 차이 0. 도구는 기존 번들 런타임을 사용했다.
- Mock selector 테스트·타입 검사·Lint·production build PASS, 개발 서버 복원.
- 초기 검증 도구 실행은 샌드박스의 브라우저 권한 제한으로 실패해 승인된 실행으로
  재시도했다. 중복 Matches 버튼과 요원 이미지 대체 텍스트를 고려해 검증 선택자를
  수정했고 최종 통과했다. 앱 코드 문제를 숨기기 위한 검사 삭제는 없다.
- [구조화된 검증 요약](assets/TASK-FE-012/verification.json),
  [Task 결과](../tasks/TASK-FE-012.md).

## 2026-09-18 — 브랜드 문구·표면 색상 연결 보완

같은 Task의 미커밋 1차 구현 위에서 사용자가 지정한 보완을 진행했다. 기존 캡처를
덮어쓰지 않고 보완 전후를 같은 Playwright 조건에서 새로 촬영했다.

| 화면 | Before | After | 픽셀 비교 |
|---|---|---|---|
| 홈 데스크톱 | [Before](assets/TASK-FE-012/followup-before-home-desktop.png) | [After](assets/TASK-FE-012/followup-after-home-desktop.png) | 차이 0 |
| 홈 모바일 | [Before](assets/TASK-FE-012/followup-before-home-mobile.png) | [After](assets/TASK-FE-012/followup-after-home-mobile.png) | 차이 0 |
| 프로필 데스크톱 전체 | [Before](assets/TASK-FE-012/followup-before-profile-desktop.png) | [After](assets/TASK-FE-012/followup-after-profile-desktop.png) | 차이 0 |
| 프로필 모바일 전체 | [Before](assets/TASK-FE-012/followup-before-profile-mobile.png) | [After](assets/TASK-FE-012/followup-after-profile-mobile.png) | 차이 0 |
| 프로필 경기 목록 | [Before](assets/TASK-FE-012/followup-before-profile-matches.png) | [After](assets/TASK-FE-012/followup-after-profile-matches.png) | 차이 0 |

- 13너비×2화면의 26조건: 문구·요소 위치·계산된 스타일·26개 변수 동일, 가로 넘침 0.
- PNG 5쌍 크기·RGB 픽셀 동일. 새 Playwright pageerror 0.
- 점수 카드 접근성 이름은 설정과 연결하면서 `Probe score`에서 `Probe Score`로
  대소문자만 정렬했다. 화면에 보이는 문구·색·크기와 저장 키는 그대로다.
- 기본 설정에서 검색·6탭·요원/승패/Act 필터·빈 결과·초기화·경기 상세·저장·
  라인업 이동을 다시 확인했다. 모두 PASS.

### 설정 변경 연결 검증

`/tmp/fe012-config-preview.cjs`가 독립된 Playwright 브라우저의 JS/CSS 응답 중
브랜드 설정 객체와 테마 변수 선언만 대체했다. 원본 파일과 사용자 브라우저는
변경하지 않았다. 라인업에서 홈으로 클라이언트 이동해 검증용 설정을 적용했다.

- 이름/점수명/약칭을 ReviewProbe / Review Score / RS로 대체: 홈 소개·브랜드명,
  프로필 점수 접근성 이름·툴팁, 경기 행 약칭·상세 지표·안내 문구 반영 PASS.
- `--bg`, `--panel`, `--raised`를 서로 다른 테스트 색으로 대체: body/main 배경,
  More 메뉴·시즌 카드 아래 배경·승률 도넛 내부에 반영 PASS.
- 라인업으로 이동하면 body의 배경은 기존 `rgb(7, 17, 31)`, `--bg`는 기존 전역
  값 `#07111f`로 복원되고 공용 헤더·푸터가 다시 표시된다. 실행 오류 0.
- 첫 검증에서 라인업 `--bg`가 빈 문자열일 것으로 잘못 가정했다. 실제 기존 전역값을
  진입 전 기록하고 복원값과 비교하도록 검증을 보정했다. 앱 수정으로 우회하지 않았다.
- 상태색·버튼 색·그라데이션/이미지 오버레이는 대상에서 제외했다.
- [보완 검증 요약](assets/TASK-FE-012/followup-verification.json).

- 보완 후 Mock selector·타입·Lint·production build PASS, 개발 서버 재시작.
- 독립 코드 검토 및 보완 후 모바일 홈·경기 목록 시각 검토에서 새로운 회귀 없음.
  이 결과는 정식 Cursor 리뷰를 대체하지 않는다.
