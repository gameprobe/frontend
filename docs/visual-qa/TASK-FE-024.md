# TASK-FE-024 Visual QA — 새 API 기반 Mock 화면 연결

- 기준: `8d204e8`(PR #16 병합), 브랜치 `codex/api-mock-ui`.
- 완료일: 2026-09-21. Playwright Chromium, 1728×941 / 390×844, DPR 1, 브라우저 확대 100%.
- 기존 디자인과 컴포넌트를 재사용한다. 홈의 데모 진입과 프로필·상세 데이터가 변경되므로 새 데모와 기존 화면의 픽셀 일치는 목표가 아니다.
- Codex 시각 검토: PASS. Cursor의 별도 검증 결과를 대신하지 않는다.

## Before / After

| 화면 | Before | After | 확인 |
|---|---|---|---|
| 홈, 데스크톱 | [Before](assets/TASK-FE-024/before-1728-home.png) | [After](assets/TASK-FE-024/after-1728-home.png) | 같은 레이아웃, 새 데모 진입 |
| 홈, 모바일 | [Before](assets/TASK-FE-024/before-390-home.png) | [After](assets/TASK-FE-024/after-390-home.png) | 검색 입력·버튼 잘림 없음 |
| 프로필, 데스크톱 | [이전 데모](assets/TASK-FE-024/before-1728-legacy.png) | [새 데모](assets/TASK-FE-024/after-1728-profile.png) | 같은 카드/목록 구조, 새 4경기 집계 |
| 프로필, 모바일 | [이전 데모](assets/TASK-FE-024/before-390-legacy.png) | [새 데모](assets/TASK-FE-024/after-390-profile.png) | 세로 흐름 정상, 문서 가로 넘침 없음 |
| 상세, 데스크톱 | [Before](assets/TASK-FE-024/before-1728-detail.png) | [새 Scoreboard](assets/TASK-FE-024/after-1728-detail-scoreboard.png) | 모달 헤더·본문 스크롤·10인 표 정상 |
| 상세, 모바일 | [Before](assets/TASK-FE-024/before-390-detail.png) | [새 Scoreboard](assets/TASK-FE-024/after-390-detail-scoreboard.png) | 표 내부 가로 스크롤, 닫기·탭 접근 가능 |

## 새 상세 및 상태

| 항목 | 데스크톱 | 모바일 |
|---|---|---|
| Performance | [화면](assets/TASK-FE-024/after-1728-detail-performance.png) | [화면](assets/TASK-FE-024/after-390-detail-performance.png) |
| Economy | [화면](assets/TASK-FE-024/after-1728-detail-economy.png) | [화면](assets/TASK-FE-024/after-390-detail-economy.png) |
| Rounds | [화면](assets/TASK-FE-024/after-1728-detail-rounds.png) | [화면](assets/TASK-FE-024/after-390-detail-rounds.png) |
| Duels | [화면](assets/TASK-FE-024/after-1728-detail-duels.png) | [화면](assets/TASK-FE-024/after-390-detail-duels.png) |
| 직접 링크 | [화면](assets/TASK-FE-024/after-1728-direct.png) | [화면](assets/TASK-FE-024/after-390-direct.png) |
| 무기 | [화면](assets/TASK-FE-024/after-1728-weapons.png) | [화면](assets/TASK-FE-024/after-390-weapons.png) |
| 부분 조회 | [화면](assets/TASK-FE-024/after-1728-partial.png) | [화면](assets/TASK-FE-024/after-390-partial.png) |
| 빈 데이터 | [화면](assets/TASK-FE-024/after-1728-empty.png) | [화면](assets/TASK-FE-024/after-390-empty.png) |
| 조회 실패 | [화면](assets/TASK-FE-024/after-1728-error.png) | [화면](assets/TASK-FE-024/after-390-error.png) |
| 보존한 인라인 | [화면](assets/TASK-FE-024/after-1728-inline.png) | [화면](assets/TASK-FE-024/after-390-inline.png) |

- [빈 시즌 요약 확대](assets/TASK-FE-024/after-1728-empty-overview.png): 분모 없는 비율은 `—`, 승패 원형은 중립색이다. 합계 0과 미제공 비율을 구별했다.
- 상세의 FK/FD·경제·대결은 합성 원본에서 계산한다. 미확보 KAST/랭크/Probe Score/좌표·무기별 피해는 기존 예시 숫자로 보충하지 않는다.
- 기존 파일에 없는 요원·무기·맵 이미지는 기존 fallback을 사용한다. 신규 이미지 취득·매핑 수정은 하지 않았다.
- 모바일 표는 모든 열을 동시에 축소하지 않고 내부에서 스크롤한다. 표 전체가 한 캡처에 보이지 않는 것은 이 동작의 결과다.

## 기존 경로 회귀

- 데스크톱 [프로필](assets/TASK-FE-024/after-1728-legacy.png) / [상세](assets/TASK-FE-024/after-1728-legacy-detail.png).
- 모바일 [프로필](assets/TASK-FE-024/after-390-legacy.png) / [상세](assets/TASK-FE-024/after-390-legacy-detail.png).
- 이전 20개 경기 목록·펼침/모달·통계 표시를 유지했다. 대응 이미지 크기는 동일하다.
- 단순 픽셀 비교 차이: 데스크톱 프로필261/상세249픽셀, 모바일 프로필273/상세0픽셀. 텍스트 주변의 소수 차이가 있으며, 전체 픽셀 동일이라고 주장하지 않는다. 비교 시 카드 배치·문자 겹침·스크롤 이상은 관찰되지 않았다.

## 실행한 검증

- [browser-qa.cjs](assets/TASK-FE-024/browser-qa.cjs): 2화면 크기×7동작 그룹, After28장, 페이지 JavaScript 오류0. [결과 JSON](assets/TASK-FE-024/browser-results.json).
- [empty-state-qa.cjs](assets/TASK-FE-024/empty-state-qa.cjs): 빈 데이터 원형 중립색, 지원하지 않는 Deathmatch의 Kills/Match `—` 표시.
- `/private/tmp/fe024-inline.cjs`: 설정을 임시 inline으로 전환해 두 크기의 신규/기존 4탭·닫기를 확인하고 원래 modal 설정을 복원했다. After2장.
- `/private/tmp/fe024-hook-qa.cjs`: 실제 React/ReactDOM과 지연 Promise로 loading, 조회 변경, 이전 응답 무시, AbortSignal, 오류→재시도 성공, unmount 취소를 검사했다.
- Before6장 + After31장 = 총37장. 위 스크립트는 새 의존성을 설치하지 않고 기존 Playwright 환경으로 실행했다.

재실행은 저장소 루트에서 개발 서버가 실행된 상태로 다음 명령을 사용한다. Playwright가 전역 탐색되지 않으면 `PLAYWRIGHT_MODULES`에 기존 설치의 절대 경로를 지정한다.

```sh
node docs/visual-qa/assets/TASK-FE-024/browser-qa.cjs
node docs/visual-qa/assets/TASK-FE-024/empty-state-qa.cjs
```

홈 데모 진입, 요원/맵/무기/승패 필터, 개인 선택, 라운드 선택, 경제3종, 상세5탭,
동일 경기·선수 링크와 클립보드, Escape 후 원래 행으로 초점 복귀, PC/Console,
partial/empty/error/재시도 및 기존 경로를 확인했다.

## 검증 중 보완 및 한계

- 독립 코드 검토에서 빈 데이터의 비율0 처리와 동일 이름의 서로 다른 콘텐츠 집계를 발견해 null/ID 기준으로 수정하고 회귀 검사했다.
- 최초 브라우저 검사에서 한국어 버튼에 영어 이름을 사용한 선택자 실패는 검사 코드를 수정했다. 제품 테스트를 삭제하거나 무시하지 않았다.
- 실제 Riot 응답·네트워크/인증·배포는 검증 대상이 아니다. 홈의 별도 분석 예시 카드는 기존 설명용 예시로 유지한다.
- 재시도 버튼은 같은 Mock 시나리오를 다시 실행한다. error 시나리오에서는 계속 실패하는 것이 의도된 동작이며, 성공 전환은 훅 검사에서 별도로 확인했다.

## 사용자 보완 — 홈에서 두 데모 비교

- 홈의 `데모 비교하기`에 `새 데이터 데모 · DemoPlayer01`과 `기존 디자인 데모 · IED agent` 링크를 함께 표시했다.
- 검색 미연결과 검색 폼의 기본 진입 목적지(새 데이터 데모)를 명시했다. CSS 변경 없이 기존 줄바꿈 배치를 사용한다.
- 데스크톱: [추가 변경 전](assets/TASK-FE-024/before-1728-demo-links.png) / [추가 변경 후](assets/TASK-FE-024/after-1728-demo-links.png).
- 모바일: [추가 변경 전](assets/TASK-FE-024/before-390-demo-links.png) / [추가 변경 후](assets/TASK-FE-024/after-390-demo-links.png).
- `node /private/tmp/fe024-demo-links.cjs before`, `node /private/tmp/fe024-demo-links.cjs after` PASS. 두 크기에서 각 링크 클릭→새4경기/기존20개 목록 확인, 문서 가로 넘침 없음.
- Codex 시각 검토 PASS: PC에서는 두 링크가 나란히 표시되고 모바일에서는 자연스럽게 줄바꿈되며 글자·버튼 겹침이나 잘림 없음.
- 추가 Before2/After2장으로 누적 Before8/After33, 총41장. 앞의37장은 최초 연결 검증 기록이다.
- 보완 후 프로덕션 빌드(내부 타입·Lint 포함) PASS. 개발 서버 복원 완료.

## PR 전 보완 — 두 데모 프로필 카드

- 사용자 첨부의 홈 우측 프로필 카드에도 기존 `IED agent` 데모를 추가했다. 각 카드의 제목을 새 데이터 데모/기존 디자인 데모로 구분했다.
- 1200px 초과에서는 우측에 같은 폭으로 세로 배치한다. 801~1200px에서는 검색 영역 아래에 두 열로 배치해 겹침을 방지한다.
- 800px 이하에서는 기존처럼 카드 장식을 숨기고 검색 아래 비교 링크로 두 데모에 진입한다.
- 기존 Jett 이미지만 재사용했다. 모바일 글자·이미지 크기나 기존 상세 디자인은 변경하지 않았다.

| 폭 | 변경 전 | 변경 후 |
|---|---|---|
| 1728px | [Before](assets/TASK-FE-024/before-1728-hero-cards.png) | [After](assets/TASK-FE-024/after-1728-hero-cards.png) |
| 1280px | [Before](assets/TASK-FE-024/before-1280-hero-cards.png) | [After](assets/TASK-FE-024/after-1280-hero-cards.png) |
| 1100px | [Before](assets/TASK-FE-024/before-1100-hero-cards.png) | [After](assets/TASK-FE-024/after-1100-hero-cards.png) |
| 820px | [Before](assets/TASK-FE-024/before-820-hero-cards.png) | [After](assets/TASK-FE-024/after-820-hero-cards.png) |
| 390px | [Before](assets/TASK-FE-024/before-390-hero-cards.png) | [After](assets/TASK-FE-024/after-390-hero-cards.png) |

- [hero-cards-qa.cjs](assets/TASK-FE-024/hero-cards-qa.cjs) `before`/`after` 실행 PASS: 5개 폭에서 문서 가로 넘침 없음, 카드와 검색 폼 겹침 없음, 각 카드 클릭 후 새4경기/기존20개 목록 확인.
- Codex 시각 평가 PASS: 카드 간격·정렬·텍스트 대비와 반응형 배치 정상. 참고 이미지는 사용자 첨부의 기존 단일 프로필 카드다.
- 추가 Before5/After5장, 전체 누적 Before13/After38 = 51장. 최초 보고 및 비교 링크 추가의 캡처도 보존했다.
- 최종 카드 변경 후 프로덕션 빌드(타입·Lint 포함) PASS, 개발 서버 복원 완료.

## 병합 전 보완 — 기본 진입은 기존 디자인 데모

- `데모 보기` 버튼·홈 `Overview`·`전적 프로필 보기` 소개 카드는 기존 `/players/ied-agent-allen`로 연결한다.
- 새 `/players/demo-player-01`로 가는 홈 링크는 `새 데이터 데모`라고 명시한 비교 링크/프로필 카드 두 곳뿐이다. 기존 프로필 내부의 Overview는 현재 프로필 탭을 유지한다.
- 입력창 예시를 `IED agent#Allen`, 안내를 기존 디자인 데모 이동으로 맞췄다. 검색 기능은 연결하지 않았다.
- PC: [Before](assets/TASK-FE-024/before-1728-default-entry.png) / [After](assets/TASK-FE-024/after-1728-default-entry.png).
- 모바일: [Before](assets/TASK-FE-024/before-390-default-entry.png) / [After](assets/TASK-FE-024/after-390-default-entry.png).
- [default-entry-qa.cjs](assets/TASK-FE-024/default-entry-qa.cjs) `before`/`after` PASS. 두 크기에서 일반 진입 세 곳은 기존20개 목록, 명시적 새 링크는4경기 목록으로 연결. 데스크톱 두 프로필 카드도 확인했다.
- 시각 대조 PASS: 기존 배치를 유지하고 예시/안내 문구만 변경되며 가로 넘침·겹침 없음. 추가4장으로 누적 Before15/After40 총55장.
- 주 브라우저 검사의 첫 진입도 기본 버튼→기존 화면 확인→홈의 명시적 새 데이터 링크 순서로 갱신했다.
- 갱신한 주 브라우저 검사14그룹 PASS, JS 오류0. 최종 프로덕션 빌드(타입·Lint 포함) PASS, 개발 서버 복원 완료.
