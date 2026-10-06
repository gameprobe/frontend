# TASK-FE-029 — 상태 안내 Visual QA

## 기준과 방법

- 기준: PR #22 병합 `c469a68`, 작업 브랜치 `codex/strategy-status-messages`.
- 레퍼런스: 기존 홈과 FE-027/028 탐색 화면의 테마. 상태 표시 범위만 다듬고 지도·필터 동작을 유지한다.
- Playwright Chromium, DPR 1, reduced motion, 1440/820/390px. Before는 제품 수정 전에 촬영했다.
- 공개 라인업 응답은 브라우저에서 보류/성공/빈 배열/503으로 통제했다. 운영 서버/API를 수정하거나 운영 자료의 정확성을 검증한 결과가 아니다.

## Before / After

각 폭에서 라인업 로딩·성공·원본 0건·연결 실패·필터 0건·선택 결과, 스모크 예시·선택 결과·필터 0건을 촬영했다. 홈·프로필 1440px을 포함해 29쌍이다. 회귀 검사와 누락 좌표/경로 확인 4장을 추가하여 총 62장이다.

| 대표 상태 | Before | After |
|---|---|---|
| 공개 자료 없음, PC | [이전](assets/TASK-FE-029/before-1440-lineups-empty.png) | [이후](assets/TASK-FE-029/after-1440-lineups-empty.png) |
| 필터 결과 없음, PC | [이전](assets/TASK-FE-029/before-1440-lineups-filter-empty.png) | [이후](assets/TASK-FE-029/after-1440-lineups-filter-empty.png) |
| 연결 실패·예시, 모바일 | [이전](assets/TASK-FE-029/before-390-lineups-failure.png) | [이후](assets/TASK-FE-029/after-390-lineups-failure.png) |
| 스모크 결과 없음, 모바일 | [이전](assets/TASK-FE-029/before-390-smokes-filter-empty.png) | [이후](assets/TASK-FE-029/after-390-smokes-filter-empty.png) |

전체 파일은 [manifest](assets/TASK-FE-029/manifest.json), 응답별 문구·좌표·배치는 [Before](assets/TASK-FE-029/before.json) / [After](assets/TASK-FE-029/after.json)에 기록했다.

## 시각 평가

- 상단 안내는 기존 카드 안에서 14px 제목/본문과 상태별 강조선으로 표시한다. 공개 자료는 녹색, 예시는 금색이며 제목으로도 상태를 구별하므로 색에만 의존하지 않는다.
- 로딩 때 현재 예시 자료를 보여주는 점, 실패 때 예시로 전환하는 점을 명시한다. 원시 오류와 API/Preview 표기를 사용자용 문구로 교체했다.
- 라인업 맵 위의 안내 줄에서 원본 0건·필터 0건·요원 미선택을 구별한다. 스모크 0건은 지도 안의 안내와 필터 변경 방법을 보여주고, 선택할 항목이 없는데 선택을 요구하던 문구는 숨긴다.
- PC 라인업/스모크 빈 결과, 820px 실패 예시, 390px 실패·필터 빈 결과·경로 누락 화면을 직접 확인했다. 새 안내 잘림·글자 겹침·가로 넘침 없음.
- 안내 문구 때문에 탐색 본문의 높이와 지도 시작 위치는 일부 바뀐다. 지도 내부 핀 퍼센트 좌표·경로점·회전은 동일하다. 홈·프로필 1440px 변경 픽셀은 각각 0이다.

## 실행과 결과

```bash
node docs/visual-qa/assets/TASK-FE-029/capture.cjs before
node docs/visual-qa/assets/TASK-FE-029/capture.cjs after
node docs/visual-qa/assets/TASK-FE-029/status-qa.cjs
node docs/visual-qa/assets/TASK-FE-029/regression-qa.cjs
node docs/visual-qa/assets/TASK-FE-029/edge-qa.cjs
node docs/visual-qa/assets/TASK-FE-029/post-build.cjs
```

- Before 69검사/29장, After 69검사/29장 PASS. 마지막 문구 보완 후 선택 결과 3폭 재촬영·17검사 PASS(After 누적 86).
- [상태 전환](assets/TASK-FE-029/status-results.json): 168검사·9전환 PASS. 보류→성공/0건/실패, live status 갱신, 키보드 맵·요원·스킬 이동, 위치 정보 누락, 예시/실제 0건 구분.
- [기존 동작 회귀](assets/TASK-FE-029/regression-results.json): 262검사·17배치 PASS. 필터·맵 변경·공수 회전·선택 초기화·핀·경로·상세 링크 및 공통 메뉴 동작.
- [경계값](assets/TASK-FE-029/edge-results.json): 경로 없는 자료와 시작 위치 없는 자료 4검사 PASS. 경로를 임의 생성하지 않고, 표시 가능한 위치에 맞춰 안내한다.
- [비교](assets/TASK-FE-029/comparison.json): 29조건의 핀·경로·회전·카드수·링크·내비게이션 동일. 기존 bundled Python/Pillow로 홈·프로필 PNG 차이 0 확인.
- [소스 보존](assets/TASK-FE-029/source-preservation.json): API·데이터·타입·전역 CSS·공통 헤더·메뉴·언어·패키지 등 13파일 byte 동일.
- TypeScript/Lint/production build PASS. 컴파일·타입·Lint 및 정적 12페이지 생성. 기존 컨테이너의 `git: not found` 안내와 관계없이 빌드는 종료 코드 0이다.
- [개발 서버 복원](assets/TASK-FE-029/post-build.json): 홈·프로필·라인업·스모크 모바일 HTTP200, 안내·가로 넘침0·브라우저 예외0 확인 PASS.
- 브라우저 예외·예상 밖 콘솔 오류 0. 응답 503 오류는 의도한 실패 시나리오로 구분했다.

## 발견 및 보완

시작·도착 위치가 있어도 경로점은 없을 수 있다. 독립 코드 검토와 경계값 조사에서 완료 문구가 경로 표시를 보장하던 점을 발견하여 “선택한 시작 위치를 표시하고 있어요”로 좁혔다. 데이터·경로 렌더 조건은 바꾸지 않았다. 해당 화면을 다시 촬영하고 동작을 확인했다.

경계값 검사 첫 실행에는 이미 보완된 문구에 대해 “경로 없음까지 설명할 것”을 추가 요구하는 잘못된 기대가 있었다. 이번 요구사항인 표시 내용과 안내의 일치 여부로 기대를 바로잡고 실제 시작 핀·경로 없음·상세 링크 보존을 검증했다.

## 판정과 제한

**PASS — 상태 안내·시각·기존 동작 검증 통과.** 스크린리더는 실제 발화를 청취한 것이 아니라 DOM의 role/status·aria-atomic 및 전환 갱신을 확인했다. 별도 Cursor 리뷰를 수행한 것으로 간주하지 않는다.

운영 API/게임 자료의 정확성, 상세·관리자 테마, 본문 번역 확대, 배포는 이번 범위 밖이다. 사용자 요청에 따라 검증된 변경을 커밋·PR로 제출하며 병합은 사용자가 수행한다.
