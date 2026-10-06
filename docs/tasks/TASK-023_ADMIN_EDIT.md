# TASK-023_ADMIN_EDIT: 기존 라인업 관리자 수정

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

DONE

## Goal

관리자가 목록에서 기존 라인업을 선택해 스킬·요원·경로·메타데이터를 다시 편집하고
기존 관리자 PUT API로 저장할 수 있게 한다.

## Scope

- `/admin/lineups/[id]/edit` 수정 라우트
- 관리자 목록의 수정 링크
- 기존 라인업 상세 데이터를 편집기 초기 상태로 변환
- 기존 `PUT /api/admin/lineups/{id}` 연결
- 인증·로딩·조회 오류·저장 피드백 처리

## Allowed changes

- `frontend/src/app/admin/lineups/[id]/edit/page.tsx`
- `frontend/src/components/AdminLineupList.tsx`
- `frontend/src/components/LineupEditor.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `screenshots/admin-edit-before.png`
- `screenshots/admin-edit-after-desktop.png`
- `screenshots/admin-edit-after-mobile.png`
- `docs/visual-qa/TASK-023_ADMIN_EDIT.md`
- `docs/tasks/TASK-023_ADMIN_EDIT.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`

## Forbidden changes

- 백엔드 스키마/API 변경
- 인증 방식 변경
- 사용자 공개 화면 변경
- 즐겨찾기·댓글·신고 기능
- 신규 npm 패키지 추가

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Result

### 구현 내용

- 관리자 목록 카드에 기존 라인업 수정 링크를 추가했습니다.
- `/admin/lineups/[id]/edit`에서 관리자 토큰으로 기존 라인업을 조회하고 편집기를 초기화합니다.
- 스킬·요원·경로·맵·진영·난이도·YouTube URL·Sova 설정을 기존 값으로 복원합니다.
- 선택한 스킬 마커의 스킬 종류와 YouTube URL을 수정할 수 있게 했습니다.
- 기존 `PUT /api/admin/lineups/{id}`로 저장하고 기존 상태를 유지합니다.
- 인증 게이트, 조회 중, 조회 실패, 모바일 반응형 상태를 처리했습니다.

### 변경 파일

- `frontend/src/app/admin/lineups/[id]/edit/page.tsx`
- `frontend/src/components/AdminLineupList.tsx`
- `frontend/src/components/LineupEditor.tsx`
- `frontend/src/lib/lineup-api.ts`
- `screenshots/admin-edit-before.png`
- `screenshots/admin-edit-after-desktop.png`
- `screenshots/admin-edit-after-mobile.png`
- `docs/visual-qa/TASK-023_ADMIN_EDIT.md`

### 검증

- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS (`/admin/lineups/[id]/edit` 포함)
- 브라우저: 인증 게이트 및 1440px/390px 수정 라우트 확인 — PASS

### 남은 주의 사항

- 당시 DB가 실행되지 않은 환경이라 실제 기존 데이터 조회·PUT 저장까지의 통합 시나리오는 별도 환경에서 확인해야 합니다.
