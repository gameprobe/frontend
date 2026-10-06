# TASK-FE-037 Visual QA — 도착점 중심의 개별 공략 등록

## 최신 도착점 이동·선택 상자 검증 (2026-10-04)
- 이 절은 shared-destination-before.json / shared-destination-after.json으로 자동 생성했다. 아래 이전 단계 기록은 당시 범위와 결과다.
- Verdict: PASS — 구현자 및 독립 에이전트 코드·시각 검토. Cursor 공식 리뷰 미수행.
- 단독 도착점은 바로 이동하고 공유 도착점은 영향 공략 수를 확인한 뒤 ‘도착점 수정’으로 활성화한다. 저장 성공 시 같은 종류·맵·도착점 ID의 좌표만 함께 반영하며 취소는 도착 좌표만 복구한다. 선택 상자 화살표를 오른쪽 테두리에서 12px 안쪽으로 배치하고 글자 공간 36px을 확보했다.
- Playwright Before 4장 / After 14장. PC1440 마우스·모바일390 CDP touch. 실행 오류/API 요청0, 가로 넘침 없음.

| 검증 | PC | 모바일 |
|---|---|---|
| 도착점 취소 시 다른 입력 유지 | PASS | PASS |
| 저장 실패 시 다른 공략 보존 | PASS | PASS |
| 성공 저장 시 공유 좌표 반영 | PASS | PASS |
| 공략별 출발/경로/자료 보존 | PASS | PASS |
| 선택/저장 시 수정 활성화 해제 | PASS | PASS |
| 현재 공략의 새 도착점 분리 | PASS | PASS |
| 단독 도착점 바로 이동 | PASS | PASS |
| 새 공략 포함 영향 수와 반영 | PASS | PASS |
| 미리보기 | PASS | PASS |
| 새로고침 초기화 | PASS | PASS |

- Before: [PC](assets/TASK-FE-037/shared-destination-before-1440-shared-editor.png) / [모바일](assets/TASK-FE-037/shared-destination-before-390-shared-editor.png).
- 공유 수정 After: [PC](assets/TASK-FE-037/shared-destination-after-1440-shared-staged.png) / [모바일](assets/TASK-FE-037/shared-destination-after-390-shared-staged.png).
- 선택 상자 After: [PC](assets/TASK-FE-037/shared-destination-after-1440-select-spacing.png) / [모바일](assets/TASK-FE-037/shared-destination-after-390-select-spacing.png).
- 두 화면 각각 select10개: appearance:none, 화살표 오른쪽12px 여백, 텍스트 오른쪽36px 확보. 네이티브 선택 상자와 키보드 조작은 유지한다.
- Visual debugging: 저장 안내/오류가 첫 드래그 때 제거되어 지도가 움직이는 문제를 고쳤다. 안내 공간을 유지하여 저장 직후·검증 실패 직후에도 지도 위치가 안정적이다. 숨긴 오류 설명은 접근성 참조에서도 해제했다. 숨긴 안내 공간이 다음 저장/선택까지 남는 것은 이 동작을 위한 의도적 처리다.
- 기존 등록16장·드래그12장 회귀 PASS. 모델30/30·타입/Lint·최종 격리 빌드 PASS.

## 최종 드래그 검증 (2026-10-04)
- Verdict: PASS — 구현자 및 독립 에이전트 코드·시각 검토. Cursor 공식 리뷰는 아직 미수행.
- 이미 지정한 출발·새 도착·경유·튕김·벽 끝을 마우스/터치로 끌어 수정한다. 방향키 미세 조정, Shift+방향키 크게 이동, Esc/터치 취소 복구를 지원한다. 공유 도착점은 잠금을 유지하며 드래그 후 새 지점이 추가되지 않는다.
- Playwright `drag.cjs before` / `after`: Before 4장, After 12장. PC 1440px 실제 마우스 및 모바일 390px CDP touch 입력 검증.
- 브라우저 오류/API 요청0, 가로 넘침 없음. 기존 `destination.cjs after`도 16장 전체 재검증 PASS.

| 항목 | PC 마우스 | 모바일 터치 |
|---|---|---|
| 출발·경유·튕김·새 도착점·벽 끝 드래그 | PASS | PASS |
| 공유 도착점 잠금·다른 점 보존 | PASS | PASS |
| 지도 경계 보정·이후 재이동 | PASS | PASS |
| Esc 취소·방향키 조정 | PASS | PASS |
| 이동 후 추가 점 생성 방지 | PASS | PASS |
| 저장/재선택/미리보기 경로 일치 | PASS | PASS |
| 터치 취소 시 기존 위치 복구 | 해당 없음 | PASS |

- 편집 Before [PC](assets/TASK-FE-037/drag-before-1440-editor.png) / [모바일](assets/TASK-FE-037/drag-before-390-editor.png), After [PC](assets/TASK-FE-037/drag-after-1440-editor.png) / [모바일](assets/TASK-FE-037/drag-after-390-editor.png).
- 미리보기 Before [PC](assets/TASK-FE-037/drag-before-1440-preview.png) / [모바일](assets/TASK-FE-037/drag-before-390-preview.png), After [PC](assets/TASK-FE-037/drag-after-1440-preview.png) / [모바일](assets/TASK-FE-037/drag-after-390-preview.png).
- 드래그 결과 [PC](assets/TASK-FE-037/drag-after-1440-dragged-existing.png) / [모바일 미리보기](assets/TASK-FE-037/drag-after-390-dragged-preview.png).
- 독립 검토에서 미리보기 경로선이 마커 숫자를 덮는 쌓임 순서를 발견해 수정했다. 최종 직접 비교에서 숫자·경로 구분 및 레이아웃 정상.
- QA 보완: 기존 빈 지도 클릭 검사는 새로 생긴 마커 hit 영역 밖으로 옮겼고, 드래그 검사는 고정 헤더에 가리지 않도록 지도를 중앙으로 이동한 후 실제 마커 hit 및 경계에서 재이동을 검증한다.
- 최종 타입/Lint/격리 프로덕션 빌드 PASS. 모델 테스트23/23 PASS, skip0. 아래 도착점 중심/이전 UI 기록은 단계별 이력이다.


## 최종 결과 (2026-10-04)
- Verdict: PASS — 구현자 및 독립 에이전트 직접 코드·시각 검토. Cursor 공식 리뷰는 미수행.
- 도착점 ID를 공유하는 개별 공략 등록으로 단순화했다. 같은 도착점에 공략 추가 시 맵·요원·스킬·도착점은 재사용하고 출발점·경유/튕김·자료는 새로 입력한다. 기존 도착점 잠금과 명시적 새 도착점 분리로 다른 공략을 보호한다.
- 최종 비교: Before 6장 / After 16장, 회귀 6장. 1440×1000 및 390×1000, Playwright Chrome.
- 원본 Before는 변경 전의 복수 경로 UI를 별도 캡처했다. 이전 단계 캡처는 아래 이력에 남겼다.
- 실제 공개 라인업 동작 변경은 포함하지 않는다. 첨부 Strats 화면은 같은 도착점에 여러 출발 공략을 연결하는 데이터 관계의 참고이며 전체 디자인 복제를 목표로 하지 않는다.

| 화면 | Before | 최종 After |
|---|---|---|
| 편집 | [PC](assets/TASK-FE-037/destination-before-1440-editor.png) · [모바일](assets/TASK-FE-037/destination-before-390-editor.png) | [PC](assets/TASK-FE-037/destination-after-1440-editor.png) · [모바일](assets/TASK-FE-037/destination-after-390-editor.png) |
| 미리보기 | [PC](assets/TASK-FE-037/destination-before-1440-preview.png) · [모바일](assets/TASK-FE-037/destination-before-390-preview.png) | [PC](assets/TASK-FE-037/destination-after-1440-preview.png) · [모바일](assets/TASK-FE-037/destination-after-390-preview.png) |
| 코드 입력 | [PC](assets/TASK-FE-037/destination-before-1440-gate.png) · [모바일](assets/TASK-FE-037/destination-before-390-gate.png) | [PC](assets/TASK-FE-037/destination-after-1440-gate.png) · [모바일](assets/TASK-FE-037/destination-after-390-gate.png) |

| 최종 동작 | 1440 | 390 |
|---|---|---|
| 같은 도착점 재사용·새 출발/영상 입력 | PASS | PASS |
| 공략별 수정 격리·저장 후 재선택 | PASS | PASS |
| 도착점 잠금·명시적 분리·새 ID | PASS | PASS |
| 일반 경유/벽 튕김·취소·선택 도구 접기 | PASS | PASS |
| 신규 도착→출발 자동 전환·맵 변경 초기화 | PASS | PASS |
| 키보드 좌표 지정·출발/경로 초기화 | PASS | PASS |
| 벽형 스모크 필수 끝점·원형 변경 | PASS | PASS |
| 입력 오류·검색/상태 필터·미저장 이동 확인 | PASS | PASS |
| 예시 코드 오류/성공·새로고침 초기화 | PASS | PASS |
| 긴 도착점 이름의 미리보기 가로 넘침 | PASS | PASS |

### 발견·수정 및 시각 평가
- 독립 검토에서 80자 영문 도착점 이름이 모바일 문서 폭을 846px로 늘리는 문제를 재현했다. 메타데이터 열의 최소 폭과 값 줄바꿈을 수정하고 동일 입력으로 재검증했다.
- 최종 PC/모바일 편집·동일 도착점 추가·저장 미리보기·벽형·긴 이름 10장 직접 검토: 지도 침범, 글자 겹침, 가로 넘침 없음.
- 타입 검사에서 ES5 대상의 Map iterator spread 오류를 발견해 Array.from으로 수정했다. 최종 타입/Lint/빌드 PASS.
- 새 도착점 추가 예시: [PC](assets/TASK-FE-037/destination-after-1440-add-same-destination.png) · [모바일](assets/TASK-FE-037/destination-after-390-add-same-destination.png).
- 저장한 공략: [PC](assets/TASK-FE-037/destination-after-1440-saved-preview.png) · [모바일](assets/TASK-FE-037/destination-after-390-saved-preview.png).
- 벽형: [PC](assets/TASK-FE-037/destination-after-1440-wall.png) · [모바일](assets/TASK-FE-037/destination-after-390-wall.png).
- 긴 이름: [PC](assets/TASK-FE-037/destination-after-1440-long-name-preview.png) · [모바일](assets/TASK-FE-037/destination-after-390-long-name-preview.png).

### 최종 검사 기록
- `destination.cjs before` / `after`: 최종 동작 검증. JSON에서 표·캡처 목록을 생성.
- `destination-regression.cjs`: 기존 관리자 인증과 예시 링크 유지, 브라우저 API/외부 example.com 미디어 요청 0, 실제 관리자 토큰 생성 없음.
- `destination-comparison.json`: 홈/Insights/라인업/스모크 각각 비교 픽셀 차이 0.
- `model.test.cjs`: 개별 공략 계약으로 기존 URL/정규화 좌표/30점 제한/반사/불변성 테스트를 갱신하고 도착점 재사용·격리·그룹 ID 검사를 추가, 18/18 PASS, skip 0.
- 아래 verify.cjs·multiroute.cjs와 수치는 요구사항 변경 전 UI의 검증 이력이다. 최종 UI 검증 명령은 위 destination 계열이다.

## 이전 구현 단계의 검증 이력

## 결과
- Verdict: PASS (구현자 직접 확인 및 독립 에이전트 코드·화면 검토). Cursor의 별도 공식 리뷰는 아직 수행되지 않았다.
- 기준: 기존 GameProbe 공통 관리자/홈 테마와 사용자가 첨부한 여러 번 꺾이는 지도 경로. 지도·요원 이미지 재사용, 자동 탄도 계산이 아닌 수동 경로 입력이다.
- 대상: `http://127.0.0.1:3000`, Docker 개발 서버, Chrome Playwright, 한국어, 1440×1000 / 390×1000.
- 이 보고서의 캡처 목록과 검사 표는 verify.cjs 결과 JSON에서 생성했다.

## Before / After
새 경로의 Before는 구현 전 404이며, 기존 `/admin`에는 예시 진입 링크만 추가했다.

| 대상 | Before | After |
|---|---|---|
| 관리자 인증 | [1440](assets/TASK-FE-037/before-1440-admin.png) · [390](assets/TASK-FE-037/before-390-admin.png) | [1440](assets/TASK-FE-037/after-1440-admin.png) · [390](assets/TASK-FE-037/after-390-admin.png) |
| 예시 진입 | [1440 404](assets/TASK-FE-037/before-1440-preview-missing.png) · [390 404](assets/TASK-FE-037/before-390-preview-missing.png) | [1440 코드 입력](assets/TASK-FE-037/after-1440-entry-code.png) · [390 코드 입력](assets/TASK-FE-037/after-390-entry-code.png) |
| 입력/지도 | 해당 화면 없음 | [1440](assets/TASK-FE-037/after-1440-editor.png) · [390](assets/TASK-FE-037/after-390-editor.png) |
| 꺾임·튕김 편집 | 해당 화면 없음 | [1440](assets/TASK-FE-037/after-1440-bent-route-editor.png) · [390](assets/TASK-FE-037/after-390-bent-route-editor.png) |
| 꺾임·튕김 미리보기 | 해당 화면 없음 | [1440](assets/TASK-FE-037/after-1440-bent-route-preview.png) · [390](assets/TASK-FE-037/after-390-bent-route-preview.png) |
| 벽형 스모크 | 해당 화면 없음 | [1440](assets/TASK-FE-037/after-1440-smoke-wall.png) · [390](assets/TASK-FE-037/after-390-smoke-wall.png) |

## 실제 검증
- Before 8장, After 18장. 브라우저 실행 오류 0건, 관리자 브라우저 API 요청 0건.

| 검사 | 1440 | 390 |
|---|---|---|
| 예시 코드 오류/성공 | PASS | PASS |
| 시작/경유/튕김/도착 순서 | PASS | PASS |
| 경로 미리보기 및 저장 후 재선택 | PASS | PASS |
| 신규/수정·중복 방지 | PASS | PASS |
| 검색/상태 필터 | PASS | PASS |
| 자료 URL 형식 및 위험 스킴 거절 | PASS | PASS |
| 지도 정규화 좌표/정사각 영역 | PASS | PASS |
| 맵 변경 시 좌표 초기화 | PASS | PASS |
| 벽형 끝점 및 원형 전환 | PASS | PASS |
| 방향키/Enter로 좌표 지정 | PASS | PASS |
| 미저장 변경 이동 취소/확인 | PASS | PASS |
| 재입장/자료 초기화 | PASS | PASS |

- 모든 화면 검사 완료 시 가로 넘침 없음, 실제 관리자 토큰 세션 저장 없음.
- `npx tsc --noEmit`, `npm run lint`: PASS.
- `node src/features/admin/preview/model.test.cjs`: 15/15 PASS, skip 0. 입력/URL/좌표/벽 끝/경유점·튕김 종류/합산 30개 제한/불변성 검증.
- Docker 별도 `/tmp/fe037-build-*`에서 `npm run build`: PASS, 정적 페이지 15개 생성. 기존 개발 서버 산출물 보존.
- 컨테이너 Git 미설치로 기존 버전 조회 경고가 출력되나 Lint/빌드 정상 종료.

## 기존 화면 회귀
1440×1000 동일 조건 캡처의 전체 픽셀 비교:

| 화면 | 다른 픽셀 수 |
|---|---:|
| home | 0 |
| insights | 0 |
| lineups | 0 |
| smokes | 0 |

[비교 원본](assets/TASK-FE-037/comparison.json), [Before 결과](assets/TASK-FE-037/before.json), [After 결과](assets/TASK-FE-037/after.json).

## 정성 평가 및 검증 도구 수정
- PC에서 자료 목록·기본 정보·지도 구분과 공통 색상/서체가 유지된다. 모바일은 한 열로 재배치되며 입력/버튼/지도와 안내가 겹치지 않는다.
- 시작/도착 앵커와 순서 번호가 있는 일반 경유점(원), 벽 튕김(마름모)을 연결했다. 같은 데이터로 편집 및 미리보기 경로를 그린다.
- 최초 긴 화면 캡처에서 스크롤된 상태의 고정 메뉴가 문서 중간에 잡혔다. 독립 리뷰 지적에 따라 촬영 전 맨 위 이동 및 2프레임 대기 후 재촬영했다. 최종 18장 재검사와 직접/독립 시각 검토 PASS.
- 초기 QA의 숨긴 이미지 로드 대기 및 Next.js 경로 알림과의 role=alert 선택 충돌은 검사 대상 선택자를 좁혀 해결했다. 실제 앱 오류로 처리하거나 검증을 생략하지 않았다.

## 재현
```sh
PLAYWRIGHT_MODULE=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-037/verify.cjs after
docker exec valorant-frontend-dev-frontend-1 npx tsc --noEmit
docker exec valorant-frontend-dev-frontend-1 npm run lint
docker exec valorant-frontend-dev-frontend-1 node src/features/admin/preview/model.test.cjs
```
Before는 구현 전 코드에서 위 스크립트의 `before` 인수로 캡처했다.

## 경계
공개 체험 코드 `DEMO1234`는 보안 인증 수단이 아니다. 메모리 예시 저장만 제공하며 실제 DB/API/게시/미디어 로드·검증과 연결하지 않았다. 지도는 원본 방향, 경유/튕김은 직접 지정한다. 공략 정확성·충돌 감지·반사 각도·탄도는 검증하지 않는다.

## 후속 검증 — 하나의 시작점에서 복수 도착 경로

사용자 피드백에 따라 같은 자료가 공통 시작점 하나와 여러 경로를 갖도록 확장했다. 경로마다 도착/경유/튕김/벽 끝이 독립이며, 설명/자료 URL/스모크 형태는 같은 자료의 공통 정보다. 도착 번호는 경로 번호, 중간 점의 표기는 경로 번호.지점 순서다.

- Before: 기존 단일 경로 화면 1440/390px 편집·미리보기 4장.
- After: 기본 두 경로, 세 경로 편집/전체 미리보기, 복수 벽형 스모크 등 10장.
- [PC Before](assets/TASK-FE-037/multiroute-before-1440-editor.png) → [PC After](assets/TASK-FE-037/multiroute-after-1440-three-routes-editor.png)
- [모바일 Before](assets/TASK-FE-037/multiroute-before-390-preview.png) → [모바일 After](assets/TASK-FE-037/multiroute-after-390-three-routes-preview.png)
- [복수 벽형 스모크](assets/TASK-FE-037/multiroute-after-390-multiple-walls.png)

아래 표는 `multiroute-after.json`에서 생성했다.

| 검사 | 1440 | 390 |
|---|---|---|
| 공통 시작점 이동 | PASS | PASS |
| 선택 경로만 수정/되돌리기 | PASS | PASS |
| 모든 경로 도착점 검증 | PASS | PASS |
| 복수 경로 저장·재선택·미리보기 동일 | PASS | PASS |
| 중간 경로 삭제 후 식별/좌표 보존 | PASS | PASS |
| 선택 경로만 비우기 | PASS | PASS |
| 맵 변경 시 전체 경로 초기화 | PASS | PASS |
| 경로별 벽 끝·형태 전환 | PASS | PASS |
| 전체 초기화·마지막 경로 보호 | PASS | PASS |
| 새로고침 후 예시 초기화 | PASS | PASS |

- 실행: `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-037/multiroute.cjs before` / `after` PASS. 오류0/API요청0/가로넘침0.
- 기존 `verify.cjs after` 전체18장 재검증 PASS. 예시 코드·URL·등록·필터·키보드·이동 취소 등의 기존 검사 유지, 초기 샘플 도착 개수만 최신 사양(두 경로)에 맞춤.
- 최종 `npx tsc --noEmit`, `npm run lint`, 별도 `/tmp/fe037-multiroute-build-*`의 `npm run build` PASS. 모델 15/15 PASS, 모든 기존 불변식 검사 유지 및 경로 격리/공통 시작/전체 검증/추가·삭제 테스트 확장.
- 홈·Insights·라인업·스모크 픽셀 비교를 최종 캡처로 재실행: 각각 차이0.
- 직접 및 독립 코드·시각 검토 Verdict: PASS. 번호·색상으로 경로를 구분하며 모바일 줄바꿈과 전체 미리보기에서 겹침/잘림 없음.
- 이번 보완도 프론트 예시에 한정하며 실제 DB/API/관리자 인증/공개 라인업·스모크 조회는 변경하지 않았다. 경로는 화면당 최대10개, 각 경로 중간 지점30개.
