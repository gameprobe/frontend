# TASK-FE-040 Visual QA

## Scope and setup

- Reference: FE-037/038의 관리자 예시 디자인, FE-039 공개 라인업 도착점 선택 흐름. 기존 공통 색상·타이포·카드·지도 스타일을 재사용했다.
- Before: 기존 localhost:3000에서 UI 수정 전 1440px/390px 캡처 12장. 관리자 목록·공개 API 응답을 브라우저에서 가로채 실제 DB에 접근하지 않았다. 예시 화면의 Before는 입장 화면이다.
- After: 격리 프론트 localhost:3101, 백엔드 localhost:18080, 일회용 tmpfs MongoDB. 임시 토큰·합성 자료만 사용했다. 실제 Atlas 자료 등록·조회·삭제는 하지 않았다.
- 실행: `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-040/verify.cjs before`, `node docs/visual-qa/assets/TASK-FE-040/integration.cjs api`, `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-040/integration.cjs ui`.
- 실행 전 18080/3101에 테스트 환경을 준비해야 한다. integration 스크립트는 18080 외의 백엔드를 거절하며 생성한 공략 ID만 삭제한다. `qa-video.webm`은 자료 표시·재생 확인용 합성 영상이다.

## Before / After

| 화면 | Before | After | 확인 내용 |
|---|---|---|---|
| PC 로그인 | [Before](assets/TASK-FE-040/before-1440-login.png) | [After](assets/TASK-FE-040/after-1440-login.png) | 기존 공통 셸 유지, 실제 토큰 인증 |
| PC 목록 | [Before](assets/TASK-FE-040/before-1440-list.png) | [After](assets/TASK-FE-040/after-1440-list.png) | 관리 메뉴·검색·도착점 묶음·상태/삭제 |
| PC 편집 | [Before](assets/TASK-FE-040/before-1440-editor.png) | [After](assets/TASK-FE-040/after-1440-editor.png) | 예시와 같은 두 열 입력/지도, 중간 좌표 표시 |
| 모바일 목록 | [Before](assets/TASK-FE-040/before-390-list.png) | [After](assets/TASK-FE-040/after-390-list.png) | 위쪽 관리 메뉴·상태 조작·버튼 배치 |
| 모바일 편집 | [Before](assets/TASK-FE-040/before-390-editor.png) | [After](assets/TASK-FE-040/after-390-editor.png) | 입력/지도의 세로 배치, 가로 넘침 없음 |
| 공개 목록 | [Before](assets/TASK-FE-040/before-1440-public.png) | [After](assets/TASK-FE-040/after-1440-public.png) | 실제 공개 응답의 공유 도착점과 두 출발점 |
| 모바일 상세 | [Before](assets/TASK-FE-040/before-390-detail.png) | [After](assets/TASK-FE-040/after-390-detail-image.png) | 등록 이미지와 메타데이터, 출발→중간→도착 |

After 캡처 23장은 전체 [산출물 폴더](assets/TASK-FE-040/)에 있다. [영상 상세](assets/TASK-FE-040/after-1440-detail-video.png), [미리보기](assets/TASK-FE-040/after-1440-editor-preview.png), [기존 형식](assets/TASK-FE-040/after-390-legacy.png), [인증 만료](assets/TASK-FE-040/after-1440-expired.png), [입력 오류](assets/TASK-FE-040/after-390-validation.png), [메모리 예시](assets/TASK-FE-040/after-390-preview.png)도 확인했다.

## Verification

- 모델·요청·미디어 검사 79개 PASS: 관리자 예시30, 실제 등록9, 공개 경로17, 미디어12, API11.
- 타입 검사·Lint·격리 프로덕션 빌드 PASS. 새 런타임 의존성 없음.
- [실제 API 8개](assets/TASK-FE-040/integration-api-results.json) PASS: 인증, 중간점0/1/2, 영상/이미지 저장, 공개 상태, 기존 다중 마커 보존, 잘못된 요청, 삭제/404.
- [브라우저 19개](assets/TASK-FE-040/integration-ui-results.json) PASS: PC·모바일 등록→새로고침→편집→공개→비로그인 조회→비공개/삭제, 정확한 경로, 실제 영상 재생, 인증/통신 오류 복구, 미저장 이동 취소, 예시 메모리 격리.
- 임시 자료·컨테이너3개·전용 네트워크·프론트 복사본 정리 완료. [정리 결과](assets/TASK-FE-040/cleanup-results.json), [목록 시각 회귀2개](assets/TASK-FE-040/integration-list-results.json) PASS. 기존3000/8080 유지.
- 실행 예외·가로 넘침·깨진 이미지 0. 캡처는 이미지 decode 완료 후 수행했다.

## Review and repairs

- 독립 Codex 코드 검토에서 신규 화면의 동일 경로 전환 초기화 누락, 일시적 서버 오류 때 토큰 삭제, 기존 단문 스킬 ID 수정 거절을 발견했다. 세 가지 모두 수정 후 모델/실제 브라우저 회귀 PASS.
- 직접 및 독립 Codex 시각 검토: 기존 공통 어두운 배경·강조색·카드 간격을 유지하고 PC/모바일 편집·공개 상세에 겹침이 없다. Cursor 별도 검증은 수행하지 않았다.
- 모바일 목록의 ‘공개 상태’가 ‘공개 상 / 태’로 갈라지는 피드백을 `.agent-reports/VERDICT.json`에 기록했다. 문구는 줄바꿈을 막고 작업 묶음은 줄 이동을 허용하도록 수정했다. CSS만 반영한 최종 빌드와 PC/모바일 목록 재검증 2개 PASS. 수정 후 문구는 한 줄이며 가로 넘침·이미지 오류·실행 예외가 없다. 최종 캡처를 직접 재확인했다.

## Limits

- 초기 격리 검증에서는 Atlas에 쓰지 않았다. 아래 후속 검증에서 사용자 요청으로 예시 한 건을 실제 등록했다.
- 외부 제공자 링크 전체의 재생을 보증하지 않는다. YouTube는 허용된 embed 주소, 직접 영상은 video, 기타 영상은 원본 링크로 제공한다.
- 기존 등록 정보 없는 자료·다중 마커 자료는 상태 변경/삭제만 가능하며 자동 단일 공략 변환은 하지 않는다.
- 실제 공유 도착점은 일괄 이동하지 않는다. 새 도착점으로 분리해서 편집한다. 스모크는 독립 예시 상태를 유지한다.

## 실제 예시 등록 후속 검증 (2026-10-05)

- 사용자가 요청한 한 건을 실제 `/admin` UI로 등록·공개했다. Atlas 저장 ID: `15f99bbd-3982-469e-b447-09f4ffcc4064`, 제목: `[테스트] 어비스 브림스톤 A 사이트 · 꺾이는 경로`.
- Abyss / Brimstone / Q / 공격 / A 구역. 출발점 1개 → 중간점 1개 → 도착점 1개이며, 등록 후 새로고침과 비로그인 조회에서 좌표·자료 주소가 유지된다. 기존 자료는 변경하지 않았다. 확인용 한 건은 삭제하지 않고 남겼다.
- [Strats 원본](https://strats.gg/valorant/lineups/post-plant-molly-a-site-10727?map=abyss&agent=brimstone)을 직접 확인하고 영상 자료 주소로 연결했다. 영상/이미지를 내려받거나 재배포하지 않았다. 좌표는 참고 화면 기반 시각 예시이며 실제 게임 성공을 검증하지 않았음을 본문에 명시했다. 영상은 원본 링크로 열린다.
- 단위 검사 2개 추가 후 **81개 PASS**(예시30 + 등록10 + 공개 경로18 + 미디어12 + API11). 새 검사는 Brimstone 직접 입력 스킬ID·Q 슬롯·꺾임 좌표의 API 왕복 및 공수 방향 변환을 확인한다.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-040/registered-example.cjs --create`: **15개 PASS**, 실제 UI POST201 한 번. 관리자 로그인·저장·재조회·공개 API·도착점 선택·출발점 hover·상세 이동·자료 링크·모바일 넘침·실행 예외를 검증했다.
- 같은 스크립트를 `--create` 없이 재실행: **14개 PASS**, 추가 생성0. 기존 등록 ID를 결과 파일에서 먼저 조회하므로 제목 변경/삭제 이후에도 무심코 다시 생성하지 않는다. 기본은 읽기 전용이며 자격증명·브라우저 저장소·요청 헤더는 결과에 저장하지 않는다.
- [생성 결과](assets/TASK-FE-040/registered-example-results.json), [읽기 전용 재검증](assets/TASK-FE-040/registered-example-readonly-results.json), [공개 지도](assets/TASK-FE-040/registered-example-public.png), [상세 화면](assets/TASK-FE-040/registered-example-detail.png).
- 직접 이미지 대조: 공개 지도에 출발 요원·도착 스킬·한 번 꺾이는 선이 보이며 목록과 상세의 저장 좌표는 같다. 목록은 공격 방향으로 회전하고 상세는 원본 지도 방향이다. 겹침·깨진 이미지·가로 넘침·JS 실행 예외가 없다. 이번 캡처는 2장, 약511KiB만 추가했다.
- [Docker 감사](assets/TASK-FE-040/container-audit.json): 현재 프론트 빌드 범위 밖에 `docs/`가 있고 백엔드는 Docker 전용 ignore로 제외하므로 QA 스크린샷은 현재 두 이미지에 포함되지 않는다. 테스트 CJS 12개 약126KiB는 다음 프론트 개발 이미지에 포함될 수 있다. 프론트 운영용 Dockerfile은 현재 없으므로 향후 별도 빌드 설정은 다시 확인해야 한다. Git 저장소 용량에는 캡처37장 약7.47MiB가 반영된다.
- 추가 변경 파일: `frontend/src/features/admin/lineup-registration.test.cjs`, `frontend/src/features/lineup-explorer/model.test.cjs`, 검증 스크립트/JSON/PNG, Task·PROGRESS·Visual QA·CURRENT·HANDOFF. 제품 소스·Docker 설정·의존성·백엔드·비밀 환경값은 이 후속 검증에서 변경하지 않았다.
- `git diff --check` 및 두 `.env` Git 제외 확인 PASS. 커밋/푸시/PR 없음.

## 목록·상세 지도 표현 통일 — 두 번째 작업 단위 (2026-10-05)

- 첫 번째 커밋 `c87b263`: 관리자 API 연결 및 등록 검증. 이어서 사용자 승인으로 같은 브랜치의 상세 표시를 보완했다.
- 목록의 `orientLineupPoint`를 상세 경로와 모든 마커에 재사용하고 지도 이미지에도 같은 공수별 회전을 적용했다. 정사각형 캔버스에서 이미지·SVG·마커가 같은 좌표 기준을 사용한다.
- 단일 등록 공략은 저장된 `abilitySlot`의 스킬 아이콘을 표시한다. 원형 아이콘 중심이 정확한 좌표가 되도록 번호 배지를 별도로 배치했다. 구형 다중 마커는 기존 번호·미디어 선택을 유지한다.
- 목록과 동일한 기본 초록색3px 실선, hover/키보드 포커스 시 금색4px 강조를 적용했다. 배경 지도·선·아이콘의 방향이 함께 바뀌며 원본 데이터는 변경하지 않는다.
- 변경 소스는 `frontend/src/components/LineupDetail.tsx`, `LineupDetail.module.css` 두 파일이다. 목록·관리자·DB·API는 미변경. 기존 공개 검사 스크립트2개의 상세 예상 경로를 목록과 같은 방향으로 갱신하고 `map-consistency.cjs`를 추가했다.
- `docker exec valorant-frontend-dev-frontend-1`에서 `npx tsc --noEmit`, `npm run lint`, 기존 모델/미디어/API 검사 **81개 PASS**. 환경파일을 제외한 임시 복사본의 `npm run build` PASS, 임시 폴더 제거 완료. 컨테이너의 기존 git 미설치 버전조회 안내가 출력되지만 타입/Lint/빌드는 성공했다.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-040/map-consistency.cjs after`: **10개 검증 PASS**. 1440/390px의 공격/수비·중간점0/1/2·가장자리 좌표·목록/상세 경로와 마커 중심·스킬이미지·hover/포커스 선 스타일·구형 다중 마커/자료 선택을 확인했다.
- 실제 등록 자료는 공개 GET으로만 비교했고 변경 없음. 추가 수비/다중 경로 자료는 브라우저 응답 대역을 사용해 DB 쓰기0. 실행 예외·깨진 이미지·가로 넘침0.
- Before1장, After2장만 추가했다. 직접 및 독립 Codex 코드·이미지 검토 PASS. Cursor 별도 검토는 실행하지 않았다. 이번 검사는 이전에 놓친 목록↔상세 일관성을 명시적으로 검증한다.
- 남은 범위: 실제 공략 좌표의 게임 내 정확성은 미검증이고, 구형 자료의 누락된 스킬 슬롯을 임의 추정하지 않는다. 영상/설명 영역과 관리자 원본 방향 입력은 유지한다.

| 비교 | 결과 |
|---|---|
| [수정 전 PC](assets/TASK-FE-040/map-consistency-before-1440-detail.png) → [수정 후 PC](assets/TASK-FE-040/map-consistency-after-1440-detail.png) | 원본 세로 방향/숫자 표시/얇은 선에서 목록과 같은 방향/Q 아이콘/실선으로 통일 |
| [수정 후 모바일](assets/TASK-FE-040/map-consistency-after-390-detail.png) | 아이콘 중심·지도 좌표 유지, 가로 넘침 없음 |
| [자동 검증 결과](assets/TASK-FE-040/map-consistency-after-results.json) | 공수·경로·아이콘·기존 자료 동작 10개 PASS |

## 상세 오류 안내·스킬별 자료 선택 보완 (2026-10-05)

- 제품 변경: LineupDetail.tsx의 조회 실패 처리와 선택한 스킬의 미디어 조회·빈 안내만 변경. 레이아웃/CSS 수정 없음.
- Playwright GET 응답 대역으로 정상·404·500·통신 실패 및 구형 자료를 재현했다. [Before 결과](assets/TASK-FE-040/detail-errors-before-results.json)의 4개 결함 재현 → [After 결과](assets/TASK-FE-040/detail-errors-after-results.json)의 **23개 검사 PASS**.
- PC1440/모바일390에서 실제 문구, 잘못된 링크 제거, 스킬 변경 후 원래 자료 복귀, 예시 fallback, 등록 VIDEO/IMAGE 및 마커 없는 빈 자료를 확인했다. 실행 예외·깨진 이미지·가로 넘침·API 쓰기0. 외부 실제 영상을 내려받거나 DB에 추가 자료를 넣지 않았다.
- 스크립트: [detail-errors.cjs](assets/TASK-FE-040/detail-errors.cjs). `PLAYWRIGHT_MODULE=<bundled playwright> node .../detail-errors.cjs after`로 실행한다. `OUTPUT_DIR` 지정 시 결과를 임시 폴더에 저장할 수 있다. 현재 코드에서 before를 다시 실행하지 않는다.

| 상태 | Before | After | 직접 확인 |
|---|---|---|---|
| PC 서버 오류 | [이전](assets/TASK-FE-040/detail-errors-before-1440-server-error.png) | [수정 후](assets/TASK-FE-040/detail-errors-after-1440-server-error.png) | 자료 없음 대신 서버 실패·재시도 안내 |
| 모바일 서버 오류 | [이전](assets/TASK-FE-040/detail-errors-before-390-server-error.png) | [수정 후](assets/TASK-FE-040/detail-errors-after-390-server-error.png) | 문구 줄바꿈과 복귀 버튼 정상 |
| PC 두 번째 스킬 자료 없음 | [이전](assets/TASK-FE-040/detail-errors-before-1440-missing-second-media.png) | [수정 후](assets/TASK-FE-040/detail-errors-after-1440-missing-second-media.png) | 첫 스킬 원본 링크 제거, 선택한 스킬의 빈 안내 |
| 모바일 두 번째 스킬 자료 없음 | [이전](assets/TASK-FE-040/detail-errors-before-390-missing-second-media.png) | [수정 후](assets/TASK-FE-040/detail-errors-after-390-missing-second-media.png) | 가로 넘침·겹침 없이 빈 안내 표시 |

- 캡처는 변경 영역만 저장해 8장 합계108,295bytes(약106KiB). 직접 및 독립 Codex 코드·이미지 대조 PASS, Cursor 검토는 별도 실행하지 않았다.
- 기존 실제 등록 자료는 별도 읽기 전용 검사로 1440/768/390/320px에서 정상 확인했다. 저장 JSON 변화·추가 DB 쓰기0. 해당 임시 결과는 `/tmp/fe040-detail-review/`에 보관한다.
- QA 초기 선택자 중복 및 합성 마커의 클릭 겹침을 검사 코드에서 정리한 후 최종 통과했다. 아주 가까운 구형 지도 마커의 겹침은 기존 제약이며 이번 오류/자료 선택 수정과 별개다. 자료 전환 검사의 합성 좌표를 분리했고 제품 CSS는 유지했다.
