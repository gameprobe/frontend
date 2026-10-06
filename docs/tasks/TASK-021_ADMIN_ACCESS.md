# TASK-021_ADMIN_ACCESS: 관리자 인증·검수·공개 상태

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

READY

## Goal

관리자와 일반 사용자 흐름을 실제 권한 경계로 분리한다. 공개 사용자는
`PUBLISHED` 라인업만 조회하고, 관리자만 인증 후 초안 저장과 검수 상태 변경을
수행할 수 있어야 한다.

## Scope

- 백엔드 설정 기반 관리자 토큰 인증
- `POST /api/admin/session` 관리자 토큰 확인 API
- 관리자 CRUD/status API의 공통 인증 적용
- `/admin` 로그인 화면
- 관리자 편집기 접근 보호 및 세션 토큰 전달
- 초안/검수/공개/거부 상태 변경 UI 경계

## Security boundary

- 관리자 비밀값은 `ADMIN_API_TOKEN` 환경 변수로만 주입한다.
- 클라이언트는 로그인 후 탭 세션에 토큰을 보관하며 공개 페이지에는 전달하지 않는다.
- 관리자 API는 `X-Admin-Token`을 요구한다.
- 토큰이 비어 있으면 관리자 API를 허용하지 않는다.
- 이번 Task는 기존 인증 제공자가 없는 프로젝트의 임시 운영 경계이며,
  사용자 계정/RSO/JWT 도입은 별도 승인 Task로 남긴다.

## Allowed changes

- `backend/src/main/kotlin/com/valorant/platform/lineup/AdminAuthorization.kt`
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupController.kt`
- `backend/src/main/resources/application.yml`
- `backend/src/test/kotlin/com/valorant/platform/lineup/**`
- `frontend/src/app/admin/page.tsx`
- `frontend/src/components/AdminLogin.tsx`
- `frontend/src/components/LineupEditor.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `screenshots/admin-access-before.png`
- `screenshots/admin-access-after-desktop.png`
- `screenshots/admin-access-after-mobile.png`
- `docs/visual-qa/TASK-021_ADMIN_ACCESS.md`
- `docs/tasks/TASK-021_ADMIN_ACCESS.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`

## Forbidden changes

- Riot RSO 또는 JWT 의존성 추가
- 일반 사용자 로그인/회원가입 구현
- DB 스키마 변경
- 공개 라인업 조회에 관리자 토큰 요구
- 신규 npm 패키지 추가

## Verification commands

```bash
cd backend && ./gradlew test
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Result

- Status: IMPLEMENTED
- 변경된 파일: 관리자 토큰 인증 컴포넌트/설정/세션 API, `/admin` 로그인 화면, 편집기 접근 보호와 토큰 전달, 스타일 및 QA 산출물.
- 검증: `cd backend && ./gradlew test`, `cd frontend && npx tsc --noEmit`, `npm run lint`, `npm run build` 모두 PASS.
- 브라우저 검증: 인증 전 `/admin/lineups/new` 차단, 빈 토큰 제출 오류, `/admin` 화면 반응형 확인 PASS.
- 남은 위험: 토큰 인증은 계정/RSO/JWT가 없는 현재 프로젝트의 임시 운영 경계이며, 실제 API 저장 통합은 당시 DB 실행 환경에서 추가 확인해야 한다.
