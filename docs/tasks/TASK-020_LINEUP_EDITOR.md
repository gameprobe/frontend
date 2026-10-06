# TASK-020_LINEUP_EDITOR: 관리자 라인업 편집기

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

READY

## Goal

관리자가 맵 위에 여러 스킬 마커를 먼저 배치한 뒤 요원 마커를 배치하고,
경로·난이도·YouTube URL·Sova 전용 설정을 입력해 백엔드 API에 저장할 수 있는
관리자용 라인업 작성 화면을 구현한다.

## Interaction order

1. 맵·공격/수비·요원·난이도·기본 정보를 선택한다.
2. `스킬 배치` 모드에서 맵을 클릭해 스킬 마커를 하나 이상 배치한다.
3. 스킬 마커마다 YouTube URL을 입력한다.
4. 스킬 마커가 하나 이상 있으면 `요원 배치` 모드가 활성화된다.
5. 요원 마커를 하나 이상 배치한다.
6. `경로 그리기` 모드에서 클릭해 이동/투사 경로를 만든다.
7. 미리보기 후 관리자 API로 저장한다.

## Scope

- `/admin/lineups/new` 관리자 작성 페이지
- 다중 스킬·요원 마커 배치/삭제
- 정규화 좌표 기반 경로 그리기/초기화
- 요원 난이도 색상 미리보기
- Sova 차징 단계·튕김 횟수 입력
- YouTube URL 입력 및 저장
- `POST /api/admin/lineups` 호출

## Allowed changes

- `frontend/src/app/admin/lineups/new/page.tsx`
- `frontend/src/components/LineupEditor.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `screenshots/lineup-editor-before.png`
- `screenshots/lineup-editor-after-desktop.png`
- `screenshots/lineup-editor-after-mobile.png`
- `docs/visual-qa/TASK-020_LINEUP_EDITOR.md`
- `docs/tasks/TASK-020_LINEUP_EDITOR.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`

## Forbidden changes

- 실제 로그인/토큰 인증 구현
- 백엔드 스키마·API 변경
- 즐겨찾기·댓글·신고 기능
- 신규 npm 패키지와 외부 이미지 자산 추가

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Result

- Status: IMPLEMENTED
- 변경된 파일: 관리자 신규 라우트, 편집기 컴포넌트, API 저장 함수·payload 타입, 전역 스타일, 시각 QA 보고서 및 스크린샷.
- 검증: `npx tsc --noEmit`, `npm run lint`, `npm run build` 모두 PASS.
- 브라우저 검증: 스킬 0개 시 요원 모드 disabled, 스킬 1개 배치 후 요원 모드 enabled, 요원 1개 배치, 경로 2점 누적 PASS.
- 반응형: 데스크톱 편집 영역 1232px, 390px 모바일 편집 영역 374px 및 body 390px 확인.
- 남은 위험: 실제 로그인/토큰 인증과 당시 DB 연결이 없는 환경에서는 저장 요청이 실패할 수 있으며, 현재 API 계약의 `X-Admin-Role` 임시 경계를 사용한다.
