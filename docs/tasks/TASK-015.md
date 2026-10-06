# TASK-015: Riot 계정 연결 예정 흐름 (UI)

## Status

DONE (2026-06-13)

## Goal

`docs/PLAN.md` Phase 2 완료 기준 "RSO 연결 예정 UI (실제 동작 없음)"를 위해,
Frontend에 Riot 계정 연결(RSO) **예정 흐름의 placeholder UI**를 구현한다.
실제 인증/세션/외부 호출은 구현하지 않는다.

이 Task는 다음을 수행한다:

1. "Riot 계정 연결 예정" 안내 UI를 표시하는 화면/섹션을 추가한다(예: 새 라우트
   `frontend/src/app/connect/page.tsx` 또는 기존 페이지 내 섹션 — 배치는 이
   Task에서 결정해 Result에 기록).
2. 연결 버튼/진입점은 "준비 중"(비활성 또는 안내 모달/문구)으로 표시하고,
   실제 RSO 인증으로 연결되지 않음을 명시한다.
3. 향후 실제 연동(Phase 4) 시 이 UI가 어디에 연결될지(TASK-014 어댑터/추후
   RSO)를 주석/문서로 남긴다.

다음은 범위가 아니다:

- 실제 RSO 인증, OAuth, 세션/토큰 처리 (Phase 4)
- Backend 어댑터 구현 (TASK-014)
- 배포 (TASK-011/011H)

## Context

- `docs/SPEC.md` 비기능 요구사항: "Riot Sign On(RSO) 인증 사용 (실제 API
  연동 시)". 즉 Phase 2에서는 **UI 예고만** 하고 실제 동작은 없다.
- `docs/ARCHITECTURE.md` 보안: RSO는 Phase 4.
- **Phase 1(TASK-006~010) DONE.** 라우트/컴포넌트/스타일 패턴을 따른다.
- TASK-014(어댑터 인터페이스)가 먼저 정리되면, 이 UI가 개념적으로 어디에
  연결될지 일관되게 안내할 수 있다.

## Dependencies

- **선행**:
  - TASK-010 (경기 상세) — DONE (Frontend 베이스라인).
  - TASK-014 (API Adapter 인터페이스 설계) — 권장 선행(연결 대상 구조 일관성).
- **후속**: TASK-015H(Riot 신청)에서 심사 자료로 활용 가능. 실제 연동은
  Phase 4.

## Allowed changes

```
frontend/src/app/connect/page.tsx     # 신규(배치 결정 시): RSO 연결 예정 라우트
frontend/src/components/**             # 신규: 연결 예정 안내 컴포넌트
docs/tasks/TASK-015.md                 # Result 갱신 (배치 결정 기록 포함)
```

- 기존 페이지 내 섹션으로 배치하기로 결정하면, 해당 페이지가 TASK-007 홈
  산출물(`page.tsx`, `globals.css`, `HomeSearch.tsx`)이 아닌 경우에만
  수정한다. 홈 산출물은 수정하지 않는다.
- TASK-006 산출물(`types/data/lib`)은 수정하지 않는다.

## Forbidden changes

- 실제 RSO/OAuth/인증/세션/토큰 처리 코드
- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`
- `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`,
  `frontend/src/app/globals.css`, `frontend/src/components/HomeSearch.tsx`
- `backend/**`, `docker/**`, `scripts/**`
- `frontend/package.json`, `frontend/package-lock.json`
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`, 기존 Task 문서

## Acceptance criteria

1. **연결 예정 UI 표시**
   - [x] "Riot 계정 연결 예정" 안내와 진입점을 표시한다.
   - [x] 진입점은 비활성 또는 "준비 중" 안내로 동작하며, 실제 인증으로
     이어지지 않는다(클릭 시 외부 호출 없음).
2. **배치 결정 기록**
   - [x] UI 배치(신규 라우트 vs 기존 페이지 섹션)와 경로/컴포넌트를 Result에
     기록한다.
3. **빌드 및 정적 검사**
   - [x] `cd frontend && npx tsc --noEmit` 성공.
   - [x] `cd frontend && npm run lint` 성공.
   - [x] `cd frontend && npm run build` 성공.
4. **범위 확인**
   - [x] `git status --porcelain -- frontend/src/types frontend/src/data
     frontend/src/lib` 출력이 비어 있다.
   - [x] `git status --porcelain -- frontend/src/app/page.tsx
     frontend/src/app/layout.tsx frontend/src/app/globals.css
     frontend/src/components/HomeSearch.tsx` 출력이 비어 있다.
   - [x] `git status --porcelain -- backend docker scripts
     frontend/package.json frontend/package-lock.json` 출력이 비어 있다.

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
cd .. && git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib
git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx
git status --porcelain -- backend docker scripts frontend/package.json frontend/package-lock.json
git status --porcelain -- frontend/src/app/connect frontend/src/components
```

## Stop conditions

1. 사람의 시작 승인이 없는 경우 — 시작 중단.
2. 실제 RSO 인증/OAuth 구현이 요구되는 경우 — Phase 4 범위이므로 BLOCKED로
   보고한다.
3. 새 npm 패키지 설치가 필요한 경우.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

DONE (2026-06-13)

### Changed files

- `frontend/src/app/connect/page.tsx`
  - 신규 `/connect` 라우트를 생성했다.
  - 홈 산출물(`page.tsx`, `globals.css`, `HomeSearch.tsx`)을 수정하지 않기 위해
    기존 페이지 섹션이 아닌 독립 라우트 배치를 선택했다.
- `frontend/src/components/RiotConnectNotice.tsx`
  - "Riot 계정 연결 예정" 안내 UI와 비활성 진입점 버튼을 렌더링한다.
  - 버튼은 `disabled` 상태이며 외부 인증 페이지로 이동하지 않는다.
  - Phase 4 실제 연동 시 TASK-014의 Backend Riot API Adapter 구조와 RSO 인증
    흐름에 연결될 예정임을 화면 문구로 남겼다.
- `docs/tasks/TASK-015.md`
  - Status, Acceptance criteria, Result를 실제 결과에 맞게 갱신했다.

### Verification results

- `cd frontend && npx tsc --noEmit` — 성공.
- `cd frontend && npm run lint` — 성공.
- `cd frontend && npm run build` — 성공. Build output에서 `/connect` 라우트가
  생성됨을 확인했다.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`
  — 출력 없음.
- `git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx`
  — 출력 없음.
- `git status --porcelain -- backend docker scripts frontend/package.json frontend/package-lock.json`
  — 출력 없음.
- `git status --porcelain -- frontend/src/app/connect frontend/src/components`
  — 허용된 신규 `frontend/src/app/connect/page.tsx`와
  `frontend/src/components/RiotConnectNotice.tsx`만 출력됨.

### Notes

- 실제 RSO/OAuth/인증/세션/토큰 처리 코드는 구현하지 않았다.
- `npx tsc --noEmit` 실행 중 `frontend/tsconfig.tsbuildinfo`가 생성되었으나,
  TASK-015 허용 범위 밖 검증 산출물이므로 최종 작업 트리에서 제거했다.
