# TASK-FE-030 시각 검증

## 결과
PASS — 1440/820/390px Before/After 38쌍 및 추가 키보드·관리자 13장(총89 PNG). 대상 화면의 가로 문서 넘침·최종 브라우저 예외 없음. API/원본 데이터/전역 스타일 17파일 보존, 홈·프로필 1440px PNG 완전 동일.

## 기준과 캡처 방식
- 기준: PR #23 병합 `76adc9e`, `codex/remaining-page-theme`.
- 참고 디자인: 기존 홈·프로필 공통 StatsShell 테마와 라인업·스모크 탐색 화면. 제품 수정 전에 모든 Before 캡처를 완료했다.
- Playwright 1440×960, 820×960, 390×960, DPR1. 본문/폰트/이미지 준비 후 전체 화면을 저장했다.
- API는 브라우저 context에서 가로챘다. 관리자 토큰은 의미 없는 테스트 문자열이며 서버로 전송하지 않았다. 관리자 검수·생성·수정 요청41건은 모두 테스트 응답으로 처리했다.
- YouTube는 검증용 프레임으로 대체했다. 실제 iframe src와 스킬별 전환을 대조했으며 외부 영상의 재생/임베드 허용은 검증하지 않았다. Before 프레임의 한글 charset 표시 문제는 QA stub만 보완했다.
- After 이후 제품 변경은 한국어 본문 lang 속성 2개뿐이며 시각 배치 변화가 없다. 언어 동작은 서버 재시작 후 확인했다.

## Before / After

| 대표 화면 | Before | After |
|---|---|---|
| 라인업 상세 PC | [보기](assets/TASK-FE-030/before-1440-lineup.png) | [보기](assets/TASK-FE-030/after-1440-lineup.png) |
| 라인업 상세 모바일 다중 스킬 | [보기](assets/TASK-FE-030/before-390-lineup-api.png) | [보기](assets/TASK-FE-030/after-390-lineup-api.png) |
| 기존 경기 상세 | [보기](assets/TASK-FE-030/before-1440-match.png) | [보기](assets/TASK-FE-030/after-1440-match.png) |
| 관리자 목록 | [보기](assets/TASK-FE-030/before-1440-admin-list.png) | [보기](assets/TASK-FE-030/after-1440-admin-list.png) |
| 관리자 편집 모바일 | [보기](assets/TASK-FE-030/before-390-admin-edit.png) | [보기](assets/TASK-FE-030/after-390-admin-edit.png) |
| 기본 404 | [보기](assets/TASK-FE-030/before-390-404.png) | [보기](assets/TASK-FE-030/after-390-404.png) |
| 계정 연결 메뉴 | [보기](assets/TASK-FE-030/before-1440-connect.png) | [보기](assets/TASK-FE-030/after-1440-connect.png) |

나머지 성공·로딩·영상 없음·실패·인증 안내·관리자0건·수정 실패와 홈/프로필 비교는 [manifest](assets/TASK-FE-030/manifest.json), [Before](assets/TASK-FE-030/before.json), [After](assets/TASK-FE-030/after.json)에 기록했다.

## 정성 평가 및 수정 피드백
- 라인업 상세: 이전 격자 배경과 분리된 헤더를 공통 외곽으로 연결했다. 난이도 배지가 우상단 viewport에 떠 있던 문제가 메타데이터 행 안에서 해결됐다. 지도·영상·설명 카드가 같은 테두리/배경/글자 기준을 사용한다.
- 모바일 인접 스킬명의 겹침을 확인하고, 지도 위에는 번호를 표시하며 선택한 스킬명은 범례 아래에 표시했다. 위치와 경로를 변경하지 않았다. 키보드 초점은 해당 원형 핀에 표시한다.
- 기존 경기: 세로로 길게 나열되던 선수 카드를 표로, 라운드를 격자로 바꿨다. 값은 10명/22라운드 모두 유지한다. 모바일은 문서 전체 대신 선수 표 안에서 가로 이동하며 키보드로 마지막 ACS 열까지 접근 가능하다.
- 관리자: 로그인·권한 안내·필터·입력·등록/수정 상태에 같은 디자인 적용. 모바일은 지도와 폼이 한 열로 이어지고 입력/버튼 잘림이 없다. 기존 수정 페이지의 서버/브라우저 초기 렌더 불일치로 Before에서 10개 hydration 오류가 발생했으며, 동일 초기 로딩 표시로 해결했다.
- 공통: SupportPage 메뉴 누락을 수정하고 404도 공통 메뉴/복귀 버튼 사용. 독립 검토에서 영문 선택 시 한국어 본문 lang 불일치를 찾아 본문에 ko를 지정했다.
- 구현자 직접 화면 검토와 별도의 읽기전용 에이전트가 6개 대표 After 화면/코드를 교차 확인했다. 별도 Cursor 리뷰를 수행한 것은 아니며 VERDICT를 대신 작성하지 않았다.

## 실행 결과
- `capture.cjs before` / `after`: 각38장. After 모두 main1/가로 넘침0/브라우저 오류0.
- `lineup-qa.cjs`: 230검사, 3폭×5상태. 로딩/성공/실패/예시/영상 없음, 좌표/경로, 키보드·포인터 영상 전환, 링크·글자·초점 확인.
- `admin-qa.cjs`: 215검사, 가로챈41요청. 인증 전 안내·테스트 인증 성공/실패·로그아웃·상태 필터/검수 전환·신규/수정 payload·좌표/마커 삭제/경로 초기화·소바 설정, 최종 예외0.
- `match-qa.cjs`: 3폭에서 참가자50필드+라운드88필드=총414필드 대조, 정렬·표 스크롤·초점·최소12px PASS.
- `interaction-qa.cjs`: 13경로×2폭 + 실제 Smokes 이동2건=28조건. 공통 메뉴/More 열기·Escape/초점/단일main/404 HTTP·복귀 확인.
- `compare.py`: 38조건 핀/경로/초기iframe 동일. 홈·프로필 PNG byte 동일. 보호한 원본/API/테마17파일 동일.
- TypeScript·Lint·production build(정적12페이지)·diff 검사 PASS. 컨테이너의 기존 git 미설치 안내는 종료코드0에 영향을 주지 않았다.
- 개발 서버 복원 후 `post-build.cjs`: 모바일8경로 정상응답·가로넘침0·예외0 및 English 메뉴/한국어 본문 lang PASS.

## 테스트 환경 보완 기록
- 초기 QA의 메뉴 접근성 이름을 실제 `More navigation`에 맞추고, hydration/페이지 전환/오류 상태와 React 상태 갱신을 기다리도록 수정했다.
- 관리자 QA의 마우스 focus-visible 기대를 키보드 동작으로 바로잡고 기존 중복 라벨을 select로 한정했다. 테스트 초기화 스크립트는 외부 iframe의 sessionStorage에 접근하지 않도록 로컬 최상위 문서로 한정했다.
- 경기 QA는 이름이 같은 영역/표를 구별하도록 선택자를 조정했다. 테스트를 삭제하거나 비활성화하지 않았다.

## 제한
실 운영 관리자 권한·서버 저장·동영상 재생·게임 데이터 정확성은 이번 테마 검증의 범위가 아니다. 기존 편집 지도의 클릭 배치 방식은 유지했으며 키보드만으로 새 좌표를 찍는 기능은 추가하지 않았다. 본문 번역 범위와 관리자 지원 요원 목록을 변경하지 않았다.
