# TASK-FE-036 — Visual QA

- Verdict: PASS
- 기준: dev e1a3288, codex/dev-design-alignment
- 참조 디자인: 기존 홈·프로필·연결 안내와 stats-shell/theme.module.css
- Playwright/Chrome headless, 로컬 개발 서버3000. 실제 공개 서비스/백엔드/DB 수정 없음.

## 1차 테마 조정 비교 결과

| 영역 | Before | After |
| --- | --- | --- |
| Insights 강조 | 별도 청록 계열 | 기존 공통 분홍 강조/선택 밑줄 |
| 카드·안내 | 개별 녹청 배경/테두리 | 공통 panel/raised/line 및 금색 안내 |
| 제목·보조 글자 | 별도42/22px 제목·11px 설명 | 공통 title/section/meta/caption 토큰 |
| 하단 버튼 | 동일 청록 테두리 버튼2개 | 기존 주요/보조 버튼, 모바일 전체 폭 |
| 메뉴 | Lineups/Smokes/Insights | Insights/Lineups/Smokes |
| 내용·수치 | 기존 한영3탭 | 12조건의 본문 텍스트 완전 동일 |

## 실제 실행 결과

- Before21장, After21장: 1440/390px·ko/en Insights3탭(12장), 1440/390px·ko 홈/프로필/라인업/스모크(8장), 1024px 한국어 프로필 지표(1장).
- 분석3탭·방향키/Home/End·모바일 More→Insights·기존 연결/데모 링크 PASS.
- 메뉴 순서·선택 탭/주요 버튼의 실제 표시 색상 PASS.
- 페이지 실행/console 오류0, 대상 페이지 가로 넘침0.
- 홈/프로필/라인업/스모크8쌍은 헤더 아래 촬영 영역의 변경 픽셀0(comparison.json). 메뉴 순서 외 기존 본문에 영향 없음.
- 1024px `성과점수`는 width=scrollWidth=43px, height17px로 한 줄 표시. 번역 유지.
- 초기 QA 스크립트의 화면 밖 지연 이미지 대기와 고정 메뉴ID 탐색이 각각 timeout. 화면 안 이미지 대기/실제 aria-controls로 보완 후 Before/After 모두 완료. 제품 코드를 바꿔 통과시키지 않음.

## 직접 시각 검토

1440px 한국어와390px 영어 Insights, 홈 Before/After 및1024px 프로필을 직접 대조했다.
글자 겹침·잘림·카드 붕괴 없음. 모바일 제목 줄바꿈/세 탭/비교 수치 정상.
기존 홈의 회색 카드·분홍 강조·금색 보조 안내로 연결되며, 차트의 두 계열은 분홍/초록으로 구분된다.
독립 코드·시각 검토 PASS. Cursor 전용 리뷰는 실행하지 않았으며 별도 독립 에이전트가 검토했다.

## 대표 화면

| 화면 | Before | After |
| --- | --- | --- |
| PC Insights | [Before](assets/TASK-FE-036/before-1440-ko-insights-0.png) | [After](assets/TASK-FE-036/after-1440-ko-insights-0.png) |
| 모바일 Insights | [Before](assets/TASK-FE-036/before-390-en-insights-0.png) | [After](assets/TASK-FE-036/after-390-en-insights-0.png) |
| 홈 | [Before](assets/TASK-FE-036/before-1440-ko-home.png) | [After](assets/TASK-FE-036/after-1440-ko-home.png) |
| 좁은 프로필 지표 | [Before](assets/TASK-FE-036/before-1024-ko-profile-metric.png) | [After](assets/TASK-FE-036/after-1024-ko-profile-metric.png) |

[검증 스크립트](assets/TASK-FE-036/verify.cjs) · [Before 결과](assets/TASK-FE-036/before.json) · [After 결과](assets/TASK-FE-036/after.json) · [본문 비교](assets/TASK-FE-036/comparison.json)

## 2차: 홈·프로필과 본문 폭 통일

- 사용자 피드백으로 Insights에만 SupportPage의 `wide` 옵션을 적용했다. 위 1차 테마 After는 폭 조정 전 기록이며, 이 단계의 폭 비교는 아래 링크를 기준으로 한다. 최종 메뉴는 다음 단계에서 확정했다.
- Before/After 각각10장, 한국어/영어·1920/1440/650/390px. 본문 내용·키보드 탭·오류0·가로넘침0 PASS.

| 화면 폭 | Insights Before (x / 폭) | Insights After (x / 폭) | 홈 기준 (x / 폭) |
| --- | --- | --- | --- |
| 1920px | 500 / 920 | 260 / 1400 | 260 / 1400 |
| 1440px | 260 / 920 | 20 / 1400 | 20 / 1400 |
| 650px | 20 / 610 | 10 / 630 | 10 / 630 |
| 390px | 10 / 370 | 10 / 370 | 10 / 370 |

- 공통1440px 외곽 컨테이너와20px 안쪽 여백을 사용하며, 700px 이하에서는 좌우10px로 맞춘다.
- 개인정보/계정 연결의 기본920px, 기록 없음의compact720px는 유지했다. 모바일까지6조건의 위치·폭 동일.
- 회귀 이미지5쌍은 변경 픽셀0. 1440px 개인정보는 목록 점의34픽셀 차이만 있으며 글자·배치·전체 크기는 동일하다. 자동 완전 일치 검사에서는 이 차이를 발견했고 직접 확인 결과 레이아웃 결함이 아니므로 제품 수정 없이 기록했다.
- 1920px 전후, 1440px 영어, 650px 영어를 직접 검토했다. 독립 검토자는 1920px 전후/650px 영어/390px 한국어를 확인했다. 겹침·잘림·카드 붕괴 없음.
- 타입/Lint/별도 임시 빌드 재검증 PASS. Cursor 전용 리뷰는 실행하지 않았으며 독립 에이전트 코드/시각 검토 PASS.

| 화면 | Before | After |
| --- | --- | --- |
| 1920px 한국어 | [Before](assets/TASK-FE-036/width-before-1920-ko-insights.png) | [After](assets/TASK-FE-036/width-after-1920-ko-insights.png) |
| 1440px 영어 | [Before](assets/TASK-FE-036/width-before-1440-en-insights.png) | [After](assets/TASK-FE-036/width-after-1440-en-insights.png) |
| 650px 영어 | [Before](assets/TASK-FE-036/width-before-650-en-insights.png) | [After](assets/TASK-FE-036/width-after-650-en-insights.png) |
| 390px 한국어 | [Before](assets/TASK-FE-036/width-before-390-ko-insights.png) | [After](assets/TASK-FE-036/width-after-390-ko-insights.png) |

[폭 검증 스크립트](assets/TASK-FE-036/width.cjs) · [Before](assets/TASK-FE-036/width-before.json) · [After](assets/TASK-FE-036/width-after.json) · [기존 안내 화면 비교](assets/TASK-FE-036/width-comparison.json)

## 3차: 최종 메뉴 및 PR 화면

- 최종 상단 순서 `Lineups → Smokes → Insights`. More에는 Privacy policy / Terms of service / Connect account만 표시한다.
- 메뉴 Before/After 각12장·각20조건 PASS. 대상: 1440/390px·ko/en·홈/프로필/라인업/스모크/인사이트.
- 모바일 가로 스크롤 메뉴에서 마지막 Insights를 키보드 focus+Enter로 열고 선택 표시 확인. More Escape 초점 복귀와 개인정보 화면 이동도 PASS.
- 최종 전체 회귀 After21장: Insights3탭·키보드·텍스트/수치 동일, 홈/프로필/전술 화면·1024px 지표 PASS, 실행 오류/가로 넘침0.
- PC 영어 More 화면, 모바일 한국어 상단 메뉴를 직접 검토. 독립 검토자는 모바일 프로필 More도 함께 확인했다. 메뉴/본문 겹침·잘림 없음. 모바일 왼쪽 메뉴 일부는 가로 스크롤 위치에 따라 화면 밖에 있으며 기존 스크롤 방식 유지.
- 최종 타입/Lint/임시 폴더 빌드 PASS. 독립 코드·시각 검토 PASS. Cursor 도구를 통한 리뷰는 별도로 실행하지 않았다.

| 화면 | Before | After |
| --- | --- | --- |
| PC More | [Before](assets/TASK-FE-036/menu-before-1440-en-insights-more.png) | [After](assets/TASK-FE-036/menu-after-1440-en-insights-more.png) |
| 모바일 상단 | [Before](assets/TASK-FE-036/menu-before-390-ko-insights-nav.png) | [After](assets/TASK-FE-036/menu-after-390-ko-insights-nav.png) |
| 모바일 프로필 More | [Before](assets/TASK-FE-036/menu-before-390-en-profile-more.png) | [After](assets/TASK-FE-036/menu-after-390-en-profile-more.png) |

[메뉴 스크립트](assets/TASK-FE-036/menu.cjs) · [메뉴 Before](assets/TASK-FE-036/menu-before.json) · [메뉴 After](assets/TASK-FE-036/menu-after.json) · [최종 전체 회귀](assets/TASK-FE-036/final-after.json)

`verify.cjs`는 기본적으로 최종 순서/이동을 검증하고 `final-` 캡처를 생성한다. `QA_STAGE=theme` 옵션은 최초 테마 변경 단계의 코드에서만 사용한다.
