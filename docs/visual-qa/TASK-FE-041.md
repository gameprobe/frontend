# TASK-FE-041 Visual QA — 상세 지도 겹친 마커 선택

## 결과

**PASS — 2026-10-05.** PC 1440px, 터치 390px·320px에서 겹친 스킬을 번호·이름 버튼으로 각각 선택하고 해당 자료를 확인할 수 있다. 지도 마커와 선택 버튼의 상태가 함께 바뀌며, 선택된 마커와 키보드 포커스 마커가 겹친 마커보다 앞에 표시된다. 위치·경로 데이터는 바뀌지 않았다.

최초 기능 검증 후 Root의 화면 검토에서 공통 버튼 초기화 스타일 때문에 새 선택 버튼의 배경·테두리가 사라진 결함을 발견했다. 제품 CSS의 선택자 우선순위를 보완한 뒤 전체 25개 검사 묶음을 재실행했다. 최종 검증에는 실제 계산 스타일의 배경·1px 테두리·선택 색상 확인도 포함한다.

## 검증 환경과 데이터

- 로컬 개발 화면 `http://localhost:3000`, 번들 Chromium/Playwright 사용.
- 모든 `/api/**` 요청을 브라우저에서 가로채 합성 응답을 반환했다. GET 이외 요청은 차단하도록 설정했으며 실제 쓰기 시도는 0건이다. 실제 백엔드·DB 자료를 읽거나 수정하지 않았다.
- 첫째·둘째 스킬: 같은 좌표 `(0.5, 0.5)`, 같은 `sova-recon-bolt` 이름, 서로 다른 원본 URL.
- 셋째 스킬: 가까운 좌표 `(0.502, 0.498)`, 긴 이름, 영상 URL 없음.
- 공격·수비 방향을 각각 검사하고, 0개·1개 스킬도 별도로 확인했다.
- Before는 제품 변경 전에 임시 캡처 도구로 촬영했다. 최종 저장 스크립트는 같은 합성 사례에 대한 `before`/`after` 모드를 제공한다. 현재 제품에서 Before를 다시 촬영한 것은 아니다.

## Before / After

| 너비 | Before | 최종 After |
| --- | --- | --- |
| 1440px | [지도 패널](assets/TASK-FE-041/before-1440-map.png) | [지도·선택 패널](assets/TASK-FE-041/after-1440-map.png) |
| 390px | [지도 패널](assets/TASK-FE-041/before-390-map.png) | [지도·선택 패널](assets/TASK-FE-041/after-390-map.png) |

Before는 선택된 1번 위에 3번 마커가 겹쳐 있고, 지도 아래에 개별 선택 수단이 없다. After는 번호·이름이 있는 버튼으로 각 자료에 접근할 수 있으며, 화면의 2번 선택 버튼과 지도 2번 마커가 일치한다. PC에서는 세 항목이 한 줄로 배치되고, 모바일에서는 세로로 쌓인다. 긴 이름은 버튼 안에서 줄바꿈되며 선택 표시와 겹치지 않는다.

최종 PC·모바일 PNG를 직접 열어 확인했다. 지도·요원 이미지, 경로, 선택 마커가 정상이며 버튼 배경과 선택 테두리가 명확하다. 최종 After는 캡처 시 세로 뷰포트를 충분히 확보하고 패널을 고정 내비게이션 아래로 스크롤하여 상단 가림을 제거했다. 제품 요소를 숨기거나 이미지를 후편집하지 않았다. 너비는 각각 1440px·390px로 유지했다. 저장 PNG는 핵심 영역 4장, 합계 약 224 KiB다.

## 자동 검증

| 항목 | 결과 |
| --- | --- |
| 1440/390/320px × 공격/수비, 동일·근접 좌표 선택 | PASS |
| 동일 이름의 1번·2번 원본 URL 구분, URL 없는 3번 안내, 1번 재선택 | PASS |
| 마우스·터치, Tab·Shift+Tab·Enter·Space | PASS |
| 지도·선택 버튼 `aria-pressed` 동기화, `aria-controls` 대상 연결 | PASS |
| 선택 마커 z-index 4, 포커스 마커 z-index 5 및 실제 최상단 히트 검사 | PASS |
| 모든 선택 전후 방향별 마커 좌표와 SVG 경로 동일 | PASS |
| 선택 버튼 높이 44px 이상, 긴 이름 줄바꿈 | PASS |
| 버튼 배경 `--raised`, 기본 테두리 `--line`, 선택 테두리 `--gold`, 1px solid | PASS |
| 0개·1개 스킬에서는 새 선택 섹션 없이 기존 자료 표시 유지 | PASS |
| 실행 예외·깨진 이미지·가로 넘침·API 쓰기 시도 | 모두 0 |

`marker-selection.cjs after`: **25개 검사 묶음 PASS**. 최종 결과는 [after-results.json](assets/TASK-FE-041/after-results.json), 변경 전 결과는 [before-results.json](assets/TASK-FE-041/before-results.json)에 저장했다.

기존 FE040 `detail-errors.cjs after`: **23개 검사 묶음 PASS**. 404/500/연결 실패, 예시 자료 fallback, 구형 자료의 선택별 URL 및 null/누락/빈 URL, 등록 자료의 이미지·영상, 스킬 없는 자료를 확인했다. 결과와 임시 화면은 `/tmp/fe041-errors`에만 저장했다. 이후 변경은 선택 버튼 CSS에 한정되어 이 검사를 중복 실행하지 않았다.

실행 명령:

```sh
PLAYWRIGHT_MODULE=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright \
  /Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  docs/visual-qa/assets/TASK-FE-041/marker-selection.cjs after

OUTPUT_DIR=/tmp/fe041-errors \
PLAYWRIGHT_MODULE=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright \
  /Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  docs/visual-qa/assets/TASK-FE-040/detail-errors.cjs after

git diff --check
```

세 명령 모두 종료 코드 0. 제품 타입 검사·Lint·단위 테스트·격리 빌드 결과는 Task의 Result에 별도로 기록한다.

## 남은 범위와 제약

- 원래 같은 위치에 있는 마커는 그대로 겹친다. 좌표 이동이나 자동 펼치기 없이 별도 선택 버튼과 표시 순서로 접근성을 보완한 범위다.
- 외부 영상 서비스 재생이나 실제 DB 연동은 이번 브라우저 합성 검증 범위가 아니다. 선택된 자료의 URL·빈 상태와 UI 상호작용을 확인했다.
- 별도 Cursor 검증자의 최종 판정을 대체하지 않는다.

## 추가 승인한 사용성 보완 — 최종 검증

선택 영역을 사이드바의 자료 패널 바로 위로 옮기고, 자료 제목에 선택한 번호·이름을 표시하며, 영상 없는 항목에 `자료 없음` 안내를 추가한 최종 상태를 검증했다. 위의 지도 영역 After 2장은 이전 단계의 기록으로 보존했다.

| 실제 뷰포트 | 보완 전 | 최종 보완 후 |
| --- | --- | --- |
| 1366×768 | [Before](assets/TASK-FE-041/usability-before-1366.png) | [After](assets/TASK-FE-041/usability-after-1366.png) |
| 390×844 | [Before](assets/TASK-FE-041/usability-before-390.png) | [After](assets/TASK-FE-041/usability-after-390.png) |

기존 25개 검사에 배치·선택 제목·빈 자료 안내 조건을 추가하고, 위 두 뷰포트의 동시 가시성 검사까지 **27개 PASS**. 선택 영역이 사이드바 안에서 자료 패널 바로 앞에 있고, 모바일에서는 지도 다음에 온다. 2번 선택 버튼과 `스킬 2 · Recon Bolt` 자료 제목이 같은 화면에서 가려지지 않고 보임을 자동 검사와 PNG 직접 열람으로 확인했다. 긴 이름과 `자료 없음` 표시는 넘치지 않는다. 빈 자료 항목도 선택 가능하고 안내가 `aria-describedby`로 연결된다. 0/1개 자료 제목은 기존 `자료 가이드`를 유지한다.

`OUTPUT_DIR=/tmp/fe041-final`로 `marker-selection.cjs after`를 실행했고, 기존 오류 회귀도 `OUTPUT_DIR=/tmp/fe041-final-errors`에서 1회 재실행하여 **23개 PASS**했다. 두 명령 모두 종료 코드 0. 최종 결과 JSON은 각 임시 디렉터리에 두고 기존 저장 JSON은 이전 단계 기록으로 보존했다. 모든 API는 합성 응답이며, 페이지 예외·깨진 이미지·가로 넘침·API 쓰기는 0건이다. 신규 저장 이미지는 위 After 두 장뿐이며, 제품 코드와 DB를 QA에서 변경하지 않았다.
