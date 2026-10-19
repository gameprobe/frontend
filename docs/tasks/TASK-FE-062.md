# TASK-FE-062 — 라인업 이미지·스모크 진영 API 연결

## Scope

사용자 승인으로 최신 frontend dev와 main을 비교하고 dev에서 새 브랜치를 만든다. 라인업 site 입력·표시를 제거하고 위치/에임 이미지 두 장 등록·교체·삭제·공개 표시를 연결한다. 스모크 공격/수비 저장·조회·필터를 백엔드와 맞춘다. main·백엔드 코드·운영 설정·의존성은 변경하지 않는다.

## Baseline

- dev `6e11a51a47d757768a43c73f19eaa658632f30d1`, main `32ee00d884fd763e77195884a3adbffb035d8087`: 파일 트리 동일. main에는 dev 병합 커밋만 추가됨.
- 작업 브랜치 `codex/lineup-images-smoke-side`.
- TASK-FE-061의 지도 원본과 진영별 좌표 회전을 유지한다.

## Allowed changes

- `src/features/admin/model.ts`
- `src/features/admin/model.test.cjs`
- `src/features/admin/admin-lineup-api.ts`
- `src/features/admin/admin-lineup-api.test.cjs`
- `src/features/admin/admin-lineup-store.ts`
- `src/features/admin/guide-store.ts`
- `src/features/admin/public-guides.ts`
- `src/features/admin/AdminEditorPage.tsx`
- `src/features/admin/AdminListPage.tsx`
- `src/features/admin/AdminLineupImages.tsx`
- `src/features/lineups/lineup-api.ts`
- `src/features/lineups/lineup-api.test.cjs`
- `src/features/lineups/LineupMedia.tsx`
- `src/features/lineups/LineupBoardPage.tsx`
- `src/features/lineups/LineupDetailPage.tsx`
- `src/features/lineups/LineupSteps.tsx`
- `src/features/smokes/smoke-api.ts`
- `src/features/smokes/smoke-api.test.cjs`
- `src/features/smokes/smoke-model.ts`
- `src/features/smokes/SmokeGuidePage.tsx`
- `src/features/smokes/SmokeDetailPage.tsx`
- `src/features/smokes/SmokeMapSelectPage.tsx`
- `src/features/admin/admin-smoke-store.ts`
- `src/features/admin/admin-smoke-store.test.cjs`
- `src/features/admin/AdminSmokeEditorPage.tsx`
- `src/features/admin/AdminSmokeListPage.tsx`
- `src/mocks/lineups.ts`
- `src/components/guide-map/GuideDetail.tsx`
- `src/features/lineups/MapSelectPage.tsx`
- `src/features/lineups/AgentSelectPage.tsx`
- `src/features/admin/AdminLayout.tsx`
- `src/mocks/game-info.ts`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/tasks/TASK-FE-062.md`
- `docs/visual-qa/TASK-FE-062.md`
- `.agent-reports/HANDOFF.json`
- `.agent-reports/CURRENT.md`

지원 범위: 공개 라인업이 예시 자료를 쓰고 있어 실제 저장 이미지 노출을 위한 공개 API 연결이 필요했다. 공유 상세 틀의 선택적 media 영역과 예시 타입 호환, 일반 화면의 가짜 개수 제거를 포함했다. `src/mocks/game-info.ts`는 호환 검토용 범위를 부여했으나 실제 수정하지 않았다.

## Verification commands

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

## Result

Status: IMPLEMENTED
Human Decision Required: NO

### 구현 결과

- 최신 `origin/dev` 6e11a51과 `origin/main` 32ee00d의 파일 내용이 같음을 확인했다. dev는 이미 최신이었으며 `codex/lineup-images-smoke-side` 브랜치를 분기했다.
- 라인업 관리자 모델·입력·쓰기 payload와 공개 필터/표시에서 site를 제거했다. 예시 타입의 선택적 site는 기존 게임 정보 예시 호환에만 남는다.
- 위치(position)·에임(aim) 이미지 각 1장, 총 2장을 선택·미리보기·등록·교체·삭제한다. JPG/PNG/WebP, 한 장당 10,000,000바이트를 사전 검사하며 서버 검증도 그대로 사용한다.
- 메타데이터 저장 후 이미지 변경을 적용한다. 일부 이미지 실패 시 저장한 ID와 실패 파일을 유지하고 성공 슬롯만 비워 재시도해도 공략을 중복 생성하지 않는다. 이미지 삭제/교체는 별도 백엔드 API가 처리한다.
- 관리자 사진은 토큰 헤더로 가져온 Blob URL로 표시하며 URL에 토큰을 넣지 않는다. 선택 파일/Blob URL 정리, 재인증, 미저장 이동 확인 및 하단 저장 버튼을 적용했다.
- 일반 라인업 목록·상세를 실제 공개 API에 연결했다. 전체 페이지 조회, 로딩/오류/재시도/빈 결과/없는 자료를 처리하고 오류를 예시 데이터로 바꾸지 않는다. 예시 모드는 별도 유지한다.
- 상세에서 영상 ↔ 서는 위치 ↔ 에임 위치를 전환한다. 영상은 다른 탭을 고르면 제거된다. 공개 이미지 조회에는 관리자 인증정보가 없다. 일반 선택 화면의 가짜 등록 개수/평가 표시도 제거했다.
- 스모크 공격/수비를 관리자 등록·편집·목록 필터·공개 조회·상세에 연결했다. 저장 진영과 지도 방향은 독립적이다. 기존 side:null은 미지정으로 표시하고 선택 전 저장을 막는다.
- 기존 지도 방향·정규화 좌표 변환을 유지했다. 이미지 필드가 없는 이전 응답은 빈 이미지 슬롯으로 처리한다.

### 파일별 역할

| 파일 | 역할 |
| --- | --- |
| `src/features/admin/model.ts`, `model.test.cjs` | site 없는 입력 모델과 위치/에임 이미지 두 슬롯, 기본값·복제 검증 |
| `src/features/admin/admin-lineup-api.ts`, `admin-lineup-api.test.cjs` | 쓰기 계약, raw binary 이미지 업로드, 인증 조회·삭제·사용량, 파일 검사·이전 응답 호환 및 회귀 테스트 |
| `src/features/admin/admin-lineup-store.ts` | 이미지 슬롯별 캐시 갱신, 세션 변경 시 오래된 응답 차단 |
| `src/features/admin/AdminEditorPage.tsx`, `AdminLineupImages.tsx` | 사이트 제거, 파일 선택·미리보기·교체·삭제 예약, 부분 실패 재시도·미저장 이동 보호 |
| `src/features/admin/AdminLayout.tsx`, `public-guides.ts` | 실제 공개 라인업 안내, 예시 데이터 변환 호환 |
| `src/features/lineups/lineup-api.ts`, `lineup-api.test.cjs` | 실제 공개 목록·상세 조회와 좌표 변환, 안전한 이미지 경로 및 응답 검증 |
| `src/features/lineups/LineupBoardPage.tsx`, `LineupDetailPage.tsx` | 실제 자료 표시, 사이트 필터 제거, 오류/빈 결과 처리 |
| `src/features/lineups/LineupMedia.tsx`, `src/components/guide-map/GuideDetail.tsx` | 기존 상세 틀에 영상·위치·에임 자료 선택 영역 연결 |
| `src/features/lineups/MapSelectPage.tsx`, `AgentSelectPage.tsx`, `src/mocks/lineups.ts` | 일반 화면의 예시 개수 제거와 예시 타입 호환 |
| `src/features/smokes/smoke-model.ts`, `smoke-api.ts`, `smoke-api.test.cjs` | 필수 진영 쓰기·공개 진영 필터와 이전 null 응답 표현 |
| `src/features/admin/AdminSmokeEditorPage.tsx`, `AdminSmokeListPage.tsx`, `admin-smoke-store.test.cjs` | 스모크 진영 선택·목록 필터 및 저장소 회귀 검증 |
| `src/features/smokes/SmokeGuidePage.tsx`, `SmokeDetailPage.tsx`, `SmokeMapSelectPage.tsx` | 공개 진영별 조회, 맵/상세 이동 시 선택 유지, 지도 방향과 저장 진영 분리 |
| `docs/tasks/TASK-FE-062.md`, `docs/visual-qa/TASK-FE-062.md`, `docs/PLAN.md`, `docs/PROGRESS.md` | 변경 범위·검증·시각 비교·진행 상태 기록 |
| `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md` | 로컬 작업 인계 및 실제 완료 상태(Git 제외) |

### 실제 변경 파일 전체

- `.agent-reports/CURRENT.md` (Git 제외)
- `.agent-reports/HANDOFF.json` (Git 제외)
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/tasks/TASK-FE-062.md`
- `docs/visual-qa/TASK-FE-062.md`
- `src/components/guide-map/GuideDetail.tsx`
- `src/features/admin/AdminEditorPage.tsx`
- `src/features/admin/AdminLayout.tsx`
- `src/features/admin/AdminLineupImages.tsx`
- `src/features/admin/AdminSmokeEditorPage.tsx`
- `src/features/admin/AdminSmokeListPage.tsx`
- `src/features/admin/admin-lineup-api.test.cjs`
- `src/features/admin/admin-lineup-api.ts`
- `src/features/admin/admin-lineup-store.ts`
- `src/features/admin/admin-smoke-store.test.cjs`
- `src/features/admin/model.test.cjs`
- `src/features/admin/model.ts`
- `src/features/admin/public-guides.ts`
- `src/features/lineups/AgentSelectPage.tsx`
- `src/features/lineups/LineupBoardPage.tsx`
- `src/features/lineups/LineupDetailPage.tsx`
- `src/features/lineups/LineupMedia.tsx`
- `src/features/lineups/MapSelectPage.tsx`
- `src/features/lineups/lineup-api.test.cjs`
- `src/features/lineups/lineup-api.ts`
- `src/features/smokes/SmokeDetailPage.tsx`
- `src/features/smokes/SmokeGuidePage.tsx`
- `src/features/smokes/SmokeMapSelectPage.tsx`
- `src/features/smokes/smoke-api.test.cjs`
- `src/features/smokes/smoke-api.ts`
- `src/features/smokes/smoke-model.ts`
- `src/mocks/lineups.ts`

### 검증 중 보완

- 기존 이미지 없는 응답에서 관리자 매핑 오류 발견: 빈 슬롯 기본값과 회귀 테스트를 추가하여 전체 85개 통과.
- 독립 검토에서 선택 파일의 뒤로가기 보호와 폐기 Blob URL 유지 문제를 찾아 `useBlocker` 및 새 조회 시 미리보기 초기화로 해결, 실제 UI 재검증.
- 실제 진영에 자료가 없을 때 스킬 선택을 요구하던 안내를 진영별 빈 결과 문구로 보완.
- 브라우저 스크립트의 중간점 버튼/파일 입력 선택자와 외부 유튜브 요청 차단 범위를 수정했다. 최종 제품 검증은 PASS.

### 남은 위험·주의 사항

- 이번 결과는 로컬 개발 완료다. 새 이미지/site 제거/smoke side API가 운영 백엔드에 배포된 뒤 운영 프론트를 연결해야 한다. 프론트 main은 동료만 반영하며 이번 작업에서 변경하지 않았다.
- 영상 주소는 현재 백엔드 계약대로 필수이고 이미지 2개 슬롯은 선택이다. 관리자 예시 모드에서는 서버 이미지 업로드를 지원하지 않는다.
- 5 GB 총량·동시 업로드·실제 바이트 제한은 기존 백엔드 구현이 계속 담당한다. 이번 프론트 검증의 507/401은 브라우저에서 주입한 실패 응답으로 복구 동작을 확인한 것이며 실제 5 GB 채우기나 운영 장애 검증은 아니다.
- 실제 CRUD 검증은 로컬 MongoDB/로컬 uploads에만 수행했다. 운영 VM/Atlas/Vercel에는 쓰지 않았다. PNG는 기능 검증용이며 실제 게임 공략 자료가 아니다.
- 이미지 저장 후에는 백엔드 조회를 그대로 사용하며 이미지 자체나 비밀 토큰을 Git/프론트 번들에 추가하지 않는다. 임시 QA 경로는 이 컴퓨터 전용이며 이후 삭제될 수 있다.
- 기존 번들 크기 안내는 남아 있다. 번들 분할·예시 전면 제거·다른 기능 리팩토링은 이번 범위가 아니다.

## 로컬 페이지 재검증 (2026-10-19)

- 사용자 요청에 따라 로컬 브라우저에서 `/lineups`, `/lineups/ascent/sova`, `/admin`을 직접 열고 화면·콘솔을 확인했다. 저장 자료가 없는 경우 빈 상태 안내를 정상 표시했다.
- `node /private/tmp/gameprobe-fe062-recheck-lineup/lineup-qa.cjs`: 실제 로컬 관리자 인증, 라인업 등록·수정·삭제, 이미지 두 장 업로드·교체·삭제, 새로고침, 공개 목록/상세/미디어 탭, 미저장 이동 확인 등 **12개 검증 묶음 PASS**. 507/401 실패 응답을 주입한 복구 검증도 통과했다.
- `node /private/tmp/gameprobe-fe062-recheck-smoke/smoke-qa.cjs`: 실제 로컬 스모크 등록·수정·삭제, 공격/수비 필터, 지도 방향/좌표 유지, 공개 상세·복귀 등 **15개 검증 묶음 PASS**.
- 브라우저 실행 오류·애플리케이션 콘솔 오류·예상하지 못한 API/네트워크 실패는 수집 결과 0건이다. 의도적으로 주입한 오류와 삭제/비활성 자료의 404는 제외했다. 스모크 화면 전환/개발 모드에서 취소된 요청 8건은 `ERR_ABORTED`로 따로 기록했다.
- 직접 연 브라우저 콘솔에는 React Router의 `v7_startTransition` 차기 버전 동작 안내 경고가 있다. 현재 기능 실패는 재현되지 않았으며 업그레이드 설정 변경은 하지 않았다.
- PC 1440px·모바일 390px 신규 캡처를 검토했다. 확인 화면에서 글자/카드 겹침과 가로 넘침은 발견하지 못했다.
- 자체 테스트 라인업·이미지·스모크는 모두 삭제 완료. 제품 코드, main, 운영 서버는 변경하지 않았다. 이번 변경은 검증 보고 갱신뿐이며 커밋·푸시하지 않았다.
- 새 결과/캡처: `/private/tmp/gameprobe-fe062-recheck-lineup/`, `/private/tmp/gameprobe-fe062-recheck-smoke/`. PNG는 Git에 넣지 않았다.

## dev PR 제출 준비 (2026-10-19)

- 사용자 승인: 작업 브랜치 커밋·푸시 후 `dev` 대상 PR 생성. 병합은 사용자가 수행한다.
- 원격 dev 재확인: `6e11a51`, 작업 기준과 동일. 별도 통합 변경 없이 검증 완료 소스를 제출한다.
- 변경 31개 파일이 Allowed changes에 포함된다. 환경파일·새 이미지·비밀키 파일과 운영 의존성 변경은 없다.
- 기존 타입/Lint/빌드·85개 회귀 검사와 직전 라인업 12개/스모크 15개 로컬 UI 재검증 결과를 확인했다. 제품 소스는 재검증 후 변경하지 않았다.
- `main`, 백엔드, 운영 설정은 변경하지 않는다.
