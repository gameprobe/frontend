# TASK-022_ADMIN_REVIEW: 관리자 라인업 목록 및 공개 상태 관리

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

DONE

## Goal

관리자가 저장된 라인업을 한 화면에서 확인하고 `DRAFT → REVIEW → PUBLISHED`
또는 `REJECTED` 상태로 전환할 수 있게 한다. 공개 사용자에게는 계속
`PUBLISHED` 데이터만 노출한다.

## Scope

- `/admin/lineups` 관리자 목록 화면
- 상태별 필터와 라인업 요약 카드
- 검수 대기/공개/거부/초안 상태 전환 버튼
- 기존 `GET /api/admin/lineups` 및 `PATCH /api/admin/lineups/{id}/status` 연결
- 관리자 토큰 세션 재사용
- 빈 목록·API 오류·상태 변경 피드백 처리

## Allowed changes

- `frontend/src/app/admin/lineups/page.tsx`
- `frontend/src/components/AdminLineupList.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `screenshots/admin-review-before.png`
- `screenshots/admin-review-after-desktop.png`
- `screenshots/admin-review-after-mobile.png`
- `docs/visual-qa/TASK-022_ADMIN_REVIEW.md`
- `docs/tasks/TASK-022_ADMIN_REVIEW.md`
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

- `/admin/lineups` 관리자 목록 화면을 추가했습니다.
- `DRAFT`, `REVIEW`, `PUBLISHED`, `REJECTED` 상태 필터와 상태별 개수 표시를 추가했습니다.
- 기존 관리자 토큰으로 `GET /api/admin/lineups`를 호출하고, 상태 전환 시 `PATCH /api/admin/lineups/{id}/status`를 연결했습니다.
- 검수 대기, 공개, 반려, 초안 복귀 흐름과 성공/실패 피드백을 구현했습니다.
- 인증 토큰이 없을 때 관리자 로그인 화면으로 안내하고, 빈 목록·API 오류 상태를 처리했습니다.
- 데스크톱 및 390px 모바일 화면을 확인했습니다.

### 변경 파일

- `frontend/src/app/admin/lineups/page.tsx`
- `frontend/src/components/AdminLineupList.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `screenshots/admin-review-before.png`
- `screenshots/admin-review-after-desktop.png`
- `screenshots/admin-review-after-mobile.png`
- `docs/visual-qa/TASK-022_ADMIN_REVIEW.md`

### 검증

- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS
- 브라우저: 인증 게이트 및 1440px/390px 반응형 레이아웃 확인 — PASS

### 남은 주의 사항

- 당시 DB가 실행되지 않은 환경이라 실제 DB 목록 조회와 상태 변경까지의 통합 시나리오는 별도 환경에서 확인해야 합니다.
- 운영 환경에서는 `ADMIN_API_TOKEN`과 `NEXT_PUBLIC_BACKEND_URL`을 안전하게 주입해야 합니다.
