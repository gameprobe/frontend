# TASK-FE-062 Visual QA

- Date: 2026-10-19
- Verdict: PASS (구현자 직접 및 독립 에이전트 시각 검토)
- 브라우저: 로컬 Chromium/Playwright, PC 1440×1000 / 모바일 390×844.
- 참조: 기존 dev 화면의 색상·카드·지도 구성. 새로운 외부 디자인 자산은 사용하지 않았다.
- PNG/테스트 파일은 **Git·Docker 이미지에 추가하지 않았다**. 아래 링크는 이 컴퓨터의 임시 경로다.

## Before / After

| 화면 | Before | After |
| --- | --- | --- |
| 관리자 라인업 PC | [Before](/private/tmp/gameprobe-fe062/before-admin-lineup.png) | [After](/private/tmp/gameprobe-fe062/after-admin-lineup-desktop.png) |
| 관리자 라인업 모바일 | [Before](/private/tmp/gameprobe-fe062/before-admin-lineup-mobile.png) | [After](/private/tmp/gameprobe-fe062/after-admin-lineup-mobile.png) |
| 공개 라인업 PC | [Before](/private/tmp/gameprobe-fe062/before-public-lineup.png) | [After](/private/tmp/gameprobe-fe062/after-public-board-desktop.png) |
| 공개 라인업 모바일 | [Before](/private/tmp/gameprobe-fe062/before-public-lineup-mobile.png) | [After](/private/tmp/gameprobe-fe062/after-public-board-mobile.png) |
| 공개 라인업 상세 | [Before](/private/tmp/gameprobe-fe062/before-public-detail.png) | [위치 사진](/private/tmp/gameprobe-fe062/after-public-detail-position.png), [모바일 에임 사진](/private/tmp/gameprobe-fe062/after-public-detail-mobile.png) |
| 관리자 스모크 | [Before](/private/tmp/gameprobe-fe062/before-admin-smoke.png) | [PC](/private/tmp/gameprobe-fe062/after-admin-smoke-desktop.png), [모바일](/private/tmp/gameprobe-fe062/after-admin-smoke-mobile.png) |
| 공개 스모크 | [Before](/private/tmp/gameprobe-fe062/before-public-smoke.png) | [PC](/private/tmp/gameprobe-fe062/after-public-smoke-desktop.png), [모바일](/private/tmp/gameprobe-fe062/after-public-smoke-mobile.png), [상세](/private/tmp/gameprobe-fe062/after-smoke-detail-mobile.png) |

## 확인 결과

- 남색 배경, 파란 활성 강조, 카드 테두리/모서리, 글꼴 체계를 유지했다.
- 사이트 입력·필터를 제거하고 위치/에임 입력 영역을 구분했다. 선택·삭제·변경 취소·저장 버튼이 모바일 카드 안에 들어간다.
- 이미지 입력으로 길어진 폼은 지도 카드가 끝까지 늘어나지 않도록 하고 하단에도 저장 버튼을 제공했다.
- 상세 미디어 탭은 기존 콘텐츠 열에 맞고 사진은 비율을 유지한다. 모바일에서 탭→사진→지도→설명 순서로 정렬되며 가로 넘침/글자 겹침이 없다.
- 공개 보드의 지도 방향과 3열 구성은 유지된다. 이전 예시 수치를 실제 저장 자료로 교체했다.
- 스모크 저장 진영과 지도 표시 방향을 별도 라벨로 구별한다. 진영 변경·방향 전환에 저장 좌표 변화가 없다.
- Before와 After의 자료는 달라 픽셀 좌표 동일성을 사진만으로 판단하지 않았다. 별도 좌표 회귀 테스트와 실제 API 값 비교로 확인했다.

## 동작 검증

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS. 단일 JS chunk 500 kB 초과 안내가 남아 있으며 빌드는 성공했다.
- `node --test src/lib/backend-client.test.cjs src/features/admin/*.test.cjs src/features/smokes/*.test.cjs src/features/lineups/*.test.cjs src/components/guide-map/geometry.test.cjs`: 85/85 PASS, skip 0.
- `node /private/tmp/gameprobe-fe062/lineup-qa.cjs`: 실제 로컬 Docker FastAPI + MongoDB 연동 12개 검증 묶음 PASS, 브라우저 실행 오류 0, 자체 테스트 자료 삭제 완료.
- `node /private/tmp/gameprobe-fe062/lineup-edge-qa.cjs`: 공개 오류/빈 결과/미디어 재시도/미저장 로그아웃 4개 검증 묶음 PASS. 공개 응답은 브라우저 fixture, 관리자 조회·인증은 로컬 실제 서버 사용.
- `node /private/tmp/gameprobe-fe062/smoke-qa.cjs`: 실제 관리자/공개 스모크 흐름 14개 검증 묶음 PASS, 오류 0, 자체 테스트 자료 삭제 완료.
- 기존 진영 null 응답의 브라우저 fixture 검증 2개 PASS (`smoke-legacy-results.json`).
- Playwright Before/After 1440px·390px 캡처 및 직접/독립 시각 검토 PASS. 새 캡처·테스트 PNG·임시 스크립트는 `/private/tmp/gameprobe-fe062`에만 보관.
- `git diff --check`: PASS. dev/main 파일 트리 동일 확인, main 변경·커밋·푸시·PR·운영 배포 없음.

결과 JSON: `lineup-results.json`, `lineup-edge-results.json`, `smoke-results.json`, `smoke-legacy-results.json`은 모두 `/private/tmp/gameprobe-fe062/`에 있다. 실제 라인업/스모크 테스트 자료와 이미지 파일은 API 삭제로 정리 완료했다. 507/401 및 공개 오류는 브라우저 네트워크 fixture로 안전하게 재현했다.

## 로컬 페이지 재검증 (2026-10-19)

- 사용자 요청에 따라 로컬 브라우저에서 `/lineups`, `/lineups/ascent/sova`, `/admin`을 직접 열고 화면·콘솔을 확인했다. 저장 자료가 없는 경우 빈 상태 안내를 정상 표시했다.
- `node /private/tmp/gameprobe-fe062-recheck-lineup/lineup-qa.cjs`: 실제 로컬 관리자 인증, 라인업 등록·수정·삭제, 이미지 두 장 업로드·교체·삭제, 새로고침, 공개 목록/상세/미디어 탭, 미저장 이동 확인 등 **12개 검증 묶음 PASS**. 507/401 실패 응답을 주입한 복구 검증도 통과했다.
- `node /private/tmp/gameprobe-fe062-recheck-smoke/smoke-qa.cjs`: 실제 로컬 스모크 등록·수정·삭제, 공격/수비 필터, 지도 방향/좌표 유지, 공개 상세·복귀 등 **15개 검증 묶음 PASS**.
- 브라우저 실행 오류·애플리케이션 콘솔 오류·예상하지 못한 API/네트워크 실패는 수집 결과 0건이다. 의도적으로 주입한 오류와 삭제/비활성 자료의 404는 제외했다. 스모크 화면 전환/개발 모드에서 취소된 요청 8건은 `ERR_ABORTED`로 따로 기록했다.
- 직접 연 브라우저 콘솔에는 React Router의 `v7_startTransition` 차기 버전 동작 안내 경고가 있다. 현재 기능 실패는 재현되지 않았으며 업그레이드 설정 변경은 하지 않았다.
- PC 1440px·모바일 390px 신규 캡처를 검토했다. 확인 화면에서 글자/카드 겹침과 가로 넘침은 발견하지 못했다.
- 자체 테스트 라인업·이미지·스모크는 모두 삭제 완료. 제품 코드, main, 운영 서버는 변경하지 않았다. 이번 변경은 검증 보고 갱신뿐이며 커밋·푸시하지 않았다.
- 새 결과/캡처: `/private/tmp/gameprobe-fe062-recheck-lineup/`, `/private/tmp/gameprobe-fe062-recheck-smoke/`. PNG는 Git에 넣지 않았다.
