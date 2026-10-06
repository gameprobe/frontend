# TASK-FE-038 — 관리자 메뉴·목록·편집 흐름 Visual QA

## 결과

Status: PASS — 2026-10-04, localhost:3000/admin/preview, Chromium, 1440px / 390px.

Playwright 실행 결과 JSON으로 생성했다. Before 8장, After 20장, 기존 지도 편집 회귀 14장.

## Before / After 대조

| 화면 | Before | After | 확인 결과 |
|---|---|---|---|
| 1440px 진입 화면 | [기존 목록+편집](assets/TASK-FE-038/before-1440-lineup-editor-sidebar.png) | [메뉴+목록](assets/TASK-FE-038/after-1440-lineup-list.png) | 진입 시 목록을 먼저 표시. PC 왼쪽 메뉴, 모바일 위쪽 메뉴와 본문 구분. |
| 1440px 공략 편집 | [기존 편집](assets/TASK-FE-038/before-1440-lineup-editor-sidebar.png) | [분리된 편집](assets/TASK-FE-038/after-1440-lineup-editor.png) | 목록으로 이동 버튼과 관리 메뉴 유지. 입력·지도·공유 도착점 안내 보존. |
| 1440px 미리보기 | [기존 미리보기](assets/TASK-FE-038/before-1440-preview.png) | [미리보기](assets/TASK-FE-038/after-1440-smoke-preview.png) | 자료와 지도 구획 유지. 서로 다른 공략 상태이므로 픽셀 동일 비교가 아닌 구조 대조. |
| 390px 진입 화면 | [기존 목록+편집](assets/TASK-FE-038/before-390-lineup-editor-sidebar.png) | [메뉴+목록](assets/TASK-FE-038/after-390-lineup-list.png) | 진입 시 목록을 먼저 표시. PC 왼쪽 메뉴, 모바일 위쪽 메뉴와 본문 구분. |
| 390px 공략 편집 | [기존 편집](assets/TASK-FE-038/before-390-lineup-editor-sidebar.png) | [분리된 편집](assets/TASK-FE-038/after-390-lineup-editor.png) | 목록으로 이동 버튼과 관리 메뉴 유지. 입력·지도·공유 도착점 안내 보존. |
| 390px 미리보기 | [기존 미리보기](assets/TASK-FE-038/before-390-preview.png) | [미리보기](assets/TASK-FE-038/after-390-smoke-preview.png) | 자료와 지도 구획 유지. 서로 다른 공략 상태이므로 픽셀 동일 비교가 아닌 구조 대조. |

## 기능 검증

| 항목 | 1440px | 390px |
|---|---|---|
| 목록 우선 진입 | PASS | PASS |
| 키보드 공략 열기 | PASS | PASS |
| 종류별 검색·상태 유지 | PASS | PASS |
| 결과 없음·조건 초기화 | PASS | PASS |
| 미저장 전환 취소/승인 | PASS | PASS |
| 저장 후 편집 유지 | PASS | PASS |
| 저장 후 조건 유지 | PASS | PASS |
| 신규 라인업 | PASS | PASS |
| 신규 스모크 | PASS | PASS |
| 미리보기 | PASS | PASS |
| 재로드 초기화 | PASS | PASS |

- 입장·목록 복귀·편집 전환 후 해당 H2 초점 확인. 최초 입장 초점 누락을 발견해 수정했고 최종 재검증 PASS.
- 미저장 확인 취소 시 편집/미리보기와 입력·좌표·관리 종류를 그대로 보존. 저장 성공 후 목록 복귀는 추가 확인 없음.
- 저장한 제목/상태가 기존 검색 조건과 불일치하면 결과에 나오지 않는 것이 정상이며 조건은 자동 초기화하지 않는다.
- 브라우저 오류 0, API 요청 0, 문서 가로 넘침 0. 모바일은 실제 touch 이벤트로 지도 조작 검증.

## 기존 지도 편집 회귀

PC 마우스/모바일 터치 드래그, 방향키, Esc/터치 취소, 지도 경계 제한, 중복 지점 방지, 공유 도착점 수정 취소/검증 실패 격리/저장 전파, 단독 도착점, 벽 끝, 같은 도착점 신규 공략, 경유·반사·마지막 지점 취소, 목록 왕복, 미리보기 및 재로드를 통과했다.

## 정성 시각 검토

- 구현자와 독립 검토자가 실제 Before/After PNG를 직접 열어 비교했다. 새 외부 레퍼런스는 없으며 사용자 승인 구조 및 기존 FE-037 테마를 기준으로 확인했다.
- PC 메뉴/검색/목록 구분, 모바일 가로 메뉴 및 세로 목록, 행의 제목·자료 형식·상태, 편집 지도/안내에 겹침·잘림 없음.
- 제목의 노란 테두리는 키보드 초점 검증 시 표시된 의도된 focus-visible 표시다.
- 독립 코드·시각 검토: PASS, 미해결 지적 없음. 별도 Cursor 실행 결과를 의미하지 않는다.

## 실행 명령 및 한계

```sh
PLAYWRIGHT_MODULE=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-038/verify.cjs before
PLAYWRIGHT_MODULE=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-038/verify.cjs after
PLAYWRIGHT_MODULE=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-038/editor-regression.cjs
```

프론트 메모리 예시만 검증했다. 실제 관리자 인증, 영구 저장, API/DB, 공개 라인업 연동은 이번 변경 대상이 아니다. 브라우저 새로고침/페이지 이탈은 기존 안내대로 초기화되며, 이번 미저장 확인은 예시 화면 내부 메뉴·목록 전환에 적용된다.

## 모든 캡처와 실행 결과

- [before-1440-gate.png](assets/TASK-FE-038/before-1440-gate.png)
- [before-1440-lineup-editor-sidebar.png](assets/TASK-FE-038/before-1440-lineup-editor-sidebar.png)
- [before-1440-preview.png](assets/TASK-FE-038/before-1440-preview.png)
- [before-1440-smoke-editor-sidebar.png](assets/TASK-FE-038/before-1440-smoke-editor-sidebar.png)
- [before-390-gate.png](assets/TASK-FE-038/before-390-gate.png)
- [before-390-lineup-editor-sidebar.png](assets/TASK-FE-038/before-390-lineup-editor-sidebar.png)
- [before-390-preview.png](assets/TASK-FE-038/before-390-preview.png)
- [before-390-smoke-editor-sidebar.png](assets/TASK-FE-038/before-390-smoke-editor-sidebar.png)
- [after-1440-gate.png](assets/TASK-FE-038/after-1440-gate.png)
- [after-1440-lineup-list.png](assets/TASK-FE-038/after-1440-lineup-list.png)
- [after-1440-lineup-editor.png](assets/TASK-FE-038/after-1440-lineup-editor.png)
- [after-1440-smoke-filtered-list.png](assets/TASK-FE-038/after-1440-smoke-filtered-list.png)
- [after-1440-empty-list.png](assets/TASK-FE-038/after-1440-empty-list.png)
- [after-1440-dirty-preview.png](assets/TASK-FE-038/after-1440-dirty-preview.png)
- [after-1440-saved-editor.png](assets/TASK-FE-038/after-1440-saved-editor.png)
- [after-1440-new-lineup.png](assets/TASK-FE-038/after-1440-new-lineup.png)
- [after-1440-smoke-preview.png](assets/TASK-FE-038/after-1440-smoke-preview.png)
- [after-1440-smoke-list.png](assets/TASK-FE-038/after-1440-smoke-list.png)
- [after-390-gate.png](assets/TASK-FE-038/after-390-gate.png)
- [after-390-lineup-list.png](assets/TASK-FE-038/after-390-lineup-list.png)
- [after-390-lineup-editor.png](assets/TASK-FE-038/after-390-lineup-editor.png)
- [after-390-smoke-filtered-list.png](assets/TASK-FE-038/after-390-smoke-filtered-list.png)
- [after-390-empty-list.png](assets/TASK-FE-038/after-390-empty-list.png)
- [after-390-dirty-preview.png](assets/TASK-FE-038/after-390-dirty-preview.png)
- [after-390-saved-editor.png](assets/TASK-FE-038/after-390-saved-editor.png)
- [after-390-new-lineup.png](assets/TASK-FE-038/after-390-new-lineup.png)
- [after-390-smoke-preview.png](assets/TASK-FE-038/after-390-smoke-preview.png)
- [after-390-smoke-list.png](assets/TASK-FE-038/after-390-smoke-list.png)
- [editor-1440-dragged-editor.png](assets/TASK-FE-038/editor-1440-dragged-editor.png)
- [editor-1440-dragged-preview.png](assets/TASK-FE-038/editor-1440-dragged-preview.png)
- [editor-1440-shared-staged.png](assets/TASK-FE-038/editor-1440-shared-staged.png)
- [editor-1440-single-smoke.png](assets/TASK-FE-038/editor-1440-single-smoke.png)
- [editor-1440-wall-preview.png](assets/TASK-FE-038/editor-1440-wall-preview.png)
- [editor-1440-new-shared-smoke.png](assets/TASK-FE-038/editor-1440-new-shared-smoke.png)
- [editor-1440-new-shared-preview.png](assets/TASK-FE-038/editor-1440-new-shared-preview.png)
- [editor-390-dragged-editor.png](assets/TASK-FE-038/editor-390-dragged-editor.png)
- [editor-390-dragged-preview.png](assets/TASK-FE-038/editor-390-dragged-preview.png)
- [editor-390-shared-staged.png](assets/TASK-FE-038/editor-390-shared-staged.png)
- [editor-390-single-smoke.png](assets/TASK-FE-038/editor-390-single-smoke.png)
- [editor-390-wall-preview.png](assets/TASK-FE-038/editor-390-wall-preview.png)
- [editor-390-new-shared-smoke.png](assets/TASK-FE-038/editor-390-new-shared-smoke.png)
- [editor-390-new-shared-preview.png](assets/TASK-FE-038/editor-390-new-shared-preview.png)
- [before.json](assets/TASK-FE-038/before.json)
- [after.json](assets/TASK-FE-038/after.json)
- [editor-results.json](assets/TASK-FE-038/editor-results.json)
